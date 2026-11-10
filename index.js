/**
 * dsh-shiori-companion — Host half.
 *
 * It owns three things only:
 *   1. read shiori's on-disk memory contract (never writes it),
 *   2. the work-card store and the 18 feature switches,
 *   3. a same-origin JSON API consumed by the Client panel.
 *
 * The Client half adds the left-sidebar icon and the main panel.
 */
import path from 'node:path';
import { DEFAULT_CONFIG } from './lib/config.js';
import { createStore } from './lib/store.js';
import { createTools } from './lib/tools.js';
import { createCompanionDepth } from './lib/companion/index.js';
import { createCompanionTools } from './lib/companion/tools.js';
import { createDreamLlm } from './lib/companion/dream-llm.js';
import { registerHttp } from './lib/http.js';
import { createServiceBridge } from './lib/companion-service.js';
import { createMemoryReader } from './lib/memory-reader.js';
import { createPromptBridge } from './lib/prompt-bridge.js';

export const name = 'shiori-companion';
export const inject = ['tools', 'systemPrompt'];

let Schema = null;
try {
  Schema = (await import('@deepseek-ai/schemastery')).default;
} catch {
  Schema = null;
}
if (!Schema) {
  try {
    const { createRequire } = await import('node:module');
    const profileDir = process.env.DSH_PROFILE_DIR;
    if (profileDir) {
      const requireFromProfile = createRequire(path.join(profileDir, 'package.json'));
      const loaded = requireFromProfile('@deepseek-ai/schemastery');
      Schema = typeof loaded === 'function' ? loaded : loaded?.default ?? null;
    }
  } catch {
    Schema = null;
  }
}

export const Config = Schema ? Schema.object({
  dataRoot: Schema.string().default(DEFAULT_CONFIG.dataRoot).description('shiori 的 dataRoot（只读）'),
  stateRoot: Schema.string().default(DEFAULT_CONFIG.stateRoot).description('shiori 的 stateRoot；伴生写入只落 stateRoot/plus'),
  scope: Schema.string().default(DEFAULT_CONFIG.scope).description('默认 scope；global 为共享记忆'),
  workFile: Schema.string().description('工作卡文件'),
  featuresFile: Schema.string().description('18 个开关的 JSON 文件'),
  archiveIndex: Schema.string().description('归档库索引 JSON'),
  legacyWorkFile: Schema.string().default(DEFAULT_CONFIG.legacyWorkFile).description('旧工作卡文件（只读迁移）'),
  legacyFeaturesFile: Schema.string().default(DEFAULT_CONFIG.legacyFeaturesFile).description('旧开关文件（只读迁移）'),
  legacyArchiveIndex: Schema.string().default(DEFAULT_CONFIG.legacyArchiveIndex).description('旧归档索引（只读迁移）'),
  coreTargetChars: Schema.natural().default(DEFAULT_CONFIG.coreTargetChars).description('L1 软目标字数'),
  coreHardChars: Schema.natural().default(DEFAULT_CONFIG.coreHardChars).description('L1 硬顶字数'),
  personaMaxChars: Schema.natural().default(DEFAULT_CONFIG.personaMaxChars).description('L0 上限字数'),
  sparkMaxChars: Schema.natural().default(DEFAULT_CONFIG.sparkMaxChars).description('单张火花卡上限字数'),
}) : undefined;

export async function apply(ctx, config = {}) {
  try {
    const store = createStore(config);
    const service = createServiceBridge(ctx);
    const reader = createMemoryReader(store, service);
    const logger = ctx.logger;
    let depth = null;
    try {
      depth = createCompanionDepth({
        stateRoot: store.config.stateRoot,
        coreChars: store.config.coreHardChars,
        logger,
        reader,
        features: () => store.readFeatures(),
        dreamLlm: createDreamLlm(ctx),
      });
    } catch (depthError) {
      logger?.warn?.(`companion depth init failed: ${depthError instanceof Error ? depthError.message : String(depthError)}`);
    }
    const prompt = createPromptBridge({ ctx, service, store, depth });

    ctx.effect(() => {
      const disposers = [];
      try {
        for (const tool of [...createTools(store, service, reader), ...createCompanionTools(depth, { reader })]) {
          disposers.push(ctx.tools.register(tool));
        }
        const disposeHttp = registerHttp(ctx, store, logger, service, reader, depth);
        if (disposeHttp) disposers.push(disposeHttp);
        prompt.ensure();
        if (typeof ctx.on === 'function') {
          const disposePreStep = ctx.on('agent/pre-step', (payload, next) => {
            prompt.ensure();
            try {
              if (depth && store.readFeatures()['features.collect'] === true && Number(payload?.step ?? 1) <= 1) {
                const messages = Array.isArray(payload?.messages) ? payload.messages : [];
                const last = messages[messages.length - 1];
                const content = last?.content;
                const text = typeof content === 'string'
                  ? content
                  : Array.isArray(content)
                    ? content.map((part) => (typeof part === 'string' ? part : part?.text ?? '')).join('\n')
                    : '';
                if (text.trim()) depth.queue.add(text, 'pre-step');
              }
            } catch {
              /* capture never blocks the step */
            }
            return next();
          });
          if (typeof disposePreStep === 'function') disposers.push(disposePreStep);
        }
        const disposeCommit = service.onCommit((event) => {
          reader.invalidate();
          if (depth) {
            try {
              const text = JSON.stringify(event ?? {}).slice(0, 600);
              if (text) depth.queue.add(`commit ${text}`, 'onCommit');
            } catch {
              /* capture is best-effort */
            }
          }
        });
        if (typeof disposeCommit === 'function') disposers.push(disposeCommit);
        disposers.push(() => prompt.dispose());
        disposers.push(() => depth?.fts?.close?.());
      } catch (error) {
        for (const dispose of disposers.reverse()) {
          try {
            dispose?.();
          } catch {
            /* keep the original failure */
          }
        }
        throw error;
      }

      return () => {
        for (const dispose of disposers.reverse()) {
          try {
            dispose?.();
          } catch {
            /* unloading is quiet */
          }
        }
      };
    }, 'shiori-companion: tools + api');

    logger?.info?.(`shiori-companion: ready（dataRoot=${store.config.dataRoot}，stateRoot=${store.config.stateRoot}，scope=${store.config.scope}，service=${service.available ? `v${service.version}` : 'file-fallback'}）`);
  } catch (error) {
    // 伴生插件的要求：任何失败只记日志，绝不把 DSH 的 profile 判坏。
    try {
      ctx.logger?.error?.(`shiori-companion: apply failed：${error instanceof Error ? error.stack ?? error.message : String(error)}`);
    } catch {
      /* logging must not throw either */
    }
  }
}
