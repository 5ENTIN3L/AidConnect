import { useState, useCallback, useMemo } from 'react';
import { useRealtime } from './useRealtime';

const DB_ID = process.env.REACT_APP_APPWRITE_DATABASE_ID || 'aidconnect_db';

export function useRealtimeCollection(collectionId, fetcher) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetcher();
            setDocuments(data.documents || data);
        } catch (err) {
            console.error(`Failed to fetch ${collectionId}:`, err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [collectionId]);

    const handleRealtimeEvent = useCallback((response) => {
        const { events, payload } = response;
        if (!events || !payload) return;

        console.log('Realtime event received:', events); // ← temporary debug

        const isCreate = events.some(e => e.includes('.create'));
        const isUpdate = events.some(e => e.includes('.update'));
        const isDelete = events.some(e => e.includes('.delete'));

        setDocuments(prev => {
            if (isCreate) return [payload, ...prev];
            if (isUpdate) return prev.map(doc => doc.$id === payload.$id ? payload : doc);
            if (isDelete) return prev.filter(doc => doc.$id !== payload.$id);
            return prev;
        });
    }, []);

    // v23 correct format
    const channels = useMemo(() => [
        `databases.${DB_ID}.collections.${collectionId}.documents`,
    ], [collectionId]);

    const { isConnected } = useRealtime(channels, handleRealtimeEvent);

    return { documents, setDocuments, loading, error, fetchData, isConnected };
}