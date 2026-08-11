'use strict';
/**
 * Auth routes - register/login/logout/me using node:sqlite and JWT.
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../shared/database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'detective_secret_key';

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, is_admin = false } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE handle = ? OR email = ?').get(username, email);
    if (existing) return res.status(409).json({ error: 'Username or email already exists' });

    const hash = await bcrypt.hash(password, 10);
    const info = db.prepare(
      'INSERT INTO users (handle, email, password_hash, is_admin) VALUES (?, ?, ?, ?)'
    ).run(username, email, hash, is_admin ? 1 : 0);

    const token = jwt.sign({ userId: Number(info.lastInsertRowid), username, isAdmin: !!is_admin }, JWT_SECRET, { expiresIn: '24h' });
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

router.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDb();
    const user = db.prepare('SELECT id, handle AS username, email, is_admin FROM users WHERE id = ?').get(decoded.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { ...user, is_admin: !!user.is_admin } });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
