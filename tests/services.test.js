'use strict';
/**
 * Integration tests for the core backend services: validator, repository,
 * game session, NPC orchestrator, and generator.
 * Each test uses a fresh in-memory SQLite DB.
 */
const { createDatabase } = require('../src/shared/db');
const { setDb } = require('../src/shared/database');
const { CaseValidator } = require('../src/services/case-validator');
const CaseRepository = require('../src/services/case-repository');
const GameSessionService = require('../src/services/game-session');
const { NPCOrchestrator } = require('../src/services/npc-orchestrator');
const { CaseGenerator } = require('../src/services/case-generator');
const { AIGateway } = require('../src/services/ai-gateway');
const case001 = require('../src/data/case-001');

let fresh = () => createDatabase(':memory:');

describe('CaseValidator', () => {
  test('validates the reference Case 001 as solvable', () => {
    const v = new CaseValidator();
    const res = v.validate(case001.manifest);
    expect(res.valid).toBe(true);
  });

  test('rejects a case with an orphan evidence fact link', () => {
    const m = JSON.parse(JSON.stringify(case001.manifest));
    m.evidence.push({ id: 'ev_bad', type: 'physical', title: 'x', fact_links: ['fact_missing'] });
    const res = new CaseValidator().validate(m);
    expect(res.valid).toBe(false);
    expect(res.errors.join()).toContain('Provenance');
  });

  test('rejects a case with no evidence (unfair)', () => {
    const m = JSON.parse(JSON.stringify(case001.manifest));
    m.evidence = [];
    const res = new CaseValidator().validate(m);
    expect(res.valid).toBe(false);
  });

  test('rejects when culprit is not flagged is_culprit', () => {
    const m = JSON.parse(JSON.stringify(case001.manifest));
    m.characters.find(c => c.id === 'char_marina').is_culprit = false;
    const res = new CaseValidator().validate(m);
    expect(res.valid).toBe(false);
  });

  test('rejects a timeline where an actor is in two places at once', () => {
    const m = JSON.parse(JSON.stringify(case001.manifest));
    // Marina is already at the workshop at 18:30; put her at the kitchen then too.
    m.events.push({ id: 'evt_conflict', start: '18:30', end: '18:30', location_id: 'loc_kitchen', title: 'x', actors: ['char_marina'] });
    const res = new CaseValidator().validate(m);
    expect(res.valid).toBe(false);
    expect(res.errors.join()).toContain('Timeline');
  });
});

describe('CaseRepository', () => {
  test('saves and loads a case manifest round-trip preserving culprit', () => {
    setDb(fresh());
    CaseRepository.save({ id: 'case-001', title: case001.manifest.title, difficulty: 'medium', manifest: case001.manifest });
    const loaded = CaseRepository.load('case-001');
    expect(loaded.culprit_id).toBe('char_marina');
    expect(loaded.characters.length).toBeGreaterThanOrEqual(3);
    expect(loaded.evidence.length).toBeGreaterThan(0);
    expect(loaded.facts.some(f => f.id === 'fact_poison')).toBe(true);
  });

  test('list returns published cases', () => {
    setDb(fresh());
    CaseRepository.save({ id: 'case-001', title: 'T', difficulty: 'm', manifest: case001.manifest });
    const list = CaseRepository.list(false);
    expect(list.some(c => c.id === 'case-001')).toBe(true);
  });
});

