import React from 'react';

function DuplicationWarning({ duplicate, aidType, onProceed, onCancel, checking }) {
    if (checking) {
        return (
            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded-r-lg flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0"></div>
                <p className="text-blue-700 dark:text-blue-400 text-sm font-medium">Checking for duplicate requests...</p>
            </div>
        );
    }

    if (!duplicate) return null;

    const requestDate = new Date(duplicate.$createdAt).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
    });

    const statusColors = {
        PENDING:   'bg-yellow-100 text-yellow-700',
        APPROVED:  'bg-blue-100 text-blue-700',
        ALLOCATED: 'bg-purple-100 text-purple-700',
        COMPLETED: 'bg-green-100 text-green-700',
    };

    return (
        <div className="mb-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-orange-100 dark:bg-orange-900/40 px-5 py-3 flex items-center gap-3 border-b border-orange-200 dark:border-orange-800">
                <svg className="w-5 h-5 text-orange-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-orange-800 dark:text-orange-300 font-bold text-sm">Duplicate Request Detected</p>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
                <p className="text-orange-700 dark:text-orange-400 text-sm mb-3">
                    This beneficiary already has a <strong>{aidType}</strong> request within the last 30 days.
                    Submitting another may violate the duplication policy.
                </p>

                {/* Existing Request Details */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-orange-200 dark:border-orange-800 mb-4 text-sm">
                    <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Existing Request:</p>
                    <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                        <div>
                            <span className="text-xs text-gray-400 block">Aid Type</span>
                            <span className="font-medium">{duplicate.aidType}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-400 block">Date Submitted</span>
                            <span className="font-medium">{requestDate}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-400 block">Quantity</span>
                            <span className="font-medium">{duplicate.quantity}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-400 block">Status</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[duplicate.status] || 'bg-gray-100 text-gray-700'}`}>
                                {duplicate.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 bg-white dark:bg-slate-700 border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400 rounded-lg font-semibold text-sm hover:bg-orange-50 transition"
                    >
                        Cancel Request
                    </button>
                    <button
                        onClick={onProceed}
                        className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-sm transition shadow"
                    >
                        Submit Anyway
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DuplicationWarning;