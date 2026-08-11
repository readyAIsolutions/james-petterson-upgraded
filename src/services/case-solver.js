'use strict';
/**
 * CaseSolver - deterministic adversarial QA solver (blueprint Days 15-18).
 *
 * Before a generated case may ship, an autonomous "solver agent" must be able
 * to solve it using ONLY the evidence a player can actually discover. This is
 * the adversary to the CaseValidator (which proves the case is structurally
 * consistent): the solver tries to RE-DERIVE the canonical culprit from the
 * in-world clues and flags cases that are:
 *
 *   - IMPOSSIBLE    - the culprit (or the critical fact chain) cannot be
 *                     reconstructed from discoverable evidence
 *   - TRIVIAL       - fewer than 2 suspects, so there is no real choice
 *   - CONTRADICTORY - (informational) timeline conflicts, delegated to the
 *                     validator which already hard-rejects these pre-publication
 *   - AMBIGUOUS     - more than one suspect is an equally good best match to
 *                     the canonical culprit / motive / method
 *
 * The solver is FULLY DETERMINISTIC and OFFLINE: no LLM, no randomness. It
 * mirrors the deterministic accusation scorer's overlap logic in
 * game-session.js so its notion of a "best match" is exactly the scoring the
 * player will face.
 *
 * Discoverability model: unlock_rules with an `inspect` capability are treated
 * as discoverable once the briefing has been seen, which is the gate the
 * GameSessionService applies (markBriefingSeen). The solver therefore ASSUMES
 * the briefing has been seen (best-case fair play) and only requires an
 * evidence's location/type to be reachable.
 */

class CaseSolver {
  /**
   * Attempt to solve a case manifest from discoverable evidence.
   * @param {object} manifest - a case manifest as returned by case-repository.load()
   * @returns {{ ok: boolean, solvable: boolean, reasons: string[], flags: object }}
   *   - ok       - the manifest was well-formed enough to run the analysis
   *   - solvable - every fair-play gate passed (not impossible/trivial, cue exists)
   *   - reasons  - human-readable notes; unsolvability/triviality/ambiguity appear here
   *   - flags    - structured { impossible, trivial, contradictory, ambiguous, discoverable_facts }
   */
  solve(manifest) {
    const reasons = [];
    const flags = {
      impossible: false,
      trivial: false,
      contradictory: false,
      ambiguous: false,
      discoverable_facts: 0,
    };

    // ---- Defensive: never throw on a malformed manifest -------------------
    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
      return {
        ok: false,
        solvable: false,
        reasons: ['manifest is null or not an object'],
        flags,
      };
    }

    const characters = Array.isArray(manifest.characters) ? manifest.characters : [];
    const facts = Array.isArray(manifest.facts) ? manifest.facts : [];
    const evidence = Array.isArray(manifest.evidence) ? manifest.evidence : [];
    const locations = Array.isArray(manifest.locations) ? manifest.locations : [];

    // ---- Culprit present & discoverable ----------------------------------
    const culpritId = manifest.culprit_id;
    const culprit = characters.find((c) => c && c.id === culpritId);
    if (!culpritId || !culprit) {
      reasons.push(
        `culprit_id '${String(culpritId)}' is not declared or is not present in the cast`
      );
      flags.impossible = true;
      return { ok: false, solvable: false, reasons, flags };
    }

    // ---- Non-trivial suspect set -----------------------------------------
    // Need the culpable character plus at least one rival suspect to make a
    // genuine choice. A mystery with a single suspect is trivial.
    const suspects = characters.filter((c) => c && (c.role === 'suspect' || c.is_culprit));
    const rivalSuspects = suspects.filter((c) => c.id !== culpritId);
    if (suspects.length < 2 || rivalSuspects.length < 1) {
      reasons.push(
        `trivial: only ${suspects.length} suspect(s) — need the culprit plus at least one non-culprit rival`
      );
      flags.trivial = true;
    }

    // ---- Reachable evidence (assume briefing seen: inspect-gate lifted) ---
    const locationIds = new Set(locations.map((l) => l && l.id).filter(Boolean));
    const discoveredIds = new Set();
    for (const ev of evidence) {
      if (!ev || typeof ev !== 'object') continue;
      // Location must exist (or be optional) and a type must be declared.
      const loc = ev.location_id;
      const locOk = loc == null || loc === '' || locationIds.has(loc);
      const typeOk = typeof ev.type === 'string' && ev.type.trim().length > 0;
      // Inspect-gated evidence is reachable once briefing seen (assumed true),
      // matching GameSessionService._unlockMet with state.briefing.seen=true.
      if (locOk && typeOk) discoveredIds.add(ev.id);
    }
    flags.discoverable_facts = discoveredIds.size;

