import React, { useEffect, useState } from 'react';

const dims = [
  { key: 'culprit', label: 'Correct Culprit', max: 30 },
  { key: 'motive', label: 'Motive', max: 15 },
  { key: 'method', label: 'Method', max: 15 },
  { key: 'timeline', label: 'Timeline', max: 20 },
  { key: 'evidence', label: 'Evidence', max: 20 },
];

export default function Debrief({ result, caseData, onExit }) {
  const [barsOn, setBarsOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setBarsOn(true), 200); return () => clearTimeout(t); }, []);
  if (!result) return <div className="empty">No accusation recorded.</div>;

  const rv = result.reveal || {};
  const solved = result.verdict === 'solved';
  const partly = result.verdict === 'partly_correct';
  const guessed = (caseData.characters || []).find((c) => c.id === result.culpritId);
  const sol = rv.solution;
  const score = result.score ?? 0;

  return (
    <div>
      <div className={`verdict-banner ${solved ? 'solved' : 'failed'}`} style={{ border: '1px solid' }}>
        <span className="glyph">{solved ? '🕊️' : partly ? '⚖️' : '🌀'}</span>
        <h1 style={{ fontSize: 44, margin: 0 }} className={solved ? 'good' : 'bad'}>
          {solved ? 'Case Solved' : partly ? 'Right Person, Case Not Proven' : 'The Truth Eludes You'}
        </h1>
        <p className="font-serif" style={{ fontSize: 17, marginTop: 10 }}>{result.feedback}</p>
        {result.reason && <p className="font-serif" style={{ fontSize: 14.5, marginTop: 8, fontStyle: 'italic' }}>“{result.reason}”</p>}
        {!solved && <p className="muted" style={{ marginTop: 6 }}>You accused {guessed?.name || 'someone'}.</p>}
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h3 className="violet">What really happened</h3>
        <p className="font-serif" style={{ lineHeight: 1.7, fontSize: 16.5 }}>
          <strong className="bad">{rv.culprit_name}</strong> — {rv.motive}
        </p>
        {sol && (
          <>
            <p className="font-serif" style={{ lineHeight: 1.75, fontSize: 15, color: 'var(--text-dim)' }}><strong className="violet">Method: </strong>{sol.method}</p>
            <p className="font-serif" style={{ lineHeight: 1.75, fontSize: 15, color: 'var(--text-dim)' }}><strong className="violet">How the clues fit: </strong>{sol.narrative}</p>
          </>
        )}
      </div>

      {(rv.red_herrings || []).length > 0 && (
        <div className="card" style={{ marginTop: 18 }}>
          <h3 className="violet">The false leads</h3>
          {rv.red_herrings.map((r, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div className="muted" style={{ fontSize: 13.5 }}>⚠ {r.suspicious_thing}</div>
              <div className="font-serif" style={{ fontSize: 14.5, marginTop: 4 }}>{r.truth} {r.explanation}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ marginTop: 18 }}>
        <div className="row spread">
          <h3 style={{ margin: 0 }}>Case Score</h3>
          <span style={{ fontSize: 40, fontWeight: 700, fontFamily: 'var(--font-serif)' }} className={score >= 70 ? 'good' : score >= 40 ? 'accent' : 'bad'}>{Math.round(score)}</span>
        </div>
        <div className="score-band" style={{ marginTop: 20 }}>
          {dims.map((d) => {
            const v = result.breakdown?.[d.key] ?? 0;
            const pct = Math.min(100, (v / d.max) * 100);
            return (
              <div key={d.key} className="score-chip">
                <div className="v">{v}/{d.max}</div>
                <div className="l">{d.label}</div>
                <div className="bar" style={{ width: barsOn ? `${pct}%` : 0 }} />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <button className="btn primary big" onClick={onExit}>← Back to Case Files</button>
      </div>
    </div>
  );
}
