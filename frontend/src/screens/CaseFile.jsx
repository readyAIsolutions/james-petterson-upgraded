import React, { useMemo, useState } from 'react';
import Closeup, { theoryKey } from './Closeup';

const TABS = [
  { key: 'bag', label: '🎒 Evidence Bag' },
  { key: 'questions', label: '❓ Open Questions' },
  { key: 'victim', label: '✝ The Victim' },
  { key: 'cast', label: '👥 The Cast' },
];

export default function CaseFile({ caseData, inventory, session, onInterview }) {
  const [tab, setTab] = useState('bag');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const sid = session.id;

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return inventory.filter((e) =>
      !t
      || `${e.title} ${e.description} ${e.type}`.toLowerCase().includes(t)
      || (localStorage.getItem(theoryKey(sid, e.id)) || '').toLowerCase().includes(t));
  }, [inventory, q, sid]);

  if (!caseData) return <div className="empty">Loading…</div>;
  const cast = (caseData.characters || []).filter((c) => c.role !== 'victim');
  const victim = (caseData.characters || []).find((c) => c.role === 'victim');

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Case File</h2>
      <div className="row" style={{ gap: 8, flexWrap: 'wrap', margin: '10px 0 16px' }}>
        {TABS.map((t) => (
          <button key={t.key} className={`btn small ${tab === t.key ? 'primary' : 'ghost'}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {tab === 'bag' && (
        <div>
          <div className="row spread" style={{ marginBottom: 10 }}>
            <input placeholder="Search your evidence and theories…" value={q} onChange={(e) => setQ(e.target.value)} />
            <span className="pill good" style={{ marginLeft: 10, whiteSpace: 'nowrap' }}>{inventory.length} collected</span>
          </div>
          {inventory.length === 0 && (
            <div className="empty">Your bag is empty. Walk the scene and press <b>+ Collect Evidence</b>.</div>
          )}
          {shown.map((e) => {
            const theory = localStorage.getItem(theoryKey(sid, e.id));
            return (
              <div key={e.id} className="evidence-item discovered" onClick={() => setOpen(e)}>
                <div className="etype">{e.type}</div>
                <div style={{ fontWeight: 700 }}>{e.title}</div>
                {theory && <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}><b>Your theory:</b> {theory}</div>}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'questions' && (
        <div>
          <p className="muted">Always a next step, never the answer. A question turns green when evidence you hold addresses it.</p>
          {(caseData.open_questions || []).map((o, i) => (
            <div key={i} className="card" style={{ marginBottom: 10, borderColor: o.answered ? 'rgba(74,222,128,0.5)' : undefined }}>
              <span className={o.answered ? 'good' : 'violet'} style={{ fontWeight: 700 }}>{o.answered ? '✓ ' : '? '}{o.q}</span>
              {o.answered && (
                <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
                  You hold evidence on this. Whether it means what you think is up to you.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'victim' && (
        <div>
          <h3 className="font-serif">{victim?.name}</h3>
          <p className="font-serif" style={{ lineHeight: 1.75 }}>{victim?.public_profile}</p>
          {(caseData.victim_chapters || []).map((c) => (
            <div key={c.title} className="card novel-body" style={{ marginBottom: 12 }}>
              <div className="violet" style={{ fontWeight: 800, fontSize: 12, letterSpacing: 1.5 }}>{c.title.toUpperCase()}</div>
              <p className="font-serif" style={{ lineHeight: 1.8, margin: '8px 0 0' }}>{c.text}</p>
            </div>
          ))}
          {caseData.victim_chapters_locked > 0 && (
            <div className="muted">🔒 {caseData.victim_chapters_locked} more chapter{caseData.victim_chapters_locked > 1 ? 's' : ''} about {victim?.name} unlock as you collect evidence.</div>
          )}
        </div>
      )}

      {tab === 'cast' && (
        <div>
          {cast.map((c) => (
            <div key={c.id} className="card" style={{ marginBottom: 12 }}>
              <div className="row spread"><h3 style={{ margin: 0 }}>{c.name}</h3><span className={`pill ${c.role}`}>{c.role}</span></div>
              <p className="muted" style={{ marginTop: 6 }}>{c.public_profile}</p>
              {c.chapter
                ? <p className="font-serif" style={{ lineHeight: 1.8, fontStyle: 'italic' }}>{c.chapter}</p>
                : <p className="muted" style={{ fontSize: 13 }}>🔒 Interview {c.name} to learn their story.</p>}
              <button className="btn small ghost" onClick={() => onInterview && onInterview(c.id)}>Interrogate →</button>
            </div>
          ))}
        </div>
      )}
      <Closeup ev={open} sessionId={sid} onClose={() => setOpen(null)} />
    </div>
  );
}
