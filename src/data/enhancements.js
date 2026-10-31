'use strict';
/**
 * Enhancements layered over the five authored cases (Patterson-style pacing +
 * fair-but-hard puzzle structure). The TRUTH (killer, motive, method, facts,
 * timeline) lives in case-10x.js and is never changed here. This file adds:
 *
 *   gating          evidence -> prerequisite evidence (the clue dependency DAG:
 *                   you cannot just click everything; one discovery unlocks the next)
 *   reveals         event -> evidence that makes the event visible to the player
 *   chapter_breaks  cliffhanger beats unlocked by investigation progress
 *   detective_stake the personal cost to YOU (Patterson: the case always costs the hero)
 *   killer_pov      anonymised killer chapters (no gender / name / job leaks)
 *   locations       neutralised descriptions that used to point at hidden clues
 */
const E = {
  'case-100': {
    detective_stake: 'Your brother Marcus has fallen asleep to Ray Mercer\'s voice every night for ten years. He called you at 00:20: "Ray just said the same sentence twice." The department wants this filed as natural causes by morning. Marcus wants the truth. So do you.',
    gating: {
      ev_signoff: ['ev_broadcast'], ev_draintrap: ['ev_signoff'], ev_keycard: ['ev_logbook'],
      ev_wifi: ['ev_keycard'], ev_booth_cam: ['ev_keycard'], ev_radiothon: ['ev_keycard'],
      ev_cole_keycard: ['ev_promo_sched'], ev_motionless: [],
    },
    reveals: {
      evt_arrive: ['ev_logbook'], evt_coffee: ['ev_draintrap'], evt_dante_booth: ['ev_logbook'],
      evt_evie_in: ['ev_letter'], evt_onair: [], evt_argue: [], evt_promo: ['ev_cole_keycard'],
      evt_break: ['ev_pills'], evt_sip: ['ev_draintrap'], evt_collapse: ['ev_signoff'],
      evt_june_returns: ['ev_keycard'], evt_june_kitchen: ['ev_draintrap'], evt_cole_leave: ['ev_cole_keycard'],
      evt_loop: ['ev_broadcast'], evt_notice: ['ev_logbook'], evt_found: [],
    },
    chapter_breaks: [
      { at: 3, title: 'Chapter 2 — Dead Air', text: 'The station phone rings in the empty hall. A listener wants to know why Ray said the same sentence twice. "He never repeats himself," she whispers. "Unless he couldn\'t stop."' },
      { at: 6, title: 'Chapter 3 — The Envelope', text: 'Someone slides a plain envelope under the booth door. No name. One line in block capitals: ASK WHO WAS NEVER IN THE ROOM. The handwriting matches no one at the station. Or everyone.' },
      { at: 9, title: 'Chapter 4 — Monday', text: 'Ray\'s desk calendar, Monday, 9 a.m.: ALL-HANDS. And beneath it, in his own hand, one underlined word — "Tuesday\'s finding." Someone in this building was running out of Mondays.' },
    ],
    killer_pov: {
      kpov_buffer: 'In the dark of the tape library, the killer listened to a dead man talk twice. The buffer was a gift maintained for years; nobody had ever dreamed it could hold a voice past its last breath. A second pass of the same line. A single nod, like someone closing a ledger. The dead, the killer thought, are just accounts that need to balance. Someone\'s future was safe tonight. That was the only number that mattered.',
      kpov_ledger: 'Four transfers, made quietly and correctly, before anyone thought to look. Ray had found the trail on Tuesday and given until Monday, because he was a kind man with a cruel job. The killer had thanked him for the courtesy by memorising his coffee order. Cream, no sugar. A cup washed clean in a station sink. Somewhere, someone would keep everything they had, and never learn what it cost in diner coffee and dead air.',
    },
    locations: {
      loc_kitchen: 'One sink, one microwave, a coffee maker that has seen better decades.',
    },
  },

  'case-101': {
    detective_stake: 'The conservatory is where your mother\'s ashes were scattered. The foundation board wants this closed quietly by Monday. You refuse, and the board has noticed.',
    gating: {
      ev_dumbwaiter: ['ev_flute_shards'], ev_badge_log: ['ev_flute_shards'], ev_dvr_gap: ['ev_badge_log'],
      ev_crate: ['ev_badge_log'], ev_panel_print: ['ev_runsheet'],
    },
    reveals: {
      evt_tour: ['ev_crate'], evt_schedule: ['ev_runsheet'], evt_wren_in: ['ev_trust_papers'], evt_keynote: [],
      evt_flute: ['ev_flute_shards'], evt_delia_kitchen: ['ev_badge_log'], evt_mist_arm: ['ev_panel_print'],
      evt_corridor_in: ['ev_badge_log'], evt_mist: ['ev_runsheet'], evt_toast: ['ev_dumbwaiter'],
      evt_corridor_out: ['ev_badge_log'], evt_gio_erase: ['ev_dvr_gap'], evt_found: [],
    },
    chapter_breaks: [
      { at: 3, title: 'Chapter 2 — Fog', text: 'Outside, the first guests leave in a hush of limousines. One of them goes without a coat, without a word, and without the doorman noticing. Everyone in the building has just become a suspect, including whoever you trusted five minutes ago.' },
      { at: 6, title: 'Chapter 3 — Closing Time', text: 'The captain gives you until the last guest\'s car clears the gate. Somebody in this building knows exactly how long that is, and has been looking at their watch since before the toast.' },
      { at: 9, title: 'Chapter 4 — The Wrong Question', text: 'Everyone has been asked who wanted Oscar Fielding dead. Nobody has asked who needed him alive until after the toast.' },
    ],
    killer_pov: {
      kpov_mist: 'The override armed under a steady hand that knew this building\'s every habit. In ninety seconds the glass would fog to white and the room would become a confessional with no witness but the plants. A toast rehearsed in a mirror at noon. "To the children\'s wing." He would smile; he always smiled when he was about to get what he wanted. Somewhere, a life cost a fortune a year to keep going. Tonight it cost a man. The mist came down like mercy. The killer walked into it.',
      kpov_crate: 'The receipts had sat in the false bottom since March. Burning them had felt like paperwork, and the crate was heavy, and the gala needed six hundred centerpieces. Oscar found them mid-tour, closed the lid gently, the way he did everything that was about to hurt. "After the toast, we discuss the collection." Ninety minutes to choose between someone loved and a whole life\'s work. The orchids, the killer thought, would understand.',
    },
    locations: {
      loc_office: 'Orchid prints, a wall of conservation awards, and a very tidy desk.',
      loc_dvr: 'The DVR rack and the camera monitors. The screens show the building the way it wants to be seen.',
    },
  },

  'case-102': {
    detective_stake: 'Your partner of nine years retires at dawn. Close this before the train reaches Ironwood and he leaves with a win. Miss it, and the file follows you both for the rest of your lives.',
    gating: {
      ev_motionlog: ['ev_logbook'], ev_masterkey: ['ev_steward_ticket'], ev_coat: ['ev_steward_ticket'],
      ev_vial: ['ev_brandyglass'], ev_chainlatch: ['ev_brandyglass'], ev_folder: ['ev_masterkey'],
    },
    reveals: {
      evt_depart: [], evt_dinner: ['ev_steward_ticket'], evt_lyle_dinner: ['ev_folder'], evt_confront: ['ev_letter'],
      evt_berths: ['ev_masterkey'], evt_turndown: ['ev_logbook'], evt_sasha_berth: ['ev_letter'],
      evt_paulie_photos: ['ev_photos'], evt_brandy_order: ['ev_steward_ticket'], evt_vest1: ['ev_motionlog'],
      evt_handoff: ['ev_steward_ticket'], evt_slide: ['ev_brandyglass'], evt_drink: ['ev_brandyglass'],
      evt_stop: ['ev_motionlog'], evt_reenter: ['ev_chainlatch'], evt_vest2: ['ev_motionlog'],
      evt_yusuf_round: ['ev_logbook'], evt_found: [], evt_vial: ['ev_vial'],
    },
    chapter_breaks: [
      { at: 3, title: 'Chapter 2 — The Chain', text: 'The porter says he heard nothing in the corridor all night. He says it twice. Then he asks, very quietly, whether the chain on Seven is supposed to scratch.' },
      { at: 6, title: 'Chapter 3 — Ironwood', text: 'Six minutes out. The conductor announces the arrival over the intercom, calm as milk. Waiting on the platform: a federal agent, a tow truck, and a lawyer who is already holding someone\'s name.' },
      { at: 9, title: 'Chapter 4 — Last Stop', text: 'Somewhere in the cars behind you, a compartment door clicks open and shut. The conductor swears every seat on this train is accounted for. He is wrong by exactly one.' },
    ],
    killer_pov: {
      kpov_vestibule: 'The vestibule was cold the way only a moving train is cold: wind from a crack, iron underfoot, the black country pouring past the door. The killer waited in a coat that said STAFF to anyone who glanced, for a steward who would see the cloth and not the face. The brandy came warm. A person learns which doors have eyes and which have only wind. On the way back, the sensor above the door blinked its red eye, and the killer thought, almost fondly, that it was the closest thing to a witness there would ever be. Wrong about that, too.',
      kpov_key: 'The copy had been made years ago, in a maintenance office while the night crew played cards, because that was how things worked at that company: you kept the keys to everything you might ever need. Insurance, the killer had told themself. Somewhere in the dark between the city and the end of the line it became something else. The key turned as if it remembered a hand. The chain slid home with a sound like a door closing on a whole life, and the rest of the night was only waiting for the sky to turn the colour of an apology.',
    },
    locations: {},
  },

  'case-103': {
    detective_stake: 'The plows reach the pass in forty-eight hours. Until then you are the only law on this mountain, and whoever did this knows exactly how little you can do about it.',
    gating: {
      ev_genfilter: ['ev_baro'], ev_chainannex: ['ev_baro'], ev_annexmat: ['ev_chainannex'],
      ev_boots: ['ev_annexmat'], ev_ledger2: ['ev_genfilter'], ev_marian_statement: ['ev_photo'],
    },
    reveals: {
      evt_dinner: ['ev_ledger2'], evt_office: ['ev_ledger2'], evt_drift: [], evt_row: [], evt_shovel: ['ev_gear'],
      evt_keys: ['ev_gear'], evt_genshed: ['ev_genfilter'], evt_marian_read: ['ev_marian_statement'],
      evt_power_fail: ['ev_baro'], evt_ford_breaker: ['ev_annexmat'], evt_murder: ['ev_marian_statement'],
      evt_annex: ['ev_annexmat'], evt_hearth: ['ev_poker'], evt_ben_dogs: ['ev_marian_statement'],
      evt_power_on: ['ev_marian_statement'], evt_found: [],
    },
    chapter_breaks: [
      { at: 3, title: 'Chapter 2 — Whiteout', text: 'The radio crackles once with a half-sentence from the sheriff\'s dispatcher and dies. All it said was your name, and the word "careful."' },
      { at: 6, title: 'Chapter 3 — The Long Night', text: 'Someone has moved the lodge guestbook. It was on the office desk at noon. It is on the great-room mantel now, open to a page that has been tapped, three times, with a fingertip.' },
      { at: 9, title: 'Chapter 4 — Thaw', text: 'At 03:12 the wind drops for the first time in three days. In that silence every person in the lodge can hear the same thing: someone else, upstairs, walking very carefully.' },
    ],
    killer_pov: {
      kpov_dark: 'A week of practising the dark: walking a quiet room with the lights off, counting steps to the hearth, learning the weight of an iron tool. The lodge was bigger, but the geometry was the same. Ninety seconds below to make the dust tell a story, then the great room, where the embers gave just enough red light to see by. One blow. The dogs barked twice and the wind took it, and the killer stood very still counting to sixty. At 21:47 the lights came on, and there they were, the one nobody could remember having seen leave.',
      kpov_mat: 'The annex was thirty feet of wind and a doormat, and the killer had not meant to step in the dark. But the blood had found a boot the way guilt finds anyone: unannounced, on the wrong foot, at the worst possible moment. A wipe on the mat, once, twice, and back inside with a face full of cold air and a story already assembled. It never occurred to the killer that the mat would keep a receipt. Everything in this place kept receipts. Six minutes of dark, and something had been miscounted.',
    },
    locations: {
      loc_basement: 'The breaker panel lives at the bottom of a flight of stairs that nobody has swept in years.',
    },
  },

  'case-104': {
    detective_stake: 'The Meridian Grand is where your father tended bar for thirty years. The wrecking crew arrives Monday. If the killer is not named by then, the building falls on the answers.',
    gating: {
      ev_stairlog: ['ev_liftlog'], ev_texts: ['ev_stairlog'], ev_dusttrail: ['ev_stairlog'],
      ev_imelda_statement: ['ev_photos'], ev_plans: ['ev_photos'], ev_fakeenv: ['ev_plans'],
      ev_photocopy: ['ev_fakeenv'], ev_casefile: ['ev_texts'],
    },
    reveals: {
      evt_previews: [], evt_demand: ['ev_photocopy'], evt_imelda_vault: ['ev_photos'], evt_durand_dock: ['ev_ndas'],
      evt_swap: ['ev_fakeenv'], evt_drop: ['ev_fakeenv'], evt_text: ['ev_texts'], evt_tynan_down: ['ev_stairlog'],
      evt_marta_down: ['ev_stairlog'], evt_blow: ['ev_extinguisher'], evt_tynan_up: ['ev_stairlog'],
      evt_imelda_sees: ['ev_imelda_statement'], evt_back: ['ev_imelda_statement'], evt_odell_return: ['ev_stairlog'],
      evt_alarm: [],
    },
    chapter_breaks: [
      { at: 3, title: 'Chapter 2 — Lot 13', text: 'The gavel still lies where the auctioneer dropped it. Under the glass, Lot 13 looks exactly as it did at noon. But the seal on the envelope has a thumbprint on it that was not there at noon.' },
      { at: 6, title: 'Chapter 3 — The Wrecking Crew', text: 'A foreman calls from the street: the crane is moving up the schedule. Monday has become Sunday night. Whatever the building is hiding, it has a deadline now.' },
      { at: 9, title: 'Chapter 4 — Paper Trail', text: 'The shredder in the project trailer is warm. Someone fed it in a hurry, then thought better of it and stopped. Half a page is still caught in the teeth.' },
    ],
    killer_pov: {
      kpov_text: 'A thumb on a screen: "Meet me in the vault. It\'s about the plans." Sent. The vault was the right room: dark, honest, below the auction floor where the liars did their arithmetic in public. A pocketknife through a fire marshal\'s seal, down into the dust, and the extinguisher came off the wall as if it had been waiting since 1929 for someone to need it properly. The keycard clicked at 16:20. She always did exactly what the fine print told her to. Then the swing.',
      kpov_file: 'The file was the problem: green cardboard, one hand under another\'s signature, invoices with fingerprints on the arithmetic. For eleven months the killer had called it fees, had told themself the principal would understand. But she had read it, sticky note and all, in the neat small hand she used for everything that ended people. The extinguisher was wiped. Up the stairs, sleeves damp, a coffee at the desk, a smile in place. A paper trail keeps its own hours, and it had never once missed a deadline.',
    },
    locations: {
      loc_stairwell: 'The old staff stairs from the ballroom wing to the sub-basement, padlocked since the 1990s. A fire marshal\'s seal hangs from the rail.',
    },
  },
};


