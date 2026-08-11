'use strict';
/**
 * build-case-library.js - Generate and persist a library of validated cases.
 * Usage: node src/scripts/build-case-library.js [count] [startIndex]
 *   - generates N cases via the CaseGenerator. Uses the live LLM when an
 *     OPENROUTER_API_KEY is present in .env; otherwise falls back to the
 *     deterministic offline templates.
 *   - validates each; only persisted if it passes every gate
 *   - writes a manifest-of-cases JSON for the front end
 */
const path = require('node:path');
const fs = require('node:fs');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { setDb, getDb } = require('../shared/database');
const { createDatabase } = require('../shared/db');
const { AIGateway } = require('../services/ai-gateway');
const { CaseGenerator } = require('../services/case-generator');
const { CaseValidator } = require('../services/case-validator');
const CaseRepository = require('../services/case-repository');

// Ensure a persistent DB for the platform.
const DB_PATH = path.join(__dirname, '..', '..', 'data', 'detective.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
setDb(createDatabase(DB_PATH));

async function main() {
  const count = Number(process.argv[2] || 10);
  const startIdx = Number(process.argv[3] || 0);
  const gateway = new AIGateway();
  const gen = new CaseGenerator(gateway); // live LLM if key present
  const validator = new CaseValidator();
  const out = [];

  const settings = [
    { genre: 'murder', setting: 'a crumbling Gothic manor', difficulty: 'easy' },
    { genre: 'poison', setting: 'a glamorous 1930s ocean liner', difficulty: 'medium' },
    { genre: 'heist', setting: 'a glittering city casino', difficulty: 'hard' },
    { genre: 'disappearance', setting: 'a snowy mountain resort', difficulty: 'medium' },
    { genre: 'fraud', setting: 'a prestigious law firm', difficulty: 'hard' },
    { genre: 'locked_room', setting: 'an old lighthouse', difficulty: 'hard' },
    { genre: 'arson', setting: 'a quiet suburban theatre', difficulty: 'easy' },
    { genre: 'kidnapping', setting: 'a coastal smuggling village', difficulty: 'medium' },
    { genre: 'murder', setting: 'a moonlit art auction house', difficulty: 'easy' },
    { genre: 'poison', setting: 'an opulent royal wedding banquet', difficulty: 'medium' },
    { genre: 'heist', setting: 'a high-speed Orient Express journey', difficulty: 'hard' },
    { genre: 'disappearance', setting: 'a silent monastery in the Alps', difficulty: 'medium' },
    { genre: 'fraud', setting: 'a grand national bank', difficulty: 'hard' },
    { genre: 'locked_room', setting: 'a magician\'s private studio', difficulty: 'hard' },
    { genre: 'arson', setting: 'a film studio backlot', difficulty: 'easy' },
    { genre: 'kidnapping', setting: 'a remote desert caravan stop', difficulty: 'medium' },
    { genre: 'murder', setting: 'a storm-battered island estate', difficulty: 'hard' },
    { genre: 'poison', setting: 'a Victorian botanical garden gala', difficulty: 'medium' },
    { genre: 'heist', setting: 'a frenzied carnival grounds', difficulty: 'easy' },
    { genre: 'disappearance', setting: 'an abandoned mining town', difficulty: 'hard' },
  ];

  let generated = 0, validated = 0;
  while (validated < count) {
    const s = settings[generated % settings.length];
    // Vary the seed-derived difficulty so titles/names differ across passes.
    const res = await gen.generateFromPremise({ ...s });
    generated++;
    if (!res.ok) continue;

    const v = validator.validate(res.case);
    if (!v.valid) continue;

    const id = `case-lib-${String(startIdx + validated).padStart(3, '0')}`;
    CaseRepository.save({ id, title: res.case.title, difficulty: res.case.difficulty, manifest: res.case });
    out.push({ id, title: res.case.title, difficulty: res.case.difficulty, status: 'published' });
    validated++;
    process.stdout.write(`  [${validated}/${count}] ${id} ${res.case.title} @${res.case.difficulty}\n`);
  }

  // Write library index for the front end.
  const indexPath = path.join(__dirname, '..', '..', 'data', 'case-library.json');
  fs.writeFileSync(indexPath, JSON.stringify({ updated: new Date().toISOString(), cases: out }, null, 2));
  console.log(`\nGenerated ${generated} candidates; validated & published ${validated}.`);
  console.log(`Library index: ${indexPath}`);
  // Force-checkpoint the WAL into the main .db before exiting, so all child rows
  // (not just the last write) are durable for other processes/connections.
  try {
    const db = getDb();
    db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
  } catch (e) { /* ignore */ }
  // Cache-flush and exit gently (not process.exit(0), which skips WAL checkpoint).
}

main().catch((e) => { console.error(e); process.exit(1); });
