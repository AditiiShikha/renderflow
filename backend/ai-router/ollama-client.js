const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'phi3';
// Low, near-deterministic temperature — this is structured-output generation
// against a fixed schema, not creative text, so we want the model picking
// its highest-confidence token rather than sampling broadly.
const OLLAMA_TEMPERATURE = process.env.OLLAMA_TEMPERATURE ? Number(process.env.OLLAMA_TEMPERATURE) : 0.1;

// Calls local Ollama with `format` set to a JSON Schema object — Ollama
// 0.34.0 compiles this into a grammar that constrains decoding, so the
// model structurally cannot emit a malformed key (e.g. "type0") or mix
// props from two different widget types. This does NOT constrain field
// *values* (e.g. whether a tag id is real, or an alarm id sneaks into a
// tag field) — validate.js still runs against every result for that.
async function generateStructured(systemPrompt, userPrompt, schema) {
  const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      system: systemPrompt,
      prompt: userPrompt,
      format: schema,
      stream: false,
      options: {
        temperature: OLLAMA_TEMPERATURE,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Ollama request failed: ${response.status} ${response.statusText} ${body}`.trim());
  }

  const body = await response.json();
  return JSON.parse(body.response);
}

module.exports = { generateStructured };
