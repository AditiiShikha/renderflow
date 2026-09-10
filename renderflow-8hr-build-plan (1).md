# RenderFlow — 8-Hour Build Plan (3-Person Parallel Track)

## How this avoids conflicts
Everything below is **contract-first**: the exact JSON shapes and endpoints are frozen in Phase 0, before anyone writes feature code. Each person builds against those contracts using the fixture files below — nobody waits on anyone else's actual implementation until Phase 2. File ownership is split so no two people ever edit the same file (no merge conflicts either).

## The Night Before
Do these before hour zero, not during it — Phase 0's 30 minutes is for contracts, not troubleshooting.
- **Person B:** install Ollama and run `ollama pull phi3` on your actual hackathon laptop, then do one real dry run — send a sample prompt through your planned prompt template and confirm you get back valid JSON. Venue Wi-Fi is frequently congested; a 2.3GB pull that takes 5 minutes at home can take 40+ minutes there. The dry run also tells you, before the clock starts, whether you're opening Phase 1 on Plan A or already on Plan B (see Person B's section below) — better to know that at home than discover it at hour 3.
- **Everyone:** clone the empty scaffold repo and confirm `npm install` works on your own machine, so Phase 0 isn't spent debugging Node versions instead of freezing contracts.

## Timeline
| Phase | Time | Who |
|---|---|---|
| 0 — Contract lock-in | 0:00 – 0:30 | All 3, together |
| 1 — Parallel build | 0:30 – 6:00 | Solo, in parallel |
| 2 — Integration | 6:00 – 7:00 | All 3, together |
| 3 — Demo polish | 7:00 – 8:00 | All 3, together |

**Biggest risk in this plan:** local LLM inference (Person B — see that section for the setup and the checkpoint rule). It's isolated behind the `generate-screen` interface, so whatever happens with it, nobody else's work is affected.

## Repo structure (locked in Phase 0, nobody touches another person's folder after)
```
/renderflow
  /backend
    server.js              <- minimal, mounts routers + CORS (written once, Phase 0)
    /db                     <- Person A only
    /ingestion              <- Person A only
    /ai-router               <- Person B only
    /routes
      context.routes.js     <- Person A only
      generate.routes.js    <- Person B only
  /frontend                 <- Person C only
    /src/components
    /src/widgets
    /src/hooks
  /shared
    /schemas                <- frozen after Phase 0
    /fixtures                <- frozen after Phase 0
```

## Phase 0 — Shared Contracts (30 min, all three together)
These are already drafted below — spend the 30 min reviewing/tweaking, not inventing from scratch, then treat them as frozen.

**Also lock in during this half hour:** write the shared `server.js` — mount the two route files and **enable CORS** (`app.use(cors())`) for the React dev server's origin. It's a 2-minute task now; skipped, it turns into a confused 20 minutes in Phase 2 when Person C's fetch calls silently fail with no useful error.

**Tag**
```json
{ "id": "pump3_temp", "name": "Pump 3 Temperature", "unit": "°C",
  "min": 0, "max": 120, "warnThreshold": 85, "critThreshold": 100,
  "assetId": "pump_3", "category": "temperature" }
```

**Asset hierarchy** (2 levels max — line → asset)
```json
{ "id": "line_1", "name": "Packaging Line 1",
  "assets": [
    { "id": "pump_3", "name": "Pump 3", "tagIds": ["pump3_temp", "pump3_pressure"] }
  ]}
```

**Alarm event**
```json
{ "id": "alarm_042", "tagId": "pump3_temp", "severity": "critical",
  "message": "Pump 3 temperature exceeded critical threshold",
  "timestamp": "2026-09-10T10:15:00Z", "active": true }
```

**Widget types** (fixed set — do not add more mid-build)
| Type | Props |
|---|---|
| `gauge` | tag, size |
| `trend` | tag, window_seconds, size |
| `numeric_card` | tag |
| `alarm_banner` | tags[] |
| `table` | tags[] |
| `toggle` | tag, label |

**Size buckets — locked pixel values, not a guess for Person C:**
- Grid: 4 columns, 260px each, 16px gutter
- `small` = 1 column (260px)
- `medium` = 2 columns (536px)
- `large` = 4 columns, full width (1096px)
- Fixed row height: 220px per widget regardless of size, so the grid stays predictable once the real spec arrives in Phase 2

