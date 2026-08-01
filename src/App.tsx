import { AnimatePresence, motion } from 'framer-motion';
import { AnimatedBackground } from './components/AnimatedBackground';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { ProcessingDashboard } from './components/ProcessingDashboard';
import { CompletionView } from './components/CompletionView';
import { ErrorView } from './components/ErrorView';
import { useVideoUpscaler } from './hooks/useVideoUpscaler';

function App() {
  const {
    state,
    metrics,
    videoInfo,
    result,
    error,
    previewCanvasRef,
    processVideo,
    reset,
  } = useVideoUpscaler();

  const handleFileSelect = (file: File) => {
    processVideo(file);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Animated background */}
      <AnimatedBackground />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-2xl">
        <Header />

        {/* Glass card container */}
        <motion.div
          layout
          className="glass-card p-6 md:p-8"
          transition={{ layout: { type: 'spring', stiffness: 200, damping: 30 } }}
        >
          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <UploadZone
                key="upload"
                onFileSelect={handleFileSelect}
              />
            )}

            {state === 'processing' && (
              <ProcessingDashboard
                key="processing"
                metrics={metrics}
                videoInfo={videoInfo}
                canvasRef={previewCanvasRef}
              />
            )}

            {state === 'complete' && result && (
              <CompletionView
                key="complete"
                result={result}
                videoInfo={videoInfo}
                onReset={reset}
              />
            )}

            {state === 'error' && (
              <ErrorView
                key="error"
                error={error ?? 'An unknown error occurred'}
                onReset={reset}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-xs text-zinc-700"
        >
          <p>
            Built with WebGPU, WebCodecs & WebSR •{' '}
            <span className="text-zinc-600">All processing happens locally</span>
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;
