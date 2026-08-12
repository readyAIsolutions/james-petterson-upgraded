import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api';

export default function Interview({ suspects, sessionId, inventory, evidenceById, initialSelected = null }) {
  const [selected, setSelected] = useState(initialSelected || suspects[0]?.id || null);
  const [question, setQuestion] = useState('');
  const [chosenEvidence, setChosenEvidence] = useState([]);
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const chatRef = useRef(null);

  useEffect(() => {
    if (initialSelected && suspects.some((s) => s.id === initialSelected)) {
      setSelected(initialSelected); setLog([]); setChosenEvidence([]);
    }
  }, [initialSelected, suspects]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [log, typing]);

  const character = suspects.find((s) => s.id === selected);

  const ask = async () => {
    if (!question.trim() || busy) return;
    setBusy(true); setError(null);
    const q = question.trim();
    setLog((l) => [...l, { role: 'player', text: q, presenting: chosenEvidence.length ? chosenEvidence.map((id) => evidenceById[id]?.title || id) : null }]);
    setQuestion(''); setTyping(true);
    try {
      const res = await api.interview(sessionId, {
        characterId: selected,
        question: q + (chosenEvidence.length ? ` (I'm showing you: ${chosenEvidence.map((id) => evidenceById[id]?.title || id).join(', ')})` : ''),
        presentedEvidenceIds: chosenEvidence,
      });
      // brief "thinking" delay for realism before the NPC replies
      setTimeout(() => {
        setLog((l) => [...l, { role: 'npc', text: res.spoken_text, lie: res.lie_id, meta: res.disclosed_fact_ids?.length ? `disclosed ${res.disclosed_fact_ids.length} fact(s)` : null, rejected: res.rejected }]);
        setTyping(false); setChosenEvidence([]);
      }, 500);
    } catch (e) {
      setError(e.message); setTyping(false);
      setLog((l) => [...l, { role: 'system', text: `(error: ${e.message})` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="row spread" style={{ marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0 }}>Interrogation Room</h2>
          <p className="muted" style={{ margin: '6px 0 0' }}>Ask in natural language. Present evidence. Watch for lies.</p>
        </div>
      </div>

      <div className="row" style={{ margin: '12px 0 16px', gap: 8, flexWrap: 'wrap' }}>
        {suspects.map((s) => (
          <button key={s.id} className={`btn ${selected === s.id ? 'primary' : 'ghost'}`} onClick={() => { setSelected(s.id); setLog([]); setChosenEvidence([]); }}>
            {s.name}
          </button>
        ))}
      </div>

      {character && (
        <div className="card" style={{ marginBottom: 16, padding: 14 }}>
          <div className="row">
            <span style={{ fontSize: 26 }}>{character.role === 'witness' ? '👁️' : '🕵️'}</span>
            <div>
              <div style={{ fontWeight: 700 }}>{character.name} <span className={`pill ${character.role}`}>{character.role}</span></div>
              {character.motive && <div className="muted" style={{ fontSize: 12.5 }}>{character.motive}</div>}
            </div>
          </div>
        </div>
      )}

      <div className="chat-log" ref={chatRef}>
        {log.length === 0 && !typing && <div className="empty" style={{ padding: 20 }}>The room is quiet. Ask {character?.name} something.</div>}
        {log.map((m, i) => (
          <div key={i} className={`bubble ${m.role === 'npc' ? 'npc' : m.role === 'player' ? 'player' : 'system'}`}>
            {m.role === 'npc' && <div className="dim" style={{ fontSize: 11, marginBottom: 3, fontWeight: 600 }}>{character?.name}</div>}
            {m.role === 'player' && <div className="dim" style={{ fontSize: 11, marginBottom: 3 }}>You</div>}
            <span>{m.text}</span>
            {m.presenting && (
              <div className="row" style={{ gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
                {m.presenting.map((p, j) => <span key={j} className="pill violet">🔖 {p}</span>)}
              </div>
            )}
            {m.lie && <div className="bad" style={{ fontSize: 12.5, marginTop: 7, fontWeight: 600 }}>⛔ They're lying — press harder</div>}
            {m.meta && <div className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>✓ {m.meta}</div>}
            {m.rejected && <div className="warn" style={{ fontSize: 12.5, marginTop: 6 }}>⚠ They nearly slipped up</div>}
          </div>
        ))}
        {typing && <div className="bubble npc"><span className="typing">thinking…</span></div>}
      </div>

      <div style={{ marginTop: 14 }}>
        <label>Present evidence (optional) — tap to arm</label>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {inventory.map((e) => (
            <button
              key={e.id}
              className={`btn small ${chosenEvidence.includes(e.id) ? 'primary' : 'ghost'}`}
              onClick={() => setChosenEvidence((c) => c.includes(e.id) ? c.filter((x) => x !== e.id) : [...c, e.id])}
            >
              {chosenEvidence.includes(e.id) ? '✓ ' : '🔖 '}{e.title}
            </button>
          ))}
          {inventory.length === 0 && <span className="muted" style={{ fontSize: 13 }}>Collect evidence from the scene first.</span>}
        </div>
        <div className="row">
          <input
            placeholder={`Ask ${character?.name || 'them'} a question…`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask()}
          />
          <button className="btn primary" onClick={ask} disabled={busy || !question.trim()}>
            {busy ? '…' : 'Ask'}
          </button>
        </div>
        {error && <div className="bad" style={{ marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  );
}