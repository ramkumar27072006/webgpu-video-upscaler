import { motion } from 'framer-motion';

/** Animated deep-space mesh gradient background */
export function AnimatedBackground() {
  return (
    <div className="mesh-gradient" aria-hidden="true">
      {/* Floating orbs */}
      <motion.div
        className="absolute rounded-full opacity-[0.04]"
        style={{
          width: 500,
          height: 500,
          top: '10%',
          left: '60%',
          background:
            'radial-gradient(circle, rgba(6,245,225,0.3) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute rounded-full opacity-[0.03]"
        style={{
          width: 400,
          height: 400,
          bottom: '15%',
          left: '20%',
          background:
            'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, -30, 25, 0],
          y: [0, 25, -35, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
      />
      <motion.div
        className="absolute rounded-full opacity-[0.025]"
        style={{
          width: 300,
          height: 300,
          top: '50%',
          right: '10%',
          background:
            'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, 20, -40, 0],
          y: [0, -40, 15, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 5,
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
