# RenderFlow

RenderFlow is an AI-generated operator screen builder for industrial
telemetry. A user types a prompt (or an alarm fires) and the backend returns
a JSON "screen spec" — a title, a grid layout, and a list of widgets, each
carrying an explainability `reason` naming the actual tag or alarm behind it.
The frontend renders that spec live, with no per-screen frontend code.

This repo is the **shared foundation** built during Phase 0 of the
[8-hour build plan](./renderflow-8hr-build-plan%20(1).md). It contains the
frozen contracts, fixtures, and empty-but-mountable scaffolding that Person
A, Person B, and Person C each build on independently during Phase 1.

## Install

```bash
# from the repo root — installs the backend (Express, CORS, Prisma)
npm install

# frontend has its own package.json (React, Vite)
cd frontend && npm install
```

## Run

**Backend** (port **3001**):

```bash
npm run dev        # from repo root
```

**Frontend** (Vite dev server, port 5173):

```bash
cd frontend && npm run dev
```

CORS is already enabled on the backend for the frontend dev server's origin.

## Project structure

```
renderflow/
├── backend/
│   ├── server.js              Express app: CORS, JSON body parsing, mounts routers
│   ├── db/                    Person A — Prisma client + queries
│   ├── ingestion/             Person A — seed script + telemetry simulator
│   ├── ai-router/             Person B — Ollama/Phi-3 client, prompt templates, validation
│   └── routes/
│       ├── context.routes.js  Person A — GET /api/context, /api/alarms, /api/telemetry
│       └── generate.routes.js Person B — POST /api/generate-screen
├── frontend/                  Person C — React app (Vite)
│   └── src/
│       ├── components/        ScreenCanvas, PromptBar, explainability badge
│       ├── widgets/            The 6 widget components + WidgetRegistry
│       └── hooks/
├── shared/
│   ├── schemas/                JSON Schema for every contract (frozen)
│   └── fixtures/                Sample data matching the schemas (frozen)
├── prisma/
│   └── schema.prisma            SQLite datasource, no models yet
├── package.json                Backend dependencies + scripts
└── .gitignore
```

## Shared contracts

Defined in [`/shared/schemas`](./shared/schemas) and illustrated with real
data in [`/shared/fixtures`](./shared/fixtures):

- **Tag** — `id, name, unit, min, max, warnThreshold, critThreshold, assetId, category`
- **Asset hierarchy** — two levels max, `line -> asset`, each asset carrying `tagIds`
- **Alarm** — `id, tagId, severity, message, timestamp, active`
- **Widget types** (fixed set, do not add more): `gauge`, `trend`,
  `numeric_card`, `alarm_banner`, `table`, `toggle` — see
  `widget.schema.json` for each type's exact props
- **`POST /api/generate-screen`** — request takes a `trigger`
  (`{type: "prompt", text}` or `{type: "alarm", alarmId}`); response is
  `{ title, layout, trigger, widgets }`, and every widget carries a `reason`
  string naming the actual tag or alarm involved
- **`GET /api/context`** → `{ tags: [...], hierarchy: [...] }`
- **`GET /api/alarms`** → `[ {alarm}, ... ]`
- **`GET /api/telemetry`** → `{ "<tagId>": <number>, ... }`

Fixtures: `shared/fixtures/context.json`, `shared/fixtures/alarms.json`,
`shared/fixtures/screen-spec-example.json`. Develop against these — they let
Person B build without a database and Person C build without a backend.

## Ownership

| Person | Owns | Builds |
|---|---|---|
| **A — Data Layer** | `backend/db`, `backend/ingestion`, `prisma/schema.prisma`, `backend/routes/context.routes.js` | `GET /api/context`, `GET /api/alarms`, `GET /api/telemetry` |
| **B — AI Router** | `backend/ai-router`, `backend/routes/generate.routes.js` | `POST /api/generate-screen` |
| **C — Frontend** | everything in `frontend/` | widgets, `WidgetRegistry`, `ScreenCanvas`, `PromptBar`, styling, explainability badges |

### Rules

1. **Shared contracts are frozen after Phase 0.** Nothing in `/shared/schemas`
   or `/shared/fixtures`, the widget type list, or the `POST
   /api/generate-screen` shape changes without all three people agreeing —
   Phase 1 work depends on these not moving.
2. **Don't edit another person's owned files.** `backend/db`,
   `backend/ingestion`, and `context.routes.js` are Person A's; `backend/ai-router`
   and `generate.routes.js` are Person B's; everything under `frontend/` is
   Person C's. `backend/server.js`, `prisma/schema.prisma`'s datasource block,
   and everything under `/shared` are common ground touched only by
   agreement.

## Status

The routes in `context.routes.js` and `generate.routes.js` currently return
`501 Not Implemented` — that's expected until Person A and Person B fill
them in. The Prisma schema has a datasource but no models yet — Person A
adds `Tag`, `Asset`, `Line`, and `Alarm`. The frontend renders a placeholder
page — Person C replaces it with the real UI.
