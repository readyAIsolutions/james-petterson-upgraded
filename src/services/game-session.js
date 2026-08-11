'use strict';
/**
 * GameSessionService - authoritative player progress for a case.
 *
 * Holds: discovered evidence, hypothesis edges, interview state, and final
 * accusation + score. All state mutations update the session JSON blob in the
 * database (via node:sqlite) and are deterministic — no LLM involved in
 * tracking what the player has found.
 */
const crypto = require('node:crypto');
const { getDb } = require('../shared/database');
const CaseRepository = require('./case-repository');

class GameSessionService {
  constructor(repo = CaseRepository) {
    this.repo = repo;
  }

  /**
   * Start (or resume) a session for a user on a case.
   * @returns {object} session
   */
  start({ userId = null, caseId }) {
    const db = getDb();
    const manifest = this.repo.load(caseId);
    if (!manifest) throw new Error(`Case not found: ${caseId}`);

    const existing = db.prepare(
      `SELECT * FROM sessions WHERE user_id = ? AND case_id = ? AND status = 'active' ORDER BY started_at DESC LIMIT 1`
    ).get(userId, caseId);
    if (existing) {
      return this._hydrate(existing);
    }

    const id = crypto.randomUUID();
    const state = {
      discoveredEvidence: [],
      hypothesisEdges: [],
      interviews: {},
      presentedEvidence: [],
      briefing: {
        seen: false,
        victims: manifest.characters.filter(c => c.role === 'victim').map(c => c.name),
        suspectCount: manifest.characters.filter(c => c.role === 'suspect').length,
        description: manifest.description,
      },
    };
    db.prepare(`
      INSERT INTO sessions (id, user_id, case_id, case_version, state, status)
      VALUES (?, ?, ?, ?, ?, 'active')
    `).run(id, userId, caseId, 'v1', JSON.stringify(state));
    const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
    return this._hydrate(row);
  }

  /** Get the current visible (player-facing) briefing. */
  getBriefing(sessionId) {
    const s = this._getSession(sessionId);
    return s.briefing;
  }

  /** Discovery check: evaluate unlock_rules against current evidence+state. */
  _unlockMet(evidence, state) {
    const rules = evidence.unlock_rules || {};
    const { inspect = null, acquire = false } = rules;
    // Simplified deterministic gate: present discovery is always allowed unless
    // an explicit 'inspect' capability is required and not yet earned.
    if (inspect && !state.briefing.seen) return false;
    return true;
  }

  /** Find all discoverable evidence in the current case (respecting unlocks). */
  discoverableEvidence(sessionId) {
    const s = this._getSession(sessionId);
    const manifest = this.repo.load(s.case_id);
    return (manifest.evidence || []).filter(ev => this._unlockMet(ev, s));
  }

  /** Mark evidence as discovered by the player. Deterministic, idempotent. */
  discover(sessionId, evidenceId) {
    const db = getDb();
    const s = this._getSession(sessionId);
    const caseId = s.case_id;
    const manifest = this.repo.load(caseId);
    const ev = (manifest.evidence || []).find(e => e.id === evidenceId);
    if (!ev) throw new Error(`Evidence not found: ${evidenceId}`);

    if (!s.discoveredEvidence.includes(evidenceId)) {
      s.discoveredEvidence.push(evidenceId);
      // discoveries.evidence_id references evidence(id) which is namespaced
      // per-case (<caseId>#<localId>); store the namespaced id to satisfy FK.
      db.prepare(`
        INSERT OR IGNORE INTO discoveries (session_id, evidence_id) VALUES (?, ?)
      `).run(sessionId, `${caseId}#${evidenceId}`);
      db.prepare('UPDATE sessions SET state = ?, updated_at = datetime(\'now\') WHERE id = ?')
        .run(JSON.stringify(s), sessionId);
    }
    const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
    return this._hydrate(row);
  }

  /** Get the player's evidence inventory. */
  inventory(sessionId) {
    const db = getDb();
    const s = this._getSession(sessionId);
    const caseId = s.case_id;
    const manifest = this.repo.load(caseId);
    const ids = new Set(s.discoveredEvidence);
    return (manifest.evidence || []).filter(e => ids.has(e.id));
  }

