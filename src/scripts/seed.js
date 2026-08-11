'use strict';
/**
 * Seeds reference cases into the local SQLite DB and validates them.
 * Usage: node src/scripts/seed.js
 */
const CaseRepository = require('../services/case-repository');
const { CaseValidator } = require('../services/case-validator');
const case001 = require('../data/case-001');

const series = [
  { id: case001.id, ...case001.manifest },
];

function main() {
  console.log('AI Detective Platform — Case Seeder & Validator\n');
  const validator = new CaseValidator();
  let allValid = true;

  for (const item of series) {
    const { id, ...manifest } = item;
    console.log(`== ${id}: ${manifest.title} ==`);
    const result = validator.validate(manifest);
    if (!result.valid) allValid = false;
    for (const [name, check] of Object.entries(result.checks)) {
      console.log(`   [${check.pass ? 'PASS' : 'FAIL'}] ${name} — ${check.detail}`);
    }
    if (result.errors.length) {
      console.log('   errors:');
      result.errors.forEach(e => console.log(`     - ${e}`));
    }
    if (result.valid) {
      const saved = CaseRepository.save({ id, title: manifest.title, difficulty: manifest.difficulty, manifest });
      console.log(`   saved -> canonical_hash ${saved.canonicalHash.slice(0, 16)}...`);
    } else {
      console.log('   NOT SAVED (failed validation)');
    }
    console.log('');
  }

  console.log(allValid ? 'ALL CASES VALID ✔' : 'VALIDATION FAILURES PRESENT ✘');
  process.exit(allValid ? 0 : 1);
}

main();
