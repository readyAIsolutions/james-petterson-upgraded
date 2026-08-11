'use strict';
/**
 * clear-case-lib.js - Remove generated library cases (keep hand-crafted case-001).
 * Deletes child rows first to satisfy foreign keys.
 * Usage: node src/scripts/clear-case-lib.js
 */
const path = require('node:path');
const { setDb } = require('../shared/database');
const { createDatabase } = require('../shared/db');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'detective.db');
const db = createDatabase(DB_PATH);
setDb(db);
db.exec('PRAGMA foreign_keys = OFF;');

const lib = db.prepare("SELECT id FROM cases WHERE id LIKE 'case-lib-%'").all().map((r) => r.id);
console.log('library cases to clear:', lib.length);
if (lib.length === 0) { console.log('nothing to clear'); process.exit(0); }

const placeholders = lib.map(() => '?').join(',');
const childByCase = ['locations', 'facts', 'characters', 'events', 'evidence', 'lies', 'relationships'];
let child = 0;
for (const t of childByCase) {
  try {
    const r = db.prepare(`DELETE FROM ${t} WHERE case_id IN (${placeholders})`).run(...lib);
    child += r.changes;
  } catch (e) { console.log(`  (skip ${t}: ${e.message})`); }
}

// Sessions and their children reference case_id too
try { db.prepare(`DELETE FROM sessions WHERE case_id IN (${placeholders})`).run(...lib); } catch (e) {}
try { db.prepare(`DELETE FROM accusations WHERE session_id NOT IN (SELECT id FROM sessions)`).run(); } catch (e) {}
try { db.prepare(`DELETE FROM discoveries WHERE session_id NOT IN (SELECT id FROM sessions)`).run(); } catch (e) {}
try { db.prepare(`DELETE FROM interviews WHERE session_id NOT IN (SELECT id FROM sessions)`).run(); } catch (e) {}
try { db.prepare(`DELETE FROM hypothesis_edges WHERE session_id NOT IN (SELECT id FROM sessions)`).run(); } catch (e) {}

const r = db.prepare(`DELETE FROM cases WHERE id IN (${placeholders})`).run(...lib);
console.log(`deleted ${child} child rows + ${r.changes} lib cases`);
db.exec('PRAGMA foreign_keys = ON;');
console.log('done');
