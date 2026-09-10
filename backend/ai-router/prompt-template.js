// Builds the prompts sent to Phi-3. The model is only asked to produce
// { title, widgets } — "layout" only ever has one valid value and "trigger"
// is already known to us, so the orchestrator (index.js) fills those in
// itself rather than trusting a small model to echo them back correctly.
//
// The request is sent with Ollama's structured-output `format` (see
// generation-schema.js), which grammar-constrains the JSON shape — exact
// keys, allowed widget types, and required props per type are therefore
// guaranteed by the decoder itself and don't need to be spelled out here.
// What's left for the prompt is purely semantic content the schema cannot
// constrain: which tag ids are real, and what makes a reason meaningful.

const { MAX_WIDGETS } = require('./generation-schema');

function buildSystemPrompt(context) {
  const tagList = context.tags
    .map((t) => `- ${t.id}: "${t.name}" (${t.unit}, warn>=${t.warnThreshold}, crit>=${t.critThreshold}, asset=${t.assetId}, category=${t.category})`)
    .join('\n');

  return `You are the screen-generation engine for RenderFlow, an industrial operator dashboard.

You are filling in a "title" and a list of "widgets" describing a screen. Focus on CONTENT — the exact JSON shape is enforced separately.

For every widget's "tag" (or "tags") value, use ONLY an id copied verbatim from this list — never invent one, and never use an alarm id (like "alarm_042") as a tag value; alarm ids only ever belong inside "reason" text:
${tagList}

"reason" is shown to the operator as an explainability badge. It MUST literally contain the tag id, the tag's name, or the alarm id it is about.
GOOD reason: "active because alarm_042 is critical on Pump 3 Temperature"
BAD reason: "shows current status" / "relevant to this request"

Keep the widget list focused: only widgets that actually answer the request (at most ${MAX_WIDGETS}), not one for every tag that exists.`;
}

function buildUserPrompt(trigger, context) {
  if (trigger.type === 'prompt') {
    return `Operator request: "${trigger.text}"\n\nBuild a screen responding to this request.`;
  }

  if (trigger.type === 'alarm') {
    const alarm = context.alarms.find((a) => a.id === trigger.alarmId);
    if (!alarm) {
      throw new Error(`Unknown alarmId: "${trigger.alarmId}"`);
    }
    const tag = context.tagsById[alarm.tagId];
    const asset = context.assetByTagId[alarm.tagId];
    const otherTagId = asset && asset.tagIds.find((id) => id !== alarm.tagId);

    const suggestion = otherTagId
      ? `a gauge for "${alarm.tagId}" and a trend for "${otherTagId}" (the other tag on the same asset)`
      : `a gauge and a trend for "${alarm.tagId}"`;

    return `An alarm is active: "${alarm.message}" (id: ${alarm.id}, severity: ${alarm.severity}) on tag "${alarm.tagId}"` +
      `${tag ? ` (${tag.name})` : ''}, part of asset "${asset ? asset.name : alarm.tagId}".\n\n` +
      `Build a small diagnostic view for this one alarm — do not repeat the same widget. Use exactly ONE alarm_banner, ` +
      `with "tags": ["${alarm.tagId}"] exactly — do NOT put "${alarm.id}" inside any "tag" or "tags" field, "${alarm.id}" ` +
      `is an alarm id and only ever belongs in "reason" text, never in a tag field. Add 1-2 other widgets that add real ` +
      `diagnostic value, for example ${suggestion}.`;
  }

  throw new Error(`Unknown trigger type: "${trigger.type}"`);
}

function buildRetryPrompt(originalPrompt, errors) {
  return `${originalPrompt}\n\nYour previous JSON response was INVALID. Return a corrected JSON object with the exact same shape, fixing these problems:\n${errors.map((e) => `- ${e}`).join('\n')}`;
}

module.exports = { buildSystemPrompt, buildUserPrompt, buildRetryPrompt };
