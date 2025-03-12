import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FirebaseContext, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import SessionDetail from './components/SessionDetail';
import Settings from './components/Settings';
import AddRoutine from './components/AddRoutine';
import Calendar from './components/Calendar';

// Protected Route component to handle authentication
const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
  const { currentUser, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-dim-900">
      <div className="text-xl text-dim-200">Loading...</div>
    </div>;
  }
  
  return currentUser ? <>{element}</> : <Navigate to="/" replace />;
};

function App() {
  return (
    <FirebaseContext>
      <AppContent />
    </FirebaseContext>
  );
}

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-dim-900">
        <Navbar />
        <div className="container mx-auto px-4 flex-grow">
          <Routes>
            <Route path="/" element={
              currentUser ? <Navigate to="/dashboard" replace /> : <Login />
            } />
            <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
            <Route path="/calendar" element={<ProtectedRoute element={<Calendar />} />} />
            <Route path="/session/:id" element={<ProtectedRoute element={<SessionDetail />} />} />
            <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
            <Route path="/add" element={<ProtectedRoute element={<AddRoutine />} />} />
            {/* Redirect any other paths to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;