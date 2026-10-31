'use strict';
/**
 * Story layer: planned difficulty mix, public character chapters ("who they
 * are"), and victim chapters that unfold as the player finds evidence.
 *
 * RULES (enforced by tests/story.test.js):
 *  - Chapters are PUBLIC knowledge. They never contain a character's secret,
 *    the killer's identity, or the solution.
 *  - Every suspect gets the same kind of chapter (a job, a manner, one private
 *    thread) so the killer does not stand out by length or tone.
 */

// Planned mix: 1 tutorial, 3 medium, 2 hard.
const DIFFICULTY = {
  'case-001': 'easy',
  'case-100': 'medium',
  'case-101': 'medium',
  'case-104': 'medium',
  'case-102': 'hard',
  'case-103': 'hard',
};

// Shown after the player has interviewed that person at least once.
const BACKSTORY = {
  // --- The Last Broadcast
  char_june: 'Fourteen years at KXRV, and nobody remembers the station before her spreadsheets. She hired half the staff and has known Ray since they shared a cramped apartment and a dream of owning a signal. People call her cold. She has a son she mentions only when asked, and a habit of locking her office even when she is inside.',
  char_evie: 'Twenty-nine, two years in the producer\'s chair, and the fastest ears in the building. Ray pulled her out of the tape library and made her his right hand. She laughs at the wrong moments, keeps her phone face down, and has told no one at the station where she goes after the show.',
  char_dante: 'Twelve years in the booth, and he can hear a bad cable from across the building. Dante talks in signal chains because it is easier than talking about his mother\'s care home or the racetrack he swears he stopped visiting. He has never missed a shift.',
  char_cole: 'Forty-one, all teeth and billboard smile, host of The Crypt on weekends. Cole and Ray started in the same cramped newsroom and ended on opposite sides of every argument. Six months ago a leaked story about paid callers cost him a syndication deal, and he tells anyone who will listen who he thinks leaked it.',
  // --- The Glasshouse Guest
  char_delia: 'Forty-seven, award-winning botanist, director of the conservatory for nine years. She can name any orchid by its scent and any donor by the size of their cheque. She speaks about the collection the way other people speak about family, and about her own family not at all.',
  char_ramsey: 'Thirty-eight, the city\'s favourite party architect and three lawsuits deep. Ramsey believes every disaster is a scheduling problem and every silence an opportunity for a canapé. His company is one bad review from the bank, and he smiles harder the closer it gets.',
  char_wren: 'Twenty-four, adopted at eighteen, the reluctant it-girl of the donor class. Wren answers questions with questions and keeps her coat on in rooms she plans to leave. She loved Oscar the way you love a weather system that has always lived in your house.',
  char_gio: 'Fifty-three, ex-military, twenty years as the Fielding family\'s fixer. Gio says "affirmative" for yes and is believed because he never says more than he must. He keeps three copies of every schedule and trusts none of them.',
  // --- The Northbound Car
  char_reggie: 'Fifty-two, nineteen years in Meridian\'s operations department, let go three weeks ago. Reggie still calls the railway "the line" and carries himself like a man whose orders get followed. He has not explained why a man with no job bought a sleeper ticket for the same night as his old boss.',
  char_sasha: 'Twenty-eight, a marine biologist who has spent four years not speaking to her father. She measures grief the way she measures tide pools: carefully, and from a safe distance. She boarded with one suitcase and a letter she has not shown anyone.',
  char_paulie: 'Forty-five, three national awards and a permanent enemies list. Paulie introduces himself as "just a guy with a camera bag" and then asks you eleven questions. He has chased Meridian\'s waste contracts for two years and has the notebooks to prove it.',
  char_yusuf: 'Thirty-eight, twelve years on the Northern Star. Yusuf\'s service log is written in a draftsman\'s hand, and he can tell you who asked for extra pillows on any night since 2019. He treats discretion as a religion, and it is the only one he has never doubted.',
  // --- The Whiteout
  char_ford: 'Forty-four, the lodge accountant, so quiet he reintroduces himself to guests twice a season. Ford straightens objects while he talks and apologises before he answers. In nine years nobody has seen him lose his temper or finish a drink.',
  char_ben: 'Thirty-nine, handyman for ten years, knows the sound every wall in the lodge makes. Ben cracks his knuckles when he thinks and calls everyone "boss". He was let go at four o\'clock today in front of the staff, and he is still wearing the lodge jacket.',
  char_astrid: 'Thirty-three, introduced as a storm researcher from the university, here to study the blizzard\'s pressure signature. Astrid answers every question with a number and has not once let anyone see her instrument case open.',
  char_marian: 'Sixty-one, on retreat, "praying out the storm". Sister Marian arrived the day before the blizzard with a rosary, a small bag and a bus ticket stub she keeps turning over. She makes tea for everyone and says very little about the order that sent her.',
  // --- The Silent Lot
  char_tynan: 'Forty-six, Marta\'s project manager for twenty years, builder of her last three towers. Tynan speaks in schedules, calls Marta "the principal", and has never had his name on a door. He is the person everyone on site calls when something goes wrong, and the last to be thanked.',
  char_imelda: 'Thirty-nine, the loudest voice in the city against the Meridian sale. Imelda\'s grandfather drew parts of the building in 1929, and she mentions it like a citation. She holds a permit for the public floors only, and has been seen trying doors.',
  char_durand: 'Forty-nine, the developer who loses to Marta for sport and tells the story better each time. Durand drums the table with two fingers and calls everyone "champ". Today he bid fourteen million for a building worth eleven, and nobody has heard him explain it.',
  char_odell: 'Fifty-seven, auctioneer, the calmest voice in the room and the first to smile. Odell has sold half the city\'s landmarks and keeps his hands very still while he does it. He has watched the clock all afternoon, and he is not an auctioneer who watches clocks.',
  // --- The Clock Strikes at Eight
  char_elias: 'Thirty-one, Victor\'s only family. He visits the workshop twice a year and has never learned the difference between a lever and an escapement. His debts are an open secret, and so is the way he lowers his voice when his uncle\'s name comes up.',
  char_marina: 'Thirty-four, apprenticed to Victor at nineteen and never left. She brews his tea every evening at six, repairs the movements he is too proud to admit he cannot see, and has kept one drawer in the workshop locked for eleven years.',
  char_silas: 'Fifty-eight, a rival dealer who has admired Victor\'s work and resented him for it in equal measure. He prices everything, including favours, and keeps the ledger to prove it.',
};

