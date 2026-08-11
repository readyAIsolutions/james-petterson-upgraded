'use strict';
/**
 * Shared database instance for the application.
 *
 * Wraps the node:sqlite layer (see ./db.js) behind a small repository API so
 * routes and services never touch raw SQL directly. Swap ./db.js internals for
 * a Postgres/Supabase client later without touching callers.
 */
const { createDatabase } = require('./db');

let _db = null;
function getDb() {
  if (!_db) _db = createDatabase();
  return _db;
}

// For test injection
function setDb(instance) {
  _db = instance;
}

module.exports = { getDb, setDb, createDatabase };
