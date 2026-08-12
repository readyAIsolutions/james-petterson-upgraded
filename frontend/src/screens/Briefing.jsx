import React from 'react';

export default function Briefing({ caseData, onContinue }) {
  if (!caseData) return <div className="empty">Loading briefing…</div>;
  const suspects = caseData.characters.filter((c) => c.role === 'suspect');
  const victims = caseData.characters.filter((c) => c.role === 'victim');

  return (
    <div>
      <div className="row" style={{ gap: 8, marginBottom: 16 }}>
        <span className={`pill difficulty-${caseData.difficulty}`}>◈ {caseData.difficulty}</span>
        {victims.map((v) => <span key={v.id} className="pill victim">✝ {v.name}</span>)}
        <span className="pill">{suspects.length} persons of interest</span>
      </div>

      <h1 style={{ fontSize: 38 }}>{caseData.title}</h1>

      <div className="card" style={{ marginBottom: 18 }}>
        <h3 className="violet">The Case</h3>
        <p className="font-serif" style={{ lineHeight: 1.7, fontSize: 17 }}>
          {caseData.description || caseData.premise}
        </p>
        <p className="muted" style={{ marginTop: 12 }}>There are {suspects.length} persons of interest. All had reason. One is lying.</p>
      </div>

      <div className="card">
        <h3 className="violet">Your Objective</h3>
        <ol className="font-serif" style={{ lineHeight: 2, fontSize: 15.5 }}>
          <li>Search the scene and collect evidence.</li>
          <li>Pin evidence to the board and connect it.</li>
          <li>Interrogate each suspect; test their stories for lies.</li>
          <li>Reconstruct the timeline of events.</li>
          <li>Accuse — and prove it.</li>
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