import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function Landing({ health, onStart, startError }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.listCases()
      .then((d) => setCases(d.cases))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-shell">
      <div className="topbar">
        <span className="brand">The Detective's Board</span>
        <span className="tag">AI-native investigation platform</span>
        <span className="spacer" />
        {health ? (
          <span className="muted">engine online</span>
        ) : (
          <span className="bad">engine offline — start backend</span>
        )}
      </div>
      <div className="main">
        <h1>Open Case File</h1>
        <p className="muted">
          Observe. Collect. Connect. Interrogate. Reconstruct. Accuse.
        </p>

        {error && <div className="card bad" style={{ marginBottom: 16 }}>Failed to load cases: {error}</div>}
        {startError && <div className="card" style={{ marginBottom: 16, borderColor: 'var(--bad)' }}><span className="bad">⚠ Could not open case: {startError}</span></div>}

        {loading ? (
          <div className="muted">Loading case files…</div>
        ) : (
          <div className="grid cases">
            {cases.map((c) => (
              <div key={c.id} className="card case-card" onClick={() => onStart(c.id)}>
                <div className="row spread">
                  <span className="pill">{c.status}</span>
                  <span className="pill">{c.difficulty}</span>
                </div>
                <h3 style={{ marginTop: 12 }} className="font-serif">{c.title}</h3>
                <div className="muted" style={{ fontSize: 12 }}>{c.id}</div>
              </div>
            ))}
            {cases.length === 0 && <div className="muted">No published cases yet.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
