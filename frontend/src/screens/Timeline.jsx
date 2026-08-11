import React from 'react';

export default function Timeline({ caseData }) {
  if (!caseData) return <div className="muted">Loading…</div>;
  const events = [...(caseData.events || [])].sort((a, b) => (a.start < b.start ? -1 : 1));
  return (
    <div>
      <h2>Timeline Reconstruction</h2>
      <p className="muted">The order of events. What happened, and when.</p>
      <div className="card" style={{ marginTop: 16 }}>
        {events.map((e) => {
          const loc = caseData.locations.find((l) => l.id === e.location_id);
          return (
            <div key={e.id} className="timeline-item">
              <div className="time">{e.start}</div>
              <div>
                <div style={{ fontWeight: 700 }}>{e.title || e.id}</div>
                <div className="muted">{e.description}</div>
                {loc && <div className="muted" style={{ fontSize: 12 }}>📍 {loc.name}</div>}
                <div className="row" style={{ marginTop: 4, gap: 6 }}>
                  {(e.actors || []).map((a) => {
                    const ch = caseData.characters.find((c) => c.id === a);
                    return ch ? <span key={a} className="pill">{ch.name}</span> : null;
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
