const express = require('express');
const router = express.Router();

// Owned by Person A. Do not edit outside of Person A's branch.
// Implements the read side of the data layer described in /shared/schemas
// and /shared/fixtures:
//   GET /api/context    -> { tags: [...], hierarchy: [...] }
//   GET /api/alarms     -> [ {alarm}, ... ]   (active alarms)
//   GET /api/telemetry  -> { "<tagId>": <number>, ... }
//
// Until this is implemented, develop against /shared/fixtures/context.json
// and /shared/fixtures/alarms.json.

router.get('/context', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet — Person A owns GET /api/context.' });
});

router.get('/alarms', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet — Person A owns GET /api/alarms.' });
});

router.get('/telemetry', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet — Person A owns GET /api/telemetry.' });
});

module.exports = router;
