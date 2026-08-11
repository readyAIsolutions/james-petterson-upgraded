// src/auth-service.js
const bcrypt = require('bcryptjs');
const { pool } = require('./shared/database');
const { redisClient } = require('./shared/redis');

class AuthService {
  async register(userData) {
    const { username, email, password, is_admin = false } = userData;

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('Username or email already exists');
    }

    // Create user
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, is_admin) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, hashedPassword, is_admin]
    );

    // Cache user session
    const token = this.generateToken();
    await redisClient.setex(`user_session_${result.rows[0].id}`, 3600, JSON.stringify({
      userId: result.rows[0].id,
      username: result.rows[0].username,
      isAdmin: result.rows[0].is_admin
    }));

    return {
      id: result.rows[0].id,
      username: result.rows[0].username,
      email: result.rows[0].email,
      is_admin: result.rows[0].is_admin,
      token
    };
  }

  async login(credentials) {
    const { username, password } = credentials;

    // Get user with password hash
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken();

    // Cache user session
    await redisClient.setex(`user_session_${user.id}`, 3600, JSON.stringify({
      userId: user.id,
      username: user.username,
      isAdmin: user.is_admin
    }));

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin,
      token
    };
  }

  async validateToken(token) {
    const results = await redisClient.keys('user_session_*');
    let sessionData = null;

    for (const key of results) {
      const data = await redisClient.get(key);
      if (data) {
        const session = JSON.parse(data);
        // Validate session (simplified - in production you'd have token in session)
        sessionData = session;
        break;
      }
    }

    return sessionData;
  }

  generateToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async logout(userId) {
    await redisClient.del(`user_session_${userId}`);
  }
}

module.exports = new AuthService();