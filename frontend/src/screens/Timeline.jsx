import React from 'react';

export default function Timeline({ caseData }) {
  if (!caseData) return <div className="empty">Loading…</div>;
  const events = [...(caseData.events || [])].sort((a, b) => String(a.start).localeCompare(String(b.start)));
  const byChar = {};
  caseData.characters?.forEach((c) => (byChar[c.id] = c));

  return (
    <div>
      <div className="row spread" style={{ marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0 }}>Timeline Reconstruction</h2>
          <p className="muted" style={{ margin: '6px 0 0' }}>The order of events — what happened, and when.</p>
        </div>
        <span className="pill">{events.length} events</span>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="timeline">
          {events.map((e) => {
            const loc = (caseData.locations || []).find((l) => l.id === e.location_id);
            return (
              <div key={e.id} className="timeline-item">
                <span className="dot" />
                <div className="time">{e.start}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15.5 }}>{e.title || e.id}</div>
                  <div className="muted" style={{ lineHeight: 1.5 }}>{e.description}</div>
                  {loc && <div className="dim" style={{ fontSize: 12.5 }}>📍 {loc.name}</div>}
                  <div className="row" style={{ marginTop: 7, gap: 6, flexWrap: 'wrap' }}>
                    {(e.actors || []).map((a) => {
                      const ch = byChar[a];
                      return ch ? <span key={a} className={`pill ${ch.role}`}>{ch.name}</span> : null;
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}