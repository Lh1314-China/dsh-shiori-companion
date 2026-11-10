import { nowIso } from './state.js';

const NEGATIONS = ['算不上', '谈不上', '并不', '未必', '恐怕不', '很难说', '不是', '没有', '不'];
const SUBJECT_WORDS = ['用户', '助手', '他', '她', '它', '昨天', '今天', '明天', '以前', '现在'];

export function createJudge(state) {
  function observe(text) {
    const value = String(text ?? '');
    const negation = NEGATIONS.filter((word) => value.includes(word));
    const subjects = SUBJECT_WORDS.filter((word) => value.includes(word));
    const timeShift = /昨天|今天|明天|以前|现在|后来|当时/.test(value);
    const observation = {
      id: `o-${Date.now().toString(36)}`,
      text: value,
      negation,
      subjects,
      timeShift,
      at: nowIso(),
    };
    state.data.observations.push(observation);
    if (state.data.observations.length > 300) state.data.observations.splice(0, state.data.observations.length - 300);
    state.save();
    return observation;
  }

  function replace({ candidate, existing = '', decision = 'create', reason = '' }) {
    const value = String(candidate ?? '').trim();
    if (!value) throw new Error('candidate is required');
    if (!['create', 'merge', 'update', 'supersede', 'ignore'].includes(decision)) {
      throw new Error('decision must be create/merge/update/supersede/ignore');
    }
    const item = {
      id: `r-${Date.now().toString(36)}`,
      candidate: value,
      existing: String(existing ?? ''),
      decision,
      reason: String(reason ?? ''),
      at: nowIso(),
    };
    state.data.decisions.push(item);
    if (state.data.decisions.length > 500) state.data.decisions.splice(0, state.data.decisions.length - 500);
    state.save();
    return item;
  }

  function feedback({ id = '', proposedLayer = '', finalLayer = '', reason = '' }) {
    if (!finalLayer) throw new Error('finalLayer is required');
    let item = id ? state.data.decisions.find((entry) => entry.id === id) : null;
    if (!item) {
      item = { id: `f-${Date.now().toString(36)}`, candidate: '', existing: '', decision: 'feedback', at: nowIso() };
      state.data.decisions.push(item);
    }
    item.proposedLayer = proposedLayer;
    item.finalLayer = finalLayer;
    item.feedbackReason = String(reason ?? '');
    item.feedbackAt = nowIso();
    state.save();
    return item;
  }

  function stats() {
    const judged = state.data.decisions.filter((item) => item.proposedLayer && item.finalLayer);
    const mismatched = judged.filter((item) => item.proposedLayer !== item.finalLayer);
    return {
      total: judged.length,
      mismatched: mismatched.length,
      rate: judged.length ? mismatched.length / judged.length : 0,
      byLayer: judged.reduce((out, item) => {
        out[item.proposedLayer] = out[item.proposedLayer] || { total: 0, mismatched: 0 };
        out[item.proposedLayer].total += 1;
        if (item.proposedLayer !== item.finalLayer) out[item.proposedLayer].mismatched += 1;
        return out;
      }, {}),
    };
  }

  function reflect() {
    const result = stats();
    return {
      ...result,
      needsCalibration: result.rate > 0.3,
      suggestion: result.rate > 0.3
        ? '某层改判率超过 30%，建议改判据/人设，不要硬套。'
        : '改判率在阈值内，继续观察。',
    };
  }

  function relate(from, to, reason = '') {
    if (!from || !to) throw new Error('from/to are required');
    const item = { id: `n-${Date.now().toString(36)}`, from: String(from), to: String(to), reason: String(reason), at: nowIso() };
    state.data.narrative.push(item);
    if (state.data.narrative.length > 500) state.data.narrative.splice(0, state.data.narrative.length - 500);
    state.save();
    return item;
  }

  function narrative(limit = 20) {
    return state.data.narrative.slice(-limit).reverse();
  }

  return { observe, replace, feedback, stats, reflect, relate, narrative };
}
