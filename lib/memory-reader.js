/**
 * Async memory reader: prefer the shiori companion service, fall back to the
 * existing on-disk reader. Work cards, switches, and the archive stay local.
 */
import path from 'node:path';
import { FEATURE_LABELS, byteSize, readTextOrNull } from './config.js';
import { cardView } from './store.js';

function topicSummary(topic) {
  const body = typeof topic?.body === 'string' ? topic.body : '';
  const key = String(topic?.key ?? '');
  return {
    key,
    title: String(topic?.title ?? key),
    summary: String(topic?.summary ?? ''),
    updated: topic?.updated ?? null,
    archivedAt: topic?.archivedAt ?? null,
    chars: Number.isFinite(topic?.chars) ? topic.chars : body.length,
    bytes: byteSize(body),
  };
}

function serviceCard(card, scope, dataRoot) {
  if (!card || typeof card !== 'object' || typeof card.id !== 'string') return null;
  return {
    ...cardView(card.id, card),
    file: path.join(dataRoot, 'sparks', 'scopes', scope, 'sparks.json'),
    scope,
  };
}

function normalizeTimelineItem(item) {
  if (!item || typeof item !== 'object') return null;
  const source = item.source === 'spark' ? 'spark' : 'journal';
  const sources = Array.isArray(item.sources)
    ? item.sources
    : item.detail?.dedupedWith?.includes?.('spark')
      ? ['journal', 'spark']
      : [source];
  const operationId = item.operationId ?? item.detail?.operationId ?? null;
  return {
    at: item.at ?? null,
    source,
    sources,
    action: item.action ?? 'memory.write',
    scope: item.scope ?? null,
    target: item.target ?? { type: 'core', id: 'core', title: 'L1 核心' },
    operationId,
    detail: item.detail ?? {},
  };
}

