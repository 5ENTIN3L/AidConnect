import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getRoleLabel } from '../config/rbac';

function UnauthorizedPage({ attemptedPage }) {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Access Denied
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Your role <span className="font-semibold text-slate-700 dark:text-slate-300">
                        ({getRoleLabel(user?.role)})
                    </span> does not have permission to view this page.
                </p>
                {attemptedPage && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
                        Attempted to access: <span className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">{attemptedPage}</span>
                    </p>
                )}

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => window.navigateTo('dashboard')}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg"
                    >
                        Go to Dashboard
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UnauthorizedPage;