import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PracticeSession } from '../models/models';
import { format } from 'date-fns';
import { Clock, Calendar, Save, ArrowLeft, Music } from 'lucide-react';
import {
  getPracticeSession,
  updatePracticeSession,
  updateSessionItem
} from '../lib/localStorageDB';

const SessionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [notes, setNotes] = useState('');
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/');
    }
  }, [currentUser, isLoading, navigate]);

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      if (!currentUser || !id) return;
      
      try {
        // Get session from localStorage
        const sessionData = getPracticeSession(id);
        
        if (sessionData) {
          setSession(sessionData);
          setNotes(sessionData.notes);
          
          // Initialize item notes
          const notes: Record<string, string> = {};
          sessionData.items.forEach(item => {
            notes[item.id] = item.notes || '';
          });
          setItemNotes(notes);
        }
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    
    fetchSession();
  }, [currentUser, id]);

  const handleSave = async () => {
    if (!currentUser || !session || !id) return;
    
    setIsSaving(true);
    
    try {
      // Update session with notes in localStorage
      updatePracticeSession(id, { notes });
      
      // Update session items with notes
      for (const itemId in itemNotes) {
        updateSessionItem(id, itemId, { notes: itemNotes[itemId] });
      }
      
      // Update local session object
      const updatedSession = {
        ...session,
        notes,
        items: session.items.map(item => ({
          ...item,
          notes: itemNotes[item.id] || ''
        }))
      };
      
      setSession(updatedSession);
      alert('Session updated successfully');
    } catch (error) {
      console.error('Error updating session:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-dim-200">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="py-8">
        <div className="max-w-3xl mx-auto bg-dim-800 rounded-lg shadow-md p-6 text-center">
          <h1 className="text-xl font-semibold text-red-400 mb-4">Session Not Found</h1>
          <p className="text-dim-300 mb-4">The practice session you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/history')}
            className="inline-flex items-center px-4 py-2 bg-primary-700 text-white rounded-md hover:bg-primary-600"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate('/history')}
            className="text-dim-400 hover:text-dim-200"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-dim-100">
            {session.isSpontaneous ? 'Spontaneous Practice' : 'Practice Session'}
          </h1>
        </div>
        
        <div className="bg-dim-800 rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6 border-b border-dim-700">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                <Calendar size={20} className="text-dim-400" />
                <span className="font-medium text-dim-100">
                  {format(new Date(session.date), 'MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={20} className="text-dim-400" />
                <span className="font-medium text-dim-100">
                  {session.totalDuration} minutes
                </span>
              </div>
            </div>
            {session.isSpontaneous && (
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-900 text-accent-300">
                <Music size={12} className="mr-1" />
                Spontaneous Practice
              </div>
            )}
          </div>
          
          <div className="p-6">
            <h2 className="text-lg font-semibold text-dim-100 mb-4">
              {session.isSpontaneous ? 'Practice Items' : 'Routines'}
            </h2>
            <div className="space-y-4">
              {session.items.map((item) => (
                <div key={item.id} className="border border-dim-700 rounded-lg p-4 bg-dim-800">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-dim-100">{item.name}</h3>
                      <span className="text-sm text-dim-400">{item.category}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-900 text-primary-300 mr-2">
                        {item.durationInMinutes} min
                      </span>
                    </div>
                  </div>
                  
                  {/* Display sections if expanded and they exist */}
                  {item.sections && item.sections.length > 0 && (
                    <div className="mb-3 space-y-2 border-b border-dim-700 pb-3">
                      {item.sections.map(section => (
                        <div key={section.id} className="bg-dim-700 p-2 rounded">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-dim-200">{section.name}</span>
                            <span className="text-xs bg-dim-600 px-2 py-0.5 rounded-full text-dim-300">
                              {section.durationInMinutes} min
                            </span>
                          </div>
                          {section.notes && (
                            <p className="text-xs text-dim-400 mt-1">{section.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor={`item-notes-${item.id}`} className="block text-sm font-medium text-dim-200 mb-1">
                      Notes
                    </label>
                    <textarea
                      id={`item-notes-${item.id}`}
                      rows={2}
                      className="w-full px-3 py-2 border border-dim-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-dim-800 text-dim-100 text-sm"
                      placeholder="How did this practice go?"
                      value={itemNotes[item.id] || ''}
                      onChange={(e) => setItemNotes({...itemNotes, [item.id]: e.target.value})}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-dim-800 rounded-lg shadow-md p-6 mb-6">
          <label htmlFor="session-notes" className="block text-sm font-medium text-dim-200 mb-1">
            Session Notes
          </label>
          <textarea
            id="session-notes"
            rows={4}
            className="w-full px-3 py-2 border border-dim-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-dim-800 text-dim-100"
            placeholder="Overall thoughts about this practice session..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-700 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <Save size={18} className="mr-2" />
            {isSaving ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;