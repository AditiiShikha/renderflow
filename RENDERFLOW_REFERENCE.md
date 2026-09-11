# RenderFlow — Complete Feature & Design Reference

*Compiled directly from the current codebase (backend/, frontend/, shared/, prisma/) — every claim below is traceable to actual source, not aspirational. Use this as raw material for slides, docs, blog posts, etc.*

---

## 1. One-liner

RenderFlow is a generative HMI (Human-Machine Interface) engine for industrial operator screens. Instead of engineers hand-building static SCADA/HMI screens for every tag, alarm, and scenario, RenderFlow assembles the right screen on demand — from a live alarm, or from a plain-language operator request — using a fixed, validated widget catalog and a local (on-prem) language model. Every widget on screen carries a visible reason, and abnormal readings get a separate, non-AI diagnostic explanation.

---

## 2. Full Feature List

### Core generation loop
- **Prompt-triggered generation** — operator types a request ("Show me Pump 3 status") → full screen assembled live, no pre-built screens exist.
- **Alarm-triggered generation** — an active alarm can produce a diagnostic screen for its asset with one click ("View Screen"), through the same generation endpoint as prompts.
- **Structured screen specification** — every response is plain JSON (`{ title, layout, trigger, widgets }`), never raw HTML/markup from the model.
- **Fixed widget catalog** — exactly 6 widget types (gauge, trend, numeric_card, alarm_banner, table, toggle), each rendered by a hand-built React component via a registry lookup. Unknown types render a visible "unsupported" chip instead of breaking.
- **Schema + semantic validation** — every model-generated widget is checked: valid type, required props present, every tag/tags value must exist in the real tag list, and `reason` must literally name the tag/alarm it's about.
- **Retry-once-then-fallback** — if validation fails, the model gets one retry with the specific errors appended to its prompt; if it fails twice, the system falls back to a deterministic builder.
- **Deterministic fallback (Plan B)** — a keyword/lookup-based screen builder that never depends on the LLM: for alarms, gauge+trend+alarm_banner for the alarm's asset; for prompts, keyword-matches an asset name (defaults to the first known asset if no match).
- **Local LLM inference** — Ollama running Phi-3 locally, called with JSON-Schema-constrained structured output (grammar-constrained decoding) and low temperature (0.1) for near-deterministic generation.

### Intent & safety layer (frontend-only, added post-MVP)
- **Intent classification gate** — before any prompt reaches the backend, a heuristic classifier (`lib/intent.js`) sorts it into `operational` / `ambiguous` / `irrelevant`, using a live vocabulary built from real asset/tag names plus generic operational terms, and a greeting/chit-chat pattern list.
- **Irrelevant-input rejection** — inputs like "hi", "hello", "test" are rejected client-side with example prompts, never reaching the model or the fallback's silent default-asset behavior.
- **Ambiguous-input clarification** — genuinely unclear text (not a greeting, but no operational vocabulary either) prompts the operator to be more specific instead of guessing.

### Explainability
- **"Why this widget" (backend-authored `reason`)** — every widget must carry a reason naming the tag/alarm that justified it; enforced by validation, not just requested.
- **Diagnostic explanation layer (frontend, rule-based, `lib/diagnostics.js`)** — for abnormal readings, a second, separate section: **Observed** (live value vs. real threshold), **Likely** (cautious, hedged inference — "may indicate," never a stated cause), **Check** (practical inspection suggestion). Entirely deterministic — built from a fixed lookup table keyed on real tag `category` values, and reads live telemetry/context directly, so it cannot invent a value. Not LLM-generated.
- **Multi-signal correlation** — if a sibling tag on the same asset is also abnormal, the explanation upgrades to a combined-signal inference (e.g., elevated temperature + elevated pressure → "may indicate restricted flow or abnormal loading") using a category-pair lookup table.
- **Explainability surfaced in two places** — a compact "Why?" toggle per row in the active-alarm banner, and a fuller popover per widget on any generated screen.

