import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PracticeItem } from '../models/models';
import { v4 as uuidv4 } from 'uuid';
import { Save, ArrowLeft } from 'lucide-react';
import { addPracticeItem } from '../lib/localStorageDB';

const AddPracticeItem: React.FC = () => {
  const { currentUser, userData, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [description, setDescription] = useState('');
  const [durationInMinutes, setDurationInMinutes] = useState(15);
  const [priority, setPriority] = useState(3);
  const [frequencyPerWeek, setFrequencyPerWeek] = useState(3);
  const [isSaving, setIsSaving] = useState(false);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/');
    }
  }, [currentUser, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    setIsSaving(true);
    
    try {
      const finalCategory = category === 'new' ? newCategory : category;
      
      // Add to localStorage
      addPracticeItem(currentUser.id, {
        name,
        category: finalCategory,
        description,
        durationInMinutes,
        priority,
        frequencyPerWeek
      });
      
      // If it's a new category, add it to the user's categories
      if (category === 'new' && userData && !userData.categories.includes(newCategory)) {
        const updatedCategories = [...userData.categories, newCategory];
        
        await updateUserCategories(updatedCategories);
      }
      
      // Supabase code (kept for later)
      // // Create new item ID
      // const itemId = uuidv4();
      // 
      // // Add to database
      // const { error } = await supabase
      //   .from('practice_items')
      //   .insert({
      //     id: itemId,
      //     user_id: currentUser.id,
      //     name,
      //     category: finalCategory,
      //     description,
      //     duration_in_minutes: durationInMinutes,
      //     priority,
      //     frequency_per_week: frequencyPerWeek,
      //     is_inactive: false
      //   });
      // 
      // if (error) throw error;
      // 
      // // If it's a new category, add it to the user's categories
      // if (category === 'new' && userData && !userData.categories.includes(newCategory)) {
      //   const updatedCategories = [...userData.categories, newCategory];
      //   
      //   const { error: updateError } = await supabase
      //     .from('users')
      //     .update({ categories: updatedCategories })
      //     .eq('id', currentUser.id);
      //     
      //   if (updateError) {
      //     console.error('Error updating user categories:', updateError);
      //   }
      // }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error adding practice item:', error);
      setIsSaving(false);
    }
  };

  const updateUserCategories = async (categories: string[]) => {
    try {
      if (userData) {
        await userData.updateUserData({
          categories
        });
      }
    } catch (error) {
      console.error('Error updating user categories:', error);
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
          <h1 className="text-2xl font-bold text-dim-100">Add Practice Item</h1>
        </div>
        
        <div className="bg-dim-800 rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dim-200 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-dim-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-dim-800 text-dim-100"
                placeholder="E.g., C Major Scale, Moonlight Sonata, etc."
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-dim-200 mb-1">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-3 py-2 border border-dim-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-dim-800 text-dim-100"
              >
                <option value="">Select a category</option>
                {userData?.categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="new">+ Add new category</option>
              </select>
            </div>
            
            {category === 'new' && (
              <div>
                <label htmlFor="newCategory" className="block text-sm font-medium text-dim-200 mb-1">
                  New Category Name
                </label>
                <input
                  type="text"
                  id="newCategory"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-dim-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-dim-800 text-dim-100"
                />
              </div>
            )}
            
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
            
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-dim-200 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                id="duration"
                min={1}
                max={120}
                value={durationInMinutes}
                onChange={(e) => setDurationInMinutes(parseInt(e.target.value))}
                required
                className="w-full px-3 py-2 border border-dim-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-dim-800 text-dim-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dim-200 mb-1">
                Priority (1-5)
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPriority(value)}
                    className={`flex-1 py-2 border ${
                      priority === value
                        ? 'bg-primary-700 text-white border-primary-600'
                        : 'bg-dim-800 text-dim-300 border-dim-700 hover:bg-dim-700'
                    } rounded-md text-center`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-sm text-dim-400">
                5 = Highest priority, 1 = Lowest priority
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dim-200 mb-1">
                Practice Frequency (times per week)
              </label>
              <input
                type="range"
                min={1}
                max={7}
                value={frequencyPerWeek}
                onChange={(e) => setFrequencyPerWeek(parseInt(e.target.value))}
                className="w-full h-2 bg-dim-700 rounded-lg appearance-none cursor-pointer input-range"
              />
              <div className="flex justify-between text-xs text-dim-400 mt-1">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
              </div>
              <p className="mt-1 text-sm text-dim-400">
                Current: {frequencyPerWeek} {frequencyPerWeek === 1 ? 'time' : 'times'} per week
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-700 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <Save size={18} className="mr-2" />
                {isSaving ? 'Saving...' : 'Save Practice Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPracticeItem;