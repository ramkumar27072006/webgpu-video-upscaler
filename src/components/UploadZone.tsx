import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Film, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatBytes } from '../lib/utils';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
}

export function UploadZone({ onFileSelect }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setValidationError(null);
    if (!file.type.startsWith('video/')) {
      setValidationError('Please upload a valid video file (MP4, WebM, MOV)');
      return false;
    }
    if (file.size > 500 * 1024 * 1024) {
      setValidationError('File size must be under 500 MB');
      return false;
    }
    return true;
  };

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full"
    >
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'upload-zone relative flex flex-col items-center justify-center',
          'rounded-2xl p-12 md:p-16 cursor-pointer',
          'transition-all duration-300',
          isDragging && 'neon-border-cyan bg-neon-cyan/[0.02]'
        )}
      >
        {/* Animated border glow on drag */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                boxShadow:
                  '0 0 30px rgba(6,245,225,0.15), inset 0 0 30px rgba(6,245,225,0.05)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Upload Icon */}
        <motion.div
          animate={
            isDragging
              ? { y: [0, -8, 0], scale: [1, 1.1, 1] }
              : { y: 0, scale: 1 }
          }
          transition={
            isDragging
              ? { duration: 1, repeat: Infinity, ease: 'easeInOut' }
              : { type: 'spring', stiffness: 300 }
          }
          className="relative mb-6"
        >
          <div className="relative">
            <div
              className={cn(
                'w-20 h-20 rounded-2xl flex items-center justify-center',
                'bg-gradient-to-br',
                isDragging
                  ? 'from-neon-cyan/20 to-neon-purple/20'
                  : 'from-white/5 to-white/[0.02]',
                'border',
                isDragging ? 'border-neon-cyan/30' : 'border-white/10'
              )}
            >
              {isDragging ? (
                <Sparkles className="w-8 h-8 text-neon-cyan" />
              ) : (
                <Upload className="w-8 h-8 text-zinc-400" />
              )}
            </div>
            {/* Pulsing ring behind icon */}
            <motion.div
              animate={
                isDragging
                  ? { scale: [1, 1.5], opacity: [0.3, 0] }
                  : { scale: 1, opacity: 0 }
              }
              transition={
                isDragging
                  ? { duration: 1.5, repeat: Infinity, ease: 'easeOut' }
                  : {}
              }
              className="absolute inset-0 rounded-2xl border-2 border-neon-cyan"
            />
          </div>
        </motion.div>

        {/* Text */}
        <h3 className="text-lg font-semibold text-zinc-200 mb-2">
          {isDragging ? 'Release to upload' : 'Drop your video here'}
        </h3>
        <p className="text-sm text-zinc-500 mb-4">
          or click to browse • MP4, WebM, MOV up to 500 MB
        </p>

        {/* Supported formats */}
        <div className="flex items-center gap-3 text-xs text-zinc-600">
          <div className="flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5" />
            <span>WebGPU Upscaling</span>
          </div>
          <span className="text-zinc-700">•</span>
          <span>2× Resolution</span>
          <span className="text-zinc-700">•</span>
          <span>Fully Client-Side</span>
        </div>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          onChange={handleChange}
          className="hidden"
          id="video-upload-input"
        />
      </motion.div>

      {/* Validation Error */}
      <AnimatePresence>
        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {validationError}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
