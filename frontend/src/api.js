/**
 * API client - thin wrapper around the backend REST endpoints.
 * All paths are proxied by Vite to the Express server.
 */
async function req(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  health: () => req('/health'),
  listCases: () => req('/api/cases'),
  loadCase: (id) => req(`/api/cases/${id}`),
  validate: (manifest) => req('/api/validate', { method: 'POST', body: JSON.stringify({ manifest }) }),
  generate: (params) => req('/api/cases/generate', { method: 'POST', body: JSON.stringify(params) }),

  startSession: (caseId, userId = null) =>
    req('/api/sessions', { method: 'POST', body: JSON.stringify({ caseId, userId }) }),
  getSession: (id) => req(`/api/sessions/${id}`),
  briefing: (id) => req(`/api/sessions/${id}/briefing`),
  markBriefingSeen: (id) => req(`/api/sessions/${id}/briefing/seen`, { method: 'POST' }),
  inventory: (id) => req(`/api/sessions/${id}/inventory`),
  discoverable: (id) => req(`/api/sessions/${id}/discoverable`),
  discover: (id, evidenceId) =>
    req(`/api/sessions/${id}/discover`, { method: 'POST', body: JSON.stringify({ evidenceId }) }),
  interview: (id, { characterId, question, presentedEvidenceIds = [] }) =>
    req(`/api/sessions/${id}/interview`, {
      method: 'POST',
      body: JSON.stringify({ characterId, question, presentedEvidenceIds }),
    }),
  accuse: (id, { culpritId, motive, method, timeline }) =>
    req(`/api/sessions/${id}/accuse`, { method: 'POST', body: JSON.stringify({ culpritId, motive, method, timeline }) }),
};
