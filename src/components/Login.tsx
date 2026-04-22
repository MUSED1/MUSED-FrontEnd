// components/Login.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';

interface LoginFormData {
    email: string;
    password: string;
}

export const Login: React.FC = () => {
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [localError, setLocalError] = useState<string>('');

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the redirect URL from state (where user originally wanted to go)
    const from = (location.state as any)?.from || '/profile';
    const redirectMessage = (location.state as any)?.message;

    useEffect(() => {
        if (redirectMessage) {
            setLocalError(redirectMessage);
        }
    }, [redirectMessage]);

    // Check for error in URL (from OAuth redirect)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const error = params.get('error');
        if (error === 'google_auth_failed') {
            setLocalError('Google login failed. Please try again.');
        }
    }, [location]);

    // ✅ FIX: Extract the ref from location.state.from (e.g. "/upload?ref=<id>")
    // because when redirected from /upload?ref=<id>, the ref lives in state, not the current URL.
    const getRefCode = (): string | null => {
        // 1. Check if ref is directly in the current URL (e.g. user landed on /login?ref=...)
        const currentRef = new URLSearchParams(location.search).get('ref');
        if (currentRef) return currentRef;

        // 2. Check the "from" path stored in router state (e.g. "/upload?ref=<id>")
        const fromPath = (location.state as any)?.from || '';
        const fromSearch = fromPath.includes('?') ? fromPath.split('?')[1] : '';
        const fromRef = new URLSearchParams(fromSearch).get('ref');
        if (fromRef) return fromRef;

        return null;
    };

    // Build the signup URL, always preserving the ref so new users get referredBy set
    const getSignupUrl = (): string => {
        const ref = getRefCode();
        return ref ? `/signup?ref=${ref}` : '/signup';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setLocalError('');

        const result = await login(formData);

        if (result.success) {
            // ✅ Redirect to the original intended URL (preserves referral)
            navigate(from, { replace: true });
        } else {
            setLocalError(result.error || 'Login failed');
        }

        setLoading(false);
    };

    const handleGoogleLogin = () => {
        const API_URL = import.meta.env.VITE_API_URL || 'https://mused-backend.onrender.com/api';
        const BASE_URL = API_URL.replace('/auth', '');

        // ✅ Preserve referral param when redirecting to Google
        const ref = getRefCode();
        const url = ref ? `${BASE_URL}/auth/google?ref=${ref}` : `${BASE_URL}/auth/google`;
        window.location.href = url;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-cream to-rose/30 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="absolute top-0 left-0 w-full h-64 bg-burgundy/5 -z-10" />

                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 border border-gold/20">
                    <div className="text-center mb-8">
                        <h2 className="font-amandine text-5xl md:text-6xl text-burgundy mb-3 tracking-tight">
                            Welcome Back
                        </h2>
                        <p className="text-plum/70 text-base font-inter">
                            Sign in to continue your journey
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {localError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-2xl text-sm flex items-start gap-3 font-inter">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span>{localError}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-plum/80 mb-1.5 font-inter">
                                    Email Address
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-plum placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all duration-200 font-inter"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-plum/80 mb-1.5 font-inter">
                                    Password
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-plum placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all duration-200 font-inter"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="text-sm text-burgundy hover:text-gold transition-colors font-medium font-inter"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-4 bg-gradient-to-r from-burgundy to-burgundy-light text-white text-base font-medium rounded-xl hover:from-burgundy-dark hover:to-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-inter"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gold/20"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-plum/60 font-inter">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3">
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gold/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="text-sm text-plum font-inter">Google</span>
                            </button>
                        </div>
                    </div>

                    <div className="text-center pt-6">
                        <p className="text-plum/60 text-sm font-inter">
                            Don't have an account?{' '}
                            <Link
                                to={getSignupUrl()}
                                className="text-burgundy font-medium hover:text-gold transition-colors"
                            >
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-10" />
            </div>
        </div>
    );
};