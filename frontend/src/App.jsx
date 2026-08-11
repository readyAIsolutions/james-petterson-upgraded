import React, { useEffect, useState } from 'react';
import { api } from './api';
import Landing from './screens/Landing';
import Play from './screens/Play';

export default function App() {
  const [health, setHealth] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth(null));
  }, []);

  const startCase = async (caseId) => {
    const s = await api.startSession(caseId);
    setSession(s);
  };

  if (session) {
    return <Play session={session} onExit={() => setSession(null)} />;
  }

  return <Landing health={health} onStart={startCase} />;
}
