// components/SellerSignup.tsx
//
// Seller/brand application form. Same validation as the buyer Signup.tsx,
// but posts `role: 'seller'` alongside the rest of the signup payload so the
// account is created as a seller, and always lands on /brand afterwards
// (the "Brand Story" onboarding form) instead of /upload.
//
// ⚠️ BACKEND DEPENDENCY: this assumes useAuth().signup() forwards arbitrary
// extra fields straight through to POST /api/auth/signup (it already does
// this today for `ref` — see Signup.tsx). routes/auth.js needs to read
// `role` off the body and pass it to User.create(); if it currently hardcodes
// role to 'user' (or ignores the field) this signup will still succeed but
// the account will come back as a plain 'user' and RequireSeller will bounce
// them straight back to /seller/login. I don't have routes/auth.js in this
// conversation — share it and I'll wire this up for real.
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-cream to-rose/30 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="absolute top-0 left-0 w-full h-64 bg-burgundy/5 -z-10" />

                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 border border-gold/20">
                    <div className="text-center mb-8">
                        <span className="inline-block px-3 py-1 mb-4 rounded-full text-xs font-semibold tracking-wide uppercase bg-plum/10 text-plum">
                            Seller Portal
                        </span>
                        <h2 className="font-amandine text-5xl md:text-6xl text-burgundy mb-3 tracking-tight">
                            Sell on MUSED
                        </h2>
                        <p className="text-plum/70 text-base font-inter">
                            Create a brand account to set up your storefront
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
                                    Your Name
                                </label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-plum placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all duration-200 font-inter"
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
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-plum placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all duration-200 font-inter"
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
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-plum placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all duration-200 font-inter"
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
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-plum placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all duration-200 font-inter"
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
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-plum placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all duration-200 font-inter"
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
                                    className="w-5 h-5 rounded border-gray-300 text-burgundy focus:ring-burgundy/20 focus:ring-2 transition-colors"
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

                        <button
                            type="submit"
                            disabled={loading || !termsAccepted}
                            className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-burgundy to-burgundy-light text-white text-base font-medium rounded-xl hover:from-burgundy-dark hover:to-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-inter"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating your brand account...
                                </span>
                            ) : (
                                'Create brand account'
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-6 space-y-2">
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

                <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-10" />
            </div>
        </div>
    );
};