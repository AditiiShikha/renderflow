# backend/ai-router — owned by Person B

Ollama/Phi-3 integration for `POST /api/generate-screen` goes here:

- System prompt builder (widget enum + tag list from `/shared/fixtures/context.json`
  while developing solo, output schema from `/shared/schemas/screen-spec.schema.json`).
- Ollama client, requesting `format: "json"`.
- Validation layer: every `tag` and `type` in the model's response must exist
  in the tag list / widget enum, else auto-retry once with the error appended
  to the prompt.
- Trigger handlers for `prompt` and `alarm` trigger types.
- Plan B deterministic keyword-match fallback for when local inference fails
  validation twice.

Ollama itself is not part of this scaffold — install and pull `phi3` locally
per the plan's "Night Before" section.
