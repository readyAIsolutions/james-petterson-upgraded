'use strict';
const { setDb, createDatabase } = require('../src/shared/database');
const CaseRepository = require('../src/services/case-repository');
const Sessions = require('../src/services/game-session');
const { publicView } = require('../src/services/case-view');
const { getCanon } = require('../src/data/canon');
const { validateManifest } = require('../packages/case-schema');

let canon;
beforeEach(() => {
  setDb(createDatabase(':memory:'));
  canon = getCanon();
  for (const c of canon) CaseRepository.save({ id: c.id, title: c.manifest.title, difficulty: c.manifest.difficulty, manifest: c.manifest });
});
const get = (id) => canon.find((c) => c.id === id).manifest;

describe('difficulty mix', () => {
  test('library has easy, medium and hard cases', () => {
    const d = canon.map((c) => c.manifest.difficulty);
    expect(d).toContain('easy');
    expect(d.filter((x) => x === 'medium').length).toBeGreaterThanOrEqual(3);
    expect(d.filter((x) => x === 'hard').length).toBeGreaterThanOrEqual(2);
    expect(get('case-001').difficulty).toBe('easy');
    expect(get('case-102').difficulty).toBe('hard');
    expect(get('case-103').difficulty).toBe('hard');
  });

  test('hard cases have fewer starting clues than easy/medium', () => {
    const roots = (m) => m.evidence.filter((e) => !((e.unlock_rules || {}).requires || []).length).length / m.evidence.length;
    expect(roots(get('case-102'))).toBeLessThan(roots(get('case-100')));
    expect(roots(get('case-103'))).toBeLessThan(roots(get('case-101')));
  });

  test('every case validates against the schema', () => {
    for (const c of canon) expect(validateManifest(c.manifest).errors).toEqual([]);
  });
});

describe.each(['case-001', 'case-100', 'case-101', 'case-102', 'case-103', 'case-104'])('%s story layer', (id) => {
  test('every non-victim has a chapter and a victim story exists', () => {
    const m = get(id);
    for (const c of m.characters.filter((x) => x.role !== 'victim')) expect(c.public_chapter).toBeTruthy();
    expect(m.victim_chapters.length).toBeGreaterThanOrEqual(3);
  });

  test('chapters never leak secrets, motives or the killer', () => {
    const m = get(id);
    const text = [...m.characters.map((c) => c.public_chapter || ''), ...m.victim_chapters.map((v) => v.text)].join(' ').toLowerCase();
    for (const c of m.characters) {
      const sec = typeof c.secret === 'object' ? c.secret.what : c.secret;
      if (sec) expect(text).not.toContain(String(sec).toLowerCase().slice(0, 30));
    }
    const sol = m.solution ? m.solution.method.toLowerCase().slice(0, 40) : null;
    if (sol) expect(text).not.toContain(sol);
    for (const w of ['killer', 'murderer', 'guilty', 'embezzl', 'forged', 'poisoned him']) expect(text).not.toContain(w);
  });

  test('chapters are even-handed: no suspect stands out by length', () => {
    const lens = get(id).characters.filter((c) => c.role === 'suspect').map((c) => c.public_chapter.length);
    expect(Math.max(...lens) / Math.min(...lens)).toBeLessThan(1.8);
  });

  test('cast chapter unlocks only after interviewing that person', () => {
    const m = get(id);
    const suspect = m.characters.find((c) => c.role === 'suspect');
    const s = Sessions.start({ caseId: id });
    let v = publicView(id, CaseRepository.load(id), Sessions._getSession(s.id));
    expect(v.characters.find((c) => c.id === suspect.id).chapter).toBeNull();
    Sessions.saveInterviewState(s.id, suspect.id, { trust: 0.5, stress: 0.2, met: 1 }, []);
    v = publicView(id, CaseRepository.load(id), Sessions._getSession(s.id));
    expect(v.characters.find((c) => c.id === suspect.id).chapter).toBeTruthy();
  });

  test('victim chapters unfold with evidence, not before', () => {
    const m = get(id);
    const s = Sessions.start({ caseId: id });
    const v0 = publicView(id, CaseRepository.load(id), Sessions._getSession(s.id));
    expect(v0.victim_chapters.length).toBe(0);
    expect(v0.victim_chapters_locked).toBe(m.victim_chapters.length);
  });

  test('open questions never reveal answers and unlock with evidence', () => {
    const m = get(id);
    const ids = new Set(m.evidence.map((e) => e.id));
    expect(m.open_questions.length).toBeGreaterThanOrEqual(3);
    for (const q of m.open_questions) for (const a of q.answered_by) expect(ids.has(a)).toBe(true);
    const s = Sessions.start({ caseId: id });
    const v = publicView(id, CaseRepository.load(id), Sessions._getSession(s.id));
    expect(v.open_questions.every((q) => q.answered === false)).toBe(true);
    expect(JSON.stringify(v.open_questions)).not.toContain('answered_by');
  });
});

describe('tutorial case', () => {
  test('case-001 is solvable with hints and proof', () => {
    const m = get('case-001');
    expect(m.hints.easy.length).toBeGreaterThanOrEqual(3);
    expect(m.proof.length).toBe(3);
    const killer = m.characters.find((c) => c.is_culprit);
    const s = Sessions.start({ caseId: 'case-001', difficulty: 'easy' });
    Sessions.markBriefingSeen(s.id);
    for (const e of m.evidence) Sessions.discover(s.id, e.id);
    const r = Sessions.accuse(s.id, {
      culpritId: killer.id,
      motive: 'planned to sell the workshop and end their affair',
      method: 'poisoned the tea with aconite',
      reason: 'The teacup holds aconite, she brewed it, the contract shows the sale, and the others have receipts.',
      evidenceIds: m.evidence.map((e) => e.id),
    });
    expect(r.verdict).toBe('solved');
  });
});
