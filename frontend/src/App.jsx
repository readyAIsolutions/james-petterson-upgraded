import React, { useEffect, useState } from 'react';
import { api } from './api';
import Landing from './screens/Landing';
import Play from './screens/Play';

export default function App() {
  const [health, setHealth] = useState(null);
  const [session, setSession] = useState(null);
  const [startError, setStartError] = useState(null);

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth(null));
  }, []);

  const startCase = async (caseId) => {
    setStartError(null);
    try {
      const s = await api.startSession(caseId);
      setSession(s);
    } catch (e) {
      setStartError(e.message || 'Could not open the case. Is the backend running?');
    }
  };

  if (session) {
    return <Play session={session} onExit={() => setSession(null)} />;
  }

  return <Landing health={health} onStart={startCase} startError={startError} />;
}
