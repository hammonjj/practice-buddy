import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Routine, PracticeSession } from '../models/models';
import { format } from 'date-fns';
import { Clock, Play, PlusCircle, Filter, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  getRoutines, 
  createPracticeSession,
  deleteRoutine
} from '../lib/localStorageDB';

const Home: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutines, setSelectedRoutines] = useState<Record<string, boolean>>({});
  const [expandedRoutines, setExpandedRoutines] = useState<Record<string, boolean>>({});
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/');
    }
  }, [currentUser, isLoading, navigate]);

  // Fetch routines
  useEffect(() => {
    const fetchRoutines = async () => {
      if (!currentUser) return;
      
      try {
        // Get routines from localStorage
        const items = getRoutines(currentUser.id);
        setRoutines(items);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching routines:', error);
      }
    };
    
    fetchRoutines();
  }, [currentUser]);

  const handleRoutineSelect = (id: string) => {
    setSelectedRoutines(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleRoutineExpansion = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent routine selection when clicking expand
    setExpandedRoutines(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleStartSession = async () => {
    if (!currentUser) return;
    
    setIsStartingSession(true);
    const selectedPracticeRoutines = routines.filter(routine => selectedRoutines[routine.id]);
    
    if (selectedPracticeRoutines.length === 0) {
      alert('Please select at least one routine to practice');
      setIsStartingSession(false);
      return;
    }
    
    try {
      // Calculate total duration
      const totalDuration = selectedPracticeRoutines.reduce(
        (total, routine) => total + routine.durationInMinutes, 0
      );
      
      // Create session in localStorage
      const sessionId = createPracticeSession(
        currentUser.id,
        new Date(),
        totalDuration,
        '',
        selectedPracticeRoutines
      );
      
      // Navigate to session detail
      navigate(`/session/${sessionId}`);
    } catch (error) {
      console.error('Error starting session:', error);
      setIsStartingSession(false);
    }
  };

  const handleDeleteRoutine = async (routineId: string) => {
    if (!currentUser) return;
    
    try {
      deleteRoutine(routineId);
      
      // Update the routines list
      const updatedRoutines = getRoutines(currentUser.id);
      setRoutines(updatedRoutines);
      
      // Clear delete confirmation
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting routine:', error);
    }
  };

  const getFilteredItems = () => {
    if (!filter) return routines;
    return routines.filter(routine => {
      // Check if any section has the category
      return routine.sections.some(section => section.name.includes(filter));
    });
  };

  // Get all unique section names for filtering
  const getSectionNames = () => {
    const names = new Set<string>();
    routines.forEach(routine => {
      routine.sections.forEach(section => {
        if (section.name) names.add(section.name);
      });
    });
    return Array.from(names);
  };

  const sectionNames = getSectionNames();

  if (isLoading || !isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-dim-200">Loading...</div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dim-100">Practice Routines</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <button 
              className="flex items-center space-x-1 bg-dim-800 hover:bg-dim-700 text-dim-200 py-2 px-4 rounded-md transition"
              onClick={() => setFilter(null)}
            >
              <Filter size={18} />
              <span>{filter || 'All Sections'}</span>
            </button>
            {filter && (
              <button 
                className="absolute right-0 top-0 -mt-2 -mr-2 bg-red-800 text-dim-100 rounded-full w-5 h-5 flex items-center justify-center"
                onClick={() => setFilter(null)}
              >
                ×
              </button>
            )}
          </div>
          <button 
            className="flex items-center space-x-1 bg-primary-700 hover:bg-primary-600 text-white py-2 px-4 rounded-md transition"
            onClick={() => navigate('/add')}
          >
            <PlusCircle size={18} />
            <span>Add Routine</span>
          </button>
          <button 
            className="flex items-center space-x-1 bg-accent-700 hover:bg-accent-600 text-white py-2 px-4 rounded-md transition"
            onClick={handleStartSession}
            disabled={isStartingSession || Object.values(selectedRoutines).filter(Boolean).length === 0}
          >
            <Play size={18} />
            <span>{isStartingSession ? 'Starting...' : 'Start Session'}</span>
          </button>
        </div>
      </div>

      {/* Section name filters */}
      {sectionNames.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            className={`px-3 py-1 rounded-full text-sm ${!filter ? 'bg-primary-700 text-white' : 'bg-dim-800 text-dim-200 hover:bg-dim-700'}`}
            onClick={() => setFilter(null)}
          >
            All
          </button>
          {sectionNames.map(name => (
            <button 
              key={name}
              className={`px-3 py-1 rounded-full text-sm ${filter === name ? 'bg-primary-700 text-white' : 'bg-dim-800 text-dim-200 hover:bg-dim-700'}`}
              onClick={() => setFilter(name)}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {routines.length === 0 ? (
        <div className="bg-dim-800 rounded-lg shadow p-6 text-center">
          <p className="text-dim-300 mb-4">You don't have any practice routines yet.</p>
          <button 
            className="inline-flex items-center space-x-1 bg-primary-700 hover:bg-primary-600 text-white py-2 px-4 rounded-md transition"
            onClick={() => navigate('/add')}
          >
            <PlusCircle size={18} />
            <span>Add Your First Routine</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getFilteredItems().map((routine) => (
            <div 
              key={routine.id}
              className={`bg-dim-800 rounded-lg shadow-md overflow-hidden border-l-4 hover:shadow-lg transition ${
                selectedRoutines[routine.id] ? 'border-accent-500 ring-2 ring-accent-500 ring-opacity-50' : 'border-primary-500'
              }`}
            >
              <div className="p-4 cursor-pointer" onClick={() => handleRoutineSelect(routine.id)}>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-dim-100">{routine.name}</h3>
                  <div className="flex items-center">
                    <button
                      className="text-dim-400 hover:text-dim-200 p-1 mr-1"
                      onClick={(e) => toggleRoutineExpansion(e, routine.id)}
                      title={expandedRoutines[routine.id] ? "Collapse" : "Expand"}
                    >
                      {expandedRoutines[routine.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <button 
                      className="text-dim-400 hover:text-red-400 transition-colors p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(routine.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <p className="text-dim-300 mt-2 line-clamp-2">{routine.description}</p>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center text-dim-400">
                    <Clock size={16} className="mr-1" />
                    <span>{routine.durationInMinutes} min</span>
                  </div>
                  
                  {routine.lastPracticed && (
                    <div className="text-sm text-dim-400">
                      Last: {format(new Date(routine.lastPracticed), 'MMM d')}
                    </div>
                  )}
                </div>
                
                {/* Sections (shown when expanded) */}
                {expandedRoutines[routine.id] && routine.sections && routine.sections.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-dim-700">
                    <h4 className="text-sm font-medium text-dim-200 mb-2">Sections:</h4>
                    <div className="space-y-2">
                      {routine.sections.map((section, index) => (
                        <div key={section.id} className="bg-dim-700 p-2 rounded">
                          <div className="flex justify-between">
                            <span className="text-sm text-dim-100">{section.name}</span>
                            <span className="text-xs text-dim-300">{section.durationInMinutes} min</span>
                          </div>
                          {section.notes && (
                            <p className="text-xs text-dim-400 mt-1">{section.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Delete confirmation */}
              {showDeleteConfirm === routine.id && (
                <div className="bg-dim-700 p-3 border-t border-dim-600">
                  <p className="text-sm text-dim-200 mb-2">Are you sure you want to delete this routine?</p>
                  <div className="flex justify-end space-x-2">
                    <button 
                      className="px-3 py-1 text-xs text-dim-300 hover:text-dim-100"
                      onClick={() => setShowDeleteConfirm(null)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="px-3 py-1 text-xs bg-red-800 text-white rounded"
                      onClick={() => handleDeleteRoutine(routine.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;