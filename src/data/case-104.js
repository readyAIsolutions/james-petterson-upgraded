'use strict';
/**
 * CASE 104 — "The Silent Lot"
 * An original thriller case: at a private auction in a half-renovated hotel,
 * developer Marta Keane is bludgeoned in the sub-basement records vault with
 * the antique fire extinguisher off the wall. The sealed "architect\'s
 * envelope" everyone is bidding around holds a lie, the renovation plans and
 * the real floor plan disagree, and a service stairwell nobody has used in
 * years has suddenly become the busiest place in the building.
 *
 * KILLER: Tynan Moore, Marta\'s project manager. She found the forged
 * demolition permits he used to accelerate the sale — and the invoices he
 * siphoned through the demolition contract. After the auction, she was going
 * to the authorities. He texted her to the vault instead.
 */
const manifest = {
  title: 'The Silent Lot',
  premise: 'A sealed envelope, a forged permit, and a fire extinguisher that was on the wall at 15:50 and off it at 16:24. In the Meridian Grand, the renovation plans tell a different story from the building — and one of them is a confession.',
  description: 'The Meridian Grand, half-restored, is on the block — receivership auction, private bidders, the lot list closed. The star of the catalog is Lot 13: the Architect\'s Envelope, sealed since 1929, contents unknown to every bidder except the ones who have been lying about it. At 16:40 the favorite, Marta Keane, is found dead in the sub-basement records vault, struck with the building\'s own antique extinguisher. The elevator keycard log says nobody went down between 15:30 and 17:00. The stairwell dust says otherwise — in a size-10 shoe, twice.',
  epigraph: 'Every building keeps two sets of plans. One for the inspectors. One for the truth.',
  difficulty: 'medium',
  settings: {
    crime_location: 'loc_vault',
    weapon_location: 'loc_vault',
    multi_culprit: false,
    narration_style: 'thriller_procedural',
  },
  culprit_id: 'char_tynan',

  locations: [
    { id: 'loc_lobby', name: 'The Lobby', description: 'Crystal and scaffolding. The auction desk is under the mezzanine, the bidder list in a brass binder, the chandelier wrapped in plastic like a gift to itself.' },
    { id: 'loc_ballroom', name: 'The Restored Ballroom', description: 'The auction room. Crown molding, a stage with a gavel stand, and the Lot 13 table under glass at the front of the room.' },
    { id: 'loc_mezz', name: 'The Mezzanine', description: 'The gallery above the ballroom floor, where the restoration crew left their ladders — and where Imelda Cruz has been inspecting the 1929 crown moldings all afternoon.' },
    { id: 'loc_vault', name: 'The Records Vault', description: 'Sub-basement. The hotel\'s document archive: ledgers to 1928, the deed chain, the original architect\'s drawings stored in a wall safe. A brass fire extinguisher hangs by the door — or it did.' },
    { id: 'loc_stairwell', name: 'The Service Stairwell', description: 'The old staff stairs from the ballroom wing to the sub-basement. Padlocked since the 1990s; the fire marshal\'s seal was broken this week. Dust on every tread — except two fresh sets of prints.' },
    { id: 'loc_dock', name: 'The Loading Dock', description: 'Where Durand Reyes made his phone call, where the dock hand keeps his log, and where an auctioneer\'s scream carries surprisingly well at 16:41.' },
    { id: 'loc_imelda', name: 'The Survey Base', description: 'Imelda Cruz\'s station on the mezzanine: cameras, a laser measure, and a permit pinned to the board that says "inspection — public floors only".' },
    { id: 'loc_odell', name: 'The Auctioneer\'s Office', description: 'Odell Vance\'s room behind the ballroom stage. A disasters-of-democracies-themed desk, a safe, and a photocopier that has seen the envelope before.' },
    { id: 'loc_tynan', name: 'The Project Trailer', description: 'Tynan Moore\'s mobile office at the dock edge: permitting files, contractor invoices, and a coffee ring on the demolition schedule.' },
  ],

  characters: [
    {
      id: 'char_marta', name: 'Marta Keane', role: 'victim', is_culprit: false, motive: null,
      traits: { ruthless: true, meticulous: true, fair_to_the_letter: true },
      public_profile: 'The deceased. Fifty-one, founder of Keane Development, the favorite in the Meridian Grand sale — and a woman who always read the fine print, which is why she is dead.',
    },
    {
      id: 'char_tynan', name: 'Tynan Moore', role: 'suspect', is_culprit: true,
      motive: 'Marta discovered Tynan forged the demolition permits to accelerate the sale — and found the invoices showing he siphoned $180,000 through the demolition contract. She told him she was going to the authorities after the auction.',
      traits: { competent: true, resentful: true, twenty_years_of_chairs: true },
      public_profile: 'Marta\'s project manager, forty-six. The man who built her last three towers and never once got his name on the door.',
      voice: {
        style: 'Flat, professional, almost tired. Speaks in project-manager jargon with feelings filed under "correspondence". Under pressure, his sentences get shorter and his hands get still.',
        tics: 'Checks his watch when he is lying; rearranges pens on the table; calls Marta "the principal" even now.',
        vocabulary: 'Construction: "permit", "schedule", "submittal", "RFI", "turnkey". Emotion comes out as scheduling language: "we have a sequencing problem".',
      },
      backstory: 'Twenty years of chairs — project engineer, then PM, then senior PM, never partner. When the Meridian deal needed the demolition permit in six weeks and the city said twelve, he solved it the only way that worked: he forged the approvals, signed a subcontractor\'s name, and got the job moving. The siphoning started as "fees" and became a habit. Marta found the case file this morning at 11:00, and the look she gave him across the trailer was the look that ends careers — and he saw the phone in her hand.',
      secret: { what: 'He forged the demolition permits, siphoned $180,000 through the demolition contractor, and killed Marta in the vault to bury the paper trail.', why: 'Twenty years of chairs, one forged signature, and a woman who read everything. The paper trail dies when the reader does.' },
      triggers: { hot_button: ['permit', 'demolition', 'invoice', 'siphon', 'authorities', 'case file'] },
      interview: {
        opening: 'Bone-dry professionalism. Offers schedules, timelines, work orders. Treats the murder as a delay in the critical path.',
        accused: 'Goes quiet. Not scared — quiet, like a man doing the arithmetic on what you actually know.',
        evidence_shown: 'The text, the stair log, or the case file: his composure stops being composure and becomes a man reading his own obituary.',
      },
    },
    {
      id: 'char_imelda', name: 'Imelda Cruz', role: 'suspect', is_culprit: false,
      motive: 'A preservation architect who spent two years trying to block the Meridian sale — her grandfather worked on the 1929 construction, and she swore publicly she would stop the demolition "by any means".',
      traits: { principled: true, stubborn: true, sees_buildings_as_people: true },
      public_profile: 'Thirty-nine, Cruz Preservation, the loudest voice against the Meridian sale. She has a permit to inspect the crown moldings today — public floors only.',
      voice: {
        style: 'Passionate, exact, lawyerly when cornered. Loves buildings more than people and can quote either when it suits her.',
        tics: 'Frames everything as preservation vs. destruction; touches architectural details while talking; says "my grandfather" like it is a citation.',
        vocabulary: 'Architecture: "cornice", "load-bearing", "assembly", "heritage". Arguments in complete paragraphs.',
      },
      backstory: 'Her grandfather, Rafael Cruz, was a draftsman on the Meridian in 1929. She has spent her career protected by that fact and haunted by it: the building is her family\'s monument, and the demolition is her family\'s end. This afternoon she found the original drawings in the vault wall safe and photographed them — proof the east wing could not be gutted as planned. She came upstairs knowing she had won. Ten minutes later, someone else used her discovery to die for it.',
      secret: { what: 'She was in the vault at 15:45–15:55 — below the "public floors only" line of her own permit — photographing the original drawings from the wall safe.', why: 'Her permit restricted her to public floors; the drawings would stop the demolition, but admitting she entered the vault makes her a suspect in the death that happened there.' },
      triggers: { hot_button: ['demolition', 'heritage', 'grandfather', 'permit', 'drawings'] },
      interview: {
        opening: 'Righteous, tireless, on the record about the building being worth more than the sale.',
        accused: 'Incredulous, then ice. "I have spent two years trying to save this building. I did not spend ten minutes killing for it."',
        evidence_shown: 'Her own photographs. They carry timestamps that exonerate her — and condemn the window they define.',
      },
    },
    {
      id: 'char_durand', name: 'Durand Reyes', role: 'suspect', is_culprit: false,
      motive: 'Marta outbid him on the Halstead and the Foundry — and today she was beating him again, in public, with a sealed envelope he could not match. Rivalry, exposure, and a 14.2 million over-bid that stank of desperation.',
      traits: { competitive: true, proud: true, better_than_his_reputation: true },
      public_profile: 'Forty-nine, Reyes Group, the developer who loses to Marta Keane for sport. Today he bid 14.2M on a building worth 11 — at least, that is what it looked like.',
      voice: {
        style: 'Big, theatrical, self-deprecating in a way that is secretly armor. Laughs at himself before you can.',
        tics: 'Calls everyone "champ"; drums the table with two fingers; deflects with charisma and a story.',
        vocabulary: 'Dealmaking: "upside", "exit", "term sheet". His vocabulary gets strangely formal — legal — when he is hiding a client.',
      },
      backstory: 'The 14.2M bid was not his money. A shell for the city\'s heritage trust hired Reyes Group to push the price up and force the drawings out of the sealed envelope — the trust believed the 1929 plans would prove the building\'s landmark value. Durand\'s job: lose the auction, win the building\'s future. He signed an NDA that makes the real client invisible. The public fight with Marta at 15:55 was the cover: two rivals, one gavel, zero truth.',
      secret: { what: 'He bid for a heritage-trust shell, not himself — and he has taken a series of dockside phone calls all afternoon to keep the cover alive.', why: 'The NDA is worth his license. Admitting the bid was a front ends his career in development — but his dock call and the elevator log clear him of the vault entirely.' },
      triggers: { hot_button: ['14.2', 'bid', 'NDA', 'client', 'trust', 'overbid'] },
      interview: {
        opening: 'Charming, loud, full of stories about the good old days of losing to Marta.',
        accused: 'The charm clicks off like a sign. "The building is worth eleven. I bid fourteen. You want to know why — I can\'t tell you why. I can show you my phone call."',
        evidence_shown: 'The NDA or the dock log and he exhales — the truth costs less than the suspicion.',
      },
    },
    {
      id: 'char_odell', name: 'Odell Vance', role: 'suspect', is_culprit: false,
      motive: 'The auctioneer\'s commission only pays if the sale closes at 13M or better — and Marta\'s announcement that she wanted Lot 13 opened in front of witnesses threatened to tank the entire auction. He also had the most to lose if the envelope was opened: he knew it was empty.',
      traits: { smooth: true, frightened: true, wearing_a_mask_of_serenity: true },
      public_profile: 'Fifty-seven, Vance & Vance Auctions, the city\'s most unflappable auctioneer — or the most frightened man in the room, depending on which lot you ask about.',
      voice: {
        style: 'Silken, formal, unhurried. Auctioneer cadence even in conversation — lists of three, rising pitch on the final item.',
        tics: 'Adjusts his cufflinks before lying; addresses everyone as "friend"; never, ever stops smiling until the smile is all that is left.',
        vocabulary: 'Auction: "esteemed bidders", "the lot", "hammer price", "reserve". His vocabulary is a suit he wears indoors.',
      },
      backstory: 'In 2019, when the estate first listed the Meridian, Odell opened Lot 13 himself — six months before listing, alone, with a letter opener and no witnesses. The envelope held the 1929 architect\'s drawings. He kept a photocopy, sold the originals privately in 2021 to a collector who paid in cash, and resealed the envelope with the auction brochure inside. Today Marta demanded the envelope opened in front of witnesses. He had two hours to build a lie, and he used ninety minutes of them.',
      secret: { what: 'He opened Lot 13 in 2019, sold the drawings privately, and swapped in a fake before the auction — and at 16:40 he found Marta dead in the vault where the real drawings had been hidden.', why: 'The fraud is a six-figure crime that becomes a murder story the moment he opens his mouth. He has been running from it all afternoon — and straight into the middle of the murder.' },
      triggers: { hot_button: ['envelope', 'Lot 13', '2019', 'drawings', 'photocopy', 'reserve'] },
      interview: {
        opening: 'Auctioneer serenity: every question answered like a lot description, every answer ending in a smile.',
        accused: 'The smile breaks for the first time in a decade. Stammer, then silence, then the whole truth in a spill.',
        evidence_shown: 'The photocopy, or the fake envelope from the stairwell — he folds like a card table.',
      },
    },
  ],

  facts: [
    { id: 'fact_motive', value: 'Marta found the forged demolition permits and the $180,000 siphoned through the demolition contract, and told Tynan she was going to the authorities after the auction.', category: 'critical', visibility: 'secret' },
    { id: 'fact_poison', value: 'Tynan Moore killed Marta Keane with the antique brass fire extinguisher.', category: 'conclusion', visibility: 'secret' },
    { id: 'fact_method', value: 'Bludgeoned with the antique brass fire extinguisher in the sub-basement records vault, between 16:20 and 16:27.', category: 'conclusion', visibility: 'secret' },
    { id: 'fact_lure', value: 'Tynan texted Marta at 16:10: "meet me in the vault — it\'s about the plans." Her stair-log entry at 16:20 shows she came.', category: 'critical', visibility: 'secret' },
    { id: 'fact_lift', value: 'The service-elevator keycard log shows no use between 15:30 and 17:00 — everyone who went below used the padlocked service stairs.', category: 'critical', visibility: 'secret' },
    { id: 'fact_stairs', value: 'The service-stairwell dust shows fresh size-10 prints down at 16:15 and up at 16:25 — plus Marta\'s prints down at 16:20, never up.', category: 'critical', visibility: 'secret' },
    { id: 'fact_imelda_sees', value: 'Imelda, on the mezzanine at 16:26, saw a man in Tynan\'s jacket come up the service stairs wiping his hands on his sleeves.', category: 'critical', visibility: 'secret' },
    { id: 'fact_photos', value: 'Imelda\'s 15:50 vault photos show the fire extinguisher still on its wall bracket — it came off the wall after 15:50.', category: 'critical', visibility: 'secret' },
    { id: 'fact_odell', value: 'Odell opened Lot 13 in 2019, sold the original drawings privately, and resealed the envelope with a brochure — a fraud the murder accidentally exposed.', category: 'critical', visibility: 'secret' },
    { id: 'fact_lot13', value: 'The sealed envelope\'s rumored contents — the 1929 architect\'s drawings — were real, and they were hidden in the vault wall safe all along.', category: 'general', visibility: 'secret' },
    { id: 'fact_forgery', value: 'The demolition permits are forged in Tynan\'s hand, signing a subcontractor\'s name; the demolition invoices show $180,000 siphoned through the same firm.', category: 'forensic', visibility: 'secret' },
    { id: 'fact_durand', value: 'Durand\'s 14.2M bid was a front for a heritage-trust shell, under NDA — he was there to force the envelope open, not to win.', category: 'motive_support', visibility: 'secret' },
  ],

  knowledge: [
    { character_id: 'char_tynan', fact_id: 'fact_poison', certainty: 1.0, source: 'action', can_disclose: 0 },
    { character_id: 'char_tynan', fact_id: 'fact_motive', certainty: 1.0, source: 'personal', can_disclose: 0 },
    { character_id: 'char_tynan', fact_id: 'fact_method', certainty: 1.0, source: 'action', can_disclose: 0 },
    { character_id: 'char_tynan', fact_id: 'fact_forgery', certainty: 1.0, source: 'personal', can_disclose: 0 },
    { character_id: 'char_tynan', fact_id: 'fact_stairs', certainty: 0.9, source: 'personal', can_disclose: 0 },
    { character_id: 'char_imelda', fact_id: 'fact_photos', certainty: 1.0, source: 'personal', can_disclose: 1 },
    { character_id: 'char_imelda', fact_id: 'fact_imelda_sees', certainty: 1.0, source: 'observed', can_disclose: 0 },
    { character_id: 'char_imelda', fact_id: 'fact_lot13', certainty: 0.9, source: 'investigation', can_disclose: 1 },
    { character_id: 'char_odell', fact_id: 'fact_odell', certainty: 1.0, source: 'personal', can_disclose: 0 },
    { character_id: 'char_odell', fact_id: 'fact_lot13', certainty: 1.0, source: 'personal', can_disclose: 1 },
    { character_id: 'char_durand', fact_id: 'fact_durand', certainty: 1.0, source: 'personal', can_disclose: 0 },
    { character_id: 'char_marta', fact_id: 'fact_motive', certainty: 1.0, source: 'investigation', can_disclose: 0 },
  ],

  events: [
    { id: 'evt_previews', start: '15:00', end: '17:00', location_id: 'loc_ballroom', title: 'Previews and bidding', description: 'The Meridian Grand receivership auction. Lot 13 sits under glass: the Architect\'s Envelope, sealed since 1929. Bidders rotate past it all afternoon.', actors: [], is_public: true },
    { id: 'evt_demand', start: '15:30', end: '15:35', location_id: 'loc_lobby', title: 'The demand', description: 'Marta corners Odell by the auction desk: "The envelope gets opened in front of witnesses before the hammer, Odell. I want to see what I\'m buying." Odell\'s smile does not reach his eyes.', actors: ['char_marta', 'char_odell'] },
    { id: 'evt_imelda_vault', start: '15:45', end: '15:55', location_id: 'loc_vault', title: 'The discovery', description: 'Imelda, on her grandfather\'s hunch, works the wall safe in the vault and finds the 1929 drawings. She photographs every page. The antique extinguisher is on its bracket in every frame.', actors: ['char_imelda'] },
    { id: 'evt_durand_dock', start: '16:05', end: '16:15', location_id: 'loc_dock', title: 'The dockside call', description: 'Durand steps out to the loading dock and calls his client. The dock hand\'s log notes his times. He is nowhere near the stairs.', actors: ['char_durand'] },
    { id: 'evt_swap', start: '16:00', end: '16:06', location_id: 'loc_vault', title: 'The swap', description: 'Odell, sweat-slick, carries the brochure-stuffed fake envelope down the service stairs, slips it into the wall-safe space where the drawings once sat, and locks the safe.', actors: ['char_odell'] },
    { id: 'evt_drop', start: '16:07', end: '16:07', location_id: 'loc_stairwell', title: 'The dropped envelope', description: 'On the way up, Odell fumbles the cheap envelope\'s twin — the one that was supposed to hold the brochure — and it falls behind the fire-hose box on the landing. He panics, leaves it, and flees to the ballroom.', actors: ['char_odell'] },
    { id: 'evt_text', start: '16:10', end: '16:10', location_id: 'loc_tynan', title: 'The text', description: 'Tynan texts Marta from the project trailer: "meet me in the vault — it\'s about the plans." The phone record is the last message either of them sends that day.', actors: ['char_tynan'] },
    { id: 'evt_tynan_down', start: '16:15', end: '16:18', location_id: 'loc_vault', title: 'The man who waited', description: 'Tynan breaks the fire-marshal seal on the service stairs and walks down — size-10 prints laid fresh in the dust. He waits in the vault in the dark, the extinguisher already in his hand.', actors: ['char_tynan'] },
    { id: 'evt_marta_down', start: '16:20', end: '16:20', location_id: 'loc_vault', title: 'The principal arrives', description: 'Marta uses the service stairs — the elevator is "too slow for the bidders" — and her prints join his in the dust. She walks into the vault, and the door swings shut.', actors: ['char_marta'], causal_parent: 'evt_text' },
    { id: 'evt_blow', start: '16:24', end: '16:24', location_id: 'loc_vault', title: 'The extinguisher', description: 'One blow, the way you swing a sledge in a tight space. The brass extinguisher comes down on the wall bracket\'s shadow and the woman who read the fine print.', actors: ['char_tynan', 'char_marta'], causal_parent: 'evt_marta_down' },
    { id: 'evt_tynan_up', start: '16:25', end: '16:27', location_id: 'loc_stairwell', title: 'The ascent', description: 'Tynan comes up the service stairs, wiping his hands on his sleeves, the extinguisher wiped and abandoned in the vault. The dust takes his prints both ways.', actors: ['char_tynan'], causal_parent: 'evt_blow' },
    { id: 'evt_imelda_sees', start: '16:26', end: '16:26', location_id: 'loc_mezz', title: 'The mezzanine sighting', description: 'Imelda, packing her survey gear on the mezzanine, sees a man in Tynan Moore\'s jacket come out of the service stairwell wiping his hands. He does not see her.', actors: ['char_imelda'] },
    { id: 'evt_back', start: '16:28', end: '16:30', location_id: 'loc_ballroom', title: 'The auction desk', description: 'Tynan walks through the ballroom to the auction desk, pours a coffee, and asks Odell how the bidding is going. Odell says something about enthusiasm. Neither man is listening.', actors: ['char_tynan'] },
    { id: 'evt_odell_return', start: '16:38', end: '16:40', location_id: 'loc_vault', title: 'The second visit', description: 'Odell returns to the vault to retrieve the fake envelope from the stairwell — and finds the stairwell empty and the vault door ajar and Marta on the floor.', actors: ['char_odell'] },
    { id: 'evt_alarm', start: '16:41', end: '16:41', location_id: 'loc_dock', title: 'The scream', description: 'Odell\'s scream crosses the loading dock like a bid being accepted. The dock hand finds him against the wall, pointing at the sub-basement door. The auction is over.', actors: ['char_odell'], is_public: true },
  ],

  evidence: [
    { id: 'ev_texts', type: 'digital', location_id: 'loc_tynan', title: 'The 16:10 Text', description: 'Tynan\'s phone, surrendered by his assistant: to Marta Keane at 16:10 — "meet me in the vault — it\'s about the plans." Delivered. Read at 16:11. Her last movement was toward him.', fact_links: ['fact_lure'], unlock_rules: { acquire: true } },
    { id: 'ev_liftlog', type: 'digital', location_id: 'loc_lobby', title: 'Service-Elevator Keycard Log', description: 'The lift keycard log: no entry or exit between 15:30 and 17:00. Nobody used the elevator to go below — the service stairs were the only way down, and they were padlocked until this week.', fact_links: ['fact_lift'], unlock_rules: { acquire: true } },
    { id: 'ev_stairlog', type: 'digital', location_id: 'loc_stairwell', title: 'The Stairwell Door Log', description: 'The retrofit door sensor on the service stairwell — wired this week, quietly: Tynan\'s badge 16:15:03 down. Marta\'s badge 16:20:11 down. Tynan\'s badge 16:25:44 up. Odell\'s badge 16:00:10 down, 16:07:02 up, 16:38:20 down, 16:40:58 up screaming.', fact_links: ['fact_lift', 'fact_stairs', 'fact_lure'], unlock_rules: { acquire: true } },
    { id: 'ev_dusttrail', type: 'physical', location_id: 'loc_stairwell', title: 'The Dust Trail', description: 'Decades of dust on the service stairs, broken twice this afternoon: size-10 Chevron-sole prints down at 16:15 and up at 16:25; a second, smaller pair down at 16:20 — that never came back up. The treads match an athletic shoe\'s heel strike, size 10.', fact_links: ['fact_stairs'], unlock_rules: { inspect: 'forensics' } },
    { id: 'ev_extinguisher', type: 'physical', location_id: 'loc_vault', title: 'The Antique Fire Extinguisher', description: 'The brass wall extinguisher, off its bracket, wiped clean — except the joint of the hose fitting, where lab finds hair and trace matching Marta Keane. The wall bracket shadow still shows where it hung at 15:50.', fact_links: ['fact_method'], unlock_rules: { inspect: 'forensics' } },
    { id: 'ev_photos', type: 'digital', location_id: 'loc_imelda', title: 'Imelda\'s Vault Photographs', description: 'Her camera\'s timestamps: 15:50–15:55, in the vault. Every frame shows the extinguisher ON its bracket — and the opened wall safe with the 1929 drawings visible inside. She was below, and she is not the killer; the photos say so twice.', fact_links: ['fact_photos', 'fact_lot13'], unlock_rules: { acquire: true } },
    { id: 'ev_imelda_statement', type: 'testimony', location_id: 'loc_mezz', title: 'What Imelda Saw', description: 'At 16:26, packing her gear: "A man came out of the service stairwell — Tynan Moore\'s jacket, his walk, his watch — wiping his hands on his sleeves. He looked like a man who had just finished something heavy."', fact_links: ['fact_imelda_sees'], unlock_rules: { acquire: true } },
    { id: 'ev_plans', type: 'document', location_id: 'loc_vault', title: 'The 1929 Drawings', description: 'From the vault wall safe: the original architect\'s drawings, signed Rafael Cruz, 1929. They show the east wing\'s load-bearing walls — the demolition plan could never pass with these in evidence. They never left the building.', fact_links: ['fact_lot13', 'fact_odell'], unlock_rules: { inspect: 'search' } },
    { id: 'ev_fakeenv', type: 'document', location_id: 'loc_stairwell', title: 'The Fake Envelope', description: 'Behind the fire-hose box on the stairwell landing: a sweat-stained envelope addressed "Lot 13 — The Architect\'s Envelope", containing the auction brochure. Sealed in 2019, not 1929 — the brochure\'s paper stock dates it.', fact_links: ['fact_odell', 'fact_lot13'], unlock_rules: { inspect: 'search' } },
    { id: 'ev_photocopy', type: 'document', location_id: 'loc_odell', title: 'The 2019 Photocopy', description: 'In Odell\'s desk: a photocopy of the envelope\'s original contents — the 1929 drawings, initialed O.V., dated 2019. Six months before the estate officially listed the lot.', fact_links: ['fact_odell'], unlock_rules: { inspect: 'search' } },
    { id: 'ev_casefile', type: 'document', location_id: 'loc_tynan', title: 'The Case File', description: 'Tynan\'s own file: the demolition permits signed in a subcontractor\'s name — his handwriting under the signature, visible under magnification — and the demolition invoices routing $180,000 through the same firm. A yellow sticky in Marta\'s hand: "T — authorities, after the auction."', fact_links: ['fact_forgery', 'fact_motive'], unlock_rules: { inspect: 'search' } },
    { id: 'ev_ndas', type: 'document', location_id: 'loc_lobby', title: 'The Heritage NDA', description: 'In Durand\'s briefcase, found by the auction desk: a services agreement with a shell entity of the city heritage trust — "advise at auction; force disclosure of Lot 13; do not win". His dock call at 16:05 was the client, per the dock hand\'s log.', fact_links: ['fact_durand'], unlock_rules: { acquire: true } },
  ],

  lies: [
    { id: 'lie_tynan_floor', character_id: 'char_tynan', fact_id: 'fact_stairs', cover_story: 'I never left the auction floor between 15:30 and 17:00 — ask anyone, I was at the desk the whole time. The trailer, the ballroom, that\'s my whole afternoon. The vault? I\'ve never even been down there.', triggers: ['ev_stairlog', 'ev_dusttrail', 'ev_imelda_statement'], break_conditions: { revealed: 'stair_log' } },
    { id: 'lie_odell_envelope', character_id: 'char_odell', fact_id: 'fact_odell', cover_story: 'Lot 13 came sealed from the estate in 2019 and has never been opened by anyone in this building — I stake my gavel on it.', triggers: ['ev_photocopy', 'ev_fakeenv'], break_conditions: { revealed: 'photocopy' } },
    { id: 'lie_imelda_floor', character_id: 'char_imelda', fact_id: 'fact_photos', cover_story: 'I never went below the mezzanine. My inspection permit covers public floors only, and I have never so much as looked at the sub-basement.', triggers: ['ev_photos'], break_conditions: { revealed: 'vault_photos' } },
    { id: 'lie_durand_desk', character_id: 'char_durand', fact_id: 'fact_durand', cover_story: 'I was at the auction desk from four o\'clock straight — a bidder\'s got to be in the room. The dock? I was bidding, champ. Ask my paddle.', triggers: ['ev_ndas'], break_conditions: { revealed: 'ndas' } },
  ],

  relationships: [
    { source: 'char_tynan', target: 'char_marta', type: 'employer', strength: 0.5 },
    { source: 'char_imelda', target: 'char_marta', type: 'adversary', strength: 0.3 },
    { source: 'char_durand', target: 'char_marta', type: 'rival', strength: 0.4 },
    { source: 'char_odell', target: 'char_marta', type: 'auctioneer', strength: 0.6 },
    { source: 'char_tynan', target: 'char_odell', type: 'associate', strength: 0.7 },
    { source: 'char_imelda', target: 'char_marta', type: 'opponent', strength: 0.2 },
  ],

  red_herrings: [
    { suspicious_thing: 'Imelda Cruz: sworn enemy of the demolition, on site today, in the exact building where the murder happened — and caught lying about being below the mezzanine. The preservationist with everything to gain from the sale collapsing.', truth: 'Her unauthorized vault visit at 15:45–15:55 is exactly what clears her: her photographs show the extinguisher still on the wall at 15:50, and her mezzanine sighting at 16:26 identifies the man who came up the stairs — Tynan Moore.', explanation: 'The permit violation is a paper crime; the timestamped photographs are an alibi and a witness statement in one.' },
    { suspicious_thing: 'Durand Reyes: publicly fought Marta at 15:55, bid 14.2M on an 11M building, and his phone records show a flurry of calls during the murder window — a desperate rival cooking the books.', truth: 'His bid was a front for the heritage trust under NDA, his "desperate" calls were to his client, and the dock hand\'s log places him outside, dockside, in the entire 16:05–16:15 window. The elevator log and stair log show nobody of his size anywhere near the vault.', explanation: 'The rival bidder was a knight in NDA armor; his whole afternoon was performance, and the performance never went underground.' },
    { suspicious_thing: 'Odell Vance: the auctioneer whose commission dies with Marta\'s demands, sweating visibly, discovered the body, and owns the only safe in the building that has seen the envelope.', truth: 'His lie is real but smaller than the murder: he opened Lot 13 in 2019 and swapped in a fake. His fraud accidentally explains the envelope\'s emptiness and his terror — and his 16:38 return trip put him at the body two minutes after the streetlights came on, not at the blow.', explanation: 'The auctioneer\'s crime is six-figure fraud with a letter opener. The dust and the logs and the extinguisher belong to someone else entirely.' },
  ],

  clue_map: [
    { clue: 'The 16:10 text: "meet me in the vault"', unlocks: 'Marta walked to her killer — the message is the lure', note: 'Digital clue; the last voice she heard was a text.' },
    { clue: 'The stairwell door log: Tynan down 16:15, Marta down 16:20, Tynan up 16:25', unlocks: 'The "never left the auction floor" alibi is a construction — he was below in the murder window', note: 'The building keeps its own log.' },
    { clue: 'The elevator keycard log shows nobody below all afternoon', unlocks: 'The service stairs were the only way — and the dust trail has the only story', note: 'Route exclusion.' },
    { clue: 'The dust trail: size-10 down at 16:15, up at 16:25; a smaller pair down at 16:20 that never returns', unlocks: 'Two people went down, one came up — the extinguisher blow is between the treads', note: 'Physical clue, the murder spelled in dust.' },
    { clue: 'Imelda\'s photographs: extinguisher on the wall at 15:50', unlocks: 'The murder weapon came off the wall in the 16:15–16:25 window — and her sighting at 16:26 names the man coming up', note: 'Timestamps exculpate and condemn.' },
    { clue: 'The case file: forged permits, $180,000, Marta\'s sticky note', unlocks: 'The motive — the authorities were waiting after the auction', note: 'The paper trail that killed to bury itself.' },
  ],

  hints: {
    easy: [
      'The building is wired: the stairwell door logs everyone who went below. Read the entries between 16:00 and 16:41, then compare them to what each person CLAIMS they were doing after 16:00.',
      'One person\'s prints went down at 16:15, up at 16:25 — in the dust of a stairwell nobody had used in years. Match the size-10 Chevron tread to the shoes on the bidders\' feet. Then find the second set of prints — the ones that went down at 16:20 and never came back.',
      'Imelda was in the vault at 15:50 — her permit says public floors only, which is why she lied. But her photographs are the best evidence in the building: the extinguisher is on the wall at 15:50. It came off between her photos and 16:24. Ask her what she saw at 16:26.',
      'Read Tynan\'s texts, then read his case file: forged permits, siphoned invoices, Marta\'s sticky note about "authorities, after the auction". The text to the vault and the file in the trailer are the same sentence.',
    ],
    standard: [
      'The elevator was not used; the padlocked stairs were. The door log names the times; the dust names the shoe size; Imelda\'s 16:26 sighting names the man. Three records, one killer.',
      'The 16:10 text is the lure. The extinguisher off its bracket is the method. The forged-permit file is the motive. But the text alone does not kill — check who actually walked down at 16:15.',
      'The auctioneer is lying about the envelope, and the preservationist is lying about the mezzanine, and the rival is lying about the bid — three liars at the auction, one of them at the murder. The lies break with three documents: the photocopy, the photographs, the NDA.',
    ],
    hard: [
      'Every alibi in this case rides the same two rails: the elevator log and the stair log. Read them like a train schedule. One man appears twice on the stairs and once at the auction desk, freshly poured coffee in his hand.',
      'The murder weapon was photographed on its bracket at 15:50, wiped clean at 16:24, and never left the vault. The killer\'s hands did. Ask the mezzanine what it saw at 16:26.',
    ],
  },

  solution: {
    killer: 'Tynan Moore',
    motive: 'Marta found the forged demolition permits and the siphoned invoices, and told him — in writing, on a sticky note — that she was going to the authorities after the auction. Twenty years of chairs, one forged signature, and a principal who read everything: the paper trail died when she did.',
    method: 'He texted her to the vault at 16:10 ("it\'s about the plans"), broke the fire-marshal seal on the service stairs at 16:15, and waited in the dark with the antique brass extinguisher already in his hand — it came off its bracket between Imelda\'s photos at 15:50 and the blow at 16:24. When Marta walked in at 16:20, he swung once. He wiped the brass, left it in the vault, and came up the same stairs at 16:25, crossing paths in the dust with nobody — because nobody else had been below all afternoon. The elevator log, the stair door log, the treads in the dust, and the mezzanine\'s 16:26 sighting all say the same thing: one man went down, one man came up, and the auction desk got a fresh coffee at 16:28.',
    narrative: 'The Meridian kept two sets of records, and both of them solved the case: the renovation plans the bidders saw, and the service-stairwell logs nobody knew were installed. Odell\'s fraud (the empty envelope, the 2019 photocopy, the brochure in the stairwell) explains the auction\'s electricity; Imelda\'s photographs fix the weapon\'s timeline; Durand\'s NDA clears the rival; and Tynan\'s own case file — permits in his hand, invoices in his name, Marta\'s sticky note on top — explains why a man who had everything to lose decided the loss was unacceptable. The extinguisher held one hair. The dust held his size-10 tread, twice. The mezzanine held his jacket in its memory. And the vault held the drawings that were never in the envelope at all.',
  },

  killer_pov: [
    {
      id: 'kpov_text',
      unlock_evidence_id: 'ev_texts',
      chapter_title: 'Come Down',
      text: 'He typed the message with his thumb and watched it send, and the trailer smelled of coffee and his own heartbeat. "Meet me in the vault — it\'s about the plans." The plans. Twenty years of his plans, filed under someone else\'s name. The vault was the right room for it: dark, honest, below the auction floor where the liars were doing arithmetic in public. He broke the fire-marshal seal with a pocketknife and went down into the dust, and the extinguisher came off the wall like it had been waiting since 1929 for someone to need it properly. Her keycard clicked the door at 16:20. He thought, almost gently: she always did exactly what the fine print told her to do. Then he swung.',
    },
    {
      id: 'kpov_file',
      unlock_evidence_id: 'ev_casefile',
      chapter_title: 'The Paper Trail',
      text: 'The file was the problem: green cardboard, his handwriting under someone else\'s signature, invoices with his fingerprints on the arithmetic. He had told himself for eleven months that it was fees, that the principal would understand, that the building would sell and the numbers would bury themselves behind the new owner\'s logo. But she had read it, sticky note and all — "T — authorities, after the auction" — in the neat small hand she used for everything that ended people. He wiped the extinguisher and hung nothing back on the bracket. Up the stairs, sleeves wet, coffee at the desk, smile in place. The file would outlive him if they found it. That was the one thing he could not schedule away: a paper trail keeps its own hours, and it had never once missed a deadline.',
    },
  ],

  opening_scene: [
    'The chandelier was wrapped in plastic, which seemed right: the Meridian Grand was a building holding its breath.',
    'Half restored, half condemned, wholly on the block — the receivership auction had drawn every developer in the region to its ballroom, where the crown molding gleamed under scaffolding and Lot 13 sat under glass: the Architect\'s Envelope, sealed since 1929. Nobody knew what was in it. Everybody was bidding as if they did.',
    'At 15:30 Marta Keane, the favorite, told the auctioneer she wanted the envelope opened in front of witnesses. His smile died behind his teeth.',
    'At 16:10 her project manager texted her: meet me in the vault, it\'s about the plans.',
    'At 16:40 an auctioneer\'s scream crossed the loading dock like a hammer coming down.',
    'In the sub-basement, among ledgers older than the bidders, Marta Keane lay next to a brass fire extinguisher that was on its wall bracket at 15:50 — and had been the only thing in the building, besides a set of size-10 footprints in the dust, that went down the service stairs at 16:15 and came back up at 16:25.',
    'The elevator had not moved all afternoon. The building had. And one of the men now standing in the ballroom, coffee cooling in his hand, had just finished something heavy.',
  ],
};

module.exports = { id: 'case-104', manifest };