// Unfold as evidence is collected (at = number of items found).
const VICTIM = {
  'case-100': [
    { at: 2, title: 'Who was Ray Mercer?', text: 'Ray Mercer never repeated himself on air. In twenty years his producers could count the times on one hand, and each time he called it a gift to the superstitious.' },
    { at: 5, title: 'The Black Book', text: 'He kept a book of callers going back to 1998: names, voices, the exact hour each one called. Some of them, he told friends, were the only reason he kept doing the show.' },
    { at: 8, title: 'The Week Before', text: 'In the week before the anniversary he stopped taking calls in the afternoons and carried a folder into the studio that he never opened on air. He told his producer it was "Tuesday\'s finding", and that Monday would be a hard morning for more than one person.' },
  ],
  'case-101': [
    { at: 2, title: 'Who was Oscar Fielding?', text: 'Oscar Fielding built a respiratory-device empire from a garage and never forgave a lie told to him by anyone he had helped.' },
    { at: 5, title: 'The Founder\'s Walk', text: 'He insisted on inspecting anything he funded in person. Staff called it the founder\'s walk. It ended two careers and saved a hospital.' },
    { at: 8, title: 'The Last Month', text: 'He rewrote his will twice in the weeks before the gala and cancelled his gift to every charity but one. His assistant says he kept repeating that he was "tired of being the last to find out".' },
  ],
  'case-102': [
    { at: 2, title: 'Who was Lyle Zellinger?', text: 'Lyle Zellinger turned a failing regional railway into a coast-to-coast freight empire, and forgave neither a debt owed nor a debt owing.' },
    { at: 5, title: 'Compartment Seven', text: 'He travelled by sleeper once a year, always compartment seven, saying it was the only place he could think. Staff say he kept a folder on the table that he would not let anyone touch.' },
    { at: 8, title: 'The Crash', text: 'Four years ago a Meridian-leased aircraft went down. Lyle never spoke publicly about it. Two people close to him say he stopped sleeping through the night afterwards.' },
  ],
  'case-103': [
    { at: 2, title: 'Who was Corinne Voss?', text: 'Corinne Voss ran Voss Ridge for twenty-three years the way other people run a corner shop: hands-on, blunt, fair until she wasn\'t. She knew every guest\'s name, every employee\'s rent, and the exact price of everything in the building.' },
    { at: 5, title: 'Second Chances, In Writing', text: 'She believed in second chances and gave them with a deadline, in writing. Four staff members still have their jobs because of one.' },
    { at: 8, title: 'The Closed Door', text: 'In her last month she took calls on the lodge\'s one landline with the door shut, which she had never done in twenty-three years. A photograph of two girls on a porch stayed in her desk drawer, and she never explained it.' },
  ],
  'case-104': [
    { at: 2, title: 'Who was Marta Keane?', text: 'Marta Keane read everything: contracts, minutes, the fine print of the fine print. Colleagues say she could find the one clause in a hundred pages that would cost you a year.' },
    { at: 5, title: 'The First Building', text: 'She started as a site secretary and bought her first building at twenty-six with a loan nobody else would sign. She never forgot who laughed.' },
    { at: 8, title: 'The Week Before', text: 'The week before the auction she cancelled two meetings, ordered a set of printed records, and told her assistant she would read them in the car, alone.' },
  ],
  'case-001': [
    { at: 2, title: 'Who was Victor Hartley?', text: 'Victor Hartley made clocks for forty years and trusted none of them to keep his secrets.' },
    { at: 4, title: 'The Grandfather Clock', text: 'The workshop\'s grandfather clock was his masterpiece. He wound it himself every morning and let no one else touch the key.' },
    { at: 6, title: 'His Last Letter', text: 'In his last month he wrote to a buyer in the north about selling the workshop, and told no one at home.' },
  ],
};

