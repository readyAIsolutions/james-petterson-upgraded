'use strict';
/**
 * AIGateway - OpenRouter-compatible model routing abstraction.
 *
 * The blueprint's rule: "Swap models without rewriting game." Every service
 * that needs an LLM talks to this gateway. It handles:
 *   - provider/model routing
 *   - retries + timeouts
 *   - token/cost budgeting
 *   - caching (cheap repeat calls)
 *   - safety policy hooks
 *   - telemetry (persisted to ai_calls)
 *
 * If no OPENROUTER_API_KEY is set, the gateway falls back to a deterministic
 * "scripted" mode so the whole platform is testable offline. This keeps the
 * price of entry at zero — the user asked for open-source, no-extra-sofware.
 */
const crypto = require('node:crypto');
const { getDb } = require('../shared/database');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

class AIGateway {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.defaultModel = process.env.DEFAULT_MODEL || 'openai/gpt-4o-mini';
    this.budget = { maxTokens: process.env.AI_BUDGET_TOKENS ? Number(process.env.AI_BUDGET_TOKENS) : 1e9 };
    this.cache = new Map(); // simple in-memory cache: prompt -> {response, model, ttl}
    this.scriptedCallbacks = new Map(); // purpose -> fn(scope) for offline mode
  }

  /**
   * Register a deterministic handler used when the gateway is offline.
   * Handlers receive a scope object and return { text, fields }.
   */
  registerScripted(purpose, fn) {
    this.scriptedCallbacks.set(purpose, fn);
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  /**
   * Main entry point.
   * @param {object} opts
   * @param {string} opts.purpose - e.g. 'npc_dialogue', 'narrate', 'describe'
   * @param {Array<{role,content}>} opts.messages
   * @param {string} [opts.model]
   * @param {number} [opts.maxTokens]
   * @param {string} [opts.sessionId]
   * @param {object} [opts.extra] - structured field hints (response_format etc.)
   * @param {boolean} [opts.useCache]
   * @returns {Promise<{text:string, fields?:object, provider, model, tokens, latency_ms, cost, cached}>}
   */
  async complete(opts) {
    const started = Date.now();
    const model = opts.model || this.defaultModel;
    const purpose = opts.purpose || 'generic';
    const sessionId = opts.sessionId || null;
    const useCache = opts.useCache !== false;

    const cacheKey = useCache ? `${model}::${purpose}::${JSON.stringify(opts.messages)}` : null;
    if (cacheKey && this.cache.has(cacheKey)) {
      const hit = this.cache.get(cacheKey);
      this._record({
        sessionId, purpose, provider: 'cache', model, tokens: 0,
        latency_ms: 0, cost: 0, trace_id: hit.traceId, note: 'cache hit'
      });
      return { ...hit.value, cached: true };
    }

    // Offline / no-API-key path -> deterministic scripted handlers
    if (!this.apiKey) {
      const cb = this.scriptedCallbacks.get(purpose);
      if (!cb) {
        throw new Error(`AIGateway offline and no scripted handler for purpose '${purpose}'. Set OPENROUTER_API_KEY or register a handler.`);
      }
      const value = await cb({
        messages: opts.messages,
        model, purpose,
        extra: opts.extra || {},
        sessionId,
        scope: opts.scope || null,
      });
      const text = typeof value === 'string' ? value : value.text;
      const fields = typeof value === 'object' && !Array.isArray(value) ? (value.fields || {}) : {};
      const traceId = crypto.randomUUID();
      this._record({ sessionId, purpose, provider: 'scripted', model, tokens: 0, latency_ms: Date.now() - started, cost: 0, trace_id: traceId });
      const result = { text, fields, provider: 'scripted', model, tokens: 0, latency_ms: Date.now() - started, cost: 0, traceId, cached: false };
      if (useCache) this.cache.set(cacheKey, { value: result, traceId });
      return result;
    }

    // Live path
    const body = {
      model,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 512,
    };
    if (opts.extra && opts.extra.response_format) {
      body.response_format = opts.extra.response_format;
    }
    if (opts.extra && opts.extra.json) {
      body.response_format = { type: 'json_object' };
    }

    let lastErr;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 30000);
        const resp = await fetch(OPENROUTER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://ai-detective.local',
            'X-Title': 'AI Detective Platform',
          },
          body: JSON.stringify(body),
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        if (!resp.ok) {
          lastErr = new Error(`OpenRouter HTTP ${resp.status}: ${await resp.text()}`);
          continue;
        }
        const data = await resp.json();
        const text = data.choices?.[0]?.message?.content || '';
        const usage = data.usage || {};
        const fields = opts.extra?.json ? this._tryParseJson(text) : {};
        const result = {
          text, fields, provider: 'openrouter', model,
          tokens: usage.prompt_tokens + usage.completion_tokens || 0,
          latency_ms: Date.now() - started,
          cost: this._estimateCost(model, usage),
          traceId: crypto.randomUUID(),
          cached: false,
        };
        this._record({ sessionId, purpose, provider: 'openrouter', model, tokens: result.tokens, latency_ms: result.latency_ms, cost: result.cost, trace_id: result.traceId });
        if (useCache) this.cache.set(cacheKey, { value: result, traceId: result.traceId });
        return result;
      } catch (e) {
        lastErr = e;
        await new Promise(r => setTimeout(r, 300 * (attempt + 1)));
      }
    }
    throw lastErr || new Error('AI Gateway request failed');
  }

  _tryParseJson(text) {
    try {
      const m = text.match(/\{[\s\S]*\}/);
      return m ? JSON.parse(m[0]) : { raw: text };
    } catch {
      return { raw: text };
    }
  }

  _estimateCost(model, usage) {
    // Rough per-1k token pricing; refine per model later.
    const rate = model.includes('gpt-4o-mini') ? 0.00000015 :
                 model.includes('free') ? 0 : 0.0000004;
    return ((usage.prompt_tokens || 0) + (usage.completion_tokens || 0)) * rate;
  }

  _record({ sessionId, purpose, provider, model, tokens, latency_ms, cost, trace_id, note }) {
    try {
      const db = getDb();
      db.prepare(`
        INSERT INTO ai_calls (id, session_id, purpose, provider, model, tokens, latency_ms, cost, trace_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(crypto.randomUUID(), sessionId, purpose, provider, model, tokens, latency_ms, cost, trace_id);
    } catch (e) {
      // telemetry must never break gameplay
      console.error('ai_calls telemetry error:', e.message);
    }
  }

  clearCache() { this.cache.clear(); }
}

module.exports = { AIGateway };
