import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PracticeSession } from '../models/models';
import { format } from 'date-fns';
import { Clock, Calendar, ChevronRight, Music } from 'lucide-react';
import { getPracticeSessions } from '../lib/localStorageDB';

const SessionHistory: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/');
    }
  }, [currentUser, isLoading, navigate]);

  // Fetch practice sessions
  useEffect(() => {
    const fetchSessions = async () => {
      if (!currentUser) return;
      
      try {
        // Get sessions from localStorage
        const sessionsData = getPracticeSessions(currentUser.id);
        setSessions(sessionsData);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };
    
    fetchSessions();
  }, [currentUser]);

  // Calculate stats
  const totalPracticeTime = sessions.reduce((total, session) => total + session.totalDuration, 0);
  const totalSessions = sessions.length;
  const averageSessionTime = totalSessions > 0 ? Math.round(totalPracticeTime / totalSessions) : 0;
  
  if (isLoading || !isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-dim-200">Loading...</div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-dim-100 mb-6">Practice History</h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-dim-800 rounded-lg shadow-md p-6">
          <h3 className="text-dim-300 text-sm font-medium mb-2">Total Practice Time</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold text-dim-100">{totalPracticeTime}</span>
            <span className="text-dim-400 ml-1">min</span>
          </div>
        </div>
        
        <div className="bg-dim-800 rounded-lg shadow-md p-6">
          <h3 className="text-dim-300 text-sm font-medium mb-2">Total Sessions</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold text-dim-100">{totalSessions}</span>
            <span className="text-dim-400 ml-1">sessions</span>
          </div>
        </div>
        
        <div className="bg-dim-800 rounded-lg shadow-md p-6">
          <h3 className="text-dim-300 text-sm font-medium mb-2">Average Session Time</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold text-dim-100">{averageSessionTime}</span>
            <span className="text-dim-400 ml-1">min</span>
          </div>
        </div>
      </div>
      
      {/* Session list */}
      <div className="bg-dim-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-dim-700">
          <h2 className="text-xl font-semibold text-dim-100">Session History</h2>
        </div>
        
        {sessions.length === 0 ? (
          <div className="p-6 text-center text-dim-400">
            You haven't recorded any practice sessions yet.
          </div>
        ) : (
          <ul className="divide-y divide-dim-700">
            {sessions.map((session) => (
              <li 
                key={session.id}
                className="px-6 py-4 hover:bg-dim-700 cursor-pointer transition"
                onClick={() => navigate(`/session/${session.id}`)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center mb-1">
                      <Calendar size={16} className="text-dim-400 mr-2" />
                      <span className="text-dim-100 font-medium">
                        {format(new Date(session.date), 'MMMM d, yyyy')}
                      </span>
                      {session.isSpontaneous && (
                        <div className="ml-2 flex items-center px-2 py-0.5 text-xs rounded-full bg-accent-900 text-accent-300">
                          <Music size={10} className="mr-1" />
                          <span>Spontaneous</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-dim-400">
                      <Clock size={16} className="mr-2" />
                      <span>{session.totalDuration} minutes</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-dim-400 mr-2">
                      {session.items.length} {session.items.length === 1 ? 'item' : 'items'}
                    </span>
                    <ChevronRight size={20} className="text-dim-500" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SessionHistory;