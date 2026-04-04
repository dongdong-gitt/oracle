'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Language } from './Dashboard';
import { useUser } from '../context/UserContext';
import { CHINA_REGIONS, COUNTRIES } from '../lib/chinaRegions';

interface BirthInputProps {
  onSubmit: () => void;
  lang: Language;
}

const ANALYSIS_STEPS = [
  '正在连接命理引擎...',
  '计算天干地支...',
  '分析五行结构...',
  '生成大运流年...',
  '构建人生K线...',
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 开发期默认预填；上线前改为 false 即可。
const ENABLE_DEV_PREFILL = true;

export default function BirthInput({ onSubmit }: BirthInputProps) {
  const { setBirthData, setBaziResult } = useUser();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState('');

  const [formData, setFormData] = useState(() => ({
    name: ENABLE_DEV_PREFILL ? '王冬' : '',
    birthDate: ENABLE_DEV_PREFILL ? '1995-12-25' : '',
    birthTime: ENABLE_DEV_PREFILL ? '10:15' : '',
    country: '中国',
    province: ENABLE_DEV_PREFILL ? '安徽省' : '',
    city: ENABLE_DEV_PREFILL ? '安庆市' : '',
    district: ENABLE_DEV_PREFILL ? '迎江区' : '',
    foreignLocation: '',
    gender: 'male' as 'male' | 'female',
  }));

  const isChina = formData.country === '中国';
  const previousCountryRef = useRef(formData.country);

  const provinces = useMemo(() => Object.keys(CHINA_REGIONS), []);
  const cities = useMemo(() => {
    if (!formData.province) return [];
    return Object.keys(CHINA_REGIONS[formData.province as keyof typeof CHINA_REGIONS] || {});
  }, [formData.province]);

  const districts = useMemo(() => {
    if (!formData.province || !formData.city) return [];
    return (
      CHINA_REGIONS[formData.province as keyof typeof CHINA_REGIONS]?.[
        formData.city as keyof (typeof CHINA_REGIONS)[keyof typeof CHINA_REGIONS]
      ] || []
    );
  }, [formData.province, formData.city]);

  useEffect(() => {
    if (previousCountryRef.current === formData.country) return;
    previousCountryRef.current = formData.country;
    setFormData((prev) => ({ ...prev, province: '', city: '', district: '', foreignLocation: '' }));
  }, [formData.country]);

  useEffect(() => {
    if (!isChina || !formData.province) return;
    const validCity = cities.includes(formData.city) ? formData.city : cities[0] || '';
    if (validCity !== formData.city) {
      setFormData((prev) => ({ ...prev, city: validCity, district: '' }));
    }
  }, [formData.province, formData.city, cities, isChina]);

  useEffect(() => {
    if (!isChina || !formData.city) return;
    const validDistrict = districts.includes(formData.district) ? formData.district : districts[0] || '';
    if (validDistrict !== formData.district) {
      setFormData((prev) => ({ ...prev, district: validDistrict }));
    }
  }, [formData.city, formData.district, districts, isChina]);

  const isFormValid = () => {
    if (!formData.name.trim() || !formData.birthDate || !formData.birthTime) return false;
    if (isChina) return Boolean(formData.province && formData.city && formData.district);
    return Boolean(formData.foreignLocation.trim());
  };

  const startAnalysis = async () => {
    if (!isFormValid()) return;

    setIsAnalyzing(true);
    setBaziResult(null);

    const fullLocation = isChina
      ? `${formData.country}${formData.province}${formData.city}${formData.district}`
      : `${formData.country}${formData.foreignLocation}`;

    setBirthData({
      name: formData.name.trim(),
      gender: formData.gender,
      birthDate: formData.birthDate,
      birthTime: formData.birthTime,
      birthPlace: fullLocation,
      country: formData.country,
      province: formData.province,
      city: formData.city,
      district: formData.district,
    });

    for (const step of ANALYSIS_STEPS) {
      setAnalysisText(step);
      await sleep(450);
    }

    const [year, month, day] = formData.birthDate.split('-').map(Number);
    const [hour] = formData.birthTime.split(':').map(Number);

    try {
      const response = await fetch('/api/kline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          year,
          month,
          day,
          hour,
          gender: formData.gender,
          period: '1y',
        }),
      });
      const result = await response.json();

      if (result?.success) {
        setBaziResult({
          bazi: result.data.bazi,
          detail: result.data.detail,
          daYun: result.data.daYun,
          liuNian: result.data.liuNian,
          aiAnalysis: result.data.aiAnalysis,
          kline: result.data.kline,
        });
      }
    } catch (error) {
      console.error('Failed to generate chart:', error);
    } finally {
      onSubmit();
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="relative w-28 h-28 mx-auto mb-8">
            <motion.div
              className="absolute inset-0 rounded-full border border-cyan-400/40"
              animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.9, 0.55] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-[10px] rounded-full border border-cyan-300/30"
              animate={{ scale: [1.02, 0.94, 1.02], opacity: [0.35, 0.75, 0.35] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
            />
            <motion.div
              className="absolute inset-[20px] rounded-full border border-cyan-200/20"
              animate={{ scale: [0.96, 1.04, 0.96], opacity: [0.3, 0.65, 0.3] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.9)]"
                animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.75, 1, 0.75] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
          <p className="text-white/90 text-[28px] leading-none tracking-[0.04em]">
            {analysisText || '生成大运流年...'}
          </p>
          <div className="mt-4 text-[10px] tracking-[0.3em] text-cyan-400/60">LOADING-RINGS-V2</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">初始化命盘</h1>
          <p className="text-white/50">请填写你的真实出生信息</p>
        </div>

        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="姓名"
          autoComplete="off"
          className="w-full px-4 py-3 rounded-xl bg-[#1e2329] border border-[#2b3139] text-white"
        />

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFormData({ ...formData, gender: 'male' })}
            className={`py-3 rounded-xl border ${
              formData.gender === 'male'
                ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF]'
                : 'border-[#2b3139] text-gray-400'
            }`}
          >
            男
          </button>
          <button
            onClick={() => setFormData({ ...formData, gender: 'female' })}
            className={`py-3 rounded-xl border ${
              formData.gender === 'female'
                ? 'border-[#FF2D92] bg-[#FF2D92]/10 text-[#FF2D92]'
                : 'border-[#2b3139] text-gray-400'
            }`}
          >
            女
          </button>
        </div>

        <input
          type="date"
          value={formData.birthDate}
          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-[#1e2329] border border-[#2b3139] text-white"
        />

        <input
          type="time"
          value={formData.birthTime}
          onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-[#1e2329] border border-[#2b3139] text-white"
        />

        <select
          value={formData.country}
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-[#1e2329] border border-[#2b3139] text-white"
        >
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        {isChina ? (
          <>
            <select
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#1e2329] border border-[#2b3139] text-white"
            >
              <option value="">选择省份</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>

            <select
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              disabled={!formData.province}
              className="w-full px-4 py-3 rounded-xl bg-[#1e2329] border border-[#2b3139] text-white disabled:opacity-50"
            >
              <option value="">选择城市</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              disabled={!formData.city}
              className="w-full px-4 py-3 rounded-xl bg-[#1e2329] border border-[#2b3139] text-white disabled:opacity-50"
            >
              <option value="">选择区县</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </>
        ) : (
          <input
            type="text"
            value={formData.foreignLocation}
            onChange={(e) => setFormData({ ...formData, foreignLocation: e.target.value })}
            placeholder="城市 / 区域"
            autoComplete="off"
            className="w-full px-4 py-3 rounded-xl bg-[#1e2329] border border-[#2b3139] text-white"
          />
        )}

        <button
          onClick={startAnalysis}
          disabled={!isFormValid()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#B829F7] text-white font-semibold disabled:opacity-50"
        >
          开始分析
        </button>
      </div>
    </div>
  );
}
