// components/Signup.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthImagePanel } from './AuthImagePanel';

interface SignupFormData {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

export const Signup: React.FC = () => {
    const [formData, setFormData] = useState<SignupFormData>({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [localError, setLocalError] = useState<string>('');
    const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

    const { signup } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const getReferralCode = (): string | null => {
        const params = new URLSearchParams(location.search);
        return params.get('ref');
    };

    const getPostSignupDestination = (): string => {
        const from = (location.state as any)?.from;
        if (from) return from;
        // The main "marketplace" right now is browsing brand storefronts,
        // not the old per-user listing form — send new users there.
        return '/shop';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGoogleLogin = () => {
        const API_URL = import.meta.env.VITE_API_URL || 'https://mused-backend.onrender.com/api';
        const BASE_URL = API_URL.replace('/auth', '');
        const ref = getReferralCode();
        const url = ref ? `${BASE_URL}/auth/google?ref=${ref}` : `${BASE_URL}/auth/google`;
        window.location.href = url;
    };

    const handleAppleLogin = () => {
        const API_URL = import.meta.env.VITE_API_URL || 'https://mused-backend.onrender.com/api';
        const BASE_URL = API_URL.replace('/auth', '');
        const ref = getReferralCode();
        const url = ref ? `${BASE_URL}/auth/apple?ref=${ref}` : `${BASE_URL}/auth/apple`;
        window.location.href = url;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLocalError('');

        if (!termsAccepted) {
            setLocalError('Please accept the terms and conditions');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setLocalError('Password must be at least 6 characters');
            return;
        }

        if (!/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
            setLocalError('Please enter a valid phone number');
            return;
        }

        setLoading(true);

        const ref = getReferralCode();
        const result = await signup({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            ref: ref || undefined
        });

        if (result.success) {
            navigate(getPostSignupDestination(), { replace: true });
        } else {
            setLocalError(result.error || 'Signup failed');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-cream-clear">
            <AuthImagePanel />

            {/* Form panel */}
            <div className="flex w-full items-center justify-center bg-cream px-6 py-12 sm:px-10 md:w-1/2 lg:w-[55%]">
                <div className="w-full max-w-sm">
                    <div className="mb-8 text-center md:text-left">
                        <h2 className="font-kaldera font-normal text-5xl text-burgundy mb-3 tracking-tight">
                            Join MUSED 852
                        </h2>
                        <div className="mx-auto mb-3 h-px w-9 bg-[#C9A96E] md:mx-0" />
                        <p className="text-plum/70 text-base font-sans italic">
                            Create your account to get started
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {localError && (
                            <div className="bg-[#C9614E]/8 backdrop-blur-sm border border-[#C9614E]/25 text-[#C9614E] px-5 py-4 rounded-2xl text-sm flex items-start gap-3 font-inter">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span>{localError}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="group">
                                <label className="block text-sm font-medium text-plum/80 mb-1.5 font-inter">
                                    Full Name
                                </label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="w-full px-5 py-3.5 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl text-plum placeholder-plum/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_10px_rgba(93,27,58,0.06)] focus:outline-none focus:ring-2 focus:ring-plum/25 focus:border-plum/40 focus:bg-white/70 transition-all duration-200 font-inter"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-plum/80 mb-1.5 font-inter">
                                    Email Address
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full px-5 py-3.5 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl text-plum placeholder-plum/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_10px_rgba(93,27,58,0.06)] focus:outline-none focus:ring-2 focus:ring-plum/25 focus:border-plum/40 focus:bg-white/70 transition-all duration-200 font-inter"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-plum/80 mb-1.5 font-inter">
                                    Phone Number
                                </label>
                                <input
                                    name="phone"
                                    type="tel"
                                    required
                                    className="w-full px-5 py-3.5 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl text-plum placeholder-plum/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_10px_rgba(93,27,58,0.06)] focus:outline-none focus:ring-2 focus:ring-plum/25 focus:border-plum/40 focus:bg-white/70 transition-all duration-200 font-inter"
                                    placeholder="+1 (555) 000-0000"
                                    value={formData.phone}
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
                                    className="w-full px-5 py-3.5 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl text-plum placeholder-plum/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_10px_rgba(93,27,58,0.06)] focus:outline-none focus:ring-2 focus:ring-plum/25 focus:border-plum/40 focus:bg-white/70 transition-all duration-200 font-inter"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <p className="mt-2 text-xs text-plum/60 font-inter">
                                    Minimum 6 characters
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-plum/80 mb-1.5 font-inter">
                                    Confirm Password
                                </label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="w-full px-5 py-3.5 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl text-plum placeholder-plum/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_10px_rgba(93,27,58,0.06)] focus:outline-none focus:ring-2 focus:ring-plum/25 focus:border-plum/40 focus:bg-white/70 transition-all duration-200 font-inter"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-3 mt-6">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="w-5 h-5 rounded border-plum/30 text-plum accent-plum focus:ring-plum/25 focus:ring-2 transition-colors"
                                    required
                                />
                            </div>
                            <label
                                htmlFor="terms"
                                className="text-sm text-plum/80 leading-relaxed select-none font-inter"
                            >
                                I have read and agree to the{' '}
                                <Link to="/terms" className="text-burgundy font-medium hover:text-gold transition-colors">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link to="/privacy" className="text-burgundy font-medium hover:text-gold transition-colors">
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>

                        <div className="mt-6 rounded-full shadow-[0_8px_16px_rgba(61,16,40,0.18)]">
                            <button
                                type="submit"
                                disabled={loading || !termsAccepted}
                                className="relative w-full overflow-hidden rounded-full border border-white/15 bg-gradient-to-b from-plum-dark to-plum px-6 py-4 text-base font-normal text-cream focus:outline-none focus:ring-2 focus:ring-plum/40 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:brightness-110 active:scale-[0.98] font-inter"
                            >
                                <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                                <span className="relative flex items-center justify-center gap-2">
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Creating account...
                                        </>
                                    ) : (
                                        'Create account'
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gold/20"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="rounded-full border border-white/50 bg-white/40 px-4 py-1 text-plum/60 backdrop-blur-md font-inter">
                                    Or sign up with
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="flex items-center justify-center gap-3 px-4 py-3 bg-white/70 backdrop-blur-sm border border-gold/20 rounded-full hover:bg-white hover:border-gold/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="text-sm text-plum font-inter">Google</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleAppleLogin}
                                disabled={loading}
                                className="flex items-center justify-center gap-3 px-4 py-3 bg-black border border-black rounded-full hover:bg-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                <span className="text-sm text-white font-inter">Apple</span>
                            </button>
                        </div>
                    </div>

                    <div className="text-center md:text-left pt-6">
                        <p className="text-plum/60 text-sm font-inter">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-burgundy font-medium hover:text-gold transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};