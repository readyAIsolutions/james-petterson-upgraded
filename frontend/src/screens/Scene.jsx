import React, { useState } from 'react';
import Closeup from './Closeup';

const LOC_ICONS = { loc_workshop: '⚙️', loc_parlor: '🛋️', loc_kitchen: '🍵', loc_shopfront: '🛍️', other: '📍' };
const TYPE_ICON = { physical: '🧪', document: '📄', media: '📼', weapon: '🗡️', location: '📍', event: '⏱️', digital: '💾', audio: '🎧', testimony: '🗣️', other: '📦' };

export default function Scene({ caseData, discovered, discover, session }) {
  const [toast, setToast] = useState(null);
  const [closeup, setCloseup] = useState(null);
  const [openItem, setOpenItem] = useState(null);
  const [collectAnim, setCollectAnim] = useState(null);

  if (!caseData) return <div className="empty">Loading scene…</div>;

  const allEvidence = caseData.evidence || [];
  const locations = caseData.locations || [];
  const byLoc = {};
  allEvidence.forEach((e) => { const k = e.location_id || 'other'; (byLoc[k] = byLoc[k] || []).push(e); });

  // Patterson device: killer's-POV chapters, unlocked by specific evidence.
  const povChapters = caseData.killer_pov || [];
  const povUnlocked = povChapters;
  const povLockedCount = caseData.killer_pov_locked || 0;

  const handleCollect = async (ev) => {
    if (discovered[ev.id]) return; // no duplicate collection
    setCollectAnim(ev.id);
    const before = Object.keys(discovered).length;
    const full = await discover(ev.id);
    setCollectAnim(null);
    if (full) {
      const got = (full.evidence || []).find((e) => e.id === ev.id);
      setToast(`Added to your Evidence Bag (${before + 1} collected)`);
      setTimeout(() => setToast(null), 2600);
      if (got) setCloseup(got);
    }
  };

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}
      <Closeup ev={closeup} sessionId={session?.id} onClose={() => setCloseup(null)} />
      <div className="row spread" style={{ marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>The Scene</h2>
          <p className="muted" style={{ margin: '6px 0 0' }}>Inspect each location. Locate and collect evidence.</p>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <span className="pill good">● {Object.keys(discovered).filter((k) => discovered[k]).length} collected</span>
          {caseData.locked_evidence_count > 0 && <span className="pill muted">🔒 more to find</span>}
        </div>
      </div>

      {caseData.detective_stake && (
        <div className="card" style={{ marginBottom: 14, borderLeft: '3px solid var(--accent)' }}>
          <div className="muted" style={{ fontSize: 11, letterSpacing: 2, fontWeight: 800 }}>WHAT THIS COSTS YOU</div>
          <p className="font-serif" style={{ margin: '6px 0 0', lineHeight: 1.7 }}>{caseData.detective_stake}</p>
        </div>
      )}
      {(caseData.chapter_breaks || []).map((c) => (
        <div key={c.title} className="card" style={{ marginBottom: 12, borderColor: 'rgba(240,184,72,0.5)' }}>
          <div className="violet" style={{ fontWeight: 800, letterSpacing: 1.5, fontSize: 12 }}>{c.title.toUpperCase()}</div>
          <p className="font-serif" style={{ margin: '8px 0 0', lineHeight: 1.75, fontStyle: 'italic' }}>{c.text}</p>
        </div>
      ))}

      <div className="row" style={{ gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {povUnlocked.map((c) => (
          <span key={c.id} className="pill accent" title={c.chapter_title}>📖 A page from the killer</span>
        ))}
        {povLockedCount > 0 && <span className="pill muted">🔒 {povLockedCount} hidden page{povLockedCount > 1 ? 's' : ''} — keep investigating</span>}
      </div>

      {povUnlocked.length > 0 && (
        <div className="killer-pov" style={{ marginBottom: 20 }}>
          {povUnlocked.map((c) => (
            <div key={c.id} className="card" style={{ borderColor: 'rgba(248,113,113,0.45)', background: 'rgba(30,10,14,0.35)' }}>
              <div className="row spread">
                <span className="bad" style={{ fontWeight: 800, letterSpacing: 2, fontSize: 12 }}>⚠ UNSOLVED CHAPTER</span>
                <span className="muted" style={{ fontSize: 11 }}>from a source close to the victim</span>
              </div>
              <h3 className="font-serif" style={{ margin: '10px 0 6px' }}>{c.chapter_title}</h3>
              <p className="font-serif" style={{ fontStyle: 'italic', lineHeight: 1.75, fontSize: 15, color: 'var(--text-dim)' }}>
                {c.text}
              </p>
            </div>
          ))}
        </div>
      )}

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
            {items.length === 0 && <div className="muted" style={{ fontSize: 13 }}>Nothing more you can make sense of here — yet.</div>}
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
                      <div style={{ fontWeight: 700, marginTop: 3 }}>{isDiscovered ? ev.title : 'Something here is worth a closer look'}</div>
                    </div>
                    {!isDiscovered ? (
                      <button className="btn violet collect-btn" style={{ width: 'auto', padding: '6px 14px' }} onClick={(e) => { e.stopPropagation(); handleCollect(ev); }}>
                        {collectAnim === ev.id ? 'Collecting…' : '+ Collect Evidence'}
                      </button>
                    ) : (
                      <span className="good" style={{ fontSize: 13, fontWeight: 700 }}>✓ In your bag</span>
                    )}
                  </div>
                  {isDiscovered && (
                    <div className="desc-wrap">
                      <div className="muted" style={{ fontSize: 13.5, marginTop: 8 }}>{ev.description}</div>
                      <button className="btn small ghost" style={{ marginTop: 8 }} onClick={(e) => { e.stopPropagation(); setCloseup(ev); }}>🔍 Close-up &amp; theory</button>
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
