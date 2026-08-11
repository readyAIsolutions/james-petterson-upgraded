'use strict';
/**
 * Tests for packages/case-schema — the machine-readable JSON Schema for the
 * CaseManifest plus the validateManifest() helper.
 *
 * Proves that:
 *   - the schema itself is a well-formed Draft 2020-12 document
 *   - the canonical reference case (case-001) passes validation
 *   - each real failure mode (orphan fact link, duplicate ids, missing
 *     culprit, cruel orphan references) is rejected
 */
const case001 = require('../src/data/case-001');
const { caseManifestSchema, validateManifest } = require('../packages/case-schema');

// Deep-clone helper so tests never mutate the shared case-001 fixture.
const clone = (m) => JSON.parse(JSON.stringify(m));

describe('case-manifest.schema.json', () => {
  test('is a well-formed JSON Schema (Draft 2020-12)', () => {
    expect(caseManifestSchema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
    expect(caseManifestSchema.type).toBe('object');
    expect(caseManifestSchema.$defs).toBeDefined();
    // Every required top-level field is described in properties.
    for (const k of caseManifestSchema.required) {
      expect(caseManifestSchema.properties[k]).toBeDefined();
    }
  });
});

describe('validateManifest — reference case', () => {
  test('case-001 passes the full schema', () => {
    const res = validateManifest(case001.manifest);
    expect(res.valid).toBe(true);
    expect(res.errors).toEqual([]);
    expect(res.structuralValid).toBe(true);
  });
});

describe('validateManifest — failure modes', () => {
  test('rejects an orphan fact link (fact_links points to unknown fact)', () => {
    const m = clone(case001.manifest);
    m.evidence.push({ id: 'ev_bad', type: 'physical', title: 'Bad', fact_links: ['fact_missing'] });
    const res = validateManifest(m);
    expect(res.valid).toBe(false);
    expect(res.errors.join()).toContain('fact_missing');
  });

  test('rejects duplicate entity ids', () => {
    const m = clone(case001.manifest);
    m.evidence.push(JSON.parse(JSON.stringify(m.evidence[0]))); // same id 'ev_teacup'
    const res = validateManifest(m);
    expect(res.valid).toBe(false);
    expect(res.errors.join()).toContain('Duplicate');
    expect(res.errors.join()).toContain('ev_teacup');
  });

  test('rejects a missing culprit in a single-culprit case', () => {
    const m = clone(case001.manifest);
    m.culprit_id = null;
    const res = validateManifest(m);
    expect(res.valid).toBe(false);
    expect(res.errors.join()).toContain('culprit');
  });

  test('rejects culprit_id that is not flagged is_culprit', () => {
    const m = clone(case001.manifest);
    m.characters.find((c) => c.id === 'char_marina').is_culprit = false;
    const res = validateManifest(m);
    expect(res.valid).toBe(false);
    expect(res.errors.join()).toContain('is_culprit');
  });

  test('rejects an event actor that is not a known character', () => {
    const m = clone(case001.manifest);
    m.events[0].actors.push('char_ghost');
    const res = validateManifest(m);
    expect(res.valid).toBe(false);
    expect(res.errors.join()).toContain('char_ghost');
  });

  test('rejects a relationship to an unknown character', () => {
    const m = clone(case001.manifest);
    m.relationships.push({ source: 'char_marina', target: 'char_nobody', type: 'rival' });
    const res = validateManifest(m);
    expect(res.valid).toBe(false);
    expect(res.errors.join()).toContain('char_nobody');
  });

  test('rejects unknown enum values (invalid difficulty / fact category)', () => {
    const a = clone(case001.manifest);
    a.difficulty = 'insane';
    expect(validateManifest(a).valid).toBe(false);

    const b = clone(case001.manifest);
    b.facts[0].category = 'madeup';
    expect(validateManifest(b).valid).toBe(false);
  });

  test('rejects an unknown top-level property (additionalProperties: false)', () => {
    const m = clone(case001.manifest);
    m.hax = 'boom';
    const res = validateManifest(m);
    expect(res.valid).toBe(false);
    expect(res.errors.join()).toContain('hax');
  });
});