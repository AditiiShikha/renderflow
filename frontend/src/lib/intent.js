// Frontend-only guard in front of the prompt trigger. The backend always
// answers a prompt with *some* screen — the LLM path happily hallucinates a
// plausible dashboard for irrelevant text (it still passes validate.js,
// since that only checks tag/reason correctness, not relevance), and the
// deterministic fallback silently defaults to the first fixture asset when
// no keyword matches. Neither path has a "reject this" case, so irrelevant
// input is caught here instead, before it ever reaches the backend.

const GREETING_PATTERNS = [
  /^(hi|hey|hello|yo|sup|howdy)\b/,
  /^good\s*(morning|afternoon|evening|night)\b/,
  /^(what'?s up|how are you|how'?s it going)\b/,
  /^(thanks|thank you|thx|ok|okay|cool|lol|haha)\b/,
  /^(bye|goodbye|see ya)\b/,
  /^test(ing)?$/,
];

const OPERATIONAL_WORDS = [
  'status', 'alarm', 'alert', 'diagnostic', 'diagnostics', 'trend', 'gauge',
  'reading', 'level', 'pressure', 'temperature', 'temp', 'vibration', 'speed',
  'fault', 'issue', 'problem', 'warning', 'critical', 'screen', 'dashboard',
  'monitor', 'check', 'show', 'view', 'display', 'overview', 'report', 'data',
];

function operationalVocabulary(context) {
  const words = new Set(OPERATIONAL_WORDS);
  (context.hierarchy || []).forEach((line) => {
    line.assets.forEach((asset) => {
      asset.name.toLowerCase().split(/\s+/).forEach((w) => words.add(w));
      words.add(asset.id.replace(/_/g, ' ').toLowerCase());
    });
  });
  Object.values(context.tagsById || {}).forEach((tag) => {
    tag.name.toLowerCase().split(/\s+/).forEach((w) => words.add(w));
    if (tag.category) words.add(tag.category.toLowerCase());
  });
  return words;
}

// Returns 'irrelevant' | 'ambiguous' | 'operational'.
export function classifyPromptIntent(text, context) {
  const normalized = text.trim().toLowerCase().replace(/[^a-z0-9\s']/g, '').trim();

  if (GREETING_PATTERNS.some((re) => re.test(normalized))) {
    return 'irrelevant';
  }

  const vocabulary = operationalVocabulary(context);
  const words = normalized.split(/\s+/).filter(Boolean);

  const hasOperationalWord = words.some((w) => vocabulary.has(w));
  const hasOperationalPhrase = !hasOperationalWord
    && Array.from(vocabulary).some((v) => v.length > 3 && normalized.includes(v));

  if (hasOperationalWord || hasOperationalPhrase) return 'operational';
  if (words.length <= 2) return 'irrelevant';
  return 'ambiguous';
}
