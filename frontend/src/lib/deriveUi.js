// Derives UI-only fields from real backend data. The backend's response
// contract stays exactly { title, layout, trigger, widgets } — nothing here
// is sent to or expected from the server; it replaces react-export's
// mock-only spec.key / assetLabel / contextChecklist fields, which the real
// /api/generate-screen response never provides.

export function widgetTagRefs(widget) {
  if (Array.isArray(widget.tags)) return widget.tags;
  if (typeof widget.tag === 'string') return [widget.tag];
  return [];
}

// Finds the asset that owns the first tag referenced anywhere in the spec's
// widgets, using the real /api/context hierarchy. Used for the machine
// schematic and the "PUMP 3" / "CONVEYOR 1" style label — replaces
// react-export's hardcoded `spec.key === 'pump_status'` checks.
export function resolveAsset(spec, hierarchy) {
  if (!spec || !Array.isArray(hierarchy)) return null;
  for (const widget of spec.widgets || []) {
    for (const tagId of widgetTagRefs(widget)) {
      for (const line of hierarchy) {
        const asset = line.assets.find((a) => a.tagIds.includes(tagId));
        if (asset) return asset;
      }
    }
  }
  return null;
}

// Stable identity for a trigger — used for history "currently viewing"
// highlighting and dedup. A UI-only concept, not part of the API contract.
export function triggerKey(trigger) {
  if (!trigger) return '';
  return trigger.type === 'alarm' ? `alarm:${trigger.alarmId}` : `prompt:${trigger.text}`;
}

// Generic, honest generation-overlay phases. These describe UI states only —
// they do not claim the backend performs any specific named step ("Temperature
// telemetry found", etc.) that we can't actually verify happened.
export const GENERATION_PHASES = ['Analyzing context', 'Selecting relevant machine data', 'Building operator view'];
