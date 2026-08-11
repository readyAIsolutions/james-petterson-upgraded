'use strict';
/**
 * packages/case-schema — machine-readable contract for the platform's
 * CaseManifest (and related types), plus a validateManifest() helper.
 *
 * The schema itself (case-manifest.schema.json) is a standalone Draft 2020-12
 * JSON Schema that types every field, enforces required-ness, enum domains,
 * numeric ranges and (via additionalProperties:false) unknown-key rejection.
 *
 * validateManifest() layers refined graph-integrity rules ON TOP of the schema
 * because cross-entity invariants (orphan references, duplicate ids, the
 * culprit<->is_culprit agreement) are not expressible in pure JSON Schema.
 * It uses ajv when present and ALWAYS runs the hand-rolled reference checker,
 * so semantics never silently degrade if ajv is unavailable.
 *
 * Return value: { valid, errors: string[], ajv: null|object|boolean }
 *   - ajv === true         structural schema passed
 *   - ajv === false        structural schema failed (errors listed in errors[])
 *   - ajv === object       ajv raw result (includeErrors) for deep diagnostics
 *   - ajv === null         ajv could not be loaded; only graph checks ran
 */

const fs = require('node:fs');
const path = require('node:path');

const SCHEMA_PATH = path.join(__dirname, 'case-manifest.schema.json');
const caseManifestSchema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));

// ---------------------------------------------------------------------------
// ajv facade (optional dependency)
// ---------------------------------------------------------------------------
let ajv = null;
try {
  // Use the Draft 2020-12 validator (bundled meta-schema for `$schema` above).
  // eslint-disable-next-line global-require
  const Ajv2020 = require('ajv/dist/2020').default;
  ajv = new Ajv2020({ allErrors: true, strict: false });
  ajv.addSchema(caseManifestSchema, 'case-manifest');
} catch (err) {
  ajv = null; // fall back to the hand-rolled structural checker below
}

// Small hand-rolled structural guard so we still catch type/enum/required
// violations even when ajv is unavailable. Coverage is a pragmatic subset of
// the full schema (sufficient for the graph checks to trust shapes).
const CHARACTER_ROLES = new Set(['victim', 'suspect', 'witness']);
const FACT_CATEGORIES = new Set([
  'critical', 'conclusion', 'alibi', 'forensic',
  'relationship', 'access', 'motive_support', 'general',
]);
const EVIDENCE_TYPES = new Set(['physical', 'document', 'digital', 'testimony', 'audio']);
const DIFFICULTIES = new Set(['easy', 'medium', 'hard', 'expert']);
const VISIBILITIES = new Set(['public', 'secret', 'hidden']);

function asArray(x) {
  return Array.isArray(x) ? x : null;
}

function structuralCheck(m) {
  const errors = [];
  const req = (obj, keys, label) => {
    if (!obj || typeof obj !== 'object') { errors.push(`${label}: expected an object.`); return; }
    for (const k of keys) {
      if (obj[k] === undefined) errors.push(`${label}: missing required field '${k}'.`);
    }
  };
  const enumCheck = (v, set, label) => {
    if (v !== undefined && !set.has(v)) errors.push(`${label}: invalid value '${v}'.`);
  };

  if (!m || typeof m !== 'object') {
    errors.push('Manifest must be an object.');
    return errors;
  }
  req(m, ['title', 'premise', 'settings', 'locations', 'characters', 'facts', 'knowledge', 'events', 'evidence', 'lies', 'relationships'], 'manifest');
  if (typeof m.title !== 'string' || !m.title) errors.push("manifest.title: must be a non-empty string.");
  if (typeof m.premise !== 'string' || !m.premise) errors.push("manifest.premise: must be a non-empty string.");
  if (typeof m.description !== 'string') errors.push("manifest.description: must be a string.");
  enumCheck(m.difficulty, DIFFICULTIES, 'manifest.difficulty');

  for (const [key, itemReq, roleCheck] of [
    ['locations', ['id', 'name'], null],
    ['characters', ['id', 'name', 'role', 'is_culprit'], (c) => enumCheck(c.role, CHARACTER_ROLES, 'character.role')],
    ['facts', ['id', 'value', 'category', 'visibility'], (f) => enumCheck(f.category, FACT_CATEGORIES, 'fact.category')],
    ['knowledge', ['character_id', 'fact_id'], null],
    ['events', ['id', 'start'], null],
    ['evidence', ['id', 'type', 'title'], (e) => enumCheck(e.type, EVIDENCE_TYPES, 'evidence.type')],
    ['lies', ['id', 'character_id', 'cover_story'], null],
    ['relationships', ['source', 'target', 'type'], null],
  ]) {
    const arr = asArray(m[key]);
    if (arr === null) { errors.push(`manifest.${key}: must be an array.`); continue; }
    (arr).forEach((item, i) => {
      req(item, itemReq, `manifest.${key}[${i}]`);
      if (item && typeof item.id !== 'string') errors.push(`manifest.${key}[${i}].id: must be a string.`);
      if (roleCheck) roleCheck(item);
    });
  }
  if (m.settings) {
    req(m.settings, ['crime_location', 'weapon_location', 'multi_culprit'], 'manifest.settings');
    if (typeof m.settings.multi_culprit !== 'boolean') errors.push("manifest.settings.multi_culprit: must be a boolean.");
  }
  return errors;
}

