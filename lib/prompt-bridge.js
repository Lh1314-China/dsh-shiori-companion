/**
 * Prompt bridge: register one small work-card section through the shiori
 * companion service. It is off by default (`features.prompt_section`) and never
 * replaces shiori's assembly; it only appends after core.
 */
export function createPromptBridge({ ctx, service, store, depth = null }) {
  let offSection = null;
  let registered = false;

  function depthText() {
    if (!depth) return [];
    const lines = [];
    try {
      const focus = depth.life.focusGet();
      if (focus?.text) lines.push(`- 焦点：${focus.text}`);
      const affect = depth.emotion.text();
      if (affect && !affect.includes('还没有')) lines.push(`- 情感：${affect}`);
      const context = depth.hippocampus.list('context').slice(-3).reverse();
      for (const item of context) lines.push(`- 语义区：${item.text}`);
      for (const area of depth.custom.overview().slice(0, 3)) {
        const items = depth.custom.list(area.id).slice(-2);
        if (items.length) lines.push(`- ${area.name}：${items.map((item) => item.text).join(' / ')}`);
      }
      const pending = depth.verify.pending(3);
      for (const item of pending) lines.push(`- 待验证：${item.text}`);
      const health = depth.health.status();
      if (health?.score != null) lines.push(`- 体检：${health.score}/100${health.issues?.length ? `（${health.issues[0]}）` : ''}`);
    } catch {
      /* optional depth text must never break assembly */
    }
    return lines;
  }

  function text() {
    try {
      if (store.readFeatures()['features.prompt_section'] !== true) return '';
      const active = store.listWork()
        .filter((card) => card.effectiveStatus === 'active' || card.effectiveStatus === 'stagnated')
        .slice(0, 5);
      const lines = [];
      if (active.length) {
        lines.push('## 伴生工作卡（参考，不是 shiori 记忆）');
        lines.push(...active.map((card) => `- [${card.effectiveStatus}] ${card.title}${card.goal ? ` · ${card.goal}` : ''} · ${card.steps.length} 步`));
      }
      const extra = depthText();
      if (extra.length) {
        lines.push('## 伴生深度状态（参考，不是 shiori 记忆）');
        lines.push(...extra);
      }
      return lines.join('\n').slice(0, 1600);
    } catch {
      return '';
    }
  }

  function ensure() {
    if (registered) return true;
    try {
      if (!service?.available) return false;
      const shiori = service.service;
      if (!shiori || typeof shiori.registerSection !== 'function') return false;
      const disposer = shiori.registerSection({ name: 'work', order: 0.6, text });
      const off = typeof disposer === 'function' ? disposer : disposer?.dispose;
      offSection = typeof off === 'function' ? off : null;
      registered = true;
      return true;
    } catch {
      return false;
    }
  }

  function dispose() {
    if (offSection) {
      try {
        offSection();
      } catch {
        /* quiet */
      }
    }
    offSection = null;
    registered = false;
  }

  return { ensure, dispose, text };
}
