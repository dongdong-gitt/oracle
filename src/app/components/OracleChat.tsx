'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Sparkles, User } from 'lucide-react';
import { Language, t } from './Dashboard';

interface OracleChatProps {
  onClose: () => void;
  lang: Language;
}

interface Message {
  id: string;
  role: 'user' | 'oracle';
  content: string;
  timestamp: Date;
}

const quickQuestions = {
  zh: [
    '今晚有个德扑高端局，能去吗？',
    '明天适合签约吗？',
    '最近财运如何？',
    '适合投资BTC吗？',
    '感情运势怎么样？'
  ],
  en: [
    'Should I join the poker game tonight?',
    'Is tomorrow good for signing contracts?',
    'How is my wealth luck recently?',
    'Is it good to invest in BTC?',
    'How is my love luck?'
  ]
};

const mockResponses = {
  zh: [
    '根据今晚戌时运势，偏财星旺，但需防冲动。建议：可以参加，但设置止损线，见好就收。',
    '明日辰时，印星当令，适合文书签约。但需注意细节条款，避免口头承诺。',
    '近期财星透干，正财偏财皆旺。适合稳健投资，避免高杠杆操作。',
    '当前处于火运，BTC属金，火克金。短期波动大，建议定投而非梭哈。',
    '桃花星动于东南，近期社交运佳。但需分辨正缘与烂桃花，避免冲动决策。'
  ],
  en: [
    'Based on Xu hour luck tonight,偏财星旺 but watch for impulsiveness. Advice: Join but set stop-loss and take profits early.',
    'Tomorrow Chen hour,印星 dominant, suitable for contracts. But pay attention to details, avoid verbal promises.',
    'Recently Wealth Star visible, both正财偏财 strong. Suitable for steady investing, avoid high leverage.',
    'Currently in Fire cycle, BTC is Metal, Fire克制Metal. High volatility short-term, suggest DCA instead of all-in.',
    'Peach Blossom Star moving Southeast, recent social luck good. But distinguish true love from bad romance, avoid impulsive decisions.'
  ]
};

export default function OracleChat({ onClose, lang }: OracleChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'oracle',
      content: lang === 'zh' 
        ? '你好，我是你的神谕顾问。基于你的生辰八字和当前运势，我可以为你提供决策建议。有什么想问的吗？'
        : 'Hello, I am your Oracle Advisor. Based on your birth chart and current luck cycle, I can provide decision advice. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const randomResponse = mockResponses[lang][Math.floor(Math.random() * mockResponses[lang].length)];
      const oracleMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'oracle',
        content: randomResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, oracleMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-24 right-6 w-[400px] max-w-[calc(100vw-48px)] bg-[#1e2329] rounded-2xl border border-[#2b3139] shadow-2xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2b3139] bg-[#2b3139]/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-white">{t('oracle', lang)}</div>
            <div className="text-xs text-[#0ecb81] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#0ecb81]"></span>
              {lang === 'zh' ? '在线' : 'Online'}
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-[400px] overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'oracle' 
                ? 'bg-gradient-to-br from-amber-500 to-orange-500' 
                : 'bg-[#2b3139]'
            }`}>
              {msg.role === 'oracle' ? (
                <Sparkles className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'oracle'
                ? 'bg-[#2b3139] text-gray-200 rounded-tl-none'
                : 'bg-amber-500 text-black rounded-tr-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[#2b3139] px-4 py-3 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length < 3 && (
        <div className="px-4 pb-2">
          <div className="text-xs text-gray-500 mb-2">
            {lang === 'zh' ? '快速提问' : 'Quick Questions'}
          </div>
          <div className="flex flex-wrap gap-2">
            {quickQuestions[lang].slice(0, 3).map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="px-3 py-1.5 rounded-full bg-[#2b3139] hover:bg-[#3a4249] text-xs text-gray-300 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-[#2b3139]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder={t('askOracle', lang)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#2b3139] text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
