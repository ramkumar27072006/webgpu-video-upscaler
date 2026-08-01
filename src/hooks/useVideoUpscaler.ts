/* ──────────────────────────────────────────────
   useVideoUpscaler — Core video processing hook
   
   Pipeline: MP4 → demux (mp4box) → decode (WebCodecs VideoDecoder)
     → upscale (WebSR/WebGPU) → encode (WebCodecs VideoEncoder)
     → mux (mp4-muxer) → Blob
   ────────────────────────────────────────────── */

import { useCallback, useRef, useState } from 'react';
import { createFile as mp4boxCreateFile, type ISOFile, type Sample } from 'mp4box';
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
// WebSR is dynamically imported at runtime to avoid breaking
// page load (it eagerly accesses WebGPU APIs on import)
import type { AppState, ProcessingMetrics, VideoInfo, UpscaleResult } from '../types';

const SCALE_FACTOR = 2;
const NETWORK_NAME = 'anime4k/cnn-2x-s';

interface UseVideoUpscalerReturn {
  state: AppState;
  metrics: ProcessingMetrics;
  videoInfo: VideoInfo | null;
  result: UpscaleResult | null;
  error: string | null;
  previewCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  processVideo: (file: File) => Promise<void>;
  reset: () => void;
}

const initialMetrics: ProcessingMetrics = {
  framesDecoded: 0,
  totalFrames: 0,
  inferenceFps: 0,
  progress: 0,
  currentStep: '',
  elapsedMs: 0,
};

