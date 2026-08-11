'use strict';
/**
 * solve-cases.js - Run the deterministic adversarial CaseSolver against every
 * published case in the DB and report whether each case is solvable purely
 * from discoverable evidence. Exits non-zero if any published case is flagged
 * unsolvable (impossible), trivial, or ambiguous.
 *
 * Usage: node src/scripts/solve-cases.js
 */
const path = require('node:path');
const { setDb } = require('../shared/database');
const { createDatabase } = require('../shared/db');
const CaseRepository = require('../services/case-repository');
const { CaseSolver } = require('../services/case-solver');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'detective.db');
setDb(createDatabase(DB_PATH));

function main() {
  const solver = new CaseSolver();
  const cases = CaseRepository.list(true); // published only
  console.log(`\nAdversarial case solver — ${cases.length} published case(s)\n`);

  const rows = cases.map((c) => {
    let manifest = null;
    let err = null;
    try {
      manifest = CaseRepository.load(c.id);
    } catch (e) {
      err = e;
    }
    if (!manifest) {
      return { id: c.id, title: c.title, solvable: false, ok: false, reasons: [`load failed: ${err ? err.message : 'null manifest'}`] };
    }
    const res = solver.solve(manifest);
    return { id: c.id, title: c.title, solvable: res.solvable, ok: res.ok, reasons: res.reasons };
  });

  // Table header
  const cols = { id: 14, title: 26, status: 9, reasons: 1 };
  const pad = (s, w) => String(s).padEnd(w);
  console.log(
    `${pad('case', cols.id)} ${pad('title', cols.title)} ${pad('status', cols.status)} reasons`
  );
  console.log('-'.repeat(100));

  let unsolvable = 0;
  for (const r of rows) {
    const status = r.ok && r.solvable ? 'SOLVABLE' : r.ok ? 'UNSOLVABLE' : 'MALFORMED';
    if (!r.solvable) unsolvable++;
    const reasonText = r.reasons.length ? r.reasons.join(' | ') : '(no flags)';
    console.log(`${pad(r.id, cols.id)} ${pad(r.title.slice(0, cols.title - 1), cols.title)} ${pad(status, cols.status)} ${reasonText}`);
  }

  console.log('\nSummary:');
  console.log(`  total         : ${rows.length}`);
  console.log(`  solvable      : ${rows.length - unsolvable}`);
  console.log(`  flagged       : ${unsolvable}`);

  try {
    const db = createDatabase();
    db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
  } catch (e) { /* ignore */ }

  if (unsolvable > 0) {
    console.log('\n✘ Some published cases failed the adversarial solver. See reasons above.');
    process.exit(1);
  }
  console.log('\n✔ All published cases are solvable from discoverable evidence.');
  process.exit(0);
}

main();