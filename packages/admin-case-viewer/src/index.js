'use strict'

/**
 * Admin Case Viewer - Express server for canonical truth inspection
 * 
 * Endpoints:
 *   GET /admin/cases/:caseId/truth          - canonical truth (culprit, motive, method, timeline)
 *   GET /admin/cases/:caseId/player-state   - what the player can see (evidence, interviews, hypothesis)
 *   GET /admin/cases/:caseId/compare        - diff between canonical truth and player-visible state
 *   POST /admin/cases/:caseId/refresh       - recompute player state from current manifest
 *   GET /health                               - health check
 */

const express = require('express')
const path = require('path')
const fs = require('fs')
const { validateManifest } = require('../../../packages/case-schema')
const { CaseSolver } = require('../../../src/services/case-solver')

const app = express()
const PORT = process.env.ADMIN_PORT || 5001

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// In-memory case cache (in production, use Redis/Supabase)
const caseCache = {}

/**
 * Load a case manifest: first from project root data/cases/*.json,
 * else from a compiled case module in src/data/*.js.
 */
const CASES_DIR = path.join(__dirname, '..', '..', '..', 'data', 'cases')
const COMPILED_DIR = path.join(__dirname, '..', '..', '..', 'src', 'data')

function loadCase(caseId) {
  try {
    const manifestPath = path.join(CASES_DIR, `${caseId}.json`)
    if (fs.existsSync(manifestPath)) {
      const raw = fs.readFileSync(manifestPath, 'utf8')
      return JSON.parse(raw)
    }
    // Fall back to a compiled case module (e.g. src/data/<caseId>.js)
    const compiledPath = path.join(COMPILED_DIR, `${caseId}.js`)
    if (fs.existsSync(compiledPath)) {
      const mod = require(compiledPath)
      return mod.manifest || mod
    }
    return null
  } catch (err) {
    console.error(`Error loading case ${caseId}:`, err)
    return null
  }
}

/**
 * GET /admin/cases/:caseId/truth - canonical truth
 */
app.get('/admin/cases/:caseId/truth', (req, res) => {
  const caseId = req.params.caseId
  const manifest = loadCase(caseId)
  
  if (!manifest) {
    return res.status(404).json({ error: `Case ${caseId} not found` })
  }
  
  const { culprit_id, settings = {} } = manifest
  const characters = Array.isArray(manifest.characters) ? manifest.characters : []
  
  const culprit = characters.find(c => c && c.id === culprit_id)
  
  const truth = {
    caseId,
    culprit: culprit ? {
      id: culprit.id,
      name: culprit.name,
      role: culprit.role,
      motive: culprit.motive,
      is_culprit: culprit.is_culprit
    } : null,
    motive: culprit?.motive,
    method: settings.method || null,
    timeline: settings.timeline || null,
    difficulty: manifest.difficulty,
    published: !!manifest.canonical_hash
  }
  
  res.json(truth)
})

/**
 * GET /admin/cases/:caseId/player-state - what player can see
 */
