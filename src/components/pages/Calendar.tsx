import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../atoms/Button';
import { CalendarDay } from '../molecules/CalendarDay';
import { SessionDetails } from '../molecules/SessionDetails';
import { usePracticeSessions } from '../../hooks/usePracticeSessions';
import { PracticeSession } from '../../types';

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { sessions, addSession, updateSession } = usePracticeSessions();
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSession, setSelectedSession] = useState<PracticeSession | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleAddSession = (date: Date) => {
    setSelectedDate(date);
    setIsAddingSession(true);
  };

  const handleSessionSubmit = (sessionData: Partial<PracticeSession>) => {
    if (selectedDate) {
      addSession({
        title: sessionData.title || 'Practice Session',
        date: selectedDate,
        duration: sessionData.duration || 30,
        routineId: sessionData.routineId || '',
        completed: false,
        notes: sessionData.notes
      });
      setIsAddingSession(false);
      setSelectedDate(null);
    }
  };

  const handleToggleComplete = (id: string, completed: boolean) => {
    updateSession(id, { completed });
    setSelectedSession(prev => prev ? { ...prev, completed } : null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Practice Calendar</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium min-w-32 text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-surface/20 rounded-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="bg-surface/50 p-2 text-center text-sm font-medium text-white/60"
          >
            {day}
          </div>
        ))}
        
        {daysInMonth.map(day => {
          const daysSessions = sessions.filter(session => 
            format(new Date(session.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
          );

          return (
            <CalendarDay
              key={format(day, 'yyyy-MM-dd')}
              date={day}
              sessions={daysSessions}
              isToday={isToday(day)}
              onAddSession={() => handleAddSession(day)}
              onViewSession={setSelectedSession}
            />
          );
        })}
      </div>

      {isAddingSession && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-surface p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Practice Session</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSessionSubmit({
                  title: formData.get('title') as string,
                  duration: Number(formData.get('duration')),
                  notes: formData.get('notes') as string
                });
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="w-full bg-background/50 rounded-lg px-3 py-2 text-white"
                  placeholder="Practice Session"
                />
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  min="1"
                  className="w-full bg-background/50 rounded-lg px-3 py-2 text-white"
                  defaultValue="30"
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  className="w-full bg-background/50 rounded-lg px-3 py-2 text-white"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddingSession(false);
                    setSelectedDate(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Session
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedSession && (
        <SessionDetails
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onToggleComplete={handleToggleComplete}
        />
      )}
    </div>
  );
}