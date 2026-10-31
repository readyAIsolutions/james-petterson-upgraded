'use strict';
/**
 * Server entry point. Builds the app factory and starts listening.
 */
const dotenv = require('dotenv');
const path = require('node:path');
// override: the project .env is the source of truth for THIS app. Without it,
// a stray OPENROUTER_API_KEY inherited from the launching environment (e.g.
// a 13-char placeholder) would silently shadow the real key and the AI NPCs
// would 401 all day while looking "configured".
dotenv.config({ path: path.join(__dirname, '..', '.env'), override: true });

const { createApp } = require('./app');
const { getDb } = require('./shared/database');
const { AIGateway } = require('./services/ai-gateway');
const CaseRepository = require('./services/case-repository');
const GameSessionService = require('./services/game-session');
const { NPCOrchestrator } = require('./services/npc-orchestrator');
const { CaseGenerator } = require('./services/case-generator');

// Robustness: never let an unhandled rejection crash the process. Log it and
// keep serving — an LLM/IO hiccup must not take the whole server down.
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason instanceof Error ? reason.stack : reason);
});

// Seed reference cases on boot (idempotent).
function seed() {
  const { getCanon } = require('./data/canon');
  for (const { id, manifest } of getCanon()) {
    try {
      CaseRepository.save({ id, title: manifest.title, difficulty: manifest.difficulty, manifest });
    } catch (e) {
      console.error(`[seed] failed to save ${id}: ${e.message}`);
    }
  }
  // Deprecate the old LLM-generated quick cases: they were authored against
  // the earlier, unfair template (killer alone with victim, culprit named in
  // the fact values) and violate the fair-play gates. They remain in the DB
  // (visible via include_drafts) but are hidden from players.
  try {
    const { getDb } = require('./shared/database');
    getDb().prepare(`UPDATE cases SET status = 'draft' WHERE id LIKE 'case-lib-%' AND status = 'published'`).run();
  } catch (e) {
    console.error('[seed] case-lib deprecation error:', e.message);
  }
}

function build() {
  const db = getDb();
  const aiGateway = new AIGateway();
  const caseRepo = CaseRepository;
  const sessionService = GameSessionService;
  const npcOrchestrator = new NPCOrchestrator(aiGateway, caseRepo);
  const caseGenerator = new CaseGenerator(aiGateway);

  // Ops visibility: confirm whether the AI gateway is live at boot (never the key itself).
  console.log(`[gateway] ${process.env.OPENROUTER_API_KEY ? `OPENROUTER key present (len ${process.env.OPENROUTER_API_KEY.length}) — live AI NPCs` : 'OPENROUTER key MISSING — scripted NPCs (set OPENROUTER_API_KEY in .env)'}`);

  const app = createApp({ db, aiGateway, sessionService, npcOrchestrator, caseRepo, caseGenerator });
  return app;
}

// Only start listening when run directly (not when required by tests).
if (require.main === module) {
  seed();
  const app = build();
  const PORT = process.env.PORT || 8765;
  app.listen(PORT, () => {
    console.log(`AI Detective Platform listening on :${PORT}`);
    if (!process.env.OPENROUTER_API_KEY) {
      console.log('  [ai-gateway] offline mode (no OPENROUTER_API_KEY) — deterministic NPCs active');
    }
  });
}

module.exports = { build, seed };