export function useVideoUpscaler(): UseVideoUpscalerReturn {
  const [state, setState] = useState<AppState>('idle');
  const [metrics, setMetrics] = useState<ProcessingMetrics>(initialMetrics);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [result, setResult] = useState<UpscaleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const abortRef = useRef(false);

  const reset = useCallback(() => {
    setState('idle');
    setMetrics(initialMetrics);
    setVideoInfo(null);
    setResult(null);
    setError(null);
    abortRef.current = false;
  }, []);

  const processVideo = useCallback(async (file: File) => {
    abortRef.current = false;
    setState('processing');
    setError(null);
    setResult(null);
    setMetrics({ ...initialMetrics, currentStep: 'Initializing WebGPU…' });

    const startTime = performance.now();
    const updateElapsed = () => performance.now() - startTime;

    try {
      /* ─── Step 1: Check global WebSR engine and WebGPU support ─── */
      const WebSREngine = (window as any).WebSR || (window as any).websr;
      if (!WebSREngine) {
        throw new Error('WebSR engine failed to load from global script. Please check your network connection.');
      }

      const gpuDevice = await WebSREngine.initWebGPU();
      if (!gpuDevice) {
        throw new Error(
          'WebGPU is not supported in this browser. Please use Chrome 113+ or Edge 113+.'
        );
      }

      /* ─── Step 2: Read file into ArrayBuffer ─── */
      setMetrics((m) => ({ ...m, currentStep: 'Reading file…', elapsedMs: updateElapsed() }));
      const fileBuffer = await file.arrayBuffer();

      /* ─── Step 3: Demux with mp4box ─── */
      setMetrics((m) => ({ ...m, currentStep: 'Demuxing MP4…', elapsedMs: updateElapsed() }));

      const { videoTrack, samples } = await demuxMP4(fileBuffer);

      const info: VideoInfo = {
        name: file.name,
        width: videoTrack.width,
        height: videoTrack.height,
        duration: videoTrack.duration / videoTrack.timescale,
        frameCount: videoTrack.nb_samples,
        fps: videoTrack.nb_samples / (videoTrack.duration / videoTrack.timescale),
        codec: videoTrack.codec,
        sizeBytes: file.size,
      };
      setVideoInfo(info);
      setMetrics((m) => ({
        ...m,
        totalFrames: info.frameCount,
        currentStep: 'Decoding & upscaling frames…',
        elapsedMs: updateElapsed(),
      }));

      /* ─── Step 4: Setup preview canvas ─── */
      const canvas = previewCanvasRef.current;
      if (!canvas) throw new Error('Preview canvas not mounted');
      const outputWidth = info.width * SCALE_FACTOR;
      const outputHeight = info.height * SCALE_FACTOR;
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      /* ─── Step 5: Initialize WebSR ─── */
      const weightsUrl = `https://cdn.jsdelivr.net/npm/@websr/websr@latest/weights/${NETWORK_NAME.replace('/', '_')}.json`;
      const weightsResponse = await fetch(weightsUrl);
      if (!weightsResponse.ok) {
        throw new Error(`Failed to fetch WebSR weights: ${weightsResponse.statusText}`);
      }
      const weights = await weightsResponse.json();

      const websr = new WebSREngine({
        network_name: NETWORK_NAME as any,
        weights,
        gpu: gpuDevice,
        canvas,
      });

      /* ─── Step 6: Setup encoder + muxer ─── */
      const muxer = new Muxer({
        target: new ArrayBufferTarget(),
        video: {
          codec: 'avc',
          width: outputWidth,
          height: outputHeight,
          frameRate: Math.round(info.fps),
        },
        fastStart: 'in-memory',
        firstTimestampBehavior: 'offset',
      });

      const encoder = new VideoEncoder({
        output: (chunk, meta) => {
          muxer.addVideoChunk(chunk, meta ?? undefined);
        },
        error: (e) => {
          console.error('VideoEncoder error:', e);
        },
      });
      encoder.configure({
        codec: 'avc1.640028',
        width: outputWidth,
        height: outputHeight,
        bitrate: 8_000_000,
        framerate: Math.round(info.fps),
      });

      /* ─── Step 7: Setup decoder ─── */
      let framesDecoded = 0;
      let lastFpsTime = performance.now();
      let fpsCounter = 0;

      const decoder = new VideoDecoder({
        output: async (frame: VideoFrame) => {
          try {
            if (abortRef.current) {
              frame.close();
              return;
            }

            // Render through WebSR (upscale via WebGPU)
            await websr.render(frame);
            frame.close(); // Memory safety: close input frame immediately

            // Read upscaled result from canvas
            const upscaledFrame = new VideoFrame(canvas, {
              timestamp: (framesDecoded / info.fps) * 1_000_000,
              duration: (1 / info.fps) * 1_000_000,
            });

            encoder.encode(upscaledFrame, {
              keyFrame: framesDecoded % 30 === 0,
            });
            upscaledFrame.close(); // Memory safety

            framesDecoded++;
            fpsCounter++;

            // Calculate FPS every 500ms
            const now = performance.now();
            let currentFps = 0;
            if (now - lastFpsTime >= 500) {
              currentFps = (fpsCounter / (now - lastFpsTime)) * 1000;
              fpsCounter = 0;
              lastFpsTime = now;
            }

            setMetrics((m) => ({
              ...m,
              framesDecoded,
              progress: Math.min(99, (framesDecoded / info.frameCount) * 100),
              inferenceFps: currentFps > 0 ? currentFps : m.inferenceFps,
              elapsedMs: updateElapsed(),
            }));
          } catch (err) {
            frame.close();
            console.error('Frame processing error:', err);
          }
        },
        error: (e) => {
          console.error('VideoDecoder error:', e);
        },
      });

      // Find the codec string from the track info
      const codecDesc = getCodecDescription(videoTrack);
      decoder.configure({
        codec: videoTrack.codec,
        codedWidth: videoTrack.width,
        codedHeight: videoTrack.height,
        ...(codecDesc ? { description: codecDesc } : {}),
      });

      /* ─── Step 8: Feed samples to decoder ─── */
      setMetrics((m) => ({
        ...m,
        currentStep: 'Processing frames…',
        elapsedMs: updateElapsed(),
      }));

      for (const sample of samples) {
        if (abortRef.current) break;
        if (!sample.data) continue; // skip samples with no data

        const chunk = new EncodedVideoChunk({
          type: sample.is_sync ? 'key' : 'delta',
          timestamp: (sample.cts * 1_000_000) / sample.timescale,
          duration: (sample.duration * 1_000_000) / sample.timescale,
          data: sample.data,
        });

        decoder.decode(chunk);

        // Prevent too many queued frames
        while (decoder.decodeQueueSize > 5) {
          await new Promise((r) => setTimeout(r, 10));
        }
      }

      /* ─── Step 9: Flush and finalize ─── */
      setMetrics((m) => ({
        ...m,
        currentStep: 'Finalizing…',
        elapsedMs: updateElapsed(),
      }));

      await decoder.flush();
      await encoder.flush();
      muxer.finalize();

      decoder.close();
      encoder.close();
      await websr.destroy();

      /* ─── Step 10: Create result blob ─── */
      const outputBuffer = (muxer.target as ArrayBufferTarget).buffer;
      const blob = new Blob([outputBuffer], { type: 'video/mp4' });

      const totalTimeMs = updateElapsed();
      setMetrics((m) => ({
        ...m,
        progress: 100,
        currentStep: 'Complete!',
        elapsedMs: totalTimeMs,
      }));

      setResult({
        blob,
        outputWidth,
        outputHeight,
        totalTimeMs,
        framesProcessed: framesDecoded,
      });

      setState('complete');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      setState('error');
      setMetrics((m) => ({
        ...m,
        currentStep: `Error: ${message}`,
        elapsedMs: updateElapsed(),
      }));
    }
  }, []);

  return {
    state,
    metrics,
    videoInfo,
    result,
    error,
    previewCanvasRef,
    processVideo,
    reset,
  };
}

