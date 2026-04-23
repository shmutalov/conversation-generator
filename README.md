# Conversation Generator

Animated messaging-app conversation videos → MP4, via [Remotion](https://www.remotion.dev/).

**7 templates:** ChatGPT · Claude.ai · Gemini · Grok · WhatsApp · iMessage · Telegram (light + dark each).

Features:

- "Typing…" indicator for the responder before each reply
- Character-by-character teletype effect (teletype streaming for AI replies is optional per-dialogue)
- Smooth auto-scroll: messages pin to the bottom, older ones slide up via layout-height animation (no jump)
- Any resolution (480p / 720p / 1080p) × aspect ratio (9:16, 16:9, 1:1, 4:3)
- Clean H.264 MP4 export via Remotion's bundled ffmpeg
- Fonts bundled via `@remotion/google-fonts` (Inter, Roboto, Lora) — deterministic across machines

---

## Setup

```bash
npm install
```

Node 18+ required. First MP4 render also downloads a headless Chromium (~200 MB, one-time).

## Three ways to use it

### 1. Web UI (easiest)

Form-based dialogue editor + live Remotion Player preview + one-click MP4 export.

```bash
npm run serve     # starts render server on :3838 (first run: bundles + downloads Chromium)
npm run ui        # starts Vite dev server on :5173 (separate terminal)
```

Open http://localhost:5173 — edit the dialogue on the left, watch the preview on the right, hit **Render MP4**.

### 2. Remotion Studio (power user)

Typed schema panel + frame scrubber + built-in render.

```bash
npm run dev
```

### 3. CLI render

```bash
npm run render -- Conversation out/video.mp4 --props=./examples/chatgpt-tokyo.json
```

Examples in [examples/](examples/) — one per template. Override props with `--props=<file>.json` or inline JSON.

---

## Dialogue schema

```ts
{
  template: "chatgpt" | "claude" | "gemini" | "grok" | "whatsapp" | "imessage" | "telegram",
  resolution: "480p" | "720p" | "1080p",
  aspect: "portrait-9:16" | "landscape-16:9" | "square-1:1" | "landscape-4:3",
  fps: 30,
  theme: "dark" | "light",
  contactName: "ChatGPT",
  userName: "You",
  typeSpeedCps: 28,             // characters per second (teletype)
  thinkingMs: 1400,             // default "typing…" duration before each reply
  pauseAfterMs: 700,            // default gap between messages
  responderReveal: "teletype" | "instant",
  messages: [
    { sender: "me",   text: "..." },
    { sender: "them", text: "...", thinkingMs: 2000, typeSpeedCps: 45, pauseAfterMs: 300 }
  ]
}
```

Per-message overrides (`thinkingMs`, `typeSpeedCps`, `deliveredInstantly`, `pauseAfterMs`) are optional — they fall back to the top-level defaults. Dialogues of any length are supported; when the conversation overflows the viewport, older messages smoothly scroll off the top.

---

## Project layout

```
src/
  index.ts              Remotion entry
  Root.tsx              Composition registry + calculateMetadata (dims from props)
  Composition.tsx       Template router
  schema.ts             Zod dialogue schema + dimension math
  timeline.ts           Pure function: messages → per-frame events
  fonts.ts              @remotion/google-fonts loaders (Inter/Roboto/Lora)
  components/
    MessageStream.tsx   Flex-end anchored stream with per-event reveal
    RevealWrapper.tsx   Grid-fr layout-height animation (fixes jitter)
    TypingDots.tsx      "..." indicator
    Caret.tsx           Blinking teletype caret
  templates/
    ChatGPT.tsx Claude.tsx Gemini.tsx Grok.tsx
    WhatsApp.tsx iMessage.tsx Telegram.tsx

web/
  index.html            Vite entry
  vite.config.ts        Vite config with @/* alias → ../src
  src/
    App.tsx             Two-pane layout (editor + preview)
    Editor.tsx          Form editor for the dialogue schema
    Preview.tsx         @remotion/player wrapper
    ExportPanel.tsx     Download JSON + POST /render for MP4

scripts/
  render-server.mjs     Express server: POST /render → MP4 via @remotion/renderer

examples/               Seven starter dialogue JSONs (one per template)
```

---

## Adding a new template

1. Create `src/templates/MyApp.tsx` taking `{ dialogue, timeline, width, height }`. Use `<MessageStream>` for the chat area.
2. Add the id to `templateIdSchema` in [src/schema.ts](src/schema.ts) and a branch in [src/Composition.tsx](src/Composition.tsx).
3. Add to `templateOptions` in [web/src/Editor.tsx](web/src/Editor.tsx) so it appears in the UI selector.

## Notes

- **Determinism.** `buildTimeline()` in [src/timeline.ts](src/timeline.ts) maps messages to frame numbers purely; templates read `stateAt(event, frame)` to decide what to render each frame. Renders are byte-identical across runs.
- **Why the bubbles don't jitter.** New messages claim layout space smoothly via the CSS grid `0fr → 1fr` trick in [src/components/RevealWrapper.tsx](src/components/RevealWrapper.tsx) — so older messages push up over the spring, not in a single-frame jump.
- **Emoji rendering** in rendered MP4s depends on fonts inside the headless Chromium. If emojis render as boxes, install Noto Color Emoji on the render host.
