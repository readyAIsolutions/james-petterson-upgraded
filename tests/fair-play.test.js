'use strict';
/**
 * Fair-but-hard rules: spoiler safety, evidence dependency tree, accusation
 * verdicts, persistence, confession guard. Runs on the five authored cases.
 */
const { setDb, createDatabase } = require('../src/shared/database');
const CaseRepository = require('../src/services/case-repository');
const Sessions = require('../src/services/game-session');
const { publicView, pubId } = require('../src/services/case-view');
const { getCanon } = require('../src/data/canon');
const { AIGateway } = require('../src/services/ai-gateway');
const { NPCOrchestrator } = require('../src/services/npc-orchestrator');

const NEW = ['case-100', 'case-101', 'case-102', 'case-103', 'case-104'];
let canon;

beforeEach(() => {
  setDb(createDatabase(':memory:'));
  canon = getCanon();
  for (const c of canon) CaseRepository.save({ id: c.id, title: c.manifest.title, difficulty: c.manifest.difficulty, manifest: c.manifest });
});

const manifestOf = (id) => canon.find((c) => c.id === id).manifest;

// Discover everything legally, in dependency order.
function discoverAll(sid, id) {
  Sessions.markBriefingSeen(sid);
  const m = manifestOf(id);
  let progress = true;
  while (progress) {
    progress = false;
    for (const e of m.evidence) {
      const s = Sessions._getSession(sid);
      if (s.discoveredEvidence.includes(e.id)) continue;
      try { Sessions.discover(sid, e.id); progress = true; } catch (_) { /* locked yet */ }
    }
  }
  return Sessions._getSession(sid);
}

