import React, { useEffect, useState } from 'react';

const dims = [
  { key: 'culprit', label: 'Correct Culprit', max: 30 },
  { key: 'motive', label: 'Motive', max: 15 },
  { key: 'method', label: 'Method', max: 15 },
  { key: 'timeline', label: 'Timeline', max: 20 },
  { key: 'evidence', label: 'Evidence', max: 15 },
];

export default function Debrief({ result, caseData, onExit }) {
  const [barsOn, setBarsOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setBarsOn(true), 200); return () => clearTimeout(t); }, []);

  if (!result) return <div className="empty">No accusation recorded.</div>;

  const culprit = caseData.characters.find((c) => c.id === caseData.culprit_id);
  const guessed = caseData.characters.find((c) => c.id === result.culpritId);
  const solved = culprit && culprit.id === result.culpritId;
  const score = result.score ?? 0;

  return (
    <div>
      <div className={`verdict-banner ${solved ? 'solved' : 'failed'}`} style={{ border: '1px solid' }}>
        <span className="glyph">{solved ? '🕊️' : '🌀'}</span>
        <h1 style={{ fontSize: 44, margin: 0 }} className={solved ? 'good' : 'bad'}>
          {solved ? 'Case Solved' : 'The Truth Eludes You'}
        </h1>
        <p className="font-serif" style={{ fontSize: 18, marginTop: 10 }}>
          {solved ? 'You caught them. Well done, investigator.' : `You accused ${guessed?.name || 'the wrong person'}.`}
        </p>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h3 className="violet">Verdict</h3>
        <p className="font-serif" style={{ lineHeight: 1.7, fontSize: 16.5 }}>
          The culprit was <strong className="bad">{culprit?.name}</strong>. {culprit?.motive}.
          {caseData.facts?.map((f) => f.category === 'conclusion' ? ` ${f.value}` : '').join('')}
        </p>
        <div className="row" style={{ marginTop: 10 }}>
          <span className="pill good">✓ solved</span>
          <span className="pill">{inventoryCount(caseData)} evidence in case</span>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="row spread">
          <h3 style={{ margin: 0 }}>Case Score</h3>
          <span style={{ fontSize: 40, fontWeight: 700, fontFamily: 'var(--font-serif)' }}
            className={score >= 70 ? 'good' : score >= 40 ? 'accent' : 'bad'}>
            {Math.round(score)}
          </span>
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

function inventoryCount(caseData) {
  return (caseData?.evidence || []).length;
}