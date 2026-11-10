import { rankDocs } from './recall.js';

const TEXT_OUTPUT = Object.freeze({
  schema: {
    type: 'object',
    additionalProperties: true,
    properties: { text: { type: 'string' } },
    required: ['text'],
  },
  render: (_args, value) => [{ type: 'text', text: value?.text ?? '' }],
});

function line(label, value) {
  return `${label}: ${value}`;
}

export function createCompanionTools(depth, { reader = null } = {}) {
  if (!depth) return [];
  return [
    {
      name: 'companion_hippo',
      description:
        'Companion hippocampus: short-lived notes (hippo1, 1 day), conclusions (hippo2, 7 days), and the injected semantic context area. Actions: feed / list / promote / purge / overview / selfscore. Promotion to context requires self-score >= 6 or force.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        required: ['action'],
        properties: {
          action: { type: 'string', enum: ['feed', 'list', 'promote', 'purge', 'overview', 'selfscore'] },
          area: { type: 'string', enum: ['hippo1', 'hippo2', 'context'] },
          to: { type: 'string', enum: ['hippo1', 'hippo2', 'context'] },
          text: { type: 'string' },
          id: { type: 'string' },
          score: { type: 'number' },
          force: { type: 'boolean' },
          limit: { type: 'number' },
          source: { type: 'string' },
        },
      },
      output: TEXT_OUTPUT,
      isConcurrencySafe: () => false,
      async execute(args = {}) {
        const action = args?.action;
        if (action === 'overview') {
          const data = depth.hippocampus.overview();
          return {
            text: `${line('coreChars', data.coreChars)}${line('capacity', data.capacity)}\n${Object.entries(data.areas).map(([key, value]) => `- ${value.name} (${key}): ${value.count} 条 / ${value.chars} 字${value.ttlDays ? ` / ${value.ttlDays} 天` : ''}`).join('\n')}`,
          };
        }
        if (action === 'purge') return { text: `已清理 ${depth.hippocampus.purge()} 条过期/超容条目。` };
        if (action === 'selfscore') {
          const score = depth.hippocampus.selfscore(args.text, { verified: args.score >= 6 ? 1 : 0 });
          return { text: `自评 ${score}/10（>=6 才可提升到语义思考区；force 可强推）` };
        }
        if (action === 'feed') {
          const item = depth.hippocampus.feed(args.area || 'hippo1', args.text, { source: args.source, score: args.score });
          return { text: item ? `已写入 ${args.area || 'hippo1'}：${item.id}${item.duplicate ? '（重复，未新增）' : ''}` : '空文本，未写入。' };
        }
        if (action === 'list') {
          const items = depth.hippocampus.list(args.area || 'hippo1');
          const limit = Number.isInteger(args.limit) ? args.limit : 20;
          return {
            text: items.length
              ? items.slice(-limit).reverse().map((item) => `- [${item.id}] ${item.text}${item.expiresAt ? `（到期 ${item.expiresAt}）` : ''}`).join('\n')
              : `（${args.area || 'hippo1'} 为空）`,
          };
        }
        if (action === 'promote') {
          const item = depth.hippocampus.promote(args.area || 'hippo2', args.to || 'context', args.id, { score: args.score, force: args.force === true });
          return { text: `已提升：${item.id} → ${args.to || 'context'}（score ${item.score ?? 0}）` };
        }
        return { text: '未知 action，可用 feed/list/promote/purge/overview/selfscore。' };
      },
      presentCall: () => ({ card: 'generic', title: '海马体', kind: 'other' }),
    },
    {
      name: 'companion_queue',
      description: 'Companion capture queue: add one note, list pending notes, or flush/drain them into hippo1. Duplicate text is collapsed by hash.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        required: ['action'],
        properties: {
          action: { type: 'string', enum: ['add', 'list', 'flush'] },
          text: { type: 'string' },
          source: { type: 'string' },
          limit: { type: 'number' },
        },
      },
      output: TEXT_OUTPUT,
      isConcurrencySafe: () => false,
      async execute(args = {}) {
        if (args.action === 'add') {
          const item = depth.queue.add(args.text, args.source);
          return { text: item ? `${item.duplicate ? '已存在' : '已入队'}：${item.id}` : '空文本，未入队。' };
        }
        if (args.action === 'flush') {
          const items = depth.queue.drain(args.limit);
          for (const item of items) {
            depth.hippocampus.feed('hippo1', item.text, { source: item.source || 'queue' });
            try {
              depth.emotion.learn(item.text);
            } catch {
              /* candidate growth is best-effort */
            }
          }
          return { text: `已把 ${items.length} 条队列写入海马体 1.0，并收集情绪候选词。` };
        }
        const items = depth.queue.list(args.limit);
        return { text: items.length ? items.map((item) => `- [${item.id}] ${item.text}`).join('\n') : '（队列为空）' };
      },
      presentCall: () => ({ card: 'generic', title: '喂料队列', kind: 'other' }),
    },
    {
      name: 'companion_verify',
      description: 'Experience verification area: add a claim that conflicts with memory, list pending items, or resolve one as confirmed/rejected/modified. Resolution never writes shiori memory automatically.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        required: ['action'],
        properties: {
          action: { type: 'string', enum: ['add', 'list', 'pending', 'resolve'] },
          text: { type: 'string' },
          kind: { type: 'string' },
          conflictWith: { type: 'string' },
          id: { type: 'string' },
          status: { type: 'string', enum: ['confirmed', 'rejected', 'modified'] },
          patch: { type: 'object', additionalProperties: true },
        },
      },
      output: TEXT_OUTPUT,
      isConcurrencySafe: () => false,
      async execute(args = {}) {
        if (args.action === 'add') {
          const item = depth.verify.add({ text: args.text, kind: args.kind, conflictWith: args.conflictWith });
          return { text: `已登记待验证：${item.id}` };
        }
        if (args.action === 'resolve') {
          const item = depth.verify.resolve(args.id, args.status, args.patch);
          return { text: `已验证：${item.id} → ${item.status}` };
        }
        const items = args.action === 'pending' ? depth.verify.pending(10) : depth.verify.list({ status: 'all' });
        return {
          text: items.length
            ? items.map((item) => `- [${item.status}] ${item.id} ${item.text}`).join('\n')
            : '（没有待验证项）',
        };
      },
      presentCall: () => ({ card: 'generic', title: '经验验证', kind: 'other' }),
    },
    {
      name: 'companion_brain',
      description: 'Left/right-brain memory routing. judge classifies a note as left (work/technical), right (relationship/emotion), or mixed; adjust changes weights; feedback records a correction; status lists recent judgments.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        required: ['action'],
        properties: {
          action: { type: 'string', enum: ['judge', 'adjust', 'feedback', 'status'] },
          text: { type: 'string' },
          side: { type: 'string', enum: ['left', 'right', 'mixed'] },
          delta: { type: 'number' },
          id: { type: 'string' },
          correctSide: { type: 'string', enum: ['left', 'right', 'mixed'] },
        },
      },
      output: TEXT_OUTPUT,
      isConcurrencySafe: () => false,
      async execute(args = {}) {
        if (args.action === 'judge') {
          const item = depth.brain.judge(args.text);
          return { text: `判定：${item.side}（左 ${item.left.toFixed(2)} / 右 ${item.right.toFixed(2)}，置信 ${item.confidence}%）id=${item.id}` };
        }
        if (args.action === 'adjust') {
          const bucket = depth.brain.adjust(args.side, args.delta);
          return { text: `${args.side} 权重 → ${bucket.weight.toFixed(2)}` };
        }
        if (args.action === 'feedback') {
          const item = depth.brain.feedback(args.id, args.correctSide);
          return { text: `已记反馈：${item.id} → ${item.corrected}` };
        }
        const status = depth.brain.status();
        return {
          text: `left ${status.brain.left.weight.toFixed(2)} (${status.brain.left.correct}/${status.brain.left.wrong})\nright ${status.brain.right.weight.toFixed(2)} (${status.brain.right.correct}/${status.brain.right.wrong})\nmixed ${status.brain.mixed.weight.toFixed(2)}\n最近：\n${status.recent.map((item) => `- ${item.side} ${item.text.slice(0, 40)}`).join('\n') || '（无）'}`,
        };
      },
      presentCall: () => ({ card: 'generic', title: '左右脑判定', kind: 'other' }),
    },
    {
      name: 'companion_emotion',
      description:
        'Amygdala + affect module: detect emotions in a sentence (24 categories), record an emotion event, learn candidate words (does not auto-add), add curated words, tag an event, or recompute a target attitude. Default target is 用户.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        required: ['action'],
        properties: {
          action: { type: 'string', enum: ['detect', 'record', 'learn', 'grow', 'addword', 'tag', 'events', 'affect', 'recompute', 'lexicon'] },
          text: { type: 'string' },
          name: { type: 'string' },
          words: { type: 'array', items: { type: 'string' } },
          priority: { type: 'number' },
          target: { type: 'string' },
          refType: { type: 'string' },
          refId: { type: 'string' },
          id: { type: 'string' },
          emotions: { type: 'array', items: { type: 'string' } },
          weight: { type: 'number' },
          force: { type: 'boolean' },
          limit: { type: 'number' },
        },
      },
      output: TEXT_OUTPUT,
      isConcurrencySafe: () => false,
      async execute(args = {}) {
        if (args.action === 'detect') {
          const result = depth.emotion.detect(args.text);
          return {
            text: result.emotions.length
              ? result.emotions.map((item) => `${item.name}:${item.score}`).join(' / ')
              : '没有命中情绪词。',
          };
        }
        if (args.action === 'record') {
          const result = depth.emotion.record(args.text, { refType: args.refType, refId: args.refId, target: args.target });
          return {
            text: result.event
              ? `已记情绪事件 ${result.event.id}：${result.emotions.map((item) => `${item.name}(${item.score})`).join(' ')}`
              : '没有命中情绪词，未记事件。',
          };
        }
        if (args.action === 'learn') {
          const words = depth.emotion.learn(args.text);
          return { text: words.length ? `候选词（未入库）：${words.join('、')}` : '没有新候选词。' };
        }
        if (args.action === 'grow') {
          const result = depth.emotion.grow(args.name, args.text, { max: Number.isInteger(args.limit) ? args.limit : 12 });
          return { text: `${args.name} 成长：新增 ${result.added}，本类 ${result.total}/${300}，候选 ${result.candidates}` };
        }
        if (args.action === 'addword') {
          const result = depth.emotion.addword(args.name, args.words, args.priority);
          return { text: `${args.name} 新增 ${result.added} 词，共 ${result.total} 个。` };
        }
        if (args.action === 'tag') {
          const event = depth.emotion.tag(args.id, args.emotions);
          return { text: `事件 ${event.id} 情绪标签 → ${event.emotions.map((item) => item.name || item).join('、')}` };
        }
        if (args.action === 'affect') {
          return { text: depth.emotion.text() };
        }
        if (args.action === 'lexicon') {
          const status = depth.emotion.lexiconStatus();
          return { text: `情感词库：${status.total}/${status.target} 词（容量 ${status.capacity}，余 ${status.free}），${status.categories} 类\n${Object.entries(status.counts).map(([name, count]) => `${name}:${count}`).join(' ')}` };
        }
        if (args.action === 'recompute') {
          const result = depth.emotion.recompute({ force: args.force === true });
          return {
            text: result.skipped
              ? `未到 3 天，跳过重算（${result.at}）。用 force 可强算。`
              : `已重算 ${Object.keys(result.targets).length} 个对象。`,
          };
        }
        const limit = Number.isInteger(args.limit) ? Math.min(100, Math.max(1, args.limit)) : 20;
        const events = depth.state.data.emotionEvents.slice(-limit).reverse();
        return {
          text: events.length
            ? events.map((item) => `- [${item.at}] ${item.text.slice(0, 80)} → ${item.emotions.map((e) => e.name || e).join('、')}`).join('\n')
            : '（没有情绪事件）',
        };
      },
      presentCall: () => ({ card: 'generic', title: '杏仁核与情感', kind: 'other' }),
    },
    {
      name: 'companion_health',
      description:
        'Memory health check + self-evolution proposals. check compares L0/L1/L2 budgets, queue, verification and context; propose turns issues into candidates. It never rewrites memory by itself.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        required: ['action'],
        properties: {
          action: { type: 'string', enum: ['check', 'status', 'propose', 'list'] },
        },
      },
      output: TEXT_OUTPUT,
      isConcurrencySafe: () => false,
      async execute(args = {}) {
        if (args.action === 'check') {
          const report = await depth.health.check();
          return {
            text: `健康分 ${report.score}/100\n${report.issues.length ? `问题：\n${report.issues.map((item) => `- ${item}`).join('\n')}` : '问题：无'}\n${report.ok.length ? `正常：\n${report.ok.map((item) => `- ${item}`).join('\n')}` : ''}`,
          };
        }
        if (args.action === 'propose') {
          const report = depth.health.status();
          const items = depth.evolve.propose(report);
          return { text: items.map((item) => `- ${item.id} ${item.title}`).join('\n') };
        }
        if (args.action === 'list') {
          const items = depth.evolve.list();
          return { text: items.length ? items.map((item) => `- [${item.status}] ${item.id} ${item.title}`).join('\n') : '（没有进化候选）' };
        }
        const report = depth.health.status();
        return {
          text: `最近体检：${report.at ?? '未跑'} / ${report.score ?? '—'} 分\n${(report.issues ?? []).map((item) => `- ${item}`).join('\n') || '（无问题）'}`,
        };
      },
      presentCall: () => ({ card: 'generic', title: '体检与自检', kind: 'other' }),
    },
    {
      name: 'companion_life',
      description:
        'Dream / sleep / diary / focus / timeline / privacy. focus-set|get, diary-write|list|forget, dream-generate|list, sleep run, timeline touch/status, privacy forget. Sleep purges hippocampus, recomputes affect, checks health, writes a dream and a report.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        required: ['action'],
        properties: {
          action: {
            type: 'string',
            enum: ['focus-set', 'focus-get', 'diary-write', 'diary-list', 'diary-forget', 'dream-generate', 'dream-list', 'sleep', 'timeline', 'privacy-forget'],
          },
          text: { type: 'string' },
          mood: { type: 'string' },
          id: { type: 'string' },
          kind: { type: 'string', enum: ['diary', 'dream'] },
          llm: { type: 'boolean', description: 'dream-generate: try the current Harness model first, fall back to a template' },
          limit: { type: 'number' },
        },
      },
      output: TEXT_OUTPUT,
      isConcurrencySafe: () => false,
      async execute(args = {}) {
        if (args.action === 'focus-set') {
          const focus = depth.life.focusSet(args.text);
          return { text: `焦点已记：${focus.text}` };
        }
        if (args.action === 'focus-get') return { text: depth.life.focusGet().text || '（焦点为空）' };
        if (args.action === 'diary-write') {
          const item = depth.life.diaryWrite(args.text, args.mood);
          return { text: `日记已写：${item.id}` };
        }
        if (args.action === 'diary-list') {
          const items = depth.life.diaryList(args.limit);
          return { text: items.length ? items.map((item) => `- [${item.at}] ${item.text}`).join('\n') : '（日记为空）' };
        }
        if (args.action === 'diary-forget') {
          const result = depth.life.privacyForget('diary', args.id);
          return { text: `已删 ${result.removed} 条日记。` };
        }
        if (args.action === 'dream-generate') {
          const item = args.llm === true ? await depth.life.dreamGenerateLlm() : depth.life.dreamGenerate();
          return { text: `${item.llm ? 'LLM 梦' : '梦'}：${item.text}` };
        }
        if (args.action === 'dream-list') {
          const items = depth.life.dreamList(args.limit);
          return { text: items.length ? items.map((item) => `- [${item.at}] ${item.text}`).join('\n') : '（没有梦）' };
        }
        if (args.action === 'sleep') {
          const report = await depth.life.sleepRun();
          return { text: `睡眠整理：清理 ${report.purged} 条，健康 ${report.health ?? '—'}，梦 ${report.dream}，队列 ${report.queue}` };
        }
        if (args.action === 'timeline') {
          const timeline = depth.life.timelineTouch();
          return { text: `时间线：第 ${timeline.sessions} 段会话，距上次 ${Math.round(timeline.lastGapMs / 60000)} 分钟${timeline.nostalgia ? '，触发怀旧' : ''}` };
        }
        if (args.action === 'privacy-forget') {
          const result = depth.life.privacyForget(args.kind, args.id);
          return { text: `已删 ${result.removed} 条 ${args.kind}。` };
        }
        return { text: '未知 action。' };
      },
      presentCall: () => ({ card: 'generic', title: '梦与日记', kind: 'other' }),
    },
    {
      name: 'companion_judge',
      description:
        'Memory judgment + feedback + narrative. observe flags negation/subject/time shifts; replace records create/merge/update/supersede/ignore; feedback records proposed vs final layer; stats/reflect checks whether a layer is misjudged >30%; relate links two memories.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        required: ['action'],
        properties: {
          action: { type: 'string', enum: ['observe', 'replace', 'feedback', 'stats', 'reflect', 'relate', 'narrative'] },
          text: { type: 'string' },
          candidate: { type: 'string' },
          existing: { type: 'string' },
          decision: { type: 'string', enum: ['create', 'merge', 'update', 'supersede', 'ignore'] },
          reason: { type: 'string' },
          id: { type: 'string' },
          proposedLayer: { type: 'string' },
          finalLayer: { type: 'string' },
          from: { type: 'string' },
          to: { type: 'string' },
          limit: { type: 'number' },
        },
      },
      output: TEXT_OUTPUT,
      isConcurrencySafe: () => false,
      async execute(args = {}) {
        if (args.action === 'observe') {
          const item = depth.judge.observe(args.text);
          return { text: `观察：否定[${item.negation.join('、') || '无'}] 主体[${item.subjects.join('、') || '无'}] 时间[${item.timeShift ? '有' : '无'}]` };
        }
        if (args.action === 'replace') {
          const item = depth.judge.replace({ candidate: args.candidate, existing: args.existing, decision: args.decision, reason: args.reason });
          return { text: `判定：${item.id} → ${item.decision}` };
        }
        if (args.action === 'feedback') {
          const item = depth.judge.feedback({ id: args.id, proposedLayer: args.proposedLayer, finalLayer: args.finalLayer, reason: args.reason });
          return { text: `反馈已记：提出 ${item.proposedLayer || '—'} → 最终 ${item.finalLayer}` };
        }
        if (args.action === 'relate') {
          const item = depth.judge.relate(args.from, args.to, args.reason);
          return { text: `叙事关系：${item.from} → ${item.to}` };
        }
        if (args.action === 'narrative') {
          const items = depth.judge.narrative(args.limit);
          return { text: items.length ? items.map((item) => `- ${item.from} → ${item.to}：${item.reason || '（无理由）'}`).join('\n') : '（没有叙事关系）' };
        }
        const result = args.action === 'reflect' ? depth.judge.reflect() : depth.judge.stats();
        return {
          text: `判定 ${result.total} 次，改判 ${result.mismatched} 次（${(result.rate * 100).toFixed(1)}%）${result.needsCalibration ? `\n${result.suggestion}` : ''}`,
        };
      },
      presentCall: () => ({ card: 'generic', title: '判定与叙事', kind: 'other' }),
    },
    {
      name: 'companion_area',
      description:
        'Custom memory areas (max 3, gated by features.custom_areas). create / feed / list / purge / overview. Areas are companion-side only and never write shiori L0-L3.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        required: ['action'],
        properties: {
          action: { type: 'string', enum: ['create', 'feed', 'list', 'forget', 'purge', 'overview'] },
          id: { type: 'string' },
          entryId: { type: 'string' },
          name: { type: 'string' },
          text: { type: 'string' },
          ttlDays: { type: 'number' },
          maxEntries: { type: 'number' },
          limit: { type: 'number' },
        },
      },
      output: TEXT_OUTPUT,
      isConcurrencySafe: () => false,
      async execute(args = {}) {
        if (args.action === 'create') {
          const area = depth.custom.create({ id: args.id, name: args.name, ttlDays: args.ttlDays, maxEntries: args.maxEntries });
          return { text: `自定义区已建：${area.id}（${area.name}）` };
        }
        if (args.action === 'feed') {
          const item = depth.custom.feed(args.id, args.text, { source: 'manual' });
          return { text: item ? `已写入 ${args.id}：${item.id}${item.duplicate ? '（重复）' : ''}` : '空文本。' };
        }
        if (args.action === 'list') {
          const items = depth.custom.list(args.id);
          const limit = Number.isInteger(args.limit) ? args.limit : 20;
          return { text: items.length ? items.slice(-limit).reverse().map((item) => `- ${item.text}`).join('\n') : `（${args.id} 为空）` };
        }
        if (args.action === 'forget') {
          const result = depth.custom.forget(args.id, args.entryId);
          return { text: `已删 ${result.removed} 条。` };
        }
        if (args.action === 'purge') return { text: `已清理 ${depth.custom.purge()} 条。` };
        const areas = depth.custom.overview();
        return { text: areas.length ? areas.map((area) => `- ${area.id} ${area.name}：${area.count} 条 / ${area.chars} 字 / ${area.ttlDays} 天`).join('\n') : '（没有自定义区）' };
      },
      presentCall: () => ({ card: 'generic', title: '自定义记忆区', kind: 'other' }),
    },
    {
      name: 'companion_recall',
      description: 'Hybrid recall across companion notes (hippocampus, context, verification, judgments, emotion events, diary, dreams) and shiori L0-L3 (persona/core/topics/spark cards/work cards). Returns scored snippets with source labels.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        required: ['query'],
        properties: {
          query: { type: 'string' },
          limit: { type: 'number' },
          scope: { type: 'string', description: 'shiori scope id; defaults to global' },
        },
      },
      output: TEXT_OUTPUT,
      isConcurrencySafe: () => true,
      async execute(args = {}) {
        const limit = Number.isInteger(args.limit) ? Math.max(1, Math.min(20, args.limit)) : 8;
        const local = depth.recall.recall(args.query, { limit: 20 });
        const extra = [];
        if (reader) {
          const scope = typeof args.scope === 'string' && args.scope ? args.scope : 'global';
          try {
            const [core, persona] = await Promise.all([reader.readCore(scope), reader.readPersona(scope)]);
            if (core?.body) extra.push({ source: 'L1', id: 'core', text: core.body });
            if (persona?.body) extra.push({ source: 'L0', id: 'persona', text: persona.body });
          } catch {
            /* shiori read is best-effort */
          }
          try {
            const overview = await reader.overview(scope);
            for (const topic of (overview.layers?.L3?.topics ?? []).slice(0, 8)) {
              try {
                const detail = await reader.readTopic(topic.key, scope);
                if (detail?.body) extra.push({ source: 'L3', id: topic.key, text: `${topic.title ?? topic.key}\n${detail.body}` });
              } catch {
                /* one bad topic must not stop recall */
              }
            }
            for (const card of (overview.sparks?.active ?? []).slice(0, 30)) {
              extra.push({ source: 'L2', id: card.id, text: `${card.title}\n${card.summary ?? ''}\n${card.contentPreview ?? ''}` });
            }
            for (const card of (overview.work ?? []).slice(0, 20)) {
              extra.push({ source: 'work', id: card.id, text: `${card.title}\n${card.goal ?? ''}\n${card.outcome ?? ''}\n${(card.steps ?? []).map((step) => step.note ?? '').join(' ')}` });
            }
          } catch {
            /* overview is best-effort */
          }
        }
        const merged = [...local, ...extra];
        const corpus = [...depth.recall.docs(), ...extra];
        let ftsHits = [];
        try {
          if (depth.fts?.available) {
            depth.fts.sync(corpus);
            ftsHits = depth.fts.search(args.query, { limit: 30 });
          }
        } catch {
          /* FTS is an optional accelerator */
        }
        const boost = new Set(ftsHits.map((hit) => `${hit.source}:${hit.id}`));
        let vectorHits = [];
        try {
          const vectorEnabled = typeof depth.features === 'function' && depth.features()['features.vector'] === true;
          if (vectorEnabled && depth.vector?.available) {
            vectorHits = await depth.vector.search(args.query, corpus, { limit: 30 });
          }
        } catch {
          /* vector is optional; never block lexical recall */
        }
        const vectorBoost = new Map(vectorHits.map((hit) => [`${hit.source}:${hit.id}`, hit.score]));
        const hits = rankDocs(args.query, merged, { limit });
        for (const hit of hits) {
          const key = `${hit.source}:${hit.id}`;
          if (boost.has(key)) hit.score = Math.round((hit.score + 0.5) * 1000) / 1000;
          if (vectorBoost.has(key)) hit.score = Math.round((hit.score + Math.max(0, vectorBoost.get(key))) * 1000) / 1000;
        }
        const seen = new Set(hits.map((hit) => `${hit.source}:${hit.id}`));
        for (const hit of [...ftsHits, ...vectorHits]) {
          const key = `${hit.source}:${hit.id}`;
          if (!seen.has(key)) {
            seen.add(key);
            hits.push(hit);
          }
        }
        hits.sort((a, b) => b.score - a.score);
        const mode = depth.vector?.available && vectorHits.length ? 'FTS5+BM25+VECTOR' : depth.fts?.available ? 'FTS5+BM25' : 'BM25';
        return {
          text: hits.length
            ? `${mode}：\n${hits.map((hit) => `- ${hit.score.toFixed(3)} [${hit.source}] ${hit.id}: ${hit.text.slice(0, 180)}`).join('\n')}`
            : '（没有命中；已查 companion 本地笔记 + shiori L0–L3）',
        };
      },
      presentCall: () => ({ card: 'generic', title: '伴生检索', kind: 'other' }),
    },
  ];
}
