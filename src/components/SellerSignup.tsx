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
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-wine-deep">
            <AuthImagePanel
                heading={<>Sell with<br />MUSED.</>}
                subtext="Reach a curated community of muses ready to rent, wear and love your pieces."
            />

            {/* Form panel */}
            <div className="flex w-full items-center justify-center bg-wine-deep px-6 py-12 sm:px-10 md:w-1/2 lg:w-[55%]">
                <div className="w-full max-w-sm">
                    <div className="mb-8 text-center md:text-left">
                        <span className="inline-block px-3 py-1 mb-4 text-xs font-jost tracking-wide uppercase border border-landing-cream/40 text-landing-cream/80">
                            Seller Portal
                        </span>
                        <h2 className="font-playfair italic font-normal text-4xl sm:text-5xl text-landing-cream mb-3">
                            Sell on MUSED
                        </h2>
                        <div className="mx-auto mb-3 h-px w-9 bg-landing-cream/40 md:mx-0" />
                        <p className="text-landing-cream/70 text-base font-jost">
                            Create a brand account to set up your storefront
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {localError && (
                            <div className="bg-[#C9614E]/10 border border-[#C9614E]/40 text-[#f3a08e] px-5 py-4 text-sm flex items-start gap-3 font-jost">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span>{localError}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-landing-cream/70 mb-1.5 font-jost">
                                    Your Name
                                </label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="w-full px-5 py-3.5 bg-landing-cream text-wine placeholder-wine/40 focus:outline-none focus:ring-2 focus:ring-landing-cream/60 transition-all duration-200 font-jost"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-landing-cream/70 mb-1.5 font-jost">
                                    Email Address
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full px-5 py-3.5 bg-landing-cream text-wine placeholder-wine/40 focus:outline-none focus:ring-2 focus:ring-landing-cream/60 transition-all duration-200 font-jost"
                                    placeholder="you@yourbrand.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-landing-cream/70 mb-1.5 font-jost">
                                    Phone Number
                                </label>
                                <input
                                    name="phone"
                                    type="tel"
                                    required
                                    className="w-full px-5 py-3.5 bg-landing-cream text-wine placeholder-wine/40 focus:outline-none focus:ring-2 focus:ring-landing-cream/60 transition-all duration-200 font-jost"
                                    placeholder="+1 (555) 123-4567"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-landing-cream/70 mb-1.5 font-jost">
                                    Password
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full px-5 py-3.5 bg-landing-cream text-wine placeholder-wine/40 focus:outline-none focus:ring-2 focus:ring-landing-cream/60 transition-all duration-200 font-jost"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <p className="mt-2 text-xs text-landing-cream/50 font-jost">
                                    Minimum 6 characters
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm text-landing-cream/70 mb-1.5 font-jost">
                                    Confirm Password
                                </label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="w-full px-5 py-3.5 bg-landing-cream text-wine placeholder-wine/40 focus:outline-none focus:ring-2 focus:ring-landing-cream/60 transition-all duration-200 font-jost"
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
                                    className="w-5 h-5 border-landing-cream/40 bg-transparent text-landing-cream accent-landing-cream focus:ring-landing-cream/40 focus:ring-2 transition-colors"
                                    required
                                />
                            </div>
                            <label
                                htmlFor="terms"
                                className="text-sm text-landing-cream/80 leading-relaxed select-none font-jost"
                            >
                                I have read and agree to the{' '}
                                <Link to="/terms" className="text-landing-cream font-medium underline underline-offset-2 hover:text-[#f6dfe8] transition-colors">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link to="/privacy" className="text-landing-cream font-medium underline underline-offset-2 hover:text-[#f6dfe8] transition-colors">
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !termsAccepted}
                            className="mt-6 w-full border border-landing-cream px-6 py-4 text-base font-playfair italic text-landing-cream focus:outline-none focus:ring-2 focus:ring-landing-cream/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-landing-cream hover:text-wine"
                        >
                            <span className="flex items-center justify-center gap-2">
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
                    </form>

                    <div className="text-center md:text-left pt-6 space-y-2">
                        <p className="text-landing-cream/60 text-sm font-jost">
                            Already selling with us?{' '}
                            <Link
                                to="/seller/login"
                                className="text-landing-cream font-medium underline underline-offset-2 hover:text-[#f6dfe8] transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                        <p className="text-landing-cream/40 text-xs font-jost">
                            Looking to shop instead?{' '}
                            <Link to="/signup" className="underline hover:text-landing-cream/60 transition-colors">
                                Go to customer sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
