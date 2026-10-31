import React, { useEffect, useState } from 'react';

const TYPE_ICON = { physical: '🧪', document: '📄', digital: '💾', audio: '🎧', testimony: '🗣️' };

// Player theories are the player's own notes, kept in this browser only.
// They are never sent to the server and never treated as confirmed fact.
export const theoryKey = (sid, evId) => `theory:${sid}:${evId}`;

export default function Closeup({ ev, sessionId, onClose }) {
  const [theory, setTheory] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (ev) {
      setTheory(localStorage.getItem(theoryKey(sessionId, ev.id)) || '');
      setSaved(false);
    }
  }, [ev, sessionId]);

  if (!ev) return null;
  const save = () => { localStorage.setItem(theoryKey(sessionId, ev.id), theory); setSaved(true); };

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={ev.title}>
        <div className="row spread">
          <span className="etype">{TYPE_ICON[ev.type] || '📦'} {ev.type}</span>
          <button className="btn ghost small" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <h2 className="font-serif" style={{ margin: '8px 0' }}>{ev.title}</h2>
        <p className="font-serif" style={{ lineHeight: 1.75, fontSize: 16 }}>{ev.description}</p>
        {ev.type === 'audio' && (
          <p className="muted" style={{ fontSize: 12.5 }}>Full transcript shown above. Every audio clue is captioned.</p>
        )}
        <div className="field" style={{ marginTop: 16 }}>
          <label>
            Your theory <span className="muted" style={{ fontWeight: 400 }}>— your own guess, not confirmed fact</span>
          </label>
          <textarea rows={3} value={theory} placeholder="What do you think this means?"
            onChange={(e) => { setTheory(e.target.value); setSaved(false); }} />
          <div className="row" style={{ marginTop: 8, gap: 8 }}>
            <button className="btn small primary" onClick={save}>Save theory</button>
            {saved && <span className="good" style={{ fontSize: 13 }}>Saved as your theory</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
