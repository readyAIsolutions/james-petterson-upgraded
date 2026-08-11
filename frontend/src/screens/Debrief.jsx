import React from 'react';

const dims = [
  { key: 'culprit', label: 'Correct Culprit', max: 30 },
  { key: 'motive', label: 'Motive', max: 15 },
  { key: 'method', label: 'Method', max: 15 },
  { key: 'timeline', label: 'Timeline', max: 20 },
  { key: 'evidence', label: 'Evidence', max: 15 },
];

export default function Debrief({ result, caseData, onExit }) {
  if (!result) return <div className="muted">No accusation recorded.</div>;

  const culprit = caseData.characters.find((c) => c.id === caseData.culprit_id);
  const guessed = caseData.characters.find((c) => c.id === result.culpritId);
  const solved = culprit && culprit.id === result.culpritId;

  return (
    <div>
      <h1>{solved ? 'Case Solved ✓' : 'The Truth Eludes You'}</h1>
      <div className={solved ? 'good font-serif' : 'bad font-serif'} style={{ fontSize: 18, marginBottom: 16 }}>
        {solved ? 'You caught them. Well done, investigator.' : `You accused ${guessed?.name || 'the wrong person'}.`}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Verdict</h3>
        <p className="font-serif" style={{ lineHeight: 1.6 }}>
          The culprit was <strong className="bad">{culprit?.name}</strong>. {culprit?.motive}.
          {caseData.facts?.map((f) => f.category === 'conclusion' ? ` ${f.value}` : '').join('')}
        </p>
      </div>

      <div className="card">
        <div className="row spread">
          <h3 style={{ margin: 0 }}>Score</h3>
          <span style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font)' }} className={result.score >= 70 ? 'good' : result.score >= 40 ? 'accent' : 'bad'}>
            {result.score}
          </span>
        </div>
        <div className="score-band" style={{ marginTop: 16 }}>
          {dims.map((d) => (
            <div key={d.key} className="score-chip">
              <div className="v">{result.breakdown?.[d.key] ?? 0}/{d.max}</div>
              <div className="l">{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button className="btn primary" onClick={onExit}>Back to Case Files</button>
      </div>
    </div>
  );
}
