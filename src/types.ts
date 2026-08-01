/* ──────────────────────────────────────────────
   Type definitions for the video upscaler app
   ────────────────────────────────────────────── */

export type AppState = 'idle' | 'processing' | 'complete' | 'error';

export interface ProcessingMetrics {
  framesDecoded: number;
  totalFrames: number;
  inferenceFps: number;
  progress: number; // 0-100
  currentStep: string;
  elapsedMs: number;
}

export interface VideoInfo {
  name: string;
  width: number;
  height: number;
  duration: number; // seconds
  frameCount: number;
  fps: number;
  codec: string;
  sizeBytes: number;
}

export interface UpscaleResult {
  blob: Blob;
  outputWidth: number;
  outputHeight: number;
  totalTimeMs: number;
  framesProcessed: number;
}

export interface UpscalerConfig {
  networkName: string;
  scaleFactor: number;
}
