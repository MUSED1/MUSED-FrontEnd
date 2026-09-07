// components/SellerLogin.tsx
//
// Seller/brand portal login. Deliberately separate from the buyer-facing
// Login.tsx: copy, destination, and error handling are all seller-specific.
// A successful login always lands on /brand — RequireSeller (rendered by
// that route) is what actually checks role === 'seller' | 'admin' and
// bounces anyone else back here.
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';

interface LoginFormData {
    email: string;
    password: string;
}

export const SellerLogin: React.FC = () => {
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [localError, setLocalError] = useState<string>('');

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Sellers always land on /brand — RequireSeller gates it by role and
    // will bounce anyone who isn't a seller back to /seller/login with a
    // message, so we don't need to compute a generic "from" like Login.tsx.
    const from = (location.state as any)?.from || '/brand';
    const redirectMessage = (location.state as any)?.message;

    useEffect(() => {
        if (redirectMessage) {
            setLocalError(redirectMessage);
        }
    }, [redirectMessage]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-cream to-rose/30 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="absolute top-0 left-0 w-full h-64 bg-burgundy/5 -z-10" />

                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 border border-gold/20">
                    <div className="text-center mb-8">
                        <span className="inline-block px-3 py-1 mb-4 rounded-full text-xs font-semibold tracking-wide uppercase bg-plum/10 text-plum">
                            Seller Portal
                        </span>
                        <h2 className="font-amandine text-5xl md:text-6xl text-burgundy mb-3 tracking-tight">
                            Welcome Back
                        </h2>
                        <p className="text-plum/70 text-base font-inter">
                            Sign in to manage your brand storefront
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {localError && (
                            <div className="bg-red-50 border border-red-200 text-plum/80 px-5 py-4 rounded-2xl text-sm flex items-start gap-3 font-inter">
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
                                    placeholder="you@yourbrand.com"
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
                            className="w-full px-6 py-4 bg-plum text-white text-base font-medium rounded-xl hover:bg-plum/90 focus:outline-none focus:ring-2 focus:ring-plum/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-inter"
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
                                'Sign in to your storefront'
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-6 space-y-2">
                        <p className="text-plum/60 text-sm font-inter">
                            New brand?{' '}
                            <Link
                                to="/seller/signup"
                                className="text-burgundy font-medium hover:text-gold transition-colors"
                            >
                                Apply to sell on MUSED
                            </Link>
                        </p>
                        <p className="text-plum/40 text-xs font-inter">
                            Shopping instead?{' '}
                            <Link to="/login" className="underline hover:text-plum/60 transition-colors">
                                Go to customer sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-10" />
            </div>
        </div>
    );
};