'use strict';
/**
 * App factory - assembles the Express API from services.
 * Made a factory (not a singleton) so tests can spin up fresh instances
 * against an isolated in-memory DB.
 */
const express = require('express');
const { publicView, pubId } = require('./services/case-view');
const { optionalAuth, requireAuth, ownershipCheck } = require('./middleware/auth');

function createApp({ db, aiGateway, sessionService, npcOrchestrator, caseRepo, caseGenerator }) {
  const app = express();
  app.use(express.json());
  // Resolve optional identity (req.identity) for all /api routes.
  app.use('/api', optionalAuth);

  // Maintained in this closure; injected into route handlers below.
  const sessionOwnership = ownershipCheck((req) => sessionService.getSessionOwner(req.params.id));

  // ---- Health / meta ----
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'ai-detective-platform', v: '0.1.0' });
  });

  // ---- Case API ----
  app.get('/api/cases', (req, res) => {
    const list = caseRepo.list(false).map(({ id, title, difficulty, status, premise }) => ({ id, title, difficulty, status, premise }));
    res.json({ cases: list });
  });

  // Admin only: loading a manifest overwrites a case.
  app.post('/api/cases/:id/load', requireAuth, (req, res) => {
    if (!req.identity.isAdmin) return res.status(403).json({ error: 'Forbidden: admin required' });
    try {
      const saved = caseRepo.save({ id: req.params.id, ...(req.body && req.body.manifest ? { manifest: req.body.manifest, title: req.body.title, difficulty: req.body.difficulty } : { manifest: { }, title: 'Empty', difficulty: 'medium' }) });
      res.json(saved);
    } catch (e) { res.status(400).json({ error: e.message }); }
  });

  // Player-safe case view. Never contains the truth. With ?session=<id> it
  // reflects that session's progress (found evidence, revealed events, ...).
  app.get('/api/cases/:id', (req, res) => {
    const manifest = caseRepo.load(req.params.id);
    if (!manifest) return res.status(404).json({ error: 'Case not found' });
    let session = null;
    if (req.query.session) {
      try { session = sessionService._getSession(String(req.query.session)); } catch (e) { session = null; }
      if (session && session.case_id !== req.params.id) session = null;
    }
    res.json(publicView(req.params.id, manifest, session));
  });

  app.get('/api/cases/:id/status', (req, res) => {
    res.json({ id: req.params.id, status: caseRepo.getStatus(req.params.id) });
  });

  // Validate a case manifest (deterministic core IP) — requires auth+admin.
  app.post('/api/validate', requireAuth, (req, res) => {
    if (!req.identity.isAdmin) return res.status(403).json({ error: 'Forbidden: admin required' });
    const manifest = req.body?.manifest;
    if (!manifest || typeof manifest !== 'object') {
      return res.status(400).json({ error: 'manifest object required' });
    }
    const { CaseValidator } = require('./case-validator');
    const result = new CaseValidator().validate(manifest);
    res.json(result);
  });

  // ---- Session API ----
  // Bind to authenticated user when present; anonymous play still allowed.
  app.post('/api/sessions', (req, res) => {
    try {
      const caseId = req.body?.caseId;
      if (typeof caseId !== 'string' || !caseId.trim()) {
        return res.status(400).json({ error: 'caseId is required' });
      }
      const userId = req.identity ? req.identity.userId : (req.body.userId || null);
      const difficulty = req.body?.difficulty;
      const s = sessionService.start({ userId, caseId: caseId.trim(), difficulty });
      res.status(201).json(s);
    } catch (e) { res.status(400).json({ error: e.message }); }
  });

  app.get('/api/sessions/:id', sessionOwnership, (req, res) => {
    try { res.json(sessionService._getSession(req.params.id)); }
    catch (e) { res.status(404).json({ error: e.message }); }
  });

  app.get('/api/sessions/:id/briefing', sessionOwnership, (req, res) => {
    try { res.json(sessionService.getBriefing(req.params.id)); }
    catch (e) { res.status(404).json({ error: e.message }); }
  });

  app.post('/api/sessions/:id/briefing/seen', sessionOwnership, (req, res) => {
    try { res.json(sessionService.markBriefingSeen(req.params.id)); }
    catch (e) { res.status(404).json({ error: e.message }); }
  });

  app.get('/api/sessions/:id/inventory', sessionOwnership, (req, res) => {
    try {
      const sess = sessionService._getSession(req.params.id);
      const view = publicView(sess.case_id, caseRepo.load(sess.case_id), sess);
      res.json({ evidence: view.evidence.filter((e) => e.discovered) });
    } catch (e) { res.status(404).json({ error: e.message }); }
  });

  app.post('/api/sessions/:id/discover', sessionOwnership, (req, res) => {
    try {
      sessionService.discover(req.params.id, req.body.evidenceId);
      const sess = sessionService._getSession(req.params.id);
      const view = publicView(sess.case_id, caseRepo.load(sess.case_id), sess);
      res.json({ ok: true, case: view });
    } catch (e) { res.status(400).json({ error: e.message }); }
  });

  app.post('/api/sessions/:id/hypothesis', sessionOwnership, (req, res) => {
    try { res.json(sessionService.addHypothesisEdge(req.params.id, req.body)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  });

  app.post('/api/sessions/:id/accuse', sessionOwnership, (req, res) => {
    try {
      const r = sessionService.accuse(req.params.id, req.body);
      res.json(r);
    } catch (e) { res.status(400).json({ error: e.message }); }
  });

  // Deterministic, difficulty-aware hints — never touches case truth.
  app.get('/api/sessions/:id/hints', sessionOwnership, (req, res) => {
    try { res.json(sessionService.hints(req.params.id)); }
    catch (e) { res.status(404).json({ error: e.message }); }
  });

  // ---- NPC API ----
  app.post('/api/sessions/:id/interview', sessionOwnership, async (req, res) => {
    try {
      const session = sessionService._getSession(req.params.id);
      const manifest = caseRepo.load(session.case_id);
      // Resolve the real evidence titles — the model needs to SEE what the
      // player is showing the character, not a raw id.
      const { resolveEvidenceId } = require('./services/case-view');
      const presentedEvidence = [];
      for (const given of (Array.isArray(req.body.presentedEvidenceIds) ? req.body.presentedEvidenceIds : [])) {
        const id = resolveEvidenceId(manifest, session.case_id, given);
        // You can only show evidence you actually hold.
        if (!id || !session.discoveredEvidence.includes(id)) continue;
        presentedEvidence.push({ id, title: (manifest.evidence.find((e) => e.id === id) || {}).title });
      }
      const response = await npcOrchestrator.respond({
        session,
        characterId: req.body.characterId,
        question: req.body.question,
        presentedEvidence,
      });
      const target = (manifest.characters || []).find((c) => c.id === req.body.characterId);
      if (!target || target.role === 'victim') throw new Error('You cannot interview that person.');
      // Persist emotion memory + which lies have cracked (server-side truth).
      sessionService.saveInterviewState(req.params.id, req.body.characterId, response.next_emotion, response.newly_broken);
      // Player-safe reply: never expose lie ids, fact ids or "rejected" flags.
      res.json({
        characterId: response.characterId,
        spoken_text: response.spoken_text,
        mood: { trust: response.next_emotion.trust, stress: response.next_emotion.stress, met: response.next_emotion.met },
        cracked: (response.newly_broken || []).length > 0,
        ai_offline: response.provider === 'fallback' || response.provider === 'scripted',
      });
    } catch (e) { res.status(400).json({ error: e.message }); }
  });

  // ---- Generator API (costly LLM endpoint — requires admin) ----
  app.post('/api/cases/generate', requireAuth, async (req, res) => {
    if (!req.identity.isAdmin) return res.status(403).json({ error: 'Forbidden: admin required' });
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
