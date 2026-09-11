// Real backend client — replaces frontend/react-export/src/data/specs.js's
// mockGenerateScreen and the hardcoded tag dictionary. Talks to the existing,
// frozen backend contracts only; no request/response shape invented here.
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

async function getJSON(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// GET /api/context -> { tags: [...], hierarchy: [...] }
export function fetchContext() {
  return getJSON('/api/context');
}

// GET /api/telemetry -> { "<tagId>": <number>, ... }
export function fetchTelemetry() {
  return getJSON('/api/telemetry');
}

// GET /api/alarms -> [ {alarm}, ... ] (active alarms only)
export function fetchAlarms() {
  return getJSON('/api/alarms');
}

// POST /api/generate-screen
// trigger: { type: 'prompt', text } | { type: 'alarm', alarmId }
// Returns { spec } on success or { error } on failure — callers don't need
// to know whether the backend responded with a real LLM-generated spec or
// its own deterministic fallback; that's the backend's concern, not ours.
export async function generateScreen(trigger) {
  try {
    const res = await fetch(`${API_BASE}/api/generate-screen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      return { error: (body && body.error) || `Screen generation failed (${res.status})` };
    }
    return { spec: body };
  } catch (err) {
    return { error: 'Could not reach the backend. Is it running?' };
  }
}