**`POST /api/generate-screen` — request**
```json
{ "trigger": { "type": "prompt", "text": "show me pump 3 status" } }
```
```json
{ "trigger": { "type": "alarm", "alarmId": "alarm_042" } }
```

**`POST /api/generate-screen` — response**
```json
{
  "title": "Pump 3 Overview",
  "layout": "grid",
  "trigger": { "type": "alarm", "alarmId": "alarm_042" },
  "widgets": [
    { "type": "gauge", "size": "medium", "tag": "pump3_temp",
      "reason": "Shown because alarm_042 (temperature exceeded critical threshold) is active on Pump 3" },
    { "type": "trend", "size": "large", "tag": "pump3_pressure", "window_seconds": 60,
      "reason": "Pressure trend for Pump 3, the same asset as the active alarm" },
    { "type": "alarm_banner", "tags": ["pump3_temp"],
      "reason": "alarm_042 is currently active and critical" }
  ]
}
```
`reason` is the explainability-badge text — every widget must carry one, **and it must name the actual tag or alarm involved, never a generic phrase.** "Directly implicated in the triggering alarm" tells a judge nothing when they're reading it off the screen live; "active because alarm_042 is critical on Pump 3" is the version that actually sells the explainability pitch. Bake this into Person B's system prompt with a good/bad example pair, not just the schema.

**Other endpoints**
| Endpoint | Method | Returns |
|---|---|---|
| `/api/context` | GET | `{ "tags": [...], "hierarchy": [...] }` |
| `/api/alarms` | GET | `[ {alarm}, ... ]` (active alarms) |
| `/api/telemetry` | GET | `{ "pump3_temp": 91.2, ... }` (live snapshot) |

**Fixture files** — write these into `/shared/fixtures/` during Phase 0; everyone develops against these until Phase 2:
- `context.json` — one sample line, 2-3 assets, 6-10 tags, matching the schema above
- `alarms.json` — 2-3 sample alarms, one active/critical
- `screen-spec-example.json` — the example response above, so Person C can build the renderer with no backend running

## Phase 1 — Parallel Build (5.5 hrs)

### Person A — Data Layer
**Owns:** `/backend/db`, `/backend/ingestion`, `prisma/schema.prisma`, `context.routes.js`
**Builds:** `GET /api/context`, `GET /api/alarms`, `GET /api/telemetry`

1. Prisma + **SQLite** for the build (not Postgres) — identical Prisma code either way, near-zero setup time, swap the provider string to Postgres in one line afterward if you want the pitch story to match exactly
2. Schema: `Tag`, `Asset`, `Line`, `Alarm` tables mirroring the contracts above
3. Seed script that loads `context.json` and `alarms.json` into the DB
4. Telemetry simulator: interval loop, sine wave + noise per tag, occasionally crosses `critThreshold` → flips an `Alarm` row to `active: true`
5. Implement the 3 GET endpoints — response shape must match the contract exactly

**Done when:** `curl localhost:3001/api/context` (and the other two) return data matching the contract. Zero dependency on B or C.

### Person B — AI Router
**Owns:** `/backend/ai-router`, `generate.routes.js`
**Builds:** `POST /api/generate-screen`

**0. This should already be done — see "The Night Before" above.** If you're reading this at the venue with no model pulled yet, start now in the background while Phase 0's contract discussion happens, but know you're already starting behind:
```
curl -fsSL https://ollama.com/install.sh | sh   # or `brew install ollama` on Mac
ollama serve &
ollama pull phi3
```
Use **Phi-3-mini**, not Llama 3 8B or Mistral 7B, for the actual build — it's already on your listed stack, it's roughly half the download size (~2.3GB vs ~4-5GB), and it's the only one of the three with a realistic shot at low-latency inference on laptop hardware during a live demo. Venue Wi-Fi is the real risk here, not model quality — plan around that.

