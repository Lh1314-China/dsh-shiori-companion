import { hashText, nowIso } from './state.js';

const MAX_AREAS = 3;

function validateId(value) {
  const id = String(value ?? '').trim();
  if (!/^[a-z0-9][a-z0-9-]{1,31}$/.test(id)) throw new Error('custom area id 只能是小写字母/数字/短横线，2–32 位');
  return id;
}

export function createCustomAreas(state, { features = null } = {}) {
  function allowed() {
    if (typeof features !== 'function') return true;
    try {
      return features()?.['features.custom_areas'] === true;
    } catch {
      return false;
    }
  }

  function create({ id, name, ttlDays = 7, maxEntries = 60 } = {}) {
    if (!allowed()) throw new Error('features.custom_areas 未开；先打开开关');
    const key = validateId(id);
    if (Object.keys(state.data.customAreas).length >= MAX_AREAS && !state.data.customAreas[key]) {
      throw new Error(`最多 ${MAX_AREAS} 个自定义区`);
    }
    state.data.customAreas[key] = {
      id: key,
      name: String(name ?? key),
      ttlDays: Math.max(0, Math.min(365, Number(ttlDays) || 0)),
      maxEntries: Math.max(1, Math.min(500, Number(maxEntries) || 60)),
      entries: state.data.customAreas[key]?.entries ?? [],
      createdAt: state.data.customAreas[key]?.createdAt ?? nowIso(),
    };
    state.save();
    return state.data.customAreas[key];
  }

  function feed(id, text, meta = {}) {
    if (!allowed()) throw new Error('features.custom_areas 未开；先打开开关');
    const key = validateId(id);
    const area = state.data.customAreas[key];
    if (!area) throw new Error('custom area not found');
    const value = String(text ?? '').trim();
    if (!value) return null;
    const hash = hashText(value);
    const existing = area.entries.find((item) => item.hash === hash);
    if (existing) return { ...existing, duplicate: true };
    const item = {
      id: `${key}-${Date.now().toString(36)}`,
      text: value,
      hash,
      source: meta.source ?? 'manual',
      at: nowIso(),
      expiresAt: area.ttlDays ? new Date(Date.now() + area.ttlDays * 86400000).toISOString() : null,
    };
    area.entries.push(item);
    if (area.entries.length > area.maxEntries) area.entries.splice(0, area.entries.length - area.maxEntries);
    state.save();
    return item;
  }

  function list(id, { includeExpired = false } = {}) {
    const area = state.data.customAreas[validateId(id)];
    if (!area) return [];
    if (includeExpired) return [...area.entries];
    const at = Date.now();
    return area.entries.filter((item) => !item.expiresAt || Date.parse(item.expiresAt) > at);
  }

  function purge() {
    let removed = 0;
    for (const area of Object.values(state.data.customAreas)) {
      const before = area.entries.length;
      area.entries = area.entries.filter((item) => !item.expiresAt || Date.parse(item.expiresAt) > Date.now());
      removed += before - area.entries.length;
    }
    if (removed) state.save();
    return removed;
  }

  function overview() {
    purge();
    return Object.values(state.data.customAreas).map((area) => ({
      id: area.id,
      name: area.name,
      count: area.entries.length,
      chars: area.entries.reduce((sum, item) => sum + item.text.length, 0),
      ttlDays: area.ttlDays,
      maxEntries: area.maxEntries,
    }));
  }

  function forget(id, entryId) {
    if (!allowed()) throw new Error('features.custom_areas 未开；先打开开关');
    const key = validateId(id);
    const area = state.data.customAreas[key];
    if (!area) throw new Error('custom area not found');
    const before = area.entries.length;
    area.entries = area.entries.filter((item) => item.id !== entryId);
    if (area.entries.length !== before) state.save();
    return { removed: before - area.entries.length };
  }

  return { create, feed, list, forget, purge, overview, allowed };
}
