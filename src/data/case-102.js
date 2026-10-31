'use strict';
/**
 * CASE 102 — "The Northbound Car"
 * An original thriller case: on the overnight Northern Star, a freight-line CEO
 * dies in a compartment chained from the inside. Stops, compartment access,
 * staff duties, and the motion sensor between the cars build the puzzle.
 *
 * KILLER: Reggie Foss, the ex-business partner Lyle Zellinger was about to
 * hand to federal prosecutors for the hazardous-waste cleanup fraud. Reggie
 * rode the line the way he used to — in a navy Meridian coat that still opens
 * doors and a master key that still fits them.
 */
const manifest = {
  title: 'The Northbound Car',
  premise: 'A locked compartment on a moving train, a dead CEO, and a brandy glass that smells of almonds. On the Northern Star, someone knew the rails the way a killer knows a hallway.',
  description: 'The Northern Star leaves Harbor City at 23:40 and arrives in Ironwood at 07:38 — eight hours, five stops, one dining car, and one sleeping-car attendant with a master key. Lyle Zellinger, fifty-nine, CEO of Meridian Freight, is found dead in compartment 7 at 06:20, the chain latch still set from inside, his nightcap brandy untouched except for one sip. The compartment was locked. The train was moving. And the motion sensor between cars one and two logged a ghost.',
  epigraph: 'On a train, everyone has a ticket. Only the killer has a story.',
  difficulty: 'medium',
  settings: {
    crime_location: 'loc_comp7',
    weapon_location: 'loc_comp5',
    multi_culprit: false,
    narration_style: 'thriller_procedural',
  },
  culprit_id: 'char_reggie',

  locations: [
    { id: 'loc_comp7', name: 'Compartment 7', description: 'Lyle Zellinger\'s sleeper: a made-down berth, a fold table, the nightcap tray. The door chain is set — from inside. A brandy glass holds the last thing he drank.' },
    { id: 'loc_comp5', name: 'Compartment 5', description: 'Reggie Foss\'s berth, two doors down. An overnight bag, a Meridian-branded jacket hanging in the wardrobe, toiletries on the shelf.' },
    { id: 'loc_comp9', name: 'Compartment 9', description: 'Sasha Vale\'s sleeper. A paperback on the blanket, a letter folded into the pages, crumpled tissues under the berth.' },
    { id: 'loc_comp6', name: 'Compartment 6', description: 'Paulie Brent\'s berth. A camera bag, a notebook, and a sheaf of freight manifests he will insist are "research".' },
    { id: 'loc_dining', name: 'The Dining Car', description: 'Twin booths, starched linen, amber lamps. The steward\'s order book lives by the galley window.' },
    { id: 'loc_lounge', name: 'The Lounge Car', description: 'Easychairs, a bar for the last hour of the night, and the famous north-facing observation window. The argument happened here.' },
    { id: 'loc_vestibule', name: 'The Vestibule', description: 'The cold gangway between cars one and two. The motion sensor above the door is part of the fire system — it logs every passage, day and night.' },
    { id: 'loc_alcove', name: 'The Attendant\'s Alcove', description: 'Yusuf Adeyemi\'s station: a fold-down seat, the master key on a chain, the service log, and a dead view of the corridor mirrors.' },
    { id: 'loc_trashchute', name: 'Car 1 Trash Chute', description: 'The covered chute at the end of car one, where the porter empties the night\'s rubbish at first light.' },
  ],

  characters: [
    {
      id: 'char_lyle', name: 'Lyle Zellinger', role: 'victim', is_culprit: false, motive: null,
      traits: { exacting: true, controlled: true, unforgiving: true },
      public_profile: 'The deceased. CEO of Meridian Freight Logistics. Fifty-nine, a man who built a coast-to-coast empire and never forgot a debt — owed or owing.',
    },
    {
      id: 'char_reggie', name: 'Reggie Foss', role: 'suspect', is_culprit: true,
      motive: 'Lyle cut Reggie out of the company and was about to hand him to federal prosecutors for the hazardous-waste cleanup fraud — the one secret that could put Reggie away for ten years.',
      traits: { proud: true, resentful: true, patient: true },
      public_profile: 'Meridian Freight\'s former operations VP, fired three weeks ago after nineteen years. Fifty-two. The man who used to know every car on this line by its squeak.',
      voice: {
        style: 'Low, deliberate, graveyard-steady. A voice used to giving orders that no longer get taken. Long silences before anything true.',
        tics: 'Folds his arms like he is bracing; calls the train "the line"; won\'t say Lyle\'s name if he can say "him" instead.',
        vocabulary: 'Railroad and cargo terms: "the line", "rolling stock", "manifest", "deadhead". Old-salt cadence with a corporate accent underneath.',
      },
      backstory: 'Nineteen years building Meridian\'s operations, then the audit found the waste-disposal invoices — his invoices. Lyle didn\'t fire him for fraud; he fired him for getting caught, and kept the folder. Tonight the folder was riding in the purser\'s safe, and Reggie knew it.',
      secret: { what: 'He ran the hazardous-waste fraud, Lyle had the proof, and Reggie killed him to bury it — using a master key and coat from his old life on the line.', why: 'Ten years in federal prison, or one night of nerve. He chose the night.' },
      triggers: { hot_button: ['fraud', 'waste', 'fired', 'prosecutor', 'the folder', 'purser'] },
      interview: {
        opening: 'Polite, weary, slightly condescending. Old hand talking to a rookie.',
        accused: 'Goes colder than the vestibule. Answers in single syllables, watches you like a shunting signal.',
        evidence_shown: 'The motion log or the coat lands. He stops folding his arms and starts holding onto the table edge.',
      },
    },
    {
      id: 'char_sasha', name: 'Sasha Vale', role: 'suspect', is_culprit: false,
      motive: 'Her mother died in the crash of a Meridian-leased jet — and she arrived on the train with a letter that made the tabloids\' version of Lyle look merciful.',
      traits: { fierce: true, grieving: true, private: true },
      public_profile: 'The estranged daughter. Twenty-eight, a marine biologist who has spent four years not speaking to the richest man on the train.',
      voice: {
        style: 'Brittle, precise, quietly furious. Uses her education as a shield; breaks only in controlled doses.',
        tics: 'Touches her collarbone when she lies; folds the letter and unfolds it; says "my father" with quotation marks around the words.',
        vocabulary: 'Scientific vocabulary for feelings: "anomaly", "sample", "baseline". Redirects emotional questions into factual ones.',
      },
      backstory: 'Her mother\'s deathbed letter, four years late through a lawyer\'s office, said Lyle had tried — had carried her mother off the burning wing until the crew pulled him back. Sasha came north to unlearn four years of hate. She and Lyle talked in the lounge at 00:35. She was still crying when she went to her berth.',
      secret: { what: 'She and her father reconciled hours before he died, and she is keeping the reconciliation secret because she is terrified it looks like a motive.', why: 'The world believes she hated him. If they knew he had just changed his will story — that they had made peace — she becomes the grateful daughter who killed at the last minute. Better to look estranged than patricidal.' },
      triggers: { hot_button: ['mother', 'will', 'money', 'reconciled', 'letter', 'lawyer'] },
      interview: {
        opening: 'Hostile on the surface, bleeding underneath. Dares you to call her the heir.',
        accused: 'Fury first, then a crack — the grief comes through sideways and she HATES that.',
        evidence_shown: 'The letter or a photograph of her with her father breaks her composure completely.',
      },
    },
    {
      id: 'char_paulie', name: 'Paulie Brent', role: 'suspect', is_culprit: false,
      motive: 'Lyle had threatened to sue Paulie into bankruptcy over the toxic-waste exposé — and Paulie was on the train with the whistleblower file that could end Meridian.',
      traits: { relentless: true, reckless: true, principled: true },
      public_profile: 'Investigative journalist, forty-five, three national awards and a permanent enemies list. He boarded at Harbor City with a camera bag and no luggage tag.',
      voice: {
        style: 'Rapid-fire, sardonic, always interviewing you back. Loves a dramatic pause and a raised eyebrow.',
        tics: 'Calls strangers "kid", taps his notebook, ends sentences with "right?" like a challenge.',
        vocabulary: 'Press jargon: "the story", "sources", "off the record", "deadline". Everything is a lead or a scoop.',
      },
      backstory: 'Two years on the Meridian toxic-waste story, funded by a publisher Lyle tried to buy. The feds were ready to move on the cleanup fraud — Paulie was the one who tipped them. Lyle found out this week. The threat to sue him into the ground was Lyle\'s last card, and Paulie had already played his.',
      secret: { what: 'He tipped the feds about the waste-fraud, photographed the freight manifest at the rear of the train, and was carrying the one file Lyle had tried to bury.', why: 'Journalistic self-preservation — his source network dies if he admits how close he is to the case, and his editors told him to keep his head down until the indictments drop.' },
      triggers: { hot_button: ['sue', 'exposé', 'manifests', 'feds', 'story', 'publisher'] },
      interview: {
        opening: 'Rapid banter, half-truths, throws questions back at you like a ball return.',
        accused: 'Gets lawyerly — "I\'d love to help, but my notes are privileged" — then forgets and tells you everything.',
        evidence_shown: 'His own photographs of the manifest, or the whistleblower file, and he stops playing games.',
      },
    },
    {
      id: 'char_yusuf', name: 'Yusuf Adeyemi', role: 'suspect', is_culprit: false,
      motive: 'On paper, the sleeping-car attendant is the only person with a master key, the know-how to work the chain latch, and a schedule that puts him outside every compartment at 02:40.',
      traits: { meticulous: true, discreet: true, proud_of_the_line: true },
      public_profile: 'The attendant. Thirty-eight years old, twelve on the Northern Star, a service log with handwriting like a draftsman\'s.',
      voice: {
        style: 'Soft-spoken, formal, precise. Uses full sentences like a butler and notices everything he pretends not to see.',
        tics: 'Stands with his hands behind his back; refers to himself in the third person for rules ("the attendant cannot leave the car"); answers yes as "indeed".',
        vocabulary: 'Rail service language: "berth", "turn-down", "morning call", "the gentleman in Seven". Euphemism is his native tongue.',
      },
      backstory: 'Twelve years of perfect service logs. He saw the man in the navy coat take the brandy at the vestibule — saw him clearly through the alcove mirror at 02:00 — and said nothing because the coat said "staff" and the night said "mind your own". The silence is eating him now.',
      secret: { what: 'He saw the man in the Meridian coat take Lyle\'s brandy at 02:00 and decided it was none of his business. He has been lying about it ever since.', why: 'Institutional conditioning — attendants on the line are taught to see nothing. Now the nothing has a body in it.' },
      triggers: { hot_button: ['mirror', 'coat', 'vestibule', 'brandy', 'log', 'the line'] },
      interview: {
        opening: 'Perfectly helpful, perfectly useless. Answers questions with the service log instead of memory.',
        accused: 'Deeply offended — then suddenly, quietly truthful, like a man who has been carrying something heavy and is glad someone finally asked.',
        evidence_shown: 'The motion log or the steward\'s ticket unlocks the memory he has been hiding behind.',
      },
    },
  ],

  facts: [
    { id: 'fact_motive', value: 'Reggie ran the hazardous-waste fraud that Meridian paid millions to bury; Lyle held the proof in a folder and was handing Reggie to the feds after Ironwood.', category: 'critical', visibility: 'secret' },
    { id: 'fact_poison', value: 'Reggie Foss killed Lyle Zellinger with cyanide in the nightcap brandy.', category: 'conclusion', visibility: 'secret' },
    { id: 'fact_method', value: 'Cyanide was added to Lyle\'s 01:55 brandy order; Lyle drank it at 02:10 and was dead within minutes.', category: 'conclusion', visibility: 'secret' },
    { id: 'fact_vestibule', value: 'The fire-system motion sensor between cars 1 and 2 logged passage at 01:56–02:02 and 02:18–02:20 — exactly the windows Reggie\'s "never left my berth" story denies.', category: 'critical', visibility: 'secret' },
    { id: 'fact_steward', value: 'The dining steward handed the brandy for compartment 7 to a man in a navy Meridian coat at the vestibule — the coat Reggie kept from his old job.', category: 'critical', visibility: 'secret' },
    { id: 'fact_mastercopy', value: 'A spare master key was found wrapped in a sock in Reggie\'s toiletries bag — a copy he kept from his years riding the line as operations VP.', category: 'critical', visibility: 'secret' },
    { id: 'fact_vial', value: 'A small vial with cyanide residue was found in the car-1 trash chute at 06:45.', category: 'forensic', visibility: 'secret' },
    { id: 'fact_chain', value: 'Fresh scratches on the inside chain latch of compartment 7 — the chain was slid shut from outside with a thin rod, not set by the victim.', category: 'forensic', visibility: 'secret' },
    { id: 'fact_sasha', value: 'Sasha confronted her father in the lounge and they reconciled; she returned to her berth at 00:55, and he promised to see her in Ironwood.', category: 'relationship', visibility: 'secret' },
    { id: 'fact_paulie', value: 'Paulie photographed the rear freight manifest for the exposé; he was at the back of the train, never near the compartments, after 01:30.', category: 'motive_support', visibility: 'secret' },
    { id: 'fact_yusuf_note', value: 'Yusuf\'s service log notes compartment 7\'s chain set at 02:40 — three hours before the "sleeping" Lyle was due his morning call.', category: 'alibi', visibility: 'secret' },
  ],

  knowledge: [
    { character_id: 'char_reggie', fact_id: 'fact_poison', certainty: 1.0, source: 'action', can_disclose: 0 },
    { character_id: 'char_reggie', fact_id: 'fact_motive', certainty: 1.0, source: 'personal', can_disclose: 0 },
    { character_id: 'char_reggie', fact_id: 'fact_method', certainty: 1.0, source: 'action', can_disclose: 0 },
    { character_id: 'char_reggie', fact_id: 'fact_mastercopy', certainty: 1.0, source: 'personal', can_disclose: 0 },
    { character_id: 'char_reggie', fact_id: 'fact_vestibule', certainty: 0.9, source: 'personal', can_disclose: 0 },
    { character_id: 'char_yusuf', fact_id: 'fact_steward', certainty: 1.0, source: 'observed', can_disclose: 0 },
    { character_id: 'char_yusuf', fact_id: 'fact_yusuf_note', certainty: 1.0, source: 'personal', can_disclose: 1 },
    { character_id: 'char_yusuf', fact_id: 'fact_chain', certainty: 0.8, source: 'observed', can_disclose: 1 },
    { character_id: 'char_sasha', fact_id: 'fact_sasha', certainty: 1.0, source: 'personal', can_disclose: 0 },
    { character_id: 'char_sasha', fact_id: 'fact_motive', certainty: 0.4, source: 'assumption', can_disclose: 1 },
    { character_id: 'char_paulie', fact_id: 'fact_paulie', certainty: 1.0, source: 'personal', can_disclose: 1 },
    { character_id: 'char_paulie', fact_id: 'fact_motive', certainty: 0.8, source: 'investigation', can_disclose: 0 },
    { character_id: 'char_lyle', fact_id: 'fact_motive', certainty: 1.0, source: 'investigation', can_disclose: 0 },
  ],

  events: [
    { id: 'evt_depart', start: '23:40', end: '23:40', location_id: 'loc_lounge', title: 'Northbound', description: 'The Northern Star pulls out of Harbor City. Passengers settle; the dining car opens for the late service.', actors: [], is_public: true },
    { id: 'evt_dinner', start: '23:50', end: '00:45', location_id: 'loc_dining', title: 'Reggie\'s dinner', description: 'Reggie Foss eats a long, deliberate dinner alone — steak, then coffee, then a second coffee. The steward remembers him: the only man in the car in a suit.', actors: ['char_reggie'] },
    { id: 'evt_lyle_dinner', start: '00:15', end: '00:30', location_id: 'loc_dining', title: 'The CEO\'s table', description: 'Lyle Zellinger takes his usual booth, orders the lamb, leaves half. He looks at Reggie once, without acknowledgment, and reads a folder.', actors: ['char_lyle'] },
    { id: 'evt_confront', start: '00:35', end: '00:50', location_id: 'loc_lounge', title: 'The confrontation in the lounge', description: 'Sasha finds her father in the observation lounge. Voices rise — the bar attendant hears "mother" and "you left her". Then, unaccountably, the voices fall. He says he tried. She cries. They talk until the lights dim.', actors: ['char_sasha', 'char_lyle'] },
    { id: 'evt_berths', start: '01:00', end: '01:00', location_id: 'loc_comp5', title: 'Reggie to his berth', description: 'Reggie leaves the dining car, passes the alcove, and closes himself into compartment 5. The door stays shut for fifty-five minutes.', actors: ['char_reggie'] },
    { id: 'evt_turndown', start: '01:05', end: '01:25', location_id: 'loc_alcove', title: 'Turn-down rounds', description: 'Yusuf makes his rounds: comps 3 through 9. He notes 7 as "settled, no call" and returns to the alcove with the master key on its chain.', actors: ['char_yusuf'] },
    { id: 'evt_sasha_berth', start: '00:55', end: '00:55', location_id: 'loc_comp9', title: 'Sasha to her berth', description: 'Sasha returns to compartment 9, the letter folded into her paperback. She sleeps — or tries to.', actors: ['char_sasha'] },
    { id: 'evt_paulie_photos', start: '01:30', end: '01:50', location_id: 'loc_vestibule', title: 'The rear manifest', description: 'Paulie slips to the rear vestibule and photographs the freight manifest attached to the last car — the evidence of waste shipments he has chased for two years.', actors: ['char_paulie'] },
    { id: 'evt_brandy_order', start: '01:55', end: '01:55', location_id: 'loc_comp7', title: 'The nightcap order', description: 'Lyle buzzes the call button in 7 and orders his usual: a brandy from the dining car, double, no ice. The steward writes the ticket: "7, brandy".', actors: ['char_lyle'] },
    { id: 'evt_vest1', start: '01:58', end: '01:58', location_id: 'loc_vestibule', title: 'The ghost in the vestibule', description: 'The motion sensor between cars 1 and 2 logs a passage at 01:58. Reggie, in the navy Meridian coat, waits in the cold gangway.', actors: ['char_reggie'] },
    { id: 'evt_handoff', start: '02:00', end: '02:00', location_id: 'loc_vestibule', title: 'The handoff', description: 'The steward brings the brandy to the vestibule. A man in a navy Meridian coat takes it: "I\'ll see it to Seven." The steward, who has seen that coat a thousand times, hands it over. Through the alcove mirror, Yusuf sees it happen and looks away.', actors: [], causal_parent: 'evt_brandy_order' },
    { id: 'evt_slide', start: '02:05', end: '02:06', location_id: 'loc_comp7', title: 'The peace offering', description: 'Reggie knocks on 7. Through the door, Lyle\'s voice: "What?" Reggie slides the brandy under the door — "for old times, Lyle." Silence. Then the latch moves. The glass is taken in.', actors: ['char_reggie', 'char_lyle'], causal_parent: 'evt_handoff' },
    { id: 'evt_drink', start: '02:10', end: '02:10', location_id: 'loc_comp7', title: 'The last sip', description: 'Lyle drinks. Cyanide works in minutes. The glass tips on the fold table. The chain — the one he set from habit, alone in compartment 7 — stays latched.', actors: ['char_lyle'], causal_parent: 'evt_slide' },
    { id: 'evt_stop', start: '02:12', end: '02:15', location_id: null, title: 'The signal stop', description: 'The train halts at a red signal between stops — three minutes of silence, the black countryside sliding past like a held breath.', actors: [] },
    { id: 'evt_reenter', start: '02:16', end: '02:18', location_id: 'loc_comp7', title: 'The return', description: 'The master key turns in 7. Reggie steps in, closes the door, and stands over the man who fired him. He checks the pulse the way he once checked freight — twice, no feeling. Then he re-latches the chain from inside, steps out, and slides the latch home from the corridor with a thin rod. Fresh scratches on the brass.', actors: ['char_reggie'], causal_parent: 'evt_drink' },
    { id: 'evt_vest2', start: '02:19', end: '02:20', location_id: 'loc_vestibule', title: 'The ghost returns', description: 'The motion sensor logs the passage again, 02:19 to 02:20. Reggie, coat collar up, walks back through the cold gangway to car 1. In the alcove mirror, Yusuf\'s eyes are closed.', actors: ['char_reggie'] },
    { id: 'evt_yusuf_round', start: '02:40', end: '02:40', location_id: 'loc_comp7', title: 'The 02:40 note', description: 'Yusuf\'s last round. Compartment 7: chain set, no answer. He writes in the log: "7 — CHAIN — ASLEEP".', actors: ['char_yusuf'] },
    { id: 'evt_found', start: '06:22', end: '06:25', location_id: 'loc_comp7', title: 'The morning call', description: 'Yusuf knocks at 06:20 for Lyle\'s Ironwood call. No answer. At 06:22 he uses the trip key and finds him — the chain still set from inside, the brandy glass fallen. The smell of almonds is faint, polite, and everywhere.', actors: ['char_yusuf'], is_public: true },
    { id: 'evt_vial', start: '06:45', end: '06:45', location_id: 'loc_trashchute', title: 'The vial', description: 'The porter empties the car-1 chute at first light. A small amber vial rattles out with the night\'s rubbish — cyanide residue, one drop from empty.', actors: [] },
  ],

  evidence: [
    { id: 'ev_motionlog', type: 'digital', location_id: 'loc_vestibule', title: 'The Motion-Sensor Log', description: 'Fire-system log between cars 1 and 2: 01:56–02:02, one passage. 02:18–02:20, one passage. Nothing else between 23:40 and 07:38. The vestibule door is the only way between the cars.', fact_links: ['fact_vestibule'], unlock_rules: { inspect: 'forensics' } },
    { id: 'ev_steward_ticket', type: 'document', location_id: 'loc_dining', title: 'The Brandy Ticket', description: 'The steward\'s order book: "01:55 — 7 — brandy, double, no ice." Beneath it, his statement: "The man in the navy Meridian coat took it at the vestibule. He said he\'d see it to Seven."', fact_links: ['fact_steward', 'fact_method'], unlock_rules: { acquire: true } },
    { id: 'ev_masterkey', type: 'physical', location_id: 'loc_comp5', title: 'The Spare Master Key', description: 'Wrapped in a sock in Reggie\'s toiletries bag: a brass master key for the sleeping cars, worn with years of use. Not issued — copied. The original hangs in Yusuf\'s alcove on a chain.', fact_links: ['fact_mastercopy'], unlock_rules: { inspect: 'search' } },
    { id: 'ev_coat', type: 'physical', location_id: 'loc_comp5', title: 'The Navy Meridian Coat', description: 'Hanging in Reggie\'s wardrobe: a heavy navy overcoat with the old gold Meridian Freight crest on the breast. The steward identifies it instantly — "exactly what the man at the vestibule wore".', fact_links: ['fact_steward'], unlock_rules: { inspect: 'search' } },
    { id: 'ev_vial', type: 'physical', location_id: 'loc_trashchute', title: 'The Amber Vial', description: 'From the car-1 trash chute: a small pharmaceutical vial, one drop of liquid left. Lab: potassium cyanide. No fingerprints.', fact_links: ['fact_vial', 'fact_method'], unlock_rules: { acquire: true } },
    { id: 'ev_chainlatch', type: 'physical', location_id: 'loc_comp7', title: 'The Chain Latch', description: 'The compartment-7 door chain, still latched. Fresh scratches on the brass slide — made by a thin tool pulling the latch closed from the corridor side. The victim did not set this chain; someone set it for him on the way out.', fact_links: ['fact_chain', 'fact_method'], unlock_rules: { inspect: 'forensics' } },
    { id: 'ev_brandyglass', type: 'physical', location_id: 'loc_comp7', title: 'The Brandy Glass', description: 'The fallen glass on the fold table. One sip gone. The residue smells of bitter almonds: cyanide. The tray is otherwise untouched.', fact_links: ['fact_method'], unlock_rules: { inspect: 'forensics' } },
    { id: 'ev_folder', type: 'document', location_id: 'loc_alcove', title: 'The Purser\'s Folder', description: 'Lyle gave a manila folder to the purser for safekeeping before dinner. Invoice copies, Meridian letterhead, the waste-disposal trail — each page initialed R.F. A cover note in Lyle\'s hand: "For the U.S. Attorney — Ironwood, 08:00."', fact_links: ['fact_motive'], unlock_rules: { acquire: true } },
    { id: 'ev_logbook', type: 'document', location_id: 'loc_alcove', title: 'The Service Log', description: 'Yusuf\'s entries, in his draftsman\'s hand: "01:05–01:25 rounds", "02:40 — 7 — CHAIN — ASLEEP", "06:22 — emergency entry". The 02:40 line is the first entry that ever made him flinch.', fact_links: ['fact_yusuf_note', 'fact_chain'], unlock_rules: { acquire: true } },
    { id: 'ev_photos', type: 'digital', location_id: 'loc_comp6', title: 'Paulie\'s Manifest Photos', description: 'Paulie\'s camera: timestamped shots of the rear freight manifest, 01:31–01:48. The last shot\'s metadata places him at the rear of the train — the far end from compartment 7.', fact_links: ['fact_paulie'], unlock_rules: { acquire: true } },
    { id: 'ev_letter', type: 'document', location_id: 'loc_comp9', title: 'The Mother\'s Letter', description: 'A creased letter, four years old, from Sasha\'s mother: "He carried me out of the fire. They pulled him off me, screaming. Don\'t hate your father, my love — hate the crash." Folded into a paperback in compartment 9.', fact_links: ['fact_sasha'], unlock_rules: { inspect: 'search' } },
  ],

  lies: [
    { id: 'lie_reggie_asleep', character_id: 'char_reggie', fact_id: 'fact_vestibule', cover_story: 'I never left compartment 5 from midnight until the police woke me. I was exhausted — you could fire a cannon down the corridor and I\'d sleep through it. Whoever was in that vestibule, it wasn\'t me.', triggers: ['ev_motionlog', 'ev_steward_ticket', 'ev_masterkey'], break_conditions: { revealed: 'motion_log' } },
    { id: 'lie_yusuf_seen', character_id: 'char_yusuf', fact_id: 'fact_steward', cover_story: 'I saw nothing unusual that night. The vestibule is dark; I was attending to my log; the line moves on its own business. I do not notice passengers at that hour.', triggers: ['ev_steward_ticket', 'ev_motionlog'], break_conditions: { revealed: 'brandy_ticket' } },
    { id: 'lie_paulie_berth', character_id: 'char_paulie', fact_id: 'fact_paulie', cover_story: 'I was in my berth all night after dinner. Never went near the front of the train — the story wasn\'t worth my neck.', triggers: ['ev_photos'], break_conditions: { revealed: 'manifest_photos' } },
    { id: 'lie_sasha_none', character_id: 'char_sasha', fact_id: 'fact_sasha', cover_story: 'I never spoke to him. We were estranged — that\'s the whole story. The last words we exchanged were four years ago, and they were not kind.', triggers: ['ev_letter'], break_conditions: { revealed: 'mother_letter' } },
  ],

  relationships: [
    { source: 'char_reggie', target: 'char_lyle', type: 'ex_partner', strength: 0.3 },
    { source: 'char_sasha', target: 'char_lyle', type: 'daughter', strength: 0.6 },
    { source: 'char_paulie', target: 'char_lyle', type: 'adversary', strength: 0.2 },
    { source: 'char_yusuf', target: 'char_lyle', type: 'attendant', strength: 0.8 },
    { source: 'char_yusuf', target: 'char_reggie', type: 'observer', strength: 0.5 },
  ],

  red_herrings: [
    { suspicious_thing: 'The chained door: compartment 7 was locked from the inside, meaning either Lyle chained it himself before dying — or someone was IN the compartment with him when he died.', truth: 'Lyle set the chain from habit at 02:05 before drinking. The killer re-latched it from the corridor on his way out using a thin rod — the fresh scratches prove it.', explanation: 'The locked-room is an illusion built from a habit (Lyle always chained his door) and a tool (the rod). The scratches on the brass are the tell.' },
    { suspicious_thing: 'Yusuf — the attendant with the only official master key, the know-how to work the chain, and a round at 02:40 right after the murder window.', truth: 'Yusuf\'s log is honest (the 02:40 chain note is real) and his master key never left the chain. The second key — the copy in Reggie\'s bag — is the one that opened 7.', explanation: 'The only master key had an alibi. The copy had none. And Yusuf\'s own memory — the man in the navy coat — is the witness the case needs.' },
    { suspicious_thing: 'Sasha, the estranged daughter, is heard arguing with her father at 00:35 — "mother", "you left her" — and she is next in line for his fortune.', truth: 'The argument was a reconciliation. Her mother\'s deathbed letter proves Lyle tried to save her. Sasha went to her berth at 00:55, before the murder, and her father promised to see her in Ironwood.', explanation: 'The "hate" was a four-year misunderstanding the train ride fixed. Her motive, in the world\'s eyes, was real — which is exactly why she hid the reconciliation.' },
  ],

  clue_map: [
    { clue: 'The motion sensor logged a passage at 01:58 and again at 02:18', unlocks: 'Someone crossed between cars during the murder window — the "never left my berth" stories start cracking', note: 'Hard data beats stories.' },
    { clue: 'The steward\'s ticket: brandy for 7, handed to a man in a navy Meridian coat', unlocks: 'The brandy was intercepted — the method\'s entry point. Who wears a Meridian coat?', note: 'The coat is the thread.' },
    { clue: 'The spare master key in Reggie\'s bag', unlocks: 'The second key — the one not on Yusuf\'s chain — opened compartment 7 at 02:16', note: 'Linked to the vestibule passages.' },
    { clue: 'The purser\'s folder, initialed R.F., headed to the U.S. Attorney at Ironwood 08:00', unlocks: 'Reggie\'s motive — the fraud, the firing, the deadline at dawn', note: 'The folder rides with the victim.' },
    { clue: 'Fresh scratches on the chain latch', unlocks: 'The locked room was staged from outside — method is complete: slide in the brandy, wait, enter with the key, re-chain with the rod', note: 'The illusion breaks.' },
    { clue: 'The amber vial in the trash chute', unlocks: 'The murder weapon\'s journey: out of Reggie\'s berth, into the chute, out of the story — except for the residue', note: 'Physical closure.' },
  ],

  hints: {
    easy: [
      'The compartment was chained from inside — but look at the latch itself. Fresh scratches on the brass mean the chain was closed from the corridor with a tool. The locked room is a trick.',
      'The fire-system motion sensor between cars 1 and 2 logs every passage. Ask who crossed the vestibule at 01:58 and 02:18 — then ask each suspect to explain the log lines, not their feelings.',
      'The steward\'s order book says brandy for compartment 7 was handed to a man in a navy Meridian coat at the vestibule. Only one person on this train has a coat with that gold crest. Check compartment 5\'s wardrobe — and the sock drawer for what should be in it.',
      'The purser is holding a folder Lyle meant to give the U.S. Attorney at 08:00. Read the initials on the invoices, then ask why the ex-operations VP happens to be riding the same train as the proof against him.',
    ],
    standard: [
      'The chain is the illusion: scratches on the latch mean it was set from outside, after death, with a tool. The "locked" compartment is not locked at all — just staged.',
      'Two hard facts collide with all four stories: the motion log (01:58, 02:18) and the steward\'s ticket (navy Meridian coat, vestibule, 02:00). Follow the coat, then follow the key that is NOT on Yusuf\'s chain.',
      'The vial in the trash chute closes the method; the folder in the purser\'s safe closes the motive. Both point the same direction along the corridor.',
    ],
    hard: [
      'The train records everything: the sensor, the ticket book, the service log, the camera\'s metadata, the purser\'s safe. The case solves itself if you read the records like a timetable.',
      'One suspect has an alibi of silence (the log says chain set at 02:40). One has an alibi of absence (the photos). One has an alibi of grief (the letter). One has none at all — because he was in the vestibule when the records say he was.',
    ],
  },

  solution: {
    killer: 'Reggie Foss',
    motive: 'Lyle carried the proof of Reggie\'s hazardous-waste fraud to Ironwood in the purser\'s safe — invoices initialed R.F., delivered to the U.S. Attorney at 08:00. Reggie had been fired for it, and the firing was only the beginning. Ten years in federal prison or one night of nerve: he chose the night.',
    method: 'He rode the line he knew by heart, in the navy Meridian coat that said STAFF to anyone who glanced, with a copied master key wrapped in a sock. At 01:58 he crossed the vestibule — the sensor logged it — and took the steward\'s handoff at 02:00. He slid the cyanide-laced brandy under compartment 7\'s door, let Lyle drink at 02:10, entered with the key at 02:16, confirmed the death, and re-set the chain from the corridor with a thin rod — scratches left on the brass like a signature. He crossed back through the vestibule at 02:18, and the sensor, which never sleeps, told the truth the whole way.',
    narrative: 'The locked compartment was never locked. The chained door was staged with a rod and a dead man\'s habit. The motion sensor between the cars is the honest witness no one thought to interrogate: 01:56–02:02 in, 02:18–02:20 out — the exact shape of a murder hour. The steward\'s ticket names the coat; the wardrobe in 5 holds the coat; the sock drawer holds the key; the trash chute holds the vial; the purser\'s safe holds the folder with R.F. initialed on every page. Sasha\'s grief, Paulie\'s photos, Yusuf\'s silence — three alibis that check out, and one very long dinner in the dining car that did not end where it should have.',
  },

  killer_pov: [
    {
      id: 'kpov_vestibule',
      unlock_evidence_id: 'ev_motionlog',
      chapter_title: 'The Door Between the Cars',
      text: 'The vestibule was cold the way only a moving train is cold — wind from a crack, iron underfoot, the whole black country pouring past the door. He stood in the navy coat that had opened a thousand doors for him and waited for a steward who would see the crest and not the face. The brandy came warm. The vial was already empty in his pocket. Nineteen years on this line and a man learned which doors had eyes and which had only wind. He crossed back at 02:18, and the sensor above the door blinked its red eye, and he thought, almost fondly, that it was the closest thing to a witness he would ever have. He was wrong about that, too.',
    },
    {
      id: 'kpov_key',
      unlock_evidence_id: 'ev_masterkey',
      chapter_title: 'A Key He Kept',
      text: 'He had copied it in 2016, standing in the maintenance office while the night crew played cards, because that was what you did at Meridian — you kept the keys to everything you might ever need. He had told himself it was insurance. Somewhere in the dark between Harbor City and Ironwood it became something else: the answer to a fired man\'s arithmetic. Ten years against one night. The key turned like it remembered his hand. The chain slid home with a sound like a door closing on a whole life, and he walked back to 5, hung the coat in the wardrobe, and lay awake under the stars until the sky went the color of an apology.',
    },
  ],

  opening_scene: [
    'Twenty past midnight, and the dining car of the Northern Star smelled of coffee and old linen.',
    'The train had been northbound for forty minutes. Behind it, Harbor City folded into the dark; ahead, Ironwood waited at the end of the line like a promise the country made to itself. Five stops. Eight hours. One hundred and forty sleeping passengers.',
    'In compartment 7, Lyle Zellinger read a folder by the reading light, and in the dining car, a man in a navy Meridian coat drank a second coffee he did not want.',
    'In the lounge, a young woman told her father she hated him — and then, in the same breath, the way it happens in families, stopped hating him.',
    'At 01:55, Lyle Zellinger rang for a brandy. It was the last thing he ever ordered.',
    'At 06:22, the attendant found him: chain still set, glass fallen, the smell of almonds polite as a guest in the air.',
    'The train kept moving. So did the man who had been in the vestibule at 01:58 — and again at 02:18 — according to the one witness on board that never sleeps.',
  ],
};

module.exports = { id: 'case-102', manifest };
