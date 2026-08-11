'use strict';
/**
 * Server entry point. Builds the app factory and starts listening.
 */
const dotenv = require('dotenv');
const path = require('node:path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { createApp } = require('./app');
const { getDb } = require('./shared/database');
const { AIGateway } = require('./services/ai-gateway');
const CaseRepository = require('./services/case-repository');
const GameSessionService = require('./services/game-session');
const { NPCOrchestrator } = require('./services/npc-orchestrator');
const { CaseGenerator } = require('./services/case-generator');

// Seed reference cases on boot (idempotent).
function seed() {
  const { id, manifest } = require('./data/case-001');
  CaseRepository.save({ id, title: manifest.title, difficulty: manifest.difficulty, manifest });
}

function build() {
  const db = getDb();
  const aiGateway = new AIGateway();
  const caseRepo = CaseRepository;
  const sessionService = GameSessionService;
  const npcOrchestrator = new NPCOrchestrator(aiGateway, caseRepo);
  const caseGenerator = new CaseGenerator(aiGateway);

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
