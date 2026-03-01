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

    // Get redirect path from location state or default to home
    const from = location.state?.from?.pathname || '/';

    // Check for error in URL (from OAuth redirect)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const error = params.get('error');
        if (error === 'google_auth_failed') {
            setLocalError('Google login failed. Please try again.');
        } else if (error === 'facebook_auth_failed') {
            setLocalError('Facebook login failed. Please try again.');
        }
    }, [location]);

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
            navigate(from, { replace: true });
        } else {
            setLocalError(result.error || 'Login failed');
        }

        setLoading(false);
    };

    const handleGoogleLogin = () => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/auth';
        const BASE_URL = API_URL.replace('/auth', '');
        window.location.href = `${BASE_URL}/auth/google`;
    };

    const handleFacebookLogin = () => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/auth';
        const BASE_URL = API_URL.replace('/auth', '');
        window.location.href = `${BASE_URL}/auth/facebook`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cream py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div>
                    <h2 className="mt-6 text-center text-3xl font-serif text-burgundy">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-plum/60">
                        Or{' '}
                        <Link to="/signup" className="font-medium text-gold hover:text-burgundy">
                            create a new account
                        </Link>
                    </p>
                </div>

                {/* Login Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {/* Error Message */}
                    {localError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                            {localError}
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-plum">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gold placeholder-gray-500 text-plum rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-burgundy sm:text-sm"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-plum">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gold placeholder-gray-500 text-plum rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-burgundy sm:text-sm"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex items-center justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/forgot-password')}
                            className="text-sm text-gold hover:text-burgundy"
                        >
                            Forgot your password?
                        </button>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-burgundy to-plum hover:from-burgundy-light hover:to-plum-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-burgundy disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </div>
                </form>

                {/* Social Login Section */}
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gold/30"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-cream text-plum/60">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        {/* Google Login Button */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gold rounded-lg hover:bg-gold/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span className="text-plum">Google</span>
                        </button>

                        {/* Facebook Login Button */}
                        <button
                            type="button"
                            onClick={handleFacebookLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gold rounded-lg hover:bg-gold/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            <span className="text-plum">Facebook</span>
                        </button>
                    </div>
                </div>

                {/* Demo Account Info - Solo en desarrollo */}
                {import.meta.env.DEV && (
                    <div className="mt-4 p-4 bg-gold/10 rounded-lg">
                        <p className="text-sm text-plum/60 text-center">
                            Demo account: demo@mused.com / password123
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};