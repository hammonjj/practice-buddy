import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Routine, RoutineSection } from '../models/models';
import { v4 as uuidv4 } from 'uuid';
import { Save, ArrowLeft, Plus, X, ChevronUp, ChevronDown, GripVertical, Clock } from 'lucide-react';
import { addRoutine } from '../lib/localStorageDB';

const AddRoutine: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<RoutineSection[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/');
    }
  }, [currentUser, isLoading, navigate]);

  // Calculate total duration from all sections
  const totalDuration = sections.reduce((sum, section) => sum + section.durationInMinutes, 0);

  const handleAddSection = () => {
    const newSection: RoutineSection = {
      id: uuidv4(),
      name: '',
      notes: '',
      durationInMinutes: 5
    };
    setSections([...sections, newSection]);
  };

  const handleRemoveSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  const handleSectionChange = (sectionId: string, field: keyof RoutineSection, value: string | number) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, [field]: value } : section
    ));
  };

  const handleMoveSectionUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    setSections(newSections);
  };

  const handleMoveSectionDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    setSections(newSections);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;

    // Validate that we have at least one section with a name
    if (sections.length === 0) {
      alert('Please add at least one section to your routine');
      return;
    }

    if (sections.some(section => !section.name.trim())) {
      alert('All sections must have a name');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Add to localStorage
      addRoutine(currentUser.id, {
        name,
        description,
        sections,
        durationInMinutes: totalDuration
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error adding routine:', error);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8 text-dim-200">Loading...</div>;
  }

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-dim-400 hover:text-dim-200"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-dim-100">Add Routine</h1>
        </div>
        
        <div className="bg-dim-800 rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dim-200 mb-1">
                Routine Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-dim-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-dim-800 text-dim-100"
                placeholder="E.g., Daily Warm-up, Sonata Practice, etc."
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-dim-200 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-dim-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-dim-800 text-dim-100"
                placeholder="What are you practicing and why?"
              />
            </div>
            
            {/* Sections */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-dim-200">
                  Practice Sections
                </label>
                <div className="flex items-center text-dim-300 text-sm">
                  <Clock size={14} className="mr-1" />
                  <span>Total: {totalDuration} minutes</span>
                </div>
              </div>
              
              {sections.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-dim-600 rounded-md">
                  <p className="text-dim-400 mb-4">No sections added yet.</p>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-primary-700 text-white rounded-md hover:bg-primary-600"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Section
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sections.map((section, index) => (
                    <div key={section.id} className="border border-dim-700 rounded-md p-3 bg-dim-800">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <GripVertical size={16} className="text-dim-500 mr-2" />
                          {section.name ? (
                            <h3 className="text-dim-200 font-medium">{section.name}</h3>
                          ) : (
                            <span className="text-dim-400 italic">Unnamed Section</span>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => handleMoveSectionUp(index)}
                            disabled={index === 0}
                            className="p-1 text-dim-400 hover:text-dim-200 disabled:opacity-50"
                            title="Move up"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveSectionDown(index)}
                            disabled={index === sections.length - 1}
                            className="p-1 text-dim-400 hover:text-dim-200 disabled:opacity-50"
                            title="Move down"
                          >
                            <ChevronDown size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(section.id)}
                            className="p-1 text-red-500 hover:text-red-400"
                            title="Remove section"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-dim-300 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={section.name}
                            onChange={(e) => handleSectionChange(section.id, 'name', e.target.value)}
                            placeholder="E.g., Warmup, Scales, Etude..."
                            className="w-full px-3 py-2 text-sm border border-dim-700 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-dim-800 text-dim-100"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-dim-300 mb-1">
                            Duration (minutes)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={120}
                            value={section.durationInMinutes}
                            onChange={(e) => handleSectionChange(section.id, 'durationInMinutes', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 text-sm border border-dim-700 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-dim-800 text-dim-100"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-dim-300 mb-1">
                            Notes (Optional)
                          </label>
                          <textarea
                            rows={2}
                            value={section.notes}
                            onChange={(e) => handleSectionChange(section.id, 'notes', e.target.value)}
                            placeholder="Additional details about this section..."
                            className="w-full px-3 py-2 text-sm border border-dim-700 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-dim-800 text-dim-100"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="w-full py-2 border border-dashed border-dim-600 rounded-md text-dim-400 hover:text-dim-200 hover:border-dim-500 flex items-center justify-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Section
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving || !name || sections.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-700 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <Save size={18} className="mr-2" />
                {isSaving ? 'Saving...' : 'Save Routine'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRoutine;