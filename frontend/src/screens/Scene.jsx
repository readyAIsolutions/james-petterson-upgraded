import React, { useState } from 'react';

const LOC_ICONS = { loc_workshop: '⚙️', loc_parlor: '🛋️', loc_kitchen: '🍵', loc_shopfront: '🛍️', other: '📍' };
const TYPE_ICON = { physical: '🧪', document: '📄', media: '📼', weapon: '🗡️', location: '📍', event: '⏱️', other: '📦' };

export default function Scene({ caseData, discovered, discover }) {
  const [openItem, setOpenItem] = useState(null);
  const [collectAnim, setCollectAnim] = useState(null);

  if (!caseData) return <div className="empty">Loading scene…</div>;

  const allEvidence = caseData.evidence || [];
  const locations = caseData.locations || [];
  const byLoc = {};
  allEvidence.forEach((e) => { const k = e.location_id || 'other'; (byLoc[k] = byLoc[k] || []).push(e); });

  const handleCollect = async (ev) => {
    setCollectAnim(ev.id);
    setOpenItem(ev.id);
    await discover(ev.id);
    setTimeout(() => setCollectAnim(null), 600);
  };

  return (
    <div>
      <div className="row spread" style={{ marginBottom: 18 }}>
        <div>
          <h2 style={{ margin: 0 }}>The Scene</h2>
          <p className="muted" style={{ margin: '6px 0 0' }}>Inspect each location. Locate and collect evidence.</p>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <span className="pill good">● {Object.keys(discovered).filter((k) => discovered[k]).length} collected</span>
          <span className="pill">⊘ {allEvidence.length} total</span>
        </div>
      </div>

      {locations.map((loc) => {
        const items = byLoc[loc.id] || [];
        return (
          <div key={loc.id} className="card loc-card">
            <div className="loc-head">
              <div className="loc-icon">{LOC_ICONS[loc.id] || '📍'}</div>
              <div>
                <h3 style={{ margin: 0 }}>{loc.name}</h3>
                {loc.description && <span className="muted" style={{ fontSize: 13, fontStyle: 'italic' }}>{loc.description}</span>}
              </div>
            </div>
            {items.length === 0 && <div className="muted" style={{ fontSize: 13 }}>Nothing of note here.</div>}
            {items.map((ev) => {
              const isDiscovered = !!discovered[ev.id];
              const isOpen = openItem === ev.id;
              return (
                <div
                  key={ev.id}
                  className={`evidence-item ${isDiscovered ? 'discovered' : ''} ${isOpen ? 'open' : ''}`}
                  onClick={() => setOpenItem(isOpen ? null : ev.id)}
                >
                  <div className="row spread">
                    <div>
                      <div className="etype">{TYPE_ICON[ev.type] || '📦'} {ev.type}</div>
                      <div style={{ fontWeight: 700, marginTop: 3 }}>{ev.title}</div>
                    </div>
                    {!isDiscovered ? (
                      <button className="btn violet collect-btn" onClick={(e) => { e.stopPropagation(); handleCollect(ev); }}>
                        {collectAnim === ev.id ? '✓' : '+'}
                      </button>
                    ) : (
                      <span className="collect-check" style={{ fontSize: 22, color: 'var(--good)' }}>✓</span>
                    )}
                  </div>
                  {isDiscovered && (
                    <div className="desc-wrap">
                      <div className="muted" style={{ fontSize: 13.5, marginTop: 8 }}>{ev.description}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}