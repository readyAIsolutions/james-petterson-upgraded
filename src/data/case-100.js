'use strict';
/**
 * CASE 100 — "The Last Broadcast"
 * An original thriller case: KXRV's king of late-night radio, Ray Mercer,
 * dies at the board during his 20th anniversary broadcast — while his voice
 * keeps talking to a million listeners. Audio, timing, and the 45-second
 * delay buffer hide the true moment of death.
 *
 * KILLER: June Albright, the station manager. Ray found $93,000 missing from
 * the charity radiothon account — money she moved into a shell company to
 * save her son's failing business. He gave her the weekend. She did not wait.
 */
const manifest = {
  title: 'The Last Broadcast',
  premise: 'A beloved late-night radio host dies at his own anniversary show — but his voice stays on the air for three minutes after he is gone. The broadcast itself is the crime scene, and the timecode is the confession.',
  description: 'Ray Mercer, the voice of a million sleepless nights, is found dead at the board in Studio A of KXRV — headphones on, coffee cold, the red ON-AIR light still burning. His twentieth anniversary broadcast played right through his final moment, and the last words on the tape are his own, recorded hours earlier. Someone knew exactly how the station works — well enough to make the dead keep talking.',
  epigraph: 'The dead talk all the time. You just have to know which tape to play.',
  difficulty: 'medium',
  settings: {
    crime_location: 'loc_studioa',
    weapon_location: 'loc_kitchen',
    multi_culprit: false,
    narration_style: 'thriller_procedural',
  },
  culprit_id: 'char_june',

  locations: [
    { id: 'loc_studioa', name: 'Studio A — The Mercer Booth', description: 'Dead air smells like old vinyl and burnt coffee. The big board sits dark. A cold diner cup, cream no sugar, waits on the guest ledge.' },
    { id: 'loc_booth', name: 'Control Booth', description: 'Glass on three sides. The board-op desk faces Studio A — or what you can see of it through the one-way glass when the lights are low.' },
    { id: 'loc_boothb', name: 'Promo Booth B', description: 'A closet with a microphone, used for pre-recording spots and sweepers. The KVM session log remembers everything.' },
    { id: 'loc_master', name: 'Master Control & Tape Library', description: 'The archive. Every broadcast since 1987 sits on labeled reels and drives. The delay buffer lives here in a rack of blinking amber lights.' },
    { id: 'loc_breakroom', name: 'The Break Room', description: 'A soda machine, a burned couch, and a wall of framed air-checks. Someone has been crying here recently.' },
    { id: 'loc_kitchen', name: 'Station Kitchen', description: 'One sink, one microwave, a coffee maker that has seen better decades. The drain trap is where small truths go to hide.' },
    { id: 'loc_offices', name: 'Business Office', description: 'June Albright sits at the corner desk, the window to the parking lot at her back. The charity radiothon binder is the thickest thing on the shelf.' },
    { id: 'loc_hallway', name: 'East Hallway', description: 'The anniversary committee redecorated. The camera that used to watch the studio door now watches a sheet cake with Ray\'s face on it.' },
  ],

  characters: [
    {
      id: 'char_ray', name: 'Ray Mercer', role: 'victim', is_culprit: false, motive: null,
      traits: { magnetic: true, ruthless: true, insomniac: true },
      public_profile: 'The deceased broadcaster. Twenty years as KXRV\'s overnight king. A voice the whole city sleeps to.',
    },
    {
      id: 'char_june', name: 'June Albright', role: 'suspect', is_culprit: true,
      motive: 'Ray uncovered that June moved $93,000 of charity radiothon money into a shell company to save her son\'s business — and planned to expose her Monday.',
      traits: { methodical: true, patient: true, protective_of_family: true },
      public_profile: 'Station manager for 14 years. Ray\'s boss, his oldest friend, and the woman who knew every password in the building.',
      voice: {
        style: 'Measured, corporate, precise. Speaks in full sentences that sound pre-written. Calls Ray "Raymond" even now, and corrects anyone who cuts her off.',
        tics: 'Folds her hands on the desk before answering; resets her glasses; says "to be perfectly clear" when she is about to lie.',
        vocabulary: 'Business jargon: "operational", "liability", "the optics". Never swears. Never raises her voice.',
      },
      backstory: 'Fifteen years ago her son Sutton\'s contracting company collapsed under a fraud judgment. June has spent a decade quietly feeding it money. Ray found the trail in the radiothon books last Tuesday.',
      secret: { what: 'She embezzled the charity money and killed Ray to stop him exposing her.', why: 'Her son would lose everything — prison, his family. She chose him over Ray.' },
      triggers: { hot_button: ['son', 'Sutton', 'radiothon', 'charity', 'Monday'] },
      interview: {
        opening: 'Cool, cooperative, slightly condescending — she is the boss, you are a visitor.',
        accused: 'Goes very still. Answers in even tones. Volcanic underneath; not a hair moves.',
        evidence_shown: 'Studies the item like a balance sheet. Silent for a long count. Then a decision is made behind her eyes.',
      },
    },
    {
      id: 'char_evie', name: 'Evie Corral', role: 'suspect', is_culprit: false,
      motive: 'Ray ended their secret affair an hour before he died — and told her "we\'ll talk after the show". Heartbreak is a motive, the police say. She knows it.',
      traits: { loyal: true, devastated: true, naive: true },
      public_profile: 'The producer of The Midnight Hour. Twenty-nine, two years in the chair, the fastest ears in the building.',
      voice: {
        style: 'Soft, fast, apologetic. Runs sentences together when nervous. Laughs at the wrong moments, then looks ashamed.',
        tics: 'Twists her hair; checks her phone compulsively; says "oh god" and "honestly?" constantly.',
        vocabulary: 'Radio slang mixed with self-doubt: "backtiming", "the board", "I probably shouldn\'t say", "it\'s my fault".',
      },
      backstory: 'Two years ago Ray picked her out of the tape library and made her his producer — and his secret. She believed him when he said he\'d leave his wife. Tonight he told her he wouldn\'t.',
      secret: { what: 'She was Ray\'s girlfriend and he broke it off hours before he died. She crushed her anxiety medication in the break room and lied about it.', why: 'Shame and grief — she is terrified everyone will think she killed him over it.' },
      triggers: { hot_button: ['affair', 'girlfriend', 'wife', 'medication', 'sleeping'] },
      interview: {
        opening: 'Grief-stricken, apologetic, eager to help — desperate for you to believe her.',
        accused: 'Cracks immediately. Cry-adjacent. Tells half-truths to protect her dignity.',
        evidence_shown: 'Looks at it like it might bite. Volunteers more than she should when you show kindness.',
      },
    },
    {
      id: 'char_dante', name: 'Dante Silva', role: 'suspect', is_culprit: false,
      motive: 'Ray kept a folder on Dante skimming station equipment to pay gambling debts — and was giving him one week to repay it or be exposed.',
      traits: { nervous: true, technical: true, cornered: true },
      public_profile: 'The board operator. Thirty-four years old, twelve in the booth. He was on the other side of the glass the whole night — or so he says.',
      voice: {
        style: 'Feverish, fast, technical. Jargon is his armor; the more scared he is, the more he sounds like an owner\'s manual.',
        tics: 'Wipes his palms on his jeans; starts sentences with "okay so look"; never quite answers the question asked.',
        vocabulary: 'Signal chains, buffers, "the 45", faders, "backtiming". Avoids every word that begins with murd.',
      },
      backstory: 'His mother\'s care home bills and a bad year at the track turned a good engineer into a struggling one. Ray paid his largest debt quietly — and kept the receipt. The folder is in the business office.',
      secret: { what: 'He was skimming station gear; Ray had the proof and was giving him one week.', why: 'Fear — exposure means losing the booth, the only job he has ever been good at.' },
      triggers: { hot_button: ['gambling', 'debt', 'skimming', 'equipment', 'folder', 'mother'] },
      interview: {
        opening: 'Wordy, defensive, tries to be helpful by drowning you in technical detail.',
        accused: 'Immediately starts over-explaining. Sweats. Buries the real answer under three jargon layers.',
        evidence_shown: 'Stares at it. Does the math out loud. His eyes go somewhere else while he recalibrates his story.',
      },
    },
    {
      id: 'char_cole', name: 'Cole Wexler', role: 'suspect', is_culprit: false,
      motive: 'Ray leaked the "caller scandal" that sank Cole\'s syndication deal. Cole was in the building an hour before the murder, and he was heard threatening Ray at the studio door.',
      traits: { proud: true, petty: true, dangerous_in_words_only: true },
      public_profile: 'The Crypt, KXRV\'s weekend overnight host — and Ray\'s public rival. Forty-one, all teeth, a face built for a billboard.',
      voice: {
        style: 'Loud, theatrical, cagey. Treats every conversation like an interview he is winning. Smiles when he is most uncomfortable.',
        tics: 'Calls you "boss"; checks his reflection in anything dark; does a big fake laugh that dies fast.',
        vocabulary: 'Radio promotions patter: "three-oh ratings", "the bit", "syndication". Vintage car talk when he relaxes.',
      },
      backstory: 'Six months ago the "Mercer Mole" leaked that Cole\'s famous callers were paid actors. The deal for his own syndicated show died in a week. He blames Ray, and he is certain of it.',
      secret: { what: 'He was in the building to steal Ray\'s caller black book for revenge — and he actually saw June enter Studio A at 00:18. He is keeping it to himself out of pure spite.', why: 'Why would he help the man who ruined him? Let the police figure it out.' },
      triggers: { hot_button: ['syndication', 'callers', 'actors', 'scandal', 'leak'] },
      interview: {
        opening: 'Charming, loud, useless. Tells you three stories that go nowhere.',
        accused: 'Indignant, theatrical, secretly enjoying the attention.',
        evidence_shown: 'Goes quiet for the first time. Weighs whether the truth finally costs him less than the spite.',
      },
    },
  ],

  // NO ONE except June knows the full truth. Knowledge slices are strict.
  facts: [
    // --- critical chain (must all be discoverable from evidence) ---
    { id: 'fact_motive', value: 'June moved $93,000 from the radiothon charity account into a shell company for her son; Ray found out and meant to expose her on Monday.', category: 'critical', visibility: 'secret' },
    { id: 'fact_poison', value: 'June Albright killed Ray Mercer with chloral hydrate in his coffee.', category: 'conclusion', visibility: 'secret' },
    { id: 'fact_method', value: 'Chloral hydrate was slipped into Ray\'s coffee; he collapsed at the board around 00:16.', category: 'conclusion', visibility: 'secret' },
    { id: 'fact_time', value: 'Ray\'s true time of death was around 00:16 — masked by the 45-second delay buffer and the looping pre-recorded sign-off.', category: 'critical', visibility: 'secret' },
    { id: 'fact_delay', value: 'The show broadcasts through a 45-second rolling delay; the master log shows the buffer looping the pre-recorded sign-off between 00:22 and 00:26, keeping Ray "on air" after death.', category: 'critical', visibility: 'secret' },
    { id: 'fact_june_access', value: 'June\'s keycard opened Studio A at 00:18 and her phone joined the studio Wi-Fi at 00:18–00:19 — while she claims to have been in the business office until 00:40.', category: 'critical', visibility: 'secret' },
    { id: 'fact_cole_witness', value: 'Cole Wexler saw June enter Studio A at 00:18 from the east hallway and is withholding it out of spite.', category: 'critical', visibility: 'secret' },
    { id: 'fact_diner_cup', value: 'The diner cup was washed in the station kitchen; chloral residue was found in the drain trap.', category: 'forensic', visibility: 'secret' },
    // --- supporting / discoverable ---
    { id: 'fact_loop_line', value: 'The final broadcast plays Ray\'s line "a song for the night owls — you know who you are" twice: the pre-recorded continuity segment looped when the buffer starved.', category: 'forensic', visibility: 'secret' },
    { id: 'fact_evie_affair', value: 'Evie was Ray\'s secret girlfriend; he ended it at 23:47, an hour before he died, and wrote her a goodbye note.', category: 'relationship', visibility: 'secret' },
    { id: 'fact_evie_meds', value: 'Evie\'s anxiety medication was crushed in the break-room trash; she says she spilled it — she is lying about the anger, not the murder.', category: 'motive_support', visibility: 'secret' },
    { id: 'fact_cole_feud', value: 'Ray leaked the paid-caller scandal that killed Cole\'s syndication deal; Cole was on site to record a promo and confront Ray.', category: 'motive_support', visibility: 'secret' },
    { id: 'fact_cole_exit', value: 'Cole\'s keycard logs his exit at 00:16 — not midnight as he claims — and the promo-booth KVM session ended at 00:14.', category: 'alibi', visibility: 'secret' },
    { id: 'fact_dante_folder', value: 'Ray kept a folder on Dante\'s equipment skimming, with a one-week deadline to repay.', category: 'motive_support', visibility: 'secret' },
    { id: 'fact_dante_glass', value: 'Dante claims he watched Ray drinking coffee at 00:30 through the booth glass — impossible: the glass is one-way at night and he was watching the buffer loop.', category: 'alibi', visibility: 'secret' },
  ],

  knowledge: [
    // June — knows everything, discloses almost nothing
    { character_id: 'char_june', fact_id: 'fact_poison', certainty: 1.0, source: 'action', can_disclose: 0 },
    { character_id: 'char_june', fact_id: 'fact_motive', certainty: 1.0, source: 'personal', can_disclose: 0 },
    { character_id: 'char_june', fact_id: 'fact_method', certainty: 1.0, source: 'action', can_disclose: 0 },
    { character_id: 'char_june', fact_id: 'fact_delay', certainty: 1.0, source: 'action', can_disclose: 0 },
    { character_id: 'char_june', fact_id: 'fact_diner_cup', certainty: 1.0, source: 'action', can_disclose: 0 },
    { character_id: 'char_june', fact_id: 'fact_cole_exit', certainty: 0.3, source: 'assumption', can_disclose: 1 },
    // Evie — affair, the break-up, her own meds; knows nothing of the murder
    { character_id: 'char_evie', fact_id: 'fact_evie_affair', certainty: 1.0, source: 'personal', can_disclose: 1 },
    { character_id: 'char_evie', fact_id: 'fact_evie_meds', certainty: 1.0, source: 'personal', can_disclose: 0 },
    { character_id: 'char_evie', fact_id: 'fact_june_access', certainty: 0.1, source: 'rumor', can_disclose: 1 },
    // Dante — the delay system, his own troubles; lied about the glass
    { character_id: 'char_dante', fact_id: 'fact_delay', certainty: 1.0, source: 'professional', can_disclose: 1 },
    { character_id: 'char_dante', fact_id: 'fact_dante_folder', certainty: 0.9, source: 'personal', can_disclose: 0 },
    { character_id: 'char_dante', fact_id: 'fact_dante_glass', certainty: 1.0, source: 'personal', can_disclose: 1 },
    { character_id: 'char_dante', fact_id: 'fact_cole_exit', certainty: 0.7, source: 'observed', can_disclose: 1 },
    // Cole — the feud, and he SAW June
    { character_id: 'char_cole', fact_id: 'fact_cole_feud', certainty: 1.0, source: 'personal', can_disclose: 1 },
    { character_id: 'char_cole', fact_id: 'fact_cole_witness', certainty: 1.0, source: 'observed', can_disclose: 0 },
    { character_id: 'char_cole', fact_id: 'fact_june_access', certainty: 1.0, source: 'observed', can_disclose: 0 },
    // Ray — the victim's own knowledge (idle flavor, mostly not disclosable)
    { character_id: 'char_ray', fact_id: 'fact_motive', certainty: 1.0, source: 'investigation', can_disclose: 0 },
  ],

  events: [
    { id: 'evt_arrive', start: '23:30', end: '23:30', location_id: 'loc_studioa', title: 'Ray arrives', description: 'Ray comes in, sets up Studio A, starts the pre-show ritual: coffee on the guest ledge, headphones on, records the anniversary sign-off for later use.', actors: ['char_ray'] },
    { id: 'evt_coffee', start: '23:38', end: '23:38', location_id: 'loc_studioa', title: 'The diner coffee', description: 'June brings Ray a large coffee from the 24-hour diner on Third, cream no sugar, as a peace offering. No one else touches it.', actors: ['char_june'] },
    { id: 'evt_dante_booth', start: '23:40', end: '23:40', location_id: 'loc_booth', title: 'Dante at the board', description: 'Dante runs the sound check. The delay buffer is armed at 45 seconds for the live hour.', actors: ['char_dante'] },
    { id: 'evt_evie_in', start: '23:47', end: '23:49', location_id: 'loc_studioa', title: 'The talk that ended it', description: 'Evie arrives. Ray tells her he is staying with his wife and slips her a letter. She leaves the studio crying.', actors: ['char_evie', 'char_ray'] },
    { id: 'evt_onair', start: '23:52', end: '23:52', location_id: 'loc_studioa', title: 'On air — the anniversary show', description: 'The Midnight Hour with Ray Mercer goes live to a record listenership. Twenty years to the night.', actors: ['char_ray'], is_public: true },
    { id: 'evt_argue', start: '23:58', end: '00:00', location_id: 'loc_hallway', title: 'The argument at the door', description: 'Cole Wexler, in the building to cut a promo, corners Ray at the studio door. Words get loud. Evie hears it from the break room.', actors: ['char_cole', 'char_ray'], is_public: true },
    { id: 'evt_promo', start: '00:02', end: '00:14', location_id: 'loc_boothb', title: 'Cole records his promo', description: 'Cole storms off and cuts his weekend promo in Booth B. The KVM session is timestamped. He leaves the booth at 00:14.', actors: ['char_cole'] },
    { id: 'evt_break', start: '00:05', end: '00:10', location_id: 'loc_breakroom', title: 'Evie in the break room', description: 'Evie sits on the burned couch and crushes her anxiety medication into the trash bin. She will later say she spilled it.', actors: ['char_evie'] },
    { id: 'evt_sip', start: '00:05', end: '00:05', location_id: 'loc_studioa', title: 'The last sip', description: 'During a record, Ray drinks deep from the diner cup. The chloral hydrate is already in it. He has maybe ten minutes.', actors: ['char_ray'], causal_parent: 'evt_coffee', is_public: true },
    { id: 'evt_collapse', start: '00:16', end: '00:16', location_id: 'loc_studioa', title: 'Ray collapses', description: 'Ray slumps forward against the board, headphones still on. The mic is live, but the buffer is carrying a record.', actors: ['char_ray'], causal_parent: 'evt_sip' },
    { id: 'evt_june_returns', start: '00:18', end: '00:18', location_id: 'loc_studioa', title: 'June enters Studio A', description: 'June\'s keycard opens the studio door. She takes the diner cup, wipes the guest ledge, and leaves the way she came — east hallway, where the camera now watches a cake.', actors: ['char_june'], causal_parent: 'evt_collapse' },
    { id: 'evt_june_kitchen', start: '00:20', end: '00:20', location_id: 'loc_kitchen', title: 'The wash-up', description: 'June washes the cup in the station kitchen sink and leaves it to dry. The residue runs down the drain, into the trap.', actors: ['char_june'], causal_parent: 'evt_june_returns' },
    { id: 'evt_cole_leave', start: '00:16', end: '00:16', location_id: 'loc_hallway', title: 'Cole leaves — the sighting', description: 'Cole walks the east hallway toward the exit and sees June step out of Studio A. She does not see him. His keycard logs the exit at 00:16.', actors: ['char_cole'] },
    { id: 'evt_loop', start: '00:22', end: '00:26', location_id: 'loc_master', title: 'The buffer loops', description: 'Nobody advances the board. The delay buffer starves and loops the pre-recorded sign-off. Ray says "a song for the night owls" twice. A million listeners hear a dead man.', actors: [] },
    { id: 'evt_notice', start: '00:24', end: '00:26', location_id: 'loc_booth', title: 'Dante on the monitor', description: 'Dante hears the duplicate line through his monitor cans. He buzzes the studio. No answer. He looks through the glass and sees only his own reflection — the one-way is dark-side this hour.', actors: ['char_dante'] },
    { id: 'evt_found', start: '00:27', end: '00:29', location_id: 'loc_studioa', title: 'The discovery', description: 'The buffer dies. Eleven seconds of dead air, then Dante crashes through the studio door and finds Ray. He calls June. June calls 911 at 00:31.', actors: ['char_dante'], is_public: true },
  ],

  evidence: [
    { id: 'ev_logbook', type: 'document', location_id: 'loc_booth', title: 'The Master Air Log', description: 'The station log for the anniversary hour. Entries run to 00:21, then three minutes of "BUFFER LOOP" annotations, then "11s DEAD AIR".', fact_links: ['fact_delay', 'fact_loop_line', 'fact_time'], unlock_rules: { inspect: 'forensics' } },
    { id: 'ev_broadcast', type: 'audio', location_id: 'loc_master', title: 'The Master Tape — final broadcast', description: 'The preserved hour. On playback, Ray\'s line "a song for the night owls — you know who you are" appears twice, eleven minutes apart, word for word.', fact_links: ['fact_loop_line', 'fact_delay'], unlock_rules: { inspect: 'forensics' } },
    { id: 'ev_signoff', type: 'audio', location_id: 'loc_master', title: 'The Pre-Recorded Sign-Off', description: 'The file metadata timestamps Ray\'s anniversary sign-off at 23:58 — recorded BEFORE the show, not during it. His last words were never live.', fact_links: ['fact_delay', 'fact_loop_line'], unlock_rules: { inspect: 'forensics' } },
    { id: 'ev_draintrap', type: 'physical', location_id: 'loc_kitchen', title: 'Kitchen Drain Trap', description: 'The trap under the station sink. Lab finds chloral hydrate residue consistent with a washed-out coffee cup. A fresh cup sits in the drying rack — not Ray\'s usual mug.', fact_links: ['fact_diner_cup', 'fact_method'], unlock_rules: { inspect: 'forensics' } },
    { id: 'ev_keycard', type: 'digital', location_id: 'loc_offices', title: 'Keycard Access Log', description: 'June Albright\'s keycard opens Studio A at 00:18:03. Her stated position — business office, 23:30 to 00:40 — has no log entry between 00:17 and 00:21.', fact_links: ['fact_june_access'], unlock_rules: { acquire: true } },
    { id: 'ev_wifi', type: 'digital', location_id: 'loc_offices', title: 'Studio Wi-Fi Log', description: 'June\'s phone joined the studio-access Wi-Fi at 00:18:41 and dropped off at 00:19:02. The studio router is 40 feet from the office door.', fact_links: ['fact_june_access'], unlock_rules: { acquire: true } },
    { id: 'ev_letter', type: 'document', location_id: 'loc_breakroom', title: 'The Goodbye Letter', description: 'Ray\'s handwriting. "Evie — I meant everything, but I can\'t leave her. You\'ll find someone who deserves you. Please don\'t hate me." Dated tonight, 23:45.', fact_links: ['fact_evie_affair'], unlock_rules: { acquire: true } },
    { id: 'ev_pills', type: 'physical', location_id: 'loc_breakroom', title: 'Crushed Pills in the Trash', description: 'Two crushed tablets in the break-room bin, still in a torn blister pack — Evie\'s alprazolam prescription. She will say she spilled the bottle. The pack was deliberately crushed.', fact_links: ['fact_evie_meds', 'fact_evie_affair'], unlock_rules: {} },
    { id: 'ev_cole_keycard', type: 'digital', location_id: 'loc_master', title: 'Cole\'s Access Log', description: 'Cole Wexler\'s keycard logs entry at 23:55 and exit at 00:16 — not midnight, as he insists. Promo-booth KVM confirms his session ended 00:14. Pressed with this, Cole stops lying — and admits he saw someone step out of Studio A at 00:18.', fact_links: ['fact_cole_exit', 'fact_cole_witness'], unlock_rules: { acquire: true } },
    { id: 'ev_promo_sched', type: 'document', location_id: 'loc_boothb', title: 'The Syndication Folder', description: 'A folder of clips about the paid-caller scandal, with Ray\'s note on top: "Cole\'s deal died. My mole did that. Fair trade."', fact_links: ['fact_cole_feud'], unlock_rules: {} },
    { id: 'ev_dante_folder', type: 'document', location_id: 'loc_offices', title: 'Ray\'s Folder on Dante', description: 'Itemized skimming: three mixers, two condenser mics, a tube preamp. Ray\'s note: "One week, Dante. Then the board is gone."', fact_links: ['fact_dante_folder'], unlock_rules: {} },
    { id: 'ev_radiothon', type: 'document', location_id: 'loc_offices', title: 'Radiothon Ledger — Redacted Copy', description: 'The charity account summary shows $93,000 moved to a shell company in four transfers. The beneficiary entity traces to Sutton Albright\'s contracting firm.', fact_links: ['fact_motive'], unlock_rules: { inspect: 'forensics' } },
    { id: 'ev_booth_cam', type: 'digital', location_id: 'loc_hallway', title: 'East Hallway Camera — 00:18', description: 'The camera angle was moved for the anniversary party. It frames the cake table. The studio door is exactly outside the shot — a 14-inch blind spot.', fact_links: ['fact_june_access'], unlock_rules: { acquire: true } },
  ],

  lies: [
    { id: 'lie_june_office', character_id: 'char_june', fact_id: 'fact_june_access', cover_story: 'I stayed in the business office from 23:30 until the phone rang at 00:31. I never stepped into the studio — I have no idea how my card was used.', triggers: ['ev_keycard', 'ev_wifi'], break_conditions: { revealed: 'keycard_and_wifi' } },
    { id: 'lie_dante_glass', character_id: 'char_dante', fact_id: 'fact_dante_glass', cover_story: 'I watched Ray through the booth glass at 00:30 — he was drinking his coffee, looked fine, I swear. The one-way glass at night shows my own reflection; I saw the buffer loop, not Ray.', triggers: ['ev_broadcast', 'ev_logbook'], break_conditions: { revealed: 'master_tape' } },
    { id: 'lie_cole_midnight', character_id: 'char_cole', fact_id: 'fact_cole_exit', cover_story: 'I left at midnight. I never saw anybody after my promo. This station and I are done.', triggers: ['ev_cole_keycard'], break_conditions: { revealed: 'access_log' } },
    { id: 'lie_evie_meds', character_id: 'char_evie', fact_id: 'fact_evie_meds', cover_story: 'I spilled my pills in the break room, that\'s all. I was fine. I was not angry. I did not... I could never.', triggers: ['ev_pills'], break_conditions: { revealed: 'crushed_pills' } },
  ],

  relationships: [
    { source: 'char_june', target: 'char_ray', type: 'employer', strength: 0.9 },
    { source: 'char_evie', target: 'char_ray', type: 'lover', strength: 0.8 },
    { source: 'char_ray', target: 'char_evie', type: 'ex_lover', strength: 0.3 },
    { source: 'char_dante', target: 'char_ray', type: 'debtor', strength: 0.6 },
    { source: 'char_cole', target: 'char_ray', type: 'rival', strength: 0.2 },
    { source: 'char_june', target: 'char_dante', type: 'confidante', strength: 0.7 },
  ],

  red_herrings: [
    { suspicious_thing: 'Cole Wexler argues with Ray at the studio door at 23:58, just 18 minutes before the collapse — loud, public, overheard.', truth: 'The feud was real but Cole is all noise. His keycard proves he left at 00:16, before the murder, and the KVM log backs him to 00:14.', explanation: 'Cole\'s motive is revenge, not murder — and his real sin is silence: he saw June enter the studio at 00:18 and said nothing out of spite.' },
    { suspicious_thing: 'Evie was in the building all night, was Ray\'s secret girlfriend, and destroyed her pills in the break room at 00:05 — the exact window of the poisoning.', truth: 'Her anger was grief over the break-up, not murder. The pills were her own medication, crushed in a moment of misery; nothing in her bag or trash implicates her in the coffee.', explanation: 'The tox screen on the cup places the chloral in the DINER cup June brought — Evie never touched it. Her shattered state is a human story, not a clue.' },
  ],

  clue_map: [
    { clue: 'The master tape plays the same line twice', unlocks: 'The 45-second delay buffer was looping — Ray was dead before 00:22', note: 'Audio clue — the broadcast is the crime scene.' },
    { clue: 'The sign-off file is timestamped 23:58', unlocks: 'The final "live" words were pre-recorded; the true death window is 00:16–00:22', note: 'Metadata kills the live-broadcast alibi.' },
    { clue: 'Keycard + Wi-Fi place June in Studio A at 00:18', unlocks: 'June\'s office alibi is a construction — she was at the scene in the death window', note: 'Physical access + digital access.' },
    { clue: 'The east camera blind spot is 00:18 exactly', unlocks: 'Whoever used the studio door at 00:18 did it where the camera could not see — deliberate or lucky, it fits June\'s route', note: 'Access-route puzzle.' },
    { clue: 'Radiothon ledger traces $93k to Sutton Albright', unlocks: 'June\'s motive — the charity money and her son', note: 'Money trail.' },
    { clue: 'Cole\'s access log says 00:16 exit, not midnight', unlocks: 'Cole was still in the building at the murder; press him and he admits what he saw (June at 00:18)', note: 'The witness with a grudge.' },
  ],

  hints: {
    easy: [
      'Ray recorded his sign-off at 23:58, before the show. Listen to the master tape: the same line plays twice at the end. Dead men don\'t ad-lib — someone kept the broadcast running after Ray died. Ask the engineer what "the 45" is.',
      'Check the keycard log and the Wi-Fi log in the business office. Who has a card that opened Studio A at 00:18 — and a phone that joined the studio router at the same minute?',
      'The lobby of clues: the diner cup was washed, not thrown away, and the drain trap still holds the truth. Trace the radiothon money — $93,000, four transfers, one shell company. Whose son runs it?',
      'Cole\'s story has a hole: his keycard says 00:16, not midnight. When you push him with the access log, he stops being a suspect and becomes a witness — he SAW someone leave Studio A at 00:18.',
    ],
    standard: [
      'The broadcast kept talking after Ray died. What runs a radio show on a rolling delay — and what happens when nobody advances the board at the end of a record? Time to ask the booth about the loop.',
      'June\'s alibi is the business office, 23:30–00:40. Her keycard says otherwise: Studio A, 00:18:03. Her phone joined the studio Wi-Fi for 21 seconds. The east camera\'s blind spot covers exactly that door.',
      'Motive is in the ledger: $93,000 walked out of the charity account into a shell company. The beneficiary is Sutton Albright. Sutton is June\'s son.',
    ],
    hard: [
      'The tape is the crime scene. What does the duplicate line mean for when Ray actually died — and who controls the buffer?',
      'One suspect\'s alibi is a construction. Access logs and a 21-second Wi-Fi join are hard to argue with. So is $93,000 in four transfers.',
    ],
  },

  solution: {
    killer: 'June Albright',
    motive: 'Ray uncovered that June moved $93,000 of charity radiothon money into a shell company backing her son\'s failing firm and planned to expose her Monday. She killed him that night to keep her family intact.',
    method: 'Chloral hydrate in the diner coffee she brought him as a peace offering at 23:38. He drank deep at 00:05, collapsed at 00:16. She returned at 00:18, took the cup, washed it in the kitchen, and let the 45-second delay buffer and Ray\'s own pre-recorded sign-off carry his voice for three more minutes — dead air that sounded alive.',
    narrative: 'The anniversary show was already a lie before Ray died: June was the only person in the building who knew both the radiothon books and the delay system. Her card opened the studio door at 00:18:03; her phone joined the studio router at 00:18:41; the east camera\'s blind spot, moved for the party, framed a cake instead of the door. Cole Wexler, the one man who could have placed her there, chose spite over truth — until the access log pushed him. The cup she washed left its confession in the drain trap: chloral hydrate drinks like bad coffee and kills like a promise kept.',
  },

  killer_pov: [
    {
      id: 'kpov_buffer',
      unlock_evidence_id: 'ev_broadcast',
      chapter_title: 'The Voice That Wouldn\'t Stop',
      text: 'She stood in the dark of the tape library and listened to him die twice. Once at the board, once on the loop. The buffer was a gift she had maintained for fourteen years — she had never dreamed it could hold a man\'s voice past his last breath. On the monitor, Raymond\'s recorded line faded. "A song for the night owls." She waited for the second pass, and when it came, she nodded, once, like a woman closing a ledger. The dead, she thought, are just accounts that need to balance. Her son\'s name, at last, was safe in the assets column.',
    },
    {
      id: 'kpov_ledger',
      unlock_evidence_id: 'ev_radiothon',
      chapter_title: 'The Ledger',
      text: 'Four transfers. Ninety-three thousand. She had made them the way she made everything — quietly, correctly, before anyone thought to look. Raymond found the trail on Tuesday and gave her until Monday, because he was a kind man with a cruel job. She had thanked him for the courtesy by memorizing his coffee order. Cream, no sugar. The cup washed clean in the station sink. Somewhere a boy with her eyes would keep his house, his trucks, his ruined pride — and would never know the price his mother had paid in diner coffee and dead air.',
    },
  ],

  opening_scene: [
    'Midnight, and the city turned its ear to one voice.',
    'For twenty years, KXRV’s overnight belonged to Ray Mercer — the man who read the world to sleep, who knew the exact tone for a two a.m. confession and a Wednesday traffic jam. Tonight was the anniversary show, and the switchboard had been lit since ten.',
    'At 23:52 the ON AIR light went red, and a million insomniacs heard the familiar gravel and honey: "Night owls. You know who you are. Stay with me."',
    'At 00:31 the light was still on. So was the microphone. But Ray Mercer was already gone — slumped over his own board, headphones warm, coffee cold, a smile he had worn since 23:47 still fading from his face.',
    'The last voice on the recording was his. The station swears he never got up again. And the machine that never lies — the master tape — insists a dead man kept broadcasting for three full minutes.',
    'The crime scene is silent now. The killer is not. One of them has already started lying to you.',
  ],
};

module.exports = { id: 'case-100', manifest };
