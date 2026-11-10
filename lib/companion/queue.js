import { hashText, nowIso } from './state.js';

const MAX_QUEUE = 200;

export function createQueue(state) {
  function add(text, source = 'manual') {
    const value = String(text ?? '').trim();
    if (!value) return null;
    const hash = hashText(value);
    const existing = state.data.queue.find((item) => item.hash === hash);
    if (existing) return { ...existing, duplicate: true };
    const item = { id: `q-${Date.now().toString(36)}`, text: value, source, hash, at: nowIso() };
    state.data.queue.push(item);
    if (state.data.queue.length > MAX_QUEUE) state.data.queue.splice(0, state.data.queue.length - MAX_QUEUE);
    state.save();
    return item;
  }

  function list(limit = 50) {
    return state.data.queue.slice(-Math.max(1, Math.min(MAX_QUEUE, limit))).reverse();
  }

  function drain(limit = 50) {
    const count = Math.max(1, Math.min(MAX_QUEUE, limit));
    const items = state.data.queue.splice(0, count);
    state.save();
    return items;
  }

  return { add, list, drain, size: () => state.data.queue.length };
}
