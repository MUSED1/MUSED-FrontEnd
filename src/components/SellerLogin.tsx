// components/SellerLogin.tsx
//
// Seller/brand portal login. Deliberately separate from the buyer-facing
// Login.tsx: copy, destination, and error handling are all seller-specific.
// A successful login always lands on /brand — RequireSeller (rendered by
// that route) is what actually checks role === 'seller' | 'admin' and
// bounces anyone else back here.
//
// Visually this now shares the exact same editorial split-panel layout as
// Login.tsx (same AuthImagePanel, glass inputs, gradient pill button) —
// only the copy, badge, and seller-specific redirect logic differ.
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthImagePanel } from './AuthImagePanel';

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
                            Welcome Back
                        </h2>
                        <div className="mx-auto mb-3 h-px w-9 bg-landing-cream/40 md:mx-0" />
                        <p className="text-landing-cream/70 text-base font-jost">
                            Sign in to manage your brand storefront
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
                                    Password
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full px-5 py-3.5 bg-landing-cream text-wine placeholder-wine/40 focus:outline-none focus:ring-2 focus:ring-landing-cream/60 transition-all duration-200 font-jost"
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
                                className="text-sm text-landing-cream/70 hover:text-landing-cream transition-colors font-jost"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full border border-landing-cream px-6 py-4 text-base font-playfair italic text-landing-cream focus:outline-none focus:ring-2 focus:ring-landing-cream/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-landing-cream hover:text-wine"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign in to your storefront'
                                )}
                            </span>
                        </button>
                    </form>

                    <div className="text-center md:text-left pt-6 space-y-2">
                        <p className="text-landing-cream/60 text-sm font-jost">
                            New brand?{' '}
                            <Link
                                to="/partner-with-us"
                                className="text-landing-cream font-medium underline underline-offset-2 hover:text-[#f6dfe8] transition-colors"
                            >
                                Get in touch with us
                            </Link>
                        </p>
                        <p className="text-landing-cream/40 text-xs font-jost">
                            Shopping instead?{' '}
                            <Link to="/login" className="underline hover:text-landing-cream/60 transition-colors">
                                Go to customer sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
