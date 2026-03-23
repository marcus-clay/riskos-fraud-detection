# RiskOS — AI-Augmented Fraud Detection

A functional prototype exploring agentic interface design for fraud detection at neobanks and payment institutions.

## What This Is

RiskOS is a product design case study, not a production application. It explores how an AI agent can prepare the cognitive ground for a human analyst without replacing their judgment. The prototype covers the full alert lifecycle: risk scoring, contextual investigation, AI-assisted analysis, decision-making, and resolution.

**Target users**: Level 1 fraud analysts processing 80–150 alerts per shift.

**Fraud types**: Account takeover (ATO), card-not-present (CNP), authorized push payment (APP).

**Industry**: European neobanks and payment institutions under PSD2 regulation.

## Running the Prototype

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`.

### Requirements

- Node.js 18+
- npm

### Stack

- React 18 (single component: `App.jsx`)
- Vite
- Tailwind CSS 3
- lucide-react (icons)
- Web Audio API (confidence chime, queue-cleared sound)

## Key Features

| Feature | Description |
|---|---|
| **Inbox with active triage** | Filterable by risk level, text search, persistent filter, session summary bar |
| **Single-screen case view** | Risk score, contributing factors, behavioral comparison (normal vs. suspicious), customer profile, transaction timeline |
| **Streaming AI insight** | Word-by-word analysis with semantic token highlighting (amounts, geolocations, devices), confidence indicator with audio feedback |
| **Conditional action gating** | Action buttons appear only after AI analysis completes |
| **Follow-up questions** | "Ask for more context" triggers additional AI insights per case |
| **Escalation with note** | Modal with AI-prefilled text, editable before sending |
| **Queue processing** | Chain cases via "Next in queue", session metrics, queue-cleared celebration |
| **Simulated integrations** | Slack notification preview, SMS customer notification, PDF export, Jira ticket, connected data sources with latency |

## Design Decisions

See `case-study.md` (French) or `case-study-en.md` (English) for the full case study with:

- Industry and user context
- Fraud types covered
- Agentic interface design principles
- Screencast descriptions for each video

## Videos

7 animated screencasts in `videos/`, produced via Puppeteer + FFmpeg (1920x1080, 30 fps, H.264):

| File | Duration | Content |
|---|---|---|
| `01-hero-triage.mp4` | 16s | Inbox overview, filtering, case selection, transition to detail |
| `02-ai-insight.mp4` | 15s | AI streaming, token highlighting, confidence, connected sources |
| `03-decision-ellipses.mp4` | 15s | Block Card, confirmation, Slack preview, SMS notification |
| `04-queue-cleared.mp4` | 14s | 5 cases processed in sequence, session metrics |
| `05-false-positive.mp4` | 11s | Low-risk case resolved in 8 seconds |
| `06-before-after.mp4` | 12s | Terminal CSV vs. RiskOS structured interface |
| `07-data-flow.mp4` | 11s | Animated detection pipeline diagram |

### Rendering Videos

The video source files are in `video-scenes/`. To re-render:

```bash
cd video-scenes
npm install   # installs Puppeteer (uses system Chrome)
brew install ffmpeg  # if not installed
node capture.js                  # render all scenes
node capture.js --scene 01-hero  # render a specific scene
```

Videos are output to `video-scenes/output/`.

The capture script uses Puppeteer with Chrome to take frame-by-frame screenshots of HTML/CSS animations, then assembles them into MP4 via FFmpeg. Each scene is a self-contained HTML file with CSS keyframe animations timed to a storyboard.

## Project Structure

```
.
├── App.jsx              # Main React component (entire prototype)
├── main.jsx             # Entry point
├── index.html           # HTML shell
├── index.css            # Tailwind + custom animations
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── CLAUDE.md            # AI assistant project context
├── case-study.md        # Case study (French)
├── case-study-en.md     # Case study (English)
├── videos/              # Rendered MP4 screencasts
│   ├── 01-hero-triage.mp4
│   ├── ...
│   └── 07-data-flow.mp4
└── video-scenes/        # HTML source files for video generation
    ├── capture.js       # Puppeteer frame capture script
    ├── render-all.sh
    ├── shared/          # Design tokens, animations, components CSS
    ├── 01-hero.html
    ├── ...
    └── 07-data-flow.html
```

## License

This is a portfolio case study. Not intended for production use.
