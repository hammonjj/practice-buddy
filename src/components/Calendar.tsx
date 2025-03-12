import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPracticeSessions, getRoutines, createPracticeSession, createSpontaneousPracticeSession } from '../lib/localStorageDB';
import { PracticeSession, Routine } from '../models/models';
import { ChevronLeft, ChevronRight, Plus, Clock, Calendar as CalendarIcon, X, Check, Edit, Music } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  getDay,
  isToday
} from 'date-fns';

const Calendar: React.FC = () => {
  const { currentUser, userData, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showSpontaneous, setShowSpontaneous] = useState(false);
  const [quickAddDate, setQuickAddDate] = useState<Date | null>(null);
  const [selectedRoutines, setSelectedRoutines] = useState<Record<string, boolean>>({});
  const [isAddingSession, setIsAddingSession] = useState(false);
  
  // Spontaneous practice state
  const [spontaneousName, setSpontaneousName] = useState('');
  const [spontaneousCategory, setSpontaneousCategory] = useState('General');
  const [spontaneousDuration, setSpontaneousDuration] = useState(30);
  const [spontaneousNotes, setSpontaneousNotes] = useState('');
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/');
    }
  }, [currentUser, isLoading, navigate]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      try {
        // Get sessions from localStorage
        const sessionsData = getPracticeSessions(currentUser.id);
        setSessions(sessionsData);
        
        // Get routines
        const routinesData = getRoutines(currentUser.id);
        setRoutines(routinesData);
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [currentUser]);

  // Generate calendar grid
  const generateCalendarGrid = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = monthStart;
    const endDate = monthEnd;
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const firstDayOfMonth = getDay(monthStart); // 0 for Sunday, 1 for Monday, etc.
    
    const grid: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      grid.push(null);
    }
    
    // Add all days of the month
    grid.push(...days);
    
    // Fill the rest of the grid to have a complete rectangular grid
    const lastWeek = Math.ceil(grid.length / 7);
    const totalCells = lastWeek * 7;
    const remainingCells = totalCells - grid.length;
    
    for (let i = 0; i < remainingCells; i++) {
      grid.push(null);
    }
    
    return grid;
  };

  // Get sessions for a specific day
  const getSessionsForDay = (day: Date): PracticeSession[] => {
    return sessions.filter(session => isSameDay(new Date(session.date), day));
  };

  // Get total practice duration for a specific day
  const getTotalDurationForDay = (day: Date): number => {
    const sessionsOnDay = getSessionsForDay(day);
    return sessionsOnDay.reduce((total, session) => total + session.totalDuration, 0);
  };

  // Handle month navigation
  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Handle quick add
  const handleQuickAddOpen = (day: Date) => {
    setQuickAddDate(day);
    setShowQuickAdd(true);
    setShowSpontaneous(false);
    // Reset selected items
    setSelectedRoutines({});
  };

  const handleSpontaneousOpen = (day: Date) => {
    setQuickAddDate(day);
    setShowSpontaneous(true);
    setShowQuickAdd(false);
    // Set default values
    if (userData?.categories.length > 0) {
      setSpontaneousCategory(userData.categories.includes('General') ? 'General' : userData.categories[0]);
    }
    setSpontaneousDuration(userData?.settings?.defaultSessionDuration || 30);
  };

  const handleRoutineSelect = (id: string) => {
    setSelectedRoutines(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleQuickAdd = async () => {
    if (!currentUser || !quickAddDate) return;
    
    const selectedPracticeRoutines = routines.filter(routine => selectedRoutines[routine.id]);
    
    if (selectedPracticeRoutines.length === 0) {
      alert('Please select at least one routine to practice');
      return;
    }
    
    setIsAddingSession(true);
    
    try {
      // Calculate total duration
      const totalDuration = selectedPracticeRoutines.reduce(
        (total, routine) => total + routine.durationInMinutes, 0
      );
      
      // Create session in localStorage
      const sessionId = createPracticeSession(
        currentUser.id,
        quickAddDate, // Use the selected date
        totalDuration,
        'Added from calendar',
        selectedPracticeRoutines
      );
      
      // Refresh sessions
      const sessionsData = getPracticeSessions(currentUser.id);
      setSessions(sessionsData);
      
      // Close modal
      setShowQuickAdd(false);
      setSelectedRoutines({});
      setQuickAddDate(null);
      
      // Navigate to the new session
      navigate(`/session/${sessionId}`);
    } catch (error) {
      console.error('Error adding practice session:', error);
    } finally {
      setIsAddingSession(false);
    }
  };

  const handleSpontaneousAdd = async () => {
    if (!currentUser || !quickAddDate) return;
    
    if (!spontaneousName) {
      alert('Please enter a name for this practice');
      return;
    }
    
    setIsAddingSession(true);
    
    try {
      // Create spontaneous session in localStorage
      const sessionId = createSpontaneousPracticeSession(
        currentUser.id,
        quickAddDate,
        spontaneousDuration,
        spontaneousNotes,
        [{
          name: spontaneousName,
          category: spontaneousCategory,
          durationInMinutes: spontaneousDuration
        }]
      );
      
      // Refresh sessions
      const sessionsData = getPracticeSessions(currentUser.id);
      setSessions(sessionsData);
      
      // Close modal
      setShowSpontaneous(false);
      setSpontaneousName('');
      setSpontaneousNotes('');
      setQuickAddDate(null);
      
      // Navigate to the new session
      navigate(`/session/${sessionId}`);
    } catch (error) {
      console.error('Error adding spontaneous practice:', error);
    } finally {
      setIsAddingSession(false);
    }
  };

  if (isLoading || !isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-dim-200">Loading...</div>
      </div>
    );
  }

  const calendarGrid = generateCalendarGrid();

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dim-100">Practice Calendar</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={previousMonth}
            className="p-2 rounded-full text-dim-300 hover:bg-dim-800 hover:text-dim-100"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold text-dim-200">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-full text-dim-300 hover:bg-dim-800 hover:text-dim-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      {/* Calendar grid */}
      <div className="bg-dim-800 rounded-lg shadow-md overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 text-center py-3 border-b border-dim-700 bg-dim-800">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-dim-300 font-medium">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar cells */}
        <div className="grid grid-cols-7 auto-rows-fr bg-dim-900">
          {calendarGrid.map((day, index) => {
            if (!day) {
              // Empty cell
              return (
                <div 
                  key={`empty-${index}`} 
                  className="border-b border-r border-dim-700 bg-dim-800 opacity-50"
                ></div>
              );
            }
            
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            const sessionsOnDay = getSessionsForDay(day);
            const totalDuration = getTotalDurationForDay(day);
            
            return (
              <div 
                key={format(day, 'yyyy-MM-dd')} 
                className={`min-h-28 border-b border-r border-dim-700 p-1 relative
                  ${isCurrentMonth ? 'bg-dim-800' : 'bg-dim-800 opacity-50'}
                  ${isCurrentDay ? 'ring-1 ring-inset ring-primary-500' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium p-1 rounded-full w-7 h-7 flex items-center justify-center
                    ${isCurrentDay ? 'bg-primary-600 text-white' : 'text-dim-300'}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="flex">
                    <button 
                      className="p-1 rounded-full text-dim-400 hover:bg-dim-700 hover:text-dim-200"
                      onClick={() => handleSpontaneousOpen(day)}
                      title="Add spontaneous practice"
                    >
                      <Music size={16} />
                    </button>
                    <button 
                      className="p-1 rounded-full text-dim-400 hover:bg-dim-700 hover:text-dim-200"
                      onClick={() => handleQuickAddOpen(day)}
                      title="Add routine practice session"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                
                {totalDuration > 0 && (
                  <div className="flex items-center mt-1 text-xs text-dim-300">
                    <Clock size={12} className="mr-1" />
                    <span>{totalDuration} min</span>
                  </div>
                )}
                
                {sessionsOnDay.length > 0 && (
                  <div className="mt-1">
                    {sessionsOnDay.map(session => (
                      <div 
                        key={session.id}
                        onClick={() => navigate(`/session/${session.id}`)}
                        className={`text-xs p-1 rounded my-1 cursor-pointer ${
                          session.isSpontaneous 
                            ? 'bg-accent-900 text-accent-200 hover:bg-accent-800' 
                            : 'bg-primary-900 text-primary-200 hover:bg-primary-800'
                        }`}
                      >
                        <div className="font-medium truncate">
                          {session.isSpontaneous ? 'Spontaneous Practice' : 'Practice Session'}
                        </div>
                        <div className="flex justify-between text-[10px] text-primary-300">
                          <span>{session.totalDuration} min</span>
                          <span>{session.items.length} {session.items.length === 1 ? 'item' : 'items'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Quick Add Modal - Routines */}
      {showQuickAdd && quickAddDate && (
        <div className="fixed inset-0 bg-dim-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-dim-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-dim-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-dim-100">
                Add Routine Practice for {format(quickAddDate, 'MMMM d, yyyy')}
              </h3>
              <button 
                onClick={() => setShowQuickAdd(false)}
                className="text-dim-400 hover:text-dim-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-dim-300 mb-4">Select routines to practice:</p>
              
              <div className="max-h-64 overflow-y-auto">
                {routines.length === 0 ? (
                  <p className="text-dim-400 text-center py-4">
                    No routines found. Please add some routines first.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {routines.map(routine => (
                      <div
                        key={routine.id}
                        onClick={() => handleRoutineSelect(routine.id)}
                        className={`p-3 rounded-md cursor-pointer transition
                          ${selectedRoutines[routine.id] 
                            ? 'bg-primary-900 border border-primary-700' 
                            : 'bg-dim-700 hover:bg-dim-600 border border-dim-700'}`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-dim-100">{routine.name}</h4>
                            <div className="flex items-center text-dim-400 text-sm">
                              <span>{routine.category}</span>
                              <span className="mx-2">•</span>
                              <span>{routine.durationInMinutes} min</span>
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center
                            ${selectedRoutines[routine.id] 
                              ? 'bg-primary-500 text-white' 
                              : 'bg-dim-600 text-dim-400'}`}
                          >
                            {selectedRoutines[routine.id] && <Check size={16} />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-center">
                <button 
                  onClick={() => {
                    setShowQuickAdd(false);
                    handleSpontaneousOpen(quickAddDate);
                  }}
                  className="text-sm text-primary-400 hover:text-primary-300"
                >
                  Or add spontaneous practice instead
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-dim-700 flex justify-end">
              <button
                onClick={() => setShowQuickAdd(false)}
                className="px-4 py-2 text-dim-300 hover:text-dim-100 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickAdd}
                disabled={isAddingSession || Object.values(selectedRoutines).filter(Boolean).length === 0}
                className="px-4 py-2 bg-primary-700 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
              >
                {isAddingSession ? 'Adding...' : 'Add Session'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Spontaneous Practice Modal */}
      {showSpontaneous && quickAddDate && (
        <div className="fixed inset-0 bg-dim-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-dim-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-dim-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-dim-100">
                Add Spontaneous Practice for {format(quickAddDate, 'MMMM d, yyyy')}
              </h3>
              <button 
                onClick={() => setShowSpontaneous(false)}
                className="text-dim-400 hover:text-dim-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dim-200 mb-1">
                    What did you practice?
                  </label>
                  <input
                    type="text"
                    value={spontaneousName}
                    onChange={(e) => setSpontaneousName(e.target.value)}
                    placeholder="E.g., Improvisation, Scales, etc."
                    className="w-full px-3 py-2 border border-dim-700 rounded-md focus:outline-none focus:border-primary-500 bg-dim-800 text-dim-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dim-200 mb-1">
                    Category
                  </label>
                  <select
                    value={spontaneousCategory}
                    onChange={(e) => setSpontaneousCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-dim-700 rounded-md focus:outline-none focus:border-primary-500 bg-dim-800 text-dim-100"
                  >
                    {userData?.categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dim-200 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={240}
                    value={spontaneousDuration}
                    onChange={(e) => setSpontaneousDuration(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-dim-700 rounded-md focus:outline-none focus:border-primary-500 bg-dim-800 text-dim-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dim-200 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={spontaneousNotes}
                    onChange={(e) => setSpontaneousNotes(e.target.value)}
                    placeholder="Any notes about this practice session..."
                    className="w-full px-3 py-2 border border-dim-700 rounded-md focus:outline-none focus:border-primary-500 bg-dim-800 text-dim-100"
                  />
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <button 
                  onClick={() => {
                    setShowSpontaneous(false);
                    handleQuickAddOpen(quickAddDate);
                  }}
                  className="text-sm text-primary-400 hover:text-primary-300"
                >
                  Or use saved routines instead
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-dim-700 flex justify-end">
              <button
                onClick={() => setShowSpontaneous(false)}
                className="px-4 py-2 text-dim-300 hover:text-dim-100 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSpontaneousAdd}
                disabled={isAddingSession || !spontaneousName || spontaneousDuration <= 0}
                className="px-4 py-2 bg-accent-700 text-white rounded-md hover:bg-accent-600 disabled:opacity-50"
              >
                {isAddingSession ? 'Adding...' : 'Add Practice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;