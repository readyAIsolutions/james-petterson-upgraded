import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import Briefing from './Briefing';
import Scene from './Scene';
import Board from './Board';
import Timeline from './Timeline';
import Suspects from './Suspects';
import Interview from './Interview';
import Accusation from './Accusation';
import Debrief from './Debrief';

const VIEWS = [
  { key: 'briefing', label: 'Briefing', icon: '📜' },
  { key: 'scene', label: 'The Scene', icon: '🔍' },
  { key: 'board', label: 'Evidence Board', icon: '🗂️' },
  { key: 'timeline', label: 'Timeline', icon: '🕰️' },
  { key: 'suspects', label: 'Suspects', icon: '👥' },
  { key: 'interview', label: 'Interrogation', icon: '🎙️' },
  { key: 'accuse', label: 'Accuse', icon: '⚖️' },
  { key: 'debrief', label: 'Verdict', icon: '🏁' },
];

export default function Play({ session, onExit }) {
  const [view, setView] = useState('briefing');
  const [caseData, setCaseData] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [discovered, setDiscovered] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [interviewTarget, setInterviewTarget] = useState(null);

  const sid = session.id;
  const caseId = session.case_id;

  useEffect(() => {
    let mounted = true;
    Promise.all([api.loadCase(caseId), api.inventory(sid)])
      .then(([c, inv]) => {
        if (!mounted) return;
        setCaseData(c);
        setInventory(inv.evidence);
        const disc = {};
        inv.evidence.forEach((e) => (disc[e.id] = true));
        setDiscovered(disc);
      })
      .catch((e) => setError(e.message));
    return () => { mounted = false; };
  }, [caseId, sid]);

  const discover = async (evidenceId) => {
    try {
      await api.discover(sid, evidenceId);
      setDiscovered((d) => ({ ...d, [evidenceId]: true }));
      const inv = await api.inventory(sid);
      setInventory(inv.evidence);
    } catch (e) { setError(e.message); }
  };

  const evidenceById = useMemo(() => {
    const m = {};
    (caseData?.evidence || []).forEach((e) => (m[e.id] = e));
    return m;
  }, [caseData]);

  const suspects = useMemo(
    () => (caseData?.characters || []).filter((c) => c.role === 'suspect' || c.role === 'witness'),
    [caseData]
  );

  // Progress: current index within VIEWS
  const viewIdx = Math.max(0, VIEWS.findIndex((v) => v.key === view));

  const renderView = () => {
    const shared = { caseData, inventory, discovered, discover, suspects };
    switch (view) {
      case 'briefing': return <Briefing {...shared} onContinue={async () => { try { await api.markBriefingSeen(sid); } catch (e) {} setView('scene'); }} />;
      case 'scene': return <Scene {...shared} evidenceById={evidenceById} />;
      case 'board': return <Board {...shared} evidenceById={evidenceById} />;
      case 'timeline': return <Timeline {...shared} />;
      case 'suspects': return <Suspects {...shared} onInterview={(cid) => { setInterviewTarget(cid); setView('interview'); }} />;
      case 'interview': return <Interview {...shared} sessionId={sid} initialSelected={interviewTarget} />;
      case 'accuse': return <Accusation {...shared} sessionId={sid} onResult={(r) => { setResult(r); setView('debrief'); }} />;
      case 'debrief': return <Debrief {...shared} result={result} onExit={onExit} />;
      default: return null;
    }
  };

  return (
    <div className="app-shell">
      <div className="topbar">
        <span className="brand"><span className="logo">⌁</span>Board</span>
        <span className="case-title font-serif" style={{ fontStyle: 'italic' }}>{caseData?.title || session.case_id}</span>
        <span className="spacer" />
        <button className="btn ghost small" onClick={onExit}>← Exit case</button>
      </div>

      <div className="steps">
        {VIEWS.map((v, i) => (
          <div key={v.key} className={`step ${i < viewIdx ? 'done' : i === viewIdx ? 'now' : ''}`} />
        ))}
      </div>

      <div className="main" style={{ paddingTop: 14, overflow: 'hidden', display: 'flex' }}>
        <div className="play-grid" style={{ width: '100%' }}>
          <aside className="sidebar">
            {VIEWS.map((v) => (
              <button
                key={v.key}
                className={`nav-item ${view === v.key ? 'active' : ''}`}
                onClick={() => setView(v.key)}
                title={v.key === 'interview' && !interviewTarget ? 'Pick a suspect first' : undefined}
              >
                <span className="icon">{v.icon}</span>
                {v.label}
                {v.key === 'scene' && <span className="count">{inventory.length}</span>}
                {v.key === 'suspects' && <span className="count">{suspects.filter((s) => s.role === 'suspect').length}</span>}
                {v.key === 'debrief' && result && <span className="count" style={{ background: 'rgba(74,222,128,0.2)', color: 'var(--good)' }}>{result.score}</span>}
              </button>
            ))}
            <div className="muted" style={{ fontSize: 11.5, marginTop: 14, padding: '0 8px' }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>CASE PROGRESS</div>
              <div className="muted" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="good">●</span> {inventory.length} evidence collected
              </div>
            </div>
          </aside>
          <section className="detail" key={view}>{renderView()}</section>
        </div>
      </div>

      {error && (
        <div className="status-bar" style={{ padding: 10, textAlign: 'center' }}>
          <span className="bad">⚠ {error}</span>
        </div>
      )}
    </div>
  );
}