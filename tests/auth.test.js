'use strict';
/**
 * Auth route tests. Mocks the node:sqlite database interface (getDb() ->
 * { prepare().run/get/all }) and bcrypt/jwt.
 */
const request = require('supertest');
const express = require('express');

// Mock the database singleton before requiring auth.
// eslint-disable-next-line no-var
var mockActiveDb = {
  _users: [],
  _pk: 1,
  prepare(sql) {
    const self = this;
    return {
      run(...args) {
        // handle INSERT INTO users
        if (/INSERT INTO users/.test(sql)) {
          const row = { id: self._pk++, handle: args[0], email: args[1], password_hash: args[2], is_admin: args[3] || 0 };
          self._users.push(row);
          return { lastInsertRowid: row.id };
        }
        if (/UPDATE users/.test(sql)) return { changes: 1 };
        return { changes: 1, lastInsertRowid: 1 };
      },
      get(...args) {
        if (/WHERE id = \?/.test(sql)) {
          const u = self._users.find(x => x.id === args[0]);
          return u ? { id: u.id, username: u.handle, email: u.email, is_admin: u.is_admin } : undefined;
        }
        if (/WHERE handle = \?/.test(sql)) {
          return self._users.find(u => u.handle === args[0]) || undefined;
        }
        if (/WHERE handle = \? OR email = \?/.test(sql)) {
          return self._users.find(u => u.handle === args[0] || u.email === args[1]) || undefined;
        }
        return undefined;
      },
      all() { return self._users; },
    };
  },
};

jest.mock('/home/nova/ai-detective-platform/src/shared/database', () => ({
  getDb: () => mockActiveDb,
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$2a$10$mockhash'),
  compare: jest.fn().mockResolvedValue(true),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocktoken'),
  verify: jest.fn().mockReturnValue({ userId: 1, username: 'testuser', isAdmin: false }),
}));

const authRoutes = require('/home/nova/ai-detective-platform/src/routes/auth');
const app = express();
app.use(express.json());
app.use('/api', authRoutes);

beforeEach(() => {
  mockActiveDb._users = [];
  mockActiveDb._pk = 1;
  jest.clearAllMocks();
});

describe('Auth Routes', () => {
  test('registers a new user successfully', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token', 'mocktoken');
    expect(res.body.user.username).toBe('testuser');
  });

  test('rejects duplicate username', async () => {
    mockActiveDb._users.push({ id: 1, handle: 'testuser', email: 'test@example.com', password_hash: 'x' });
    const res = await request(app)
      .post('/api/register')
      .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Username or email already exists');
  });

  test('rejects registration missing required fields', async () => {
    const res = await request(app).post('/api/register').send({ username: 'testuser' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing required fields');
  });

  test('logs in an existing user', async () => {
    mockActiveDb._users.push({ id: 1, handle: 'testuser', email: 'test@example.com', password_hash: 'hash', is_admin: 0 });
    const res = await request(app).post('/api/login').send({ username: 'testuser', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token', 'mocktoken');
    expect(res.body.user.username).toBe('testuser');
  });

  test('rejects login with invalid credentials', async () => {
    const res = await request(app).post('/api/login').send({ username: 'nobody', password: 'x' });
    expect(res.status).toBe(401);
  });

  test('logout returns success', async () => {
    const res = await request(app).post('/api/logout');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logout successful');
  });

  test('/me without token returns 401', async () => {
    const res = await request(app).get('/api/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('No token provided');
  });

  test('/me with valid token returns user', async () => {
    mockActiveDb._users.push({ id: 1, handle: 'testuser', email: 'test@example.com', password_hash: 'hash', is_admin: 0 });
    const res = await request(app).get('/api/me').set('Authorization', 'Bearer mocktoken');
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('testuser');
  });
});
