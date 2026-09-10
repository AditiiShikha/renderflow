const express = require('express');
const router = express.Router();

// Owned by Person B. Do not edit outside of Person B's branch.
// Implements POST /api/generate-screen per /shared/schemas/screen-spec.schema.json.
//
// Request:  { "trigger": { "type": "prompt", "text": "..." } }
//        or { "trigger": { "type": "alarm", "alarmId": "..." } }
// Response: { title, layout, trigger, widgets: [ { type, ...props, reason }, ... ] }
//
// Until this is implemented, develop against /shared/fixtures/screen-spec-example.json.

router.post('/generate-screen', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet — Person B owns POST /api/generate-screen.' });
});

module.exports = router;
