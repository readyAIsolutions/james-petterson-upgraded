import React from 'react';

const ROLE_LABEL = { suspect: 'Suspect', witness: 'Witness', victim: 'Victim' };

export default function Suspects({ suspects, onInterview }) {
  return (
    <div>
      <div className="row spread" style={{ marginBottom: 18 }}>
        <div>
          <h2 style={{ margin: 0 }}>Suspects &amp; Persons of Interest</h2>
          <p className="muted" style={{ margin: '6px 0 0' }}>{suspects.length} in the cast. Everyone here is hiding something. Not everything hidden is murder.</p>
        </div>
        <span className="pill">{suspects.filter((s) => s.role === 'suspect').length} suspects</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {suspects.map((s) => (
          <div key={s.id} className="card interactive" onClick={() => onInterview && onInterview(s.id)}>
            <div className="row spread">
              <span className={`pill ${s.role}`}>{ROLE_LABEL[s.role] || s.role}</span>
              <span className="violet" style={{ fontSize: 22 }}>{s.role === 'witness' ? '👁️' : '🕵️'}</span>
            </div>
            <h3 style={{ marginTop: 14 }}>{s.name}</h3>
            {s.motive && <p className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>{s.motive}</p>}
            <div className="violet" style={{ fontSize: 13, fontWeight: 600, marginTop: 10 }}>Interrogate →</div>
          </div>
        ))}
      </div>
    </div>
  );
}