### Alarms
- **Real-time alarm polling** — active alarms polled from the backend every 1.5s.
- **Persistent alarm annunciator** — active, unacknowledged alarms sit in a banner under the header (worst severity first) until explicitly acknowledged; doesn't auto-dismiss or auto-navigate.
- **Entrance highlight** — a newly-active critical alarm gets a one-time visual glow.
- **Client-side acknowledgement** — clearing an alarm from the operator's view without pretending the underlying condition is resolved (no backend "ack" endpoint exists by design).

### Live data & visualization
- **Live telemetry polling** — numeric tag values polled every second from a backend simulator (sine wave + noise per tag).
- **Rolling trend buffer** — client-side 60-point buffer per tag, since the telemetry endpoint only returns a snapshot.
- **Threshold-based status coloring** — every widget/asset colored normal/warning/critical from real `warnThreshold`/`critThreshold` comparisons, one shared function (`statusOf`) used everywhere.
- **Animated machine schematics** — SVG schematics for Pump 3 / Conveyor 1 whose motion speed is driven by a real, normalized tag reading (vibration, speed) — not a decorative fixed rate.
- **System online/offline indicator** — header reflects whether telemetry and alarm polling are currently succeeding.

### Interaction
- **Voice input (dictation)** — browser `SpeechRecognition` fills the prompt field from speech; does not auto-submit.
- **Screen history** — every generated screen cached (last 8) in `localStorage`; selecting a past entry redisplays it instantly with no new backend call.
- **Example prompt chips** — one-click example requests in the prompt bar.

---

## 3. Architecture (as built)

