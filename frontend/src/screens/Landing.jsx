import React, { useEffect, useState } from 'react';
import { api } from '../api';

const DIFF_ORDER = ['easy', 'medium', 'hard'];
const DIFF_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

// Difficulty = CLUE SUPPORT, not truth. The murder is always the same.
const MODES = [
  { key: 'easy', label: 'Easy', sub: 'Directional nudges · richer hints', icon: '📖' },
  { key: 'standard', label: 'Standard', sub: 'Normal clue visibility · moderate hints', icon: '🕵️' },
  { key: 'hard', label: 'Hard', sub: 'Barely a nudge · you connect the evidence', icon: '🔥' },
];

export default function Landing({ health, onStart, startError }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [mode, setMode] = useState('standard');
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    api.listCases()
      .then((d) => setCases(d.cases))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? cases : cases.filter((c) => c.difficulty === filter);
  const counts = cases.reduce((a, c) => { a[c.difficulty] = (a[c.difficulty] || 0) + 1; return a; }, {});

  // The signature cases are the five hand-authored thrillers + the classic opener.
  const blurb = (c) => c.premise || c.description || 'A case file awaits.';

  return (
    <div className="app-shell">
      <div className="topbar">
        <span className="brand"><span className="logo">⌁</span>The Detective's Board</span>
        <span className="tag">AI-native investigation platform</span>
        <span className="spacer" />
        <span className={`engine-status ${health ? '' : 'off'}`}>
          <span className="pulse" /> {health ? 'AI engine online' : 'engine offline (scripted suspects)'}
        </span>
      </div>

      <div className="main">
        <div className="container">
          <section className="hero">
            <h1>Every case hides a truth.<br />Find it.</h1>
            <p className="sub">
              Five original thrillers. A live AI engine plays every suspect — each with their own
              voice, their own secrets, their own breaking point. Observe, collect, interrogate,
              and accuse with certainty.
            </p>
          </section>

          {error && <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(248,113,113,0.5)' }}><span className="bad">⚠ Failed to load cases: {error}</span></div>}
          {startError && <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(248,113,113,0.5)' }}><span className="bad">⚠ Could not open case: {startError}</span></div>}

          <div className="card" style={{ marginBottom: 22 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Choose your difficulty</div>
            <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
              Difficulty changes the help you get — never the truth. The killer, motive, method and
              evidence are identical in every mode.
            </p>
            <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
              {MODES.map((m) => (
                <button
                  key={m.key}
                  className={`btn mode-card ${mode === m.key ? 'primary' : 'ghost'}`}
                  style={{ textAlign: 'left', flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '10px 16px' }}
                  onClick={() => setMode(m.key)}
                >
                  <span style={{ fontWeight: 700 }}>{m.icon} {m.label}</span>
                  <span className="muted" style={{ fontSize: 12 }}>{m.sub}</span>
                </button>
              ))}
            </div>
          </div>

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
                  onClick={() => onStart(c.id, mode)}
                >
                  <div className="case-id">{c.id}</div>
                  <h3>{c.title}</h3>
                  <p className="blurb font-serif">{blurb(c)}</p>
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
