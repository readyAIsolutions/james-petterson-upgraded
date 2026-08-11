'use strict';
/**
 * build-case-library.js - Generate and persist a library of validated cases.
 * Usage: node src/scripts/build-case-library.js [count] [startIndex]
 *   - generates N cases via the CaseGenerator (deterministic/offline)
 *   - validates each; only persisted if it passes every gate
 *   - writes a manifest-of-cases JSON for the front end
 */
const path = require('node:path');
const fs = require('node:fs');
const { setDb } = require('../shared/database');
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
  const gen = new CaseGenerator(new AIGateway()); // offline
  const validator = new CaseValidator();
  const out = [];

  const settings = [
    { genre: 'murder', setting: 'a foggy Victorian harbour town', difficulty: 'easy' },
    { genre: 'poison', setting: 'a secluded country manor', difficulty: 'medium' },
    { genre: 'heist', setting: 'a glittering city casino', difficulty: 'hard' },
    { genre: 'disappearance', setting: 'a snowy mountain resort', difficulty: 'medium' },
    { genre: 'fraud', setting: 'a prestigious law firm', difficulty: 'hard' },
    { genre: 'locked_room', setting: 'an old lighthouse', difficulty: 'hard' },
  ];

  let generated = 0, validated = 0;
  while (validated < count) {
    const s = settings[generated % settings.length];
    const res = await gen.generateFromPremise({ ...s });
    generated++;
    if (!res.ok) continue;

    const v = validator.validate(res.case);
    if (!v.valid) continue;

    const id = `case-lib-${String(startIdx + validated).padStart(3, '0')}`;
    const saved = CaseRepository.save({ id, title: res.case.title, difficulty: res.case.difficulty, manifest: res.case });
    out.push({ id, title: res.case.title, difficulty: res.case.difficulty, status: 'published' });
    validated++;
    process.stdout.write(`  [${validated}/${count}] ${id} ${res.case.title} @${res.case.difficulty}\n`);
  }

  // Write library index for the front end.
  const indexPath = path.join(__dirname, '..', '..', 'data', 'case-library.json');
  fs.writeFileSync(indexPath, JSON.stringify({ updated: new Date().toISOString(), cases: out }, null, 2));
  console.log(`\nGenerated ${generated} candidates; validated & published ${validated}.`);
  console.log(`Library index: ${indexPath}`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