// Public-facing "why are they a suspect" lines (never reveal the truth).
const SUSPICION = {
  char_june:'Ray\'s boss and oldest friend. She controls the station\'s budgets and every door in the building.',
  char_evie:'Ray\'s producer. Rumoured to have been closer to him than a producer should be.',
  char_dante:'The board operator. Ray had recently been going through the studio equipment inventory.',
  char_cole:'Ray\'s public rival. Heard threatening him at the studio door that night.',
  char_delia:'Runs the conservatory Oscar\'s money keeps alive. He asked her for a private tour before the toast.',
  char_ramsey:'The event planner Oscar\'s foundation is suing. He changed the run sheet that evening.',
  char_wren:'Oscar\'s heir. He wanted her to sign new trust papers that night.',
  char_gio:'Oscar\'s security chief. Knew his job was on the line.',
  char_reggie:'Fired from Meridian three weeks ago, yet booked a compartment on the same train.',
  char_sasha:'The estranged daughter and heir. Seen arguing with her father in the lounge.',
  char_paulie:'A journalist Lyle had threatened to sue. Boarded carrying a camera bag.',
  char_yusuf:'Holds the only official master key. Made the night rounds.',
  char_ford:'Keeps the lodge\'s books. Corinne asked to see him privately after dinner.',
  char_ben:'Fired that afternoon for theft. The last person admitted to seeing Corinne alive.',
  char_astrid:'Arrived three days ago with a story nobody has checked.',
  char_marian:'A retreat guest with no order that can be traced.',
  char_tynan:'Marta\'s project manager. Handled the demolition contracts.',
  char_imelda:'The preservationist who vowed to stop the sale. Inspecting the building that day.',
  char_durand:'Marta\'s rival. Bid far above the building\'s value.',
  char_odell:'The auctioneer. His commission depended on the sale closing, and he found the body.',
};

