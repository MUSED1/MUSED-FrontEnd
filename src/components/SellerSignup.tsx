// components/SellerSignup.tsx
//
// Seller/brand application form. Same validation as the buyer Signup.tsx,
// but posts `role: 'seller'` alongside the rest of the signup payload so the
// account is created as a seller, and always lands on /brand afterwards
// (the "Brand Story" onboarding form) instead of /upload.
//
// Visually this now shares the same editorial split-panel layout as
// Signup.tsx (same AuthImagePanel, glass inputs, gradient pill button) —
// only the copy, badge, and seller-specific submit logic differ. No
// Google/Apple buttons here — brand accounts never had OAuth signup.
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { AuthImagePanel } from './AuthImagePanel';

interface SellerSignupFormData {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

export const SellerSignup: React.FC = () => {
    const [formData, setFormData] = useState<SellerSignupFormData>({
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

        const result = await signup({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            role: 'seller'
        } as any);

        if (result.success) {
            navigate('/brand', { replace: true });
        } else {
            setLocalError(result.error || 'Signup failed');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-cream-clear">
            <AuthImagePanel
                heading={<>Sell with<br />MUSED.</>}
                subtext="Reach a curated community of muses ready to rent, wear and love your pieces."
            />

            {/* Form panel */}
            <div className="flex w-full items-center justify-center bg-cream px-6 py-12 sm:px-10 md:w-1/2 lg:w-[55%]">
                <div className="w-full max-w-sm">
                    <div className="mb-8 text-center md:text-left">
                        <span className="inline-block px-3 py-1 mb-4 rounded-full text-xs font-semibold tracking-wide uppercase bg-plum/10 text-plum">
                            Seller Portal
                        </span>
                        <h2 className="font-kaldera font-normal text-5xl text-burgundy mb-3 tracking-tight">
                            Sell on MUSED
                        </h2>
                        <div className="mx-auto mb-3 h-px w-9 bg-[#C9A96E] md:mx-0" />
                        <p className="text-plum/70 text-base font-sans italic">
                            Create a brand account to set up your storefront
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
                            <div>
                                <label className="block text-sm font-medium text-plum/80 mb-1.5 font-inter">
                                    Your Name
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
                                    placeholder="you@yourbrand.com"
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
                                    placeholder="+1 (555) 123-4567"
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
                                            Creating your brand account...
                                        </>
                                    ) : (
                                        'Create brand account'
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>

                    <div className="text-center md:text-left pt-6 space-y-2">
                        <p className="text-plum/60 text-sm font-inter">
                            Already selling with us?{' '}
                            <Link
                                to="/seller/login"
                                className="text-burgundy font-medium hover:text-gold transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                        <p className="text-plum/40 text-xs font-inter">
                            Looking to shop instead?{' '}
                            <Link to="/signup" className="underline hover:text-plum/60 transition-colors">
                                Go to customer sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
