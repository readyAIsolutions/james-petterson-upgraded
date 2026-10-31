import React from 'react';

export default function Briefing({ caseData, onContinue, session }) {
  if (!caseData) return <div className="empty">Loading briefing…</div>;
  const suspects = caseData.characters.filter((c) => c.role === 'suspect');
  const victims = caseData.characters.filter((c) => c.role === 'victim');
  const opening = caseData.opening_scene && caseData.opening_scene.length
    ? caseData.opening_scene
    : [caseData.description || caseData.premise].filter(Boolean);
  const difficulty = session?.difficulty || 'standard';
  const DIFF = { easy: 'Easy', standard: 'Standard', hard: 'Hard' };

  return (
    <div>
      <div className="row" style={{ gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <span className={`pill difficulty-${caseData.difficulty}`}>◈ {caseData.difficulty}</span>
        <span className="pill accent">🎚 {DIFF[difficulty]} mode</span>
        {victims.map((v) => <span key={v.id} className="pill victim">✝ {v.name}</span>)}
        <span className="pill">{suspects.length} persons of interest</span>
      </div>

      <div className="novel-cover">
        <div className="novel-kicker">CHAPTER ONE</div>
        <div className="novel-epigraph">{caseData.epigraph || 'Someone in these pages is lying.'}</div>
        <h1 className="novel-title font-serif">{caseData.title}</h1>
        <div className="novel-byline">— an original investigative thriller —</div>
      </div>

      <div className="card novel-body">
        {opening.map((para, i) => (
          <p key={i} className="font-serif" style={{ lineHeight: 1.85, fontSize: 16.5, marginBottom: 14 }}>
            {para}
          </p>
        ))}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h3 className="violet">Your Objective</h3>
        <ol className="font-serif" style={{ lineHeight: 2, fontSize: 15.5 }}>
          <li>Walk the scene. Collect every piece of evidence — the building keeps the truth.</li>
          <li>Interrogate each suspect more than once. Their stories evolve under pressure. Present evidence and watch for the crack.</li>
          <li>Pin clues to the board; rebuild the timeline from the records.</li>
          <li>Make the accusation — with your reasoning and the evidence that backs it.</li>
        </ol>
      </div>

      <div style={{ marginTop: 24 }}>
        <button className="btn primary big" onClick={onContinue}>
          Enter the Scene →
        </button>
      </div>
    </div>
  );
}
