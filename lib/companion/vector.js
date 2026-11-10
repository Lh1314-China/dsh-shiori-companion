import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import { hashText } from './state.js';

const require = createRequire(import.meta.url);
const MODEL = 'Xenova/bge-small-zh-v1.5';

function resolveTransformers() {
  const explicit = process.env.COMPANION_TRANSFORMERS_PATH;
  if (explicit) return pathToFileURL(explicit).href;
  try {
    return pathToFileURL(require.resolve('@huggingface/transformers')).href;
  } catch {
    return null;
  }
}

function cosine(a, b) {
  let dot = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) dot += a[i] * b[i];
  return dot;
}

export function createVector({ stateRoot, logger = null } = {}) {
  const moduleUrl = resolveTransformers();
  const modelDir = process.env.COMPANION_MODEL_DIR || path.join(stateRoot, 'plus', 'models');
  const bundledModelDir = process.env.COMPANION_BUNDLED_MODEL_DIR || modelDir;
  const bundled = existsSync(path.join(bundledModelDir, 'Xenova', 'bge-small-zh-v1.5', 'config.json'));
  let extractorPromise = null;
  const cache = new Map();

  async function getExtractor() {
    if (!moduleUrl) throw new Error('@huggingface/transformers 不可用');
    if (!extractorPromise) {
      extractorPromise = (async () => {
        const mod = await import(moduleUrl);
        const api = mod.env && mod.pipeline ? mod : mod.default;
        const env = api?.env;
        const pipeline = api?.pipeline;
        if (!env || typeof pipeline !== 'function') throw new Error('transformers module has no env/pipeline');
        env.remoteHost = process.env.COMPANION_HF_HOST || 'https://hf-mirror.com';
        mkdirSync(modelDir, { recursive: true });
        env.cacheDir = modelDir;
        if (bundled) {
          env.localModelPath = bundledModelDir;
          env.allowRemoteModels = false;
        }
        return pipeline('feature-extraction', MODEL, { quantized: true });
      })().catch((error) => {
        extractorPromise = null;
        logger?.warn?.(`companion vector load failed: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      });
    }
    return extractorPromise;
  }

  async function embed(texts) {
    const extractor = await getExtractor();
    const values = texts.map((text) => String(text ?? '').slice(0, 1200));
    const output = await extractor(values, { pooling: 'mean', normalize: true });
    const rows = typeof output?.tolist === 'function' ? output.tolist() : null;
    if (!rows) throw new Error('embedding output has no tolist()');
    return rows;
  }

  async function search(query, docs, { limit = 20 } = {}) {
    if (!moduleUrl || !Array.isArray(docs) || docs.length === 0) return [];
    const missing = docs.filter((doc) => !cache.has(hashText(`${doc.source}:${doc.id}:${doc.text}`)));
    if (missing.length) {
      const vectors = await embed(missing.map((doc) => doc.text));
      missing.forEach((doc, index) => {
        cache.set(hashText(`${doc.source}:${doc.id}:${doc.text}`), vectors[index]);
      });
    }
    const [queryVector] = await embed([query]);
    const scored = docs.map((doc) => ({
      ...doc,
      score: Math.round(cosine(queryVector, cache.get(hashText(`${doc.source}:${doc.id}:${doc.text}`)) ?? []) * 1000) / 1000,
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, Math.max(1, Math.min(30, limit)));
  }

  return {
    available: moduleUrl !== null,
    model: MODEL,
    modelDir,
    bundled,
    embed,
    search,
    clearCache: () => cache.clear(),
  };
}
