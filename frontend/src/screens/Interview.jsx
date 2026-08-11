import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function Interview({ suspects, sessionId, inventory, evidenceById, initialSelected = null }) {
  const [selected, setSelected] = useState(initialSelected || suspects[0]?.id || null);
  const [question, setQuestion] = useState('');
  const [chosenEvidence, setChosenEvidence] = useState([]);
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // When arriving from the Suspects screen, switch to the selected suspect.
  useEffect(() => {
    if (initialSelected && suspects.some((s) => s.id === initialSelected)) {
      setSelected(initialSelected);
      setLog([]);
      setChosenEvidence([]);
    }
  }, [initialSelected, suspects]);

  const character = suspects.find((s) => s.id === selected);

  const ask = async () => {
    if (!question.trim() || busy) return;
    setBusy(true); setError(null);
    const playerMsg = { role: 'player', text: question + (chosenEvidence.length ? ` [presenting: ${chosenEvidence.map((id) => evidenceById[id]?.title || id).join(', ')}]` : '') };
    setLog((l) => [...l, playerMsg]);
    setQuestion('');
    try {
      const res = await api.interview(sessionId, {
        characterId: selected,
        question: question.trim() + (chosenEvidence.length ? ` (I'm showing you: ${chosenEvidence.map((id) => evidenceById[id]?.title || id).join(', ')})` : ''),
        presentedEvidenceIds: chosenEvidence,
      });
      const npcMsg = {
        role: 'npc', text: res.spoken_text,
        lie: res.lie_id,
        meta: res.disclosed_fact_ids?.length ? `disclosed ${res.disclosed_fact_ids.length} fact(s)` : null,
        rejected: res.rejected,
      };
      setLog((l) => [...l, npcMsg]);
      setChosenEvidence([]);
    } catch (e) {
      setError(e.message);
      setLog((l) => [...l, { role: 'system', text: `(error: ${e.message})` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h2>Interrogation Room</h2>
      <p className="muted">Ask in natural language. Present evidence to pressure them. Watch their lies.</p>

      <div className="row" style={{ margin: '16px 0', gap: 8, flexWrap: 'wrap' }}>
        {suspects.map((s) => (
          <button
            key={s.id}
            className={`btn ${selected === s.id ? 'primary' : ''}`}
            onClick={() => { setSelected(s.id); setLog([]); setChosenEvidence([]); }}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="chat-log">
        {log.length === 0 && <div className="muted" style={{ fontStyle: 'italic' }}>The room is quiet. Ask {character?.name} something.</div>}
        {log.map((m, i) => (
          <div key={i} className={`bubble ${m.role === 'npc' ? 'npc' : m.role === 'player' ? 'player' : 'system'}`}>
            {m.role !== 'player' && m.role !== 'system' && <div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>{character?.name}</div>}
            <span>{m.text}</span>
            {m.lie && <div className="bad" style={{ fontSize: 12, marginTop: 4 }}>🔍 they're lying — press harder</div>}
            {m.meta && <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{m.meta}</div>}
            {m.rejected && <div className="warn" style={{ fontSize: 12, marginTop: 4 }}>(they nearly slipped up)</div>}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <label>Present evidence (optional)</label>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {inventory.map((e) => (
            <button
              key={e.id}
              className={`btn ${chosenEvidence.includes(e.id) ? 'primary' : ''}`}
              onClick={() =>
                setChosenEvidence((c) => c.includes(e.id) ? c.filter((x) => x !== e.id) : [...c, e.id])
              }
            >
              {e.title}
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
            {busy ? 'Listening…' : 'Ask'}
          </button>
        </div>
        {error && <div className="bad" style={{ marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  );
}
