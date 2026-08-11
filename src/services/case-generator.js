'use strict';
/**
 * CaseGenerator - builds structured cases through the blueprint's AI pipeline.
 *
 * Steps (blueprint §9):
 *   1. premise → 2. ground truth → 3. event timeline → 4. cast+motive →
 *   5. derive evidence → 6. knowledge slices → 7. lies/red herrings →
 *   8. constraint checks (validator) → reject impossible cases →
 *   9. render prose → 10. originality/safety → publish.
 *
 * The LLM (via AIGateway) proposes structured JSON in early steps; the
 * generator assembles the case and runs it through the CaseValidator. Anything
 * that fails validation is rejected and never published. This preserves the
 * True-Before-Language invariant at generation time too.
 */
const { AIGateway } = require('./ai-gateway');
const { CaseValidator } = require('./case-validator');

const GEN_MODEL = 'openai/gpt-4o-mini';

class CaseGenerator {
  constructor(gateway = new AIGateway()) {
    this.gateway = gateway;
    this.validator = new CaseValidator();
  }

  /**
   * Generate a new case from a premise (optionally LLM-assisted, or from a
   * deterministic template set when offline).
   * @param {object} params { genre, setting, difficulty, playtime_min, premise? }
   * @returns {Promise<{ok:boolean, case?:object, errors?:string[]}>}
   */
  async generateFromPremise(params) {
    const premise = params.premise || (await this._draftPremise(params));
    const groundTruth = this._groundTruthFromPremise(premise, params);
    const manifest = this._assemble(groundTruth, params, premise);

    const result = this.validator.validate(manifest);
    if (!result.valid) {
      return { ok: false, errors: result.errors };
    }
    return { ok: true, case: manifest };
  }

  async _draftPremise(params) {
    const schema = {
      genre: params.genre || 'murder',
      setting: params.setting || 'a quiet English village',
      difficulty: params.difficulty || 'medium',
    };
    if (this.gateway.apiKey) {
      try {
        const res = await this.gateway.complete({
          purpose: 'case_premise',
          model: GEN_MODEL,
          extra: { json: true },
          messages: [
            { role: 'system', content: 'You draft original fair-play mystery premises. Return JSON only: {title:"A short evocative case title", premise:"one or two sentences", victim:"full name", setting:"brief", suspects:["3 full names"], culprit_index:0..2, motive:"", method:"poisoning or other"}. Invent fresh names and titles, never reuse "Final Hour". Do not reference real people or existing works.' },
            { role: 'user', content: `Genre: ${schema.genre}. Setting: ${schema.setting}. Difficulty: ${schema.difficulty}.` },
          ],
        });
        // The gateway already parses JSON into res.fields; fall back to res.text parse.
        const parsed = res.fields && (res.fields.premise || res.fields.suspects) ? res.fields : this._tryParseJson(res.text);
        if (parsed && parsed.suspects) return parsed;
        // malformed -> fall through to deterministic
      } catch (e) {
        // fall through to deterministic
      }
    }
    return this._templatePremise(schema);
  }

  _templatePremise(schema) {
    const victims = ['Elias Wren', 'Cecilia Marlowe', 'Theo Ashford'];
    const suspects = [['Nora', 'Felix', 'Grant'], ['Ivy', 'Simon', 'Walter'], ['June', 'Roland', 'Petra']];
    const idx = (Math.random() * victims.length) | 0;
    const victim = victims[idx];
    const cast = suspects[idx];
    return {
      premise: `${victim}, a respected figure in ${schema.setting}, has been found dead. The police suspect foul play. Three locals had reason to want ${victim} gone.`,
      victim,
      setting: schema.setting,
      suspects: cast,
      culprit_index: 0,
      motive: 'secret dealings that one of the cast wished to bury',
      method: schema.genre === 'poison' ? 'poisoning' : 'a staged accident',
    };
  }

