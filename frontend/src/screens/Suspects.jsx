import React from 'react';

export default function Suspects({ suspects, caseData, inventory }) {
  // Show interview readiness: can only accuse after interviews, etc.
  return (
    <div>
      <h2>Suspects &amp; Persons of Interest</h2>
      <p className="muted">{suspects.length} in the cast. All had reason. One is lying.</p>
      <div className="grid" style={{ marginTop: 16 }}>
        {suspects.map((s) => (
          <div key={s.id} className="suspect-row">
            <div>
              <span className={`pill ${s.role}`}>{s.role}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontFamily: 'var(--font)' }}>{s.name}</div>
              {s.motive && <div className="muted" style={{ fontSize: 13 }}>{s.motive}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
