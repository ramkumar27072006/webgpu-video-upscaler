import { motion } from 'framer-motion';
import { Cpu, Zap, Clock, Layers, MonitorPlay } from 'lucide-react';
import type { ProcessingMetrics, VideoInfo } from '../types';
import { ProgressRing } from './ProgressRing';
import { AnimatedCounter } from './AnimatedCounter';
import { formatElapsed } from '../lib/utils';

interface ProcessingDashboardProps {
  metrics: ProcessingMetrics;
  videoInfo: VideoInfo | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function ProcessingDashboard({
  metrics,
  videoInfo,
  canvasRef,
}: ProcessingDashboardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full space-y-6"
    >
      {/* Video Preview with Scanner Line */}
      <div className="canvas-container aspect-video w-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
          id="preview-canvas"
        />
        {/* Animated scanner line */}
        <div className="scanner-line" />

        {/* Corner accents */}
        <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-neon-cyan/40 rounded-tl" />
        <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-neon-cyan/40 rounded-tr" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-neon-cyan/40 rounded-bl" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-neon-cyan/40 rounded-br" />

        {/* Processing badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-xs"
        >
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-neon-cyan"
          />
          <span className="text-zinc-300">Processing</span>
        </motion.div>

        {/* Resolution badge */}
        {videoInfo && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-xs text-zinc-400">
            <MonitorPlay className="w-3.5 h-3.5" />
            {videoInfo.width}×{videoInfo.height} → {videoInfo.width * 2}×
            {videoInfo.height * 2}
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<Layers className="w-4 h-4" />}
          label="Frames Decoded"
          delay={0}
        >
          <div className="flex items-baseline gap-1">
            <AnimatedCounter
              value={metrics.framesDecoded}
              className="text-xl font-bold text-white"
            />
            <span className="text-xs text-zinc-500">
              / {metrics.totalFrames}
            </span>
          </div>
        </MetricCard>

        <MetricCard
          icon={<Zap className="w-4 h-4" />}
          label="WebGPU FPS"
          delay={0.05}
        >
          <AnimatedCounter
            value={metrics.inferenceFps}
            decimals={1}
            className="text-xl font-bold text-neon-cyan"
          />
        </MetricCard>

        <MetricCard
          icon={<Cpu className="w-4 h-4" />}
          label="Progress"
          delay={0.1}
        >
          <AnimatedCounter
            value={metrics.progress}
            decimals={1}
            suffix="%"
            className="text-xl font-bold text-white"
          />
        </MetricCard>

        <MetricCard
          icon={<Clock className="w-4 h-4" />}
          label="Elapsed"
          delay={0.15}
        >
          <span className="text-xl font-bold text-white metric-value">
            {formatElapsed(metrics.elapsedMs)}
          </span>
        </MetricCard>
      </div>

      {/* Progress Ring + Status */}
      <div className="flex items-center gap-6">
        <ProgressRing progress={metrics.progress} size={80} strokeWidth={5} />
        <div className="flex-1 min-w-0">
          <motion.p
            key={metrics.currentStep}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm font-medium text-zinc-300 truncate"
          >
            {metrics.currentStep}
          </motion.p>
          {/* Linear progress bar */}
          <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, #06f5e1, #a855f7)',
              }}
              initial={{ width: '0%' }}
              animate={{ width: `${metrics.progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Metric Card ─── */
function MetricCard({
  icon,
  label,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 25 }}
      className="glass-card-inner p-4 space-y-2"
    >
      <div className="flex items-center gap-2 text-zinc-500">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      {children}
    </motion.div>
  );
}
