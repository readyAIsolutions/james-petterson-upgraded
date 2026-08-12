'use strict'

const request = require('supertest')
const { app } = require('../src/index')

describe('Admin Case Viewer', () => {
  describe('Health check', () => {
    it('GET /health returns ok status', async () => {
      const res = await request(app).get('/health')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
      expect(res.body.timestamp).toBeDefined()
      expect(res.body.uptime).toBeDefined()
    })
  })

  describe('Case not found', () => {
    it('GET /admin/cases/nonexistent/truth returns 404', async () => {
      const res = await request(app).get('/admin/cases/nonexistent/truth')
      expect(res.status).toBe(404)
      expect(res.body.error).toBeDefined()
    })

    it('GET /admin/cases/nonexistent/player-state returns 404', async () => {
      const res = await request(app).get('/admin/cases/nonexistent/player-state')
      expect(res.status).toBe(404)
    })

    it('GET /admin/cases/nonexistent/compare returns 404', async () => {
      const res = await request(app).get('/admin/cases/nonexistent/compare')
      expect(res.status).toBe(404)
    })
  })

  describe('GET /admin/cases/:caseId/truth', () => {
    it('returns canonical truth for a valid case', async () => {
      const res = await request(app).get('/admin/cases/case-001/truth')
      expect(res.status).toBe(200)
      expect(res.body.caseId).toBe('case-001')
      expect(res.body.culprit).toBeDefined()
      expect(res.body.difficulty).toBeDefined()
    })
  })

  describe('GET /admin/cases/:caseId/player-state', () => {
    it('returns player-visible state for a valid case', async () => {
      const res = await request(app).get('/admin/cases/case-001/player-state')
      expect(res.status).toBe(200)
      expect(res.body.caseId).toBe('case-001')
      expect(Array.isArray(res.body.evidence)).toBe(true)
      expect(Array.isArray(res.body.characters)).toBe(true)
    })
  })

  describe('GET /admin/cases/:caseId/compare', () => {
    it('returns comparison between truth and player state', async () => {
      const res = await request(app).get('/admin/cases/case-001/compare')
      expect(res.status).toBe(200)
      expect(res.body.caseId).toBe('case-001')
      expect(res.body.culpritMatch).toBeDefined()
      expect(res.body.solverStatus).toBeDefined()
    })
  })

  describe('POST /admin/cases/:caseId/refresh', () => {
    it('returns 404 for nonexistent case', async () => {
      const res = await request(app).post('/admin/cases/nonexistent/refresh')
      expect(res.status).toBe(404)
    })
  })

  describe('404 handler', () => {
    it('handles unknown routes', async () => {
      const res = await request(app).get('/unknown-route')
      expect(res.status).toBe(404)
      expect(res.body.error).toContain('Not found')
    })
  })
})