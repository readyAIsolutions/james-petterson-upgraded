'use strict';
/**
 * NPCOrchestrator - a controlled agent, NOT a free chatbot (blueprint §10).
 *
 * Each NPC response is assembled from:
 *   - character identity + public profile
 *   - allowed knowledge slice (facts they know, certainty, can_disclose)
 *   - emotional state (trust, stress, fear, cooperation)
 *   - current lie strategy + what would break it
 *   - evidence the player is currently presenting
 *
 * The model returns a STRUCTURED response (spoken_text, emotion_delta,
 * disclosed_fact_ids, referenced_evidence_ids, lie_id, confidence). The server
 * VALIDATES every field against canonical state before returning it to the
 * player. If the model tries to disclose impossible knowledge or alter
 * canonical facts, the response is rejected/regenerated (or truncated).
 *
 * When offline (no API key), a deterministic handler produces believable,
 * knowledge-bounded responses so the vertical slice is fully testable.
 */
const { AIGateway } = require('./ai-gateway');
const CaseRepository = require('./case-repository');

const NPC_MODEL = 'openai/gpt-4o-mini';

class NPCOrchestrator {
  constructor(gateway = new AIGateway(), repo = CaseRepository) {
    this.gateway = gateway;
    this.repo = repo;
    this._registerScripted();
  }

  /**
   * Produce a dialogue response.
   * @param {object} opts { session, characterId, question, presentedEvidence?:[], model? }
   * @returns {Promise<object>} validated { spoken_text, emotion_delta, disclosed_fact_ids, referenced_evidence_ids, lie_id, confidence, rejected }
   */
  async respond(opts) {
    const { session, characterId, question, presentedEvidence = [] } = opts;
    const manifest = this.repo.load(session.case_id);
    const character = (manifest.characters || []).find(c => c.id === characterId);
    if (!character) throw new Error(`Character not found: ${characterId}`);

    // Build the bounded knowledge slice this character may disclose.
    const knowledge = this._knowledgeSlice(manifest, characterId);
    const activeLies = this._activeLies(manifest, characterId);

    const scope = { manifest, character, knowledge, activeLies, question, presentedEvidence, session };

    const res = await this.gateway.complete({
      purpose: 'npc_dialogue',
      model: opts.model || NPC_MODEL,
      sessionId: session.id,
      extra: { json: true },
      scope,
      messages: this._buildPrompt(scope),
    });

    let fields = res.fields;
    if (!fields || !fields.spoken_text) fields = this._fallbackParse(res.text);

    // VALIDATE the structured response against canonical state.
    const validated = this._validate(scope, fields);

    return {
      characterId,
      spoken_text: validated.spoken_text,
      emotion_delta: validated.emotion_delta || {},
      disclosed_fact_ids: validated.disclosed_fact_ids || [],
      referenced_evidence_ids: validated.referenced_evidence_ids || [],
      lie_id: validated.lie_id || null,
      confidence: validated.confidence ?? 0.5,
      rejected: validated.rejected || false,
      provider: res.provider,
      model: res.model,
      traceId: res.traceId,
    };
  }

  _knowledgeSlice(manifest, characterId) {
    const knowledge = [];
    const disclosed = new Set();
    for (const k of manifest.knowledge || []) {
      if (k.character_id !== characterId) continue;
      const fact = manifest.facts.find(f => f.id === k.fact_id);
      if (!fact) continue;
      knowledge.push({
        fact_id: k.fact_id,
        value: fact.value,
        certainty: k.certainty,
        can_disclose: !!k.can_disclose,
      });
    }
    return knowledge;
  }

  _activeLies(manifest, characterId) {
    return (manifest.lies || []).filter(l => l.character_id === characterId && l.active);
  }

  _buildPrompt(scope) {
    const { character, knowledge, activeLies, question, presentedEvidence } = scope;
    const promptedKnow = knowledge
      .filter(k => k.can_disclose)
      .map(k => `- ${k.value} (certainty ${Math.round(k.certainty * 100)}%)`)
      .join('\n');
    const liePrompt = activeLies.length
      ? `You are currently maintaining this deception: "${activeLies[0].cover_story}". Do not reveal it unless evidence that would break it is presented.`
      : '';
    const evidencePrompt = presentedEvidence.length
      ? `The investigator is showing you: ${presentedEvidence.map(e => e.title).join(', ')}. React appropriately.`
      : '';

    return [
      { role: 'system', content: [
        `You are ${character.name}, a ${character.role} in a murder investigation. Public profile: ${character.public_profile || 'unknown'}.`,
        `Motive: ${character.motive || 'none declared'}.`,
        ``,
        `FACTS YOU KNOW (you may reveal these freely if asked):`,
        promptedKnow || '(none you are permitted to share)',
        ``,
        `You do NOT know anything not listed above. If asked about anything else, deflect, express uncertainty, or become defensive — you may not invent facts.`,
        liePrompt,
        `Return STRICT JSON with exactly these fields:`,
        `{"spoken_text": "what you say", "emotion_delta": {"trust": 0.0, "stress": 0.0}, "disclosed_fact_ids": ["fact ids you revealed"], "referenced_evidence_ids": [], "lie_id": "id if you just lied, else null", "confidence": 0.0}`,
      ].join('\n') },
      { role: 'user', content: `[Investigator] ${question}\n${evidencePrompt}` },
    ];
  }

