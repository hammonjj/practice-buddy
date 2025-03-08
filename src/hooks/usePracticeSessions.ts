import { useState, useEffect } from 'react';
import { PracticeSession } from '../types';

export function usePracticeSessions() {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('practiceSessions');
    if (stored) {
      setSessions(JSON.parse(stored).map((session: any) => ({
        ...session,
        date: new Date(session.date),
      })));
    }
  }, []);

  const addSession = (session: Omit<PracticeSession, 'id'>) => {
    const newSession = {
      ...session,
      id: crypto.randomUUID(),
    };
    setSessions(prev => {
      const updated = [...prev, newSession];
      localStorage.setItem('practiceSessions', JSON.stringify(updated));
      return updated;
    });
  };

  const updateSession = (id: string, updates: Partial<PracticeSession>) => {
    setSessions(prev => {
      const updated = prev.map(session =>
        session.id === id ? { ...session, ...updates } : session
      );
      localStorage.setItem('practiceSessions', JSON.stringify(updated));
      return updated;
    });
  };

  return { sessions, addSession, updateSession };
}