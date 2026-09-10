// Post-generation normalization: collapses widgets that reference the same
// tag(s) with the same type down to one, so a model that repeats itself
// (e.g. the same alarm_banner up to the generation schema's widget cap)
// doesn't turn into a repetitive screen. Runs on an already-validated
// widget list — it only ever removes elements, so it cannot turn a valid
// spec into an invalid one, and it never touches validation itself.

function widgetKey(widget) {
  if (Array.isArray(widget.tags)) {
    return `${widget.type}:${[...widget.tags].sort().join(',')}`;
  }
  if (typeof widget.tag === 'string') {
    return `${widget.type}:${widget.tag}`;
  }
  return `${widget.type}:${JSON.stringify(widget)}`;
}

function dedupeWidgets(widgets) {
  const seen = new Set();
  const result = [];
  for (const widget of widgets) {
    const key = widgetKey(widget);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(widget);
  }
  return result;
}

module.exports = { dedupeWidgets };