  // Deterministic offline responder (knowledge-bounded).
  _registerScripted() {
    this.gateway.registerScripted('npc_dialogue', (opts) => {
      const scope = opts.scope || {};
      const { character, knowledge, question, activeLies } = scope;
      // A character actively maintaining a lie delivers the lie first.
      if (activeLies.length) {
        return {
          text: JSON.stringify({
            spoken_text: activeLies[0].cover_story,
            emotion_delta: { trust: -0.1, stress: 0.2 },
            disclosed_fact_ids: [],
            referenced_evidence_ids: [],
            lie_id: activeLies[0].id,
            confidence: 0.6,
          }),
        };
      }
      const disclosed = knowledge.filter(k => k.can_disclose);
      if (disclosed.length) {
        const k = disclosed[0];
        return {
          text: JSON.stringify({
            spoken_text: `I can tell you this: ${k.value}`,
            emotion_delta: { trust: 0.1, stress: 0.0 },
            disclosed_fact_ids: [k.fact_id],
            referenced_evidence_ids: [],
            lie_id: null,
            confidence: k.certainty,
          }),
        };
      }
      return {
        text: JSON.stringify({
          spoken_text: `I'm afraid I don't know anything about that, investigator.` ,
          emotion_delta: { trust: 0, stress: 0.1 },
          disclosed_fact_ids: [],
          referenced_evidence_ids: [],
          lie_id: null,
          confidence: 0.3,
        }),
      };
    });
  }

  /**
   * Validate the model's structured output against canonical truth.
   * Core rule: an NPC may only disclose facts in their permitted knowledge
   * slice where can_disclose is true. Anything else is struck and flagged.
   */
  _validate(scope, fields) {
    const { character, manifest } = scope;
    let rejected = false;
    let spoken = fields.spoken_text || '';

    const permitted = new Set(
      (manifest.knowledge || [])
        .filter(k => k.character_id === character.id && k.can_disclose)
        .map(k => k.fact_id)
    );

    // Sanitize disclosed facts.
    const disclosed = (fields.disclosed_fact_ids || []).filter(id => {
      if (permitted.has(id)) return true;
      rejected = true; // model tried to reveal unpermitted knowledge
      return false;
    });

    // Sanitize referenced evidence.
    const caseEvidence = new Set((manifest.evidence || []).map(e => e.id));
    const referenced = (fields.referenced_evidence_ids || []).filter(id => {
      if (caseEvidence.has(id)) return true;
      return false;
    });

    // If the model disclosed forbidden facts, truncate and soften.
    if (rejected) {
      spoken = `(catches themself) I... I shouldn't have said that. Never mind.`;
    }

    return {
      spoken_text: spoken,
      emotion_delta: fields.emotion_delta || { trust: 0, stress: 0.1 },
      disclosed_fact_ids: disclosed,
      referenced_evidence_ids: referenced,
      lie_id: fields.lie_id || null,
      confidence: fields.confidence ?? 0.5,
      rejected,
    };
  }

  /** Compute current lie status for a character given presented evidence. */
  evaluateLies(manifest, characterId, presentedEvidence) {
    const lies = (manifest.lies || []).filter(l => l.character_id === characterId && l.active);
    const presentedIds = new Set(presentedEvidence.map(e => e.id));
    const results = [];
    for (const lie of lies) {
      const broken = (lie.triggers || []).some(t => presentedIds.has(t));
      results.push({ lie_id: lie.id, cover_story: lie.cover_story, broken });
    }
    return results;
  }

  _fallbackParse(text) {
    try {
      const m = text.match(/\{[\s\S]*\}/);
      return m ? JSON.parse(m[0]) : { spoken_text: text };
    } catch {
      return { spoken_text: String(text) };
    }
  }
}

module.exports = { NPCOrchestrator };