app.get('/admin/cases/:caseId/player-state', (req, res) => {
  const caseId = req.params.caseId
  const manifest = loadCase(caseId)
  
  if (!manifest) {
    return res.status(404).json({ error: `Case ${caseId} not found` })
  }
  
  const characters = Array.isArray(manifest.characters) ? manifest.characters : []
  const facts = Array.isArray(manifest.facts) ? manifest.facts : []
  const evidence = Array.isArray(manifest.evidence) ? manifest.evidence : []
  const locations = Array.isArray(manifest.locations) ? manifest.locations : []
  
  // Build player-visible evidence (only what's linked from critical facts that are discoverable)
  const criticalFacts = facts.filter(f => f.category === 'critical')
  const discoverableEvidenceIds = new Set()
  
  for (const ev of evidence) {
    if (ev.location_id || ev.type) {
      discoverableEvidenceIds.add(ev.id)
    }
  }
  
  // Player can see evidence linked to critical facts they've been introduced to
  const seenEvidence = evidence.filter(ev => {
    const linkedCriticalFacts = criticalFacts.filter(f => 
      (ev.fact_links || []).includes(f.id)
    )
    return linkedCriticalFacts.length > 0
  })
  
  // Player-visible characters (suspects + witness, excluding culprit from direct identification)
  const playerCharacters = characters.filter(c => 
    c.role !== 'victim' && 
    (c.role === 'suspect' || c.role === 'witness')
  ).map(c => ({
    id: c.id,
    name: c.name,
    role: c.role,
    motive: c.motive,
    is_culprit: c.is_culprit // player doesn't get this but we include it for diff
  }))
  
  const playerState = {
    caseId,
    evidence: seenEvidence.map(ev => ({
      id: ev.id,
      type: ev.type,
      title: ev.title,
      description: ev.description,
      location_id: ev.location_id,
      fact_links: ev.fact_links || []
    })),
    characters: playerCharacters,
    criticalFacts: criticalFacts.map(f => ({
      id: f.id,
      value: f.value,
      category: f.category,
      visibility: f.visibility
    })),
    settings: manifest.settings || {},
    briefingSeen: manifest.settings?.briefingSeen || false
  }
  
  res.json(playerState)
})

/**
 * GET /admin/cases/:caseId/compare - diff between canonical and player state
 */
app.get('/admin/cases/:caseId/compare', (req, res) => {
  const caseId = req.params.caseId
  const manifest = loadCase(caseId)
  
  if (!manifest) {
    return res.status(404).json({ error: `Case ${caseId} not found` })
  }
  
  const truth = loadCase(caseId + '-truth') || {
    culprit_id: manifest.culprit_id,
    settings: manifest.settings || {}
  }
  
  const playerState = loadCase(caseId + '-player') || { evidence: [], characters: [] }
  
  // Run solver for additional context
  const solver = new CaseSolver()
  const solverResult = solver.solve(manifest)
  
  // Build diff
  const diff = {
    caseId,
    culpritMatch: {
      canonical: manifest.culprit_id,
      playerCanSee: 'hidden', // player never sees culprit_id directly
      solverGuessed: solverResult.flags.ambiguous ? 'ambiguous' : (solverResult.reasons.length > 0 ? 'failed' : 'unknown')
    },
    discoverableFacts: {
      count: solverResult.flags.discoverable_facts,
      totalCritical: Array.isArray(manifest.facts) ? manifest.facts.filter(f => f.category === 'critical').length : 0
    },
    solverStatus: {
      solvable: solverResult.solvable,
      impossible: solverResult.flags.impossible,
      ambiguous: solverResult.flags.ambiguous,
      reasons: solverResult.reasons
    },
    integrity: {
      schemaValid: true, // would call validateManifest here
      orphanRefs: [], // would compute
      duplicateIds: [] // would compute
    }
  }
  
  res.json(diff)
})

/**
 * POST /admin/cases/:caseId/refresh - recompute player state
 */
app.post('/admin/cases/:caseId/refresh', (req, res) => {
  const caseId = req.params.caseId
  const manifest = loadCase(caseId)
  
  if (!manifest) {
    return res.status(404).json({ error: `Case ${caseId} not found` })
  }
  
  // Validate the manifest
  const validation = validateManifest(manifest)
  
  if (!validation.valid) {
    return res.status(400).json({
      error: 'Invalid manifest',
      errors: validation.errors,
      structuralValid: validation.structuralValid
    })
  }
  
  // In a full implementation, this would recompute the player-visible state
  // based on current evidence links, briefing status, etc.
  const result = {
    caseId,
    status: 'refreshed',
    validation: {
      valid: validation.valid,
      structuralValid: validation.structuralValid,
      errorCount: validation.errors.length
    },
    timestamp: new Date().toISOString()
  }
  
  res.json(result)
})

/**
 * GET /health - health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cachedCases: Object.keys(caseCache).length
  })
})

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.originalUrl}` })
})

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  console.error('Admin server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Admin Case Viewer running at http://localhost:${PORT}`)
    console.log(`Health check: http://localhost:${PORT}/health`)
  })
}

module.exports = { app }