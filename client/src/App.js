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
import UnauthorizedPage from './pages/UnauthorizedPage';

export const ThemeContext = createContext();

function AppInner() {
    const [currentPage, setCurrentPage] = useState('landing');
    const { user, loading, canAccess, defaultPage } = useAuth();

    window.navigateTo = (page) => setCurrentPage(page);

    // ✅ Keep the effect, remove the debug logs for production
    useEffect(() => {
        if (user && process.env.NODE_ENV === 'development') { // ← only runs in dev
            console.group('🔐 RBAC Debug');
            console.log('User:',          user.fullName);
            console.log('Role:',          user.role);
            console.log('Dashboard:',     canAccess('dashboard'));
            console.log('Beneficiaries:', canAccess('beneficiaries'));
            console.log('Requests:',      canAccess('requests'));
            console.log('Deliveries:',    canAccess('deliveries'));
            console.log('Reports:',       canAccess('reports'));
            console.groupEnd();
        }
    }, [user, canAccess]);

    // Redirect after login
    useEffect(() => {
        if (!loading && user) {
            if (currentPage === 'landing' || currentPage === 'login') {
                setCurrentPage(defaultPage);
            }
        }
    }, [user, loading, currentPage, defaultPage]);

    // Redirect to landing if logged out
    useEffect(() => {
        if (!loading && !user) {
            setCurrentPage('landing');
        }
    }, [user, loading]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center 
                            bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 
                                    border-b-2 border-blue-600 mx-auto">
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    const renderPage = () => {
        // ── Unauthenticated ──────────────────────────────────
        if (!user) {
            if (currentPage === 'login') return <Login />;
            return <Landing />;
        }

        // ── Beneficiary role — locked to portal ─────────────
        if (user.role === 'beneficiary') {   // ← was 'beneficiary' — unchanged
            return <BeneficiaryPortal />;
        }

        // ── Check page-level permission ──────────────────────
        if (!canAccess(currentPage) && currentPage !== 'dashboard') {
            return <UnauthorizedPage attemptedPage={currentPage} />;
        }

        // ── Render page based on role ────────────────────────
        if (currentPage === 'dashboard') return <Dashboard />;
        if (currentPage === 'beneficiaries') return <Beneficiaries />;
        if (currentPage === 'aid-requests') return <AidRequests />;
        if (currentPage === 'deliveries') return <Deliveries />;
        if (currentPage === 'reports') return <Reports />;

        return <Dashboard />;
    };

    return <>{renderPage()}</>;
}

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
