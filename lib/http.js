/**
 * Same-origin JSON API used by the Client panel. The route is local-loopback
 * only, rejects cross-site POSTs, and never serves HTML.
 */
import path from 'node:path';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { FEATURE_KEYS, validateTopicKey } from './config.js';
import { createSetupProbe } from './setup.js';

export const API_BASE = '/api/shiori-companion';
const MAX_BODY_BYTES = 256 * 1024;

function header(request, name) {
  const value = request.headers?.[name];
  return Array.isArray(value) ? value[0] : value;
}

function isLoopbackAddress(value) {
  const address = value?.toLowerCase().replace(/^\[|\]$/g, '');
  return address === 'localhost'
    || address === 'localhost.'
    || address === '::1'
    || address?.startsWith('127.') === true
    || address?.startsWith('::ffff:127.') === true;
}

function isTrustedRequest(request) {
  if (!isLoopbackAddress(request.socket?.remoteAddress)) return false;
  const site = header(request, 'sec-fetch-site');
  if (site !== undefined && site !== 'same-origin') return false;
  const host = header(request, 'host');
  if (!host) return false;
  const origin = header(request, 'origin');
  if (!origin) {
    try {
      return isLoopbackAddress(new URL(`http://${host}`).hostname);
    } catch {
      return false;
    }
  }
  try {
    const url = new URL(origin);
    return (url.protocol === 'http:' || url.protocol === 'https:')
      && url.host === host
      && isLoopbackAddress(url.hostname);
  } catch {
    return false;
  }
}

function readJsonBody(request) {
  return new Promise((resolve) => {
    const chunks = [];
    let bytes = 0;
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    request.on('data', (chunk) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      bytes += buffer.length;
      if (bytes > MAX_BODY_BYTES) {
        finish(null);
        request.destroy();
        return;
      }
      chunks.push(buffer);
    });
    request.on('end', () => {
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        finish(parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null);
      } catch {
        finish(null);
      }
    });
    request.on('error', () => finish(null));
  });
}

function sendJson(response, status, value) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  response.end(JSON.stringify(value));
}

