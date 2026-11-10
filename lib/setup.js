import path from 'node:path';
import { existsSync, statSync } from 'node:fs';

function hasNonPortableChars(value) {
  return /[^\x20-\x7e]/.test(String(value ?? ''));
}

export function createSetupProbe(store, service = null) {
  async function probe() {
    const cfg = store.config;
    const checks = [];
    const add = (name, ok, detail) => checks.push({ name, ok: !!ok, detail });
    add('dataRoot', existsSync(cfg.dataRoot), cfg.dataRoot);
    add('stateRoot', existsSync(cfg.stateRoot), cfg.stateRoot);
    add('persona', existsSync(path.join(cfg.dataRoot, 'persona')), path.join(cfg.dataRoot, 'persona'));
    add('core', existsSync(path.join(cfg.dataRoot, 'scopes', cfg.scope, 'core.md')), path.join(cfg.dataRoot, 'scopes', cfg.scope, 'core.md'));
    add('topics', existsSync(path.join(cfg.dataRoot, 'scopes', cfg.scope, 'topics')), path.join(cfg.dataRoot, 'scopes', cfg.scope, 'topics'));
    add('sparks', existsSync(path.join(cfg.dataRoot, 'sparks', 'scopes', cfg.scope, 'sparks.json')), path.join(cfg.dataRoot, 'sparks', 'scopes', cfg.scope, 'sparks.json'));
    add('stateRoot writable', existsSync(cfg.stateRoot) && statSync(cfg.stateRoot).isDirectory(), cfg.stateRoot);
    const available = service?.available === true;
    add('shioriCompanion', available, available ? `connected v${service.version}` : 'not connected; read fallback only');
    const modelDir = process.env.COMPANION_BUNDLED_MODEL_DIR
      || path.join(cfg.stateRoot, 'plus', 'models');
    const modelBase = path.join(modelDir, 'Xenova', 'bge-small-zh-v1.5');
    const bundledModel = existsSync(path.join(modelBase, 'config.json')) && existsSync(path.join(modelBase, 'onnx'));
    const addCheck = (name, ok, detail, optional = false) => checks.push({ name, ok: !!ok, detail, optional });
    addCheck('vector model (optional)', bundledModel, bundledModel ? modelBase : `未安装；可放 ${modelBase}`, true);
    addCheck('vector license (optional)', existsSync(path.join(modelBase, 'LICENSE')), path.join(modelBase, 'LICENSE'), true);
    const pathWarnings = [];
    for (const [key, value] of Object.entries({ dataRoot: cfg.dataRoot, stateRoot: cfg.stateRoot, workFile: cfg.workFile })) {
      if (hasNonPortableChars(value)) pathWarnings.push(`${key} 含非 ASCII 字符（${value}），分发/安装时建议用英文路径`);
    }
    const snippet = [
      '- id: shiori-companion',
      '  config:',
      `    dataRoot: ${JSON.stringify(cfg.dataRoot)}`,
      `    stateRoot: ${JSON.stringify(cfg.stateRoot)}`,
      `    scope: ${JSON.stringify(cfg.scope)}`,
      `    coreTargetChars: ${cfg.coreTargetChars}`,
      `    coreHardChars: ${cfg.coreHardChars}`,
    ].join('\n');
    return { checks, warnings: pathWarnings, snippet, dataRoot: cfg.dataRoot, stateRoot: cfg.stateRoot, scope: cfg.scope, vectorModel: { bundled: bundledModel, dir: modelBase } };
  }
  return { probe };
}
