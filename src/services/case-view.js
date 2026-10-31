'use strict';
/**
 * Player-facing projection of a case. The browser must NEVER receive the
 * truth (culprit, solution, secrets, lies, undiscovered evidence text).
 *
 * - Evidence ids are opaque per case ("e_" + hash) so ids like
 *   `ev_masterkey` cannot leak the answer before the item is found.
 * - Evidence is gated by a dependency tree (unlock_rules.requires).
 * - Timeline events appear only once the evidence that reveals them is found.
 */
const crypto = require('node:crypto');

const pubId = (caseId, id) => 'e_' + crypto.createHash('sha1').update(`${caseId}:${id}`).digest('hex').slice(0, 8);

/** Accepts either the opaque public id or the internal id. */
function resolveEvidenceId(manifest, caseId, given) {
  for (const e of manifest.evidence || []) {
    if (e.id === given || pubId(caseId, e.id) === given) return e.id;
  }
  return null;
}

function requiresMet(ev, discovered) {
  const req = (ev.unlock_rules && ev.unlock_rules.requires) || [];
  return req.every((r) => discovered.has(r));
}

function isAvailable(ev, discovered, briefingSeen) {
  if (ev.unlock_rules && ev.unlock_rules.inspect && !briefingSeen) return false;
  return requiresMet(ev, discovered);
}

function eventRevealed(evt, discovered) {
  const by = evt.revealed_by;
  if (!by) return true;                 // legacy cases (no reveal data): visible
  if (by.length === 0) return true;     // public from the start
  return by.some((id) => discovered.has(id));
}

function chapterBreaksUnlocked(manifest, discoveredCount) {
  return (manifest.chapter_breaks || []).filter((c) => discoveredCount >= c.at);
}

function publicView(caseId, manifest, session) {
  const discovered = new Set((session && session.discoveredEvidence) || []);
  const seen = !!(session && session.briefing && session.briefing.seen);
  const interviewed = new Set(Object.entries((session && session.interviews) || {}).filter(([, v]) => v && v.met > 0).map(([k]) => k));

  const characters = (manifest.characters || []).map((c) => ({
    id: c.id, name: c.name, role: c.role,
    public_profile: c.public_profile || null,
    motive: c.public_motive || null,
    chapter: interviewed.has(c.id) ? (c.public_chapter || null) : null,
    chapter_locked: !interviewed.has(c.id) && !!c.public_chapter,               // the PUBLIC reason they are a suspect
    voice: c.voice && typeof c.voice === 'object' ? { style: c.voice.style } : undefined,
  }));

  const evidence = [];
  let lockedCount = 0;
  for (const e of manifest.evidence || []) {
    const found = discovered.has(e.id);
    if (found) {
      evidence.push({ id: pubId(caseId, e.id), type: e.type, location_id: e.location_id, title: e.title, description: e.description, discovered: true });
    } else if (isAvailable(e, discovered, seen)) {
      evidence.push({ id: pubId(caseId, e.id), type: e.type, location_id: e.location_id, title: 'Unexamined item', description: null, discovered: false });
    } else {
      lockedCount++;
    }
  }

  const events = (manifest.events || [])
    .filter((e) => eventRevealed(e, discovered))
    .map((e) => ({ id: e.id, start: e.start, end: e.end, location_id: e.location_id, title: e.title, description: e.description, actors: e.actors, is_public: !!e.is_public }));

  const pov = (manifest.killer_pov || [])
    .filter((c) => discovered.has(c.unlock_evidence_id))
    .map((c) => ({ id: c.id, chapter_title: c.chapter_title, text: c.text }));
  const povLocked = (manifest.killer_pov || []).length - pov.length;

  return {
    id: caseId,
    title: manifest.title,
    difficulty: manifest.difficulty,
    premise: manifest.premise,
    description: manifest.description,
    epigraph: manifest.epigraph,
    opening_scene: manifest.opening_scene,
    detective_stake: manifest.detective_stake,
    locations: manifest.locations,
    characters,
    evidence,
    locked_evidence_count: lockedCount,
    events,
    killer_pov: pov,
    killer_pov_locked: povLocked,
    chapter_breaks: chapterBreaksUnlocked(manifest, discovered.size),
    victim_chapters: (manifest.victim_chapters || []).filter((c) => discovered.size >= c.at),
    victim_chapters_locked: (manifest.victim_chapters || []).filter((c) => discovered.size < c.at).length,
    open_questions: (manifest.open_questions || []).map((o) => ({ q: o.q, answered: o.answered_by.some((id) => discovered.has(id)) })),
  };
}

module.exports = { publicView, pubId, resolveEvidenceId, isAvailable, requiresMet, eventRevealed };
