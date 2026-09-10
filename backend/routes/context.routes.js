const express = require('express');
const router = express.Router();

const prisma = require('../db/client');
const { getTelemetrySnapshot } = require('../ingestion/simulator');

// Owned by Person A. Do not edit outside of Person A's branch.
// Implements the read side of the data layer described in /shared/schemas:
//   GET /api/context    -> { tags: [...], hierarchy: [...] }
//   GET /api/alarms     -> [ {alarm}, ... ]   (active alarms)
//   GET /api/telemetry  -> { "<tagId>": <number>, ... }

router.get('/context', async (req, res) => {
  try {
    const [lines, tags] = await Promise.all([
      prisma.line.findMany({
        include: { assets: { include: { tags: true } } },
      }),
      prisma.tag.findMany(),
    ]);

    const hierarchy = lines.map((line) => ({
      id: line.id,
      name: line.name,
      assets: line.assets.map((asset) => ({
        id: asset.id,
        name: asset.name,
        tagIds: asset.tags.map((tag) => tag.id),
      })),
    }));

    const tagList = tags.map(({ id, name, unit, min, max, warnThreshold, critThreshold, assetId, category }) => ({
      id,
      name,
      unit,
      min,
      max,
      warnThreshold,
      critThreshold,
      assetId,
      category,
    }));

    res.json({ tags: tagList, hierarchy });
  } catch (err) {
    console.error('GET /api/context failed:', err);
    res.status(500).json({ error: 'Failed to load context.' });
  }
});

router.get('/alarms', async (req, res) => {
  try {
    const alarms = await prisma.alarm.findMany({ where: { active: true } });

    res.json(
      alarms.map(({ id, tagId, severity, message, timestamp, active }) => ({
        id,
        tagId,
        severity,
        message,
        timestamp: timestamp.toISOString(),
        active,
      }))
    );
  } catch (err) {
    console.error('GET /api/alarms failed:', err);
    res.status(500).json({ error: 'Failed to load alarms.' });
  }
});

router.get('/telemetry', (req, res) => {
  res.json(getTelemetrySnapshot());
});

module.exports = router;