// Reference-sets and relation-pointers.
function collectIds(m, key) {
  return new Set((asArray(m[key]) || []).map((x) => x && x.id).filter((x) => typeof x === 'string'));
}
function dupIds(m, key) {
  const seen = new Set();
  const dups = new Set();
  for (const x of asArray(m[key]) || []) {
    if (x && typeof x.id === 'string') {
      if (seen.has(x.id)) dups.add(x.id);
      seen.add(x.id);
    }
  }
  return dups;
}

function graphCheck(m) {
  const errors = [];
  const charIds = collectIds(m, 'characters');
  const factIds = collectIds(m, 'facts');
  const eventIds = collectIds(m, 'events');
  const evidenceIds = collectIds(m, 'evidence');
  const locationIds = collectIds(m, 'locations');

  // --- duplicate ids -------------------------------------------------------
  for (const key of ['locations', 'characters', 'facts', 'events', 'evidence', 'lies']) {
    const d = dupIds(m, key);
    for (const dup of [...d].sort()) errors.push(`Duplicate ${key} id '${dup}'.`);
  }

  // --- settings references ---------------------------------------------------
  const s = m.settings || {};
  if (s.crime_location && !locationIds.has(s.crime_location)) {
    errors.push(`settings.crime_location references unknown location '${s.crime_location}'.`);
  }
  if (s.weapon_location && !locationIds.has(s.weapon_location)) {
    errors.push(`settings.weapon_location references unknown location '${s.weapon_location}'.`);
  }

  // --- culprit integrity -----------------------------------------------------
  if (s.multi_culprit) {
    if (m.culprit_id != null) errors.push('culprit_id must be null when settings.multi_culprit is true.');
  } else if (m.culprit_id == null) {
    errors.push("Missing culprit: culprit_id required when settings.multi_culprit is false.");
  } else if (!charIds.has(m.culprit_id)) {
    errors.push(`culprit_id '${m.culprit_id}' does not reference an existing character.`);
  }
  const flagged = (asArray(m.characters) || []).filter((c) => c && c.is_culprit === true);
  if (m.culprit_id != null) {
    const char = (asArray(m.characters) || []).find((c) => c && c.id === m.culprit_id);
    if (char && char.is_culprit !== true) {
      errors.push(`culprit_id '${m.culprit_id}' references a character that is not flagged is_culprit.`);
    }
    if (!s.multi_culprit && flagged.length > 1) {
      errors.push('Multiple characters flagged is_culprit in a single-culprit case.');
    }
    if (flagged.length === 0 && m.culprit_id != null) {
      errors.push(`culprit '${m.culprit_id}' declared but no character is flagged is_culprit.`);
    }
  }

  // --- knowledge ---------------------------------------------------------------
  for (const [i, k] of (asArray(m.knowledge) || []).entries()) {
    if (!charIds.has(k.character_id)) errors.push(`knowledge[${i}].character_id references unknown character '${k.character_id}'.`);
    if (!factIds.has(k.fact_id)) errors.push(`knowledge[${i}].fact_id references unknown fact '${k.fact_id}'.`);
    if (typeof k.certainty === 'number' && (k.certainty < 0 || k.certainty > 1)) errors.push(`knowledge[${i}].certainty must be within [0,1].`);
  }

  // --- events ------------------------------------------------------------------
  for (const [i, e] of (asArray(m.events) || []).entries()) {
    if (e.location_id && !locationIds.has(e.location_id)) errors.push(`events[${i}] location_id references unknown location '${e.location_id}'.`);
    for (const a of e.actors || []) {
      if (!charIds.has(a)) errors.push(`events[${i}] actors reference unknown character '${a}'.`);
    }
    if (e.causal_parent && !eventIds.has(e.causal_parent)) errors.push(`events[${i}] causal_parent references unknown event '${e.causal_parent}'.`);
    if (e.end != null && e.start == null) errors.push(`events[${i}] has an end but no start.`);
  }

  // --- evidence (the canonical orphan fact-link failure mode) -------------------
  for (const [i, ev] of (asArray(m.evidence) || []).entries()) {
    if (ev.location_id && !locationIds.has(ev.location_id)) errors.push(`evidence[${i}] location_id references unknown location '${ev.location_id}'.`);
    for (const fid of ev.fact_links || []) {
      if (!factIds.has(fid)) errors.push(`evidence[${i}] fact_links reference unknown fact '${fid}'.`);
    }
  }

  // --- lies ---------------------------------------------------------------------
  for (const [i, l] of (asArray(m.lies) || []).entries()) {
    if (!charIds.has(l.character_id)) errors.push(`lies[${i}].character_id references unknown character '${l.character_id}'.`);
    if (l.fact_id != null && !factIds.has(l.fact_id)) errors.push(`lies[${i}].fact_id references unknown fact '${l.fact_id}'.`);
    for (const trig of l.triggers || []) {
      if (!evidenceIds.has(trig)) errors.push(`lies[${i}].triggers reference unknown evidence '${trig}'.`);
    }
    if (!l.fact_id && (!l.break_conditions || Object.keys(l.break_conditions).length === 0)) {
      errors.push(`lies[${i}] has no fact_id anchor nor break_conditions and cannot be resolved.`);
    }
  }

  // --- relationships --------------------------------------------------------------
  for (const [i, r] of (asArray(m.relationships) || []).entries()) {
    if (!charIds.has(r.source)) errors.push(`relationships[${i}].source references unknown character '${r.source}'.`);
    if (!charIds.has(r.target)) errors.push(`relationships[${i}].target references unknown character '${r.target}'.`);
    if (typeof r.strength === 'number' && (r.strength < 0 || r.strength > 1)) errors.push(`relationships[${i}].strength must be within [0,1].`);
  }

  return errors;
}

