import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as SupabaseUser, 
  Session, 
  AuthError 
} from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../models/models';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  currentUser: SupabaseUser | null;
  userData: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateUserData: (updatedData: Partial<User>) => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Custom hook to access the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthContext');
  }
  return context;
};

// Local storage keys
const LOCAL_STORAGE_USER_KEY = 'practice_buddy_user';
const LOCAL_STORAGE_USERS_DATA_KEY = 'practice_buddy_users_data';

// Convert Supabase user data to our application's User model
const mapUserDataToModel = (userData: any): User => {
  return {
    uid: userData.id,
    email: userData.email,
    displayName: userData.display_name,
    categories: userData.categories || ['General', 'Technique', 'Repertoire', 'Sight Reading'],
    settings: userData.settings || {
      dailyGoalInMinutes: 60,
      weeklyGoalInMinutes: 300,
      defaultSessionDuration: 30
    }
  };
};

// Convert our application's User model to Supabase DB format
const mapModelToUserData = (user: Partial<User>): any => {
  const mapped: any = {};
  
  if (user.displayName !== undefined) mapped.display_name = user.displayName;
  if (user.categories !== undefined) mapped.categories = user.categories;
  if (user.settings !== undefined) mapped.settings = user.settings;
  
  return mapped;
};

export const FirebaseContext: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Initialize users data in localStorage if it doesn't exist
  const initLocalStorage = () => {
    if (!localStorage.getItem(LOCAL_STORAGE_USERS_DATA_KEY)) {
      localStorage.setItem(LOCAL_STORAGE_USERS_DATA_KEY, JSON.stringify([]));
    }
  };

  // Check for auth state changes
  useEffect(() => {
    initLocalStorage();
    // Set the initial auth state from localStorage
    const setInitialUser = async () => {
      const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        await fetchUserData(parsedUser.id);
      }
      setIsLoading(false);
    };

    setInitialUser();

    // For Supabase integration later
    // const { data: { subscription } } = supabase.auth.onAuthStateChange(
    //   async (event, session) => {
    //     setSession(session);
    //     setCurrentUser(session?.user || null);
    //     
    //     if (session?.user) {
    //       await fetchUserData(session.user.id);
    //     } else {
    //       setUserData(null);
    //     }
    //     
    //     setIsLoading(false);
    //   }
    // );

    // // Cleanup subscription
    // return () => {
    //   subscription.unsubscribe();
    // };
  }, []);

  // Fetch user data from localStorage
  const fetchUserData = async (userId: string) => {
    try {
      // Get users data from localStorage
      const usersDataStr = localStorage.getItem(LOCAL_STORAGE_USERS_DATA_KEY);
      if (!usersDataStr) {
        console.error('No users data found in localStorage');
        return;
      }

      const usersData = JSON.parse(usersDataStr);
      const userData = usersData.find((user: any) => user.id === userId);

      // Check if we have data for this user
      if (userData) {
        setUserData(mapUserDataToModel(userData));
      } else {
        // User data not found, which is expected for new users
        console.log('No user data found for user ID:', userId);
      }

      // Supabase code (kept for later)
      // const { data, error } = await supabase
      //   .from('users')
      //   .select('*')
      //   .eq('id', userId);
      // 
      // if (error) {
      //   console.error('Error fetching user data:', error);
      //   return;
      // }
      // 
      // // Check if we have data for this user
      // if (data && data.length > 0) {
      //   setUserData(mapUserDataToModel(data[0]));
      // } else {
      //   // User data not found, which is expected for new users
      //   console.log('No user data found for user ID:', userId);
      // }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (currentUser) {
      await fetchUserData(currentUser.id);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      // Get users data from localStorage
      const usersDataStr = localStorage.getItem(LOCAL_STORAGE_USERS_DATA_KEY);
      if (!usersDataStr) {
        throw new Error('No users data found');
      }

      const usersData = JSON.parse(usersDataStr);
      const user = usersData.find((u: any) => u.email === email);

      if (!user || user.password !== password) {
        const error = {
          __isAuthError: true,
          name: "AuthApiError",
          status: 400,
          code: "invalid_credentials",
          message: "Invalid login credentials"
        };
        throw error;
      }

      // Create user object similar to Supabase
      const userObj = {
        id: user.id,
        email: user.email,
        user_metadata: {
          display_name: user.display_name
        }
      };

      // Store in localStorage
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userObj));
      setCurrentUser(userObj as any);
      await fetchUserData(user.id);

      // Supabase code (kept for later)
      // const { error } = await supabase.auth.signInWithPassword({
      //   email,
      //   password
      // });
      // 
      // if (error) {
      //   throw error;
      // }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      // Get users data from localStorage
      const usersDataStr = localStorage.getItem(LOCAL_STORAGE_USERS_DATA_KEY);
      if (!usersDataStr) {
        throw new Error('No users data found');
      }

      const usersData = JSON.parse(usersDataStr);
      
      // Check if email already exists
      if (usersData.some((u: any) => u.email === email)) {
        throw new Error('Email already in use');
      }

      // Create new user ID
      const userId = uuidv4();

      // Create new user with default settings
      const newUser = {
        id: userId,
        email: email,
        password: password, // In a real app, this would be hashed
        display_name: displayName,
        categories: ['General', 'Technique', 'Repertoire', 'Sight Reading'],
        settings: {
          dailyGoalInMinutes: 60,
          weeklyGoalInMinutes: 300,
          defaultSessionDuration: 30
        },
        created_at: new Date().toISOString()
      };

      // Add to users data
      usersData.push(newUser);
      localStorage.setItem(LOCAL_STORAGE_USERS_DATA_KEY, JSON.stringify(usersData));

      // Create user object similar to Supabase
      const userObj = {
        id: userId,
        email: email,
        user_metadata: {
          display_name: displayName
        }
      };

      // Store in localStorage
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userObj));
      setCurrentUser(userObj as any);

      const userData = mapUserDataToModel(newUser);
      setUserData(userData);

      // Supabase code (kept for later)
      // // Create the auth user
      // const { data: authData, error: authError } = await supabase.auth.signUp({
      //   email,
      //   password
      // });
      // 
      // if (authError) {
      //   throw authError;
      // }
      // 
      // if (!authData.user) {
      //   throw new Error('Failed to create user');
      // }
      // 
      // // Create the user profile in the 'users' table
      // const newUser: User = {
      //   uid: authData.user.id,
      //   email: email,
      //   displayName: displayName,
      //   categories: ['General', 'Technique', 'Repertoire', 'Sight Reading'],
      //   settings: {
      //     dailyGoalInMinutes: 60,
      //     weeklyGoalInMinutes: 300,
      //     defaultSessionDuration: 30
      //   }
      // };
      // 
      // // Insert the user data into the 'users' table
      // const { error: profileError } = await supabase
      //   .from('users')
      //   .insert({
      //     id: authData.user.id,
      //     email: email,
      //     display_name: displayName,
      //     categories: newUser.categories,
      //     settings: newUser.settings
      //   });
      // 
      // if (profileError) {
      //   throw profileError;
      // }
      // 
      // setUserData(newUser);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // Remove from localStorage
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      setCurrentUser(null);
      setUserData(null);

      // Supabase code (kept for later)
      // const { error } = await supabase.auth.signOut();
      // if (error) {
      //   throw error;
      // }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Update user data
  const updateUserData = async (updatedData: Partial<User>) => {
    if (!currentUser || !userData) return;
    
    try {
      // Get users data from localStorage
      const usersDataStr = localStorage.getItem(LOCAL_STORAGE_USERS_DATA_KEY);
      if (!usersDataStr) {
        throw new Error('No users data found');
      }

      const usersData = JSON.parse(usersDataStr);
      const userIndex = usersData.findIndex((u: any) => u.id === currentUser.id);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Update user data
      const supabaseFormatData = mapModelToUserData(updatedData);
      
      // Update in local array
      const updatedUser = {
        ...usersData[userIndex],
        ...supabaseFormatData
      };
      
      usersData[userIndex] = updatedUser;
      
      // Save back to localStorage
      localStorage.setItem(LOCAL_STORAGE_USERS_DATA_KEY, JSON.stringify(usersData));
      
      // Update state
      const updatedUserData = { ...userData, ...updatedData };
      setUserData(updatedUserData);

      // Supabase code (kept for later)
      // const supabaseFormatData = mapModelToUserData(updatedData);
      // 
      // const { error } = await supabase
      //   .from('users')
      //   .update(supabaseFormatData)
      //   .eq('id', currentUser.id);
      //   
      // if (error) {
      //   throw error;
      // }
      // 
      // const updatedUserData = { ...userData, ...updatedData };
      // setUserData(updatedUserData);
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  // Context value
  const value: AuthContextType = {
    currentUser,
    userData,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshUserData,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};