function backupChange(store, scope, change) {
  try {
    let source;
    let label;
    if (change?.kind === 'core') {
      source = path.join(store.config.dataRoot, 'scopes', scope, 'core.md');
      label = 'core';
    } else if (change?.kind === 'topic') {
      const key = validateTopicKey(change.key);
      source = path.join(store.config.dataRoot, 'scopes', scope, 'topics', `${key}.md`);
      label = 'topic';
    } else if (change?.kind === 'persona') {
      source = path.join(store.config.dataRoot, 'persona', `${scope}.md`);
      label = 'persona';
    } else if (change?.kind === 'spark') {
      source = path.join(store.config.dataRoot, 'sparks', 'scopes', scope, 'sparks.json');
      label = 'sparks';
    } else {
      return null;
    }
    if (!existsSync(source)) return null;
    const dir = path.join(store.config.stateRoot, 'plus', 'backups');
    mkdirSync(dir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const target = path.join(dir, `${stamp}-${label}-${path.basename(source)}`);
    copyFileSync(source, target);
    return target;
  } catch {
    return null;
  }
}

function statusFor(error) {
  if (error?.code === 'NOT_FOUND') return 404;
  if (error?.code === 'INVALID_INPUT') return 400;
  if (error?.code === 'INVALID_STATE') return 409;
  if (error?.code === 'NOT_READY') return 409;
  if (error?.code === 'REVISION_CONFLICT') return 409;
  if (error?.code === 'UNSUPPORTED') return 501;
  return 500;
}

export function registerHttp(ctx, store, logger, service = null, reader = null, depth = null) {
  const setupProbe = createSetupProbe(store, service);

  function mountOn(server) {
    if (!server || typeof server.register !== 'function') return () => {};

    const handler = async (request, response) => {
    if (!isTrustedRequest(request)) {
      sendJson(response, 403, { ok: false, error: '拒绝非本机同源请求' });
      return;
    }
    if (request.method === 'OPTIONS') {
      response.writeHead(204, { allow: 'GET, HEAD, POST, OPTIONS' });
      response.end();
      return;
    }
    if (request.method === 'POST' && header(request, 'x-shiori-companion') !== '1') {
      sendJson(response, 403, { ok: false, error: '缺少本插件请求头' });
      return;
    }

    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    if (pathname !== API_BASE && !pathname.startsWith(`${API_BASE}/`)) {
      sendJson(response, 404, { ok: false, error: 'not found' });
      return;
    }
    const route = pathname === API_BASE ? '/' : pathname.slice(API_BASE.length);

    try {
      if (request.method === 'GET' || request.method === 'HEAD') {
        if (route === '/' || route === '/overview') {
          const data = reader
            ? await reader.overview(url.searchParams.get('scope') ?? undefined)
            : store.overview(url.searchParams.get('scope') ?? undefined);
          sendJson(response, 200, {
            ok: true,
            data: {
              ...data,
              service: { available: service?.available === true, version: service?.version ?? null },
            },
          });
          return;
        }
        if (route === '/service') {
          const data = service
            ? await service.probe(url.searchParams.get('scope') ?? 'global')
            : { connected: false, version: null, reason: 'service bridge is null' };
          sendJson(response, 200, { ok: true, data });
          return;
        }
        if (route === '/core') {
          if (!reader) {
            sendJson(response, 503, { ok: false, error: 'memory reader unavailable' });
            return;
          }
          sendJson(response, 200, { ok: true, core: await reader.readCore(url.searchParams.get('scope') ?? undefined) });
          return;
        }
        if (route === '/persona') {
          if (!reader) {
            sendJson(response, 503, { ok: false, error: 'memory reader unavailable' });
            return;
          }
          sendJson(response, 200, { ok: true, persona: await reader.readPersona(url.searchParams.get('scope') ?? undefined) });
          return;
        }
        if (route === '/setup') {
          sendJson(response, 200, { ok: true, setup: await setupProbe.probe() });
          return;
        }
        if (route === '/depth') {
          if (!depth) {
            sendJson(response, 503, { ok: false, error: 'companion depth unavailable' });
            return;
          }
          const data = depth.state.data;
          sendJson(response, 200, {
            ok: true,
            depth: {
              status: depth.status(),
              focus: data.focus,
              health: data.health,
              affect: {
                targets: data.affect.targets,
                slots: data.affect.slots,
                updatedAt: data.affect.updatedAt,
              },
              queue: data.queue.slice(-10).reverse(),
              custom: depth.custom.overview(),
              customAreas: Object.values(data.customAreas ?? {}).map((area) => ({
                id: area.id,
                name: area.name,
                ttlDays: area.ttlDays,
                maxEntries: area.maxEntries,
                entries: Array.isArray(area.entries) ? area.entries.slice(-12).reverse() : [],
              })),
              features: store.readFeatures(),
              context: data.context.slice(-8).reverse(),
              verify: data.verify.filter((item) => item.status === 'pending').slice(-8).reverse(),
              sleep: data.sleep,
              dream: data.dream.items.slice(-5).reverse(),
              diary: data.diary.items.slice(-5).reverse(),
              brain: data.brain,
            },
          });
          return;
        }
        if (route === '/spark') {
          const id = url.searchParams.get('id') ?? '';
          const scope = url.searchParams.get('scope') ?? undefined;
          sendJson(response, 200, { ok: true, card: reader ? await reader.readSpark(id, scope) : store.readSpark(id, scope) });
          return;
        }
        if (route === '/topic') {
          const key = url.searchParams.get('key') ?? '';
          const scope = url.searchParams.get('scope') ?? undefined;
          sendJson(response, 200, { ok: true, topic: reader ? await reader.readTopic(key, scope) : store.readTopic(key, scope) });
          return;
        }
        if (route === '/timeline') {
          const offset = Number(url.searchParams.get('offset') ?? 0);
          const limit = Number(url.searchParams.get('limit') ?? 50);
          const scope = url.searchParams.get('scope') ?? undefined;
          const data = reader
            ? await reader.timeline({ scope, offset: Number.isFinite(offset) ? offset : 0, limit: Number.isFinite(limit) ? limit : 50 })
            : store.timeline({ scope, offset: Number.isFinite(offset) ? offset : 0, limit: Number.isFinite(limit) ? limit : 50 });
          sendJson(response, 200, { ok: true, data });
          return;
        }
        if (route === '/ping') {
          sendJson(response, 200, { ok: true, at: new Date().toISOString() });
          return;
        }
        sendJson(response, 404, { ok: false, error: 'not found' });
        return;
      }

      if (request.method === 'POST') {
        const body = await readJsonBody(request);
        if (!body) {
          sendJson(response, 400, { ok: false, error: '请求体必须是 JSON 对象' });
          return;
        }
        if (route === '/work') {
          const action = body.action;
          if (action === 'start') {
            const card = store.startWork(body);
            reader?.invalidate?.();
            sendJson(response, 200, { ok: true, card });
            return;
          }
          if (action === 'update') {
            const card = store.updateWork(body);
            reader?.invalidate?.();
            sendJson(response, 200, { ok: true, card });
            return;
          }
          if (action === 'finish') {
            const card = store.finishWork(body);
            reader?.invalidate?.();
            sendJson(response, 200, { ok: true, card });
            return;
          }
          if (action === 'archive') {
            const card = store.archiveWork(body);
            reader?.invalidate?.();
            sendJson(response, 200, { ok: true, card });
            return;
          }
          sendJson(response, 400, { ok: false, error: 'work action 必须是 start / update / finish / archive' });
          return;
        }
        if (route === '/features') {
          if (typeof body.key !== 'string' || !FEATURE_KEYS.includes(body.key)) {
            sendJson(response, 400, { ok: false, error: '未知开关' });
            return;
          }
          sendJson(response, 200, { ok: true, features: store.setFeature(body.key, body.value === true) });
          reader?.invalidate?.();
          return;
        }
        if (route === '/area/create') {
          if (!depth) {
            sendJson(response, 503, { ok: false, error: 'companion depth unavailable' });
            return;
          }
          try {
            const area = depth.custom.create({
              id: body.id,
              name: body.name,
              ttlDays: body.ttlDays,
              maxEntries: body.maxEntries,
            });
            sendJson(response, 200, { ok: true, area });
          } catch (error) {
            sendJson(response, 400, { ok: false, error: error instanceof Error ? error.message : String(error) });
          }
          return;
        }
        if (route === '/area/feed') {
          if (!depth) {
            sendJson(response, 503, { ok: false, error: 'companion depth unavailable' });
            return;
          }
          try {
            const item = depth.custom.feed(body.id, body.text, { source: 'panel' });
            sendJson(response, 200, { ok: true, item });
          } catch (error) {
            sendJson(response, 400, { ok: false, error: error instanceof Error ? error.message : String(error) });
          }
          return;
        }
        if (route === '/area/forget') {
          if (!depth) {
            sendJson(response, 503, { ok: false, error: 'companion depth unavailable' });
            return;
          }
          try {
            const result = depth.custom.forget(body.id, body.entryId);
            sendJson(response, 200, { ok: true, removed: result.removed });
          } catch (error) {
            sendJson(response, 400, { ok: false, error: error instanceof Error ? error.message : String(error) });
          }
          return;
        }
        if (route === '/area/purge') {
          if (!depth) {
            sendJson(response, 503, { ok: false, error: 'companion depth unavailable' });
            return;
          }
          sendJson(response, 200, { ok: true, removed: depth.custom.purge() });
          return;
        }
        if (route === '/commit') {
          if (!reader) {
            sendJson(response, 503, { ok: false, error: 'memory reader unavailable' });
            return;
          }
          if (typeof body.operationId !== 'string' || !body.operationId
            || !Array.isArray(body.changes) || body.changes.length !== 1) {
            sendJson(response, 400, { ok: false, error: 'commit 需要 operationId 和单条 changes' });
            return;
          }
          const scope = typeof body.scope === 'string' && body.scope ? body.scope : store.config.scope;
          const change = body.changes[0];
          const kind = change?.kind;
          const valid = kind === 'spark'
            ? typeof change.id === 'string' && change.id
              && Number.isInteger(change.expectedRevision) && change.expectedRevision >= 1
              && change.patch && typeof change.patch === 'object' && !Array.isArray(change.patch)
            : ['core', 'topic', 'persona'].includes(kind)
              && typeof change.text === 'string'
              && typeof change.expectedRevision === 'string' && change.expectedRevision;
          if (!valid) {
            sendJson(response, 400, { ok: false, error: 'commit 参数不完整（kind / text / expectedRevision / patch）' });
            return;
          }
          const backup = backupChange(store, scope, change);
          try {
            const result = await reader.commit({ ...body, scope });
            sendJson(response, 200, { ok: true, result, backup });
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            sendJson(response, statusFor(error), { ok: false, error: message, code: error?.code ?? null, backup });
          }
          return;
        }
        sendJson(response, 404, { ok: false, error: 'not found' });
        return;
      }

      response.writeHead(405, { allow: 'GET, HEAD, POST, OPTIONS' });
      response.end();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger?.warn?.(`shiori-companion: ${message}`);
      sendJson(response, statusFor(error), { ok: false, error: message, code: error?.code ?? null });
    }
  };

    try {
      const dispose = server.register({ kind: 'prefix', path: API_BASE, handler });
      logger?.info?.(`shiori-companion: API 已挂载 ${API_BASE}`);
      return dispose;
    } catch (error) {
      logger?.warn?.(`shiori-companion: API 挂载失败：${error instanceof Error ? error.message : String(error)}`);
      return () => {};
    }
  }

  const server = typeof ctx.get === 'function' ? ctx.get('webServer') : undefined;
  if (server && typeof server.register === 'function') return mountOn(server);

  logger?.warn?.('shiori-companion: webServer 暂不可用，等待宿主注入');
  if (typeof ctx.inject === 'function') {
    try {
      const injected = ctx.inject(['webServer'], (webCtx) => {
        const late = webCtx && typeof webCtx.get === 'function' ? webCtx.get('webServer') : undefined;
        if (!late || typeof late.register !== 'function') return undefined;
        return webCtx.effect(() => mountOn(late), 'shiori-companion: http (late webServer)');
      });
      if (typeof injected === 'function') return injected;
    } catch (error) {
      logger?.warn?.(`shiori-companion: 延迟挂载 webServer 失败：${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return () => {};
}
