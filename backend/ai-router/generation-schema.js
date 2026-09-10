// Internal, ai-router-only JSON Schema for Ollama's structured-output
// `format` parameter — this is NOT the shared /shared/schemas/screen-spec
// contract, and must never be confused with it or used to replace it.
//
// Why a separate schema: the shared widget.schema.json expresses "required
// props depend on widget type" via allOf + if/then, and screen-spec.schema.json
// links to it via cross-file $ref (trigger.schema.json, widget.schema.json).
// Ollama's structured-output support constrains the decoder with a grammar
// compiled from the schema, and empirically (tested directly against this
// Ollama 0.34.0 instance) it supports `oneOf`, `const`, `enum`, `type`,
// `required`, `additionalProperties`, and array `items`/`minItems`/`maxItems`
// — but allOf/if-then conditionals aren't a constrained-decoding primitive,
// and there is nothing for a cross-file $ref to resolve against here. So
// each widget type is expressed as its own branch of a `oneOf`, discriminated
// by a `const` "type" value, which is directly equivalent in effect to the
// shared schema's per-type requirements but expressible as a single flat,
// self-contained document.
//
// Deliberately NOT constrained here: tag id existence (`tag`/`tags` are
// typed as plain strings, not an enum of real tag ids). An enum would make
// the grammar structurally reject invented tag ids, but it also requires
// duplicating the tag-id list into every widget-type branch, and testing
// showed that materially increases generation time without a clear latency
// win over the alternative ($defs/$ref reuse tested the same way and did not
// help). Tag existence, alarm-id-used-as-tag, and reason quality remain
// semantic checks owned entirely by validate.js, per the instruction not to
// assume schema enforcement replaces semantic validation.
//
// `widgets` is bounded (1–MAX_WIDGETS): testing surfaced a real failure mode
// where an unconstrained array let the model fall into a degenerate
// low-temperature repetition loop (85 near-identical widgets in one run).
// Bounding array length is a legitimate structural constraint and directly
// closes that failure mode regardless of its root cause.

const SIZE_ENUM = ['small', 'medium', 'large'];
const MAX_WIDGETS = 6;

function widgetVariant(type, extraProps, requiredExtra) {
  return {
    type: 'object',
    properties: { type: { const: type }, ...extraProps },
    required: ['type', ...requiredExtra],
    additionalProperties: false,
  };
}

function buildGenerationSchema() {
  return {
    type: 'object',
    properties: {
      title: { type: 'string' },
      widgets: {
        type: 'array',
        minItems: 1,
        maxItems: MAX_WIDGETS,
        items: {
          oneOf: [
            widgetVariant(
              'gauge',
              { tag: { type: 'string' }, size: { type: 'string', enum: SIZE_ENUM }, reason: { type: 'string' } },
              ['tag', 'size', 'reason']
            ),
            widgetVariant(
              'trend',
              {
                tag: { type: 'string' },
                window_seconds: { type: 'number' },
                size: { type: 'string', enum: SIZE_ENUM },
                reason: { type: 'string' },
              },
              ['tag', 'window_seconds', 'size', 'reason']
            ),
            widgetVariant('numeric_card', { tag: { type: 'string' }, reason: { type: 'string' } }, ['tag', 'reason']),
            widgetVariant(
              'alarm_banner',
              { tags: { type: 'array', items: { type: 'string' } }, reason: { type: 'string' } },
              ['tags', 'reason']
            ),
            widgetVariant(
              'table',
              { tags: { type: 'array', items: { type: 'string' } }, reason: { type: 'string' } },
              ['tags', 'reason']
            ),
            widgetVariant(
              'toggle',
              { tag: { type: 'string' }, label: { type: 'string' }, reason: { type: 'string' } },
              ['tag', 'label', 'reason']
            ),
          ],
        },
      },
    },
    required: ['title', 'widgets'],
    additionalProperties: false,
  };
}

module.exports = { buildGenerationSchema, MAX_WIDGETS };
