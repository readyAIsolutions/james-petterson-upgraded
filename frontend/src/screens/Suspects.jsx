import React from 'react';

export default function Suspects({ suspects, onInterview }) {
  return (
    <div>
      <h2>Suspects &amp; Persons of Interest</h2>
      <p className="muted">{suspects.length} in the cast. All had reason. One is lying. Click a suspect to interrogate them.</p>
      <div className="grid" style={{ marginTop: 16 }}>
        {suspects.map((s) => (
          <div key={s.id} className="suspect-row" onClick={() => onInterview && onInterview(s.id)}>
            <div>
              <span className={`pill ${s.role}`}>{s.role}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontFamily: 'var(--font)' }}>{s.name}</div>
              {s.motive && <div className="muted" style={{ fontSize: 13 }}>{s.motive}</div>}
            </div>
            <span className="muted">Interrogate →</span>
          </div>
        ))}
      </div>
    </div>
  );
}
