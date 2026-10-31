'use strict';
/**
 * CASE 103 — "The Whiteout"
 * An original thriller case: a storm seals Voss Ridge Lodge, the power dies
 * for exactly six minutes, and the lodge owner is found dead by the wood
 * stove with the fire poker back in its place. The case turns on what people
 * could hear, when they could move, and which part of each story the storm
 * can verify.
 *
 * KILLER: Ford Tamlin, the lodge accountant. Corinne Voss found the shell
 * account he had used to drain the lodge payroll for fourteen months. She
 * gave him the weekend to get his story straight. He drained the generator
 * instead — and used the blackout to kill her.
 */
const manifest = {
  title: 'The Whiteout',
  premise: 'A storm that stops the world, a power cut that lasts six minutes, and a woman found dead by a fire that was kept burning to lie about the time. In the whiteout, nobody can leave — but somebody already did what they came for.',
  description: 'Voss Ridge Lodge sits at the top of the pass, forty miles from anything, and for three days a whiteout has made the world a rumor. Corinne Voss, the owner, is found at 07:40 by the great-room wood stove — the brass fire poker back on its hearth, the body still warm from a fire that was stoked at dawn. The power failed at 21:41:12 and returned at 21:47:02. Six minutes of dark. One of the five people in the lodge spent them killing her.',
  epigraph: 'The storm hides footsteps. It doesn\'t hide lies.',
  difficulty: 'medium',
  settings: {
    crime_location: 'loc_greatroom',
    weapon_location: 'loc_greatroom',
    multi_culprit: false,
    narration_style: 'thriller_procedural',
  },
  culprit_id: 'char_ford',

  locations: [
    { id: 'loc_greatroom', name: 'The Great Room', description: 'Stone fireplace, moose heads, the brass poker on its hook by the hearth. Corinne\'s body was found on the sheepskin rug, the fire banked to embers and re-stoked at dawn.' },
    { id: 'loc_annex', name: 'The Annex', description: 'The covered walkway to the wood shed and generator shed — thirty feet of wind, chain-latched at both ends. The doormat has seen things the snow hasn\'t.' },
    { id: 'loc_genshed', name: 'The Generator Shed', description: 'A diesel generator, a fuel filter, and a toolbox that has been opened recently. The filter housing is clean — too clean.' },
    { id: 'loc_mudroom', name: 'The Mudroom', description: 'Coats, boots, sled dogs kenneled just outside the door. The dogs barked at 21:44. Their owner swears he was with them.' },
    { id: 'loc_kitchen', name: 'The Kitchen', description: 'The afternoon row happened here — plates still on the counter from the firing.' },
    { id: 'loc_office', name: 'The Lodge Office', description: 'Corinne\'s desk, the payroll ledger, and a guestbook that smells of someone who had no reason to be in it.' },
    { id: 'loc_reading', name: 'The Reading Room', description: 'Next to the great room, door ajar. A rosary on the armchair, a fire that was never lit, and ears that heard everything.' },
    { id: 'loc_astrid', name: 'The Weather Room', description: 'Astrid Kamp\'s quarters: barometric instruments, storm charts, and a file folder that is not about weather.' },
    { id: 'loc_basement', name: 'The Basement Stairs', description: 'The breaker panel lives at the bottom. A coat of undisturbed dust on the steps — except for one fresh set of prints, going down and coming up, in the six minutes of dark.' },
  ],

  characters: [
    {
      id: 'char_corinne', name: 'Corinne Voss', role: 'victim', is_culprit: false, motive: null,
      traits: { blunt: true, fair: true, unafraid: true },
      public_profile: 'The deceased. Owner of Voss Ridge Lodge for twenty-three years. A woman who ran a mountain the way other people run a corner shop — hands-on, exacting, fair until she wasn\'t.',
    },
    {
      id: 'char_ford', name: 'Ford Tamlin', role: 'suspect', is_culprit: true,
      motive: 'Corinne found the shell account Ford used to drain $112,000 from the lodge payroll and confronted him at dinner: "After the storm, we go to the sheriff. You get the weekend to get your story straight." He used the weekend to get rid of the accuser instead.',
      traits: { mild: true, precise: true, invisible: true },
      public_profile: 'The lodge accountant, forty-four. Keeps the books, pays the staff, is so forgettable he has to reintroduce himself to guests twice a season.',
      voice: {
        style: 'Quiet, polite, precise — the voice of a man who has spent years making numbers add up and people overlook him. Apologizes before answering.',
        tics: 'Straightens objects while talking; gives times to the minute when he is lying and to the hour when he is telling the truth; says "I\'m just the accountant" as armor.',
        vocabulary: 'Bookkeeping: "reconcile", "ledger", "overhead", "payroll". His vocabulary for feelings is conspicuously absent.',
      },
      backstory: 'Fourteen months of careful theft — small amounts, split across vendors, routed through a shell account his late brother had registered. He told himself it was borrowing; the lodge was profitable, Corinne would never notice. She noticed the day the auditors\' letter arrived. She did the one thing he never expected: she gave him time.',
      secret: { what: 'He embezzled $112,000 from the lodge and killed Corinne during the blackout to stop her from taking him to the sheriff.', why: 'Exposure meant prison and the end of his quiet, invisible life. She gave him a weekend — he spent six minutes of it.' },
      triggers: { hot_button: ['sheriff', 'audit', 'ledger', 'shell', 'payroll', 'weekend'] },
      interview: {
        opening: 'Eager to help, small and precise, offering you coffee. The accountant who knows where everything is — except the truth.',
        accused: 'A flash of something enormous behind the glasses, then back to bookkeeper neutrality. His hands do the talking: they go very still.',
        evidence_shown: 'The ledger or the filtered generator lands. He rechecks his arithmetic like the universe might still balance.',
      },
    },
    {
      id: 'char_ben', name: 'Ben Orlov', role: 'suspect', is_culprit: false,
      motive: 'Fired that afternoon for stealing gear — snowmobile parts, a chain saw — with the whole lodge as witness. He was the last person seen with Corinne alive.',
      traits: { hotheaded: true, ashamed: true, simpler_than_he_looks: true },
      public_profile: 'The handyman, thirty-nine. Ten years at the lodge, knows every squeak in every wall, and got fired at four o\'clock for taking what he considered "back pay".',
      voice: {
        style: 'Rough, plain-spoken, chest-out. Guilt leaks through his bravado like a draft.',
        tics: 'Cracks his knuckles; calls everyone "boss"; kicks at the floor when he is lying.',
        vocabulary: 'Tools and weather: "snowpack", "chains", "the generator", "drift". His pride is in his hands, not his words.',
      },
      backstory: 'He took the parts because the lodge owed him three months of pay and personal bills don\'t wait for audits. Corinne fired him for the principle of the thing. He came back at 21:15 to return the keys, said ten ugly words to her in the kitchen, and went to the mudroom to sit with the dogs — the only creatures at the lodge that never judged him.',
      secret: { what: 'He did steal the gear, he argued with Corinne at 21:15, and he was in the mudroom during the blackout — with the dogs, who barked at the murder.', why: 'Pride and fear: the theft is small, but the timing is terrible, and he knows the sheriff will see a fired man with a grudge before he sees anything else.' },
      triggers: { hot_button: ['fired', 'snowmobile', 'chain saw', 'theft', 'key'] },
      interview: {
        opening: 'Defensive, loud, honest about the theft, touchy about everything after 21:15.',
        accused: 'Explodes, then deflates completely. "I yelled at her. I didn\'t kill her. That\'s the whole truth."',
        evidence_shown: 'The dog story and the mudroom mat are his alibi and his anchor — show him anything that puts the murder at 21:44 and he exhales like a man pardoned.',
      },
    },
    {
      id: 'char_astrid', name: 'Astrid Kamp', role: 'suspect', is_culprit: false,
      motive: 'A stranger at the lodge three days before the storm, with no luggage story that holds together and a professional interest in insurance payouts. Nobody knew what she was really doing there.',
      traits: { scientific: true, secretive: true, exact: true },
      public_profile: 'Thirty-three, a storm researcher from the university, studying the blizzard\'s barometric signature. That is the story, anyway.',
      voice: {
        style: 'Clinical, precise, amused in a way that keeps people at arm\'s length. Answers questions with data, not feelings.',
        tics: 'Checks her instruments mid-conversation; qualifies everything ("to within a second"); smiles without warmth when cornered.',
        vocabulary: 'Meteorology and forensics: "pressure gradient", "timestamp", "log", "baseline". She is allergic to imprecision.',
      },
      backstory: 'Astrid Kamp is a fraud investigator for NorthRock Mutual, and the Voss Ridge Lodge has an insurance history: a fire three years ago that paid out $1.4M for a wing that allegedly "spontaneously" burned. She came to the lodge posing as a researcher to assess a pending claim on the generator. The storm gave her cover; the murder gave her a problem: she knows exactly when the power failed, which makes her either the best witness or the worst suspect.',
      secret: { what: 'She is an insurance investigator, not a researcher, and she has the exact instrument timestamps of the failure and restart.', why: 'Her cover is blown the moment she admits why she is there; her professional ethics say she should have flagged the generator claim before anyone died.' },
      triggers: { hot_button: ['insurance', 'NorthRock', 'claim', 'fire', 'investigator', 'timestamps'] },
      interview: {
        opening: 'Cooperative, factual, slightly bored. Offers you the barometric data before you ask.',
        accused: 'Amused, then cold. "Check my file," she says — a dare that is also a confession of who she is.',
        evidence_shown: 'The file lands. She stops being a researcher and starts being the most precise witness you have.',
      },
    },
    {
      id: 'char_marian', name: 'Sister Marian', role: 'suspect', is_culprit: false,
      motive: 'A nun with no identification, no order, and no explanation for why she arrived the day before the storm — except a rosary and a flinch at the word "Voss". Nobody knew her real name, least of all the victim.',
      traits: { observant: true, calm: true, hiding_in_plain_sight: true },
      public_profile: 'Sixty-one, on retreat at the lodge, "praying out the storm". The guests assumed the order sent her; the order was never contacted.',
      voice: {
        style: 'Soft, deliberate, faintly formal. Speaks like someone used to being listened to. Pauses that make other people fill the silence — and give things away.',
        tics: 'Touches the rosary when she lies; refers to "the sisters" in the abstract; never says Corinne\'s name, only "the owner".',
        vocabulary: 'Church and kitchen language — "grace", "peace", "stew". Her vocabulary is simpler than her sentences, which is the tell.',
      },
      backstory: 'She is not Sister Marian. She is Marian Voss — Corinne\'s older sister, estranged for nineteen years, come over the pass on a bus the day before the storm to say the words she had been carrying since their mother\'s funeral. Corinne didn\'t recognize her at first. They talked in the kitchen at 18:00, two women learning each other again. Then Corinne died, and Marian chose silence over the sister who had chosen distance for nineteen years.',
      secret: { what: 'She is Corinne\'s sister, not a nun, and she was in the reading room with the door ajar when the blackout happened — she heard everything.', why: 'To tell the truth about her identity is to become a suspect; to tell what she heard is to watch the lodge collapse around the family she came home to.' },
      triggers: { hot_button: ['sister', 'Voss', 'order', 'retreat', 'family', 'rosary'] },
      interview: {
        opening: 'Serene, brief, watchful. Answers in blessings and tea offers.',
        accused: 'The serenity sharpens. "I prayed through the storm," she says. "I heard more than prayers."',
        evidence_shown: 'The photograph of two sisters, or kindness — she breaks cleanly, and what she heard comes out: the annex chain at 21:44, the walk, the thud.',
      },
    },
  ],

  facts: [
    { id: 'fact_motive', value: 'Ford drained $112,000 from the lodge payroll through a shell account; Corinne confronted him at dinner and gave him "the weekend" before going to the sheriff.', category: 'critical', visibility: 'secret' },
    { id: 'fact_poison', value: 'Ford Tamlin killed Corinne Voss with the brass fire poker.', category: 'conclusion', visibility: 'secret' },
    { id: 'fact_method', value: 'Bludgeoned with the brass fire poker in the great room during the 21:41–21:47 blackout; the poker was wiped and returned to its hook.', category: 'conclusion', visibility: 'secret' },
    { id: 'fact_generator', value: 'The generator\'s fuel filter was drained — the blackout was sabotage, done by someone who visited the generator shed at 21:00.', category: 'critical', visibility: 'secret' },
    { id: 'fact_power', value: 'Astrid\'s instruments log the power failure at 21:41:12 and restoration at 21:47:02 — a six-minute window, to the second.', category: 'forensic', visibility: 'secret' },
    { id: 'fact_marian_witness', value: 'Marian (door ajar in the reading room) heard the annex chain rattle at 21:44, footsteps crossing the hall, and a single heavy thud.', category: 'critical', visibility: 'secret' },
    { id: 'fact_boot', value: 'A blood-transfer print on the annex doormat matches a size-11 Vibram sole — Ford\'s boots. Ben wears size 9.', category: 'critical', visibility: 'secret' },
    { id: 'fact_ford_embezzle', value: 'The shell-account ledger, hidden in the guestbook in the lodge office, tracks $112,000 in fourteen months of transfers.', category: 'critical', visibility: 'secret' },
    { id: 'fact_annex_chain', value: 'The annex door chain shows a fresh scrape — the door was opened and closed during the blackout, at 21:44.', category: 'forensic', visibility: 'secret' },
    { id: 'fact_ben_gear', value: 'Ben stole snowmobile parts and a chain saw — the theft is real, small, and completely unrelated to the murder.', category: 'motive_support', visibility: 'secret' },
    { id: 'fact_astrid_id', value: 'Astrid is an insurance investigator for NorthRock Mutual, on site to review a pending generator claim — not a storm researcher.', category: 'relationship', visibility: 'secret' },
    { id: 'fact_marian_id', value: 'Sister Marian is Marian Voss — Corinne\'s estranged sister, come to reconcile after nineteen years.', category: 'relationship', visibility: 'secret' },
  ],

  knowledge: [
    { character_id: 'char_ford', fact_id: 'fact_poison', certainty: 1.0, source: 'action', can_disclose: 0 },
    { character_id: 'char_ford', fact_id: 'fact_motive', certainty: 1.0, source: 'personal', can_disclose: 0 },
    { character_id: 'char_ford', fact_id: 'fact_method', certainty: 1.0, source: 'action', can_disclose: 0 },
    { character_id: 'char_ford', fact_id: 'fact_generator', certainty: 1.0, source: 'action', can_disclose: 0 },
    { character_id: 'char_ford', fact_id: 'fact_power', certainty: 0.8, source: 'personal', can_disclose: 1 },
    { character_id: 'char_ben', fact_id: 'fact_ben_gear', certainty: 1.0, source: 'personal', can_disclose: 0 },
    { character_id: 'char_ben', fact_id: 'fact_annex_chain', certainty: 0.9, source: 'observed', can_disclose: 1 },
    { character_id: 'char_astrid', fact_id: 'fact_power', certainty: 1.0, source: 'instrument', can_disclose: 1 },
    { character_id: 'char_astrid', fact_id: 'fact_astrid_id', certainty: 1.0, source: 'personal', can_disclose: 0 },
    { character_id: 'char_astrid', fact_id: 'fact_generator', certainty: 0.6, source: 'suspicion', can_disclose: 1 },
    { character_id: 'char_marian', fact_id: 'fact_marian_witness', certainty: 1.0, source: 'observed', can_disclose: 1 },
    { character_id: 'char_marian', fact_id: 'fact_marian_id', certainty: 1.0, source: 'personal', can_disclose: 0 },
    { character_id: 'char_corinne', fact_id: 'fact_motive', certainty: 1.0, source: 'investigation', can_disclose: 0 },
  ],

  events: [
    { id: 'evt_dinner', start: '18:30', end: '19:05', location_id: 'loc_kitchen', title: 'Dinner', description: 'Stew, bread, and weather talk. Corinne serves; Ford helps with the dishes with a carefulness that looks like kindness and is already something else.', actors: ['char_corinne', 'char_ford', 'char_marian', 'char_astrid'] },
    { id: 'evt_office', start: '19:10', end: '19:15', location_id: 'loc_office', title: 'The weekend', description: 'In the office, Corinne closes the guestbook and says it plainly: "After the storm, we go to the sheriff, Ford. You get the weekend to get your story straight." She hands him the audit letter like a menu.', actors: ['char_corinne', 'char_ford'] },
    { id: 'evt_drift', start: '19:30', end: '19:30', location_id: 'loc_mudroom', title: 'The east door seals', description: 'The drift swallows the east door. From here on, the west annex is the only way in or out — forty miles of white on the other side of the chain.', actors: [], is_public: true },
    { id: 'evt_row', start: '20:10', end: '20:20', location_id: 'loc_kitchen', title: 'The firing', description: 'Corinne fires Ben for the stolen gear — loud enough that Astrid hears it from the stairs. "You come back for the keys, not the parts."', actors: ['char_corinne', 'char_ben'], is_public: true },
    { id: 'evt_shovel', start: '20:22', end: '20:30', location_id: 'loc_annex', title: 'The west path', description: 'Ben shovels the annex path while the row is still echoing — the last maintenance the lodge will get tonight. His boot prints, size 9, fill with snow.', actors: ['char_ben'] },
    { id: 'evt_keys', start: '21:15', end: '21:15', location_id: 'loc_kitchen', title: 'The keys', description: 'Ben returns to hand Corinne the lodge keys, says ten ugly words through the back door, and walks to the mudroom to sit with the dogs. Corinne is alive, annoyed, and alone in the kitchen. This is the last time anyone admits to seeing her.', actors: ['char_ben', 'char_corinne'] },
    { id: 'evt_genshed', start: '21:00', end: '21:05', location_id: 'loc_genshed', title: 'The helpful accountant', description: 'Ford volunteers to "check the wiring with Ben\'s toolbox" before the storm peaks. In the shed he drains the generator\'s fuel filter and wipes the housing clean — a blackout with a hair-trigger, waiting for the wind.', actors: ['char_ford'] },
    { id: 'evt_marian_read', start: '21:30', end: '22:00', location_id: 'loc_reading', title: 'The reading room', description: 'Marian settles in the reading room with the door ajar "for the light" — the great room fire glows through the gap. She is praying the rosary when the lights die.', actors: ['char_marian'] },
    { id: 'evt_power_fail', start: '21:41', end: '21:41', location_id: null, title: 'The blackout', description: 'At 21:41:12, per Astrid\'s instruments, the lodge goes dark. The wind owns the mountain for six minutes.', actors: [], is_public: true },
    { id: 'evt_ford_breaker', start: '21:42', end: '21:43', location_id: 'loc_basement', title: 'The breaker trip', description: '"I\'ll check the breaker," Ford says, and goes down the basement stairs — the dust shows one set of prints down, one set up. He is gone ninety seconds. The blast of cold air from the annex door comes after.', actors: ['char_ford'] },
    { id: 'evt_murder', start: '21:44', end: '21:44', location_id: 'loc_greatroom', title: 'The thud', description: 'In the dark, by the failing embers of the great-room fire, Ford takes the brass poker from its hook. One blow. The dogs bark twice, then the wind eats the sound. Marian, in the reading room, hears the annex chain rattle, footsteps, and a single heavy thud at 21:44.', actors: ['char_ford', 'char_corinne'], causal_parent: 'evt_power_fail' },
    { id: 'evt_annex', start: '21:45', end: '21:45', location_id: 'loc_annex', title: 'The annex step', description: 'Ford steps into the annex for thirty seconds, scraping his boots on the mat — the blood transfer leaves its print — and comes back inside shivering, exactly the way a man checking the storm would.', actors: ['char_ford'], causal_parent: 'evt_murder' },
    { id: 'evt_hearth', start: '21:46', end: '21:46', location_id: 'loc_greatroom', title: 'The poker returns', description: 'Ford wipes the poker with his sleeve, returns it to the hook, and arranges the body by the stove — the fire will keep her warm, the way a lie keeps a story warm.', actors: ['char_ford'], causal_parent: 'evt_murder' },
    { id: 'evt_ben_dogs', start: '21:40', end: '22:10', location_id: 'loc_mudroom', title: 'The dogs', description: 'Ben sits with the huskies through the outage. They bark at 21:44 — a sharp two-bark alarm, then nothing. He holds them until the lights come back.', actors: ['char_ben'] },
    { id: 'evt_power_on', start: '21:47', end: '21:47', location_id: null, title: 'The lights return', description: 'At 21:47:02 the generator catches and the great room floods with light. Ford is standing in the main hall, coming up from the basement, offering everyone tea. Nobody slept well.', actors: [], is_public: true },
    { id: 'evt_found', start: '07:40', end: '07:45', location_id: 'loc_greatroom', title: 'The morning', description: 'Astrid, up early to check her instruments, finds Corinne by the stove — the fire stoked at dawn, the body warm, the poker on its hook. The storm outside has not noticed anything wrong.', actors: ['char_astrid'], is_public: true },
  ],

  evidence: [
    { id: 'ev_poker', type: 'physical', location_id: 'loc_greatroom', title: 'The Brass Fire Poker', description: 'Back on its hook, wiped — but the joint carries a fleck of dark trace the lab will match to Corinne\'s blood, and the brass shows fresh scratches where it was struck against the hearthstone.', fact_links: ['fact_method'], unlock_rules: { inspect: 'forensics' } },
    { id: 'ev_genfilter', type: 'physical', location_id: 'loc_genshed', title: 'The Drained Fuel Filter', description: 'The generator\'s fuel filter is empty and wiped clean — a hand-tooled sabotage. Diesel engines do not drain their own filters in a storm. Someone visited the shed at 21:00 with Ben\'s toolbox open on the bench.', fact_links: ['fact_generator', 'fact_method'], unlock_rules: { inspect: 'search' } },
    { id: 'ev_baro', type: 'digital', location_id: 'loc_astrid', title: 'The Instrument Log', description: 'Astrid\'s barometric logger, timestamped to the second: power failure 21:41:12, restoration 21:47:02. Six minutes of dark, exactly — no more, no less.', fact_links: ['fact_power'], unlock_rules: { acquire: true } },
    { id: 'ev_ledger2', type: 'document', location_id: 'loc_office', title: 'The Shell-Account Ledger', description: 'Tucked inside the guestbook in the lodge office: fourteen months of transfers, $112,000, routed through a shell company registered to a "T. Ford". Ford\'s own handwriting on the reconciliation column.', fact_links: ['fact_ford_embezzle', 'fact_motive'], unlock_rules: { inspect: 'search' } },
    { id: 'ev_annexmat', type: 'physical', location_id: 'loc_annex', title: 'The Annex Doormat', description: 'A blood-transfer print on the mat: a size-11 Vibram sole, the pattern fresh in the dried transfer. The print was made by a boot that stepped in blood and then onto the mat — going OUT, not in.', fact_links: ['fact_boot'], unlock_rules: { inspect: 'forensics' } },
    { id: 'ev_boots', type: 'physical', location_id: 'loc_mudroom', title: 'The Mudroom Boots', description: 'Four pairs in the rack: Ben\'s size-9 work boots, caked in snow; Ford\'s size-11 walking boots, wiped clean — too clean for a man who "never left the lodge tonight", matching the Vibram pattern on the mat.', fact_links: ['fact_boot'], unlock_rules: { acquire: true } },
    { id: 'ev_chainannex', type: 'physical', location_id: 'loc_annex', title: 'The Annex Chain', description: 'The chain latch on the annex door carries a fresh scrape through the rust — opened and closed tonight, during the blackout, long after the last shovel pass.', fact_links: ['fact_annex_chain'], unlock_rules: { inspect: 'forensics' } },
    { id: 'ev_gear', type: 'document', location_id: 'loc_mudroom', title: 'Ben\'s Parts List', description: 'A scrawled list in the mudroom drawer: snowmobile carburetor, chain saw bar, two pulleys. The stolen gear — real, logged, and worth three hundred dollars, not three hundred thousand.', fact_links: ['fact_ben_gear'], unlock_rules: { acquire: true } },
    { id: 'ev_file', type: 'document', location_id: 'loc_astrid', title: 'The NorthRock File', description: 'In Astrid\'s room, under the storm charts: a file folder stamped NORTHROCK MUTUAL — CLAIM ADJUSTMENT, with the lodge\'s policy number and a note: "assess generator claim, origin of 3-year fire doubtful".', fact_links: ['fact_astrid_id'], unlock_rules: { inspect: 'search' } },
    { id: 'ev_photo', type: 'physical', location_id: 'loc_reading', title: 'The Photograph', description: 'In Marian\'s Bible: a creased photo of two girls on a porch, one in braids, one with a fishing rod. On the back, in a much younger hand: "Marian & Corinne, Voss Ridge, 1978."', fact_links: ['fact_marian_id'], unlock_rules: { inspect: 'search' } },
    { id: 'ev_marian_statement', type: 'testimony', location_id: 'loc_reading', title: 'What Marian Heard', description: 'Once her identity is broken open, Sister Marian gives a deposition in plain language: at 21:44, in the dark, she heard the annex chain rattle, a man\'s footsteps cross the hall, and a single heavy thud. Then the wind. Then, at 21:47, the lights — and Ford standing in the main hall, offering tea.', fact_links: ['fact_marian_witness', 'fact_annex_chain'], unlock_rules: { acquire: true } },
  ],

  lies: [
    { id: 'lie_ford_breaker', character_id: 'char_ford', fact_id: 'fact_marian_witness', cover_story: 'I went straight down to the breaker panel when the lights died, spent maybe two minutes in the basement, and came back up. I never left the main hall — the annex door was closed all night, I can vouch for it, I checked.', triggers: ['ev_annexmat', 'ev_marian_statement', 'ev_chainannex'], break_conditions: { revealed: 'annex_mat' } },
    { id: 'lie_ben_innocent', character_id: 'char_ben', fact_id: 'fact_ben_gear', cover_story: 'I never took a thing from this lodge. Corinne fired me over nothing — she counted a chain saw wrong and blamed me.', triggers: ['ev_gear'], break_conditions: { revealed: 'parts_list' } },
    { id: 'lie_astrid_researcher', character_id: 'char_astrid', fact_id: 'fact_astrid_id', cover_story: 'I\'m a storm researcher from the university. That\'s my whole story in this lodge — I study weather, not anything else.', triggers: ['ev_file'], break_conditions: { revealed: 'northrock_file' } },
    { id: 'lie_marian_nun', character_id: 'char_marian', fact_id: 'fact_marian_id', cover_story: 'I am Sister Marian of the Sacred Heart, on retreat. I have been at the lodge three days, in prayer, and I saw nothing but my rosary.', triggers: ['ev_photo'], break_conditions: { revealed: 'photograph' } },
  ],

  relationships: [
    { source: 'char_ford', target: 'char_corinne', type: 'employer', strength: 0.5 },
    { source: 'char_ben', target: 'char_corinne', type: 'employer', strength: 0.6 },
    { source: 'char_marian', target: 'char_corinne', type: 'family', strength: 0.4 },
    { source: 'char_astrid', target: 'char_corinne', type: 'observer', strength: 0.3 },
    { source: 'char_ben', target: 'char_ford', type: 'colleague', strength: 0.7 },
  ],

  red_herrings: [
    { suspicious_thing: 'Ben was fired that afternoon for theft, argued with Corinne at 21:15, and was the last person seen with her alive — a fired man, an ugly scene, and a snowstorm to hide in.', truth: 'The theft is real but small (three hundred dollars of parts), and Ben has a stronger alibi than anyone: the dogs. The huskies barked at 21:44 — the exact moment of the blow — from the mudroom where Ben sat with them through the outage.', explanation: 'His boots are size 9. The blood-transfer print on the annex mat is size 11. The fired handyman is the story the killer wanted told.' },
    { suspicious_thing: 'The blackout itself: a generator that fails for exactly six minutes in a storm, and only one person on site who knows machinery well enough to kill it — the handyman (fired, furious).', truth: 'The filter was drained by hand at 21:00 — while Ben was shoveling the annex path and the row was still going. The sabotage came from someone who used BEN\'S toolbox but did not have Ben\'s paw prints in the shed dust: the footprints in the genshed are size 11, the same as the mat.', explanation: 'The alibi that saves Ben (his boots, his prints, his dogs) is the same evidence chain that convicts Ford.' },
    { suspicious_thing: 'Sister Marian — a nun with no order, no identification, and a flinch at the word "Voss" — arrived the day before the storm. An impostor in the lodge, watching everything.', truth: 'She is Marian Voss, Corinne\'s estranged sister, come to reconcile after nineteen years. Her silence is family grief, not guilt; her reading-room hiding spot is coincidence; what she HID was not a crime but the only witness statement that matters.', explanation: 'The identity reveal is the human story; what she heard at 21:44 — the annex chain, the footsteps, the thud — is the evidence.' },
  ],

  clue_map: [
    { clue: 'The generator fuel filter is drained and wiped clean', unlocks: 'The blackout was sabotage, staged by someone who visited the shed at 21:00 — exactly when Ben was shoveling', note: 'The storm was a tool, not a circumstance.' },
    { clue: 'Astrid\'s instrument log: failure 21:41:12, restoration 21:47:02', unlocks: 'The murder window is six minutes — every alibi must account for 21:41–21:47 by the second', note: 'The storm verified to the second.' },
    { clue: 'The annex chain shows a fresh scrape', unlocks: 'The annex door was opened during the blackout — the "sealed lodge" had a way in and out', note: 'Movement in the dark.' },
    { clue: 'The blood-transfer mat print is size 11 Vibram', unlocks: 'The killer stepped in blood and left via the annex — check the mudroom boots: Ben is 9, Ford is 11', note: 'The boot that didn\'t fit the story.' },
    { clue: 'The shell-account ledger in the guestbook', unlocks: 'Ford\'s motive: $112,000, fourteen months, his handwriting in the reconciliation column', note: 'The weekend she gave him.' },
    { clue: 'Sister Marian\'s testimony — 21:44, annex chain, footsteps, thud', unlocks: 'The killer\'s movement is witnessed: out of the great room, through the annex, back as the lights came on', note: 'The quietest woman heard the loudest thing.' },
  ],

  hints: {
    easy: [
      'The murder window is six minutes long — 21:41:12 to 21:47:02, per Astrid\'s instruments. Ask each person, in order, what they did in those exact six minutes. One answers with a lie that takes two minutes to tell.',
      'The generator did not fail — it was drained at 21:00 while Ben was shoveling the annex path. Whose footprints are in the genshed dirt, and whose toolbox was open on the bench?',
      'Look at the boots in the mudroom, then look at the annex mat. The blood-transfer print is size 11 Vibram. Ben wears 9. Someone else in this lodge wears 11 — and his boots are wiped suspiciously clean.',
      'Break the nun\'s story gently. The photograph in her Bible is the key: two sisters, 1978, "Marian & Corinne". Once she is not Sister Marian anymore, she remembers exactly what she heard at 21:44 — the annex chain, the footsteps, the thud.',
    ],
    standard: [
      'Six minutes: 21:41:12–21:47:02. Astrid\'s log gives you the cage. The annex chain\'s fresh scrape gives you the door. The mat print gives you the boot. The mudroom rack gives you the size. The ledger in the guestbook gives you the why.',
      'The sabotage (filter drained at 21:00), the murder (21:44), and the staging (poker wiped, body by the stove) all belong to one person — the only suspect whose boots fit the mat and whose hands fit the ledger.',
      'The witness is hiding in the reading room. Her identity is a lie with a "Voss" inside it; her evidence is the sound of a chain, a walk, and a thud.',
    ],
    hard: [
      'The storm hides footsteps but not sizes: the mat print, the genshed prints, and the basement-stair prints form a single trail in size 11. Follow the boots, not the words.',
      'Everyone in the lodge has a cover story. Ben\'s is a theft, Astrid\'s is a career, Marian\'s is a vow. One cover is a ledger: $112,000, fourteen months, T. Ford.',
    ],
  },

  solution: {
    killer: 'Ford Tamlin',
    motive: 'Corinne found the shell account and told him at dinner: "You get the weekend to get your story straight." A weekend of dread was worse than a lifetime of it. He chose the night, the storm, and the six minutes it bought him.',
    method: 'At 21:00 he drained the generator\'s fuel filter with Ben\'s toolbox open beside him — the blackout was a switch he had already wired. When the lights died at 21:41:12 he claimed the breaker, went down the basement stairs for ninety seconds to leave his prints where "checking" would put them, and came up into the dark great room. At 21:44 he took the brass poker from its hook and struck once. He stepped into the annex to wipe his boots on the mat — leaving the size-11 blood transfer — re-hung the poker, arranged the body by the stove to fake the time of death, and was standing in the main hall offering tea when the generator caught at 21:47:02.',
    narrative: 'The whiteout made the lodge a locked room, but the storm was also the killer\'s alibi, his weapon, and his accomplice — and it did not lie. The filter proved the blackout was made, not happened. Astrid\'s instrument log pinned the window to the second. The annex chain remembered being opened. The mat remembered the boot that did not fit Ben. The ledger in the guestbook remembered the money. And Marian Voss — the sister who came home too late, hidden behind a rosary — remembered the sound of a chain, a walk, and a single thud at 21:44. The fire at dawn had kept one lie warm; the evidence kept one truth cold.',
  },

  killer_pov: [
    {
      id: 'kpov_dark',
      unlock_evidence_id: 'ev_genfilter',
      chapter_title: 'Six Minutes of Dark',
      text: 'He had practiced the dark for a week — walking his own living room with the lights off, counting steps to the hearth, learning the exact weight of the poker. The lodge was bigger, but the arithmetic was the same. Fuel filter at 21:00, ninety seconds in the basement to make the dust tell the "breaker" story, then the great room, where the embers gave him just enough red light to see the firewood stacked like a ledger. One blow. The dogs barked twice, and the wind took it, and he stood very still in the dark counting to sixty the way he counted columns — totals on the right, feelings on the left. At 21:47 the lights came on, and there he was, offering tea, the mildest man in the room, the one nobody could remember having seen leave.',
    },
    {
      id: 'kpov_mat',
      unlock_evidence_id: 'ev_annexmat',
      chapter_title: 'The Boot That Didn\'t Fit',
      text: 'The annex was thirty feet of wind and a doormat, and he had not meant to step in the dark. But the blood had found his boot the way guilt finds an accountant — unannounced, on the wrong foot, at the worst moment. He wiped it on the mat, once, twice, and came back in with his face full of cold air and his story full of tea. It never occurred to him that the mat would keep a receipt. That was the thing about this place: everything kept receipts. The guestbook, the fuel filter, the dogs, the nun in the reading room who was not a nun. He had balanced the wrong column. Six minutes of dark, and he had spent them writing his own name where the totals went.',
    },
  ],

  opening_scene: [
    'The mountain went white on the third day, and the world outside Voss Ridge Lodge became a rumor.',
    'Forty miles of pass, forty miles of storm, and one lodge sitting on top of it like a ship on the bottom of the sea. The east door had been under a drift since dusk. The generator coughed its diesel heartbeat in the shed. Inside, five people waited out the whiteout the way you wait out anything: with tea, with nerves, with the radio saying nothing new.',
    'At dinner, Corinne Voss served the stew herself and told her accountant, quietly, that after the storm they were going to see the sheriff.',
    'At 20:10 she fired the handyman in front of the kitchen— loud enough that the storm, if it had ears, would have known by midnight.',
    'At 21:15 the handyman came back to hand over the keys, said ten ugly words, and went to sit with the dogs.',
    'At 21:41:12 the lights died.',
    'Six minutes later, at 21:47:02, they came back — and one of the five people in the lodge was standing in the main hall, offering tea, the only man in the room nobody remembered seeing leave.',
    'At 07:40, the researcher who was not a researcher found Corinne by the stove, still warm, the poker back on its hook, the fire stoked at dawn by hands that were already gone.',
  ],
};

module.exports = { id: 'case-103', manifest };
