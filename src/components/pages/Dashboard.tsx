import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, isWithinInterval, startOfDay } from 'date-fns';
import { usePracticeSessions } from '../../hooks/usePracticeSessions';
import { TotalPracticeTime } from '../molecules/metrics/TotalPracticeTime';
import { CompletionRate } from '../molecules/metrics/CompletionRate';
import { CurrentStreak } from '../molecules/metrics/CurrentStreak';
import { TotalSessions } from '../molecules/metrics/TotalSessions';

export function Dashboard() {
  const { sessions } = usePracticeSessions();
  const today = new Date();
  
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(today, i);
    const daysSessions = sessions.filter(session => 
      isWithinInterval(new Date(session.date), {
        start: startOfDay(date),
        end: new Date(date.setHours(23, 59, 59, 999))
      })
    );
    
    return {
      date: format(date, 'MMM dd'),
      minutes: daysSessions.reduce((acc, session) => acc + session.duration, 0)
    };
  }).reverse();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TotalPracticeTime sessions={sessions} />
        <CompletionRate sessions={sessions} />
        <CurrentStreak sessions={sessions} />
        <TotalSessions sessions={sessions} />
      </div>
      
      <div className="card bg-surface/50 p-6">
        <h2 className="text-lg font-semibold mb-4">Practice Duration Trend</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={last30Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis 
                dataKey="date" 
                stroke="#ffffff60"
                tick={{ fill: '#ffffff60' }}
                tickLine={{ stroke: '#ffffff60' }}
              />
              <YAxis 
                stroke="#ffffff60"
                tick={{ fill: '#ffffff60' }}
                tickLine={{ stroke: '#ffffff60' }}
                label={{ 
                  value: 'Minutes', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: '#ffffff60'
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#424769',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="minutes" 
                stroke="#F6B17A" 
                strokeWidth={2}
                dot={{ fill: '#F6B17A' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}