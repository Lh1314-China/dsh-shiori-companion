import { hashText, nowIso } from './state.js';

export const AREA_DEFS = Object.freeze({
  hippo1: { name: '海马体环节1.0', ttlDays: 1, maxEntries: 80, injected: false },
  hippo2: { name: '海马体环节2.0', ttlDays: 7, maxEntries: 120, injected: false },
  context: { name: '语义思考区', ttlDays: 0, maxEntries: 20, injected: true, maxChars: 300 },
});

function expiresAt(area, at = Date.now()) {
  const def = AREA_DEFS[area];
  return def?.ttlDays ? new Date(at + def.ttlDays * 86400000).toISOString() : null;
}

export function createHippocampus(state, { coreChars = 12000 } = {}) {
  function purge() {
    const at = Date.now();
    let removed = 0;
    for (const area of ['hippo1', 'hippo2']) {
      const before = state.data[area].length;
      state.data[area] = state.data[area].filter((item) => !item.expiresAt || Date.parse(item.expiresAt) > at);
      removed += before - state.data[area].length;
    }
    const capacity = Math.max(1000, Math.floor(Number(coreChars) / 2));
    let total = state.data.context.reduce((sum, item) => sum + String(item.text ?? '').length, 0);
    while (state.data.context.length > AREA_DEFS.context.maxEntries || total > capacity) {
      const dropped = state.data.context.pop();
      if (!dropped) break;
      total -= String(dropped.text ?? '').length;
      removed += 1;
    }
    if (removed) state.save();
    return removed;
  }

  function feed(area, text, meta = {}) {
    const def = AREA_DEFS[area];
    if (!def) throw new Error(`unknown area: ${area}`);
    const value = String(text ?? '').trim();
    if (!value) return null;
    const hash = hashText(value);
    const bucket = state.data[area];
    const existing = bucket.find((item) => item.hash === hash);
    if (existing) return { ...existing, duplicate: true };
    const item = {
      id: `${area}-${Date.now().toString(36)}`,
      text: value,
      hash,
      source: meta.source ?? 'manual',
      score: Number.isFinite(meta.score) ? meta.score : null,
      at: nowIso(),
      expiresAt: expiresAt(area),
      ...(area === 'context' ? { verified: meta.verified === true } : {}),
    };
    bucket.push(item);
    if (bucket.length > def.maxEntries) bucket.splice(0, bucket.length - def.maxEntries);
    state.save();
    return item;
  }

  function list(area, { includeExpired = false } = {}) {
    const bucket = state.data[area];
    if (!Array.isArray(bucket)) return [];
    if (includeExpired) return [...bucket];
    const at = Date.now();
    return bucket.filter((item) => !item.expiresAt || Date.parse(item.expiresAt) > at);
  }

  function promote(from, to, id, { score = 0, force = false, verified = false } = {}) {
    if (!AREA_DEFS[from] || !AREA_DEFS[to]) throw new Error('unknown area');
    if (from === to) {
      const item = state.data[from].find((entry) => entry.id === id);
      if (!item) throw new Error('entry not found');
      item.verified = verified === true;
      item.score = Number(score) || item.score;
      state.save();
      return item;
    }
    const index = state.data[from].findIndex((entry) => entry.id === id);
    if (index < 0) throw new Error('entry not found');
    const item = state.data[from][index];
    if (!force && Number(score) < 6) {
      throw new Error(`self-score ${Number(score) || 0} < 6；用 force 才强推`);
    }
    state.data[from].splice(index, 1);
    const next = {
      ...item,
      id: `${to}-${Date.now().toString(36)}`,
      from,
      score: Number(score) || item.score || 0,
      verified: verified === true || item.verified === true,
      at: nowIso(),
      expiresAt: expiresAt(to),
    };
    state.data[to].push(next);
    state.save();
    return next;
  }

  function selfscore(text, { novel = 0.5, verified = 0 } = {}) {
    const value = String(text ?? '');
    const lengthScore = Math.min(4, Math.max(0, value.length / 60));
    const novelty = Math.max(0, Math.min(3, Number(novel) * 3));
    const verify = Math.max(0, Math.min(3, Number(verified) * 3));
    return Math.round(Math.min(10, lengthScore + novelty + verify));
  }

  function overview() {
    purge();
    return {
      coreChars,
      capacity: Math.max(1000, Math.floor(Number(coreChars) / 2)),
      areas: Object.fromEntries(Object.keys(AREA_DEFS).map((area) => [area, {
        ...AREA_DEFS[area],
        count: state.data[area].length,
        chars: state.data[area].reduce((sum, item) => sum + String(item.text ?? '').length, 0),
      }])),
    };
  }

  return { feed, list, promote, purge, selfscore, overview };
}
