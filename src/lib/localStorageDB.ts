import { v4 as uuidv4 } from 'uuid';
import { 
  PracticeItem, 
  Routine,
  PracticeSession, 
  PracticeSessionItem,
} from '../models/models';

// LocalStorage keys
export const STORAGE_KEYS = {
  USERS: 'practice_buddy_users_data',
  USER: 'practice_buddy_user',
  ROUTINES: 'practice_buddy_routines',
  PRACTICE_SESSIONS: 'practice_buddy_practice_sessions',
  PRACTICE_SESSION_ITEMS: 'practice_buddy_practice_session_items'
};

// Initialize storage
export const initStorage = () => {
  const keys = Object.values(STORAGE_KEYS);
  keys.forEach(key => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify([]));
    }
  });
};

// Generic function to get data from localStorage
const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  if (!data) return [];
  return JSON.parse(data) as T[];
};

// Generic function to save data to localStorage
const saveToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Get current user ID
export const getCurrentUserId = (): string | null => {
  const userData = localStorage.getItem(STORAGE_KEYS.USER);
  if (!userData) return null;
  
  const user = JSON.parse(userData);
  return user.id;
};

// Routines CRUD operations
export const getRoutines = (userId: string): Routine[] => {
  const routines = getFromStorage<any>(STORAGE_KEYS.ROUTINES);
  return routines
    .filter(routine => routine.user_id === userId && !routine.is_inactive)
    .map(routine => ({
      id: routine.id,
      name: routine.name,
      description: routine.description || '',
      sections: routine.sections || [],
      durationInMinutes: routine.duration_in_minutes,
      lastPracticed: routine.last_practiced ? new Date(routine.last_practiced).getTime() : undefined,
      isInactive: routine.is_inactive
    }));
};

export const addRoutine = (userId: string, routine: Omit<Routine, 'id' | 'isInactive' | 'lastPracticed'>): string => {
  const routines = getFromStorage<any>(STORAGE_KEYS.ROUTINES);
  const id = uuidv4();
  
  routines.push({
    id,
    user_id: userId,
    name: routine.name,
    description: routine.description || '',
    sections: routine.sections || [],
    duration_in_minutes: routine.durationInMinutes,
    is_inactive: false,
    created_at: new Date().toISOString()
  });
  
  saveToStorage(STORAGE_KEYS.ROUTINES, routines);
  return id;
};

export const updateRoutine = (routineId: string, updates: Partial<Routine>): void => {
  const routines = getFromStorage<any>(STORAGE_KEYS.ROUTINES);
  const index = routines.findIndex(routine => routine.id === routineId);
  
  if (index !== -1) {
    // Map model fields to storage fields
    const storageUpdates: any = {};
    if (updates.name !== undefined) storageUpdates.name = updates.name;
    if (updates.description !== undefined) storageUpdates.description = updates.description;
    if (updates.durationInMinutes !== undefined) storageUpdates.duration_in_minutes = updates.durationInMinutes;
    if (updates.lastPracticed !== undefined) storageUpdates.last_practiced = new Date(updates.lastPracticed).toISOString();
    if (updates.isInactive !== undefined) storageUpdates.is_inactive = updates.isInactive;
    if (updates.sections !== undefined) storageUpdates.sections = updates.sections;
    
    routines[index] = { ...routines[index], ...storageUpdates };
    saveToStorage(STORAGE_KEYS.ROUTINES, routines);
  }
};

export const deleteRoutine = (routineId: string): void => {
  const routines = getFromStorage<any>(STORAGE_KEYS.ROUTINES);
  const index = routines.findIndex(routine => routine.id === routineId);
  
  if (index !== -1) {
    // Mark as inactive instead of deleting
    routines[index].is_inactive = true;
    saveToStorage(STORAGE_KEYS.ROUTINES, routines);
  }
};

// For backward compatibility
export const getPracticeItems = getRoutines;
export const addPracticeItem = addRoutine;
export const updatePracticeItem = updateRoutine;

// Practice Sessions CRUD operations
export const getPracticeSessions = (userId: string): PracticeSession[] => {
  const sessions = getFromStorage<any>(STORAGE_KEYS.PRACTICE_SESSIONS);
  const sessionsFiltered = sessions.filter(session => session.user_id === userId);
  
  return sessionsFiltered.map(session => {
    // Get session items
    const sessionItems = getSessionItems(session.id);
    
    return {
      id: session.id,
      date: new Date(session.date).getTime(),
      totalDuration: session.total_duration,
      notes: session.notes || '',
      items: sessionItems,
      isSpontaneous: session.is_spontaneous || false
    };
  });
};

