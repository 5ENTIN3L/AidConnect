import { databases } from './api';
import { Query } from 'appwrite';

const DB_ID = 'aidconnect_db';
const COLLECTION_ID = 'aid_requests';
const DUPLICATION_WINDOW_DAYS = 30;

/**
 * Calculate priority score based on urgency and vulnerability
 */
export function getPriorityScore(urgency, vulnerability) {
    const urgencyScore     = { EMERGENCY: 40, HIGH: 30, MEDIUM: 20, LOW: 10 };
    const vulnerabilityScore = { CRITICAL: 40, HIGH: 30, MEDIUM: 20, LOW: 10 };
    return (urgencyScore[urgency] || 0) + (vulnerabilityScore[vulnerability] || 0);
}

/**
 * Get priority label and color based on score
 */
export function getPriorityLabel(score) {
    if (score >= 70) return { label: 'Critical',  color: 'bg-red-100 text-red-700 border-red-300'    };
    if (score >= 50) return { label: 'High',      color: 'bg-orange-100 text-orange-700 border-orange-300' };
    if (score >= 30) return { label: 'Medium',    color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
    return               { label: 'Low',       color: 'bg-green-100 text-green-700 border-green-300'  };
}

/**
 * Check Appwrite directly for duplicate requests
 * (more reliable than checking local state which may be limited to 50 docs)
 */
export async function checkDuplication(beneficiaryId, aidType) {
    if (!beneficiaryId || !aidType) return { isDuplicate: false, duplicate: null };

    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - DUPLICATION_WINDOW_DAYS);

        const response = await databases.listDocuments(DB_ID, COLLECTION_ID, [
            Query.equal('beneficiaryId', beneficiaryId),
            Query.equal('aidType', aidType),
            Query.greaterThan('$createdAt', thirtyDaysAgo.toISOString()),
            Query.notEqual('status', 'REJECTED'),
            Query.limit(1),
        ]);

        if (response.documents.length > 0) {
            return { isDuplicate: true, duplicate: response.documents[0] };
        }

        return { isDuplicate: false, duplicate: null };
    } catch (err) {
        console.error('Duplication check failed:', err.message);
        // Fail open — don't block submission if check fails
        return { isDuplicate: false, duplicate: null };
    }
}

/**
 * Get full aid history for a beneficiary
 */
export async function getBeneficiaryAidHistory(beneficiaryId) {
    if (!beneficiaryId) return [];

    try {
        const response = await databases.listDocuments(DB_ID, COLLECTION_ID, [
            Query.equal('beneficiaryId', beneficiaryId),
            Query.orderDesc('$createdAt'),
            Query.limit(20),
        ]);
        return response.documents;
    } catch (err) {
        console.error('Failed to fetch aid history:', err.message);
        return [];
    }
}