  // Deterministically turn a premise into ground-truth structure.
  _groundTruthFromPremise(premise, params) {
    if (typeof premise === 'object') {
      const p = premise;
      const culprit = p.suspects[p.culprit_index || 0];
      const crimeLoc = 'loc_crime', weaponLoc = 'loc_crime';
      const suspects = p.suspects.map((name, i) => ({
        id: `char_s${i}`, name, role: 'suspect',
        is_culprit: i === (p.culprit_index || 0),
        motive: i === (p.culprit_index || 0) ? p.motive : `possible motive of suspect ${i}`,
        traits: {}, public_profile: name,
      }));
      // victim + witness
      suspects.unshift({ id: 'char_victim', name: p.victim, role: 'victim', is_culprit: false, motive: null, traits: {}, public_profile: `The deceased.` });
      suspects.push({ id: 'char_witness', name: 'The Constable', role: 'witness', is_culprit: false, motive: null, traits: {}, public_profile: 'First officer on the scene.' });

      const poisoned = p.method.includes('poison');
      return {
        title: p.title || this._makeTitle(p, params),
        description: p.premise,
        premise: p.premise,
        settings: {
          crime_location: crimeLoc, weapon_location: weaponLoc,
          multi_culprit: false,
        },
        culprit_id: `char_s${p.culprit_index || 0}`,
        locations: [
          { id: crimeLoc, name: 'The Crime Scene', description: 'Where the body was found.' },
          { id: 'loc_hall', name: 'The Hall', description: 'Gathering area.' },
        ],
        characters: suspects,
        facts: [
          { id: 'fact_time', value: `The incident occurred at the hour of the event.`, category: 'critical', visibility: 'secret' },
          { id: 'fact_motive', value: p.motive, category: 'critical', visibility: 'secret' },
          { id: 'fact_poison', value: `${culprit} was responsible for the death.`, category: 'conclusion', visibility: 'secret' },
          poisoned ? { id: 'fact_method', value: `Poison was administered; death within the hour.`, category: 'conclusion', visibility: 'secret' }
                    : { id: 'fact_method', value: `A staged accident concealed the crime.`, category: 'conclusion', visibility: 'secret' },
          { id: 'fact_residue', value: `Forensic residue at the scene implicated the method.`, category: 'forensic', visibility: 'secret' },
        ],
        knowledge: (() => {
          const k = [];
          const ci = p.culprit_index || 0;
          k.push({ character_id: `char_s${ci}`, fact_id: 'fact_poison', certainty: 1.0, source: 'action', can_disclose: 0 });
          k.push({ character_id: `char_s${ci}`, fact_id: 'fact_motive', certainty: 1.0, source: 'personal', can_disclose: 0 });
          return k;
        })(),
        events: [
          { id: 'evt_1', start: '19:00', end: '19:00', location_id: crimeLoc, title: 'The preparation', description: 'The method is set in motion.', actors: [`char_s${p.culprit_index || 0}`] },
          { id: 'evt_2', start: '20:00', end: '20:00', location_id: crimeLoc, title: 'The incident', description: 'The crime occurs.', actors: ['char_victim'], causal_parent: 'evt_1', is_public: true },
        ],
        evidence: [
          { id: 'ev_weapon', type: 'physical', location_id: crimeLoc, title: 'Trace Evidence', description: 'Material evidence tying the method to the scene.', fact_links: ['fact_residue', 'fact_time', 'fact_method'] },
          { id: 'ev_motive', type: 'document', location_id: crimeLoc, title: 'A Telling Document', description: 'A record of the secret dealings.', fact_links: ['fact_motive'], unlock_rules: { inspect: 'search' } },
        ],
        lies: [],
        relationships: [],
      };
    }
    throw new Error('unsupported premise');
  }

  _tryParseJson(text) {
    try {
      const m = String(text).match(/\{[\s\S]*\}/);
      return m ? JSON.parse(m[0]) : null;
    } catch {
      return null;
    }
  }

  // Distinct, genre-aware case titles for the deterministic/fallback path.
  _makeTitle(p, params) {
    const first = String(p.victim || 'The Victim').split(' ')[0];
    const genre = (params && params.genre) || 'mystery';
    const arc = {
      murder: `${first} in the Manor`,
      poison: `The Bitter Cup of ${first}`,
      heist: `The ${first} Affair`,
      disappearance: `Where Has ${first} Gone?`,
      fraud: `The Ledger of ${first}`,
      locked_room: `Locked In with ${first}`,
      arson: `Fire at ${first}'s Door`,
      kidnapping: `The Taking of ${first}`,
      mystery: `The Case of ${first}`,
    }[genre] || `The Case of ${first}`;
    return arc;
  }

  _assemble(gt, params, premise) {
    return {
      title: gt.title,
      premise: gt.premise,
      description: gt.description,
      difficulty: params.difficulty || 'medium',
      settings: gt.settings,
      culprit_id: gt.culprit_id,
      locations: gt.locations,
      characters: gt.characters,
      facts: gt.facts,
      knowledge: gt.knowledge,
      events: gt.events,
      evidence: gt.evidence,
      lies: gt.lies,
      relationships: gt.relationships,
    };
  }
}

module.exports = { CaseGenerator };
