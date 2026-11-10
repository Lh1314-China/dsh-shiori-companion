/**
 * Optional bridge to the shiori companion service (proposal v1).
 *
 * The service is an in-process Cordis service, not a network API and not a key.
 * It is resolved lazily: shiori may finish `apply()` after this plugin, so the
 * bridge must not cache "not available" at plugin load time.
 */
export function createServiceBridge(ctx) {
  function resolveService() {
    try {
      const via = ctx && typeof ctx.get === 'function' ? ctx.get('shioriCompanion') : undefined;
      if (via) return via;
    } catch {
      /* fall through to root lookup */
    }
    try {
      const root = ctx?.root;
      if (root && typeof root.get === 'function') {
        const via = root.get('shioriCompanion');
        if (via) return via;
      }
    } catch {
      /* absent is a valid state */
    }
    return undefined;
  }

  function availableService() {
    const service = resolveService();
    return service && service.version >= 1 && service.read && typeof service.read.core === 'function'
      ? service
      : undefined;
  }

  async function probe(scope = 'global') {
    const service = availableService();
    if (!service) {
      return { connected: false, version: null, reason: 'shioriCompanion service is not available' };
    }
    const status = typeof service.status === 'function' ? await service.status() : null;
    const scopes = typeof service.scopes === 'function' ? await service.scopes() : [];
    const core = await service.read.core(scope);
    const sparks = await service.read.sparks(scope);
    return {
      connected: true,
      version: service.version,
      status,
      scopes,
      coreChars: typeof core?.text === 'string' ? core.text.length : 0,
      sparkCount: Array.isArray(sparks) ? sparks.length : 0,
    };
  }

  return {
    get available() {
      return Boolean(availableService());
    },
    get version() {
      return availableService()?.version ?? null;
    },
    get service() {
      return resolveService();
    },
    async status() {
      const service = availableService();
      if (!service || typeof service.status !== 'function') return null;
      return service.status();
    },
    async scopes() {
      const service = availableService();
      if (!service || typeof service.scopes !== 'function') return [];
      return service.scopes();
    },
    probe,
    async readCore(scope = 'global') {
      const service = availableService();
      return service ? service.read.core(scope) : null;
    },
    async readPersona(scope = 'global') {
      const service = availableService();
      return service ? service.read.persona(scope) : null;
    },
    async readTopics(scope = 'global') {
      const service = availableService();
      return service ? service.read.topics(scope) : [];
    },
    async readTopic(key, scope = 'global') {
      const service = availableService();
      return service ? service.read.topic(key, scope) : null;
    },
    async readSparks(scope = 'global', opts = {}) {
      const service = availableService();
      return service ? service.read.sparks(scope, opts) : [];
    },
    async readSpark(id, scope = 'global') {
      const service = availableService();
      return service ? service.read.spark(id, scope) : null;
    },
    async readTimeline(scope = 'global', opts = {}) {
      const service = availableService();
      if (!service || typeof service.read.timeline !== 'function') return null;
      return service.read.timeline(scope, opts);
    },
    async commit(request) {
      const service = availableService();
      if (!service || typeof service.commit !== 'function') {
        throw Object.assign(new Error('shioriCompanion commit is unavailable'), { code: 'UNSUPPORTED' });
      }
      return service.commit(request);
    },
    onCommit(listener) {
      const service = availableService();
      if (!service || typeof service.onCommit !== 'function') return () => {};
      return service.onCommit(listener);
    },
  };
}
