# Architecture — AI Detective Platform

**Status:** Draft v0.1 · **Runtime:** Node.js 22 + Express + `node:sqlite` backend, Vite + React + ReactFlow frontend.

This document describes the **actual running components** in the repo and where they live, plus the logical request flow. It does not describe planned-but-unshipped services.

---

## 1. System Context (Logical Flow)

```
 Browser (React SPA)
        │  HTTP / JSON
        ▼
 ┌───────────────┐   Auth (JWT)   ┌──────────────────┐
 │  API Gateway   │ ─────────────▶ │  Auth Service     │
 │  Express app   │   src/routes/  │  src/routes/auth  │
 │  src/app.js     │   auth.js      │  bcrypt + JWT     │
 └───────────────┘                └──────────────────┘
        │
        ├──▶ Game Session Service ──▶ Case Service ──▶ Evidence / Timeline
        │     src/services/          src/services/      (manifest → DB)
        │     game-session.js        case-repository.js
        │
        └──▶ NPC Orchestrator ──▶ AI Gateway ──▶ Model provider (OpenRouter)
              src/services/           src/services/      HTTPS → openrouter.ai
              npc-orchestrator.js     ai-gateway.js     (or deterministic offline)
                                        │
                                        └──▶ telemetry → ai_calls table

Parallel build-time pipeline:
   Case Generator ──▶ Case Validator ──▶ publish (validator gate)
   src/services/        src/services/
   case-generator.js    case-validator.js

Everything reads/writes the shared SQLite store via src/shared/database.js → src/shared/db.js.
```

## 2. Runtime components and where they live

### 2.1 Server entry point — `src/index.js`
Loads `.env`, builds the app factory, seeds the reference case on boot (idempotent), listens on port `8765` by default. Registers a global `unhandledRejection` handler so a single LLM/IO hiccup never crashes the process. Prints a warning when running in offline AI mode.

### 2.2 API Gateway / App factory — `src/app.js`
`createApp(...)` assembles the Express app from injected services (DB, AI gateway, session service, NPC orchestrator, case repo, case generator). Exposes:

- **Health / meta** — `GET /health`
- **Case API** — `GET /api/cases`, `GET /api/cases/:id`, `POST /api/cases/:id/load`, `GET /api/cases/:id/status`
- **Validation (core IP)** — `POST /api/validate` runs `CaseValidator`
- **Session API** — `POST /api/sessions`, `GET /api/sessions/:id`, briefing, inventory, discovery, hypothesis, accuse
- **NPC API** — `POST /api/sessions/:id/interview` → `NpcOrchestrator.respond`
- **Generator API** — `POST /api/cases/generate` → `CaseGenerator.generateFromPremise`
- **Auth** — mounts `src/routes/auth.js` under `/api`

It is intentionally a **factory**, not a singleton, so tests spin up fresh instances against an isolated in-memory DB.

### 2.3 Auth service — `src/routes/auth.js`
Register / login / logout / me / admin promote. bcrypt password hashing, JWT via `jsonwebtoken` (24h expiry). Hard rules enforced in code:
- Privilege is never read from a client payload; `is_admin` is only set server-side via the authenticated `/promote` endpoint.
- In production `JWT_SECRET` must be set in the environment or the process refuses to start.

### 2.4 Data layer — `src/shared/db.js` + `src/shared/database.js`
`node:sqlite` (`DatabaseSync`) with WAL journaling and foreign keys on. Schema (see ADR-001, ADR-004): `users`, `cases`, `locations`, `characters`, `facts`, `character_knowledge`, `events`, `evidence`, `relationships`, `lies`, `sessions`, `discoveries`, `interviews`, `hypothesis_edges`, `accusations`, `ai_calls`. `database.js` wraps it behind a tiny repository API (`getDb`/`setDb`) so routes never touch raw SQL and the DB engine can be swapped later.

### 2.5 Game Session Service — `src/services/game-session.js`
Authoritative player progress: start/resume a session, briefing, discovery (evaluation of `unlock_rules`), inventory, hypothesis edges, and the **final accusation + deterministic score**. All state mutations are deterministic and transactional (dual-write of session JSON + ledger rows).

### 2.6 Case Service / Repository — `src/services/case-repository.js`
Reads/writes immutable, versioned canonical case manifests. Enforces per-case **id namespacing** (`<caseId>#<localId>`) in the DB so generated cases reusing local ids like `char_s0` or `fact_motive` never collide (ADR-004). Computes a SHA-256 `canonical_hash` on save.

### 2.7 Evidence / Timeline
Not a separate service — evidence and events are canonical sections of the manifest surfaced through the Case Service and consumed by the Game Session Service (`discoverableEvidence`, timeline reconstruction). The reference case fixture is `src/data/case-001.js`.

### 2.8 NPC Orchestrator — `src/services/npc-orchestrator.js`
A **controlled agent, not a free chatbot**. Each response is assembled from character identity + public profile, the knowledge slice, emotional state, current lie strategy, and presented evidence. The model returns structured JSON `(spoken_text, emotion_delta, disclosed_fact_ids, referenced_evidence_ids, lie_id, confidence)`, and the server **validates every field against canonical state** — unpermitted disclosures are struck and flagged. Hybrid: deterministic offline handler when there is no API key.

### 2.9 AI Gateway — `src/services/ai-gateway.js`
The OpenRouter-compatible routing abstraction (ADR-003). Handles model routing, retries/timeouts, token/cost budgeting, in-memory caching, structured JSON mode, telemetry (persisted to `ai_calls`), and a **deterministic scripted fallback** when `OPENROUTER_API_KEY` is absent so the whole platform is testable offline.

### 2.10 Parallel build pipeline — `src/services/case-generator.js` + `case-validator.js`
- **Case Generator** builds structured cases per the blueprint pipeline: premise → ground truth → timeline → cast+motive → evidence → knowledge slices → lies → validate → publish. It drafts a premise through the AI gateway (or a deterministic template set offline) and assembles the manifest.
- **Case Validator** proves solvability *before* publication: **timeline** (no impossible time overlaps), **access** (culprit can reach crime/weapon), **provenance** (every clue maps to a real fact), **fairness** (critical inference chain discoverable), **red‑herring integrity** (resolvable), **culprit support** (one clear culprit, rivals rejected). Rejected manifests are never published (`POST /api/cases/generate` returns 422).

### 2.11 Frontend — `frontend/`
Vite + React + ReactFlow SPA. `vite.config.js` proxies `/health` and `/api` to `http://localhost:8765`. Screens under `frontend/src/screens/`:

- `Landing.jsx` — health + start a case
- `Play.jsx` — session shell; view names order `briefing → scene → board → timeline → suspects → interview → accuse → debrief`
- `Scene.jsx` — observe & collect, `Board.jsx` — ReactFlow evidence board, `Timeline.jsx` — reconstruct events, `Suspects.jsx` — cast list, `Interview.jsx` — interrogate, `Accusation.jsx` — accuse, `Debrief.jsx` — score recap, `Briefing.jsx` — case briefing
- `api.js` — typed client against the Express API

## 3. Cross-cutting concerns

- **Truth-Before-Language (ADR-004)** — canonical facts are immutable in the DB; the LLM only touches presentation and is validated against canonical state everywhere (generator, NPC orchestrator).
- **Determinism of scoring (ADR-005)** — accusations are scored by `GameSessionService.score()` against canonical manifest data, not by an LLM.
- **Zero external-state dependency (ADR-001)** — node:sqlite file DB, no daemon, no extra software; a single reference case seeds on boot.
- **Offline testability (ADR-003)** — the entire vertical slice runs deterministically with no API key and 25 passing tests.

## 4. Not-yet-shipped (leftover deps, not running components)

`package.json` lists `pg`, `redis`, `socket.io`, and `uuid` as dependencies, and `src/shared/redis.js` exists — but **none of them are wired into the running request path** (the live stack uses `node:sqlite`, Express, bcryptjs, jsonwebtoken, dotenv). They are transitional/legacy; see ADR-001 for the Postgres swap-out path.