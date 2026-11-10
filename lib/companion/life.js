import { nowIso } from './state.js';

const MAX_DIARY = 500;
const MAX_DREAMS = 100;

export function createLife(state, { hippocampus, emotion, health, dreamLlm = null }) {
  function focusSet(text) {
    state.data.focus = { text: String(text ?? '').trim(), updatedAt: nowIso() };
    state.save();
    return state.data.focus;
  }

  function focusGet() {
    return state.data.focus;
  }

  function diaryWrite(text, mood = null) {
    const value = String(text ?? '').trim();
    if (!value) throw new Error('diary text is required');
    const item = { id: `d-${Date.now().toString(36)}`, text: value, mood, at: nowIso() };
    state.data.diary.items.push(item);
    if (state.data.diary.items.length > MAX_DIARY) state.data.diary.items.splice(0, state.data.diary.items.length - MAX_DIARY);
    state.save();
    return item;
  }

  function diaryList(limit = 10) {
    return state.data.diary.items.slice(-Math.max(1, Math.min(MAX_DIARY, limit))).reverse();
  }

  function dreamGenerate() {
    const recent = [
      ...state.data.context.slice(-2).map((item) => item.text),
      ...state.data.hippo2.slice(-2).map((item) => item.text),
      ...state.data.diary.items.slice(-2).map((item) => item.text),
    ].filter(Boolean);
    const emotions = state.data.emotionEvents.slice(-4).flatMap((item) => item.emotions.map((e) => e.name || e));
    const pieces = recent.length ? recent : ['一片很安静的海', '没有写完的句子'];
    const text = `梦里，${pieces.join('；')}。${emotions.length ? `空气里有${[...new Set(emotions)].join('、')}的味道。` : '醒来时只记得一点温度。'}`;
    const item = { id: `dream-${Date.now().toString(36)}`, text, at: nowIso(), sourceCount: recent.length };
    state.data.dream.items.push(item);
    if (state.data.dream.items.length > MAX_DREAMS) state.data.dream.items.splice(0, state.data.dream.items.length - MAX_DREAMS);
    state.save();
    return item;
  }

  function dreamList(limit = 5) {
    return state.data.dream.items.slice(-Math.max(1, Math.min(MAX_DREAMS, limit))).reverse();
  }

  async function dreamGenerateLlm() {
    const memories = [
      ...state.data.context.slice(-2).map((item) => item.text),
      ...state.data.hippo2.slice(-2).map((item) => item.text),
      ...state.data.diary.items.slice(-2).map((item) => item.text),
    ].filter(Boolean);
    const emotions = state.data.emotionEvents.slice(-4).flatMap((item) => item.emotions.map((e) => e.name || e));
    const text = await dreamLlm?.generate?.({ memories, emotions, focus: state.data.focus.text });
    if (!text) return dreamGenerate();
    const item = { id: `dream-${Date.now().toString(36)}`, text, at: nowIso(), sourceCount: memories.length, llm: true };
    state.data.dream.items.push(item);
    if (state.data.dream.items.length > MAX_DREAMS) state.data.dream.items.splice(0, state.data.dream.items.length - MAX_DREAMS);
    state.save();
    return item;
  }

  function timelineTouch() {
    const now = Date.now();
    const last = state.data.timeline.lastSeenAt ? Date.parse(state.data.timeline.lastSeenAt) : now;
    const gap = Math.max(0, now - last);
    if (gap > 6 * 3600000) state.data.timeline.sessions += 1;
    state.data.timeline.lastGapMs = gap;
    state.data.timeline.lastSeenAt = new Date(now).toISOString();
    if (gap > 7 * 86400000) state.data.timeline.nostalgia = { at: nowIso(), gapMs: gap };
    state.save();
    return state.data.timeline;
  }

  async function sleepRun() {
    const purged = hippocampus.purge();
    const affect = emotion.recompute({ force: true });
    const report = health ? await health.check() : null;
    const dream = dreamGenerate();
    const entry = {
      at: nowIso(),
      purged,
      health: report?.score ?? null,
      dream: dream.id,
      affectTargets: Object.keys(affect.targets ?? {}).length,
      queue: state.data.queue.length,
    };
    state.data.sleep.lastAt = entry.at;
    state.data.sleep.reports.push(entry);
    if (state.data.sleep.reports.length > 30) state.data.sleep.reports.splice(0, state.data.sleep.reports.length - 30);
    timelineTouch();
    state.save();
    return entry;
  }

  function privacyForget(kind, id) {
    if (kind === 'diary') {
      const before = state.data.diary.items.length;
      state.data.diary.items = state.data.diary.items.filter((item) => item.id !== id);
      state.save();
      return { removed: before - state.data.diary.items.length };
    }
    if (kind === 'dream') {
      const before = state.data.dream.items.length;
      state.data.dream.items = state.data.dream.items.filter((item) => item.id !== id);
      state.save();
      return { removed: before - state.data.dream.items.length };
    }
    throw new Error('kind must be diary/dream');
  }

  return { focusSet, focusGet, diaryWrite, diaryList, dreamGenerate, dreamGenerateLlm, dreamList, timelineTouch, sleepRun, privacyForget };
}
