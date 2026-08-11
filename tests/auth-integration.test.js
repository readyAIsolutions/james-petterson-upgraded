'use strict';
/**
 * Integration tests for the auth middleware + session-ownership enforcement
 * added to app.js after the security review.
 *
 * Uses supertest against a real Express app backed by an in-memory SQLite DB.
 * Requires a JWT_SECRET; set to a test value here (this is a test, never prod).
 */
process.env.JWT_SECRET = 'test-secret-for-auth-suite';
const request = require('supertest');

const { setDb } = require('../src/shared/database');
const { createDatabase } = require('../src/shared/db');
const { build } = require('../src/index');
const { getDb } = require('../src/shared/database');
const bcrypt = require('bcryptjs');

let app;
let db;

beforeAll(async () => {
  db = createDatabase(':memory:');
  setDb(db);
  // Seed case-001 into this instance.
  const { id, manifest } = require('../src/data/case-001');
  const CaseRepository = require('../src/services/case-repository');
  CaseRepository.save({ id, title: manifest.title, difficulty: manifest.difficulty, manifest });
  app = build();
});

function registerUser(handle, password = 'pw123456') {
  return request(app)
    .post('/api/register')
    .send({ username: handle, email: `${handle}@test.dev`, password });
}

describe('Auth + session ownership', () => {
  test('authenticated user can start and read their own session', async () => {
    const reg = await registerUser('alice');
    expect(reg.status).toBe(201);
    const token = reg.body.token;

    const start = await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({ caseId: 'case-001' });
    expect(start.status).toBe(201);
    const sid = start.body.id;

    const get = await request(app)
      .get(`/api/sessions/${sid}`)
      .set('Authorization', `Bearer ${token}`);
    expect(get.status).toBe(200);
  });

  test('IDOR: another user cannot read a session they do not own', async () => {
    const alice = await registerUser('bob'); // owner
    const token = alice.body.token;
    const start = await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({ caseId: 'case-001' });
    const sid = start.body.id;

    // eve is a different user, no token ownership of bob's session
    const eve = await registerUser('eve');
    const res = await request(app)
      .get(`/api/sessions/${sid}`)
      .set('Authorization', `Bearer ${eve.body.token}`);
    expect(res.status).toBe(403);
  });

  test('costly generate endpoint requires admin', async () => {
    const reg = await registerUser('mallory');
    const res = await request(app)
      .post('/api/cases/generate')
      .set('Authorization', `Bearer ${reg.body.token}`)
      .send({ genre: 'poison' });
    expect(res.status).toBe(403); // non-admin rejected
  });

  test('anonymous play still allowed (start case without token)', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .send({ caseId: 'case-001' });
    expect(res.status).toBe(201);
  });

  test('register ignores is_admin escalation (security regression)', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ username: 'rootwannabe', email: 'rw@test.dev', password: 'pw123456', is_admin: true });
    expect(res.status).toBe(201);
    const me = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${res.body.token}`);
    expect(me.body.user.is_admin).toBe(false);
  });
});