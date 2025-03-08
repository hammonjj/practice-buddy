import React from 'react';
import { Flame } from 'lucide-react';
import { MetricCard } from '../MetricCard';
import { PracticeSession } from '../../../types';
import { isWithinInterval, startOfDay, subDays } from 'date-fns';

interface CurrentStreakProps {
  sessions: PracticeSession[];
}

export function CurrentStreak({ sessions }: CurrentStreakProps) {
  const calculateStreak = () => {
    let currentStreak = 0;
    let checking = true;
    let checkDate = new Date();
    
    while (checking) {
      const daysSessions = sessions.filter(session => 
        isWithinInterval(new Date(session.date), {
          start: startOfDay(checkDate),
          end: new Date(checkDate.setHours(23, 59, 59, 999))
        })
      );
      
      if (daysSessions.length > 0 && daysSessions.some(s => s.completed)) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        checking = false;
      }
    }
    
    return currentStreak;
  };

  return (
    <MetricCard
      icon={Flame}
      label="Current Streak"
      value={`${calculateStreak()} days`}
    />
  );
}