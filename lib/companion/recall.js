export function tokens(text) {
  const value = String(text ?? '').toLowerCase();
  const out = new Set();
  for (const word of value.match(/[a-z0-9_]+/g) ?? []) if (word.length > 1) out.add(word);
  const han = value.match(/[\u4e00-\u9fff]+/g) ?? [];
  for (const run of han) {
    if (run.length === 1) out.add(run);
    for (let i = 0; i < run.length - 1; i += 1) out.add(run.slice(i, i + 2));
  }
  for (const run of han) if (run.length <= 4) out.add(run);
  return out;
}

export function rankDocs(query, corpus, { limit = 8 } = {}) {
  const q = [...tokens(query)];
  if (q.length === 0) return [];
  const docs = corpus.map((doc) => {
    const tokensList = [...tokens(`${doc.id ?? ''} ${doc.text ?? ''}`)];
    const tf = new Map();
    for (const token of tokensList) tf.set(token, (tf.get(token) ?? 0) + 1);
    return { doc, tf, len: Math.max(1, tokensList.length) };
  });
  const df = new Map();
  for (const { tf } of docs) {
    for (const token of tf.keys()) df.set(token, (df.get(token) ?? 0) + 1);
  }
  const avgLen = docs.reduce((sum, item) => sum + item.len, 0) / Math.max(1, docs.length);
  const k1 = 1.2;
  const b = 0.75;
  const results = [];
  for (const { doc, tf, len } of docs) {
    let score = 0;
    for (const token of q) {
      const frequency = tf.get(token) ?? 0;
      if (!frequency) continue;
      const idf = Math.log(1 + (docs.length - (df.get(token) ?? 0) + 0.5) / ((df.get(token) ?? 0) + 0.5));
      score += idf * (frequency * (k1 + 1)) / (frequency + k1 * (1 - b + b * (len / Math.max(1, avgLen))));
    }
    if (score > 0) results.push({ ...doc, score: Math.round(score * 1000) / 1000 });
  }
  results.sort((a, b) => b.score - a.score || String(a.source).localeCompare(String(b.source)));
  return results.slice(0, Math.max(1, Math.min(50, limit)));
}

export function createRecall(state, { extraDocs = null } = {}) {
  function docs() {
    const out = [];
    const push = (source, id, text) => {
      if (text) out.push({ source, id, text: String(text) });
    };
    for (const area of ['hippo1', 'hippo2', 'context']) {
      for (const item of state.data[area]) push(area, item.id, item.text);
    }
    for (const item of state.data.verify) push('verify', item.id, item.text);
    for (const item of state.data.judgments) push('judgment', item.id, item.text);
    for (const item of state.data.emotionEvents) push('emotion', item.id, item.text);
    for (const item of state.data.diary.items) push('diary', item.id, item.text);
    for (const item of state.data.dream.items) push('dream', item.id, item.text);
    if (typeof extraDocs === 'function') {
      try {
        for (const item of extraDocs() ?? []) push(item.source || 'memory', item.id || '', item.text || item.content || item.title || '');
      } catch {
        /* optional corpus failure must not break local recall */
      }
    }
    return out;
  }

  function recall(query, { limit = 8 } = {}) {
    const top = rankDocs(query, docs(), { limit });
    state.data.recall.queries.push({ query: String(query ?? ''), at: new Date().toISOString(), hits: top.length });
    if (state.data.recall.queries.length > 100) state.data.recall.queries.splice(0, state.data.recall.queries.length - 100);
    state.save();
    return top;
  }

  return { recall, docs };
}
