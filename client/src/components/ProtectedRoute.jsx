import React from 'react';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();

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

    if (!user) {
        // Not logged in → redirect to login
        window.navigateTo('login');
        return null;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Wrong role → redirect to appropriate page
        window.navigateTo(user.role === 'beneficiary' ? 'beneficiary-portal' : 'dashboard');
        return null;
    }

    return children;
}

export default ProtectedRoute;