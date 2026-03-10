import React, { useState, useEffect, createContext } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Beneficiaries from './pages/Beneficiaries';
import AidRequests from './pages/AidRequests';
import Deliveries from './pages/Deliveries';
import BeneficiaryPortal from './pages/BeneficiaryPortal';
import Reports from './pages/Reports';
import Landing from './pages/Landing';

export const ThemeContext = createContext();

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const isLoggedIn = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Initialize Dark Mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  window.navigateTo = (page) => setCurrentPage(page);

  const renderPage = () => {
    if (!isLoggedIn) {
      if (currentPage === 'login') return <Login />;
      return <Landing />;
    }

    if (currentPage === 'landing') return <Landing />;

    if (user.role === 'beneficiary') return <BeneficiaryPortal />;
    if (currentPage === 'beneficiaries') return <Beneficiaries />;
    if (currentPage === 'requests') return <AidRequests />;
    if (currentPage === 'deliveries') return <Deliveries />;
    if (currentPage === 'reports') return <Reports />;
    return <Dashboard />;
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div className="min-h-screen bg-white transition-colors duration-300 dark:bg-slate-900">
        {renderPage()}
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
