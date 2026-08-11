import React, { useState } from 'react';
import { api } from '../api';

export default function Accusation({ suspects, caseData, sessionId, onResult, onReveal }) {
  const suspectsOnly = suspects.filter((s) => s.role === 'suspect');
  const [culpritId, setCulpritId] = useState(suspectsOnly[0]?.id || '');
  const [motive, setMotive] = useState('');
  const [method, setMethod] = useState('');
  const [timeline, setTimeline] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const events = caseData?.events || [];

  const toggleEvent = (id) =>
    setTimeline((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  const submit = async () => {
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const res = await api.accuse(sessionId, {
        culpritId, motive, method, timeline: timeline.sort(),
      });
      onResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h2>Make Your Accusation</h2>
      <p className="muted">Name the culprit. State the motive and method. Reconstruct the timeline.</p>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 16, gap: 16 }}>
        <div>
          <div className="card">
            <div className="field">
              <label>The Culprit</label>
              {suspectsOnly.map((s) => (
                <div key={s.id} className="row" style={{ marginBottom: 8 }}>
                  <button
                    className="btn"
                    style={{ width: '100%', textAlign: 'left', borderColor: culpritId === s.id ? 'var(--accent)' : undefined }}
                    onClick={() => setCulpritId(s.id)}
                  >
                    <span style={{ fontWeight: 700 }}>{s.name}</span>
                    {culpritId === s.id && <span className="accent"> ✓</span>}
                  </button>
                </div>
              ))}
            </div>

            <div className="field">
              <label>Motive</label>
              <textarea rows={2} placeholder="e.g. wanted the inheritance" value={motive} onChange={(e) => setMotive(e.target.value)} />
            </div>
            <div className="field">
              <label>Method</label>
              <textarea rows={2} placeholder="e.g. poisoned the tea" value={method} onChange={(e) => setMethod(e.target.value)} />
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <label>Reconstructed Timeline</label>
            <p className="muted" style={{ fontSize: 12, margin: '4px 0 10px' }}>Select the events in the order you believe they occurred.</p>
            <div className="col">
              {events.map((e) => (
                <div key={e.id} className="evidence-item" onClick={() => toggleEvent(e.id)}>
                  <div className="row spread">
                    <div>
                      <div className="etype">{e.start}</div>
                      <div style={{ fontWeight: 700 }}>{e.title || e.id}</div>
                    </div>
                    <input type="checkbox" readOnly checked={timeline.includes(e.id)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button className="btn danger" onClick={submit} disabled={busy || !culpritId}>
          {busy ? 'Adjudicating…' : 'Submit Accusation'}
        </button>
        {error && <span className="bad" style={{ marginLeft: 12 }}>{error}</span>}
      </div>
    </div>
  );
}
