// Validates the model's raw { title, widgets } output against the frozen
// widget contract in /shared/schemas/widget.schema.json — every type/tag
// must exist, every type's required props must be present, and every
// "reason" must actually name the tag/alarm it's attached to.

const WIDGET_TYPES = ['gauge', 'trend', 'numeric_card', 'alarm_banner', 'table', 'toggle'];

const REQUIRED_PROPS = {
  gauge: ['tag', 'size'],
  trend: ['tag', 'window_seconds', 'size'],
  numeric_card: ['tag'],
  alarm_banner: ['tags'],
  table: ['tags'],
  toggle: ['tag', 'label'],
};

const SIZES = ['small', 'medium', 'large'];

function widgetTagRefs(widget) {
  if (Array.isArray(widget.tags)) return widget.tags;
  if (typeof widget.tag === 'string') return [widget.tag];
  return [];
}

function reasonMentionsSubject(widget, reason, validationContext) {
  const lower = reason.toLowerCase();
  for (const tagId of widgetTagRefs(widget)) {
    if (lower.includes(tagId.toLowerCase())) return true;
    const tag = validationContext.tagsById[tagId];
    if (tag && lower.includes(tag.name.toLowerCase())) return true;
  }
  if (validationContext.alarmId && lower.includes(validationContext.alarmId.toLowerCase())) return true;
  return false;
}

// validationContext: { tagIds: string[], tagsById: object, alarmId?: string }
function validateScreenSpec(spec, validationContext) {
  const errors = [];

  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
    return { valid: false, errors: ['response must be a JSON object'] };
  }

  if (typeof spec.title !== 'string' || !spec.title.trim()) {
    errors.push('"title" must be a non-empty string');
  }

  if (!Array.isArray(spec.widgets) || spec.widgets.length === 0) {
    errors.push('"widgets" must be a non-empty array');
    return { valid: false, errors };
  }

  spec.widgets.forEach((widget, i) => {
    if (!widget || typeof widget !== 'object') {
      errors.push(`widgets[${i}] must be an object`);
      return;
    }

    if (!WIDGET_TYPES.includes(widget.type)) {
      errors.push(`widgets[${i}].type "${widget.type}" is not one of ${WIDGET_TYPES.join(', ')}`);
      return;
    }

    REQUIRED_PROPS[widget.type].forEach((prop) => {
      if (widget[prop] === undefined) {
        errors.push(`widgets[${i}] (${widget.type}) is missing required prop "${prop}"`);
      }
    });

    if ('size' in widget && !SIZES.includes(widget.size)) {
      errors.push(`widgets[${i}].size "${widget.size}" must be one of ${SIZES.join(', ')}`);
    }

    const refs = widgetTagRefs(widget);
    if (refs.length === 0) {
      errors.push(`widgets[${i}] (${widget.type}) references no tag`);
    }
    refs.forEach((tagId) => {
      if (!validationContext.tagIds.includes(tagId)) {
        errors.push(`widgets[${i}] references unknown tag "${tagId}"`);
      }
    });

    if (typeof widget.reason !== 'string' || !widget.reason.trim()) {
      errors.push(`widgets[${i}] is missing a non-empty "reason"`);
    } else if (!reasonMentionsSubject(widget, widget.reason, validationContext)) {
      errors.push(`widgets[${i}].reason must name the actual tag or alarm involved (got: "${widget.reason}")`);
    }
  });

  return { valid: errors.length === 0, errors };
}

module.exports = { validateScreenSpec, WIDGET_TYPES, REQUIRED_PROPS };
