# RenderFlow — React + Tailwind export

Source-accurate port of the RenderFlow prototype: green industrial palette with beige/cream
gradient accents, animated machine schematic, boot sequence, context-read generation overlay,
alarm causality chain, and all six widgets (gauge, trend, numeric card, alarm banner, table, toggle).

## Files to add to your existing project

Copy this whole `src/` tree into your project's `src/` (merge folders if you already have some),
and merge the two config files at the root.

```
tailwind.config.js          → replace or merge into your existing tailwind.config.js
src/index.css               → replace your global stylesheet (or merge the @import/@layer base block)
src/data/tags.js
src/data/specs.js
src/lib/status.js
src/hooks/useTelemetry.js
src/hooks/useSpeech.js
src/components/Corners.jsx
src/components/BootScreen.jsx
src/components/EventNotification.jsx
src/components/Header.jsx
src/components/MachineSchematic.jsx
src/components/PromptBar.jsx
src/components/GenerationOverlay.jsx
src/components/WelcomeState.jsx
src/components/ErrorState.jsx
src/components/ScreenCanvas.jsx
src/components/HistorySidebar.jsx
src/components/widgets/WidgetCard.jsx
src/components/widgets/Gauge.jsx
src/components/widgets/Trend.jsx
src/components/widgets/NumericCard.jsx
src/components/widgets/AlarmBanner.jsx
src/components/widgets/DiagnosticTable.jsx
src/components/widgets/Toggle.jsx
src/App.jsx                 → replace your existing App.jsx (or import <RenderFlow/> from it)
```

## Setup

1. `npm install` — no extra runtime deps beyond `react`/`react-dom` and `tailwindcss` (already
   in a standard CRA/Vite React app). No animation library is used — everything is CSS.
2. Make sure `tailwind.config.js` `content`/`darkMode` matches your project; the one here only
   adds the `keyframes`/`animation` block RenderFlow needs — merge it into yours rather than
   overwriting if you already have Tailwind customizations.
3. Import `src/index.css` once at your app entry (`main.jsx`/`index.jsx`) — it loads Barlow /
   Barlow Condensed and defines the CSS custom properties (`--color-bg`, `--color-surface`,
   `--color-accent`, `--color-text`, `--color-divider`) the whole UI is built on. To retheme,
   edit only those variables.
4. Render `<RenderFlow />` from `src/App.jsx` wherever you want the screen mounted.

## Wiring to your real backend

Everything here simulates the backend contract described in the brief:
`POST /api/generate-screen` → `{ title, layout, trigger, widgets: [{ type, tag|tags, reason, ... }] }`.

Replace the two seams marked in the code:

- `src/data/specs.js` — `mockGenerateScreen(text)`. Swap its body for a real
  `fetch('/api/generate-screen', { method: 'POST', body: JSON.stringify({ prompt: text }) })`
  and return `{ spec: json }` / `{ error }`. The rest of the app (checklist animation, screen
  canvas, widget registry) only depends on the returned spec shape, unchanged.
- `src/hooks/useTelemetry.js` — currently synthesizes values with a random-walk toward a
  target. Replace the `setInterval` tick with your live telemetry subscription (WebSocket/SSE)
  and call `setTelemetry`/`setTrend` with real readings on the same tag-id keys used in
  `src/data/tags.js`.

The widget registry (`WidgetCard` + the six widget components) is switched on `type` exactly
per the contract (`gauge`, `trend`, `numeric_card`, `alarm_banner`, `table`, `toggle`) and never
renders arbitrary HTML from the spec — only known fields feed known components.
