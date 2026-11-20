import { createContext, useContext, useState, type ReactNode } from 'react';
import type { UserRole } from '../../../shared/types/entities';

interface AuthUser {
    email: string;
    role: UserRole;
}

interface AuthContextType {
    user: AuthUser | null;
    loginUser: (email: string, role: UserRole, token?: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => {
        const saved = localStorage.getItem('scoutly_user');
        return saved ? JSON.parse(saved) : null;
    });

    const loginUser = (email: string, role: UserRole, token?: string) => {
        const userData = { email, role };
        setUser(userData);
        localStorage.setItem('scoutly_user', JSON.stringify(userData));
        if (token) localStorage.setItem('accessToken', token);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('scoutly_user');
        localStorage.removeItem('accessToken');
    };

    return (
        <AuthContext.Provider value={{ user, loginUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}