'use strict';
/**
 * Production static server for the AI Detective Platform frontend.
 * Serves the built HTML (frontend/dist) and proxies API + health calls
 * to the backend (default :8765).
 *
 * Usage:  node server.js [PORT]
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const DIST = path.join(__dirname, 'dist');
const BACKEND = process.env.BACKEND || 'http://localhost:8765';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  // SPA fallback: non-asset, non-api routes -> index.html
  const isAsset = path.extname(urlPath) !== '';
  const filePath = path.join(DIST, urlPath);
  let resolved = filePath;
  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
    if (!isAsset || !fs.existsSync(resolved)) resolved = path.join(DIST, 'index.html');
  }
  try {
    const data = fs.readFileSync(resolved);
    const type = MIME[path.extname(resolved)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
    res.end(data);
  } catch (e) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}

function proxy(req, res) {
  const u = new URL(BACKEND + req.url);
  const headers = { ...req.headers, host: u.host };
  const pReq = http.request(u, { method: req.method, headers }, (pRes) => {
    res.writeHead(pRes.statusCode, pRes.headers);
    pRes.pipe(res);
  });
  pReq.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Backend unreachable. Is it running on :8765?' }));
  });
  req.pipe(pReq);
}

http.createServer((req, res) => {
  const p = req.url.split('?')[0];
  if (p === '/health' || p.startsWith('/api')) return proxy(req, res);
  return serveStatic(req, res);
}).listen(PORT, () => {
  console.log(`AI Detective Platform (production) -> http://localhost:${PORT}`);
  console.log(`  static : ${DIST}`);
  console.log(`  backend: ${BACKEND}`);
  console.log(`  health : http://localhost:${PORT}/health`);
});
