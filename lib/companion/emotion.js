import { hashText, nowIso } from './state.js';

export const EMOTIONS = {
  喜: ['开心', '高兴', '快乐', '笑', '欢喜', '兴奋'],
  怒: ['生气', '愤怒', '火大', '恼火', '气死'],
  哀: ['难过', '伤心', '哭', '悲伤', '失落', '委屈'],
  惧: ['害怕', '恐惧', '担心', '不安', '怕'],
  惊: ['惊讶', '震惊', '意外', '没想到'],
  厌: ['讨厌', '烦', '恶心', '腻', '不想'],
  爱: ['爱', '喜欢', '心动', '在乎', '珍惜', '宝贝'],
  恨: ['恨', '怨恨', '憎恶', '不可原谅'],
  愧: ['愧疚', '对不起', '抱歉', '自责', '内疚'],
  羞: ['害羞', '不好意思', '脸红', '羞'],
  妒: ['嫉妒', '吃醋', '酸', '羡慕'],
  傲: ['骄傲', '自豪', '得意', '棒'],
  怜: ['心疼', '可怜', '怜惜', '舍不得'],
  盼: ['期待', '希望', '盼', '想见', '等你'],
  安: ['安心', '放心', '踏实', '安稳', '安全'],
  焦: ['焦虑', '着急', '急', '压力', '紧张'],
  疲: ['累', '疲惫', '困', '没力气', '撑不住'],
  暖: ['温暖', '暖', '贴心', '温柔', '被照顾'],
  孤: ['孤独', '孤单', '一个人', '寂寞'],
  敬: ['尊敬', '佩服', '敬', '敬意'],
  鄙: ['鄙视', '看不起', '瞧不起'],
  悔: ['后悔', '悔', '早知', '不该'],
  念: ['想念', '思念', '惦记', '怀念', '想'],
  甜: ['甜', '幸福', '美好', '喜欢得', '心里甜甜'],
};

const MAX_WORDS = 300;

function candidateWords(text) {
  const value = String(text ?? '');
  const runs = value.match(/[\u4e00-\u9fff]{2,6}/g) ?? [];
  return [...new Set(runs)].slice(0, 20);
}

