import React, { useEffect, useState } from 'react';
import { api } from '../api';

const DIFF_ORDER = ['easy', 'medium', 'hard'];
const DIFF_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

export default function Landing({ health, onStart, startError }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    api.listCases()
      .then((d) => setCases(d.cases))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? cases : cases.filter((c) => c.difficulty === filter);
  const counts = cases.reduce((a, c) => { a[c.difficulty] = (a[c.difficulty] || 0) + 1; return a; }, {});

  return (
    <div className="app-shell">
      <div className="topbar">
        <span className="brand"><span className="logo">⌁</span>The Detective's Board</span>
        <span className="tag">AI-native investigation platform</span>
        <span className="spacer" />
        <span className={`engine-status ${health ? '' : 'off'}`}>
          <span className="pulse" /> {health ? 'engine online' : 'engine offline'}
        </span>
      </div>

      <div className="main">
        <div className="container">
          <section className="hero">
            <h1>Every case hides a truth.<br />Find it.</h1>
            <p className="sub">
              A detective mystery driven by a live AI engine. Observe the scene, collect evidence,
              interrogate suspects, reconstruct the timeline — and accuse with certainty.
            </p>
          </section>

          {error && <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(248,113,113,0.5)' }}><span className="bad">⚠ Failed to load cases: {error}</span></div>}
          {startError && <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(248,113,113,0.5)' }}><span className="bad">⚠ Could not open case: {startError}</span></div>}

          <div className="row" style={{ margin: '16px 0 24px', gap: 10, flexWrap: 'wrap' }}>
            <button className={`btn small ${filter === 'all' ? 'primary' : 'ghost'}`} onClick={() => setFilter('all')}>All · {cases.length}</button>
            {DIFF_ORDER.map((d) => (
              <button key={d} className={`btn small ${filter === d ? 'primary' : 'ghost'}`} onClick={() => setFilter(d)}>
                {DIFF_LABEL[d]} · {counts[d] || 0}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="empty">Opening the case files…</div>
          ) : (
            <div className="grid cases">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="case-card"
                  onMouseEnter={() => setHovered(c.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onStart(c.id)}
                >
                  <div className="case-id">{c.id}</div>
                  <h3>{c.title}</h3>
                  <div className="meta">
                    <span className={`pill difficulty-${c.difficulty}`}>◈ {DIFF_LABEL[c.difficulty]}</span>
                    <span className="pill">{c.status}</span>
                  </div>
                  <div className="open-cta">Open case file →</div>
                </div>
              ))}
              {filtered.length === 0 && <div className="empty">No cases in this category.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
