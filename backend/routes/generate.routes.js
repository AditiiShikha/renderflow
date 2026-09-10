const express = require('express');
const router = express.Router();
const { generateScreen } = require('../ai-router');

// Owned by Person B. Do not edit outside of Person B's branch.
// Implements POST /api/generate-screen per /shared/schemas/screen-spec.schema.json.
//
// Request:  { "trigger": { "type": "prompt", "text": "..." } }
//        or { "trigger": { "type": "alarm", "alarmId": "..." } }
// Response: { title, layout, trigger, widgets: [ { type, ...props, reason }, ... ] }

router.post('/generate-screen', async (req, res) => {
  const { trigger } = req.body || {};

  if (!trigger || typeof trigger !== 'object') {
    return res.status(400).json({ error: '"trigger" is required in the request body' });
  }
  if (trigger.type === 'prompt' && typeof trigger.text !== 'string') {
    return res.status(400).json({ error: 'trigger.text is required when trigger.type is "prompt"' });
  }
  if (trigger.type === 'alarm' && typeof trigger.alarmId !== 'string') {
    return res.status(400).json({ error: 'trigger.alarmId is required when trigger.type is "alarm"' });
  }
  if (trigger.type !== 'prompt' && trigger.type !== 'alarm') {
    return res.status(400).json({ error: 'trigger.type must be "prompt" or "alarm"' });
  }

  try {
    const { spec, usedFallback, ollamaError } = await generateScreen(trigger);
    if (usedFallback) {
      res.set('X-RenderFlow-Fallback', 'true');
      if (ollamaError) {
        res.set('X-RenderFlow-Fallback-Reason', ollamaError.slice(0, 200));
      }
    }
    res.json(spec);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate screen spec', detail: err.message });
  }
});

module.exports = router;