    // ---- Every critical fact must be linked from reachable evidence -------
    const criticalFacts = facts.filter((f) => f && f.category === 'critical');
    let impossible = false;
    if (criticalFacts.length === 0) {
      reasons.push('case has no critical facts to derive the culprit from');
      flags.impossible = true;
      impossible = true;
    } else {
      for (const f of criticalFacts) {
        const linked = evidence.some(
          (ev) => discoveredIds.has(ev.id) && (ev.fact_links || []).includes(f.id)
        );
        if (!linked) {
          reasons.push(
            `impossible: critical fact '${f.id}' ('${String(f.value || '').slice(0, 60)}') ` +
              'is not linked by any reachable piece of evidence'
          );
          flags.impossible = true;
          impossible = true;
        }
      }
    }

    if (discoveredIds.size === 0) {
      reasons.push('impossible: no reachable/discoverable evidence exists in the case');
      flags.impossible = true;
      impossible = true;
    }

    // ---- Contradiction (informational) ------------------------------------
    // Timeline correctness is already hard-gated by CaseValidator before a case
    // publishes. Re-detect here purely as an informational note for the audit log.
    if (this._hasTimelineConflict(manifest, characters)) {
      reasons.push('contradiction: an actor occupies two locations at overlapping times (informational — validator gate)');
      flags.contradictory = true;
    }

    // ---- Ambiguity ---------------------------------------------------------
    // If two suspects are an equally good match to the canonical culprit's
    // motive/method (the dimensions the accusation scorer rewards), the case
    // has no single best solution.
    const ambiguity = this._findAmbiguity(manifest, culprit, suspects);
    if (ambiguity) {
      reasons.push(
        `ambiguous: suspects [${ambiguity.join(', ')}] tie for the best motive/method match to the canonical culprit`
      );
      flags.ambiguous = true;
    }

    const solvable = !impossible && !flags.trivial;
    return { ok: true, solvable, reasons, flags };
  }

  /** Detect an actor in two places at the same time (mirrors validator). */
  _hasTimelineConflict(manifest, characters) {
    const events = Array.isArray(manifest.events) ? manifest.events : [];
    const byActor = {};
    const toMs = (v) => {
      if (v == null) return 0;
      if (typeof v === 'number') return v;
      const s = String(v);
      const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(s);
      if (m) return (+m[1]) * 3600000 + (+m[2]) * 60000 + (+(m[3] || 0)) * 1000;
      const t = Date.parse(s);
      return Number.isNaN(t) ? 0 : t;
    };
    for (const e of events) {
      if (!e || typeof e !== 'object') continue;
      const actors = Array.isArray(e.actors) ? e.actors : [];
      for (const actor of actors) {
        if (!(actor in byActor)) byActor[actor] = [];
        byActor[actor].push({
          start: toMs(e.start),
          end: toMs(e.end || e.start),
          loc: e.location_id,
        });
      }
    }
    for (const slots of Object.values(byActor)) {
      slots.sort((a, b) => a.start - b.start);
      for (let i = 0; i < slots.length - 1; i++) {
        const a = slots[i];
        const b = slots[i + 1];
        if (a.end >= b.start && a.loc && b.loc && a.loc !== b.loc) return true;
      }
    }
    return false;
  }

  /**
   * Returns the array of suspect ids that tie for the best combined
   * motive+method match to the canonical culprit, if that best is shared by a
   * non-culprit; otherwise null. Uses the same word-overlap metric as the
   * accusation scorer so the "best match" is exactly what the player's score
   * will reward.
   */
  _findAmbiguity(manifest, culprit, suspects) {
    const culpritMotive = this._norm(culprit.motive);
    const methodFacts = Array.isArray(manifest.facts)
      ? manifest.facts.filter((f) => f && (f.category === 'conclusion' || f.id === 'fact_method' || f.id === 'fact_poison'))
      : [];

    const scored = suspects.map((c) => {
      const motiveMatch = this._overlap(culpritMotive, this._norm(c.motive));
      let methodMatch = 0;
      const nameNorm = this._norm(c.name);
      if (nameNorm.length) {
        for (const f of methodFacts) {
          const fvNorm = this._norm(f.value);
          if (!fvNorm.length) continue;
          const hits = nameNorm.filter((w) => fvNorm.includes(w)).length;
          const ratio = hits / nameNorm.length;
          if (ratio > methodMatch) methodMatch = ratio;
        }
      }
      return { id: c.id, total: motiveMatch + methodMatch };
    });

    if (scored.length === 0) return null;
    const best = Math.max(...scored.map((s) => s.total));
    // A tie only matters when the match is actually meaningful (>0.4) and is
    // shared by a rival — i.e. more than one plausible culprit.
    if (best <= 0.4) return null;
    const tied = scored
      .filter((s) => Math.abs(s.total - best) < 1e-9)
      .map((s) => s.id);
    const rivalTied = tied.filter((id) => id !== culprit.id);
    if (tied.length >= 2 && rivalTied.length >= 1) return tied;
    return null;
  }

  _norm(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
  }
  _overlap(a, b) {
    if (!a.length || !b.length) return 0;
    const set = new Set(b);
    let hits = 0;
    for (const w of a) if (set.has(w)) hits++;
    return hits / a.length;
  }
}

module.exports = { CaseSolver };