'use strict';
/**
 * App factory - assembles the Express API from services.
 * Made a factory (not a singleton) so tests can spin up fresh instances
 * against an isolated in-memory DB.
 */
const express = require('express');

function createApp({ db, aiGateway, sessionService, npcOrchestrator, caseRepo, caseGenerator }) {
  const app = express();
  app.use(express.json());

  // ---- Health / meta ----
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'ai-detective-platform', v: '0.1.0' });
  });

  // ---- Case API ----
  app.get('/api/cases', (req, res) => {
    const list = caseRepo.list(!!req.query.include_drafts);
    res.json({ cases: list });
  });

  app.post('/api/cases/:id/load', (req, res) => {
    try {
      const saved = caseRepo.save({ id: req.params.id, ...(req.body && req.body.manifest ? { manifest: req.body.manifest, title: req.body.title, difficulty: req.body.difficulty } : { manifest: { }, title: 'Empty', difficulty: 'medium' }) });
      res.json(saved);
    } catch (e) { res.status(400).json({ error: e.message }); }
  });

  app.get('/api/cases/:id', (req, res) => {
    const manifest = caseRepo.load(req.params.id);
    if (!manifest) return res.status(404).json({ error: 'Case not found' });
    res.json(manifest);
  });

  app.get('/api/cases/:id/status', (req, res) => {
    res.json({ id: req.params.id, status: caseRepo.getStatus(req.params.id) });
  });

  // Validate a case manifest (deterministic core IP)
  app.post('/api/validate', (req, res) => {
    const manifest = req.body?.manifest;
    if (!manifest || typeof manifest !== 'object') {
      return res.status(400).json({ error: 'manifest object required' });
    }
    const { CaseValidator } = require('./case-validator');
    const result = new CaseValidator().validate(manifest);
    res.json(result);
  });

  // ---- Session API ----
  app.post('/api/sessions', (req, res) => {
    try {
      const caseId = req.body?.caseId;
      if (typeof caseId !== 'string' || !caseId.trim()) {
        return res.status(400).json({ error: 'caseId is required' });
      }
      const s = sessionService.start({ userId: req.body.userId || null, caseId: caseId.trim() });
      res.status(201).json(s);
    } catch (e) { res.status(400).json({ error: e.message }); }
  });

  app.get('/api/sessions/:id', (req, res) => {
    try { res.json(sessionService._getSession(req.params.id)); }
    catch (e) { res.status(404).json({ error: e.message }); }
  });

  app.get('/api/sessions/:id/briefing', (req, res) => {
    try { res.json(sessionService.getBriefing(req.params.id)); }
    catch (e) { res.status(404).json({ error: e.message }); }
  });

  app.post('/api/sessions/:id/briefing/seen', (req, res) => {
    try { res.json(sessionService.markBriefingSeen(req.params.id)); }
    catch (e) { res.status(404).json({ error: e.message }); }
  });

  app.get('/api/sessions/:id/inventory', (req, res) => {
    try { res.json({ evidence: sessionService.inventory(req.params.id) }); }
    catch (e) { res.status(404).json({ error: e.message }); }
  });

  app.get('/api/sessions/:id/discoverable', (req, res) => {
    try { res.json({ evidence: sessionService.discoverableEvidence(req.params.id) }); }
    catch (e) { res.status(404).json({ error: e.message }); }
  });

  app.post('/api/sessions/:id/discover', (req, res) => {
    try { res.json(sessionService.discover(req.params.id, req.body.evidenceId)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  });

  app.post('/api/sessions/:id/hypothesis', (req, res) => {
    try { res.json(sessionService.addHypothesisEdge(req.params.id, req.body)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  });

  app.post('/api/sessions/:id/accuse', (req, res) => {
    try {
      const r = sessionService.accuse(req.params.id, req.body);
      res.json(r);
    } catch (e) { res.status(400).json({ error: e.message }); }
  });

  // ---- NPC API ----
  app.post('/api/sessions/:id/interview', async (req, res) => {
    try {
      const session = sessionService._getSession(req.params.id);
      const response = await npcOrchestrator.respond({
        session,
        characterId: req.body.characterId,
        question: req.body.question,
        presentedEvidence: (req.body.presentedEvidenceIds || []).map(id =>
          ({ id, title: id })
        ),
      });
      res.json(response);
    } catch (e) { res.status(400).json({ error: e.message }); }
  });

  // ---- Generator API ----
  app.post('/api/cases/generate', async (req, res) => {
    try {
      const params = req.body && typeof req.body === 'object' ? req.body : {};
      const result = await caseGenerator.generateFromPremise(params);
      if (!result.ok) return res.status(422).json({ error: 'generated case failed validation', errors: result.errors });
      res.json({ ok: true, case: result.case });
    } catch (e) {
      res.status(500).json({ error: `generation failed: ${e.message}` });
    }
  });

  // Auth
  app.use('/api', require('./routes/auth'));

  // Error handler — respect err.status (e.g. body-parser 400) instead of
  // always returning 500, so malformed JSON yields a 400 not a 500.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || err.statusCode || 500).json({ error: err.message || 'Something went wrong!' });
  });

  return app;
}

module.exports = { createApp };
