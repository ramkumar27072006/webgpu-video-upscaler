# UpScale AI — Client-Side WebGPU Video Upscaler

> AI-powered video upscaling running entirely in your browser. No servers, no uploads, 100% private.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![WebGPU](https://img.shields.io/badge/WebGPU-000000?style=flat&logo=webgpu&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## ✨ Features

- **🎮 WebGPU-Powered** — Leverages your GPU for real-time AI video upscaling
- **🔒 100% Client-Side** — All processing happens locally in your browser. No data ever leaves your device.
- **🎬 2× Resolution** — Upscales video to double the original resolution using neural network inference
- **📊 Real-Time Metrics** — Live FPS, frame count, and progress tracking
- **🎨 Premium UI** — Glassmorphism design with Framer Motion animations

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Demuxing | mp4box |
| AI Upscaling | @websr/websr (Anime4K CNN-2x-S) |
| Video Encoding | WebCodecs API |
| Video Muxing | mp4-muxer |
| GPU Compute | WebGPU API |

## 🚀 Getting Started

### Prerequisites

- **Browser:** Chrome 113+ or Edge 113+ (WebGPU required)
- **Node.js:** v18+
- **GPU:** Dedicated or integrated GPU with WebGPU support

### Installation

```bash
# Clone the repository
git clone https://github.com/ramkumar27072006/upscale-ai.git
cd upscale-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## 🔄 Processing Pipeline

```
MP4 File → mp4box (Demux)
  → WebCodecs VideoDecoder (Decode)
    → WebSR/WebGPU (AI Upscale 2×)
      → WebCodecs VideoEncoder (H.264 Encode)
        → mp4-muxer (Package MP4)
          → Download Blob
```

## 📁 Project Structure

```
src/
├── components/
│   ├── AnimatedBackground.tsx  # Floating orb mesh gradient
│   ├── AnimatedCounter.tsx     # Spring-physics number counter
│   ├── CompletionView.tsx      # Download + stats view
│   ├── ErrorView.tsx           # Error handling + WebGPU help
│   ├── Header.tsx              # Branding + tagline
│   ├── ProcessingDashboard.tsx # Live metrics + scanner canvas
│   ├── ProgressRing.tsx        # SVG circular progress
│   └── UploadZone.tsx          # Drag-and-drop with spring physics
├── hooks/
│   └── useVideoUpscaler.ts    # Core video pipeline hook
├── lib/
│   └── utils.ts               # cn(), formatBytes, formatDuration
├── types.ts                   # TypeScript interfaces
├── App.tsx                    # Main app with state transitions
├── main.tsx                   # Entry point
└── index.css                  # Tailwind + custom animations
```

## ⚠️ Browser Compatibility

| Browser | WebGPU | WebCodecs | Status |
|---------|--------|-----------|--------|
| Chrome 113+ | ✅ | ✅ | Full Support |
| Edge 113+ | ✅ | ✅ | Full Support |
| Firefox | ❌ | ⚠️ | Not Supported |
| Safari | ⚠️ | ⚠️ | Partial |

## 📄 License

MIT
