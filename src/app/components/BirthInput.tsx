'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Globe } from 'lucide-react';
import { Language } from './Dashboard';
import { useUser } from '../context/UserContext';
import { CHINA_REGIONS, COUNTRIES } from '../lib/chinaRegions';

interface BirthInputProps {
  onSubmit: () => void;
  lang: Language;
}

// 解析步骤
const ANALYSIS_STEPS = [
  { text: '正在连接宇宙数据库...', duration: 800 },
  { text: '读取生辰八字...', duration: 1000 },
  { text: '计算天干地支...', duration: 1000 },
  { text: '分析五行能量...', duration: 1200 },
  { text: '推演大运流年...', duration: 1500 },
  { text: '生成人生K线...', duration: 1200 },
  { text: '正在解锁命运密码...', duration: 1000 },
];

export default function BirthInput({ onSubmit }: BirthInputProps) {
  const { setBirthData, setBaziResult } = useUser();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisText, setAnalysisText] = useState('');
  const [formData, setFormData] = useState({
    name: '王冬',
    birthDate: '1995-12-25',
    birthTime: '10:15',
    country: '中国',
    province: '安徽省',
    city: '安庆市',
    district: '迎江区',
    foreignLocation: '',
    gender: 'male' as 'male' | 'female'
  });

  const isChina = formData.country === '中国';

  // 级联选择器数据
  const provinces = Object.keys(CHINA_REGIONS);
  const cities = formData.province ? Object.keys(CHINA_REGIONS[formData.province as keyof typeof CHINA_REGIONS]) : [];
  const districts = formData.province && formData.city 
    ? CHINA_REGIONS[formData.province as keyof typeof CHINA_REGIONS][formData.city as keyof typeof CHINA_REGIONS[keyof typeof CHINA_REGIONS]] || []
    : [];

  useEffect(() => {
    setFormData(prev => ({ ...prev, province: '', city: '', district: '', foreignLocation: '' }));
  }, [formData.country]);

  useEffect(() => {
    if (formData.province && isChina) {
      const firstCity = Object.keys(CHINA_REGIONS[formData.province as keyof typeof CHINA_REGIONS])[0];
      setFormData(prev => ({ ...prev, city: firstCity, district: '' }));
    }
  }, [formData.province, isChina]);

  useEffect(() => {
    if (formData.city && formData.province && isChina) {
      const districts = CHINA_REGIONS[formData.province as keyof typeof CHINA_REGIONS][formData.city as keyof typeof CHINA_REGIONS[keyof typeof CHINA_REGIONS]] || [];
      setFormData(prev => ({ ...prev, district: districts[0] || '' }));
    }
  }, [formData.city, formData.province, isChina]);

  // 执行解析动画和真实计算
  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setCurrentStep(0);
    
    const fullLocation = isChina 
      ? `${formData.country}${formData.province}${formData.city}${formData.district}`
      : `${formData.country}${formData.foreignLocation}`;
    
    // 先保存基本信息
    setBirthData({
      name: formData.name,
      gender: formData.gender,
      birthDate: formData.birthDate,
      birthTime: formData.birthTime,
      birthPlace: fullLocation,
      country: formData.country,
      province: formData.province,
      city: formData.city,
      district: formData.district,
    });

    // 解析动画步骤
    let totalDelay = 0;
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      setTimeout(() => {
        setCurrentStep(i);
        setAnalysisText(ANALYSIS_STEPS[i].text);
      }, totalDelay);
      totalDelay += ANALYSIS_STEPS[i].duration;
    }

    // 先清除旧数据，确保使用新计算的分数
    setBaziResult(null);

    // 所有动画完成后跳转（不等待API）
    setTimeout(() => {
      onSubmit();
    }, totalDelay + 500);

    // 后台调用API获取数据（不阻塞跳转）
    const [year, month, day] = formData.birthDate.split('-').map(Number);
    const [hour] = formData.birthTime.split(':').map(Number);
    
    fetch('/api/kline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: formData.name,
        year, 
        month, 
        day, 
        hour, 
        gender: formData.gender,
        period: '1y'
      }),
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        console.log('API返回的分数:', result.data.aiAnalysis?.score);
        setBaziResult({
          bazi: result.data.bazi,
          detail: result.data.detail,
          daYun: result.data.daYun,
          liuNian: result.data.liuNian,
          aiAnalysis: result.data.aiAnalysis,
          kline: result.data.kline,
        });
      }
    })
    .catch(error => {
      console.error('API call failed:', error);
    });
  };

  const isFormValid = () => {
    if (!formData.name || !formData.birthDate) return false;
    if (isChina) {
      return !!(formData.province && formData.city && formData.district);
    } else {
      return !!formData.foreignLocation;
    }
  };

  // 神秘的解析中界面
  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] relative overflow-hidden">
        {/* 背景动画效果 */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                'radial-gradient(circle at 50% 50%, rgba(0,212,255,0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 30% 70%, rgba(184,41,247,0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 70% 30%, rgba(0,212,255,0.1) 0%, transparent 50%)',
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

        {/* 中央内容 */}
        <div className="relative z-10 text-center px-4">
          {/* 神秘的加载动画 */}
          <div className="relative w-48 h-48 mx-auto mb-12">
            {/* 外圈 */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-cyan-500/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
            </motion.div>
            
            {/* 中圈 */}
            <motion.div
              className="absolute inset-4 rounded-full border-2 border-purple-500/20"
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50" />
            </motion.div>
            
            {/* 内圈 */}
            <motion.div
              className="absolute inset-8 rounded-full border-2 border-pink-500/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-pink-400 rounded-full shadow-lg shadow-pink-400/50" />
            </motion.div>

            {/* 中心 */}
            <motion.div
              className="absolute inset-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-8 h-8 text-cyan-400" />
            </motion.div>
          </div>

          {/* 解析文字 */}
          <div className="h-20 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <p className="text-xl font-light text-white/90 tracking-wider">
                  {analysisText}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 进度指示器 */}
          <div className="flex justify-center gap-2 mt-8">
            {ANALYSIS_STEPS.map((_, index) => (
              <motion.div
                key={index}
                className="w-2 h-2 rounded-full"
                animate={{
                  backgroundColor: index <= currentStep ? '#00D4FF' : 'rgba(255,255,255,0.2)',
                  scale: index === currentStep ? [1.2, 1.8, 1.2] : 1,
                  y: index === currentStep ? [0, -4, 0] : 0,
                }}
                transition={{ 
                  duration: 0.6, 
                  repeat: index === currentStep ? Infinity : 0,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* 底部提示 */}
          <motion.p
            className="mt-12 text-sm text-white/30 tracking-widest"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ORACLE · 未来趋势研究院
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* Logo - 深色意向化设计 */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1a3a4a] via-[#2d4a5a] to-[#1e3d4d] mb-4 shadow-lg shadow-cyan-900/30 border border-cyan-500/20">
            <Sparkles className="w-10 h-10 text-[#5BC0DE]" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-white">初始化生命代码</h1>
          <p className="text-gray-400">输入初始数据，获取专属人生行情</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="输入你的代号"
            className="w-full px-4 py-4 rounded-xl bg-[#1e2329] border border-[#2b3139] text-white placeholder:text-gray-500"
          />
          
          <div className="flex gap-3">
            <button
              onClick={() => setFormData({ ...formData, gender: 'male' })}
              className={`flex-1 py-3 rounded-xl border transition-all ${
                formData.gender === 'male'
                  ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF]'
                  : 'border-[#2b3139] text-gray-400'
              }`}
            >
              乾造 (男)
            </button>
            <button
              onClick={() => setFormData({ ...formData, gender: 'female' })}
              className={`flex-1 py-3 rounded-xl border transition-all ${
                formData.gender === 'female'
                  ? 'border-[#FF2D92] bg-[#FF2D92]/10 text-[#FF2D92]'
                  : 'border-[#2b3139] text-gray-400'
              }`}
            >
              坤造 (女)
            </button>
          </div>

          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            className="w-full px-4 py-4 rounded-xl bg-[#1e2329] border border-[#2b3139] text-white"
          />

          <input
            type="time"
            value={formData.birthTime}
            onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
            className="w-full px-4 py-4 rounded-xl bg-[#1e2329] border border-[#2b3139] text-white"
          />

          {/* 地址选择区域 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <MapPin className="w-4 h-4" />
              <span>出生地</span>
            </div>
            
            {/* 国家选择 */}
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#1e2329] border border-[#2b3139] text-white appearance-none cursor-pointer"
              >
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            
            {isChina ? (
              <>
                <select
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full px-4 py-4 rounded-xl bg-[#1e2329] border border-[#2b3139] text-white appearance-none cursor-pointer"
                >
                  <option value="">选择省份/直辖市</option>
                  {provinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
                
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!formData.province}
                  className="w-full px-4 py-4 rounded-xl bg-[#1e2329] border border-[#2b3139] text-white appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">选择城市</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  disabled={!formData.city}
                  className="w-full px-4 py-4 rounded-xl bg-[#1e2329] border border-[#2b3139] text-white appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">选择区/县</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </>
            ) : (
              <input
                type="text"
                value={formData.foreignLocation}
                onChange={(e) => setFormData({ ...formData, foreignLocation: e.target.value })}
                placeholder={`输入${formData.country}的城市/地区`}
                className="w-full px-4 py-4 rounded-xl bg-[#1e2329] border border-[#2b3139] text-white placeholder:text-gray-500"
              />
            )}
          </div>

          <button
            onClick={startAnalysis}
            disabled={!isFormValid()}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#B829F7] text-white font-semibold disabled:opacity-50"
          >
            开始解析
          </button>
        </div>
      </div>
    </div>
  );
}
