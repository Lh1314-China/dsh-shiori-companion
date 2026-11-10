/**
 * Configuration, file helpers, and the shared on-disk contract of this plugin.
 *
 * The plugin deliberately does not import dsh-shiori internals. It reads the
 * stable files that shiori 0.1–0.3 already own:
 *   <dataRoot>/persona/<scope>.md
 *   <dataRoot>/scopes/<scope>/core.md
 *   <dataRoot>/scopes/<scope>/topics/<key>.md
 *   <dataRoot>/sparks/scopes/<scope>/sparks.json
 * and writes only its own work cards and feature switches.
 */
import path from 'node:path';
import os from 'node:os';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs';

const DSH_HOME = process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
const DEFAULT_DATA_ROOT = process.env.SHIORI_DATA_ROOT || path.join(DSH_HOME, 'shiori-data');
const DEFAULT_STATE_ROOT = process.env.SHIORI_STATE_ROOT || path.join(DSH_HOME, 'shiori-state');
const DEFAULT_LEGACY_ROOT = path.join(DSH_HOME, 'companion-legacy');

export const DEFAULT_WORKSPACE = process.env.DSH_WORKSPACE || DEFAULT_LEGACY_ROOT;

export const DEFAULT_CONFIG = Object.freeze({
  dataRoot: DEFAULT_DATA_ROOT,
  stateRoot: DEFAULT_STATE_ROOT,
  scope: 'global',
  workFile: path.join(DEFAULT_STATE_ROOT, 'plus', 'work-cards.json'),
  featuresFile: path.join(DEFAULT_STATE_ROOT, 'plus', 'features.json'),
  archiveIndex: path.join(DEFAULT_STATE_ROOT, 'plus', 'archive', 'index.json'),
  legacyWorkFile: path.join(DEFAULT_LEGACY_ROOT, 'work-cards.json'),
  legacyFeaturesFile: path.join(DEFAULT_LEGACY_ROOT, 'features.json'),
  legacyArchiveIndex: path.join(DEFAULT_LEGACY_ROOT, 'archive', 'index.json'),
  coreTargetChars: 16000,
  coreHardChars: 20000,
  personaMaxChars: 12000,
  sparkMaxChars: 600,
});

export const FEATURE_KEYS = Object.freeze([
  'features.recall',
  'features.health',
  'features.judge',
  'features.collect',
  'features.archive',
  'features.snapshot',
  'features.graph',
  'features.web_learn',
  'features.prompt_section',
  'features.vector',
  'features.custom_areas',
  'features.dream',
  'features.diary',
  'features.sleep',
  'features.focus',
  'features.judge_ai',
  'features.web_search',
  'features.evolve',
]);

export const FEATURE_LABELS = Object.freeze({
  'features.recall': '记忆检索',
  'features.health': '记忆体检',
  'features.judge': '判定与反馈',
  'features.collect': '每日收工',
  'features.archive': '归档库',
  'features.snapshot': '快照导出',
  'features.graph': '火花图谱',
  'features.web_learn': '联网摘要',
  'features.prompt_section': '提示词注入',
  'features.vector': '向量检索',
  'features.custom_areas': '自定义记忆区',
  'features.dream': '梦记',
  'features.diary': '日记',
  'features.sleep': '睡眠整理',
  'features.focus': '当前关注点',
  'features.judge_ai': 'AI 判定',
  'features.web_search': '联网搜索',
  'features.evolve': '自我进化沙盒',
});

function stringPath(value, fallback) {
  if (typeof value !== 'string' || value.trim() === '') return fallback;
  return path.isAbsolute(value) ? value : fallback;
}

