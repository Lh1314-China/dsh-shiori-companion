/**
 * The three model-facing tools kept compatible with the old small plugin.
 * They are ordinary DSH ToolDefinitions registered with ctx.tools.register,
 * so no shiori-internal hook is involved.
 */
import { FEATURE_KEYS, FEATURE_LABELS } from './config.js';

const TEXT_OUTPUT = Object.freeze({
  schema: {
    type: 'object',
    additionalProperties: true,
    properties: { text: { type: 'string' } },
    required: ['text'],
  },
  render: (_args, value) => [{ type: 'text', text: value?.text ?? '' }],
});

export function createTools(store, service = null, reader = null) {
  return [
    {
      name: 'memory_board',
      description:
        'Show the memory board: L0 persona / L1 core / L2 spark cards / L3 topics / archive / work cards / feature switches, with real paths, sizes and diagnostics. Read-only for shiori data.',
      parameters: { type: 'object', additionalProperties: false, properties: {} },
      output: TEXT_OUTPUT,
      isConcurrencySafe: () => true,
      async execute() {
        const body = reader ? await reader.boardText() : store.boardText();
        const link = service?.available
          ? `- 伴生服务：已连接 v${service.version}`
          : '- 伴生服务：未连接（文件 fallback）';
        return { text: `${body}\n${link}` };
      },
      presentCall: () => ({ card: 'generic', title: '记忆面板', kind: 'other' }),
    },
    {
      name: 'work_card',
      description:
        'Work cards sit beside spark cards. Lifecycle: active → stagnated after 7 quiet days → done with finish → 7-day cooldown → archived with archive. Actions: start / update / finish / archive / list.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        required: ['action'],
        properties: {
          action: { type: 'string', enum: ['start', 'update', 'finish', 'archive', 'list'] },
          id: { type: 'string', description: 'Work card id (update / finish / archive).' },
          title: { type: 'string', description: 'start: short title.' },
          goal: { type: 'string', description: 'start: what "done" means.' },
          note: { type: 'string', description: 'update: one line of progress.' },
          kind: { type: 'string', enum: ['step', 'decision', 'artifact'], description: 'update: entry kind.' },
          outcome: { type: 'string', description: 'finish: result in one line.' },
          wakeWords: { type: 'array', items: { type: 'string' }, description: 'start / finish: wake words.' },
          force: { type: 'boolean', description: 'archive: skip the 7-day cooldown (use deliberately).' },
          status: { type: 'string', enum: ['active', 'stagnated', 'done', 'archived'], description: 'list: filter by effective status.' },
        },
      },
      output: TEXT_OUTPUT,
      isConcurrencySafe: () => false,
      async execute(args = {}) {
        const action = args?.action;
        if (action === 'start') {
          const card = store.startWork(args);
          reader?.invalidate?.();
          return { text: `工作卡已开工：${card.id}\n${card.title}${card.goal ? `\n目标：${card.goal}` : ''}` };
        }
        if (action === 'update') {
          const card = store.updateWork(args);
          reader?.invalidate?.();
          return { text: `已记一笔：${card.title}（步骤 ${card.steps.length} / 决策 ${card.decisions.length} / 产物 ${card.artifacts.length}）` };
        }
        if (action === 'finish') {
          const card = store.finishWork(args);
          reader?.invalidate?.();
          return {
            text: `工作卡已收工：${card.title}\n结果：${card.outcome || '（未写）'}\n唤醒词：${card.wakeWords.join('、') || '（无）'}\n状态：done（冷却 7 天后才能 archive）`,
          };
        }
        if (action === 'archive') {
          const card = store.archiveWork(args);
          reader?.invalidate?.();
          return { text: `工作卡已归档：${card.title}\n结果：${card.outcome}\n唤醒词：${card.wakeWords.join('、')}` };
        }
        const list = store.listWork().filter((card) => !args?.status || card.effectiveStatus === args.status);
        return {
          text: list.length
            ? list
                .map((card) => `- \`${card.id}\` [${card.effectiveStatus}] ${card.title} · ${card.steps.length} 步 · ${String(card.updatedAt ?? '').slice(0, 16)}`)
                .join('\n')
            : '（还没有工作卡）',
        };
      },
      presentCall: () => ({ card: 'generic', title: '工作卡', kind: 'other' }),
    },
    {
      name: 'memory_features',
      description:
        'Read or flip the companion feature switches. They record intent for the memory-tools scripts; they do not change shiori memory.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          key: { type: 'string', enum: [...FEATURE_KEYS] },
          value: { type: 'boolean' },
        },
      },
      output: TEXT_OUTPUT,
      isConcurrencySafe: () => false,
      async execute(args = {}) {
        const features = args?.key ? store.setFeature(args.key, args.value === true) : store.readFeatures();
        if (args?.key) reader?.invalidate?.();
        return {
          text: FEATURE_KEYS.map((key) => `${features[key] ? '开' : '关'} ${key} · ${FEATURE_LABELS[key]}`).join('\n'),
        };
      },
      presentCall: () => ({ card: 'generic', title: '记忆开关', kind: 'other' }),
    },
  ];
}
