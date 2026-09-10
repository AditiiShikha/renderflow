# Shared schemas — frozen after Phase 0

JSON Schema (draft-07) definitions of every contract in the RenderFlow plan.
Plain `.json` files with no runtime dependency, so both `backend` (CommonJS)
and `frontend` (ESM) can `import`/`require` and, if desired, validate against
them with a library such as `ajv`.

| File | Describes |
|---|---|
| `tag.schema.json` | A single `Tag` |
| `line.schema.json` | The two-level `Line -> Asset` hierarchy |
| `alarm.schema.json` | A single `Alarm` event |
| `widget.schema.json` | The fixed set of 6 widget types and their exact props |
| `trigger.schema.json` | The `prompt` / `alarm` trigger shapes |
| `generate-screen-request.schema.json` | Request body of `POST /api/generate-screen` |
| `screen-spec.schema.json` | Response body of `POST /api/generate-screen` |
| `context-response.schema.json` | Response body of `GET /api/context` |
| `telemetry-response.schema.json` | Response body of `GET /api/telemetry` |

Do not add fields, widget types, or endpoints here without all three
developers agreeing — these are locked in as of the end of Phase 0.
