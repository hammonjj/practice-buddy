import React from 'react';
import { format } from 'date-fns';
import { PracticeSession } from '../../types';

interface CalendarDayProps {
  date: Date;
  sessions: PracticeSession[];
  isToday?: boolean;
  onAddSession: () => void;
  onViewSession: (session: PracticeSession) => void;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  sessions,
  isToday,
  onAddSession,
  onViewSession,
}) => {
  const totalDuration = sessions.reduce((acc, session) => acc + session.duration, 0);

  return (
    <div
      className={`
        min-h-[120px] p-2 border border-surface
        ${isToday ? 'bg-surface/20' : 'bg-background'}
      `}
    >
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm ${isToday ? 'text-accent font-bold' : 'text-white/80'}`}>
          {format(date, 'd')}
        </span>
        {totalDuration > 0 && (
          <span className="text-xs text-white/60">{totalDuration}min</span>
        )}
      </div>
      <div className="space-y-1">
        {sessions.map(session => (
          <button
            key={session.id}
            onClick={() => onViewSession(session)}
            className={`
              w-full text-left text-xs p-1 rounded transition-colors
              ${session.completed ? 'bg-primary/30 hover:bg-primary/40' : 'bg-surface/30 hover:bg-surface/40'}
            `}
          >
            {session.title}
          </button>
        ))}
        <button
          onClick={onAddSession}
          className="w-full text-xs text-white/50 hover:text-white/80 py-1"
        >
          + Add Session
        </button>
      </div>
    </div>
  );
}