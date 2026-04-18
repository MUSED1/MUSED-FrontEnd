// context/AuthContext.tsx
import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import axios, { AxiosError } from 'axios';

// Types
interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'user' | 'admin';
    avatar?: string;
    provider?: 'local' | 'google' | 'facebook';
    referralCode?: string;
    referralCount?: number;
    referredBy?: string | { _id: string; name: string; email: string };
    referralCompleted?: boolean;
}

// Add to AuthContextType interface
interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    signup: (userData: SignupData) => Promise<AuthResponse>;
    login: (credentials: LoginData) => Promise<AuthResponse>;
    loginWithToken: (token: string) => Promise<AuthResponse>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;  // Already there, ensure it's implemented
    isAuthenticated: boolean;
    isAdmin: boolean;
}

interface SignupData {
    name: string;
    email: string;
    phone: string;
    password: string;
    ref?: string;
}

interface LoginData {
    email: string;
    password: string;
}

interface AuthResponse {
    success: boolean;
    user?: User;
    error?: string;
    referral?: {
        success: boolean;
        referrerId?: string;
        referrerName?: string;
    };
}

interface AuthProviderProps {
    children: ReactNode;
}

interface ApiErrorResponse {
    message?: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || 'https://mused-backend.onrender.com/api';

    const setAuthToken = (token: string | null): void => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    useEffect(() => {
        const loadUser = async (): Promise<void> => {
            const token = localStorage.getItem('token');

            if (token) {
                try {
                    setAuthToken(token);
                    const res = await axios.get<{ success: boolean; user: User }>(`${API_URL}/auth/me`);
                    setUser(res.data.user);
                } catch (error) {
                    console.error('Failed to load user:', error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        loadUser();
    }, [API_URL]);

    const signup = async (userData: SignupData): Promise<AuthResponse> => {
        try {
            setError(null);
            const res = await axios.post<{
                success: boolean;
                token: string;
                user: User;
                referral?: { success: boolean; referrerId: string; referrerName: string };
            }>(
                `${API_URL}/auth/signup`,
                userData
            );

            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                setAuthToken(res.data.token);
                setUser(res.data.user);
                return {
                    success: true,
                    user: res.data.user,
                    referral: res.data.referral
                };
            }

            return { success: false, error: 'Signup failed' };
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorResponse>;
            const errorMessage = axiosError.response?.data?.message || 'Signup failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const login = async (credentials: LoginData): Promise<AuthResponse> => {
        try {
            setError(null);
            const res = await axios.post<{ success: boolean; token: string; user: User }>(
                `${API_URL}/auth/login`,
                credentials
            );

            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                setAuthToken(res.data.token);
                setUser(res.data.user);
                return { success: true, user: res.data.user };
            }

            return { success: false, error: 'Login failed' };
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorResponse>;
            const errorMessage = axiosError.response?.data?.message || 'Login failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const loginWithToken = async (token: string): Promise<AuthResponse> => {
        try {
            setAuthToken(token);
            const res = await axios.post<{ success: boolean; user: User }>(
                `${API_URL}/auth/token-login`,
                { token }
            );

            if (res.data.success) {
                localStorage.setItem('token', token);
                setUser(res.data.user);
                return { success: true, user: res.data.user };
            }
            return { success: false, error: 'Login failed' };
        } catch (error) {
            console.error('Token login error:', error);
            const axiosError = error as AxiosError<ApiErrorResponse>;
            const errorMessage = axiosError.response?.data?.message || 'Invalid token';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const logout = (): void => {
        localStorage.removeItem('token');
        setAuthToken(null);
        setUser(null);
    };

    const updateUser = (userData: Partial<User>): void => {
        if (user) {
            setUser({ ...user, ...userData });
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        error,
        signup,
        login,
        loginWithToken,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};