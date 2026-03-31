'use client';

import { motion } from 'framer-motion';
import LifeKLine from './LifeKLine';
import StrategyBoard from './StrategyBoard';

export default function CycleTools() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_420px] gap-6 items-start">
        <div
          className="p-6 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '0.5px solid rgba(255,255,255,0.08)',
          }}
        >
          <LifeKLine lang="zh" />
        </div>

        <StrategyBoard lang="zh" />
      </div>
    </motion.div>
  );
}
