const contextSource = require('./context-source');
const { buildSystemPrompt, buildUserPrompt, buildRetryPrompt } = require('./prompt-template');
const { generateStructured } = require('./ollama-client');
const { validateScreenSpec } = require('./validate');
const { buildFallbackSpec } = require('./fallback');
const { buildGenerationSchema } = require('./generation-schema');
const { dedupeWidgets } = require('./normalize');

function buildValidationContext(trigger, context) {
  return {
    tagIds: context.tagIds,
    tagsById: context.tagsById,
    alarmId: trigger.type === 'alarm' ? trigger.alarmId : undefined,
  };
}

// Attempts the LLM path (1 try + 1 retry with validation errors appended),
// falling back to the deterministic Plan B path on repeated validation
// failure or if Ollama itself is unreachable. Either path returns the same
// { title, layout, trigger, widgets } shape.
async function generateScreen(trigger) {
  const context = contextSource.getIndex();
  const validationContext = buildValidationContext(trigger, context);
  const schema = buildGenerationSchema();

  let usedFallback = false;
  let ollamaError = null;
  let result;

  try {
    const systemPrompt = buildSystemPrompt(context);
    const basePrompt = buildUserPrompt(trigger, context);

    let attemptPrompt = basePrompt;
    let validation = { valid: false, errors: ['no attempt made'] };

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const candidate = await generateStructured(systemPrompt, attemptPrompt, schema);
      validation = validateScreenSpec(candidate, validationContext);
      if (validation.valid) {
        result = candidate;
        break;
      }
      attemptPrompt = buildRetryPrompt(basePrompt, validation.errors);
    }

    if (!validation.valid) {
      throw new Error(`LLM output failed validation twice: ${validation.errors.join('; ')}`);
    }
  } catch (err) {
    ollamaError = err.message;
    usedFallback = true;
    result = buildFallbackSpec(trigger, context);
  }

  // Normalization runs after validity is already decided (above) — it only
  // ever prunes duplicate widgets from an already-valid list, so it cannot
  // affect the retry/fallback decision or turn a valid spec into an invalid
  // one. It's a no-op on fallback.js's output, which never duplicates.
  const spec = {
    title: result.title,
    layout: 'grid',
    trigger,
    widgets: dedupeWidgets(result.widgets),
  };

  return { spec, usedFallback, ollamaError };
}

module.exports = { generateScreen };