// Case 001 is the tutorial; it had no hints, proof, or story beats. Added here.
const TUTORIAL = {
  epigraph: 'Every clock tells the truth. It is only the people who set them who lie.',
  opening_scene: [
    'The workshop at Hartley & Son had not been silent in forty years.',
    'Now thirty-one clocks ticked over the body of the man who built them, and the grandfather clock in the corner had stopped at exactly eight.',
    'A half-finished cup of tea sat on the workbench. Three people had been in the building that evening. All three say they loved him.',
    'Your first case is a small one. Learn the rhythm: look, collect, question, accuse.',
  ],
  detective_stake: 'This is your first case on the squad. The captain has told you plainly that a bad arrest on day one ends your career before it starts.',
  chapter_breaks: [
    { at: 2, title: 'Chapter 2: Tick', text: 'In the silence you hear it: one clock in the room is still running, and it is four minutes slow.' },
    { at: 4, title: 'Chapter 3: Tea for One', text: 'The kitchen has two cups on the draining board and only one of them was ever used.' },
  ],
  hints: {
    easy: [
      'Start in the workshop. The teacup and the stopped clock tell you when, and how. Collect both, then present them when you question people.',
      'Everyone says they loved Victor. Ask each suspect where they were at eight o\'clock. One of them has a receipt. One of them has a reason.',
      'The sale contract and the letter explain why someone wanted Victor stopped. Check who made the tea.',
    ],
    standard: [
      'The teacup and the clock fix the time and the method. Now ask who stood to lose if the workshop was sold.',
      'Two of the suspects can prove where they were. The third cannot, and has the strongest reason to want the sale stopped.',
    ],
    hard: [
      'The clock is the time, the cup is the method. Everything else is who could have reached the cup.',
    ],
  },
  proof: [
    { label: 'how Victor was poisoned', any_of: ['ev_teacup'] },
    { label: 'why someone wanted the sale stopped', any_of: ['ev_letter', 'ev_sale_paper'] },
    { label: 'that the other suspects have an alibi', any_of: ['ev_auction_receipt'] },
  ],
  public_motive: {
    char_elias: 'Victor\'s nephew and heir. His debts are well known.',
    char_marina: 'Victor\'s assistant. She brews his tea and has free run of the workshop.',
    char_silas: 'A rival dealer. Victor owed him money.',
  },
};

module.exports = { DIFFICULTY, BACKSTORY, VICTIM, TUTORIAL };