describe('GameSessionService', () => {
  let session;
  beforeAll(() => {
    setDb(fresh());
    CaseRepository.save({ id: 'case-001', title: case001.manifest.title, difficulty: 'm', manifest: case001.manifest });
  });

  test('starts a session with briefing', () => {
    session = GameSessionService.start({ caseId: 'case-001' });
    expect(session.id).toBeTruthy();
    const briefing = GameSessionService.getBriefing(session.id);
    expect(briefing.suspectCount).toBe(3);
    expect(briefing.victims).toContain('Victor Hartley');
  });

  test('discovers evidence and updates inventory', () => {
    GameSessionService.discover(session.id, 'ev_teacup');
    GameSessionService.discover(session.id, 'ev_letter');
    const inv = GameSessionService.inventory(session.id);
    expect(inv.map(e => e.id).sort()).toEqual(['ev_letter', 'ev_teacup']);
  });

  test('REGRESSION C1: inspect-gated evidence is discoverable only after briefing seen', () => {
    // Fresh session (case-001 has inspect-gated ev_teacup / ev_letter / ev_sale_paper).
    const s = GameSessionService.start({ caseId: 'case-001' });
    // Before seen: teas/letter/sale (inspect-gated) NOT discoverable.
    const before = new Set(GameSessionService.discoverableEvidence(s.id).map(e => e.id));
    expect(before.has('ev_teacup')).toBe(false);
    expect(before.has('ev_stopped_clock')).toBe(true); // not gated
    // After marking briefing seen: inspect-gated evidence becomes discoverable.
    GameSessionService.markBriefingSeen(s.id);
    const after = new Set(GameSessionService.discoverableEvidence(s.id).map(e => e.id));
    expect(after.has('ev_teacup')).toBe(true);
    expect(after.has('ev_letter')).toBe(true);
  });

  test('adding hypothesis edges is idempotent in state', () => {
    const s = GameSessionService.addHypothesisEdge(session.id, { source: 'ev_teacup', target: 'char_marina', relation: 'implicates' });
    expect(s.hypothesisEdges.length).toBe(1);
  });

  test('scores a correct accusation highly', () => {
    const r = GameSessionService.accuse(session.id, {
      culpritId: 'char_marina',
      motive: 'planned to sell the workshop and end their affair',
      method: 'poisoned the tea with aconite',
      timeline: ['evt_1830', 'evt_2000', 'evt_2030'],
    });
    expect(r.score).toBeGreaterThan(70); // culprit 30 + motive 15 + method 15 + timeline partial + evidence
    expect(r.breakdown.culprit).toBe(30);
  });

  test('scores a wrong culprit at 0 for culprit dimension', () => {
    const s2 = GameSessionService.start({ caseId: 'case-001' });
    const r = GameSessionService.accuse(s2.id, { culpritId: 'char_elias', motive: 'bad', method: 'bad', timeline: [] });
    expect(r.breakdown.culprit).toBe(0);
    expect(r.score).toBeLessThan(40);
  });
});

describe('NPCOrchestrator (offline deterministic)', () => {
  test('produces a knowledge-bounded response that can be disclosed', async () => {
    setDb(fresh());
    CaseRepository.save({ id: 'case-001', title: 'T', difficulty: 'm', manifest: case001.manifest });
    const session = GameSessionService.start({ caseId: 'case-001' });
    const orc = new NPCOrchestrator(new AIGateway(), CaseRepository);
    const res = await orc.respond({ session, characterId: 'char_elias', question: 'Where were you last night?', presentedEvidence: [] });
    expect(res.spoken_text).toBeTruthy();
    // Elias can disclose his alibi
    expect(res.disclosed_fact_ids).toContain('fact_elias_alibi');
  });

  test('culprit cannot disclose their own secret facts', async () => {
    setDb(fresh());
    CaseRepository.save({ id: 'case-001', title: 'T', difficulty: 'm', manifest: case001.manifest });
    const session = GameSessionService.start({ caseId: 'case-001' });
    const orc = new NPCOrchestrator(new AIGateway(), CaseRepository);
    const res = await orc.respond({ session, characterId: 'char_marina', question: 'Did you poison him?', presentedEvidence: [] });
    // Marina may NOT disclose fact_poison (can_disclose=0)
    expect(res.disclosed_fact_ids).not.toContain('fact_poison');
  });

  test('lying character delivers cover story as a lie', async () => {
    setDb(fresh());
    CaseRepository.save({ id: 'case-001', title: 'T', difficulty: 'm', manifest: case001.manifest });
    const session = GameSessionService.start({ caseId: 'case-001' });
    const orc = new NPCOrchestrator(new AIGateway(), CaseRepository);
    // Ask Marina about Elias: her only discloseable knowledge is a false rumor
    const res = await orc.respond({ session, characterId: 'char_marina', question: 'What do you know about Elias?', presentedEvidence: [] });
    expect(res.lie_id).toBe('lie_marina_elias');
  });
});

describe('CaseGenerator', () => {
  test('generates a valid case from a deterministic premise (offline)', async () => {
    setDb(fresh());
    const gen = new CaseGenerator(new AIGateway());
    const res = await gen.generateFromPremise({ genre: 'poison', setting: 'a harbor town', difficulty: 'hard' });
    expect(res.ok).toBe(true);
    const v = new CaseValidator().validate(res.case);
    expect(v.valid).toBe(true);
  });
});
