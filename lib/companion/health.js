import { nowIso } from './state.js';

export function createHealth(state, { reader = null, coreTarget = 16000, coreHard = 20000, personaMax = 12000 } = {}) {
  async function check() {
    const issues = [];
    const ok = [];
    let overview = null;
    if (reader && typeof reader.overview === 'function') {
      try {
        overview = await reader.overview();
      } catch {
        overview = null;
      }
    }
    if (overview) {
      const core = overview.layers?.L1;
      if (core) {
        if (core.chars > core.hard) issues.push(`L1 核心超过硬顶：${core.chars}/${core.hard}`);
        else if (core.chars > core.target) issues.push(`L1 核心超过软目标：${core.chars}/${core.target}`);
        else ok.push(`L1 核心 ${core.chars} 字，在预算内`);
      }
      const persona = overview.layers?.L0;
      if (persona?.chars > personaMax) issues.push(`L0 人设超过上限：${persona.chars}/${personaMax}`);
      if (overview.layers?.L2?.active > 300) issues.push(`L2 火花卡过多：${overview.layers.L2.active}`);
    } else {
      issues.push('读不到 shiori 数据，无法检查 L0-L3');
    }
    const queue = state.data.queue.length;
    if (queue > 50) issues.push(`喂料队列积压：${queue} 条`);
    else if (queue > 0) ok.push(`队列 ${queue} 条，待收工`);
    const pending = state.data.verify.filter((item) => item.status === 'pending').length;
    if (pending > 10) issues.push(`待验证项过多：${pending}`);
    else if (pending > 0) ok.push(`待验证 ${pending} 条`);
    const contextChars = state.data.context.reduce((sum, item) => sum + String(item.text ?? '').length, 0);
    if (contextChars > Math.max(1000, Math.floor(coreHard / 2))) issues.push(`语义思考区超容：${contextChars}`);
    if (!state.data.focus.text) issues.push('当前焦点为空');
    const score = Math.max(0, 100 - issues.length * 8);
    const report = { at: nowIso(), score, issues, ok, queue, pending, contextChars };
    state.data.health = report;
    state.save();
    return report;
  }

  function status() {
    return state.data.health;
  }

  return { check, status };
}

export function createEvolve(state) {
  function propose(report = null) {
    const source = report || state.data.health;
    const candidates = [];
    for (const issue of source.issues ?? []) {
      candidates.push({
        id: `ev-${Date.now().toString(36)}-${candidates.length}`,
        title: `处理：${issue}`,
        reason: issue,
        status: 'proposed',
        at: nowIso(),
      });
    }
    if (candidates.length === 0) {
      candidates.push({
        id: `ev-${Date.now().toString(36)}`,
        title: '保持现状，观察一轮',
        reason: '体检没有发现问题',
        status: 'proposed',
        at: nowIso(),
      });
    }
    state.data.evolve.candidates.push(...candidates);
    if (state.data.evolve.candidates.length > 50) {
      state.data.evolve.candidates.splice(0, state.data.evolve.candidates.length - 50);
    }
    state.save();
    return candidates;
  }

  function list() {
    return state.data.evolve.candidates.slice(-20).reverse();
  }

  return { propose, list };
}
