/**
 * Companion depth modules share one JSON state under stateRoot/plus/companion.
 * It is deliberately separate from shiori's own dataRoot: the panel/read path
 * stays read-only for L0-L3, and only these companion-side notes live here.
 */
import path from 'node:path';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';

export const STATE_VERSION = 1;

export function nowIso() {
  return new Date().toISOString();
}

export function hashText(text) {
  return createHash('sha256').update(String(text ?? '')).digest('hex').slice(0, 16);
}

function defaults() {
  const at = nowIso();
  return {
    version: STATE_VERSION,
    createdAt: at,
    updatedAt: at,
    queue: [],
    hippo1: [],
    hippo2: [],
    context: [],
    customAreas: {},
    verify: [],
    judgments: [],
    decisions: [],
    narrative: [],
    observations: [],
    brain: {
      left: { weight: 1, correct: 0, wrong: 0 },
      right: { weight: 1, correct: 0, wrong: 0 },
      mixed: { weight: 1, correct: 0, wrong: 0 },
    },
    lexicon: {},
    lexiconCandidates: [],
    emotionEvents: [],
    affect: { targets: {}, slots: Array.from({ length: 5 }, () => null), log: [], updatedAt: at },
    focus: { text: '', updatedAt: at },
    sleep: { lastAt: null, reports: [] },
    timeline: { firstSeenAt: at, lastSeenAt: at, sessions: 1, lastGapMs: 0, nostalgia: null },
    health: { at: null, score: 100, issues: [], ok: [] },
    dream: { items: [] },
    diary: { items: [] },
    evolve: { candidates: [] },
    recall: { queries: [] },
  };
}

function mergeDefaults(value, base) {
  if (Array.isArray(base)) return Array.isArray(value) ? value : base;
  if (base && typeof base === 'object') {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const out = { ...base };
    for (const key of Object.keys(base)) out[key] = mergeDefaults(source[key], base[key]);
    for (const key of Object.keys(source)) if (!(key in out)) out[key] = source[key];
    return out;
  }
  return value === undefined ? base : value;
}

export class CompanionState {
  constructor({ stateRoot, logger = null }) {
    this.logger = logger;
    this.dir = path.join(stateRoot, 'plus', 'companion');
    this.file = path.join(this.dir, 'state.json');
    this.backupFile = path.join(this.dir, 'state.json.bak');
    this.data = this.load();
  }

  load() {
    try {
      mkdirSync(this.dir, { recursive: true });
      if (!existsSync(this.file)) return defaults();
      const parsed = JSON.parse(readFileSync(this.file, 'utf8'));
      return mergeDefaults(parsed, defaults());
    } catch (error) {
      this.logger?.warn?.(`companion state load failed: ${error instanceof Error ? error.message : String(error)}`);
      return defaults();
    }
  }

  save() {
    mkdirSync(this.dir, { recursive: true });
    if (existsSync(this.file)) {
      try {
        copyFileSync(this.file, this.backupFile);
      } catch {
        /* best-effort backup */
      }
    }
    const temp = `${this.file}.tmp`;
    this.data.updatedAt = nowIso();
    writeFileSync(temp, `${JSON.stringify(this.data, null, 2)}\n`, 'utf8');
    renameSync(temp, this.file);
  }

  transaction(fn) {
    const result = fn(this.data);
    this.save();
    return result;
  }

  status() {
    return {
      file: this.file,
      version: this.data.version,
      updatedAt: this.data.updatedAt,
      queue: this.data.queue.length,
      hippo1: this.data.hippo1.length,
      hippo2: this.data.hippo2.length,
      context: this.data.context.length,
      verifyPending: this.data.verify.filter((item) => item.status === 'pending').length,
      judgments: this.data.judgments.length,
      emotionEvents: this.data.emotionEvents.length,
      affectTargets: Object.keys(this.data.affect.targets || {}).length,
      sleepReports: this.data.sleep.reports.length,
      health: this.data.health.score,
    };
  }
}
