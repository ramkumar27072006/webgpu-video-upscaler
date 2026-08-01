import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw, ExternalLink } from 'lucide-react';

interface ErrorViewProps {
  error: string;
  onReset: () => void;
}

export function ErrorView({ error, onReset }: ErrorViewProps) {
  const isWebGPUError = error.toLowerCase().includes('webgpu');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full space-y-6 text-center"
    >
      {/* Error Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
      </motion.div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Something went wrong
        </h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">{error}</p>
      </div>

      {isWebGPUError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card-inner p-4 text-left text-xs text-zinc-400 space-y-2"
        >
          <p className="font-medium text-zinc-300">WebGPU Requirements:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Chrome 113+ or Edge 113+</li>
            <li>A dedicated or integrated GPU</li>
            <li>WebGPU must be enabled in browser flags</li>
          </ul>
          <a
            href="https://developer.chrome.com/blog/webgpu-release"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-neon-cyan hover:underline mt-2"
          >
            Learn more <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onReset}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 mx-auto px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-300 hover:bg-white/10 transition-colors"
        id="try-again-button"
      >
        <RotateCcw className="w-4 h-4" />
        Try Again
      </motion.button>
    </motion.div>
  );
}
