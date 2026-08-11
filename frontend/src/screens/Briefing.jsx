import React from 'react';

export default function Briefing({ caseData, onContinue }) {
  if (!caseData) return <div className="muted">Loading briefing…</div>;
  const suspects = caseData.characters.filter((c) => c.role === 'suspect');
  const victims = caseData.characters.filter((c) => c.role === 'victim');
  return (
    <div>
      <h1>{caseData.title}</h1>
      <div className="row" style={{ gap: 8, marginBottom: 16 }}>
        <span className="pill">Difficulty: {caseData.difficulty}</span>
        {victims.map((v) => <span key={v.id} className="pill victim">{v.name} — victim</span>)}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>The Case</h3>
        <p className="font-serif" style={{ lineHeight: 1.6, fontSize: 16 }}>
          {caseData.description || caseData.premise}
        </p>
        <p className="muted">There are {suspects.length} persons of interest. All had reason. One is lying.</p>
      </div>

      <div className="card">
        <h3>Your Objective</h3>
        <ol className="font-serif" style={{ lineHeight: 1.8 }}>
          <li>Search the scene and collect evidence.</li>
          <li>Pin evidence to the board and link it.</li>
          <li>Interrogate each suspect; test their stories.</li>
          <li>Reconstruct the timeline.</li>
          <li>Accuse — and prove it.</li>
        </ol>
      </div>

      <div style={{ marginTop: 20 }}>
        <button className="btn primary" onClick={onContinue}>Enter the Scene →</button>
      </div>
    </div>
  );
}
