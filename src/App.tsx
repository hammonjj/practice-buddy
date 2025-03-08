import React from 'react';
import { Music4 } from 'lucide-react';
import { Button } from './components/atoms/Button';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Dashboard } from './components/pages/Dashboard';
import { Calendar } from './components/pages/Calendar';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <nav className="flex gap-4">
      <Button 
        variant={location.pathname === "/dashboard" ? "primary" : "outline"} 
        size="sm"
        onClick={() => navigate('/dashboard')}
      >
        Dashboard
      </Button>
      <Button 
        variant={location.pathname === "/calendar" ? "primary" : "outline"} 
        size="sm"
        onClick={() => navigate('/calendar')}
      >
        Calendar
      </Button>
      <Button 
        variant={location.pathname === "/routines" ? "primary" : "outline"} 
        size="sm"
        onClick={() => navigate('/routines')}
      >
        Routines
      </Button>
    </nav>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-white">
      <header className="bg-surface p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music4 className="text-accent" size={32} />
            <h1 className="text-2xl font-bold">Practice Buddy</h1>
          </div>
          <Navigation />
        </div>
      </header>
      
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  );
}

function Welcome() {
  const navigate = useNavigate();
  
  return (
    <div className="grid gap-6">
      <section className="bg-surface rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome to Practice Buddy</h2>
        <p className="text-white/80 mb-4">
          Your personal music practice management companion. Start by creating a practice routine
          or scheduling a session.
        </p>
        <Button onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </section>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/routines" element={<div>Routines Coming Soon</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;