1. System prompt: fixed widget enum + full tag list (read from `/shared/fixtures/context.json` while developing solo) + the exact output schema, enforced via tool-calling/JSON mode
2. **Pass `format: "json"` in the Ollama request.** It forces syntactically valid JSON output. It won't guarantee your schema is followed, but it kills the most common small-model failure mode — trailing prose before/after the JSON — for free.
3. Validation layer: every `tag` and `type` in the model's response must exist in the tag list/widget enum, else auto-retry once with the error appended to the prompt
4. Two trigger handlers: `prompt` → pass text straight through; `alarm` → look up the alarm (fixture, or Person A's `/api/alarms` once live), build a "diagnostic view" prompt from its message + implicated tag
5. Every widget in the output must include a `reason` string

**Plan B — build this too, don't skip it.** Small local models can still fail validation repeatedly even with JSON mode on. Inside `generate-screen`, if the LLM fails validation twice, fall back to a deterministic keyword match: scan the prompt text against tag/asset names (e.g. "pump 3" → `assetId: pump_3` → one gauge + one trend per tag on that asset) and return that instead of an error. This guarantees the demo never visibly breaks, and it's legitimate engineering, not a hack — a real product would want this same graceful-degradation path.

**Checkpoint at 3:00 into Phase 1 (roughly the halfway point):** if local inference still isn't reliably producing valid specs by then, stop debugging it and lean on the Plan B fallback for the demo instead. If your night-before dry run already failed, don't wait for this checkpoint — start Phase 1 building the Plan B path first and treat local inference as a stretch goal you return to if time allows. Either way, the `POST /api/generate-screen` interface doesn't change, so this decision doesn't touch Person A or C's work at all.

**Done when:** `POST /api/generate-screen` against the fixture context returns a valid spec for one sample prompt and one sample alarm, verified with curl/Postman. No frontend needed to test this.

### Person C — Frontend
**Owns:** everything in `/frontend`

1. Build all 6 widget components against `screen-spec-example.json` (hardcoded locally) — get the whole UI looking finished before any real API call exists
2. `WidgetRegistry` + `ScreenCanvas`: maps `widget.type` → component, CSS grid using the locked size-bucket pixel values above, unknown type renders a warning chip instead of crashing
3. Explainability badge: small icon per widget, tooltip shows `widget.reason`
4. `PromptBar`: text input + mic button (Web Speech API), plus a dev toggle between "use fixture" and "call real API" so this stays fully decoupled until Phase 2
5. Dark theme, industrial alarm colors (green/amber/red), fade-in transition on new screen render
6. **Loading state that sells the wait:** Phi-3 inference will likely take 5-10s. Don't show a blank screen or a plain spinner — show 2-3 skeleton placeholder cards immediately on submit, then fade the real widgets in one at a time (~150ms stagger) as the response resolves, with each explainability badge appearing just after its widget. Framed right, that delay reads as "the AI reasoning through it" and reinforces the explainability pitch instead of looking like lag.

**Done when:** the app looks fully finished running entirely off the fixture file, before touching the real backend at all.

## Phase 2 — Integration (1 hr, all together)
1. Person C flips the dev toggle to call the real `/api/generate-screen` and `/api/context`
2. Run 4-5 real prompts + 1-2 simulated alarms end to end
3. Fix any contract mismatches — should be small, since everyone built to the frozen spec

## Phase 3 — Demo Polish (1 hr, all together)
1. Lock in your 3-4 demo prompts and run each once so they're warm/cached
2. Record a 60-second backup video of the full flow working
3. Rehearse pitch timing against the poster's narrative
4. Do a final pass on the pitch materials themselves for placeholder content (e.g. team member names in the idea doc) — a flawless build can still lose points to an unfinished slide

## Pre-Demo Health Check (run this right before you go on stage — separate from Phase 3 rehearsal)
Laptops sleep, ports get reused, the Ollama daemon can silently die overnight. Run this immediately before you present, not just once during rehearsal:
```bash
curl -s localhost:3001/api/context   | head -c 200
curl -s localhost:3001/api/alarms    | head -c 200
curl -s localhost:3001/api/telemetry | head -c 200
curl -s -X POST localhost:3001/api/generate-screen \
  -H "Content-Type: application/json" \
  -d '{"trigger":{"type":"prompt","text":"show me pump 3 status"}}' | head -c 300
```
All four should return real data, not connection errors or empty bodies. If `ollama serve` isn't running, `ollama pull` won't save you at this point — restart it (`ollama serve &`) and re-run the last command before you walk up.
