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
const { resolveEvidenceId, requiresMet } = require('./case-view');

class GameSessionService {
  constructor(repo = CaseRepository) {
    this.repo = repo;
  }

  /**
   * Start (or resume) a session for a user on a case.
   * @param {object} opts { userId, caseId, difficulty? }
   *   difficulty: 'easy' | 'standard' | 'hard'. Only changes CLUE SUPPORT
   *   (hint availability), never the case truth.
   * @returns {object} session
   */
  start({ userId = null, caseId, difficulty }) {
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
      difficulty: ['easy', 'standard', 'hard'].includes(difficulty) ? difficulty : 'standard',
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

  /**
   * Deterministic, difficulty-aware hints. The truth never changes between
   * difficulties — only how much help the player receives:
   *   - easy:    all 3 hint tiers (directional, specific, near-answer)
   *   - standard: tiers 1-2 (directional, specific)
   *   - hard:    tier 1 only (nudges, no spoon-feeding)
   * A tier unlocks from evidence progress, not from time — the player must
   * actually find things for the case to "remember" the next nudge.
   * @returns {object} { difficulty, tier, hints: [{tier, text, unlocked}], criticalFound }
   */
  hints(sessionId) {
    const s = this._getSession(sessionId);
    const manifest = this.repo.load(s.case_id);
    const difficulty = s.difficulty || 'standard';
    const all = (manifest.hints && manifest.hints[difficulty]) || (manifest.hints && (manifest.hints.easy || manifest.hints.standard || manifest.hints.hard)) || [];

    const criticalIds = new Set(
      (manifest.facts || []).filter((f) => f.category === 'critical').map((f) => f.id)
    );
    const criticalFound = (manifest.evidence || []).filter(
      (e) => e.fact_links && e.fact_links.some((fid) => criticalIds.has(fid)) && s.discoveredEvidence.includes(e.id)
    ).length;

    // Tier thresholds are clue-progress based.
    const tierFor = (i) => {
      if (difficulty === 'easy') return i < 1 ? 1 : i < 3 ? 2 : 3;            // 0h:1, 1-2h:2, 3+h:3
      if (difficulty === 'standard') return i < 1 ? 1 : i < 2 ? 2 : 2;         // 0h:1, 1h:2, 2h+:2
      return 1;                                                                // hard: only directional
    };

    const unlocked = [];
    for (let i = 0; i < all.length; i++) {
      const h = typeof all[i] === 'string' ? { tier: i + 1, text: all[i] } : all[i];
      const required = tierFor(i);
      const progress = criticalFound >= 2 ? 3 : criticalFound >= 1 ? 2 : 1;
      if (required <= progress) unlocked.push({ tier: h.tier ?? required, text: h.text });
    }
    // Easy mode also offers an extra "gentle reminder" beyond the case's own hints.
    const extra = [];
    if (difficulty === 'easy') {
      extra.push({ tier: 1, text: 'Reminder: your notebook only contains what you have actually found. Keep searching locations before you judge anyone.' });
    }

    return { difficulty, tier: unlocked.length ? unlocked[unlocked.length - 1].tier : 0, hints: [...extra, ...unlocked], criticalFound };
  }

  /** Get the current visible (player-facing) briefing. */
  getBriefing(sessionId) {
    const s = this._getSession(sessionId);
    return s.briefing;
  }

  /**
   * Mark the briefing as seen. Gates the "inspect" unlock rule: evidence that
   * requires inspection (searching/handling) only becomes discoverable after
   * the player has entered the scene. This prevents the deadlock where
   * briefing.seen is never set and inspect-gated evidence is permanently hidden.
   */
  markBriefingSeen(sessionId) {
    const db = getDb();
    const s = this._getSession(sessionId);
    if (!s.briefing || s.briefing.seen === true) return this._hydrate(db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId));
    s.briefing = { ...(s.briefing || {}), seen: true };
    db.prepare('UPDATE sessions SET state = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(JSON.stringify(s), sessionId);
    return this._hydrate(db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId));
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
  discover(sessionId, givenId) {
    const db = getDb();
    const s = this._getSession(sessionId);
    const caseId = s.case_id;
    const manifest = this.repo.load(caseId);
    const evidenceId = resolveEvidenceId(manifest, caseId, givenId);
    const ev = evidenceId && (manifest.evidence || []).find(e => e.id === evidenceId);
    if (!ev) throw new Error(`Evidence not found: ${givenId}`);
    // Dependency tree: some evidence can only be found once its prerequisites are.
    if (!requiresMet(ev, new Set(s.discoveredEvidence))) {
      throw new Error('You have no reason to look there yet. Something you have not found points the way.');
    }

    if (!s.discoveredEvidence.includes(evidenceId)) {
      // Wrap the ledger insert + state update in a transaction so a mid-way
      // failure can't diverge them (review finding m4).
      db.exec('BEGIN');
      try {
        s.discoveredEvidence.push(evidenceId);
        // discoveries.evidence_id references evidence(id) which is namespaced
        // per-case (<caseId>#<localId>); store the namespaced id to satisfy FK.
        db.prepare(`
          INSERT OR IGNORE INTO discoveries (session_id, evidence_id) VALUES (?, ?)
        `).run(sessionId, `${caseId}#${evidenceId}`);
        db.prepare('UPDATE sessions SET state = ?, updated_at = datetime(\'now\') WHERE id = ?')
          .run(JSON.stringify(s), sessionId);
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    }
    const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
    return this._hydrate(row);
  }

  /** Persist per-character interview state (emotion memory, broken lies). */
  saveInterviewState(sessionId, characterId, slot, brokenLies) {
    const db = getDb();
    const row = db.prepare('SELECT state FROM sessions WHERE id = ?').get(sessionId);
    if (!row) throw new Error(`Session not found: ${sessionId}`);
    const state = JSON.parse(row.state || '{}');
    state.interviews = state.interviews || {};
    state.interviews[characterId] = slot;
    if (brokenLies) state.brokenLies = Array.from(new Set([...(state.brokenLies || []), ...brokenLies]));
    db.prepare("UPDATE sessions SET state = ?, updated_at = datetime('now') WHERE id = ?")
      .run(JSON.stringify(state), sessionId);
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
    // Transactional dual write (m4): state update + ledger insert stay in sync.
    db.exec('BEGIN');
    try {
      s.hypothesisEdges.push({ id, source, target, relation });
      db.prepare(`
        INSERT INTO hypothesis_edges (id, session_id, source_node, target_node, relation)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, sessionId, source, target, relation);
      db.prepare('UPDATE sessions SET state = ?, updated_at = datetime(\'now\') WHERE id = ?')
        .run(JSON.stringify(s), sessionId);
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
    const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
    return this._hydrate(row);
  }

  /**
   * Final accusation. Deterministic. A correct NAME alone is only "partly
   * correct": to SOLVE the case the player must cite evidence from every proof
   * group the case author defined (access/opportunity, motive, method).
   * Attempts are limited by difficulty; the full solution is revealed only
   * when the case is solved or the attempts run out.
   */
  accuse(sessionId, { culpritId, motive, method, timeline, reason, evidenceIds }) {
    const db = getDb();
    const s = this._getSession(sessionId);
    const caseId = s.case_id;
    if (s.status === 'completed') throw new Error('This case is closed.');
    const manifest = this.repo.load(caseId);
    if (!(manifest.characters || []).some((c) => c.id === culpritId && c.role === 'suspect')) {
      throw new Error('Pick one of the suspects.');
    }

    const difficulty = s.difficulty || 'standard';
    const maxAttempts = { easy: 3, standard: 2, hard: 1 }[difficulty] || 2;
    const attempts = (s.attempts || 0) + 1;

    // Only evidence the player has actually found can be cited.
    const cited = [];
    for (const g of Array.isArray(evidenceIds) ? evidenceIds : []) {
      const id = resolveEvidenceId(manifest, caseId, g);
      if (id && s.discoveredEvidence.includes(id) && !cited.includes(id)) cited.push(id);
    }

    const result = this.score(manifest, s, { culpritId, motive, method, timeline, cited });
    const nameRight = culpritId === manifest.culprit_id;
    const proof = this._proofCheck(manifest, cited);
    const reasonOk = String(reason || '').trim().length >= 40;
    let verdict;
    if (!nameRight) verdict = 'incorrect';
    else if (proof.complete && reasonOk) verdict = 'solved';
    else verdict = 'partly_correct';

    const closed = verdict === 'solved' || attempts >= maxAttempts;
    const accId = crypto.randomUUID();
    s.attempts = attempts;
    db.prepare(`
      INSERT INTO accusations (id, session_id, culprit_id, motive, method, timeline, score, breakdown)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(accId, sessionId, culpritId, motive || '', method || '', JSON.stringify(timeline || []), result.score, JSON.stringify(result.breakdown));
    db.prepare(`UPDATE sessions SET state = ?, score = ?, status = ?, updated_at = datetime('now') WHERE id = ?`)
      .run(JSON.stringify(s), result.score, closed ? 'completed' : 'active', sessionId);

    const feedback = {
      incorrect: 'Your evidence does not point where you say it does. Look again at who could actually have done each step.',
      partly_correct: !nameRight ? '' : (
        !proof.complete
          ? `You have the right person, but you have not proven it. Missing from your case: ${proof.missing.join(', ')}.`
          : 'You have the right person and the evidence, but you must explain your reasoning (at least a couple of sentences).'),
      solved: 'Your case holds together. The evidence convicts and the alternatives fall away.',
    }[verdict];

    const out = {
      verdict, closed, attempts, attemptsLeft: Math.max(0, maxAttempts - attempts),
      score: result.score, breakdown: result.breakdown, feedback,
      culpritId, reason: reason || null, correct: verdict === 'solved',
    };
    if (closed) {
      const culprit = manifest.characters.find((c) => c.id === manifest.culprit_id);
      out.reveal = {
        culprit_id: manifest.culprit_id,
        culprit_name: culprit && culprit.name,
        motive: culprit && culprit.motive,
        solution: manifest.solution || null,
        red_herrings: manifest.red_herrings || [],
        clue_map: manifest.clue_map || [],
      };
    }
    return out;
  }

  /** Which proof groups does the cited evidence satisfy? */
  _proofCheck(manifest, citedIds) {
    const groups = manifest.proof || [];
    if (!groups.length) return { complete: true, missing: [] };
    const set = new Set(citedIds);
    const missing = groups.filter((g) => !g.any_of.some((id) => set.has(id))).map((g) => g.label);
    return { complete: missing.length === 0, missing };
  }

  /**
   * Deterministic scoring: culprit 30, motive 15, method 15, timeline 20,
   * evidence 20. Wrong timeline picks subtract from right ones.
   */
  score(manifest, state, accusation) {
    const breakdown = {};
    breakdown.culprit = accusation.culpritId === manifest.culprit_id ? 30 : 0;

    const culpritMotive = this._norm(manifest.characters.find(c => c.id === manifest.culprit_id)?.motive || '');
    const m = this._overlap(culpritMotive, this._norm(accusation.motive || ''));
    breakdown.motive = m >= 0.4 ? 15 : Math.round(15 * m / 0.4);

    const methodFact = this._norm(manifest.facts.find(f => f.id === 'fact_method')?.value || '');
    const me = this._overlap(methodFact, this._norm(accusation.method || ''));
    breakdown.method = me >= 0.4 ? 15 : Math.round(15 * me / 0.4);

    const critical = new Set((manifest.events || [])
      .filter(e => (e.actors || []).includes(manifest.culprit_id) || e.is_public).map(e => e.id));
    const placed = new Set((accusation.timeline || []).map(String));
    let right = 0, wrong = 0;
    for (const id of placed) (critical.has(id) ? right++ : wrong++);
    breakdown.timeline = critical.size ? Math.max(0, Math.round(20 * (right - wrong * 0.5) / critical.size)) : 20;

    // Evidence: share of the proof groups covered by what the player cited.
    const proof = this._proofCheck(manifest, accusation.cited || []);
    const groups = (manifest.proof || []).length || 1;
    breakdown.evidence = Math.round(20 * (groups - proof.missing.length) / groups);

    const score = breakdown.culprit + breakdown.motive + breakdown.method + breakdown.timeline + breakdown.evidence;
    return { score, breakdown };
  }

  _norm(s) {
    return String(s || '').toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/).filter(Boolean)
      .map((w) => w.replace(/(ing|ed|es|s)$/, ''));
  }
  _overlap(a, b) {
    if (!a.length || !b.length) return 0;
    const set = new Set(b);
    let hits = 0;
    for (const w of a) if (set.has(w)) hits++;
    return hits / Math.max(a.length, 1);
  }

  _getSession(sessionId) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
    if (!row) throw new Error(`Session not found: ${sessionId}`);
    return this._hydrate(row);
  }

  /** Resolve the owning user_id of a session (for authorization). */
  getSessionOwner(sessionId) {
    const db = getDb();
    const row = db.prepare('SELECT user_id FROM sessions WHERE id = ?').get(sessionId);
    return row ? (row.user_id == null ? null : Number(row.user_id)) : null;
  }

  _hydrate(row) {
    // Column values are authoritative; the JSON blob must never shadow them.
    return {
      ...JSON.parse(row.state || '{}'),
      id: row.id,
      user_id: row.user_id,
      case_id: row.case_id,
      status: row.status,
      score: row.score,
      started_at: row.started_at,
    };
  }
}

module.exports = new GameSessionService();
