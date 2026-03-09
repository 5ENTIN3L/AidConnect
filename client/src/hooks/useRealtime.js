import { useEffect, useRef, useState } from 'react';
import { client } from '../services/api';

export function useRealtime(channels, onChange) {
    const [isConnected, setIsConnected] = useState(false);
    const unsubscribeRef = useRef(null);
    const mountedRef = useRef(true);
    const onChangeRef = useRef(onChange);

    // Always keep ref current without triggering effect
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    const channelKey = channels.join(',');

    useEffect(() => {
        mountedRef.current = true;

        if (!channels || channels.length === 0) return;

        // Unsubscribe any existing subscription first
        if (unsubscribeRef.current) {
            try { unsubscribeRef.current(); } catch {}
            unsubscribeRef.current = null;
        }

        const timer = setTimeout(() => {
            if (!mountedRef.current) return;
            try {
                console.log('Subscribing to channels:', channels);
                unsubscribeRef.current = client.subscribe(
                    channels,
                    (response) => {
                        if (!mountedRef.current) return;
                        if (mountedRef.current) setIsConnected(true);
                        onChangeRef.current(response);
                    }
                );
                if (mountedRef.current) setIsConnected(true);
            } catch (err) {
                console.warn('Realtime subscription error:', err.message);
                if (mountedRef.current) setIsConnected(false);
            }
        }, 500); // ← reduce back to 500ms now that StrictMode is off

        return () => {
            mountedRef.current = false;
            clearTimeout(timer);
            if (unsubscribeRef.current) {
                try { unsubscribeRef.current(); } catch {}
                unsubscribeRef.current = null;
            }
            setIsConnected(false);
        };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channelKey]);

    return { isConnected };
}