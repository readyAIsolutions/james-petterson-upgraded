import React from 'react';

export default function Scene({ caseData, evidenceById, inventory, discovered, discover }) {
  if (!caseData) return <div className="muted">Loading scene…</div>;

  // Group discoverable evidence by location for an investigation view.
  const allEvidence = caseData.evidence || [];
  const locations = caseData.locations || [];

  const byLoc = {};
  allEvidence.forEach((e) => {
    const key = e.location_id || 'other';
    (byLoc[key] = byLoc[key] || []).push(e);
  });

  return (
    <div>
      <h2>The Scene</h2>
      <p className="muted">Inspect each location. Locate and collect evidence.</p>

      {locations.map((loc) => {
        const items = byLoc[loc.id] || [];
        return (
          <div key={loc.id} className="card" style={{ marginBottom: 16 }}>
            <h3>{loc.name}</h3>
            {loc.description && <p className="muted" style={{ fontStyle: 'italic' }}>{loc.description}</p>}
            {items.length === 0 && <div className="muted" style={{ fontSize: 13 }}>Nothing of note here.</div>}
            {items.map((ev) => {
              const isDiscovered = !!discovered[ev.id];
              return (
                <div
                  key={ev.id}
                  className={`evidence-item ${isDiscovered ? 'discovered' : ''}`}
                  style={{ marginTop: 8 }}
                >
                  <div className="row spread">
                    <div>
                      <div className="etype">{ev.type}</div>
                      <div style={{ fontWeight: 700, marginTop: 2 }}>{ev.title}</div>
                      {isDiscovered && <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{ev.description}</div>}
                    </div>
                    {!isDiscovered ? (
                      <button className="btn" onClick={() => discover(ev.id)}>Collect</button>
                    ) : (
                      <span className="good" style={{ fontSize: 20 }}>✓</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
