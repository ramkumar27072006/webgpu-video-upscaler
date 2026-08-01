import { motion } from 'framer-motion';
import { Sparkles, Gpu } from 'lucide-react';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
      className="text-center mb-8 md:mb-12"
    >
      {/* Logo / Brand */}
      <motion.div
        className="inline-flex items-center gap-3 mb-4"
        whileHover={{ scale: 1.05 }}
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-neon-cyan" />
          </div>
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-xl bg-neon-cyan/10"
          />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">
          <span className="text-white">Up</span>
          <span className="neon-text-cyan">Scale</span>
          <span className="text-zinc-500 text-lg font-light ml-1.5">AI</span>
        </h1>
      </motion.div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-zinc-500 text-sm md:text-base max-w-md mx-auto"
      >
        AI-powered video upscaling running entirely in your browser.
        <br />
        <span className="inline-flex items-center gap-1 text-zinc-600 text-xs mt-1">
          Powered by WebGPU • Zero server costs • 100% private
        </span>
      </motion.p>
    </motion.header>
  );
}
