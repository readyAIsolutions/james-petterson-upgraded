'use strict';
/**
 * Case routes - CRUD over the canonical cases table (node:sqlite).
 * Note: rich case reading/generation lives in app.js via services; this file
 * provides the thin versioned-case CRUD layer.
 */
const express = require('express');
const { getDb } = require('../shared/database');

const router = express.Router();

function pick(reqBody, manifest) {
  return {
    title: reqBody.title || manifest.title || 'Untitled',
    difficulty: reqBody.difficulty || manifest.difficulty || 'medium',
    seed: reqBody.seed || manifest.seed || null,
    premise: reqBody.premise || manifest.premise || null,
    description: reqBody.description || manifest.description || null,
    manifest: reqBody.manifest || manifest,
  };
}

router.get('/cases', (req, res) => {
  const db = getDb();
  const includeDrafts = req.query.include_drafts === 'true' || req.query.include_drafts === '1';
  const rows = includeDrafts
    ? db.prepare('SELECT id, title, version, difficulty, status, canonical_hash FROM cases').all()
    : db.prepare("SELECT id, title, version, difficulty, status, canonical_hash FROM cases WHERE status = 'published'").all();
  res.json({ cases: rows });
});

router.get('/cases/:caseId', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM cases WHERE id = ? ORDER BY version DESC LIMIT 1').get(req.params.caseId);
  if (!row) return res.status(404).json({ error: 'Case not found' });
  res.json(row);
});

router.post('/cases', (req, res) => {
  const db = getDb();
  const { id, ...rest } = req.body;
  const caseId = id || `case_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const p = pick(rest, {});
  db.prepare(`
    INSERT OR REPLACE INTO cases (id, version, title, status, difficulty, seed, premise, description)
    VALUES (?, 'v1', ?, 'published', ?, ?, ?, ?)
  `).run(caseId, p.title, p.difficulty, p.seed, p.premise, p.description);
  res.status(201).json({ id: caseId, version: 'v1', message: 'Case created' });
});

router.delete('/cases/:caseId', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM cases WHERE id = ?').run(req.params.caseId);
  res.json({ id: req.params.caseId, message: 'Case deleted' });
});

module.exports = router;