export function createMemoryReader(store, service = null) {
  const cfg = store.config;
  let cache = null;
  let cacheKey = null;
  let cacheAt = 0;

  function invalidate() {
    cache = null;
    cacheKey = null;
    cacheAt = 0;
  }

  async function serviceOverview(scope) {
    const scopeId = scope || cfg.scope;
    const [status, scopes, core, persona, topics, sparks] = await Promise.all([
      service.status(),
      service.scopes(),
      service.readCore(scopeId),
      service.readPersona(scopeId),
      service.readTopics(scopeId),
      service.readSparks(scopeId, { summary: true }),
    ]);
    const coreText = typeof core?.body === 'string' && core.body.length > 0
      ? core.body
      : (core?.text ?? '');
    const personaText = persona?.text ?? '';
    const topicList = Array.isArray(topics) ? topics : [];
    const cards = (Array.isArray(sparks) ? sparks : [])
      .map((card) => serviceCard(card, scopeId, cfg.dataRoot))
      .filter(Boolean);
    const active = cards.filter((card) => card.state === 'active');
    const retired = cards.filter((card) => card.state !== 'active');
    const archive = store.readArchive();
    return {
      generatedAt: new Date().toISOString(),
      scope: scopeId,
      scopes: Array.isArray(scopes) && scopes.length ? scopes : [scopeId],
      dataRoot: cfg.dataRoot,
      stateRoot: cfg.stateRoot,
      workFile: cfg.workFile,
      featuresFile: cfg.featuresFile,
      archiveIndex: cfg.archiveIndex,
      layers: {
        L0: {
          file: path.join(cfg.dataRoot, 'persona', `${scopeId}.md`),
          chars: personaText.length,
          bytes: byteSize(personaText),
          budget: cfg.personaMaxChars,
          fallback: false,
          present: personaText.length > 0,
        },
        L1: {
          file: path.join(cfg.dataRoot, 'scopes', scopeId, 'core.md'),
          chars: coreText.length,
          bytes: byteSize(coreText),
          target: cfg.coreTargetChars,
          hard: cfg.coreHardChars,
          fallback: typeof core?.scopeId === 'string' && core.scopeId !== scopeId,
          present: coreText.length > 0,
        },
        L2: {
          file: path.join(cfg.dataRoot, 'sparks', 'scopes', scopeId, 'sparks.json'),
          total: cards.length,
          active: active.length,
          retired: retired.length,
          schemaVersion: 1,
          kind: 'shiori-sparks-scope',
        },
        L3: {
          dir: path.join(cfg.dataRoot, 'scopes', scopeId, 'topics'),
          count: topicList.length,
          topics: topicList.map(topicSummary),
        },
        journal: {
          dir: path.join(cfg.dataRoot, 'journal'),
          count: null,
          latestAt: null,
          source: 'service',
        },
      },
      sparks: { active, retired },
      work: store.listWork(),
      archive: archive.cards,
      features: store.readFeatures(),
      featureLabels: FEATURE_LABELS,
      diagnostics: Array.isArray(status?.diagnostics)
        ? status.diagnostics.map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
        : [],
    };
  }

  async function overview(scope) {
    const scopeId = scope || cfg.scope;
    if (cache !== null && cacheKey === scopeId && Date.now() - cacheAt < 30_000) return cache;
    let data;
    if (!service?.available) {
      data = store.overview(scope);
    } else {
      try {
        data = await serviceOverview(scope);
      } catch (error) {
        data = store.overview(scope);
        data.diagnostics = [
          ...(Array.isArray(data.diagnostics) ? data.diagnostics : []),
          `shioriCompanion 读取失败，已回退文件：${error instanceof Error ? error.message : String(error)}`,
        ];
      }
    }
    cache = data;
    cacheKey = scopeId;
    cacheAt = Date.now();
    return data;
  }

  async function readCore(scope) {
    const scopeId = scope || cfg.scope;
    if (service?.available) {
      try {
        const core = await service.readCore(scopeId);
        if (core) {
          const body = typeof core.body === 'string' ? core.body : (core.text ?? '');
          return {
            text: core.text ?? body,
            body,
            chars: body.length,
            bytes: byteSize(body),
            revision: core.revision ?? null,
            scopeId: core.scopeId ?? scopeId,
            source: 'service',
          };
        }
      } catch {
        /* fall through to the file reader */
      }
    }
    const file = path.join(cfg.dataRoot, 'scopes', scopeId, 'core.md');
    const text = readTextOrNull(file);
    return {
      text: text ?? '',
      body: text ?? '',
      chars: (text ?? '').length,
      bytes: byteSize(text ?? ''),
      revision: null,
      scopeId,
      file,
      source: 'file',
    };
  }

  async function readPersona(scope) {
    const scopeId = scope || cfg.scope;
    if (service?.available) {
      try {
        const persona = await service.readPersona(scopeId);
        if (persona) {
          const body = persona.text ?? '';
          return {
            text: body,
            body,
            chars: body.length,
            bytes: byteSize(body),
            revision: persona.revision ?? null,
            stale: persona.stale === true,
            scopeId,
            source: 'service',
          };
        }
      } catch {
        /* fall through to the file reader */
      }
    }
    const file = path.join(cfg.dataRoot, 'persona', `${scopeId}.md`);
    const text = readTextOrNull(file);
    return {
      text: text ?? '',
      body: text ?? '',
      chars: (text ?? '').length,
      bytes: byteSize(text ?? ''),
      revision: null,
      scopeId,
      file,
      source: 'file',
    };
  }

  async function commit(request) {
    if (!service?.available) {
      throw Object.assign(new Error('shioriCompanion 不可用，不能写记忆'), { code: 'UNSUPPORTED' });
    }
    const result = await service.commit(request);
    invalidate();
    return result;
  }

  async function readSpark(id, scope) {    const scopeId = scope || cfg.scope;
    if (service?.available) {
      try {
        const card = await service.readSpark(id, scopeId);
        if (card) return { ...card, file: path.join(cfg.dataRoot, 'sparks', 'scopes', scopeId, 'sparks.json'), scope: scopeId };
      } catch {
        /* fall through to the file reader */
      }
    }
    return store.readSpark(id, scopeId);
  }

  async function readTopic(key, scope) {
    const scopeId = scope || cfg.scope;
    if (service?.available) {
      try {
        const topic = await service.readTopic(key, scopeId);
        if (topic) {
          const body = typeof topic.body === 'string' ? topic.body : '';
          return {
            ...topic,
            chars: body.length,
            bytes: byteSize(body),
            file: path.join(cfg.dataRoot, 'scopes', scopeId, 'topics', `${key}.md`),
            scope: scopeId,
            fallback: false,
          };
        }
      } catch {
        /* fall through to the file reader */
      }
    }
    return store.readTopic(key, scopeId);
  }

  async function timeline({ scope: scopeValue, offset = 0, limit = 50 } = {}) {
    const scopeId = scopeValue || cfg.scope;
    const off = Number.isInteger(offset) && offset > 0 ? offset : 0;
    const lim = Number.isInteger(limit) ? Math.min(100, Math.max(1, limit)) : 50;
    if (service?.available) {
      try {
        const page = await service.readTimeline(scopeId, { offset: off, limit: lim });
        if (page) {
          const items = (Array.isArray(page.items) ? page.items : []).map(normalizeTimelineItem).filter(Boolean);
          return {
            scope: page.scope ?? scopeId,
            items,
            offset: Number.isInteger(page.offset) ? page.offset : off,
            limit: Number.isInteger(page.limit) ? page.limit : lim,
            total: Number.isInteger(page.total) ? page.total : items.length,
            hasMore: page.hasMore === true,
            scanLimited: page.scanLimited === true,
            skippedCorrupted: Number.isInteger(page.skippedCorrupted) ? page.skippedCorrupted : 0,
            source: 'service',
          };
        }
      } catch {
        /* fall through to the file reader */
      }
    }
    return store.timeline({ scope: scopeId, offset: off, limit: lim });
  }

  async function boardText(scope) {
    const data = await overview(scope);
    const activeWork = data.work.filter((card) => card.effectiveStatus === 'active' || card.effectiveStatus === 'stagnated');
    const on = Object.entries(data.features).filter(([, value]) => value).map(([key]) => key);
    const lines = [
      `# 记忆面板 · ${data.generatedAt.slice(0, 16).replace('T', ' ')}`,
      '',
      `- L0 人设：${data.layers.L0.chars} / ${data.layers.L0.budget} 字${data.layers.L0.fallback ? '（global 回退）' : ''}`,
      `- L1 核心：${data.layers.L1.chars} / 目标 ${data.layers.L1.target} · 硬顶 ${data.layers.L1.hard} 字`,
      `- L2 火花：${data.layers.L2.active} 生效 / ${data.layers.L2.retired} 退役${data.layers.L2.schemaVersion === null ? '（未读到库）' : ''}`,
      `- L3 专题：${data.layers.L3.count} 个`,
      `- 归档库：${data.archive.length} 张`,
      `- 工作卡：${activeWork.length} 进行中 · ${data.work.filter((card) => card.effectiveStatus === 'done').length} 冷却中 / ${data.work.filter((card) => card.effectiveStatus === 'archived').length} 已归档`,
      `- 开关：${on.length ? on.join('、') : '全关'}`,
      `- 数据：${data.dataRoot}`,
    ];
    if (data.diagnostics.length) {
      lines.push('', '## 诊断', ...data.diagnostics.map((item) => `- ${item}`));
    }
    if (activeWork.length) {
      lines.push('', '## 进行中的工作卡');
      for (const card of activeWork.slice(0, 8)) {
        lines.push(`- \`${card.id}\` ${card.title} · 步骤 ${card.steps.length} · 决策 ${card.decisions.length}`);
      }
    }
    return lines.join('\n');
  }

  return {
    overview,
    readCore,
    readPersona,
    commit,
    readSpark,
    readTopic,
    timeline,
    boardText,
    invalidate,
  };
}
