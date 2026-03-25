'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function DreamInterpreter() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好，我是阿梦。请告诉我你昨晚做了什么梦，我会为你解读其中的含义。',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '这个梦境很有意思。从心理学角度，它反映了你潜意识中的某种期待或焦虑。从传统解梦角度，这可能预示着近期会有新的机遇出现。建议你保持开放的心态，迎接即将到来的变化。',
      }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto h-[calc(100vh-200px)]"
    >
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}>
          <Moon className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">阿梦</h2>
        <p className="text-white/50 text-sm">捕梦达人 · 古今鉴梦师 · 潜意识翻译官</p>
      </div>

      <div className="flex flex-col h-[calc(100%-140px)] rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
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
                  ? 'linear-gradient(135deg, #8b5cf6, #a855f7)'
                  : 'rgba(255,255,255,0.05)'
              }}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1.5 text-xs text-white/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    阿梦
                  </div>
                )}
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-200" />
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
              placeholder="描述你的梦境..."
              className="flex-1 px-4 py-3 rounded-xl text-white placeholder:text-white/30 text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)' }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="px-4 py-3 rounded-xl text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
