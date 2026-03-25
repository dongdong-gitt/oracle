'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  advisor?: string;
}

interface Advisor {
  id: string;
  name: string;
  title: string;
  desc: string;
  avatar: string;
  color: string;
}

const advisors: Advisor[] = [
  {
    id: 'canshan',
    name: '参天',
    title: '周期策略师',
    desc: '精通命理周期与大运分析，洞察趋势转折点',
    avatar: '参',
    color: '#06b6d4',
  },
  {
    id: 'qian',
    name: '钱先生',
    title: '财富架构师',
    desc: '专注资产配置与风险管理，构建稳健财富体系',
    avatar: '钱',
    color: '#f59e0b',
  },
];

export default function AIAdvisors() {
  const [activeAdvisor, setActiveAdvisor] = useState<string>('canshan');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好，我是参天。我已为你解析命盘，有什么关于命理周期或投资时机的问题，都可以问我。',
      advisor: 'canshan',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentAdvisor = advisors.find(a => a.id === activeAdvisor);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, advisor: activeAdvisor }]);
    setIsLoading(true);

    setTimeout(() => {
      const responses: Record<string, string> = {
        canshan: '从命理角度，你当前处于乙巳大运，火旺之年适合主动出击。建议关注科技、新能源领域的投资机会。',
        qian: '从资产配置角度，当前市场处于再通胀阶段，建议采用40%稳健+30%成长+30%现金的配置策略。',
      };
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responses[activeAdvisor] || '这是一个很好的问题...',
        advisor: activeAdvisor,
      }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto h-[calc(100vh-200px)]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-full">
        {/* 顾问选择 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white mb-4">选择顾问</h3>
          {advisors.map((advisor) => (
            <button
              key={advisor.id}
              onClick={() => {
                setActiveAdvisor(advisor.id);
                setMessages([{
                  role: 'assistant',
                  content: advisor.id === 'canshan' 
                    ? '你好，我是参天。我已为你解析命盘，有什么关于命理周期或投资时机的问题，都可以问我。'
                    : '你好，我是钱先生。专注于资产配置与风险管理，让我们一起规划你的财富体系。',
                  advisor: advisor.id,
                }]);
              }}
              className={`w-full text-left rounded-2xl overflow-hidden transition-all ${
                activeAdvisor === advisor.id ? 'ring-1 ring-cyan-400/50' : ''
              }`}
              style={{ 
                background: activeAdvisor === advisor.id 
                  ? `${advisor.color}10` 
                  : 'rgba(255,255,255,0.03)',
                border: activeAdvisor === advisor.id 
                  ? `0.5px solid ${advisor.color}40` 
                  : '0.5px solid rgba(255,255,255,0.08)'
              }}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${advisor.color}20` }}
                  >
                    <span className="text-xl font-semibold" style={{ color: advisor.color }}>{advisor.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-0.5">{advisor.name}</h4>
                    <p className="text-xs mb-1" style={{ color: advisor.color }}>{advisor.title}</p>
                    <p className="text-sm text-white/40 line-clamp-2">{advisor.desc}</p>
                  </div>
                </div>
              </div>
            </button>
          ))}

          {/* 快速问题 */}
          <div className="p-4 rounded-2xl mt-4" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              快速提问
            </h4>
            <div className="space-y-2">
              {[
                '2025年适合投资什么方向？',
                '我的财富高峰期在什么时候？',
                '当前大运需要注意什么？',
                '如何配置资产更稳健？',
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="w-full text-left p-2.5 rounded-lg text-sm text-white/40 hover:bg-white/5 hover:text-white transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 对话区域 */}
        <div className="lg:col-span-2 flex flex-col rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
          {/* 头部 */}
          <div className="p-4 flex items-center gap-3" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${currentAdvisor?.color}20` }}
            >
              <span className="font-semibold" style={{ color: currentAdvisor?.color }}>{currentAdvisor?.avatar}</span>
            </div>
            <div>
              <h4 className="font-semibold text-white">{currentAdvisor?.name}</h4>
              <p className="text-xs text-white/40">{currentAdvisor?.title}</p>
            </div>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'text-white'
                    : 'text-white/90'
                }`}
                style={{
                  background: msg.role === 'user' 
                    ? 'linear-gradient(135deg, #06b6d4, #3b82f6)'
                    : 'rgba(255,255,255,0.05)'
                }}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1.5 text-xs text-white/50">
                      <span 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: currentAdvisor?.color }}
                      />
                      {currentAdvisor?.name}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-100" />
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            )}
          </div>

          {/* 输入框 */}
          <div className="p-4" style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`向${currentAdvisor?.name}提问...`}
                className="flex-1 px-4 py-3 rounded-xl text-white placeholder:text-white/30 text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)' }}
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="px-4 py-3 rounded-xl text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