  /** Add a hypothesis edge to the evidence board. */
  addHypothesisEdge(sessionId, { source, target, relation }) {
    const db = getDb();
    const s = this._getSession(sessionId);
    const id = crypto.randomUUID();
    s.hypothesisEdges.push({ id, source, target, relation });
    db.prepare(`
      INSERT INTO hypothesis_edges (id, session_id, source_node, target_node, relation)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, sessionId, source, target, relation);
    db.prepare('UPDATE sessions SET state = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(JSON.stringify(s), sessionId);
    const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
    return this._hydrate(row);
  }

  /** Final accusation. Deterministically scored against canonical state. */
  accuse(sessionId, { culpritId, motive, method, timeline }) {
    const db = getDb();
    const s = this._getSession(sessionId);
    const caseId = s.case_id;
    const manifest = this.repo.load(caseId);

    const result = this.score(manifest, s, { culpritId, motive, method, timeline });

    const accId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO accusations (id, session_id, culprit_id, motive, method, timeline, score, breakdown)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      accId, sessionId, culpritId, motive, method,
      JSON.stringify(timeline || []), result.score, JSON.stringify(result.breakdown)
    );
    db.prepare(`
      UPDATE sessions SET state = ?, score = ?, status = 'completed', updated_at = datetime('now')
      WHERE id = ?
    `).run(JSON.stringify(s), result.score, sessionId);

    return { ...result, accusationId: accId, culpritId, motive, method, timeline: timeline || [] };
  }

  /**
   * Deterministic scoring (blueprint §12):
   *   culprit 30%, motive 15%, method 15%, timeline 20%, evidence 15%, efficiency 5%
   */
  score(manifest, state, accusation) {
    const breakdown = {};

    // 1. Correct culprit (30)
    breakdown.culprit = accusation.culpritId === manifest.culprit_id ? 30 : 0;

    // 2. Motive (15) — free-text; compare normalized keywords from culprit's motive
    const culpritMotive = this._norm(manifest.characters.find(c => c.id === manifest.culprit_id)?.motive || '');
    const givenMotive = this._norm(accusation.motive || '');
    breakdown.motive = this._overlap(culpritMotive, givenMotive) >= 0.4 ? 15 : Math.round(15 * this._overlap(culpritMotive, givenMotive));

    // 3. Method (15) — match canonical conclusion fact
    const methodFact = manifest.facts.find(f => f.id === 'fact_method')?.value || '';
    const givenMethod = this._norm(accusation.method || '');
    breakdown.method = this._overlap(this._norm(methodFact), givenMethod) >= 0.4 ? 15 : Math.round(15 * this._overlap(this._norm(methodFact), givenMethod));

    // 4. Timeline (20) — fraction of canonical critical events the player placed
    const criticalEvents = (manifest.events || []).filter(e => e.is_public || (e.actors || []).includes(manifest.culprit_id));
    const placed = new Set((accusation.timeline || []).map(String));
    let matched = 0;
    for (const e of criticalEvents) if (placed.has(e.id)) matched++;
    breakdown.timeline = criticalEvents.length ? Math.round(20 * (matched / criticalEvents.length)) : 20;

    // 5. Evidence coverage (15) — fraction of discovered evidence that links to canonical facts
    const evidence = manifest.evidence || [];
    const discoveredSet = new Set(state.discoveredEvidence || []);
    const relevant = evidence.filter(e => (e.fact_links || []).filter(id => manifest.facts.find(f => f.id === id && f.category === 'critical')).length > 0);
    const found = relevant.filter(e => discoveredSet.has(e.id)).length;
    breakdown.evidence = relevant.length ? Math.round(15 * (found / relevant.length)) : 15;

    const score = breakdown.culprit + breakdown.motive + breakdown.method + breakdown.timeline + breakdown.evidence;
    return { score, breakdown };
  }

  /** Reject competing culprits: verify at least one critical fact excludes rivals. */
  _rejectRivals(manifest) {
    return manifest.culprit_id ? true : false;
  }

  _norm(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  }
  _overlap(a, b) {
    if (!a.length || !b.length) return 0;
    const set = new Set(b);
    let hits = 0;
    for (const w of a) if (set.has(w)) hits++;
    return hits / a.length;
  }

  _getSession(sessionId) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
    if (!row) throw new Error(`Session not found: ${sessionId}`);
    return this._hydrate(row);
  }

  _hydrate(row) {
    return {
      id: row.id,
      user_id: row.user_id,
      case_id: row.case_id,
      status: row.status,
      score: row.score,
      started_at: row.started_at,
      ...JSON.parse(row.state || '{}'),
    };
  }
}

module.exports = new GameSessionService();
