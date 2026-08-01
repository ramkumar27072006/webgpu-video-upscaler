import { motion } from 'framer-motion';
import { Download, RotateCcw, CheckCircle2, ArrowUpRight } from 'lucide-react';
import type { UpscaleResult, VideoInfo } from '../types';
import { formatBytes, formatElapsed } from '../lib/utils';

interface CompletionViewProps {
  result: UpscaleResult;
  videoInfo: VideoInfo | null;
  onReset: () => void;
}

export function CompletionView({
  result,
  videoInfo,
  onReset,
}: CompletionViewProps) {
  const handleDownload = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = videoInfo
      ? `${videoInfo.name.replace(/\.[^.]+$/, '')}_upscaled_${result.outputWidth}x${result.outputHeight}.mp4`
      : 'upscaled_video.mp4';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full space-y-8 text-center"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.1,
        }}
        className="mx-auto"
      >
        <div className="w-20 h-20 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-neon-cyan" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          Upscaling Complete!
        </h2>
        <p className="text-zinc-400 text-sm">
          Your video has been enhanced to {result.outputWidth}×
          {result.outputHeight}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-4"
      >
        <StatItem
          label="Resolution"
          value={`${result.outputWidth}×${result.outputHeight}`}
        />
        <StatItem
          label="Frames"
          value={result.framesProcessed.toString()}
        />
        <StatItem
          label="Time"
          value={formatElapsed(result.totalTimeMs)}
        />
      </motion.div>

      {/* Download Button with shimmer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <motion.button
          onClick={handleDownload}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="shimmer-btn w-full py-4 px-8 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-3 relative z-10"
          id="download-button"
        >
          <Download className="w-5 h-5" />
          Download High-Res Video
          <ArrowUpRight className="w-4 h-4 opacity-60" />
        </motion.button>

        <p className="text-xs text-zinc-600">
          {formatBytes(result.blob.size)} • MP4 H.264
        </p>
      </motion.div>

      {/* Process Another */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={onReset}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 mx-auto text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        id="process-another-button"
      >
        <RotateCcw className="w-4 h-4" />
        Process Another Video
      </motion.button>
    </motion.div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card-inner p-3 text-center">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-lg font-semibold text-white metric-value">{value}</p>
    </div>
  );
}
