import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Save, ArrowLeft } from 'lucide-react';

const Settings: React.FC = () => {
  const { currentUser, userData, isLoading, updateUserData } = useAuth();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState('');
  const [dailyGoal, setDailyGoal] = useState(60);
  const [weeklyGoal, setWeeklyGoal] = useState(300);
  const [defaultDuration, setDefaultDuration] = useState(30);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/');
    }
  }, [currentUser, isLoading, navigate]);

  // Load user data
  useEffect(() => {
    if (userData) {
      setDisplayName(userData.displayName || '');
      setDailyGoal(userData.settings.dailyGoalInMinutes);
      setWeeklyGoal(userData.settings.weeklyGoalInMinutes);
      setDefaultDuration(userData.settings.defaultSessionDuration);
      setCategories(userData.categories);
    }
  }, [userData]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !userData) return;
    
    setIsSaving(true);
    
    try {
      await updateUserData({
        displayName,
        categories,
        settings: {
          dailyGoalInMinutes: dailyGoal,
          weeklyGoalInMinutes: weeklyGoal,
          defaultSessionDuration: defaultDuration
        }
      });
      
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategories(categories.filter(category => category !== categoryToRemove));
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
          <h1 className="text-2xl font-bold text-dim-100">Settings</h1>
        </div>
        
        <div className="bg-dim-800 rounded-lg shadow-md p-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-dim-200 mb-1">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-dim-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-dim-800 text-dim-100"
              />
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-dim-100 mb-3">Practice Goals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dailyGoal" className="block text-sm font-medium text-dim-200 mb-1">
                    Daily Goal (minutes)
                  </label>
                  <input
                    type="number"
                    id="dailyGoal"
                    min={5}
                    max={240}
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-dim-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-dim-800 text-dim-100"
                  />
                </div>
                
                <div>
                  <label htmlFor="weeklyGoal" className="block text-sm font-medium text-dim-200 mb-1">
                    Weekly Goal (minutes)
                  </label>
                  <input
                    type="number"
                    id="weeklyGoal"
                    min={30}
                    max={1200}
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-dim-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-dim-800 text-dim-100"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="defaultDuration" className="block text-sm font-medium text-dim-200 mb-1">
                Default Session Duration (minutes)
              </label>
              <input
                type="number"
                id="defaultDuration"
                min={5}
                max={120}
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-dim-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-dim-800 text-dim-100"
              />
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-dim-100 mb-3">Categories</h2>
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Add new category"
                    className="flex-1 px-3 py-2 border border-dim-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-dim-800 text-dim-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-primary-700 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <div key={index} className="inline-flex items-center bg-dim-700 rounded-full px-3 py-1">
                    <span className="text-dim-100 text-sm">{category}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(category)}
                      className="ml-2 text-dim-400 hover:text-dim-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-700 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <Save size={18} className="mr-2" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;