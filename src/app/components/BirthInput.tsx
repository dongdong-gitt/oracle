'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Clock, MapPin, Sparkles } from 'lucide-react';
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

/** 统一表单输入框样式 */
function FormField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-xs text-white/40 font-medium tracking-wider uppercase pl-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </label>
      {children}
    </div>
  );
}

/** 统一 input class */
const inputClass =
  'w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/25 ' +
  'focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(6,182,212,0.08)] ' +
  'transition-all duration-300 text-sm';

const selectClass =
  inputClass +
  ' appearance-none cursor-pointer bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.3)%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E")] bg-[length:16px] bg-[right_12px_center] bg-no-repeat';

export default function BirthInput({ onSubmit }: BirthInputProps) {
  const { setBirthData, setBaziResult } = useUser();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);

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

  const districts = useMemo((): string[] => {
    if (!formData.province || !formData.city) return [];
    const region = CHINA_REGIONS[formData.province as keyof typeof CHINA_REGIONS];
    if (!region) return [];
    const cityDistricts = (region as Record<string, string[]>)[formData.city];
    return Array.isArray(cityDistricts) ? cityDistricts : [];
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
    setAnalysisProgress(0);

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

    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      setAnalysisText(ANALYSIS_STEPS[i]);
      setAnalysisProgress(((i + 1) / ANALYSIS_STEPS.length) * 100);
      await sleep(500);
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

  /* ── 分析中 Loading ── */
  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md w-full"
        >
          {/* 太极旋转 */}
          <div className="relative w-32 h-32 mx-auto mb-10">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, rgba(6,182,212,0.15), rgba(168,85,247,0.15), rgba(6,182,212,0.15))',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border border-cyan-400/30"
              animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border border-purple-400/20"
              animate={{ scale: [1.02, 0.94, 1.02], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="text-4xl"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                style={{ filter: 'drop-shadow(0 0 12px rgba(6,182,212,0.6))' }}
              >
                ☯
              </motion.div>
            </div>
          </div>

          {/* 步骤文字 */}
          <motion.p
            key={analysisText}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white/80 text-lg tracking-wide mb-6"
          >
            {analysisText || '初始化中...'}
          </motion.p>

          {/* 进度条 */}
          <div className="w-64 mx-auto h-1 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #06b6d4, #a855f7)',
              }}
              animate={{ width: `${analysisProgress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          <p className="text-[10px] tracking-[0.3em] text-white/20 mt-4 font-mono">
            ORACLE ENGINE v2.0
          </p>
        </motion.div>
      </div>
    );
  }

  /* ── 表单 ── */
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        {/* 标题区 */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(168,85,247,0.08))',
              border: '1px solid rgba(6,182,212,0.2)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-medium text-cyan-300 tracking-wider">AI 命理分析</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-white mb-3"
          >
            初始化
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              命盘
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-sm"
          >
            请填写真实出生信息，获得精准命理解读
          </motion.p>
        </div>

        {/* 表单卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl p-8 space-y-5"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          {/* 姓名 */}
          <FormField label="姓名" icon={User}>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入真实姓名"
              autoComplete="off"
              className={inputClass}
            />
          </FormField>

          {/* 性别 */}
          <FormField label="性别" icon={User}>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setFormData({ ...formData, gender: 'male' })}
                className={`py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
                  formData.gender === 'male'
                    ? 'text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                    : 'text-white/40 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:text-white/60'
                }`}
                style={
                  formData.gender === 'male'
                    ? {
                        background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.05))',
                        border: '1px solid rgba(6,182,212,0.35)',
                      }
                    : undefined
                }
              >
                男
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setFormData({ ...formData, gender: 'female' })}
                className={`py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
                  formData.gender === 'female'
                    ? 'text-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.15)]'
                    : 'text-white/40 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:text-white/60'
                }`}
                style={
                  formData.gender === 'female'
                    ? {
                        background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(236,72,153,0.05))',
                        border: '1px solid rgba(236,72,153,0.35)',
                      }
                    : undefined
                }
              >
                女
              </motion.button>
            </div>
          </FormField>

          {/* 日期 + 时间 */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="出生日期" icon={Calendar}>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className={inputClass}
              />
            </FormField>
            <FormField label="出生时间" icon={Clock}>
              <input
                type="time"
                value={formData.birthTime}
                onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                className={inputClass}
              />
            </FormField>
          </div>

          {/* 出生地 */}
          <FormField label="出生地" icon={MapPin}>
            <select
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className={selectClass}
            >
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </FormField>

          {isChina ? (
            <div className="grid grid-cols-3 gap-3">
              <select
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className={selectClass}
              >
                <option value="">省份</option>
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
                className={`${selectClass} disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                <option value="">城市</option>
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
                className={`${selectClass} disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                <option value="">区县</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <input
              type="text"
              value={formData.foreignLocation}
              onChange={(e) => setFormData({ ...formData, foreignLocation: e.target.value })}
              placeholder="城市 / 区域"
              autoComplete="off"
              className={inputClass}
            />
          )}

          {/* 分隔线 */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent my-2" />

          {/* 提交按钮 */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={startAnalysis}
            disabled={!isFormValid()}
            className="relative w-full py-4 rounded-2xl text-white font-semibold text-sm overflow-hidden disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            style={{
              background: isFormValid()
                ? 'linear-gradient(135deg, #06b6d4, #a855f7)'
                : 'rgba(255,255,255,0.05)',
              boxShadow: isFormValid()
                ? '0 8px 30px rgba(6,182,212,0.25), 0 0 60px rgba(168,85,247,0.1)'
                : 'none',
            }}
          >
            {/* 扫光 */}
            {isFormValid() && (
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
              />
            )}
            <span className="relative flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              开始分析
            </span>
          </motion.button>

          {/* 隐私说明 */}
          <p className="text-[11px] text-white/20 text-center leading-relaxed">
            数据将加密存储于您的个人账户，仅用于命盘分析，不会对外分享
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