function integer(value, fallback, min, max) {
  if (!Number.isInteger(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function safeScope(value) {
  if (typeof value !== 'string') return 'global';
  const scope = value.trim();
  if (scope === 'global') return scope;
  if (!scope || scope.length > 128) return 'global';
  if (/[<>:"/\\|?*\u0000-\u001f]/.test(scope)) return 'global';
  if (scope === '.' || scope === '..' || scope.endsWith('.') || scope.endsWith(' ')) return 'global';
  return scope;
}

export function normalizeConfig(raw = {}) {
  const input = raw && typeof raw === 'object' ? raw : {};
  const coreHard = integer(input.coreHardChars, DEFAULT_CONFIG.coreHardChars, 1000, 200000);
  const coreTarget = integer(input.coreTargetChars, DEFAULT_CONFIG.coreTargetChars, 500, coreHard);
  const stateRoot = stringPath(input.stateRoot, DEFAULT_CONFIG.stateRoot);
  const plusRoot = path.join(stateRoot, 'plus');
  return Object.freeze({
    dataRoot: stringPath(input.dataRoot, DEFAULT_CONFIG.dataRoot),
    stateRoot,
    scope: safeScope(input.scope),
    workFile: stringPath(input.workFile, path.join(plusRoot, 'work-cards.json')),
    featuresFile: stringPath(input.featuresFile, path.join(plusRoot, 'features.json')),
    archiveIndex: stringPath(input.archiveIndex, path.join(plusRoot, 'archive', 'index.json')),
    legacyWorkFile: stringPath(input.legacyWorkFile, DEFAULT_CONFIG.legacyWorkFile),
    legacyFeaturesFile: stringPath(input.legacyFeaturesFile, DEFAULT_CONFIG.legacyFeaturesFile),
    legacyArchiveIndex: stringPath(input.legacyArchiveIndex, DEFAULT_CONFIG.legacyArchiveIndex),
    coreTargetChars: coreTarget,
    coreHardChars: coreHard,
    personaMaxChars: integer(input.personaMaxChars, DEFAULT_CONFIG.personaMaxChars, 100, 200000),
    sparkMaxChars: integer(input.sparkMaxChars, DEFAULT_CONFIG.sparkMaxChars, 50, 10000),
  });
}

export function readJsonResult(file) {
  try {
    if (!existsSync(file)) return { ok: false, missing: true, value: null, error: null };
    const text = readFileSync(file, 'utf8');
    return { ok: true, missing: false, value: JSON.parse(text), error: null };
  } catch (error) {
    return {
      ok: false,
      missing: false,
      value: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function readJson(file, fallback) {
  const result = readJsonResult(file);
  return result.ok ? result.value : fallback;
}

export function writeJsonAtomic(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  renameSync(tmp, file);
}

export function readTextOrNull(file) {
  try {
    if (!existsSync(file)) return null;
    return readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

export function statOf(file) {
  try {
    if (!existsSync(file)) return null;
    return statSync(file);
  } catch {
    return null;
  }
}

export function byteSize(text) {
  return typeof text === 'string' ? Buffer.byteLength(text, 'utf8') : 0;
}

export function truncate(text, max) {
  const value = typeof text === 'string' ? text : '';
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(0, max - 1))}…`;
}

export function validateTopicKey(key) {
  if (typeof key !== 'string' || key.length === 0 || key.length > 128) {
    throw Object.assign(new Error('专题 key 不合法'), { code: 'INVALID_INPUT' });
  }
  if (key === '.' || key === '..' || /[<>:"/\\|?*\u0000-\u001f]/.test(key)) {
    throw Object.assign(new Error('专题 key 含非法字符'), { code: 'INVALID_INPUT' });
  }
  if (key.endsWith('.') || key.endsWith(' ')) {
    throw Object.assign(new Error('专题 key 不能以点或空格结尾'), { code: 'INVALID_INPUT' });
  }
  return key;
}

export function validateSparkId(id) {
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(id)) {
    throw Object.assign(new Error('火花卡 id 不合法'), { code: 'INVALID_INPUT' });
  }
  return id;
}

export function isInside(root, target) {
  const rel = path.relative(root, target);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

export function parseFrontMatter(text) {
  const meta = {};
  const source = typeof text === 'string' ? text : '';
  if (!source.startsWith('---')) return { meta, body: source };
  const end = source.indexOf('\n---', 3);
  if (end < 0) return { meta, body: source };
  const header = source.slice(3, end).split(/\r?\n/);
  for (const line of header) {
    const at = line.indexOf(':');
    if (at <= 0) continue;
    const key = line.slice(0, at).trim();
    let value = line.slice(at + 1).trim();
    if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
      value = value.slice(1, -1);
    }
    if (key) meta[key] = value;
  }
  const body = source.slice(end + 4).replace(/^\r?\n/, '');
  return { meta, body };
}