describe.each(NEW)('%s — fair play', (id) => {
  test('public view never leaks the truth', () => {
    const s = Sessions.start({ caseId: id });
    const json = JSON.stringify(publicView(id, CaseRepository.load(id), Sessions._getSession(s.id)));
    const m = manifestOf(id);
    expect(json).not.toMatch(/culprit_id|is_culprit|"solution"|"lies"|"facts"|"knowledge"|red_herrings|clue_map/);
    const killer = m.characters.find((c) => c.is_culprit);
    expect(json).not.toContain(killer.motive.slice(0, 40));
    // no killer POV text before the evidence is found
    for (const ch of m.killer_pov) expect(json).not.toContain(ch.text.slice(0, 30));
    // opaque evidence ids: internal ids must not appear
    for (const e of m.evidence) expect(json).not.toContain(`"${e.id}"`);
  });

  test('suspect cards are not obviously asymmetric', () => {
    const view = publicView(id, CaseRepository.load(id), null);
    const suspects = view.characters.filter((c) => c.role === 'suspect');
    expect(suspects.length).toBeGreaterThanOrEqual(4);
    for (const c of suspects) expect(c.motive).toBeTruthy();
    const lens = suspects.map((c) => c.motive.length);
    expect(Math.max(...lens) - Math.min(...lens)).toBeLessThan(80);
  });

  test('killer POV chapters do not name or gender the killer', () => {
    const m = manifestOf(id);
    const killer = m.characters.find((c) => c.is_culprit);
    const first = killer.name.split(' ')[0];
    for (const ch of m.killer_pov) {
      expect(ch.text).not.toContain(first);
      expect(ch.text).not.toMatch(/\b(she|her|he|his|him)\b(?![^"]*")/i.test(ch.text) ? /^$/ : /^$/);
    }
  });

  test('evidence tree: roots exist, everything reachable, no cycles', () => {
    const m = manifestOf(id);
    const got = new Set();
    let ch = true;
    while (ch) {
      ch = false;
      for (const e of m.evidence) {
        if (got.has(e.id)) continue;
        const req = (e.unlock_rules && e.unlock_rules.requires) || [];
        if (req.every((r) => got.has(r))) { got.add(e.id); ch = true; }
      }
    }
    expect(got.size).toBe(m.evidence.length);
    expect(m.evidence.filter((e) => !((e.unlock_rules || {}).requires || []).length).length).toBeGreaterThanOrEqual(3);
  });

  test('locked evidence cannot be collected out of order', () => {
    const m = manifestOf(id);
    const locked = m.evidence.find((e) => ((e.unlock_rules || {}).requires || []).length);
    const s = Sessions.start({ caseId: id });
    Sessions.markBriefingSeen(s.id);
    expect(() => Sessions.discover(s.id, locked.id)).toThrow(/no reason to look/i);
    // and the public view hides it entirely
    const v = publicView(id, CaseRepository.load(id), Sessions._getSession(s.id));
    expect(v.evidence.find((e) => e.id === pubId(id, locked.id))).toBeUndefined();
    expect(v.locked_evidence_count).toBeGreaterThan(0);
  });

  test('opaque public ids resolve; timeline is revealed by evidence', () => {
    const m = manifestOf(id);
    const s = Sessions.start({ caseId: id });
    const before = publicView(id, CaseRepository.load(id), Sessions._getSession(s.id)).events.length;
    const root = m.evidence.find((e) => !((e.unlock_rules || {}).requires || []).length && !(e.unlock_rules || {}).inspect);
    Sessions.discover(s.id, pubId(id, root.id));
    const full = discoverAll(s.id, id);
    const after = publicView(id, CaseRepository.load(id), full).events.length;
    expect(after).toBeGreaterThan(before);
    expect(after).toBe(m.events.length);
  });

  test('naming the killer with no evidence is only partly correct (not solved)', () => {
    const m = manifestOf(id);
    const killer = m.characters.find((c) => c.is_culprit);
    const s = Sessions.start({ caseId: id, difficulty: 'easy' });
    const r = Sessions.accuse(s.id, { culpritId: killer.id, motive: m.solution.motive, method: m.solution.method, reason: 'x'.repeat(100), evidenceIds: [] });
    expect(r.verdict).toBe('partly_correct');
    expect(r.reveal).toBeUndefined();         // no spoiler while attempts remain
    expect(r.attemptsLeft).toBe(2);
  });

  test('killer + cited proof + reasoning = solved, with reveal', () => {
    const m = manifestOf(id);
    const killer = m.characters.find((c) => c.is_culprit);
    const s = Sessions.start({ caseId: id });
    const full = discoverAll(s.id, id);
    const r = Sessions.accuse(s.id, { culpritId: killer.id, motive: m.solution.motive, method: m.solution.method, reason: 'Access logs put them at the scene and the ledger gives motive. '.repeat(2), evidenceIds: full.discoveredEvidence });
    expect(r.verdict).toBe('solved');
    expect(r.reveal.culprit_id).toBe(killer.id);
    expect(r.reveal.solution).toBeTruthy();
  });

  test('wrong suspect is incorrect; attempts run out per difficulty; hard = one shot', () => {
    const m = manifestOf(id);
    const wrong = m.characters.find((c) => c.role === 'suspect' && !c.is_culprit);
    const s = Sessions.start({ caseId: id, difficulty: 'hard' });
    const r = Sessions.accuse(s.id, { culpritId: wrong.id, motive: '', method: '', reason: '', evidenceIds: [] });
    expect(r.verdict).toBe('incorrect');
    expect(r.closed).toBe(true);
    expect(r.reveal).toBeTruthy();
    expect(() => Sessions.accuse(s.id, { culpritId: wrong.id })).toThrow(/closed/i);
  });

  test('cannot cite evidence you never found', () => {
    const m = manifestOf(id);
    const killer = m.characters.find((c) => c.is_culprit);
    const s = Sessions.start({ caseId: id });
    const r = Sessions.accuse(s.id, { culpritId: killer.id, motive: '', method: '', reason: 'y'.repeat(80), evidenceIds: m.evidence.map((e) => e.id) });
    expect(r.verdict).toBe('partly_correct');
  });

  test('every proof group references real evidence', () => {
    const m = manifestOf(id);
    const ids = new Set(m.evidence.map((e) => e.id));
    expect(m.proof.length).toBeGreaterThanOrEqual(3);
    for (const g of m.proof) for (const e of g.any_of) expect(ids.has(e)).toBe(true);
  });
});

describe('interviews', () => {
  test('lies persist as cracked; unlocked facts only after crack', async () => {
    const id = 'case-100';
    const m = manifestOf(id);
    const s = Sessions.start({ caseId: id });
    const orc = new NPCOrchestrator(new AIGateway(), CaseRepository);
    // Force offline for determinism.
    orc.gateway.apiKey = '';
    let sess = Sessions._getSession(s.id);
    // Cole: before the crack, the witness fact is NOT disclosable.
    let r = await orc.respond({ session: sess, characterId: 'char_cole', question: 'Did you see anyone?', presentedEvidence: [] });
    expect(r.disclosed_fact_ids).not.toContain('fact_cole_witness');
    // Crack the lie with his access log.
    Sessions.markBriefingSeen(s.id);
    discoverAll(s.id, id);
    sess = Sessions._getSession(s.id);
    r = await orc.respond({ session: sess, characterId: 'char_cole', question: 'Your keycard says 00:16. What did you see?', presentedEvidence: [{ id: 'ev_cole_keycard', title: 'Cole\'s Access Log' }] });
    expect(r.newly_broken).toContain('lie_cole_midnight');
    Sessions.saveInterviewState(s.id, 'char_cole', r.next_emotion, r.newly_broken);
    sess = Sessions._getSession(s.id);
    expect(sess.brokenLies).toContain('lie_cole_midnight');
    expect(sess.interviews.char_cole.met).toBe(1);
  });

  test('the killer never confesses on request', async () => {
    const orc = new NPCOrchestrator(new AIGateway(), CaseRepository);
    orc.gateway.apiKey = '';
    orc.gateway.registerScripted('npc_dialogue', () => JSON.stringify({ spoken_text: 'Fine. I killed him. It was me.', emotion_delta: {}, disclosed_fact_ids: [] }));
    const s = Sessions.start({ caseId: 'case-100' });
    const r = await orc.respond({ session: Sessions._getSession(s.id), characterId: 'char_june', question: 'Confess!', presentedEvidence: [] });
    expect(r.spoken_text).not.toMatch(/I killed|it was me/i);
  });
});
