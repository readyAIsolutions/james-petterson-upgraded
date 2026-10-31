import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api';

const moodOf = (e) => {
  if (!e) return 'composed';
  if (e.stress > 0.72) return 'on the edge of breaking';
  if (e.stress > 0.52) return 'visibly rattled';
  if (e.trust > 0.65) return 'warming to you';
  if (e.trust < 0.3) return 'hostile';
  return 'guarded';
};

export default function Interview({ suspects, sessionId, inventory, evidenceById, initialSelected = null, session, onInterviewed }) {
  const [selected, setSelected] = useState(initialSelected || suspects[0]?.id || null);
  const [question, setQuestion] = useState('');
  const [chosenEvidence, setChosenEvidence] = useState([]);
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const [mood, setMood] = useState({});       // charId -> {trust, stress, met}
  const [hints, setHints] = useState([]);     // unlocked hint list
  const [hintOpen, setHintOpen] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (initialSelected && suspects.some((s) => s.id === initialSelected)) {
      setSelected(initialSelected); setLog([]); setChosenEvidence([]);
    }
  }, [initialSelected, suspects]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [log, typing]);

  useEffect(() => { api.hints(sessionId).then((d) => setHints(d.hints || [])).catch(() => {}); }, [sessionId]);

  const sessionDifficulty = session?.difficulty || 'standard';
  const character = suspects.find((s) => s.id === selected);
  const emo = mood[selected] || { trust: 0.5, stress: 0.2, met: 0 };

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
        if (res.mood) setMood((m) => ({ ...m, [selected]: res.mood }));
        else if (false) {
          setMood((m) => {
            const cur = m[selected] || { trust: 0.5, stress: 0.2, met: 0 };
            const d = res.emotion_delta || {};
            return { ...m, [selected]: {
              ...cur,
              trust: Math.max(0, Math.min(1, cur.trust + (d.trust || 0))),
              stress: Math.max(0, Math.min(1, cur.stress + (d.stress || 0))),
              met: (cur.met || 0) + 1,
            } };
          });
        }
        setLog((l) => [...l, {
          role: 'npc',
          text: res.spoken_text,
          cracked: res.cracked,
          offline: res.ai_offline,
        }]);
        setTyping(false); setChosenEvidence([]);
        if (onInterviewed) onInterviewed();
      }, 500);
    } catch (e) {
      setError(e.message); setTyping(false);
      setLog((l) => [...l, { role: 'system', text: `(error: ${e.message})` }]);
    } finally {
      setBusy(false);
    }
  };

  const hintBtn = async () => {
    try {
      const d = await api.hints(sessionId);
      setHints(d.hints || []);
      setHintOpen(true);
    } catch (e) { setError(e.message); }
  };

  const composurePct = Math.round(100 - emo.stress * 100);
  const trustPct = Math.round(emo.trust * 100);

  return (
    <div>
      <div className="row spread" style={{ marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0 }}>Interrogation Room</h2>
          <p className="muted" style={{ margin: '6px 0 0' }}>Ask in natural language. Present evidence. Watch for lies. They remember you.</p>
        </div>
        <button className="btn ghost small" onClick={hintBtn} title="Deterministic hints — never change the case truth">
          💡 Hints {hints.length > 0 ? `· ${hints.length} available` : ''}
        </button>
      </div>

      {hintOpen && hints.length > 0 && (
        <div className="card" style={{ marginBottom: 16, borderColor: 'rgba(240,184,72,0.4)' }}>
          <div className="row spread">
            <span className="violet" style={{ fontWeight: 700 }}>Case Notes — your difficulty level</span>
            <button className="btn ghost small" onClick={() => setHintOpen(false)}>✕</button>
          </div>
          {hints.map((h, i) => (
            <p key={i} className="muted" style={{ fontSize: 13.5, margin: '6px 0', lineHeight: 1.6 }}>
              <span className="violet">T{h.tier || 1}:</span> {h.text}
            </p>
          ))}
        </div>
      )}

      <div className="row" style={{ margin: '12px 0 16px', gap: 8, flexWrap: 'wrap' }}>
        {suspects.map((s) => (
          <button key={s.id} className={`btn ${selected === s.id ? 'primary' : 'ghost'}`} onClick={() => { setSelected(s.id); setLog([]); setChosenEvidence([]); }}>
            {s.name}
          </button>
        ))}
      </div>

      {character && (
        <div className="card" style={{ marginBottom: 16, padding: 14 }}>
          <div className="row spread">
            <div className="row">
              <span style={{ fontSize: 26 }}>{character.role === 'witness' ? '👁️' : '🕵️'}</span>
              <div>
                <div style={{ fontWeight: 700 }}>{character.name} <span className={`pill ${character.role}`}>{character.role}</span></div>
                {character.motive && <div className="muted" style={{ fontSize: 12.5 }}>Why they are a suspect: {character.motive}</div>}
                {character.voice && typeof character.voice === 'object' && character.voice.style && (
                  <div className="muted" style={{ fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>
                    {character.voice.style.slice(0, 140)}{character.voice.style.length > 140 ? '…' : ''}
                  </div>
                )}
              </div>
            </div>
            <div style={{ minWidth: 150 }}>
              <div className="row spread muted" style={{ fontSize: 11.5, marginBottom: 4 }}>
                <span>Composure</span><span>{composurePct}%</span>
              </div>
              <div className="meter"><div className="meter-fill stress" style={{ width: `${Math.min(100, emo.stress * 100)}%` }} /></div>
              <div className="row spread muted" style={{ fontSize: 11.5, margin: '6px 0 4px' }}>
                <span>Trust</span><span>{trustPct}%</span>
              </div>
              <div className="meter"><div className="meter-fill trust" style={{ width: `${trustPct}%` }} /></div>
              <div style={{ fontSize: 11.5, marginTop: 6 }} className={emo.stress > 0.55 ? 'bad' : emo.trust > 0.6 ? 'good' : 'violet'}>
                {moodOf(emo)}{emo.met > 0 ? ` · met ${emo.met}×` : ''}
              </div>
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
            {m.cracked && sessionDifficulty !== 'hard' && <div className="warn" style={{ fontSize: 12.5, marginTop: 7, fontWeight: 600 }}>⚠ Something in that answer shifted. The story is not the same as before.</div>}
            {m.offline && <div className="muted" style={{ fontSize: 11.5, marginTop: 5 }}>(AI voice offline — scripted answer from the case file)</div>}
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
