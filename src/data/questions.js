'use strict';
/** Open questions: always a next step, never the answer. answered_by = any evidence id that settles it. */
module.exports = {
  'case-100': [
    { q: 'Was Ray still alive when the broadcast said he was?', answered_by: ['ev_broadcast', 'ev_signoff', 'ev_logbook'] },
    { q: 'Who could get into Studio A between 00:10 and 00:25?', answered_by: ['ev_keycard', 'ev_wifi', 'ev_booth_cam'] },
    { q: 'What was in the coffee, and where did the cup go?', answered_by: ['ev_draintrap'] },
    { q: 'Who had something to lose by Monday?', answered_by: ['ev_radiothon', 'ev_dante_folder', 'ev_letter'] },
  ],
  'case-101': [
    { q: 'Which glass did Oscar actually drink from?', answered_by: ['ev_flute_shards', 'ev_dumbwaiter'] },
    { q: 'Why was the keynote moved, and who benefited?', answered_by: ['ev_runsheet', 'ev_seal'] },
    { q: 'Who left the gala floor during the mist?', answered_by: ['ev_badge_log', 'ev_panel_print'] },
    { q: 'What did Oscar find out on the private tour?', answered_by: ['ev_crate'] },
  ],
  'case-102': [
    { q: 'Who crossed between the cars that night, and when?', answered_by: ['ev_motionlog'] },
    { q: 'Who handled the brandy before it reached compartment 7?', answered_by: ['ev_steward_ticket', 'ev_coat'] },
    { q: 'If the door was chained from inside, who set the chain?', answered_by: ['ev_chainlatch'] },
    { q: 'What was Lyle carrying that someone wanted gone?', answered_by: ['ev_folder'] },
  ],
  'case-103': [
    { q: 'Did the power fail, or was it made to fail?', answered_by: ['ev_genfilter', 'ev_baro'] },
    { q: 'Who went outside in the six minutes of dark?', answered_by: ['ev_chainannex', 'ev_annexmat', 'ev_marian_statement'] },
    { q: 'Whose boots made that print?', answered_by: ['ev_boots', 'ev_annexmat'] },
    { q: 'What had Corinne found out before dinner?', answered_by: ['ev_ledger2'] },
  ],
  'case-104': [
    { q: 'How did anyone get to the vault with the lift unused?', answered_by: ['ev_liftlog', 'ev_stairlog'] },
    { q: 'Why did Marta go down there alone?', answered_by: ['ev_texts'] },
    { q: 'When did the extinguisher leave the wall, and who saw who come up?', answered_by: ['ev_photos', 'ev_imelda_statement', 'ev_extinguisher'] },
    { q: 'What was Marta about to take to the authorities?', answered_by: ['ev_casefile'] },
  ],
  'case-001': [
    { q: 'When did Victor die, and how do you know?', answered_by: ['ev_stopped_clock', 'ev_teacup'] },
    { q: 'Who could have reached the teacup?', answered_by: ['ev_teacup'] },
    { q: 'Who has an alibi you can check?', answered_by: ['ev_auction_receipt'] },
  ],
};
