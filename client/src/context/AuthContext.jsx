import React, { createContext, useContext, useEffect, useState } from 'react';
import { account } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on app load
    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const session = await account.get();
            setUser({
                id: session.$id,
                fullName: session.name,
                email: session.email,
                role: session.labels?.[0] || 'ngo_admin',
            });
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        await account.createEmailPasswordSession(email, password);
        await checkSession();
    };

    const logout = async () => {
        try {
            await account.deleteSession('current');
        } catch (err) {
            console.warn('Session deletion failed:', err.message);
            // Continue with local logout even if session delete fails
        } finally {
            setUser(null);
            // Clear any residual localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.navigateTo('landing');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}