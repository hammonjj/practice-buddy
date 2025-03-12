import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Music, 
  Settings, 
  LogOut, 
  PlusCircle,
  BarChart,
  Calendar
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Don't show the navbar at all on the login page when not authenticated
  if (location.pathname === '/' && !currentUser) {
    return null;
  }

  return (
    <nav className="bg-dim-800 text-dim-100 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link to={currentUser ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <Music className="h-8 w-8 text-primary-400" />
            <span className="text-xl font-bold">Practice Buddy</span>
          </Link>
          
          {currentUser ? (
            <div className="flex items-center space-x-6">
              <Link 
                to="/dashboard" 
                className={`flex items-center space-x-1 hover:text-primary-300 ${
                  location.pathname === '/dashboard' ? 'text-primary-400 font-medium' : 'text-dim-200'
                }`}
              >
                <BarChart className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              
              <Link 
                to="/calendar" 
                className={`flex items-center space-x-1 hover:text-primary-300 ${
                  location.pathname === '/calendar' ? 'text-primary-400 font-medium' : 'text-dim-200'
                }`}
              >
                <Calendar className="h-5 w-5" />
                <span>Calendar</span>
              </Link>
              
              <Link 
                to="/add" 
                className={`flex items-center space-x-1 hover:text-primary-300 ${
                  location.pathname === '/add' ? 'text-primary-400 font-medium' : 'text-dim-200'
                }`}
              >
                <PlusCircle className="h-5 w-5" />
                <span>Add Routine</span>
              </Link>
              
              <Link 
                to="/settings" 
                className={`flex items-center space-x-1 hover:text-primary-300 ${
                  location.pathname === '/settings' ? 'text-primary-400 font-medium' : 'text-dim-200'
                }`}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
              
              <button 
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-dim-300 hover:text-dim-100"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            // For unauthenticated users, show a sign in link
            <Link 
              to="/" 
              className="flex items-center space-x-1 text-dim-300 hover:text-dim-100"
            >
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;