export function createEmotion(state) {
  function ensureLexicon() {
    for (const [name, words] of Object.entries(EMOTIONS)) {
      const current = state.data.lexicon[name];
      if (!current) state.data.lexicon[name] = words.map((word) => ({ word, priority: 1 }));
    }
  }

  function detect(text) {
    ensureLexicon();
    const value = String(text ?? '');
    const scores = {};
    for (const [name, entries] of Object.entries(state.data.lexicon)) {
      let score = 0;
      for (const entry of entries) if (entry.word && value.includes(entry.word)) score += Number(entry.priority) || 1;
      if (score > 0) scores[name] = score;
    }
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return { text: value, emotions: ranked.map(([name, score]) => ({ name, score })), top: ranked[0]?.[0] ?? null };
  }

  function learn(text) {
    ensureLexicon();
    const known = new Set(Object.values(state.data.lexicon).flat().map((entry) => entry.word));
    const candidates = candidateWords(text).filter((word) => !known.has(word)).slice(0, 12);
    for (const word of candidates) {
      const existing = state.data.lexiconCandidates.find((entry) => entry.word === word);
      if (existing) {
        existing.count += 1;
        existing.lastAt = nowIso();
      } else {
        state.data.lexiconCandidates.push({ word, count: 1, lastAt: nowIso() });
      }
    }
    if (state.data.lexiconCandidates.length > 1000) {
      state.data.lexiconCandidates.sort((a, b) => b.count - a.count);
      state.data.lexiconCandidates.splice(800);
    }
    state.save();
    return candidates;
  }

  function grow(name, text, { max = 12 } = {}) {
    if (!EMOTIONS[name]) throw new Error(`unknown emotion: ${name}`);
    const candidates = learn(text);
    let added = 0;
    for (const word of candidates.slice(0, Math.max(1, Math.min(50, max)))) {
      const result = addword(name, [word], 1);
      added += result.added;
      if (added >= max) break;
    }
    return { added, total: state.data.lexicon[name].length, candidates: candidates.length };
  }

  function addword(name, words, priority = 1) {
    ensureLexicon();
    if (!EMOTIONS[name]) throw new Error(`unknown emotion: ${name}`);
    const bucket = state.data.lexicon[name];
    let added = 0;
    for (const word of Array.isArray(words) ? words : [words]) {
      const value = String(word ?? '').trim();
      if (!value) continue;
      if (bucket.some((entry) => entry.word === value)) continue;
      if (bucket.length >= MAX_WORDS) break;
      bucket.push({ word: value, priority: Number(priority) || 1 });
      added += 1;
    }
    state.save();
    return { added, total: bucket.length };
  }

  function tag(eventId, emotions) {
    const event = state.data.emotionEvents.find((item) => item.id === eventId);
    if (!event) throw new Error('emotion event not found');
    event.emotions = (Array.isArray(emotions) ? emotions : [emotions]).filter(Boolean);
    state.save();
    return event;
  }

  function record(text, { refType = '', refId = '', target = '用户' } = {}) {
    const result = detect(text);
    if (result.emotions.length === 0) return { ...result, event: null };
    const event = {
      id: `e-${Date.now().toString(36)}`,
      text: String(text ?? ''),
      hash: hashText(text),
      emotions: result.emotions,
      refType,
      refId,
      target,
      at: nowIso(),
    };
    state.data.emotionEvents.push(event);
    if (state.data.emotionEvents.length > 300) state.data.emotionEvents.splice(0, state.data.emotionEvents.length - 300);
    addAffect(target, result.emotions);
    state.save();
    return { ...result, event };
  }

  function addAffect(target, emotions) {
    const name = String(target || '用户');
    const bucket = state.data.affect.targets[name] ?? { scores: {}, count: 0, updatedAt: nowIso(), attitude: null };
    for (const emotion of emotions) {
      bucket.scores[emotion.name] = (bucket.scores[emotion.name] ?? 0) + emotion.score;
    }
    bucket.count += 1;
    bucket.updatedAt = nowIso();
    state.data.affect.targets[name] = bucket;
    state.data.affect.log.push({ target: name, emotions, at: nowIso() });
    if (state.data.affect.log.length > 300) state.data.affect.log.splice(0, state.data.affect.log.length - 300);
  }

  function affectStatus() {
    return state.data.affect;
  }

  function recordAffect(target, name, weight = 1) {
    if (!EMOTIONS[name]) throw new Error(`unknown emotion: ${name}`);
    addAffect(target, [{ name, score: Number(weight) || 1 }]);
    state.save();
    return state.data.affect.targets[String(target || '用户')];
  }

  function recompute({ force = false } = {}) {
    const at = state.data.affect.updatedAt;
    if (!force && at && Date.now() - Date.parse(at) < 3 * 86400000) {
      return { skipped: true, at, targets: state.data.affect.targets };
    }
    for (const [target, bucket] of Object.entries(state.data.affect.targets)) {
      const entries = Object.entries(bucket.scores || {}).sort((a, b) => b[1] - a[1]);
      const total = entries.reduce((sum, [, value]) => sum + value, 0);
      bucket.ratios = Object.fromEntries(entries.map(([name, value]) => [name, total ? Math.round((value / total) * 100) : 0]));
      bucket.attitude = entries.slice(0, 2).map(([name]) => name).join('') || null;
      if (entries.length >= 2) bucket.attitude = `又${entries[0][0]}又${entries[1][0]}`;
      bucket.updatedAt = nowIso();
    }
    state.data.affect.updatedAt = nowIso();
    state.save();
    return { skipped: false, at: state.data.affect.updatedAt, targets: state.data.affect.targets };
  }

  function text() {
    ensureLexicon();
    const targets = Object.entries(state.data.affect.targets)
      .sort((a, b) => (b[1].count ?? 0) - (a[1].count ?? 0))
      .slice(0, 3)
      .map(([name, bucket]) => `${name}：${bucket.attitude || '未形成态度'}（${bucket.count} 次）`);
    return targets.length ? targets.join('；') : '（情感库还没有形成态度）';
  }

  function lexiconStatus() {
    ensureLexicon();
    const counts = Object.fromEntries(Object.entries(state.data.lexicon).map(([name, entries]) => [name, entries.length]));
    const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
    const capacity = Object.keys(counts).length * MAX_WORDS;
    return { total, target: 7200, capacity, free: capacity - total, categories: Object.keys(counts).length, counts };
  }

  return { detect, learn, grow, addword, tag, record, recordAffect, recompute, affectStatus, text, lexiconStatus };
}
