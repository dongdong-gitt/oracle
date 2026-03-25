'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, Calendar, Clock, MapPin, User } from 'lucide-react';
import { Language, t } from './Dashboard';

interface BirthInputProps {
  onSubmit: () => void;
  lang: Language;
}

export default function BirthInput({ onSubmit, lang }: BirthInputProps) {
  const [step, setStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    gender: 'male' as 'male' | 'female'
  });

  const steps = [
    { id: 'name', icon: User, label: { zh: '代号', en: 'Code Name' }, placeholder: { zh: '输入你的代号', en: 'Enter your code name' } },
    { id: 'birthDate', icon: Calendar, label: { zh: '出生日期', en: 'Birth Date' }, placeholder: { zh: '选择出生日期', en: 'Select birth date' } },
    { id: 'birthTime', icon: Clock, label: { zh: '出生时间', en: 'Birth Time' }, placeholder: { zh: '选择出生时间', en: 'Select birth time' } },
    { id: 'birthPlace', icon: MapPin, label: { zh: '出生地点', en: 'Birth Place' }, placeholder: { zh: '输入出生地点', en: 'Enter birth place' } },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      startAnalysis();
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      onSubmit();
    }, 3000);
  };

  const currentStep = steps[step];
  const CurrentIcon = currentStep.icon;

  if (isAnalyzing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          {/* Matrix Code Rain Effect */}
          <div className="relative w-64 h-64 mx-auto mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-2 border-amber-500/30 animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full border border-amber-500/20 animate-spin" style={{ animationDuration: '8s' }}></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-amber-500 animate-pulse" />
            </div>
            
            {/* Scrolling code */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 300, opacity: [0, 1, 0] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    delay: i * 0.2,
                    ease: 'linear'
                  }}
                  className="absolute text-xs font-mono text-amber-400"
                  style={{ left: `${i * 10}%` }}
                >
                  {Math.random().toString(36).substring(2, 8)}
                </motion.div>
              ))}
            </div>
          </div>

          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mb-2"
          >
            {lang === 'zh' ? '正在解析生命代码...' : 'Parsing life code...'}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400"
          >
            {lang === 'zh' 
              ? '计算八字命盘 · 分析五行能量 · 生成人生K线'
              : 'Calculating BaZi chart · Analyzing Five Elements · Generating Life K-Line'
            }
          </motion.p>

          {/* Progress bars */}
          <div className="mt-8 space-y-3 max-w-md mx-auto">
            {[
              { label: lang === 'zh' ? '天干地支' : 'Heavenly Stems', progress: 100 },
              { label: lang === 'zh' ? '五行分析' : 'Five Elements', progress: 85 },
              { label: lang === 'zh' ? '大运流年' : 'Luck Cycles', progress: 60 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24">{item.label}</span>
                <div className="flex-1 h-1.5 bg-[#2b3139] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 2, delay: i * 0.3 }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
                <span className="text-xs text-gray-500 w-8">{item.progress}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {lang === 'zh' ? '初始化生命代码' : 'Initialize Life Code'}
          </h1>
          <p className="text-gray-400">
            {lang === 'zh' 
              ? '输入初始数据，获取专属人生行情'
              : 'Enter initial data to get your exclusive life chart'
            }
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i <= step ? 'w-8 bg-amber-500' : 'w-8 bg-[#2b3139]'
              }`}
            />
          ))}
        </div>

        {/* Gender Selection (only on first step) */}
        {step === 0 && (
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setFormData({ ...formData, gender: 'male' })}
              className={`flex-1 py-3 rounded-xl border transition-all ${
                formData.gender === 'male'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                  : 'border-[#2b3139] text-gray-400 hover:border-gray-600'
              }`}
            >
              {lang === 'zh' ? '乾造 (男)' : 'Male'}
            </button>
            <button
              onClick={() => setFormData({ ...formData, gender: 'female' })}
              className={`flex-1 py-3 rounded-xl border transition-all ${
                formData.gender === 'female'
                  ? 'border-pink-500 bg-pink-500/10 text-pink-400'
                  : 'border-[#2b3139] text-gray-400 hover:border-gray-600'
              }`}
            >
              {lang === 'zh' ? '坤造 (女)' : 'Female'}
            </button>
          </div>
        )}

        {/* Input Field */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <CurrentIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type={currentStep.id === 'birthDate' ? 'date' : currentStep.id === 'birthTime' ? 'time' : 'text'}
              value={formData[currentStep.id as keyof typeof formData] as string}
              onChange={(e) => setFormData({ ...formData, [currentStep.id]: e.target.value })}
              placeholder={currentStep.placeholder[lang]}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#1e2329] border border-[#2b3139] text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <button
            onClick={handleNext}
            disabled={!formData[currentStep.id as keyof typeof formData]}
            className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>{step === steps.length - 1 
              ? (lang === 'zh' ? '开始解析' : 'Start Analysis')
              : (lang === 'zh' ? '下一步' : 'Next')
            }</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Info */}
        <p className="text-center text-xs text-gray-500 mt-6">
          {lang === 'zh' 
            ? '你的出生信息将用于生成专属命盘，数据仅存储在本地'
            : 'Your birth info will be used to generate your exclusive chart, data stored locally only'
          }
        </p>
      </motion.div>
    </div>
  );
}
