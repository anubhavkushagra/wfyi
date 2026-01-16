import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../lib/types';
import { api } from '../lib/api';

interface AuthContextType {
    user: User | null;
    login: (email: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check localStorage for basic persistence during dev if needed, or just start null
        const stored = localStorage.getItem('smart_recon_user_session');
        if (stored) {
            setUser(JSON.parse(stored));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const user = await api.auth.login(email);
            setUser(user);
            localStorage.setItem('smart_recon_user_session', JSON.stringify(user));
        } catch (e: any) {
            console.error(e);
            setError(e.response?.data?.error || e.message || 'Failed to login');
            // Allow throwing if component wants to handle it too, but context state is enough
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('smart_recon_user_session');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
