const fs = require('fs');
const path = require('path');

// Reads from the frozen fixtures while Person A's real endpoints are still
// stubs. Swap these two reads for `fetch('/api/context')` / `fetch('/api/alarms')`
// once Person A's endpoints are live — nothing else in ai-router needs to change.
const CONTEXT_PATH = path.join(__dirname, '..', '..', 'shared', 'fixtures', 'context.json');
const ALARMS_PATH = path.join(__dirname, '..', '..', 'shared', 'fixtures', 'alarms.json');

function getContext() {
  return JSON.parse(fs.readFileSync(CONTEXT_PATH, 'utf8'));
}

function getAlarms() {
  return JSON.parse(fs.readFileSync(ALARMS_PATH, 'utf8'));
}

// Composed lookup structures shared by prompt-template, validate, and fallback.
function getIndex() {
  const { tags, hierarchy } = getContext();
  const alarms = getAlarms();

  const tagsById = {};
  tags.forEach((tag) => {
    tagsById[tag.id] = tag;
  });

  const assetByTagId = {};
  hierarchy.forEach((line) => {
    line.assets.forEach((asset) => {
      asset.tagIds.forEach((tagId) => {
        assetByTagId[tagId] = asset;
      });
    });
  });

  return {
    tags,
    tagIds: tags.map((tag) => tag.id),
    tagsById,
    hierarchy,
    assetByTagId,
    alarms,
  };
}

module.exports = { getContext, getAlarms, getIndex };
