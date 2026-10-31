'use strict';
/**
 * Database layer for the AI Detective Platform.
 *
 * Uses Node's built-in `node:sqlite` (zero external dependencies, fully open
 * source, no daemon). A thin repository layer keeps the door open to swap to
 * Postgres/Supabase in production.
 *
 * The schema mirrors the blueprint's "Minimum Database Model" and enforces the
 * critical principle: TRUTH BEFORE LANGUAGE. Canonical state (culprit, event
 * timestamps, weapon, causal chain) is stored immutably here; LLMs only ever
 * touch the presentation layer and are validated against this.
 */
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const DB_PATH = process.env.DB_PATH
  ? process.env.DB_PATH
  : path.join(__dirname, '..', '..', 'data', 'detective.db');

// Ensure data dir exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// Let callers inject a shared instance (tests use :memory:)
function createDatabase(filename = DB_PATH) {
  const db = new DatabaseSync(filename);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  migrate(db);
  return db;
}

function migrate(db) {
  db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    handle        TEXT NOT NULL UNIQUE,
    email         TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    entitlement   TEXT NOT NULL DEFAULT 'player',
    settings      TEXT,
    is_admin      INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    last_login    TEXT
  );

  CREATE TABLE IF NOT EXISTS cases (
    id              TEXT PRIMARY KEY,
    version         TEXT NOT NULL DEFAULT 'v1',
    title           TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'draft',
    difficulty      TEXT NOT NULL DEFAULT 'medium',
    seed            TEXT,
    canonical_hash  TEXT,
    premise         TEXT,
    description     TEXT,
    game_master_prompt TEXT,
    settings        TEXT,
    culprit_id      TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(id, version)
  );

  CREATE TABLE IF NOT EXISTS locations (
    id          TEXT PRIMARY KEY,
    case_id     TEXT NOT NULL,
    name        TEXT NOT NULL,
    description TEXT,
    scene_meta  TEXT,
    FOREIGN KEY (case_id) REFERENCES cases(id)
  );

  CREATE TABLE IF NOT EXISTS characters (
    id             TEXT PRIMARY KEY,
    case_id        TEXT NOT NULL,
    slug           TEXT,
    name           TEXT NOT NULL,
    role           TEXT NOT NULL DEFAULT 'witness',
    motive         TEXT,
    traits         TEXT,
    public_profile TEXT,
    is_culprit     INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (case_id) REFERENCES cases(id)
  );

  -- Canonical facts. This is the immutable TRUE state of the case.
  CREATE TABLE IF NOT EXISTS facts (
    id              TEXT PRIMARY KEY,
    case_id         TEXT NOT NULL,
    canonical_value TEXT NOT NULL,
    visibility      TEXT NOT NULL DEFAULT 'secret',
    category        TEXT NOT NULL DEFAULT 'general',
    FOREIGN KEY (case_id) REFERENCES cases(id)
  );

  -- What each character knows/believes about facts (knowledge slice).
  CREATE TABLE IF NOT EXISTS character_knowledge (
    character_id TEXT NOT NULL,
    fact_id      TEXT NOT NULL,
    certainty    REAL NOT NULL DEFAULT 1.0,
    source       TEXT,
    can_disclose INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (character_id, fact_id),
    FOREIGN KEY (character_id) REFERENCES characters(id),
    FOREIGN KEY (fact_id) REFERENCES facts(id)
  );

  -- Event timeline. Start/end times are canonical.
  CREATE TABLE IF NOT EXISTS events (
    id            TEXT PRIMARY KEY,
    case_id       TEXT NOT NULL,
    start_time    TEXT NOT NULL,
    end_time      TEXT NOT NULL,
    location_id   TEXT,
    title         TEXT,
    description   TEXT,
    actors        TEXT,   -- JSON array of character ids
    causal_parent TEXT,
    is_public     INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (case_id) REFERENCES cases(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
  );

  -- Evidence the player can find. Unlock rules gate discovery.
  CREATE TABLE IF NOT EXISTS evidence (
    id            TEXT PRIMARY KEY,
    case_id       TEXT NOT NULL,
    type          TEXT NOT NULL,
    location_id   TEXT,
    title         TEXT NOT NULL,
    description   TEXT,
    fact_links    TEXT,   -- JSON array of fact ids this evidence supports
    unlock_rules  TEXT,   -- JSON
    meta          TEXT,
    FOREIGN KEY (case_id) REFERENCES cases(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
  );

  -- Relationship graph between characters / entities.
  CREATE TABLE IF NOT EXISTS relationships (
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    type      TEXT NOT NULL,
    strength  REAL NOT NULL DEFAULT 0.5,
    case_id   TEXT NOT NULL,
    PRIMARY KEY (source_id, target_id, type),
    FOREIGN KEY (case_id) REFERENCES cases(id)
  );

  -- Character lies / cover stories. Never overwrite canonical facts.
  CREATE TABLE IF NOT EXISTS lies (
    id              TEXT PRIMARY KEY,
    character_id    TEXT NOT NULL,
    fact_id         TEXT,
    cover_story     TEXT,
    triggers        TEXT, -- JSON list of evidence types that crack this lie
    break_conditions TEXT,
    active          INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (character_id) REFERENCES characters(id)
  );

  -- Player game sessions.
  CREATE TABLE IF NOT EXISTS sessions (
    id           TEXT PRIMARY KEY,
    user_id      INTEGER,
    case_id      TEXT NOT NULL,
    case_version TEXT,
    state        TEXT,   -- JSON: discovered evidence, hypothesis edges
    score        REAL,
    status       TEXT NOT NULL DEFAULT 'active',
    started_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (case_id) REFERENCES cases(id)
  );

  -- Evidence discovery ledger.
  CREATE TABLE IF NOT EXISTS discoveries (
    session_id   TEXT NOT NULL,
    evidence_id  TEXT NOT NULL,
    discovered_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (session_id, evidence_id),
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (evidence_id) REFERENCES evidence(id)
  );

  -- Interview transcripts / snapshots.
  CREATE TABLE IF NOT EXISTS interviews (
    id             TEXT PRIMARY KEY,
    session_id     TEXT NOT NULL,
    character_id   TEXT NOT NULL,
    transcript_ref TEXT,
    state_snapshot TEXT,   -- JSON of NPC state at interview time
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (character_id) REFERENCES characters(id)
  );

  -- Player hypothesis edges (evidence board).
  CREATE TABLE IF NOT EXISTS hypothesis_edges (
    id          TEXT PRIMARY KEY,
    session_id  TEXT NOT NULL,
    source_node TEXT NOT NULL,
    target_node TEXT NOT NULL,
    relation    TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  );

  -- Final accusation + deterministic score.
  CREATE TABLE IF NOT EXISTS accusations (
    id          TEXT PRIMARY KEY,
    session_id  TEXT NOT NULL,
    culprit_id  TEXT,
    motive      TEXT,
    method      TEXT,
    timeline    TEXT,     -- JSON array of event order
    score       REAL,
    breakdown   TEXT,     -- JSON per-dimension scores
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  );

  -- Telemetry for every LLM call (cost / latency / tracing).
  CREATE TABLE IF NOT EXISTS ai_calls (
    id         TEXT PRIMARY KEY,
    session_id TEXT,
    purpose    TEXT,
    provider   TEXT,
    model      TEXT,
    tokens     INTEGER,
    latency_ms INTEGER,
    cost       REAL,
    trace_id   TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  `);

  // Idempotent column migrations for pre-existing dev DBs.
  const cols = db.prepare(`PRAGMA table_info(cases)`).all().map(c => c.name);
  if (!cols.includes('culprit_id')) {
    db.exec(`ALTER TABLE cases ADD COLUMN culprit_id TEXT;`);
  }
  // Full-manifest JSON column: preserves rich authoring fields (voice cards,
  // hints, clue maps, killer POV chapters, solutions, red-herring notes) that
  // the normalized child tables do not model. load() merges it over the rows.
  if (!cols.includes('manifest_full')) {
    db.exec(`ALTER TABLE cases ADD COLUMN manifest_full TEXT;`);
  }

  // Prevent duplicate active sessions for the same user+case (m3). A NULL
  // user_id (anonymous play) is distinct per SQLite UNIQUE semantics, which is
  // fine — the start() check-then-insert already guards the common case, and
  // this index makes the DB enforce it for authenticated users even across
  // concurrent processes.
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_active_per_user_case
      ON sessions(user_id, case_id) WHERE status = 'active';
  `);
}

module.exports = { createDatabase, DB_PATH };
