'use strict';
/**
 * Tests for the deterministic adversarial CaseSolver.
 *
 * The solver re-derives the canonical culprit from discoverable evidence and
 * flags impossible / trivial / contradictory / ambiguous cases. These tests
 * assert the solver's gates against the reference Case 001, a generated
 * template case, and adversarial mutations.
 */
const { CaseSolver } = require('../src/services/case-solver');
const { CaseGenerator } = require('../src/services/case-generator');
const { AIGateway } = require('../src/services/ai-gateway');
const case001 = require('../src/data/case-001');

const clone = (m) => JSON.parse(JSON.stringify(m));

describe('CaseSolver', () => {
  test('resolves the reference Case 001 as solvable from discoverable evidence', () => {
    const res = new CaseSolver().solve(case001.manifest);
    expect(res.ok).toBe(true);
    expect(res.solvable).toBe(true);
    // All critical facts (fact_motive, fact_time) must be linked by reachable evidence.
    expect(res.flags.impossible).toBe(false);
    expect(res.flags.trivial).toBe(false);
    expect(res.flags.ambiguous).toBe(false);
  });

  test('resolves a deterministically generated template case as solvable', async () => {
    const gen = new CaseGenerator(new AIGateway());
    const res = await gen.generateFromPremise({ genre: 'poison', setting: 'a harbor town', difficulty: 'hard' });
    expect(res.ok).toBe(true);
    const solved = new CaseSolver().solve(res.case);
    expect(solved.ok).toBe(true);
    expect(solved.solvable).toBe(true);
  });

  test('never throws and returns ok:false on a null manifest', () => {
    const res = new CaseSolver().solve(null);
    expect(res.ok).toBe(false);
    expect(res.solvable).toBe(false);
    expect(res.reasons.length).toBeGreaterThan(0);
  });

  test('never throws and returns ok:false on a non-object manifest', () => {
    const res = new CaseSolver().solve('not a manifest');
    expect(res.ok).toBe(false);
    expect(res.solvable).toBe(false);
  });

  test('flags a case as malformed when the culprit is not in the cast', () => {
    const m = clone(case001.manifest);
    m.culprit_id = 'char_ghost';
    const res = new CaseSolver().solve(m);
    expect(res.ok).toBe(false);
    expect(res.solvable).toBe(false);
    expect(res.reasons.join()).toContain('char_ghost');
  });

  test('flags a case as trivial when there is no non-culprit suspect', () => {
    const m = clone(case001.manifest);
    // Keep only the culprit suspect; drop Elias & Silas as suspects.
    m.characters = m.characters.map((c) =>
      c.id === 'char_silas' || c.id === 'char_elias' ? { ...c, role: 'witness', is_culprit: false } : c
    );
    const res = new CaseSolver().solve(m);
    expect(res.ok).toBe(true);
    expect(res.solvable).toBe(false);
    expect(res.flags.trivial).toBe(true);
    expect(res.reasons.join()).toContain('trivial');
  });

  test('flags a case as impossible when a critical fact is not discoverable', () => {
    const m = clone(case001.manifest);
    // Remove every piece of evidence that links the critical fact_motive.
    m.evidence = m.evidence
      .filter((e) => !(e.fact_links || []).includes('fact_motive'))
      .map((e) => ({ ...e, fact_links: (e.fact_links || []).filter((f) => f !== 'fact_motive') }));
    const res = new CaseSolver().solve(m);
    expect(res.solvable).toBe(false);
    expect(res.flags.impossible).toBe(true);
    expect(res.reasons.join()).toContain('fact_motive');
  });

  test('flags a case as ambiguous when two suspects tie for the best motive match', () => {
    // Deterministic minimal manifest: two suspects share the SAME motive text,
    // and no conclusion fact names either one. The solver cannot distinguish
    // between them, so the case has no single best culprit.
    const m = {
      culprit_id: 'char_a',
      characters: [
        { id: 'char_a', name: 'Alice', role: 'suspect', is_culprit: true, motive: 'they wanted the fortune' },
        { id: 'char_b', name: 'Bruno', role: 'suspect', is_culprit: false, motive: 'they wanted the fortune' },
      ],
      facts: [
        { id: 'fact_motive', value: 'the culprit wanted the fortune', category: 'critical', visibility: 'secret' },
        { id: 'fact_time', value: 'the deed was done at midnight', category: 'critical', visibility: 'secret' },
      ],
      locations: [
        { id: 'loc_a', name: 'Room A', description: '' },
      ],
      evidence: [
        { id: 'ev_letter', type: 'document', location_id: 'loc_a', title: 'A Letter', description: '', fact_links: ['fact_motive'], unlock_rules: {} },
        { id: 'ev_clock', type: 'physical', location_id: 'loc_a', title: 'Clock', description: '', fact_links: ['fact_time'], unlock_rules: {} },
      ],
    };
    const res = new CaseSolver().solve(m);
    expect(res.ok).toBe(true);
    expect(res.flags.ambiguous).toBe(true);
    expect(res.reasons.join()).toContain('ambiguous');
  });

  test('flags running off empty evidence as impossible', () => {
    const m = clone(case001.manifest);
    m.evidence = [];
    const res = new CaseSolver().solve(m);
    expect(res.solvable).toBe(false);
    expect(res.flags.impossible).toBe(true);
  });
});