import { nowIso } from './state.js';

export function createVerify(state) {
  function add({ text, kind = 'claim', conflictWith = '', source = 'judge' }) {
    const value = String(text ?? '').trim();
    if (!value) throw new Error('text is required');
    const existing = state.data.verify.find((item) => item.status === 'pending' && item.text === value);
    if (existing) return existing;
    const item = {
      id: `v-${Date.now().toString(36)}`,
      text: value,
      kind,
      conflictWith: String(conflictWith ?? ''),
      source,
      status: 'pending',
      at: nowIso(),
      resolvedAt: null,
      patch: null,
    };
    state.data.verify.push(item);
    state.save();
    return item;
  }

  function list({ status = 'pending' } = {}) {
    return state.data.verify.filter((item) => !status || status === 'all' || item.status === status);
  }

  function pending(limit = 3) {
    return list({ status: 'pending' }).slice(-limit);
  }

  function resolve(id, status, patch = null) {
    if (!['confirmed', 'rejected', 'modified'].includes(status)) throw new Error('status must be confirmed/rejected/modified');
    const item = state.data.verify.find((entry) => entry.id === id);
    if (!item) throw new Error('verify item not found');
    item.status = status;
    item.resolvedAt = nowIso();
    item.patch = patch && typeof patch === 'object' ? patch : null;
    state.save();
    return item;
  }

  return { add, list, pending, resolve };
}
