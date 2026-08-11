'use strict';
/**
 * CASE 001 - "The Clock Strikes at Eight"
 * A hand-authored canonical case pack, designed to pass every validator gate.
 * Used by every team as the reference fixture for tests and integration.
 *
 * SETUP:
 *   Victor Hartley, a reclusive clockmaker, is found dead in his workshop.
 *   The workshop clock was stopped at 8:00. Three suspects: his nephew Elias
 *   (heir), his assistant Marina (lover/failed apprentice), and rival dealer
 *   Silas (owed money). The true killer is Marina — she poisoned Victor's tea
 *   after learning he planned to sell the workshop out from under her.
 */
const manifest = {
  title: 'The Clock Strikes at Eight',
  premise: 'A reclusive clockmaker is found dead with the workshop clock stopped at 8:00. Was it accident, the poisoning heir, or a lover scorned?',
  description: 'Victor Hartley, master clockmaker, is found dead in his locked workshop. His prized grandfather clock stopped at exactly 8:00. Three people had motive.',
  difficulty: 'medium',
  settings: {
    crime_location: 'loc_workshop',
    weapon_location: 'loc_workshop',
    multi_culprit: false,
    narration_style: 'classical_fair_play',
  },
  culprit_id: 'char_marina',
  locations: [
    { id: 'loc_workshop', name: 'Victor\'s Workshop', description: 'A dusty room of clocks and gears. A tea cup sits on the workbench.' },
    { id: 'loc_parlor', name: 'The Parlor', description: 'The Hartley home reception room.' },
    { id: 'loc_kitchen', name: 'The Kitchen', description: 'Where the tea was brewed.' },
    { id: 'loc_shopfront', name: 'The Shop Front', description: 'Public facing clock shop.' },
  ],
  characters: [
    { id: 'char_victor', name: 'Victor Hartley', role: 'victim', is_culprit: false, motive: null, traits: { stubborn: true, meticulous: true }, public_profile: 'The deceased clockmaker.' },
    { id: 'char_elias', name: 'Elias Hartley', role: 'suspect', is_culprit: false, motive: 'Inheritance — he stands to gain the workshop and fortune.', traits: { impatient: true, entitled: true }, public_profile: 'The nephew and heir.' },
    { id: 'char_marina', name: 'Marina Cole', role: 'suspect', is_culprit: true, motive: 'Victor planned to sell the workshop, destroying her apprenticeship and their affair.', traits: { devoted: true, desperate: true }, public_profile: 'The assistant and secret lover.' },
    { id: 'char_silas', name: 'Silas Vane', role: 'suspect', is_culprit: false, motive: 'Victor owed him a large sum for a stolen original.', traits: { calculating: true, debt_collector: true }, public_profile: 'A rival clock dealer.' },
  ],
  facts: [
    // CRITICAL clue facts: the player MUST find these in the world
    { id: 'fact_motive', value: 'Marina learned Victor planned to sell the workshop and end their affair.', category: 'critical', visibility: 'secret' },
    { id: 'fact_time', value: 'Victor drank the tea at 8:00; the clock was stopped when he fell against it.', category: 'critical', visibility: 'secret' },
    // CONCLUSIONS: reached by deduction from clues, never handed to the player
    { id: 'fact_poison', value: 'Marina poisoned Victor\'s tea with aconite.', category: 'conclusion', visibility: 'secret' },
    { id: 'fact_method', value: 'Aconite was administered via the tea; death within the hour.', category: 'conclusion', visibility: 'secret' },
    // supporting / discoverable
    { id: 'fact_elias_alibi', value: 'Elias was at the auction house with Silas until 8:30.', category: 'alibi', visibility: 'secret' },
    { id: 'fact_silas_money', value: 'Silas was owed £5,000 by Victor.', category: 'motive_support', visibility: 'secret' },
    { id: 'fact_marina_access', value: 'Marina brewed the tea and had free access to the workshop.', category: 'access', visibility: 'secret' },
    { id: 'fact_tea_remains', value: 'The tea cup contained aconite residue.', category: 'forensic', visibility: 'secret' },
    { id: 'fact_affair', value: 'Marina and Victor had a secret relationship; a letter confirms this.', category: 'relationship', visibility: 'secret' },
  ],
  knowledge: [
    // Marina knows the truth (culprit)
    { character_id: 'char_marina', fact_id: 'fact_poison', certainty: 1.0, source: 'action', can_disclose: 0 },
    { character_id: 'char_marina', fact_id: 'fact_motive', certainty: 1.0, source: 'personal', can_disclose: 0 },
    { character_id: 'char_marina', fact_id: 'fact_method', certainty: 1.0, source: 'action', can_disclose: 0 },
    // Elias and Silas know their own alibis
    { character_id: 'char_elias', fact_id: 'fact_elias_alibi', certainty: 1.0, source: 'personal', can_disclose: 1 },
    { character_id: 'char_silas', fact_id: 'fact_elias_alibi', certainty: 0.9, source: 'observed', can_disclose: 1 },
    { character_id: 'char_silas', fact_id: 'fact_silas_money', certainty: 1.0, source: 'personal', can_disclose: 0 },
    // Marina falsely claims Elias was angry enough to kill
    { character_id: 'char_marina', fact_id: 'fact_elias_alibi', certainty: 0.2, source: 'rumor', can_disclose: 1 },
  ],
  events: [
    { id: 'evt_1800', start: '18:00', end: '18:00', location_id: 'loc_kitchen', title: 'Tea is brewed', description: 'Marina brews tea in the kitchen.', actors: ['char_marina'] },
    { id: 'evt_1830', start: '18:30', end: '18:30', location_id: 'loc_workshop', title: 'Aconite added', description: 'Marina adds aconite to Victor\'s cup.', actors: ['char_marina'] },
    { id: 'evt_1930', start: '19:30', end: '19:30', location_id: 'loc_shopfront', title: 'Elias & Silas leave', description: 'Elias and Silas leave together for the auction.', actors: ['char_elias', 'char_silas'] },
    { id: 'evt_2000', start: '20:00', end: '20:00', location_id: 'loc_workshop', title: 'Victor drinks', description: 'Victor drinks the tea alone in the workshop.', actors: ['char_victor'], causal_parent: 'evt_1830' },
    { id: 'evt_2030', start: '20:30', end: '20:30', location_id: 'loc_workshop', title: 'Victor dies', description: 'Victor collapses; the clock stops at 8:00.', actors: ['char_victor'], causal_parent: 'evt_2000', is_public: true },
  ],
  evidence: [
    { id: 'ev_teacup', type: 'physical', location_id: 'loc_workshop', title: 'The Tea Cup', description: 'A half-empty teacup on the workbench.', fact_links: ['fact_tea_remains'], unlock_rules: { inspect: 'forensics' } },
    { id: 'ev_letter', type: 'document', location_id: 'loc_workshop', title: 'A Sealed Letter', description: 'A letter from Marina to Victor calling off their arrangement.', fact_links: ['fact_affair', 'fact_motive'], unlock_rules: { inspect: 'search' } },
    { id: 'ev_sale_paper', type: 'document', location_id: 'loc_workshop', title: 'The Sale Contract', description: 'A contract to sell the workshop.', fact_links: ['fact_motive'], unlock_rules: { inspect: 'search' } },
    { id: 'ev_auction_receipt', type: 'document', location_id: 'loc_shopfront', title: 'Auction Receipt', description: 'Receipt showing Elias and Silas at auction until 8:30.', fact_links: ['fact_elias_alibi'], unlock_rules: { acquire: true } },
    { id: 'ev_ledger', type: 'document', location_id: 'loc_workshop', title: 'Victor\'s Ledger', description: 'Shows a £5,000 debt owed by Victor to S. Vane.', fact_links: ['fact_silas_money'] },
    { id: 'ev_stopped_clock', type: 'physical', location_id: 'loc_workshop', title: 'Stopped Clock', description: 'The grandfather clock, stopped at 8:00.', fact_links: ['fact_time'], unlock_rules: {} },
  ],
  lies: [
    { id: 'lie_marina_elias', character_id: 'char_marina', fact_id: 'fact_elias_alibi', cover_story: 'Elias stormed in earlier, furious, threatening Victor.', triggers: ['ev_auction_receipt'], break_conditions: { revealed: 'auction_receipt' } },
  ],
  relationships: [
    { source: 'char_marina', target: 'char_victor', type: 'lover', strength: 0.9 },
    { source: 'char_elias', target: 'char_victor', type: 'family', strength: 0.5 },
    { source: 'char_silas', target: 'char_victor', type: 'debtor', strength: 0.7 },
    { source: 'char_marina', target: 'char_elias', type: 'rival', strength: 0.4 },
  ],
};

module.exports = { id: 'case-001', manifest };
