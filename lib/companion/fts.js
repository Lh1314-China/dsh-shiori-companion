import path from 'node:path';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { tokens } from './recall.js';

const require = createRequire(import.meta.url);

function escapeToken(token) {
  return `"${String(token).replace(/"/g, '""')}"`;
}

export function createFts({ stateRoot, logger = null } = {}) {
  let db = null;
  try {
    const { DatabaseSync } = require('node:sqlite');
    const dir = path.join(stateRoot, 'plus', 'companion');
    mkdirSync(dir, { recursive: true });
    db = new DatabaseSync(path.join(dir, 'recall.sqlite'));
    db.exec('CREATE VIRTUAL TABLE IF NOT EXISTS docs USING fts5(source UNINDEXED, docid UNINDEXED, text UNINDEXED, body)');
  } catch (error) {
    logger?.warn?.(`companion FTS unavailable: ${error instanceof Error ? error.message : String(error)}`);
    db = null;
  }

  function sync(corpus) {
    if (!db) return false;
    try {
      db.exec('BEGIN');
      db.exec('DELETE FROM docs');
      const insert = db.prepare('INSERT INTO docs(source, docid, text, body) VALUES (?, ?, ?, ?)');
      for (const doc of corpus) {
        const body = [...tokens(`${doc.id ?? ''} ${doc.text ?? ''}`)].join(' ');
        if (body) insert.run(String(doc.source ?? 'memory'), String(doc.id ?? ''), String(doc.text ?? ''), body);
      }
      db.exec('COMMIT');
      return true;
    } catch (error) {
      try { db.exec('ROLLBACK'); } catch { /* ignore */ }
      logger?.warn?.(`companion FTS sync failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  function search(query, { limit = 20 } = {}) {
    if (!db) return [];
    const q = [...tokens(query)].slice(0, 40).map(escapeToken);
    if (!q.length) return [];
    try {
      const rows = db.prepare('SELECT source, docid, text, bm25(docs) AS rank FROM docs WHERE docs MATCH ? ORDER BY rank LIMIT ?')
        .all(q.join(' OR '), Math.max(1, Math.min(50, limit)));
      return rows.map((row) => ({
        source: row.source,
        id: row.docid,
        text: row.text,
        score: Math.round((1 / (1 + Math.abs(Number(row.rank) || 0))) * 1000) / 1000,
      }));
    } catch (error) {
      logger?.warn?.(`companion FTS query failed: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  function close() {
    try { db?.close(); } catch { /* ignore */ }
    db = null;
  }

  return { available: db !== null, sync, search, close, file: db ? path.join(stateRoot, 'plus', 'companion', 'recall.sqlite') : null };
}
