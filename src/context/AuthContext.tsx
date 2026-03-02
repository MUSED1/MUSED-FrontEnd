// context/AuthContext.tsx
import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import axios, { AxiosError } from 'axios';

// Types
interface User {
    id: string;
    name: string;
    email: string;
    phone?: string; // 👈 AÑADIMOS PHONE OPCIONAL
    role: 'user' | 'admin';
    avatar?: string;
    provider?: 'local' | 'google' | 'facebook';
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    signup: (userData: SignupData) => Promise<AuthResponse>;
    login: (credentials: LoginData) => Promise<AuthResponse>;
    loginWithToken: (token: string) => Promise<AuthResponse>;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

interface SignupData {
    name: string;
    email: string;
    phone: string; // 👈 AÑADIMOS PHONE REQUERIDO
    password: string;
}

interface LoginData {
    email: string;
    password: string;
}

interface AuthResponse {
    success: boolean;
    user?: User;
    error?: string;
}

interface AuthProviderProps {
    children: ReactNode;
}

interface ApiErrorResponse {
    message?: string;
}

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Get API URL from environment variable
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/auth';

    // Set auth token in axios headers
    const setAuthToken = (token: string | null): void => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    // Load user from token on mount
    useEffect(() => {
        const loadUser = async (): Promise<void> => {
            const token = localStorage.getItem('token');

            if (token) {
                try {
                    setAuthToken(token);
                    const res = await axios.get<{ success: boolean; user: User }>(`${API_URL}/me`);
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

    // Signup function
    const signup = async (userData: SignupData): Promise<AuthResponse> => {
        try {
            setError(null);
            const res = await axios.post<{ success: boolean; token: string; user: User }>(
                `${API_URL}/signup`,
                userData
            );

            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                setAuthToken(res.data.token);
                setUser(res.data.user);
                return { success: true, user: res.data.user };
            }

            return { success: false, error: 'Signup failed' };
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorResponse>;
            const errorMessage = axiosError.response?.data?.message || 'Signup failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // Login function
    const login = async (credentials: LoginData): Promise<AuthResponse> => {
        try {
            setError(null);
            const res = await axios.post<{ success: boolean; token: string; user: User }>(
                `${API_URL}/login`,
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

    // Login with token (for OAuth)
    const loginWithToken = async (token: string): Promise<AuthResponse> => {
        try {
            setAuthToken(token);
            const res = await axios.post<{ success: boolean; user: User }>(
                `${API_URL}/token-login`,
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

    // Logout function
    const logout = (): void => {
        localStorage.removeItem('token');
        setAuthToken(null);
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        loading,
        error,
        signup,
        login,
        loginWithToken,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};