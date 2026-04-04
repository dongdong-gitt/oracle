'use client';

import { motion } from 'framer-motion';
import LifeKLine from './LifeKLine';
import CycleCommandCenter from './CycleCommandCenter';

export default function CycleTools() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <CycleCommandCenter />
      <div
        className="p-6 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '0.5px solid rgba(255,255,255,0.08)',
        }}
      >
        <LifeKLine lang="zh" />
      </div>
    </motion.div>
  );
}