export const getPracticeSession = (sessionId: string): PracticeSession | null => {
  const sessions = getFromStorage<any>(STORAGE_KEYS.PRACTICE_SESSIONS);
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session) return null;
  
  const sessionItems = getSessionItems(sessionId);
  
  return {
    id: session.id,
    date: new Date(session.date).getTime(),
    totalDuration: session.total_duration,
    notes: session.notes || '',
    items: sessionItems,
    isSpontaneous: session.is_spontaneous || false
  };
};

export const createPracticeSession = (
  userId: string, 
  date: Date, 
  totalDuration: number, 
  notes: string = '',
  items: PracticeItem[] | Routine[],
  isSpontaneous: boolean = false
): string => {
  // Create session
  const sessions = getFromStorage<any>(STORAGE_KEYS.PRACTICE_SESSIONS);
  const sessionId = uuidv4();
  
  sessions.push({
    id: sessionId,
    user_id: userId,
    date: date.toISOString(),
    total_duration: totalDuration,
    notes: notes,
    is_spontaneous: isSpontaneous,
    created_at: new Date().toISOString()
  });
  
  saveToStorage(STORAGE_KEYS.PRACTICE_SESSIONS, sessions);
  
  // Create session items
  const sessionItems = getFromStorage<any>(STORAGE_KEYS.PRACTICE_SESSION_ITEMS);
  
  const newSessionItems = items.map(item => {
    // Check if item has sections (is a Routine)
    const isRoutine = 'sections' in item && Array.isArray(item.sections);
    
    return {
      id: uuidv4(),
      session_id: sessionId,
      practice_item_id: item.id,
      name: item.name,
      category: 'category' in item ? item.category : 'General',
      duration_in_minutes: item.durationInMinutes,
      notes: '',
      sections: isRoutine ? item.sections : undefined,
      created_at: new Date().toISOString()
    };
  });
  
  sessionItems.push(...newSessionItems);
  saveToStorage(STORAGE_KEYS.PRACTICE_SESSION_ITEMS, sessionItems);
  
  // Update last practiced date for all items
  if (!isSpontaneous) {
    items.forEach(item => {
      updateRoutine(item.id, { lastPracticed: date.getTime() });
    });
  }
  
  return sessionId;
};

export const createSpontaneousPracticeSession = (
  userId: string,
  date: Date,
  totalDuration: number,
  notes: string = '',
  items: Array<{
    name: string;
    category: string;
    durationInMinutes: number;
  }>
): string => {
  // Create temporary routines for spontaneous practice
  const tempItems = items.map(item => ({
    id: uuidv4(), // Generate a temp ID
    name: item.name,
    description: '',
    sections: [],
    durationInMinutes: item.durationInMinutes,
    isInactive: false
  }));
  
  // Create session
  return createPracticeSession(
    userId,
    date,
    totalDuration,
    notes,
    tempItems,
    true // Mark as spontaneous
  );
};

export const updatePracticeSession = (sessionId: string, updates: { notes?: string }): void => {
  const sessions = getFromStorage<any>(STORAGE_KEYS.PRACTICE_SESSIONS);
  const index = sessions.findIndex(session => session.id === sessionId);
  
  if (index !== -1) {
    if (updates.notes !== undefined) sessions[index].notes = updates.notes;
    saveToStorage(STORAGE_KEYS.PRACTICE_SESSIONS, sessions);
  }
};

// Session Items CRUD operations
export const getSessionItems = (sessionId: string): PracticeSessionItem[] => {
  const items = getFromStorage<any>(STORAGE_KEYS.PRACTICE_SESSION_ITEMS);
  
  return items
    .filter(item => item.session_id === sessionId)
    .map(item => ({
      id: item.practice_item_id,
      name: item.name,
      category: item.category || 'General',
      durationInMinutes: item.duration_in_minutes,
      notes: item.notes || '',
      sections: item.sections
    }));
};

export const updateSessionItem = (sessionId: string, itemId: string, updates: { notes?: string }): void => {
  const items = getFromStorage<any>(STORAGE_KEYS.PRACTICE_SESSION_ITEMS);
  const index = items.findIndex(item => item.session_id === sessionId && item.practice_item_id === itemId);
  
  if (index !== -1) {
    if (updates.notes !== undefined) items[index].notes = updates.notes;
    saveToStorage(STORAGE_KEYS.PRACTICE_SESSION_ITEMS, items);
  }
};