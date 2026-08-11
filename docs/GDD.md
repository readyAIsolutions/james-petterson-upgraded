# Game Design Document — AI Detective Platform

**Status:** Draft v0.1 · **Owner:** Game Design + Core Systems · **Repo:** `ai-detective-platform`

---

## 1. Concept

The AI Detective Platform lets a single player step into the role of a **player­-investigator** working a solvable mystery. Our core fantasy is that the puzzle is *honest*: the truth is fixed and discoverable, and the AI characters — even though they are generated live — can never break that truth. This is the **Truth-Before-Language** invariant: canonical facts are immutable, and the LLM is only ever the *presentation layer*.

The platform is **AI-native** in the sense that cases are authored/generated and NPCs answer dialogue through an LLM router — but it is **deterministic at the core**. The rules of the mystery (who, how, why, in what order) are plain data, validated before a case may ever ship.

## 2. The Core Loop

```
OBSERVE → COLLECT → CONNECT → INTERROGATE → TEST → RECONSTRUCT → ACCUSE → EXPLAIN
```

1. **OBSERVE** — Enter the scene, read the briefing and the environment.
2. **COLLECT** — Discover evidence (gated by `unlock_rules` in the manifest).
3. **CONNECT** — Place evidence and causal links on the evidence board (hypothesis edges).
4. **INTERROGATE** — Question suspects/witnesses; the NPC only answers from its permitted knowledge slice.
5. **TEST** — Present evidence to crack a lie or confirm a link.
6. **RECONSTRUCT** — Reorder events on the timeline to match what actually happened.
7. **ACCUSE** — Name a culprit, motive, method, and timeline order.
8. **EXPLAIN** — Receive a deterministic score and debrief.

These map directly to our frontend screens (`frontend/src/screens/`): `Scene` (observe/collect), `Board` (connect), `Interview` (interrogate/test), `Timeline` (reconstruct), `Accusation` (accuse), and `Debrief` (explain). The view order in `Play.jsx` is `briefing → scene → board → timeline → suspects → interview → accuse → debrief`.

## 3. Player-Investigator Fantasy

The player is not a spectator and not a puppet — they are the investigator. That means:

- **You read the world, not a walkthrough.** Evidence is discoverable in-world, gated by what you have done (e.g. briefing seen, inspection capability).
- **You interrogate, and characters have limits.** A suspect answers only from what they legitimately know (`character_knowledge`, `can_disclose`). They can lie (`lies`), and a lie has triggers that crack it.
- **You build the case.** Your hypothesis edges on the evidence board and your timeline order are your own reconstruction, persisted so you can return to them.
- **Your final accusation is judged by rules, not by an LLM's mood.** The score is deterministic (see ADR-005).

## 4. The Four Questions

Every solvable case is defined by four questions the player must be able to answer from on-paper inferable evidence:

| # | Question | Canonical backing | Enforced by |
|---|----------|-------------------|-------------|
| 1 | **What happened?** | `facts` (canonical truth), `events` (timeline), causal parent chain | `CaseValidator` timeline + fairness gates |
| 2 | **Who is lying?** | `lies`, `character_knowledge` | `CaseValidator` red-herring integrity; `NpcOrchestrator` validation |
| 3 | **What proves it?** | `evidence.fact_links` → `facts` | `CaseValidator` provenance gate |
| 4 | **Can I reconstruct it to convict?** | culprit + motive + method + timeline all match canonical state | `GameSessionService.score` (deterministic) |

The fairness guarantee is that a player who finds *all* relevant evidence and reason carefully **can** answer all four and reach the top score.

## 5. Player Fantasy × System Reality (Single Player, One Case)

The alpha ambition is deliberately narrow: **a user can start and finish a case solo**, and one hand-authored reference case is fully solvable purely from discoverable evidence. There is no multiplayer, no lobbies, no DLC economy in scope. Everything below this line is *not* invented features — it is what exists in the repo today.

## 6. MVP Acceptance Criteria

The alpha is "done" when all of the following hold. Each criterion is backed by a real capability in the codebase.

1. **A user can start and finish a case solo.** `POST /api/sessions` starts/resumes a session; `POST /api/sessions/:id/accuse` completes it with `status='completed'` and a stored score. (routes in `src/app.js`, engine in `src/services/game-session.js`).
2. **At least one case is solvable purely from discoverable evidence.** `src/data/case-001.js` ("The Clock Strikes at Eight") passes every validator gate; the test suite asserts `validate(case001.manifest).valid === true`.
3. **NPCs stay inside their knowledge bounds across a regression run.** `src/services/npc-orchestrator.js` validates every structured response against canonical state; a response that tries to disclose an unpermitted fact is struck and flagged (`rejected`). The deterministic offline handler is knowledge-bounded and covered by tests.
4. **The evidence board + timeline persist.** Hypothesis edges live in `sessions.state.hypothesisEdges` and are mirrored to the `hypothesis_edges` table; poisoning via node:sqlite round-trips (ADR-001/ADR-004).
5. **An accusation is deterministically scored.** `GameSessionService.score()` computes culprit 30 / motive 15 / method 15 / timeline 20 / evidence 15 (== 95 ceiling; efficiency 5 reserved — see code comment and ADR-005).
6. **A generated case must pass the validator before it can be published.** `POST /api/cases/generate` returns HTTP 422 with `errors` if `CaseValidator` rejects the generated manifest; a passing case returns `{ ok: true, case }`.
7. **An admin can see canonical vs player-visible truth.** Canonical fact values are stored distinctly (`facts.canonical_value`, `visibility`); the DB keeps canonical state separate from any presentation the LLM produces, so the two can be diffed (ADR-004).

## 7. Content Model (Canonical Case Manifest)

A case is a self-contained, versioned JSON manifest:

- `settings` — crime/weapon location, `multi_culprit`, narration style
- `locations` — scenes the player can observe
- `characters` — victim, suspects, witnesses; `is_culprit`, `motive`, `public_profile`
- `facts` — **canonical truth**, each with a `category` (`critical` / `conclusion` / `forensic` / `alibi` / …)
- `knowledge` — per-character slices: which facts each NPC knows, certainty, `can_disclose`
- `events` — timeline with start/end, actors, `is_public`, `causal_parent`
- `evidence` — discoverable items; `fact_links` to canonical facts; `unlock_rules`
- `lies` — cover stories per character, `triggers` that crack them
- `relationships` — character/entity graph

The hand-authored reference case (`case-001.js`) is the ground-truth fixture used by every team.

## 8. Production-Readiness Boundary (out of alpha scope)

The alpha is a local, single-process, zero-additional-service platform. A production deployment will revisit: Postgres/Supabase swap-out (ADR-001), persistent pub/sub / sockets, multi-user mediation, and cost/token budgeting at scale. Those are documented as decision records, not shipped features.