// When a lie is cracked, these facts become something the character can say.
// (Facts here are LOCKED until then, so nobody volunteers them for free.)
const LIE_UNLOCKS = {
  lie_cole_midnight:['fact_cole_witness','fact_june_access'],
  lie_evie_meds:['fact_evie_meds'],
  lie_gio_post:['fact_gio_knew'],
  lie_ramsey_why:['fact_ramsey_champagne'],
  lie_yusuf_seen:['fact_steward'],
  lie_sasha_none:['fact_sasha'],
  lie_ben_innocent:['fact_ben_gear'],
  lie_astrid_researcher:['fact_astrid_id'],
  lie_marian_nun:['fact_marian_id','fact_marian_witness'],
  lie_imelda_floor:['fact_photos','fact_imelda_sees'],
  lie_odell_envelope:['fact_odell'],
  lie_durand_desk:['fact_durand'],
};
const LOCKED = [['char_marian','fact_marian_witness'],['char_imelda','fact_photos']];


const PROOF = {
  'case-100': [
    { label: 'the killer was in the studio when Ray died', any_of: ['ev_keycard', 'ev_wifi'] },
    { label: 'the broadcast kept running after Ray died', any_of: ['ev_broadcast', 'ev_signoff', 'ev_logbook'] },
    { label: 'the motive (the missing money)', any_of: ['ev_radiothon'] },
  ],
  'case-101': [
    { label: 'the killer was in the staff corridor in the murder window', any_of: ['ev_badge_log', 'ev_panel_print'] },
    { label: 'the poisoned glass and where it went', any_of: ['ev_dumbwaiter', 'ev_flute_shards'] },
    { label: 'the motive (the crate receipts)', any_of: ['ev_crate'] },
  ],
  'case-102': [
    { label: 'someone crossed between the cars during the murder window', any_of: ['ev_motionlog'] },
    { label: 'the person in the staff coat / the second key', any_of: ['ev_steward_ticket', 'ev_coat', 'ev_masterkey'] },
    { label: 'the motive (the folder)', any_of: ['ev_folder'] },
  ],
  'case-103': [
    { label: 'the killer left the building during the blackout', any_of: ['ev_annexmat', 'ev_marian_statement', 'ev_chainannex'] },
    { label: 'the blackout was made, not natural', any_of: ['ev_genfilter'] },
    { label: 'the motive (the ledger)', any_of: ['ev_ledger2'] },
  ],
  'case-104': [
    { label: 'who went down the service stairs in the murder window', any_of: ['ev_stairlog', 'ev_dusttrail', 'ev_imelda_statement'] },
    { label: 'how the victim was lured', any_of: ['ev_texts'] },
    { label: 'the motive (the case file)', any_of: ['ev_casefile'] },
  ],
};

