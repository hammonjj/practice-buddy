import React from 'react';
import { Clock } from 'lucide-react';
import { MetricCard } from '../MetricCard';
import { PracticeSession } from '../../../types';

interface TotalPracticeTimeProps {
  sessions: PracticeSession[];
}

export function TotalPracticeTime({ sessions }: TotalPracticeTimeProps) {
  const totalMinutes = sessions.reduce((acc, session) => acc + session.duration, 0);
  
  return (
    <MetricCard
      icon={Clock}
      label="Total Practice Time"
      value={`${totalMinutes} minutes`}
    />
  );
}