/* ──────────────────────────────────
   MP4 Demuxing helpers
   ────────────────────────────────── */

interface DemuxResult {
  videoTrack: any;
  samples: Sample[];
}

function demuxMP4(buffer: ArrayBuffer): Promise<DemuxResult> {
  return new Promise((resolve, reject) => {
    const mp4File: ISOFile = mp4boxCreateFile();
    let videoTrack: any = null;
    const allSamples: Sample[] = [];

    mp4File.onReady = (info: any) => {
      const track = info.tracks.find(
        (t: any) => t.type === 'video'
      );
      if (!track) {
        reject(new Error('No video track found in the MP4 file'));
        return;
      }
      videoTrack = track;
      mp4File.setExtractionOptions(track.id, null, {
        nbSamples: Infinity,
      });
      mp4File.start();
    };

    mp4File.onSamples = (_id: number, _user: any, samples: Sample[]) => {
      allSamples.push(...samples);
      // Check if we have all samples
      if (videoTrack && allSamples.length >= videoTrack.nb_samples) {
        mp4File.stop();
        resolve({ videoTrack, samples: allSamples });
      }
    };

    mp4File.onError = (e: any) => {
      reject(new Error(`MP4 demuxing failed: ${e}`));
    };

    // Feed the buffer — mp4box expects fileStart property
    const buf = buffer as any;
    buf.fileStart = 0;
    mp4File.appendBuffer(buf);
    mp4File.flush();
  });
}

function getCodecDescription(track: any): Uint8Array | undefined {
  // Extract avcC/hvcC box for decoder configuration
  const trak = track.trak;
  if (!trak) return undefined;

  const stbl = trak.mdia?.minf?.stbl;
  if (!stbl) return undefined;

  const stsd = stbl.stsd;
  if (!stsd || !stsd.entries || stsd.entries.length === 0) return undefined;

  const entry = stsd.entries[0];
  const avcC = entry.avcC || entry.hvcC;
  if (!avcC) return undefined;

  // Create a DataStream and write the box to get the raw bytes
  const stream = new DataView(new ArrayBuffer(1024));
  // Use the mp4box serialization if available
  if (typeof avcC.write === 'function') {
    const buffer = new ArrayBuffer(4096);
    const ds = {
      buffer,
      byteOffset: 0,
      position: 0,
      writeUint8: function(v: number) { new DataView(this.buffer).setUint8(this.position++, v); },
    };
    try {
      avcC.write(ds);
      return new Uint8Array(buffer, 0, ds.position);
    } catch {
      // Fallback
    }
  }

  // Fallback: try to get the data directly
  if (avcC.data) {
    return new Uint8Array(avcC.data);
  }

  return undefined;
}
