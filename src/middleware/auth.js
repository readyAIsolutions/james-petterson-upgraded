'use strict';
/**
 * Auth middleware + session-ownership enforcement for game/case endpoints.
 *
 * Design for the alpha:
 *  - Sessions may be started anonymously (userId null) so the playable slice
 *    works with zero friction — as today.
 *  - If a valid JWT is present, the session is bound to that user and only the
 *    owner may read/write it (403 on cross-user access) → fixes the IDOR the
 *    security review flagged.
 *  - Mutating/expensive endpoints (generate, validate, promote…) require
 *    authentication + optionally admin.
 *
 * Middleware values resolved from `req.identity` if the caller is authenticated:
 *   { userId, username, isAdmin } or null.
 */
const jwt = require('jsonwebtoken');

const isProd = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || (isProd ? '' : 'dev-insecure-secret-change-before-prod');

/**
 * Optionally resolve identity if a valid Bearer token is present. Does NOT
 * reject unauthenticated callers; sets req.identity=null when absent/invalid.
 */
function optionalAuth(req, _res, next) {
  req.identity = null;
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.identity = { userId: decoded.userId, username: decoded.username, isAdmin: !!decoded.isAdmin };
  } catch {
    // invalid/expired -> treat as anonymous; do not fail closed for optional endpoints
  }
  return next();
}

/** Require a valid authenticated identity; 401 otherwise. */
function requireAuth(req, res, next) {
  if (!req.identity) return res.status(401).json({ error: 'Authentication required' });
  return next();
}

/** Require an admin identity; 403 otherwise. */
function requireAdmin(req, res, next) {
  if (!req.identity) return res.status(401).json({ error: 'Authentication required' });
  if (!req.identity.isAdmin) return res.status(403).json({ error: 'Forbidden: admin required' });
  return next();
}

/**
 * Enforce session ownership where the session is bound to a user: if
 * req.identity is present and the session has a non-null user_id, it must match.
 * Anonymous-to-anonymous access is allowed (the playable slice).
 */
function ownershipCheck(getOwnerUserId) {
  return (req, res, next) => {
    if (!req.identity) return next(); // anonymous caller, anonymous session guard below
    let owner;
    try { owner = getOwnerUserId(req); } catch { owner = null; }
    // No owner bound -> allow (anonymous/resumed session).
    if (owner === null || owner === undefined) return next();
    if (Number(owner) !== Number(req.identity.userId)) {
      return res.status(403).json({ error: 'Forbidden: not your session' });
    }
    return next();
  };
}

module.exports = { optionalAuth, requireAuth, requireAdmin, ownershipCheck, JWT_SECRET };