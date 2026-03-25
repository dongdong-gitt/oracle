'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, User, Zap, Target, Compass } from 'lucide-react';

interface ShiShen {
  name: string;
  ganZhi: string;
  shiShen: string;
  meaning: string;
}

interface MingPanDetail {
  riZhu: string;
  riZhuElement: string;
  riZhuMeaning: string;
  shiShenList: ShiShen[];
  geJu: string;
  geJuDesc: string;
  yongShen: string;
  xiShen: string;
  jiShen: string;
  character: string[];
  career: string[];
  wealth: string[];
  love: string[];
}

// 模拟命盘详细数据
const mockMingPanDetail: MingPanDetail = {
  riZhu: '戊土',
  riZhuElement: '土',
  riZhuMeaning: '戊土为阳土，象征城墙之土，厚重稳固，有包容万物之德。日主戊土之人性格稳重踏实，做事有始有终，值得信赖。',
  shiShenList: [
    { name: '年柱', ganZhi: '甲子', shiShen: '七杀', meaning: '代表祖辈、早年运势，七杀主压力与挑战，也主权威。' },
    { name: '月柱', ganZhi: '丙寅', shiShen: '偏印', meaning: '代表父母、青年运势，偏印主学识、偏门技艺。' },
    { name: '日柱', ganZhi: '戊辰', shiShen: '日主', meaning: '代表自己、配偶，日主为命之核心。' },
    { name: '时柱', ganZhi: '庚午', shiShen: '食神', meaning: '代表子女、晚年运势，食神主才华、口福。' },
  ],
  geJu: '食神格',
  geJuDesc: '食神格之人聪明伶俐，才华横溢，性格温和，善于表达。适合从事文化、艺术、教育等行业。食神泄秀，主有口福，也主才华外露。',
  yongShen: '火',
  xiShen: '土',
  jiShen: '水',
  character: [
    '性格稳重踏实，做事有条理',
    '为人诚信可靠，重承诺',
    '有包容心，能容纳不同意见',
    '有时过于固执，不善变通',
    '内心细腻，但不善表达情感',
  ],
  career: [
    '适合从事管理、行政类工作',
    '房地产、建筑行业有利',
    '教育、培训领域可发展',
    '金融、投资需谨慎',
    '创业宜稳扎稳打，不宜冒进',
  ],
  wealth: [
    '财运稳健，不喜投机',
    '适合长期投资，积累财富',
    '中年后财运渐佳',
    '注意理财规划，避免大手大脚',
    '房地产是不错的投资方向',
  ],
  love: [
    '感情专一，重视家庭',
    '择偶标准较高，宁缺毋滥',
    '婚后忠诚，是可靠的伴侣',
    '需主动表达情感，避免冷战',
    '与属兔、属马、属羊之人较为相合',
  ],
};

export default function MingPanDetail() {
  const [activeTab, setActiveTab] = useState<'overview' | 'shishen' | 'character' | 'life'>('overview');

  const tabs = [
    { id: 'overview', label: '命盘概览', icon: <Compass className="w-4 h-4" /> },
    { id: 'shishen', label: '十神解析', icon: <User className="w-4 h-4" /> },
    { id: 'character', label: '性格分析', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'life', label: '人生指导', icon: <Target className="w-4 h-4" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="glass-card rounded-3xl p-8"
    >
      <h3 className="text-2xl font-bold gradient-text mb-6">命盘详解</h3>

      {/* 标签切换 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'overview' | 'shishen' | 'character' | 'life')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && <OverviewTab data={mockMingPanDetail} />}
        {activeTab === 'shishen' && <ShiShenTab data={mockMingPanDetail.shiShenList} />}
        {activeTab === 'character' && <CharacterTab data={mockMingPanDetail} />}
        {activeTab === 'life' && <LifeTab data={mockMingPanDetail} />}
      </div>
    </motion.div>
  );
}

function OverviewTab({ data }: { data: MingPanDetail }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* 日主信息 */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl font-bold">
            {data.riZhuElement}
          </div>
          <div>
            <h4 className="text-xl font-bold">{data.riZhu}日主</h4>
            <p className="text-gray-400">你的命理核心</p>
          </div>
        </div>
        <p className="text-gray-300 leading-relaxed">{data.riZhuMeaning}</p>
      </div>

      {/* 格局信息 */}
      <div className="glass rounded-xl p-6">
        <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          {data.geJu}
        </h4>
        <p className="text-gray-300 leading-relaxed">{data.geJuDesc}</p>
      </div>

      {/* 喜忌用神 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-xs text-gray-400 mb-2">用神</div>
          <div className="text-2xl font-bold text-green-400">{data.yongShen}</div>
          <div className="text-xs text-gray-500 mt-1">对你有利</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-xs text-gray-400 mb-2">喜神</div>
          <div className="text-2xl font-bold text-blue-400">{data.xiShen}</div>
          <div className="text-xs text-gray-500 mt-1">辅助用神</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-xs text-gray-400 mb-2">忌神</div>
          <div className="text-2xl font-bold text-red-400">{data.jiShen}</div>
          <div className="text-xs text-gray-500 mt-1">对你不利</div>
        </div>
      </div>
    </motion.div>
  );
}

function ShiShenTab({ data }: { data: ShiShen[] }) {
  const getShiShenColor = (shiShen: string) => {
    const colors: Record<string, string> = {
      '正官': 'text-blue-400',
      '七杀': 'text-red-400',
      '正印': 'text-green-400',
      '偏印': 'text-teal-400',
      '正财': 'text-yellow-400',
      '偏财': 'text-amber-400',
      '食神': 'text-pink-400',
      '伤官': 'text-purple-400',
      '比肩': 'text-indigo-400',
      '劫财': 'text-orange-400',
      '日主': 'text-white',
    };
    return colors[shiShen] || 'text-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {data.map((item, i) => (
        <div key={i} className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-gray-400">{item.name}</span>
              <span className="text-xl font-bold">{item.ganZhi}</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getShiShenColor(item.shiShen)} bg-white/5`}>
              {item.shiShen}
            </span>
          </div>
          <p className="text-gray-300 text-sm">{item.meaning}</p>
        </div>
      ))}
    </motion.div>
  );
}

function CharacterTab({ data }: { data: MingPanDetail }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="glass rounded-xl p-6">
        <h4 className="text-lg font-bold mb-4">性格特点</h4>
        <div className="space-y-3">
          {data.character.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-indigo-400">{i + 1}</span>
              </div>
              <p className="text-gray-300">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function LifeTab({ data }: { data: MingPanDetail }) {
  const sections = [
    { title: '事业指导', icon: <Target className="w-5 h-5" />, items: data.career, color: 'blue' },
    { title: '财富建议', icon: <Zap className="w-5 h-5" />, items: data.wealth, color: 'yellow' },
    { title: '感情指南', icon: <User className="w-5 h-5" />, items: data.love, color: 'pink' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {sections.map((section, i) => (
        <div key={i} className="glass rounded-xl p-6">
          <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 text-${section.color}-400`}>
            {section.icon}
            {section.title}
          </h4>
          <ul className="space-y-2">
            {section.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2 text-gray-300">
                <span className="text-indigo-400 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </motion.div>
  );
}
