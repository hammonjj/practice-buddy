import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/AuthContext';
import { Music } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, currentUser } = useFirebase();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isSignUp) {
        await signUp(email, password, displayName);
        navigate('/dashboard');
      } else {
        await signIn(email, password);
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      
      // Handle different types of errors
      if (err.__isAuthError) {
        // Supabase auth errors
        if (err.code === 'invalid_credentials') {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else {
          setError(err.message || 'An authentication error occurred. Please try again.');
        }
      } else {
        // Generic errors
        setError(err.message || 'Failed to sign in. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Music size={48} className="text-primary-400" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-dim-100">
          Practice Buddy
        </h2>
        <p className="mt-2 text-center text-sm text-dim-300">
          {isSignUp ? 'Create your account' : 'Sign in to your account'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-dim-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-900/50 text-red-300 p-3 rounded mb-4 border border-red-900">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {isSignUp && (
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-dim-200">
                  Display Name
                </label>
                <div className="mt-1">
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-dim-700 px-3 py-2 placeholder-dim-400 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-primary-400 bg-dim-800"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dim-200">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-dim-700 px-3 py-2 placeholder-dim-400 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-primary-400 bg-dim-800"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dim-200">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-dim-700 px-3 py-2 placeholder-dim-400 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-primary-400 bg-dim-800"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:bg-primary-800"
              >
                {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-center w-full text-sm text-primary-400 hover:text-primary-300"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;