import React from 'react';
import { Calendar } from 'lucide-react';
import { MetricCard } from '../MetricCard';
import { PracticeSession } from '../../../types';

interface TotalSessionsProps {
  sessions: PracticeSession[];
}

export function TotalSessions({ sessions }: TotalSessionsProps) {
  return (
    <MetricCard
      icon={Calendar}
      label="Total Sessions"
      value={sessions.length}
    />
  );
}