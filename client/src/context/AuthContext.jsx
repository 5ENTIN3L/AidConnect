import React, { createContext, useContext, useEffect, useState } from 'react';
import { account } from '../services/api';
import { hasPermission, canAccessPage, getDefaultPage } from '../config/rbac';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const session = await account.get();
            const role = session.labels?.[0] || 'viewer'; // Appwrite label e.g. 'superadmin'
            setUser({
                id:       session.$id,
                fullName: session.name,
                email:    session.email,
                role,
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
        } finally {
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.navigateTo('landing');
        }
    };

    // ── Permission helpers exposed to all components ──────────
    const can = (permission) => hasPermission(user?.role, permission);
    const canAccess = (page) => canAccessPage(user?.role, page);
    const defaultPage = getDefaultPage(user?.role);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            can,          // e.g. can('DELETE_BENEFICIARY')
            canAccess,    // e.g. canAccess('reports')
            defaultPage,  // e.g. 'dashboard'
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}