'use strict';
/**
 * CaseRepository - reads/writes immutable canonical case packs.
 *
 * A case is a self-contained JSON document (the "case manifest") with all
 * canonical state. It is versioned and versioned/treated as immutable after
 * publication (Truth-Before-Language).
 *
 * STORAGE NAMESPACING: The database child tables (characters, facts, events,
 * evidence, lies, locations, relationships) key on `id` alone. Generated cases
 * reuse the same LOCAL ids (e.g. `char_s0`, `fact_motive`), which would collide
 * across cases. To keep every case independent we namespace each stored child
 * id as `<caseId>#<localId>` on save and strip the prefix back to the local id
 * on load, so the in-memory manifest always uses short stable ids.
 */
const { getDb } = require('../shared/database');
const crypto = require('node:crypto');

function hashManifest(manifest) {
  return crypto.createHash('sha256').update(JSON.stringify(manifest)).digest('hex');
}

class CaseRepository {
  // Namespace a local child id unique to a case.
  _ns(caseId, localId) { return `${caseId}#${localId}`; }
  // Strip the case namespace back to the local id.
  _unns(caseId, storedId) {
    const p = `${caseId}#`;
    return storedId != null && String(storedId).startsWith(p) ? String(storedId).slice(p.length) : storedId;
  }
  _nsArr(caseId, arr) { return (arr || []).map((x) => this._ns(caseId, x)); }
  _unnsArr(caseId, arr) { return (arr || []).map((x) => this._unns(caseId, x)); }