function enhance(id, manifest) {
  const e = E[id];
  if (!e) return manifest;
  const m = JSON.parse(JSON.stringify(manifest));
  m.detective_stake = e.detective_stake;
  m.chapter_breaks = e.chapter_breaks;
  m.proof = PROOF[id] || [];
  for (const ev of m.evidence) {
    const req = (e.gating || {})[ev.id];
    if (req && req.length) ev.unlock_rules = { ...(ev.unlock_rules || {}), requires: req };
  }
  for (const evt of m.events) {
    if (e.reveals && Object.prototype.hasOwnProperty.call(e.reveals, evt.id)) evt.revealed_by = e.reveals[evt.id];
  }
  for (const ch of m.killer_pov || []) if (e.killer_pov[ch.id]) ch.text = e.killer_pov[ch.id];
  for (const loc of m.locations) if (e.locations[loc.id]) loc.description = e.locations[loc.id];
  for (const c of m.characters) if (SUSPICION[c.id]) c.public_motive = SUSPICION[c.id];
  for (const l of m.lies) if (LIE_UNLOCKS[l.id]) l.unlocks = LIE_UNLOCKS[l.id];
  for (const [cid, fid] of LOCKED) for (const k of m.knowledge) if (k.character_id === cid && k.fact_id === fid) k.can_disclose = 0;
  return m;
}

module.exports = { enhance, ENHANCEMENTS: E };
