'use strict';
/**
 * CASE 101 — "The Glasshouse Guest"
 * An original thriller case: at the Meridian Botanical Conservatory's charity
 * gala, billionaire donor Oscar Fielding dies among the orchids — cyanide in
 * the founder's flute, a missing flute, a schedule moved up thirty minutes,
 * and a rain machine that mists the Orchid House every fifteen minutes.
 *
 * KILLER: Delia Marsh, the conservatory director. Oscar discovered she had
 * been selling the collection's rarest specimens on the black market to cover
 * her brother's medical debt. He told her they would discuss it after the
 * toast. She made sure there was no after.
 */
const manifest = {
  title: 'The Glasshouse Guest',
  premise: 'A billionaire philanthropist dies mid-toast in a palace of glass and orchids. The killer used the one tool nobody thought to check: the building itself.',
  description: 'A Night Among the Orchids — the Meridian Conservatory\'s showcase gala, six million dollars of philanthropy under one glass roof. The guest of honor, Oscar Fielding, drinks the pledge toast and is dead within four minutes, crumbled onto the moss bed of the Orchid House like a dropped exhibit. His brand-new champagne flute is gone. The schedule was changed half an hour before he died. And the rain machine, which nobody mentioned, misted the Orchid House at exactly the wrong moment.',
  epigraph: 'Glass remembers everything. It just doesn\'t tell.',
  difficulty: 'medium',
  settings: {
    crime_location: 'loc_orchid',
    weapon_location: 'loc_kitchen',
    multi_culprit: false,
    narration_style: 'thriller_procedural',
  },
  culprit_id: 'char_delia',

  locations: [
    { id: 'loc_orchid', name: 'The Orchid House', description: 'A cathedral of glass and mist. Rare orchids in ranks of brass pots, a moss bed at the center, and a rain machine that breathes every fifteen minutes. The founder\'s flute lies shattered on stone.' },
    { id: 'loc_main', name: 'The Grand Pavilion', description: 'The gala floor. Chandeliers, champagne towers, the auction dais, the pledge banner: OSCAR FIELDING — $10,000,000.' },
    { id: 'loc_servcorr', name: 'The Service Corridor', description: 'Behind the scenes: kitchen, dumbwaiter, climate control. Guests are not allowed past the velvet rope. Staff badges open the door.' },
    { id: 'loc_kitchen', name: 'Gala Kitchen', description: 'Catering chaos. The vintage champagne is stored in a wheeled cooler with a numbered seal.' },
    { id: 'loc_climate', name: 'Climate Control Room', description: 'The guts of the greenhouse: humidity sensors, the rain-machine timer, a panel with fingerprints in the dust.' },
    { id: 'loc_office', name: 'The Director\'s Office', description: 'Delia Marsh\'s room. Orchid prints, a wall of conservation awards — and a dumbwaiter hatch nobody mentioned in the tour.' },
    { id: 'loc_storage', name: 'Specimen Storage', description: 'Back-of-house quarantine for rare plants. A packing crate with import stamps sits half-crushed behind a rack.' },
    { id: 'loc_dvr', name: 'Security Alcove', description: 'The DVR rack and camera monitors. One camera — the corridor cam — has precisely 3:12 of missing footage tonight.' },
  ],

  characters: [
    {
      id: 'char_oscar', name: 'Oscar Fielding', role: 'victim', is_culprit: false, motive: null,
      traits: { exacting: true, generous: true, merciless_with_liars: true },
      public_profile: 'The deceased. Sixty-two years old, founder of Fielding Respiratory, philanthropist, and tonight\'s donor of ten million dollars.',
    },
    {
      id: 'char_delia', name: 'Delia Marsh', role: 'suspect', is_culprit: true,
      motive: 'Oscar discovered Delia was selling the conservatory\'s rarest specimens — the ghost orchids — to a private black market to cover her brother\'s medical debt. Exposure meant prison and the end of everything she built.',
      traits: { composed: true, brilliant: true, cornered: true },
      public_profile: 'The conservatory director. Forty-seven, award-winning botanist, the public face of conservation science.',
      voice: {
        style: 'Scientifically precise, unhurried, gently correcting. Speaks about people the way she speaks about plants — with clinical fondness.',
        tics: 'Wipes her glasses on her sleeve before hard questions; refers to orchids by binomial names when she is uncomfortable; never raises her voice, which makes her silence louder.',
        vocabulary: 'Botany, conservation, "in situ", "ex situ", "the collection", "specimens". Avoids the words theft, money, brother.',
      },
      backstory: 'Her brother Leo\'s ALS care costs six figures a year. Four years ago Delia began selling cuttings and, eventually, whole rare plants to a dealer who never asked questions. The collection has quietly financed Leo\'s life while Delia smiles for the conservation cameras. Oscar found receipts in the storage crate this afternoon.',
      secret: { what: 'She sells the rarest orchids to a black-market dealer to pay for her brother\'s care; Oscar confronted her on the 20:30 tour and she killed him an hour later.', why: 'Her brother would die without the money; her reputation — her life\'s work — would die without the lie.' },
      triggers: { hot_button: ['Leo', 'brother', 'ghost orchid', 'exhibit', 'sales', 'dealer', 'storage'] },
      interview: {
        opening: 'Welcoming, professional, slightly above the fray. Treats you like a curious donor, not an investigator.',
        accused: 'Freezes into perfect composure. Answers every question with a question about your methods. The calm is the tell.',
        evidence_shown: 'Studies it like a specimen under glass. If it is the crate or the flute, something behind her eyes closes — permanently.',
      },
    },
    {
      id: 'char_ramsey', name: 'Ramsey Hodges', role: 'suspect', is_culprit: false,
      motive: 'Oscar was suing Ramsey\'s event company for the botched Harbor Gala — a judgment that would bankrupt him. Ramsey was also the man who changed the schedule.',
      traits: { theatrical: true, overextended: true, desperate: true },
      public_profile: 'The event planner. Thirty-eight, the city\'s favorite party architect, three lawsuits deep and smiling through all of them.',
      voice: {
        style: 'Effervescent, rapid, name-dropping. Talks like he is hosting his own podcast; deflects with charm and volume.',
        tics: 'Gestures with both hands, air-quotes everything, checks his watch at odd moments, calls everyone "darling" including suspects.',
        vocabulary: 'Event-speak: "the flow", "the look", "the room", "darling", "catering", "the timeline".',
      },
      backstory: 'The Harbor Gala disaster — a collapsed canopy, four injuries, his insurer\'s payout — left Oscar\'s foundation suing him for $1.2M. He planned tonight to beg for mercy. When Oscar\'s people moved the keynote up, Ramsey saw a chance to slip away early: his son\'s school play. He also quietly planned to "borrow" the vintage 1947 champagne from the cellar cooler — a bottle worth more than his company.',
      secret: { what: 'He changed the schedule to escape the lawsuit talk early — and was sneaking $18,000 of vintage champagne out back when Oscar died.', why: 'Bankruptcy-level panic. The champagne theft is small-time crime born of big-time fear.' },
      triggers: { hot_button: ['lawsuit', 'Harbor', 'champagne', "son's play", 'schedule'] },
      interview: {
        opening: 'Charm offensive. Offers you canapés. Would rather talk about the flowers than the dead man.',
        accused: 'Volume drops for the first time. Gets sincere, then defensive, then loud again.',
        evidence_shown: 'The schedule or the champagne seal lands hard. He deflates like a balloon animal.',
      },
    },
    {
      id: 'char_wren', name: 'Wren Okafor', role: 'suspect', is_culprit: false,
      motive: 'Oscar\'s stepdaughter and heir — two hundred million dollars, locked behind a new trust agreement he demanded she sign tonight. The papers were in his briefcase.',
      traits: { proud: true, grieving: true, hiding_something: true },
      public_profile: 'Twenty-four years old, Oscar\'s adopted daughter, the reluctant it-girl of the donor class.',
      voice: {
        style: 'Quiet, precise, allergic to her own feelings. Answers in short sentences. Cries in the middle of a sentence and treats it like weather.',
        tics: 'Answers a question by asking one back; twists the ring on her thumb; looks at the exits.',
        vocabulary: 'Deliberately plain: "stuff", "whatever", "fine". Her vocabulary gets formal when she lies — a wall going up.',
      },
      backstory: 'Adopted at eighteen, loved and smothered by a man who wanted a daughter and got a rebel. She was on the train tonight — metaphorically — to tell Oscar she was pregnant and eloping with the valet, Danny. He beat her to it: the new trust papers, "sign tonight or I\'ll reconsider everything".',
      secret: { what: 'She is pregnant, engaged to the valet, and terrified her father\'s death made her the murder-suspect heir who "got what she wanted".', why: 'Her whole life is about to change; she needs to understand whether she is allowed to be sad and rich at the same time.' },
      triggers: { hot_button: ['trust', 'money', 'pregnant', 'Danny', 'valet', 'inheritance'] },
      interview: {
        opening: 'Closed. Polite. Watching you decide who she is.',
        accused: 'Cold fury, then a crack — grief leaks out sideways.',
        evidence_shown: 'If it is her father\'s briefcase or a photo, she breaks. If it is the schedule, she goes blank — she doesn\'t care about schedules.',
      },
    },
    {
      id: 'char_gio', name: 'Gio Veltri', role: 'suspect', is_culprit: false,
      motive: 'Oscar planned to fire him and withdraw his references after the gala — which would collapse Gio\'s entire security business. Gio also knew more about the orchids than he admitted.',
      traits: { watchful: true, loyal_to_himself: true, precise: true },
      public_profile: 'Head of security for the Fielding family. Fifty-three, ex-military, Oscar\'s fixer for twenty years.',
      voice: {
        style: 'Monosyllabic, flat, professional. Weighs every word like ammunition. Silence is his longest sentence.',
        tics: 'Stands with hands clasped behind his back; answers from the corner of his mouth; never blinks when lying.',
        vocabulary: 'Security terms, reports, "sweep", "perimeter", "incident". Says "affirmative" instead of yes.',
      },
      backstory: 'Gio saw the dealer\'s van in the service lot three weeks ago and followed the money to Delia. He held the knowledge like a card, planning to play it after the gala — his job security for her silence. Tonight he was supposed to be the last honest man in the building, and instead he erased three minutes of security footage because they showed him in the garden wing with the valet\'s girlfriend, not at his post.',
      secret: { what: 'He knew about Delia\'s orchid sales and was quietly holding it over her; he also erased 3:12 of corridor footage to hide his own absence from his post.', why: 'His business is built on references. If Oscar fired him, every client would drop him. The footage gap was about his own job, and it accidentally erased the killer\'s route.' },
      triggers: { hot_button: ['footage', 'camera', 'perimeter', 'reference', 'fired', 'dealer'] },
      interview: {
        opening: 'Answers like a deposition. Cooperative, precise, useless.',
        accused: 'The only suspect who gets calmer when accused. Dangerously calm.',
        evidence_shown: 'The DVR gap lands with him — he knows exactly what is in the missing three minutes, and starts negotiating instead of answering.',
      },
    },
  ],

  facts: [
    { id: 'fact_motive', value: 'Delia sold the conservatory\'s rarest orchids to a black-market dealer to fund her brother\'s ALS care; Oscar found the receipts and confronted her on the 20:30 tour.', category: 'critical', visibility: 'secret' },
    { id: 'fact_poison', value: 'Delia Marsh killed Oscar Fielding with potassium cyanide in the founder\'s champagne flute.', category: 'conclusion', visibility: 'secret' },
    { id: 'fact_method', value: 'Cyanide in the champagne toast; Oscar was dead within four minutes of the first sip.', category: 'conclusion', visibility: 'secret' },
    { id: 'fact_flute', value: 'The founder\'s engraved flute — the one Oscar drank the pledge toast from — is missing; a cracked flute with cyanide residue was found in the office dumbwaiter.', category: 'critical', visibility: 'secret' },
    { id: 'fact_schedule', value: 'Ramsey moved the keynote up 30 minutes (21:45 to 21:15) — putting Oscar\'s toast inside the 21:30 rain-machine mist cycle.', category: 'critical', visibility: 'secret' },
    { id: 'fact_mist', value: 'The rain machine mists the Orchid House every 15 minutes. The 21:30 mist muffled sound and hid movement during the murder window.', category: 'forensic', visibility: 'secret' },
    { id: 'fact_gio_knew', value: 'Gio knew about Delia\'s sales and was holding the knowledge over her; his 3:12 of erased footage covers the service-corridor exit at 21:29–21:30.', category: 'critical', visibility: 'secret' },
    { id: 'fact_corridor', value: 'The service corridor is staff-only; Delia\'s badge logged the door at 21:26 and 21:29 — the exact window of the murder.', category: 'access', visibility: 'secret' },
    { id: 'fact_wren_trust', value: 'Oscar demanded Wren sign the new trust papers tonight — she was going to refuse and tell him about the baby; the papers sit unsigned in his briefcase.', category: 'relationship', visibility: 'secret' },
    { id: 'fact_ramsey_champagne', value: 'Ramsey planned to spirit away the 1947 vintage bottle; the numbered cooler seal is broken and the bottle is gone from the kitchen cooler as of 22:00.', category: 'motive_support', visibility: 'secret' },
    { id: 'fact_climate_panel', value: 'The climate-control panel — which arms the rain machine out of cycle — has a fresh fingerprint in the dust, size small, matching Delia\'s glove size.', category: 'forensic', visibility: 'secret' },
  ],

  knowledge: [
    { character_id: 'char_delia', fact_id: 'fact_poison', certainty: 1.0, source: 'action', can_disclose: 0 },
    { character_id: 'char_delia', fact_id: 'fact_motive', certainty: 1.0, source: 'personal', can_disclose: 0 },
    { character_id: 'char_delia', fact_id: 'fact_method', certainty: 1.0, source: 'action', can_disclose: 0 },
    { character_id: 'char_delia', fact_id: 'fact_flute', certainty: 1.0, source: 'action', can_disclose: 0 },
    { character_id: 'char_delia', fact_id: 'fact_mist', certainty: 1.0, source: 'professional', can_disclose: 1 },
    { character_id: 'char_delia', fact_id: 'fact_corridor', certainty: 1.0, source: 'personal', can_disclose: 0 },
    { character_id: 'char_delia', fact_id: 'fact_schedule', certainty: 0.7, source: 'observed', can_disclose: 1 },
    { character_id: 'char_gio', fact_id: 'fact_gio_knew', certainty: 1.0, source: 'personal', can_disclose: 0 },
    { character_id: 'char_gio', fact_id: 'fact_motive', certainty: 0.9, source: 'investigation', can_disclose: 0 },
    { character_id: 'char_gio', fact_id: 'fact_corridor', certainty: 0.9, source: 'observed', can_disclose: 1 },
    { character_id: 'char_ramsey', fact_id: 'fact_schedule', certainty: 1.0, source: 'personal', can_disclose: 1 },
    { character_id: 'char_ramsey', fact_id: 'fact_ramsey_champagne', certainty: 1.0, source: 'personal', can_disclose: 0 },
    { character_id: 'char_wren', fact_id: 'fact_wren_trust', certainty: 1.0, source: 'personal', can_disclose: 1 },
    { character_id: 'char_oscar', fact_id: 'fact_motive', certainty: 1.0, source: 'investigation', can_disclose: 0 },
  ],

  events: [
    { id: 'evt_tour', start: '20:30', end: '20:42', location_id: 'loc_orchid', title: 'Oscar\'s private tour', description: 'Delia walks Oscar through the Orchid House. In the storage room, the packing crate catches his eye. The receipts are still inside. He tells her, quietly, "After the toast, we discuss the collection."', actors: ['char_delia', 'char_oscar'] },
    { id: 'evt_schedule', start: '20:45', end: '20:45', location_id: 'loc_main', title: 'The schedule changes', description: 'Ramsey, panicking about the weather window, moves Oscar\'s keynote from 21:45 to 21:15. New run sheets go out. Nobody tells the rain machine.', actors: ['char_ramsey'] },
    { id: 'evt_wren_in', start: '21:00', end: '21:00', location_id: 'loc_main', title: 'Wren arrives', description: 'Wren arrives late with Danny\'s coat still on her arm. Gio escorts her past the photographers.', actors: ['char_wren'] },
    { id: 'evt_keynote', start: '21:15', end: '21:25', location_id: 'loc_main', title: 'The keynote', description: 'Oscar delivers his pledge speech — ten million for the new children\'s wing. Roaring applause. He steps down and heads for the Orchid House, his ritual.', actors: ['char_oscar'], is_public: true },
    { id: 'evt_flute', start: '21:20', end: '21:20', location_id: 'loc_kitchen', title: 'The founder\'s flute', description: 'The catering chief fills the engraved founder\'s flute with the 1947 vintage for Oscar\'s private toast. It sits on the silver tray by the velvet rope.', actors: [] },
    { id: 'evt_delia_kitchen', start: '21:24', end: '21:24', location_id: 'loc_kitchen', title: 'The swap', description: 'Delia, badge open, takes the tray into the climate room for "humidity check". The flute is never seen again — except, later, cracked, in a dumbwaiter.', actors: ['char_delia'] },
    { id: 'evt_mist_arm', start: '21:25', end: '21:25', location_id: 'loc_climate', title: 'The timer', description: 'Someone arms the rain machine for an out-of-cycle mist. A small glove leaves a fresh print in the panel dust.', actors: ['char_delia'] },
    { id: 'evt_corridor_in', start: '21:26', end: '21:26', location_id: 'loc_servcorr', title: 'Corridor entry', description: 'Delia\'s badge logs the staff door at 21:26. Gio\'s corridor cam records the next minute — until the footage stops.', actors: ['char_delia'] },
    { id: 'evt_mist', start: '21:30', end: '21:31', location_id: 'loc_orchid', title: 'The rain machine', description: 'The Orchid House mists at 21:30, on schedule and off. Sightlines die. Sound dies. The glass fogs from the inside.', actors: [], is_public: true },
    { id: 'evt_toast', start: '21:28', end: '21:28', location_id: 'loc_orchid', title: 'The last toast', description: 'Delia hands Oscar the founder\'s flute through the mist. "To the children\'s wing." He drinks. Four minutes later, he is gone, on the moss bed, the second flute — his first glass — shattered beside him.', actors: ['char_delia', 'char_oscar'], causal_parent: 'evt_delia_kitchen' },
    { id: 'evt_corridor_out', start: '21:29', end: '21:29', location_id: 'loc_servcorr', title: 'Corridor exit', description: 'Delia\'s badge logs the staff door at 21:29. The flute goes down the dumbwaiter to her office, cracked on the rim.', actors: ['char_delia'] },
    { id: 'evt_gio_erase', start: '21:27', end: '21:30', location_id: 'loc_dvr', title: 'The missing three minutes', description: 'The corridor camera stops at 21:27:01 and resumes 21:30:13. Someone with DVR access — Gio — has just erased himself, and the killer, from the record.', actors: ['char_gio'] },
    { id: 'evt_found', start: '21:40', end: '21:40', location_id: 'loc_orchid', title: 'Found', description: 'Ramsey comes looking for Oscar with the foundation plaque. He finds him on the moss bed, the shattered flute at his hand, the smell of bitter almonds in the air.', actors: ['char_ramsey'], is_public: true },
  ],

  evidence: [
    { id: 'ev_flute_shards', type: 'physical', location_id: 'loc_orchid', title: 'Shattered Champagne Flute', description: 'Oscar\'s FIRST glass — the one he carried from the keynote — shattered when he fell. Traces of 1947 vintage, no cyanide. His real drinking glass is somewhere else.', fact_links: ['fact_flute', 'fact_method'], unlock_rules: { inspect: 'forensics' } },
    { id: 'ev_dumbwaiter', type: 'physical', location_id: 'loc_office', title: 'The Cracked Founder\'s Flute', description: 'In the office dumbwaiter: the engraved founder\'s flute, cracked on the rim, rinsed but still carrying potassium cyanide residue. Engraved: O. FIELDING.', fact_links: ['fact_flute', 'fact_method'], unlock_rules: { inspect: 'search' } },
    { id: 'ev_runsheet', type: 'document', location_id: 'loc_main', title: 'The Revised Run Sheet', description: 'The 20:45 revision: keynote moved from 21:45 to 21:15. Ramsey\'s initials. The rain machine schedule is printed on the back of the old sheet — unchanged, 21:15/21:30/21:45.', fact_links: ['fact_schedule', 'fact_mist'], unlock_rules: { acquire: true } },
    { id: 'ev_badge_log', type: 'digital', location_id: 'loc_dvr', title: 'Staff Badge Log', description: 'Delia Marsh\'s badge: service corridor 21:26:42 in, 21:29:30 out. Her office badge, 21:32:04. The kitchen badge, 21:24:33.', fact_links: ['fact_corridor'], unlock_rules: { acquire: true } },
    { id: 'ev_dvr_gap', type: 'digital', location_id: 'loc_dvr', title: 'The DVR Gap', description: 'The corridor cam records 21:26:40–21:27:01, then stops. Resumes 21:30:13. DVR maintenance log: no scheduled event. The erase was manual, from the security console.', fact_links: ['fact_gio_knew'], unlock_rules: { inspect: 'forensics' } },
    { id: 'ev_crate', type: 'physical', location_id: 'loc_storage', title: 'The Packing Crate', description: 'Import-stamped crate, "exhibit transfer Victoria Regia". Inside the false bottom: receipts — four sales of Dendrophylax lindenii (ghost orchid) to a private dealer, coded "LEO-CARE".', fact_links: ['fact_motive'], unlock_rules: { inspect: 'search' } },
    { id: 'ev_panel_print', type: 'physical', location_id: 'loc_climate', title: 'Print in the Panel Dust', description: 'A fresh fingerprint on the rain-machine override panel, size small. Delia\'s gloves are size small. Nobody else used the room after 21:20.', fact_links: ['fact_mist', 'fact_corridor'], unlock_rules: { inspect: 'forensics' } },
    { id: 'ev_trust_papers', type: 'document', location_id: 'loc_office', title: 'The Unsigned Trust Papers', description: 'Wren\'s new trust agreement, drafted this week, demanding signature "tonight". Unsigned. Oscar\'s briefcase, handed to police by his assistant.', fact_links: ['fact_wren_trust'], unlock_rules: { acquire: true } },
    { id: 'ev_seal', type: 'physical', location_id: 'loc_kitchen', title: 'The Broken Cooler Seal', description: 'The 1947 vintage cooler seal is snapped. The bottle is missing. Ramsey\'s excuse is waiting for him before he can give it.', fact_links: ['fact_ramsey_champagne'], unlock_rules: {} },
    { id: 'ev_valet_photo', type: 'physical', location_id: 'loc_main', title: 'Wren\'s Pocket Photo', description: 'A creased photo in Wren\'s clutch: Wren with a young man in a valet\'s vest, both laughing. Danny, the valet. She has not told anyone about him.', fact_links: ['fact_wren_trust'], unlock_rules: {} },
  ],

  lies: [
    { id: 'lie_delia_office', character_id: 'char_delia', fact_id: 'fact_corridor', cover_story: 'I was in the Orchid House the whole time between the keynote and the discovery — I never left the gala floor. The badge log is a mistake; my badge was on the table in my office.', triggers: ['ev_badge_log', 'ev_dumbwaiter'], break_conditions: { revealed: 'badge_log' } },
    { id: 'lie_gio_post', character_id: 'char_gio', fact_id: 'fact_gio_knew', cover_story: 'I was on continuous perimeter sweeps from 21:00 until the alarm. I did not touch the DVR. The gap is a camera fault — the unit has had issues.', triggers: ['ev_dvr_gap'], break_conditions: { revealed: 'dvr_gap' } },
    { id: 'lie_ramsey_why', character_id: 'char_ramsey', fact_id: 'fact_schedule', cover_story: 'I moved the keynote because of the storm forecast — pure logistics, nothing to do with me.', triggers: ['ev_runsheet', 'ev_seal'], break_conditions: { revealed: 'seal' } },
    { id: 'lie_wren_papers', character_id: 'char_wren', fact_id: 'fact_wren_trust', cover_story: 'The trust papers? He and I talked about them last week. I never saw them tonight. We were fine.', triggers: ['ev_trust_papers', 'ev_valet_photo'], break_conditions: { revealed: 'papers' } },
  ],

  relationships: [
    { source: 'char_delia', target: 'char_oscar', type: 'patron', strength: 0.6 },
    { source: 'char_wren', target: 'char_oscar', type: 'family', strength: 0.7 },
    { source: 'char_gio', target: 'char_oscar', type: 'employer', strength: 0.8 },
    { source: 'char_ramsey', target: 'char_oscar', type: 'debtor', strength: 0.3 },
    { source: 'char_gio', target: 'char_delia', type: 'blackmailer', strength: 0.4 },
    { source: 'char_delia', target: 'char_ramsey', type: 'colleague', strength: 0.6 },
  ],

  red_herrings: [
    { suspicious_thing: 'Ramsey changed the schedule, was being sued into bankruptcy by Oscar, and the KEYNOTE landed exactly 30 minutes early — an obvious murder setup.', truth: 'The schedule change was about the storm and his son\'s play, plus a stolen bottle of 1947 champagne. The early keynote accidentally put the toast inside the mist cycle — Delia simply used the accident.', explanation: 'Ramsey\'s crime is theft and cowardice, not murder. The seal and the run sheet explain the change with receipts.' },
    { suspicious_thing: 'Wren inherits $200M and Oscar\'s briefcase holds unsigned trust papers demanding she sign TONIGHT — the classic greedy-heir setup.', truth: 'Wren was going to refuse the trust and tell her father she was pregnant and engaged to the valet. The papers stayed unsigned because she chose honesty, not murder.', explanation: 'The photo of Danny and the creased love in her clutch tell the real story: she was about to lose everything he could give, not gain it.' },
    { suspicious_thing: 'Gio erased exactly the minutes of the murder from the corridor cam — a security chief destroying evidence of his own crime?', truth: 'Gio erased footage of HIMSELF absent from his post — in the garden wing with the valet\'s girlfriend. His cover-up accidentally erased the killer\'s exit route too.', explanation: 'When the DVR gap is pressed, Gio confesses the tryst — and reveals what the missing minutes would have shown: Delia leaving the corridor at 21:29.' },
  ],

  clue_map: [
    { clue: 'The shattered flute has no cyanide; the engraved flute is missing', unlocks: 'Oscar\'s drinking glass was swapped — the killer carried the poison in, the flute out', note: 'Object clue: two glasses, one story.' },
    { clue: 'The run sheet moved the keynote 30 minutes early', unlocks: 'The toast fell inside the 21:30 mist cycle — timing was manipulated or exploited', note: 'Schedule clue.' },
    { clue: 'Badge log: Delia in the corridor 21:26–21:29', unlocks: 'Delia\'s "never left the floor" alibi breaks — she was in the staff-only corridor in the murder window', note: 'Access clue.' },
    { clue: 'The DVR gap is exactly 21:27:01–21:30:13', unlocks: 'Gio erased his own absence — and reveals Delia\'s exit was on the tape', note: 'Cover-up clue.' },
    { clue: 'The packing crate\'s false bottom: ghost-orchid sales, LEO-CARE', unlocks: 'Delia\'s motive — black-market sales funding her brother\'s care', note: 'Money clue.' },
    { clue: 'The cracked flute in the dumbwaiter carries cyanide', unlocks: 'The method and the killer\'s route: kitchen → climate → corridor → Orchid House → dumbwaiter', note: 'Physical proof.' },
  ],

  hints: {
    easy: [
      'Two flutes, one body: the glass shattered at Oscar\'s hand is clean 1947 vintage. The engraved founder\'s flute — the one he toasted with — is missing. Find where a rinsed, cracked flute could hide in the back of the house.',
      'The keynote was moved 30 minutes EARLY. Ask Ramsey why — the storm story is only half true. Then check what happens in the Orchid House at 21:30 every day.',
      'The staff badge log tells the truth about who left the gala floor: one badge entered the service corridor at 21:26 and left at 21:31. Whose badge? Then ask why the corridor camera happens to be missing exactly those minutes, and whose job the DVR was.',
    ],
    standard: [
      'The murder happened under cover of the 21:30 rain-machine mist — and the schedule change put the toast inside that window. Who could move the keynote, and who controls the climate panel?',
      'Follow the glass: the poison flute left the scene the same way staff do. A badge log, a dumbwaiter, and a washed-out residue tell the whole route.',
      'Motive is in the false bottom of a packing crate. Receipts, four sales, one code: LEO-CARE. Find out who Leo is — and who emptied the collection to save him.',
    ],
    hard: [
      'The building is the alibi, the alibi-breaker, and the getaway. Read the mist, the schedule, and the badge log as one document.',
      'Two cover-ups are running at once. One is about a job, one is about a life. The one about a job leaves a 3:12 hole in the tape — and the truth behind it.',
    ],
  },

  solution: {
    killer: 'Delia Marsh',
    motive: 'Oscar found the ghost-orchid sales receipts in the storage crate during the 20:30 tour and confronted her — she had been funding her brother\'s ALS care by bleeding the collection dry. Exposure meant prison and losing everything. He gave her ninety minutes. She used them.',
    method: 'She took the founder\'s flute from the kitchen tray into the climate room, swapped the 1947 vintage for a cyanide-laced pour, armed an out-of-cycle mist, and handed Oscar the flute through the fog at 21:32. He drank, praised the vintage, and was gone in four minutes. She walked out through the service corridor, badge logged, and sent the flute down the dumbwaiter — cracked, rinsed, and still carrying the residue that would name her.',
    narrative: 'Every element of the night was the killer\'s instrument: the rain machine she had maintained for a decade (sound and sightlines died at 21:30), the schedule change she did not cause but exploited (the keynote fell inside the mist), the camera whose 3:12 gap was a second man\'s cover-up covering her exit, and the storage crate she had meant to empty before the gala — left one hour too long with receipts inside. The badge log, the dumbwaiter, the panel print, and the crack in the flute were the four corners of her alibi\'s collapse. Gio\'s erased minutes became the hinge: when the security chief\'s small lie broke, the killer\'s big one broke with it.',
  },

  killer_pov: [
    {
      id: 'kpov_mist',
      unlock_evidence_id: 'ev_badge_log',
      chapter_title: 'The Mist Knows',
      text: 'She armed the override with the same hand that had fed the orchids for a decade. In ninety seconds the glass walls would fog to white, and the room — her room, the one place she had ever been truly good — would become a confessional with no witness but the plants. She had practiced the toast in her office mirror at noon. "To the children\'s wing." He would smile. He always smiled when he was about to get what he wanted. She let the tray wait behind the velvet rope, the flute cold and patient, and thought of Leo\'s laugh, which cost one hundred and forty thousand dollars a year to keep alive. Tonight it cost a man. Tomorrow, she told herself, it would cost no one else. The mist came down like mercy. She walked into it.',
    },
    {
      id: 'kpov_crate',
      unlock_evidence_id: 'ev_crate',
      chapter_title: 'What the Crate Knew',
      text: 'The receipts had been in the false bottom since March. She had meant to burn them after every transfer, but burning felt like paperwork, and the crate was heavy, and the gala needed six hundred centerpieces. So they sat — four sales, one code, a ghost orchid\'s price written in her own hand — and Oscar, who never missed a line item, found them while she was talking about the moss bed\'s pH. He closed the crate gently. Gently, the way he did everything that was about to hurt. "After the toast," he said, "we discuss the collection." She had ninety minutes to choose between her brother and her life. The orchids, she thought, watching them sway, would understand. They had survived worse than love.',
    },
  ],

  opening_scene: [
    'The glasshouse held its breath.',
    'Six million dollars of philanthropy, four hundred guests, and one priceless orchid collection — all under a roof of glass panes that steamed gently in the November air. The Meridian Conservatory\'s gala was the night the city\'s rich came out to feel poor.',
    'At the center of it all, Oscar Fielding raised his engraved flute — the founder\'s flute, the one with his name on it — and the room fell quiet to hear a billionaire promise a children\'s wing.',
    '"To the children\'s wing," he said, and drank.',
    'Four minutes later he was dead on the moss bed, a second shattered flute at his hand, the smell of bitter almonds hanging in the mist. The rain machine had just finished its 21:30 cycle. Nobody had mentioned the rain machine.',
    'And somewhere in the service corridor, a badge had logged in at 21:26 — and logged out at 21:31 — belonging to a woman who swore she never left the party.',
    'The glass remembers everything. It just doesn\'t tell.',
  ],
};

module.exports = { id: 'case-101', manifest };
