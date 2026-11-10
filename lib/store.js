/**
 * Read-only view of shiori's on-disk memory plus this plugin's own writable
 * work-card and feature-switch files.
 */
import path from 'node:path';
import { existsSync, readdirSync } from 'node:fs';
import {
  FEATURE_KEYS,
  FEATURE_LABELS,
  byteSize,
  isInside,
  normalizeConfig,
  parseFrontMatter,
  readJsonResult,
  readTextOrNull,
  statOf,
  truncate,
  validateSparkId,
  validateTopicKey,
  writeJsonAtomic,
} from './config.js';

const now = () => new Date().toISOString();
const newWorkId = () => `work-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const DAY_MS = 24 * 60 * 60 * 1000;
const WORK_STAGNANT_MS = 7 * DAY_MS;
const WORK_COOLDOWN_MS = 7 * DAY_MS;

function fail(code, message) {
  return Object.assign(new Error(message), { code });
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function safeScope(value) {
  if (typeof value !== 'string') return null;
  const scope = value.trim();
  if (scope === 'global') return scope;
  if (!scope || scope.length > 128) return null;
  if (/[<>:"/\\|?*\u0000-\u001f]/.test(scope)) return null;
  if (scope === '.' || scope === '..' || scope.endsWith('.') || scope.endsWith(' ')) return null;
  return scope;
}

export function cardView(id, card) {
  const value = card && typeof card === 'object' ? card : {};
  return {
    id: asString(value.id, id),
    title: asString(value.title, '(untitled)'),
    summary: truncate(asString(value.summary) || asString(value.content), 180),
    contentPreview: truncate(asString(value.contentPreview) || asString(value.content), 260),
    state: asString(value.state, 'active'),
    vitality: asString(value.vitality, 'ephemeral'),
    triggers: asArray(value.triggers).map(String),
    entities: asArray(value.entities).map(String),
    links: asArray(value.links).length,
    createdAt: asString(value.createdAt) || null,
    updatedAt: asString(value.updatedAt) || null,
    archivedAt: asString(value.archivedAt) || null,
    hitCount: Number.isFinite(value.hitCount) ? value.hitCount : 0,
    useCount: Number.isFinite(value.useCount) ? value.useCount : 0,
  };
}

function topicView(key, text) {
  const { meta, body } = parseFrontMatter(text);
  return {
    key,
    title: asString(meta.title, key),
    summary: asString(meta.summary),
    updated: asString(meta.updated) || null,
    archivedAt: asString(meta.archivedAt) || null,
    chars: body.length,
    bytes: byteSize(text),
    body,
  };
}

export function createStore(rawConfig = {}) {
  const cfg = normalizeConfig(rawConfig);
  let migrated = false;

  /**
   * The companion contract says: shiori data is read-only, and this plugin
   * writes only under stateRoot/plus. Older builds wrote two files outside
   * that root; migrate them once by copying (never moving or deleting).
   */
  function ensureMigrated() {
    if (migrated) return;
    migrated = true;
    try {
      if (!existsSync(cfg.workFile) && existsSync(cfg.legacyWorkFile)) {
        const legacy = readJsonResult(cfg.legacyWorkFile);
        if (legacy.ok && legacy.value && typeof legacy.value === 'object') {
          writeJsonAtomic(cfg.workFile, legacy.value);
        }
      }
    } catch {
      /* migration is best-effort and must never break a read */
    }
    try {
      if (!existsSync(cfg.featuresFile) && existsSync(cfg.legacyFeaturesFile)) {
        const legacy = readJsonResult(cfg.legacyFeaturesFile);
        if (legacy.ok && legacy.value && typeof legacy.value === 'object') {
          const features = {};
          for (const key of FEATURE_KEYS) features[key] = legacy.value[key] === true;
          writeJsonAtomic(cfg.featuresFile, features);
        }
      }
    } catch {
      /* same */
    }
    try {
      if (!existsSync(cfg.archiveIndex) && existsSync(cfg.legacyArchiveIndex)) {
        const legacy = readJsonResult(cfg.legacyArchiveIndex);
        if (legacy.ok && legacy.value && typeof legacy.value === 'object') {
          writeJsonAtomic(cfg.archiveIndex, legacy.value);
        }
      }
    } catch {
      /* same */
    }
  }

  function scopeOf(value) {
    return safeScope(value) ?? cfg.scope;
  }

  function pathsFor(scope) {
    const root = cfg.dataRoot;
    return {
      persona: path.join(root, 'persona', `${scope}.md`),
      globalPersona: path.join(root, 'persona', 'global.md'),
      core: path.join(root, 'scopes', scope, 'core.md'),
      globalCore: path.join(root, 'scopes', 'global', 'core.md'),
      topics: path.join(root, 'scopes', scope, 'topics'),
      globalTopics: path.join(root, 'scopes', 'global', 'topics'),
      sparks: path.join(root, 'sparks', 'scopes', scope, 'sparks.json'),
      globalSparks: path.join(root, 'sparks', 'scopes', 'global', 'sparks.json'),
      journal: path.join(root, 'journal'),
    };
  }

  function readLayerFile(primary, fallback) {
    const text = readTextOrNull(primary);
    if (text !== null) return { text, file: primary, fallback: false };
    if (fallback !== primary) {
      const alt = readTextOrNull(fallback);
      if (alt !== null) return { text: alt, file: fallback, fallback: true };
    }
    return { text: '', file: primary, fallback: false };
  }

  function listScopes() {
    const found = new Set(['global']);
    for (const dir of [
      path.join(cfg.dataRoot, 'scopes'),
      path.join(cfg.dataRoot, 'sparks', 'scopes'),
    ]) {
      try {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          if (!entry.isDirectory()) continue;
          const scope = safeScope(entry.name);
          if (scope) found.add(scope);
        }
      } catch {
        /* a missing scope directory is just an empty list */
      }
    }
    return [...found].sort((a, b) => (a === 'global' ? -1 : b === 'global' ? 1 : a.localeCompare(b)));
  }

  function readSparkDb(scope) {
    const files = [pathsFor(scope).sparks];
    const global = pathsFor(scope).globalSparks;
    if (scope !== 'global') files.push(global);
    for (const file of files) {
      const result = readJsonResult(file);
      if (result.ok && result.value && typeof result.value === 'object') {
        return { db: result.value, file, error: null };
      }
      if (result.error) return { db: null, file, error: result.error };
    }
    return { db: null, file: files[0], error: null };
  }

  function readTopics(scope) {
    const primary = pathsFor(scope).topics;
    const fallback = pathsFor(scope).globalTopics;
    const dir = scope !== 'global' && !statOf(primary) && statOf(fallback) ? fallback : primary;
    const topics = [];
    try {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
        const key = entry.name.slice(0, -3);
        try {
          validateTopicKey(key);
          const text = readTextOrNull(path.join(dir, entry.name));
          if (text !== null) topics.push(topicView(key, text));
        } catch {
          /* an unreadable topic is skipped, never guessed */
        }
      }
    } catch {
      /* missing topics directory = no topics */
    }
    topics.sort((a, b) => a.key.localeCompare(b.key));
    return { dir, topics, fallback: scope !== 'global' && dir === fallback };
  }

  function readJournalInfo() {
    let count = 0;
    let latest = null;
    try {
      for (const entry of readdirSync(pathsFor(cfg.scope).journal, { withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
        count += 1;
        const stat = statOf(path.join(pathsFor(cfg.scope).journal, entry.name));
        if (stat && (!latest || stat.mtimeMs > latest.mtimeMs)) latest = stat;
      }
    } catch {
      /* no journal yet */
    }
    return { dir: pathsFor(cfg.scope).journal, count, latestAt: latest ? latest.mtime.toISOString() : null };
  }

  function readArchive() {
    ensureMigrated();
    const result = readJsonResult(cfg.archiveIndex);
    if (!result.ok || !result.value || typeof result.value !== 'object') {
      return { file: cfg.archiveIndex, cards: [], error: result.error };
    }
    return { file: cfg.archiveIndex, cards: asArray(result.value.cards), error: null };
  }

  function readFeatures() {
    ensureMigrated();
    const result = readJsonResult(cfg.featuresFile);
    const source = result.ok && result.value && typeof result.value === 'object' ? result.value : {};
    const features = {};
    for (const key of FEATURE_KEYS) features[key] = source[key] === true;
    return features;
  }

  function setFeature(key, value) {
    if (!FEATURE_KEYS.includes(key)) throw fail('INVALID_INPUT', `未知开关：${key}`);
    const features = readFeatures();
    features[key] = value === true;
    writeJsonAtomic(cfg.featuresFile, features);
    return features;
  }

  function loadWork() {
    ensureMigrated();
    const file = cfg.workFile;
    const result = readJsonResult(file);
    const cards = result.ok && result.value && typeof result.value === 'object' && result.value.cards
      && typeof result.value.cards === 'object'
      ? result.value.cards
      : {};
    return { file, cards, error: result.error };
  }

  function listWork() {
    const { cards } = loadWork();
    const at = Date.now();
    return Object.values(cards)
      .filter((card) => card && typeof card === 'object')
      .sort((a, b) => String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? '')))
      .map((card) => {
        const status = asString(card.status, 'active');
        const updatedMs = Date.parse(asString(card.updatedAt) || asString(card.startedAt));
        const effectiveStatus = status === 'active' && Number.isFinite(updatedMs) && at - updatedMs > WORK_STAGNANT_MS
          ? 'stagnated'
          : status;
        const endedMs = Date.parse(asString(card.endedAt));
        const coolingUntil = status === 'done' && Number.isFinite(endedMs)
          ? new Date(endedMs + WORK_COOLDOWN_MS).toISOString()
          : null;
        return {
          ...card,
          status,
          effectiveStatus,
          coolingUntil,
          steps: asArray(card.steps),
          decisions: asArray(card.decisions),
          artifacts: asArray(card.artifacts),
          wakeWords: asArray(card.wakeWords).map(String),
        };
      });
  }

  function startWork({ title, goal = '', wakeWords = [] } = {}) {
    const cleanTitle = asString(title).trim();
    if (!cleanTitle) throw fail('INVALID_INPUT', '工作卡标题不能为空');
    const { file, cards } = loadWork();
    const at = now();
    const card = {
      id: newWorkId(),
      title: cleanTitle.slice(0, 80),
      goal: asString(goal).slice(0, 500),
      status: 'active',
      startedAt: at,
      updatedAt: at,
      endedAt: null,
      steps: [],
      decisions: [],
      artifacts: [],
      wakeWords: asArray(wakeWords).slice(0, 12).map(String).filter(Boolean),
    };
    cards[card.id] = card;
    writeJsonAtomic(file, { cards });
    return card;
  }

  function updateWork({ id, note = '', kind = 'step' } = {}) {
    const cardId = asString(id).trim();
    if (!cardId) throw fail('INVALID_INPUT', 'update 需要工作卡 id');
    const { file, cards } = loadWork();
    const card = cards[cardId];
    if (!card) throw fail('NOT_FOUND', `没有这张工作卡：${cardId}`);
    if (card.status === 'done' || card.status === 'archived') {
      throw fail('INVALID_STATE', `工作卡已是 ${card.status}，不能再记过程`);
    }
    const entry = { at: now(), text: asString(note).slice(0, 500) };
    if (kind === 'decision') card.decisions = [...asArray(card.decisions), entry];
    else if (kind === 'artifact') card.artifacts = [...asArray(card.artifacts), entry];
    else card.steps = [...asArray(card.steps), entry];
    card.status = 'active';
    card.updatedAt = entry.at;
    writeJsonAtomic(file, { cards });
    return card;
  }

  function finishWork({ id, outcome = '', wakeWords = [] } = {}) {
    const cardId = asString(id).trim();
    if (!cardId) throw fail('INVALID_INPUT', 'finish 需要工作卡 id');
    const { file, cards } = loadWork();
    const card = cards[cardId];
    if (!card) throw fail('NOT_FOUND', `没有这张工作卡：${cardId}`);
    if (card.status === 'archived') throw fail('INVALID_STATE', '这张工作卡已经归档');
    if (card.status === 'done') return card;
    const at = now();
    card.status = 'done';
    card.endedAt = at;
    card.updatedAt = at;
    card.outcome = asString(outcome).slice(0, 500);
    card.wakeWords = [...new Set([
      ...asArray(card.wakeWords).map(String),
      ...asArray(wakeWords).map(String),
    ].filter(Boolean))].slice(0, 12);
    writeJsonAtomic(file, { cards });
    return card;
  }

  function archiveWork({ id, force = false } = {}) {
    const cardId = asString(id).trim();
    if (!cardId) throw fail('INVALID_INPUT', 'archive 需要工作卡 id');
    const { file, cards } = loadWork();
    const card = cards[cardId];
    if (!card) throw fail('NOT_FOUND', `没有这张工作卡：${cardId}`);
    if (card.status === 'archived') return card;
    if (card.status !== 'done') throw fail('INVALID_STATE', '只有 done 状态的工作卡才能归档');
    if (!asString(card.outcome).trim()) throw fail('INVALID_INPUT', '归档需要先写结果 outcome');
    if (asArray(card.wakeWords).length === 0) throw fail('INVALID_INPUT', '归档需要至少一个唤醒词');
    const endedMs = Date.parse(asString(card.endedAt));
    const readyAt = Number.isFinite(endedMs) ? endedMs + WORK_COOLDOWN_MS : 0;
    if (!force && Date.now() < readyAt) {
      throw Object.assign(fail('NOT_READY', `还在冷却，${new Date(readyAt).toISOString()} 后才能归档`), {
        details: { readyAt: new Date(readyAt).toISOString() },
      });
    }
    card.status = 'archived';
    card.archivedAt = now();
    card.updatedAt = card.archivedAt;
    writeJsonAtomic(file, { cards });
    return card;
  }

  function overview(scopeValue) {
    ensureMigrated();
    const scope = scopeOf(scopeValue);
    const p = pathsFor(scope);
    const diagnostics = [];

    const persona = readLayerFile(p.persona, p.globalPersona);
    const core = readLayerFile(p.core, p.globalCore);
    if (scope !== 'global' && core.fallback) diagnostics.push('当前 scope 没有自己的 core，显示的是 global 回退。');
    if (scope !== 'global' && persona.fallback) diagnostics.push('当前 scope 没有自己的人设卡，显示的是 global 回退。');

    const sparks = readSparkDb(scope);
    if (sparks.error) diagnostics.push(`火花库读取失败：${sparks.error}`);
    const cards = sparks.db && sparks.db.cards && typeof sparks.db.cards === 'object'
      ? Object.entries(sparks.db.cards).map(([id, card]) => cardView(id, card))
      : [];
    const active = cards.filter((card) => card.state === 'active');
    const retired = cards.filter((card) => card.state !== 'active');

    const topics = readTopics(scope);
    if (topics.fallback) diagnostics.push('当前 scope 没有自己的专题目录，显示的是 global 回退。');

    const archive = readArchive();
    if (archive.error) diagnostics.push(`归档索引读取失败：${archive.error}`);

    const work = listWork();
    const features = readFeatures();
    const journal = readJournalInfo();

    return {
      generatedAt: now(),
      scope,
      scopes: listScopes(),
      dataRoot: cfg.dataRoot,
      stateRoot: cfg.stateRoot,
      workFile: cfg.workFile,
      featuresFile: cfg.featuresFile,
      archiveIndex: cfg.archiveIndex,
      layers: {
        L0: {
          file: persona.file,
          chars: persona.text.length,
          bytes: byteSize(persona.text),
          budget: cfg.personaMaxChars,
          fallback: persona.fallback,
          present: persona.text.length > 0,
        },
        L1: {
          file: core.file,
          chars: core.text.length,
          bytes: byteSize(core.text),
          target: cfg.coreTargetChars,
          hard: cfg.coreHardChars,
          fallback: core.fallback,
          present: core.text.length > 0,
        },
        L2: {
          file: sparks.file,
          total: cards.length,
          active: active.length,
          retired: retired.length,
          schemaVersion: sparks.db?.schemaVersion ?? null,
          kind: sparks.db?.kind ?? null,
        },
        L3: {
          dir: topics.dir,
          count: topics.topics.length,
          topics: topics.topics.map(({ body, ...topic }) => topic),
        },
        journal,
      },
      sparks: { active, retired },
      work,
      archive: archive.cards,
      features,
      featureLabels: FEATURE_LABELS,
      diagnostics,
    };
  }

  function readSpark(id, scopeValue) {
    const sparkId = validateSparkId(id);
    const scope = scopeOf(scopeValue);
    const { db, file, error } = readSparkDb(scope);
    if (error) throw fail('INVALID_STATE', `火花库读取失败：${error}`);
    const card = db?.cards?.[sparkId];
    if (!card) throw fail('NOT_FOUND', `没有这张火花卡：${sparkId}`);
    return { ...card, file, scope };
  }

  function readTopic(key, scopeValue) {
    const topicKey = validateTopicKey(key);
    const scope = scopeOf(scopeValue);
    const scopeTopics = pathsFor(scope).topics;
    const globalTopics = pathsFor(scope).globalTopics;
    const candidates = scope === 'global'
      ? [{ file: path.join(scopeTopics, `${topicKey}.md`), root: scopeTopics }]
      : [
          { file: path.join(scopeTopics, `${topicKey}.md`), root: scopeTopics },
          { file: path.join(globalTopics, `${topicKey}.md`), root: globalTopics },
        ];
    for (const { file, root } of candidates) {
      if (!isInside(root, file)) continue;
      const text = readTextOrNull(file);
      if (text !== null) {
        return { ...topicView(topicKey, text), file, scope, fallback: root === globalTopics && scope !== 'global' };
      }
    }
    throw fail('NOT_FOUND', `没有这个专题：${topicKey}`);
  }

  function timeline({ scope: scopeValue, offset = 0, limit = 50 } = {}) {
    const scope = scopeOf(scopeValue);
    const off = Number.isInteger(offset) && offset > 0 ? offset : 0;
    const lim = Number.isInteger(limit) ? Math.min(100, Math.max(1, limit)) : 50;
    const JOURNAL_SCAN_LIMIT = 1000;
    const items = [];
    const journalOps = new Set();
    let skippedCorrupted = 0;
    let scanLimited = false;

    const journalDir = pathsFor(scope).journal;
    let files = [];
    try {
      files = readdirSync(journalDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
        .map((entry) => {
          const file = path.join(journalDir, entry.name);
          const stat = statOf(file);
          return { file, mtimeMs: stat?.mtimeMs ?? 0 };
        });
    } catch {
      files = [];
    }
    if (files.length > JOURNAL_SCAN_LIMIT) {
      scanLimited = true;
      files.sort((a, b) => b.mtimeMs - a.mtimeMs);
      files = files.slice(0, JOURNAL_SCAN_LIMIT);
    }

    for (const { file } of files) {
      const result = readJsonResult(file);
      if (!result.ok || !result.value || typeof result.value !== 'object') {
        skippedCorrupted += 1;
        continue;
      }
      const doc = result.value;
      if (doc.phase !== 'committed') continue;
      if (doc.scopeId && doc.scopeId !== scope) continue;
      const at = asString(doc.updatedAt) || asString(doc.createdAt) || null;
      const operationId = asString(doc.operationId) || path.basename(file, '.json');
      journalOps.add(operationId);
      const changes = asArray(doc.changes);
      changes.forEach((change, index) => {
        const kind = change?.kind === 'core' ? 'core' : change?.kind === 'topic' ? 'topic' : null;
        if (!kind) return;
        const key = kind === 'core' ? 'core' : path.basename(asString(change.file), '.md');
        let title = kind === 'core' ? 'L1 核心' : key || '(topic)';
        const changedFile = asString(change.file);
        const safeFile = changedFile && isInside(cfg.dataRoot, changedFile) ? changedFile : null;
        if (kind === 'topic' && safeFile) {
          const text = readTextOrNull(safeFile);
          if (text !== null) title = asString(parseFrontMatter(text).meta.title, title);
        }
        items.push({
          at,
          source: 'journal',
          sources: ['journal'],
          action: `${kind}.write`,
          scope: doc.scopeId ?? scope,
          target: { type: kind, id: key, title },
          operationId,
          detail: { changeIndex: index, file: safeFile },
        });
      });
    }

    const spark = readSparkDb(scope);
    const ops = spark.db?.ops && typeof spark.db.ops === 'object' ? Object.entries(spark.db.ops) : [];
    for (const [operationId, op] of ops) {
      if (!op || typeof op !== 'object') continue;
      const result = op.result && typeof op.result === 'object' ? op.result : {};
      if (result.scopeId && result.scopeId !== scope) continue;
      if (journalOps.has(operationId)) {
        for (const item of items) {
          if (item.operationId === operationId && !item.sources.includes('spark')) item.sources.push('spark');
        }
        continue;
      }
      items.push({
        at: asString(op.at) || asString(result.updatedAt) || asString(result.createdAt) || null,
        source: 'spark',
        sources: ['spark'],
        action: `spark.${asString(op.kind, 'write')}`,
        scope: result.scopeId ?? scope,
        target: {
          type: 'spark',
          id: asString(result.id) || operationId,
          title: asString(result.title) || '(spark)',
        },
        operationId,
        detail: { revision: Number.isFinite(result.revision) ? result.revision : null },
      });
    }

    items.sort((a, b) => String(b.at ?? '').localeCompare(String(a.at ?? '')));
    const total = items.length;
    return {
      scope,
      items: items.slice(off, off + lim),
      offset: off,
      limit: lim,
      total,
      hasMore: off + lim < total,
      scanLimited,
      skippedCorrupted,
    };
  }

  function boardText(scopeValue) {
    const data = overview(scopeValue);
    const on = Object.entries(data.features).filter(([, value]) => value).map(([key]) => key);
    const lines = [
      `# 记忆面板 · ${data.generatedAt.slice(0, 16).replace('T', ' ')}`,
      '',
      `- L0 人设：${data.layers.L0.chars} / ${data.layers.L0.budget} 字${data.layers.L0.fallback ? '（global 回退）' : ''}`,
      `- L1 核心：${data.layers.L1.chars} / 目标 ${data.layers.L1.target} · 硬顶 ${data.layers.L1.hard} 字`,
      `- L2 火花：${data.layers.L2.active} 生效 / ${data.layers.L2.retired} 退役${data.layers.L2.schemaVersion === null ? '（未读到库）' : ''}`,
      `- L3 专题：${data.layers.L3.count} 个`,
      `- 归档库：${data.archive.length} 张`,
      `- 工作卡：${data.work.filter((card) => card.effectiveStatus === 'active' || card.effectiveStatus === 'stagnated').length} 进行中 · ${data.work.filter((card) => card.effectiveStatus === 'done').length} 冷却中 / ${data.work.filter((card) => card.effectiveStatus === 'archived').length} 已归档`,
      `- 开关：${on.length ? on.join('、') : '全关'}`,
      `- 数据：${data.dataRoot}`,
    ];
    if (data.diagnostics.length) {
      lines.push('', '## 诊断', ...data.diagnostics.map((item) => `- ${item}`));
    }
    const activeWork = data.work.filter((card) => card.effectiveStatus === 'active' || card.effectiveStatus === 'stagnated').slice(0, 8);
    if (activeWork.length) {
      lines.push('', '## 进行中的工作卡');
      for (const card of activeWork) {
        lines.push(`- \`${card.id}\` ${card.title} · 步骤 ${card.steps.length} · 决策 ${card.decisions.length}`);
      }
    }
    return lines.join('\n');
  }

  return {
    config: cfg,
    overview,
    timeline,
    readSpark,
    readTopic,
    listWork,
    startWork,
    updateWork,
    finishWork,
    archiveWork,
    readFeatures,
    readArchive,
    setFeature,
    boardText,
  };
}