  save({ id, title = 'Untitled Case', difficulty = 'medium', seed = null, manifest }) {
    const db = getDb();
    const canonicalHash = hashManifest(manifest);
    const version = 'v1';

    db.prepare(`
      INSERT OR REPLACE INTO cases
        (id, version, title, status, difficulty, seed, canonical_hash, premise,
         description, settings, culprit_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, version, title, 'published', difficulty, seed, canonicalHash,
      manifest.premise || null,
      manifest.description || null,
      JSON.stringify(manifest.settings || {}),
      manifest.culprit_id || null
    );

    const ns = (l) => this._ns(id, l);

    // Locations
    const insLoc = db.prepare(`
      INSERT OR REPLACE INTO locations (id, case_id, name, description, scene_meta)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const loc of manifest.locations || []) {
      insLoc.run(ns(loc.id), id, loc.name, loc.description || null, JSON.stringify(loc.meta || {}));
    }

    // Characters
    const insChar = db.prepare(`
      INSERT OR REPLACE INTO characters
        (id, case_id, slug, name, role, motive, traits, public_profile, is_culprit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of manifest.characters || []) {
      insChar.run(
        ns(c.id), id, c.slug || null, c.name, c.role || 'witness',
        c.motive || null, JSON.stringify(c.traits || {}),
        c.public_profile || null, c.is_culprit ? 1 : 0
      );
    }

    // Facts (canonical truth)
    const insFact = db.prepare(`
      INSERT OR REPLACE INTO facts (id, case_id, canonical_value, visibility, category)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const f of manifest.facts || []) {
      insFact.run(ns(f.id), id, f.value, f.visibility || 'secret', f.category || 'general');
    }

    // Character knowledge slices
    const insKnow = db.prepare(`
      INSERT OR REPLACE INTO character_knowledge
        (character_id, fact_id, certainty, source, can_disclose)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const k of manifest.knowledge || []) {
      insKnow.run(ns(k.character_id), ns(k.fact_id), k.certainty ?? 1.0, k.source || null, k.can_disclose ? 1 : 0);
    }

    // Events
    const insEvt = db.prepare(`
      INSERT OR REPLACE INTO events
        (id, case_id, start_time, end_time, location_id, title, description,
         actors, causal_parent, is_public)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const e of manifest.events || []) {
      insEvt.run(
        ns(e.id), id, e.start, e.end || e.start, e.location_id ? ns(e.location_id) : null,
        e.title || null, e.description || null,
        JSON.stringify(this._nsArr(id, e.actors || [])), e.causal_parent ? ns(e.causal_parent) : null,
        e.is_public ? 1 : 0
      );
    }

    // Evidence
    const insEv = db.prepare(`
      INSERT OR REPLACE INTO evidence
        (id, case_id, type, location_id, title, description, fact_links, unlock_rules, meta)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const e of manifest.evidence || []) {
      insEv.run(
        ns(e.id), id, e.type, e.location_id ? ns(e.location_id) : null, e.title, e.description || null,
        JSON.stringify(this._nsArr(id, e.fact_links || [])), JSON.stringify(e.unlock_rules || {}),
        JSON.stringify(e.meta || {})
      );
    }

    // Lies
    const insLie = db.prepare(`
      INSERT OR REPLACE INTO lies
        (id, character_id, fact_id, cover_story, triggers, break_conditions, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const l of manifest.lies || []) {
      insLie.run(
        ns(l.id), ns(l.character_id), l.fact_id ? ns(l.fact_id) : null, l.cover_story,
        JSON.stringify(this._nsArr(id, l.triggers || [])), JSON.stringify(l.break_conditions || {}),
        l.active === false ? 0 : 1
      );
    }

    // Relationships
    const insRel = db.prepare(`
      INSERT OR REPLACE INTO relationships (source_id, target_id, type, strength, case_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const r of manifest.relationships || []) {
      insRel.run(ns(r.source), ns(r.target), r.type, r.strength ?? 0.5, id);
    }

    return { id, version, canonicalHash, title, difficulty };
  }

  load(id) {
    const db = getDb();
    const row = db.prepare(`
      SELECT * FROM cases WHERE id = ? ORDER BY version DESC LIMIT 1
    `).get(id);
    if (!row) return null;

    const getRows = (sql, ...args) => db.prepare(sql).all(...args);
    const un = (v) => this._unns(id, v);

    const locations = getRows('SELECT id, name, description, scene_meta FROM locations WHERE case_id = ?', id)
      .map((r) => ({ id: un(r.id), name: r.name, description: r.description, meta: JSON.parse(r.scene_meta || '{}') }));

    const facts = getRows('SELECT id, canonical_value, visibility, category FROM facts WHERE case_id = ?', id)
      .map((r) => ({ id: un(r.id), value: r.canonical_value, visibility: r.visibility, category: r.category }));

    const characters = getRows('SELECT id, slug, name, role, motive, traits, public_profile, is_culprit FROM characters WHERE case_id = ?', id)
      .map((r) => ({
        id: un(r.id), slug: r.slug, name: r.name, role: r.role, motive: r.motive,
        traits: JSON.parse(r.traits || '{}'), public_profile: r.public_profile,
        is_culprit: !!r.is_culprit
      }));

    const knowledge = getRows(`
      SELECT ck.character_id, ck.fact_id, ck.certainty, ck.source, ck.can_disclose
      FROM character_knowledge ck JOIN facts f ON f.id = ck.fact_id
      WHERE f.case_id = ?
    `, id).map((r) => ({
      character_id: un(r.character_id), fact_id: un(r.fact_id), certainty: r.certainty,
      source: r.source, can_disclose: !!r.can_disclose
    }));

    const events = getRows('SELECT * FROM events WHERE case_id = ? ORDER BY start_time', id)
      .map((r) => ({
        id: un(r.id), start: r.start_time, end: r.end_time,
        location_id: r.location_id ? un(r.location_id) : null,
        title: r.title, description: r.description,
        actors: this._unnsArr(id, JSON.parse(r.actors || '[]')),
        causal_parent: r.causal_parent ? un(r.causal_parent) : null,
        is_public: !!r.is_public
      }));

    const evidence = getRows('SELECT * FROM evidence WHERE case_id = ?', id)
      .map((r) => ({
        id: un(r.id), type: r.type,
        location_id: r.location_id ? un(r.location_id) : null,
        title: r.title, description: r.description,
        fact_links: this._unnsArr(id, JSON.parse(r.fact_links || '[]')),
        unlock_rules: JSON.parse(r.unlock_rules || '{}'), meta: JSON.parse(r.meta || '{}')
      }));

    const lies = getRows('SELECT * FROM lies WHERE character_id IN (SELECT id FROM characters WHERE case_id = ?)', id)
      .map((r) => ({
        id: un(r.id), character_id: un(r.character_id),
        fact_id: r.fact_id ? un(r.fact_id) : null, cover_story: r.cover_story,
        triggers: this._unnsArr(id, JSON.parse(r.triggers || '[]')),
        break_conditions: JSON.parse(r.break_conditions || '{}'),
        active: !!r.active
      }));

    const relationships = getRows('SELECT source_id, target_id, type, strength FROM relationships WHERE case_id = ?', id)
      .map((r) => ({ source: un(r.source_id), target: un(r.target_id), type: r.type, strength: r.strength }));

    return {
      title: row.title,
      difficulty: row.difficulty,
      seed: row.seed,
      canonical_hash: row.canonical_hash,
      culprit_id: un(row.culprit_id),
      premise: row.premise,
      description: row.description,
      settings: JSON.parse(row.settings || '{}'),
      locations, facts, characters, knowledge, events, evidence, lies, relationships
    };
  }

  list(includeDrafts = false) {
    const db = getDb();
    const rows = db.prepare(
      `SELECT id, title, version, difficulty, status, canonical_hash FROM cases
       WHERE status = 'published' OR ? = 1`).all(includeDrafts ? 1 : 0);
    return rows;
  }

  getStatus(id) {
    const db = getDb();
    const row = db.prepare('SELECT status FROM cases WHERE id = ? LIMIT 1').get(id);
    return row ? row.status : null;
  }

  hasCase(id) {
    return getDb().prepare('SELECT 1 AS x FROM cases WHERE id = ? LIMIT 1').get(id) != null;
  }
}

module.exports = new CaseRepository();