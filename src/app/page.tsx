'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CyberGate from './components/CyberGate';
import Dashboard from './components/Dashboard';

export default function Home() {
  const [hasEntered, setHasEntered] = useState(false);

  return (
    <main className="bg-[#0a0a0f] min-h-screen">
      <AnimatePresence mode="wait">
        {!hasEntered ? (
          <motion.div
            key="gate"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <CyberGate onEnter={() => setHasEntered(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Dashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
