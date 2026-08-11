'use strict';
/**
 * Auth routes - register/login/logout/me using node:sqlite and JWT.
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../shared/database');

const router = express.Router();
// SECURITY: never fall back to a known secret. In production this MUST come
// from the environment; in other modes we allow a dev-only placeholder so the
// local stack runs, but a warning is printed.
const isProd = process.env.NODE_ENV === 'production';
if (isProd && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in the environment for production.');
}
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-before-prod';
if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'test') {
  console.warn('[auth] WARNING: JWT_SECRET not set — using insecure dev fallback. Set JWT_SECRET before deploying.');
}

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // SECURITY: never accept is_admin (or role/entitlement) from the client.
    // Privilege levels are only set server-side via an authenticated promote endpoint.
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE handle = ? OR email = ?').get(username, email);
    // Uniform message to avoid account enumeration by which field collided.
    if (existing) return res.status(409).json({ error: 'Username or email already exists' });

    const hash = await bcrypt.hash(password, 10);
    const info = db.prepare(
      'INSERT INTO users (handle, email, password_hash, is_admin) VALUES (?, ?, ?, 0)'
    ).run(username, email, hash);

    const token = jwt.sign({ userId: Number(info.lastInsertRowid), username, isAdmin: false }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: Number(info.lastInsertRowid), username, email },
      token,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing required fields' });

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE handle = ?').get(username);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    db.prepare('UPDATE users SET last_login = datetime(\'now\') WHERE id = ?').run(user.id);
    const token = jwt.sign({ userId: user.id, username: user.handle, isAdmin: !!user.is_admin }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      message: 'Login successful',
      user: { id: user.id, username: user.handle, email: user.email, is_admin: !!user.is_admin },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => res.json({ message: 'Logout successful' }));

// Admin-only: promote a user (or set any privilege level). The caller must be
// an admin (checked against the DB, not the token claim). This is the ONLY way
// privilege levels change — never from the client register/login payloads.
router.post('/promote', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  let caller;
  try { caller = jwt.verify(token, JWT_SECRET); } catch { return res.status(401).json({ error: 'Invalid token' }); }
  const db = getDb();
  const callerRow = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(caller.userId);
  if (!callerRow || !callerRow.is_admin) return res.status(403).json({ error: 'Forbidden: admin required' });

  const { username, is_admin } = req.body;
  if (typeof username !== 'string' || !username) return res.status(400).json({ error: 'username required' });
  const level = is_admin ? 1 : 0;
  const info = db.prepare('UPDATE users SET is_admin = ? WHERE handle = ?').run(level, username);
  if (info.changes === 0) return res.status(404).json({ error: 'User not found' });
  res.json({ message: `Set ${username} is_admin=${!!is_admin}` });
});

router.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDb();
    const user = db.prepare('SELECT id, handle AS username, email, is_admin FROM users WHERE id = ?').get(decoded.userId);
    // Uniform 401 (not 404) to avoid leaking account existence.
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    res.json({ user: { ...user, is_admin: !!user.is_admin } });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