// Validate a single loaded/serialized case manifest.
function validateManifest(manifest) {
  const errors = [];
  let ajvValid = null;
  let schemaErrors = [];

  if (ajv) {
    const validate = ajv.getSchema('case-manifest');
    ajvValid = validate(manifest);
    schemaErrors = (validate.errors || []).map((err) => {
      const p = err.instancePath || '/';
      const extra = err.params && err.params.additionalProperty
        ? ` (unexpected '${err.params.additionalProperty}')`
        : '';
      return { path: p, message: `${err.message || err.keyword}${extra}` };
    });
    if (!ajvValid) {
      for (const err of schemaErrors) errors.push(`schema${err.path}: ${err.message}`);
    }
  } else {
    // Pure structural fallback when ajv is unavailable.
    const sErrors = structuralCheck(manifest);
    ajvValid = sErrors.length === 0;
    schemaErrors = sErrors.map((e) => ({ path: '/', message: e }));
    if (!ajvValid) errors.push(...sErrors);
  }

  // Graph-integrity checks always run (independent of ajv availability).
  errors.push(...graphCheck(manifest));

  return { valid: errors.length === 0, errors, structuralValid: ajvValid === true, schemaErrors };
}

module.exports = {
  caseManifestSchema,
  validateManifest,
  _structuralCheck: structuralCheck,
  _graphCheck: graphCheck,
};