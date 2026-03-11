import React, { useState, useEffect, createContext } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Beneficiaries from './pages/Beneficiaries';
import AidRequests from './pages/AidRequests';
import Deliveries from './pages/Deliveries';
import BeneficiaryPortal from './pages/BeneficiaryPortal';
import Reports from './pages/Reports';
import Landing from './pages/Landing';

export const ThemeContext = createContext();

// ── Inner app (has access to AuthContext) ──────────────────────
function AppInner() {
  const [currentPage, setCurrentPage] = useState('landing');
  const { user, loading } = useAuth();

  window.navigateTo = (page) => setCurrentPage(page);

  // Redirect after login based on role
  useEffect(() => {
    if (!loading && user) {
      if (currentPage === 'landing' || currentPage === 'login') {
        setCurrentPage(user.role === 'beneficiary' ? 'beneficiary-portal' : 'dashboard');
      }
    }
  }, [user, loading, currentPage]);

  // Redirect to landing if logged out
  useEffect(() => {
    if (!loading && !user) {
      setCurrentPage('landing');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    // ── Unauthenticated ──────────────────────────────────────────
    if (!user) {
      if (currentPage === 'login') return <Login />;
      return <Landing />;
    }

    // ── Beneficiary role ─────────────────────────────────────────
    if (user.role === 'beneficiary') {
      return <BeneficiaryPortal />;
    }

    // ── Staff / NGO Admin role ───────────────────────────────────
    // Covers 'admin' and 'staff'
    if (currentPage === 'beneficiaries') return <Beneficiaries />;
    if (currentPage === 'requests') return <AidRequests />;
    if (currentPage === 'deliveries') return <Deliveries />;
    if (currentPage === 'reports') return <Reports />;
    return <Dashboard />;
  };

  return <>{renderPage()}</>;
}

// ── Root app (provides Theme + Auth context) ───────────────────
function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <AuthProvider>
        <div className="min-h-screen bg-white transition-colors duration-300 dark:bg-slate-900">
          <AppInner />
        </div>
      </AuthProvider>
    </ThemeContext.Provider>
  );
}

export default App;
