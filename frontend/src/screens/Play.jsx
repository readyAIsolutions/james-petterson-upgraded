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

const VIEWS = ['briefing', 'scene', 'board', 'timeline', 'suspects', 'interview', 'accuse', 'debrief'];

export default function Play({ session, onExit }) {
  const [view, setView] = useState('briefing');
  const [caseData, setCaseData] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [discovered, setDiscovered] = useState({});
  const [result, setResult] = useState(null); // accusation result
  const [error, setError] = useState(null);

  const sid = session.id;
  const caseId = session.case_id;

  // Load case + inventory on mount.
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

  const navLabels = {
    briefing: 'Briefing', scene: 'Scene', board: 'Evidence Board', timeline: 'Timeline',
    suspects: 'Suspects', interview: 'Interview', accuse: 'Accuse', debrief: 'Debrief',
  };

  const renderView = () => {
    const shared = { caseData, inventory, discovered, discover, suspects };
    switch (view) {
      case 'briefing': return <Briefing {...shared} onContinue={() => setView('scene')} />;
      case 'scene': return <Scene {...shared} evidenceById={evidenceById} />;
      case 'board': return <Board {...shared} evidenceById={evidenceById} />;
      case 'timeline': return <Timeline {...shared} />;
      case 'suspects': return <Suspects {...shared} onInterview={(cid) => { setView('interview'); }} />;
      case 'interview': return <Interview {...shared} sessionId={sid} />;
      case 'accuse': return <Accusation {...shared} sessionId={sid} onResult={(r) => { setResult(r); setView('debrief'); }} />;
      case 'debrief': return <Debrief {...shared} result={result} />;
      default: return null;
    }
  };

  return (
    <div className="app-shell">
      <div className="topbar">
        <span className="brand">The Detective's Board</span>
        <button className="btn ghost" onClick={onExit}>← Exit</button>
        <span className="case-title">{caseData?.title || session.case_id}</span>
        <span className="spacer" />
        <span className="pill">{suspects.filter((s) => s.role === 'suspect').length} suspects</span>
        <span className="pill">{inventory.length} evidence</span>
      </div>

      <div className="main" style={{ height: '100%', overflow: 'hidden', display: 'flex' }}>
        <div className="play-grid" style={{ width: '100%' }}>
          <aside className="sidebar">
            {VIEWS.map((v) => (
              <button
                key={v}
                className={`nav-item ${view === v ? 'active' : ''}`}
                onClick={() => setView(v)}
              >
                {navLabels[v]}
                {v === 'scene' && <span className="count">{inventory.length}</span>}
              </button>
            ))}
          </aside>
          <section className="detail">{renderView()}</section>
        </div>
      </div>

      {error && (
        <div className="status-bar"><span className="bad">⚠ {error}</span></div>
      )}
    </div>
  );
}