```
┌─────────────────────────────────────────────────────────────┐
│  INGESTION (backend/ingestion, backend/db)                   │
│  Prisma/SQLite seeded from shared/fixtures. A telemetry       │
│  simulator ticks every 1s, computing sine-wave values per tag │
│  and flipping Alarm.active on threshold crossings.            │
└───────────────┬─────────────────────────────────────────────┘
                │  GET /api/context, /api/alarms, /api/telemetry
                ▼
┌─────────────────────────────────────────────────────────────┐
│  TRIGGER  (frontend)                                          │
│  Operator prompt (text or dictated) OR a polled active alarm  │
│  → intent-classified client-side if it's a prompt              │
└───────────────┬─────────────────────────────────────────────┘
                │  POST /api/generate-screen { trigger }
                ▼
┌─────────────────────────────────────────────────────────────┐
│  AI ROUTER  (backend/ai-router)                                │
│  1. Build system+user prompt from real tag list/context        │
│  2. Call local Ollama (Phi-3) with JSON-Schema-constrained      │
│     structured output                                          │
│  3. Validate result against real tags + reason-quality rules   │
│  4. Retry once with errors appended if invalid                 │
│  5. Fall back to deterministic builder if still invalid         │
│     or Ollama unreachable                                       │
│  → always returns the same { title, layout, trigger, widgets }  │
└───────────────┬─────────────────────────────────────────────┘
                │  JSON screen spec
                ▼
┌─────────────────────────────────────────────────────────────┐
│  RENDERER  (frontend/src/components)                            │
│  Fixed widget registry renders only known types.                │
│  Each widget independently computes its own live diagnostic     │
│  explanation from telemetry/context — never trusts the spec     │
│  for causal claims.                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Tech Stack

**Backend**: Node.js, Express, Prisma ORM, SQLite (dev datastore), CORS.
**AI**: Ollama (local inference server), Phi-3 model, JSON-Schema-constrained structured output.
**Frontend**: React 18, Vite, Tailwind CSS.
**Contracts**: JSON Schema (draft-07), shared as plain `.json` files consumed by both backend (CommonJS) and frontend (ESM) — no runtime dependency, framework-agnostic.
**Voice**: Browser-native Web Speech API (`SpeechRecognition`), no external STT service integrated by RenderFlow itself.

---

## 5. Data Model / Contracts (frozen after Phase 0)

- **Tag**: `id, name, unit, min, max, warnThreshold, critThreshold, assetId, category`
- **Asset hierarchy**: two levels — `Line → Asset`, each asset carrying `tagIds`
- **Alarm**: `id, tagId, severity, message, timestamp, active`
- **Widget** (6 fixed types): `gauge, trend, numeric_card, alarm_banner, table, toggle` — each with its own required-prop set
- **Trigger**: `{type:"prompt", text}` or `{type:"alarm", alarmId}`
- **Screen spec** (response contract): `{ title, layout, trigger, widgets[] }`, every widget carrying a `reason`

Endpoints: `GET /api/context`, `GET /api/alarms`, `GET /api/telemetry`, `POST /api/generate-screen`, `GET /api/health`.

---

## 6. Key Design Decisions & Rationale

*(Pulled from the engineering rationale actually left in code comments — this is the "how we thought about it" material for technical audiences.)*

1. **Structured output over free-text generation.** Ollama is called with a JSON-Schema `format` parameter, which compiles into a decoding grammar — the model is structurally incapable of emitting a malformed key or mixing props from two widget types. *Why it matters for content*: this is a stronger guarantee than "we told the model to be careful" — it's enforced at the token-decoding level, not just requested in the prompt.

2. **Schema enforcement is not semantic enforcement — two separate layers exist on purpose.** The generation schema constrains *shape* (can't invent a widget type or field), but deliberately does **not** constrain tag ids to a real-id enum — that was tested and found to increase generation time without a clear win, and also can't verify "is this reason believable." So a second, independent validation layer (`validate.js`) does the semantic check: real tag ids, believable reasons. *Why it matters*: two independent nets catch different failure classes; neither alone is sufficient.

3. **Bounded widget count (max 6).** Testing surfaced a real failure mode: an unconstrained array let the model spiral into a degenerate repetition loop (85 near-identical widgets in one run). Bounding array length closed that failure mode structurally, regardless of root cause.

4. **Low temperature (0.1), not zero.** This is structured-output generation against a fixed schema, not creative writing — the model should pick its highest-confidence token, not sample broadly.

5. **The orchestrator fills in `layout` and `trigger` itself — never trusts the model to echo them back.** `layout` only ever has one valid value; `trigger` is already known. Asking a small model to faithfully echo fields it doesn't need to reason about is an unnecessary failure surface.

6. **Deterministic fallback exists as a hard guarantee, not a soft convenience.** Every trigger — LLM success, LLM failure after retry, or Ollama being completely unreachable — always terminates in the same `{title, layout, trigger, widgets}` shape. The system is designed to never visibly break, at the cost of sometimes showing a simpler screen.

7. **Normalization runs strictly after validity is decided, and only ever removes, never adds.** De-duplication of repeated widgets happens post-validation so it cannot turn an invalid spec into a "valid-looking" one, and is a guaranteed no-op on the fallback path (which never duplicates by construction).

8. **The explainability `reason` field is contract-enforced, not just prompted.** A widget without a reason that names its actual subject fails validation outright — explainability is structural, not a courtesy the model can skip.

9. **The diagnostic explanation layer is deliberately NOT generative.** Given the requirement to "never invent telemetry values or unsupported machine facts," the team chose a rule-based engine over asking the LLM to explain causality — a fixed lookup table keyed on real tag `category` values can't hallucinate a value, where free-text generation always carries that risk. This was a conscious trade of flexibility for guaranteed honesty.

10. **The diagnostic engine only ever says "elevated," never "reduced."** The existing threshold model (`value >= warnThreshold/critThreshold`) has no concept of "too low" — so the explanation language was deliberately constrained to match what the data can actually support, rather than implying a detection capability that doesn't exist.

11. **Intent filtering lives in the frontend, not the backend, by necessity.** Both backend paths (LLM and deterministic fallback) are designed to *always* answer with some screen — neither has a "this isn't a valid request" concept. Rather than change backend contracts to add rejection semantics, a lightweight classifier was added client-side to catch irrelevant/ambiguous input before it ever reaches the API.

12. **The alarm annunciator never auto-dismisses or auto-navigates.** An earlier design (`EventNotification`) used a floating toast that auto-cleared and auto-navigated after ~2.6s. This was deliberately replaced: "a real plant annunciator stays put and lists every active alarm until an operator explicitly clears it — it never times out and relocates you on its own." Small UX decision, directly justified by matching real industrial annunciator conventions.

13. **Schematic animation speed is tied to a real tag reading, not a fixed decorative loop.** The team explicitly rejected a constant animation rate in favor of normalizing a real vibration/speed value to drive motion — "severity color and motion speed are now reading the same underlying number instead of one being real and one decorative."

14. **The boot screen and generation-overlay phase list only state facts that are actually true.** Both were explicitly rewritten to avoid claiming specific backend steps ("temperature telemetry found") that can't be verified happened — the generation phases describe UI state only, and the boot screen's asset/tag counts come from the live API, not hardcoded numbers.

15. **Un-owned widget types fail loud, not silent.** An unrecognized `widget.type` in a screen spec renders a visible "Unsupported widget type" chip rather than being silently dropped — a deliberate "fail safely, never crash, never hide a problem" rule applied consistently across the renderer.

16. **Ownership boundaries were enforced structurally during the build, not just by convention.** The codebase was explicitly partitioned (Person A: data layer, Person B: AI router, Person C: frontend) with a rule that contracts under `/shared` are frozen after an initial phase and change only by three-way agreement — a deliberate choice to let three people build in parallel against a stable contract instead of coordinating continuously.

---

## 7. Known Limitations (say these plainly if asked — don't oversell)

- **Alarm triggers do not currently skip the LLM.** Both `prompt` and `alarm` triggers attempt Ollama first; the deterministic path is a failure-fallback, not a default routing choice by trigger type.
- **The fallback path is invisible in the UI.** The backend signals fallback usage via an `X-RenderFlow-Fallback` response header, but the frontend currently discards it — an operator can't visually tell whether a screen came from the model or the deterministic builder.
- **Voice input may not be fully on-prem.** Browser `SpeechRecognition` (e.g., Chrome) typically round-trips through a cloud speech-to-text service — telemetry/tag data never leaves the plant, but dictated audio might, depending on browser.
- **The `toggle` widget is display-only.** No backend write endpoint exists — it does not control anything real.
- **Alarm acknowledgement is client-side only, session-local.** No backend "ack" endpoint; doesn't persist across reload or across operators.
- **The intent classifier is a heuristic, not an NLU model.** Keyword/pattern matching against a live vocabulary — works well for the demo's vocabulary, not a general-purpose language understanding layer.
- **The diagnostic engine has no historical/trend reasoning.** It reasons over the current instant plus live sibling-tag state only — it can't say "this has been rising for 10 minutes," only "this is currently elevated."
- **Only one tag (`pump3_temp`) is engineered to reliably cross alarm thresholds** in the current simulator — useful to know for planning demos or examples.

---

## 8. Build Process / Team Structure (useful for "how we built it" narrative)

Three-way parallel ownership after a shared "Phase 0" that froze the contracts:
- **Person A — Data Layer**: Prisma schema, seed script, telemetry simulator, context/alarm/telemetry read endpoints.
- **Person B — AI Router**: Ollama integration, prompt templates, structured-output schema, validation, deterministic fallback, `/api/generate-screen`.
- **Person C — Frontend**: all of `frontend/`, widget components, screen canvas, explainability UI.

Shared, frozen-by-agreement contracts (`/shared/schemas`, `/shared/fixtures`) let each person build against fixtures without depending on the others' endpoints being live yet.

---

## 9. Pitch / Market Narrative (external claims — not verifiable from code, use with citation)

These are business-framing claims from the pitch deck, included here for completeness, but they describe market context, not the codebase — cite sources before reusing:
- 50–70% of total HMI lifecycle effort goes into creating/maintaining static screens (industry-wide claim).
- Distribution precedent: Schneider Electric Exchange marketplace (~half a million EcoStruxure sites); comparable AI-vendor precedents cited: Senseye, Predictive Layer.
- Positioning: not "no one does generative UI" (that's false — it's a known pattern in consumer/web software) but specifically "no one has brought it to air-gapped, safety-critical industrial HMI."
