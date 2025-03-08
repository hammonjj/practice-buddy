import React from 'react';
import { Target } from 'lucide-react';
import { MetricCard } from '../MetricCard';
import { PracticeSession } from '../../../types';

interface CompletionRateProps {
  sessions: PracticeSession[];
}

export function CompletionRate({ sessions }: CompletionRateProps) {
  const completedSessions = sessions.filter(s => s.completed).length;
  const completionRate = sessions.length ? (completedSessions / sessions.length) * 100 : 0;
  
  return (
    <MetricCard
      icon={Target}
      label="Completion Rate"
      value={`${completionRate.toFixed(1)}%`}
    />
  );
}