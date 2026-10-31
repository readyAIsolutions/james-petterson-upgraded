import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function Accusation({ suspects, caseData, sessionId, onResult, inventory = [] }) {
  const suspectsOnly = suspects.filter((s) => s.role === 'suspect');
  const [culpritId, setCulpritId] = useState(suspectsOnly[0]?.id || '');
  const [motive, setMotive] = useState('');
  const [method, setMethod] = useState('');
  const [reason, setReason] = useState('');
  const [evidenceIds, setEvidenceIds] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const events = caseData?.events || [];
  const selectedCulprit = suspects.find((s) => s.id === culpritId);

  const toggleEvent = (id) => setTimeline((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  const toggleEvidence = (id) => setEvidenceIds((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  const submit = async () => {
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const res = await api.accuse(sessionId, {
        culpritId, motive, method,
        timeline: [...timeline].sort(),
        reason: reason.trim(),
        evidenceIds,
      });
      if (res.closed) onResult(res);
      else { setFeedback(res); onResult(res); window.scrollTo && window.scrollTo(0, 0); }
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  return (
    <div>
      <h2>Make Your Accusation</h2>
      {feedback && !feedback.closed && (
        <div className="card" style={{ margin: '14px 0', borderColor: 'rgba(240,184,72,0.6)' }}>
          <div className="violet" style={{ fontWeight: 800 }}>{feedback.verdict === 'partly_correct' ? 'PARTLY CORRECT' : 'NOT QUITE'} · {feedback.attemptsLeft} attempt{feedback.attemptsLeft === 1 ? '' : 's'} left</div>
          <p className="font-serif" style={{ margin: '8px 0 0', lineHeight: 1.7 }}>{feedback.feedback}</p>
        </div>
      )}
      <p className="muted">Name the culprit. State the motive and method. Back it with the evidence and your reasoning. This is your verdict.</p>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 18, gap: 18 }}>
        <div>
          <div className="card">
            <div className="field">
              <label>The Culprit</label>
              {suspectsOnly.map((s) => (
                <div key={s.id} className="row" style={{ marginBottom: 8 }}>
                  <button
                    className="btn"
                    style={{ width: '100%', textAlign: 'left', justifyContent: 'space-between', borderColor: culpritId === s.id ? 'rgba(240,184,72,0.6)' : undefined }}
                    onClick={() => setCulpritId(s.id)}
                  >
                    <span style={{ fontWeight: 700 }}>{s.name}</span>
                    {culpritId === s.id && <span className="good" style={{ fontSize: 18 }}>✓</span>}
                  </button>
                </div>
              ))}
              {selectedCulprit && <p className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>That's a serious accusation, investigator.</p>}
            </div>
            <div className="field">
              <label>Motive</label>
              <textarea rows={2} placeholder="e.g. wanted the inheritance" value={motive} onChange={(e) => setMotive(e.target.value)} />
            </div>
            <div className="field">
              <label>Method</label>
              <textarea rows={2} placeholder="e.g. poisoned the tea" value={method} onChange={(e) => setMethod(e.target.value)} />
            </div>
            <div className="field">
              <label>Your Reasoning <span className="muted" style={{ fontWeight: 400 }}>(the case you will argue)</span></label>
              <textarea rows={3} placeholder="Walk the chain: who had motive, how the evidence convicts them, why the red herrings are innocent…" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <label>Evidence You're Standing On</label>
            <p className="muted" style={{ fontSize: 12.5, margin: '4px 0 12px' }}>Cite what proves it: where they were, how it was done, and why. Naming the right person is not enough.</p>
            <div className="col" style={{ gap: 6 }}>
              {inventory.length === 0 && <span className="muted" style={{ fontSize: 13 }}>Collect evidence from the scene first.</span>}
              {inventory.map((e) => (
                <div key={e.id} className={`evidence-item ${evidenceIds.includes(e.id) ? 'discovered' : ''}`} onClick={() => toggleEvidence(e.id)}>
                  <div className="row spread">
                    <div>
                      <div className="etype">{e.type}</div>
                      <div style={{ fontWeight: 700 }}>{e.title}</div>
                    </div>
                    <span className="collect-check" style={{ fontSize: 16 }}>
                      {evidenceIds.includes(e.id) ? '✓' : '○'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <label>Reconstructed Timeline</label>
            <p className="muted" style={{ fontSize: 12.5, margin: '4px 0 12px' }}>Select the events you believe are part of the crime.</p>
            <div className="col" style={{ gap: 6 }}>
              {events.map((e) => (
                <div key={e.id} className={`evidence-item ${timeline.includes(e.id) ? 'discovered' : ''}`} onClick={() => toggleEvent(e.id)}>
                  <div className="row spread">
                    <div>
                      <div className="etype">{e.start}</div>
                      <div style={{ fontWeight: 700 }}>{e.title || e.id}</div>
                    </div>
                    <span className="collect-check" style={{ fontSize: 16 }}>
                      {timeline.includes(e.id) ? '✓' : '○'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <button className="btn danger big" onClick={submit} disabled={busy || !culpritId}>
          {busy ? 'Adjudicating…' : 'Submit Accusation'}
        </button>
        {error && <span className="bad" style={{ marginLeft: 14 }}>{error}</span>}
      </div>
    </div>
  );
}
