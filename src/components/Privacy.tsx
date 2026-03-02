import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useNavigate } from 'react-router-dom';

export const Privacy: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-cream via-cream to-rose/30">
            <Header />
            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 relative">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-gold/20 group z-10"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                >
                    <svg
                        className="w-5 h-5 text-burgundy group-hover:-translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="text-sm font-medium text-plum">Back</span>
                </button>

                {/* Close Button (Alternative) */}
                <button
                    onClick={() => navigate('/signup')}
                    className="absolute top-6 right-6 md:top-8 md:right-8 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-gold/20 flex items-center justify-center group z-10"
                    aria-label="Close"
                >
                    <svg
                        className="w-5 h-5 text-plum group-hover:text-burgundy group-hover:rotate-90 transition-all duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="max-w-4xl mx-auto">
                    {/* Decorative element */}
                    <div className="absolute top-0 left-0 w-full h-64 bg-burgundy/5 -z-10" />

                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-gold/20">
                        <div className="text-center mb-10">
                            <h1 className="font-serif text-5xl md:text-6xl text-burgundy mb-4 tracking-tight">
                                Privacy Policy
                            </h1>
                            <p className="text-plum/60 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Last updated: 28/02/2026
                            </p>
                        </div>

                        <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {/* Section 1 */}
                            <section className="bg-gray-50 rounded-2xl p-6 border border-gold/10">
                                <h2 className="text-2xl font-semibold text-burgundy mb-3">1. Introduction</h2>
                                <p className="text-plum/80 leading-relaxed">
                                    At MUSED 852, we take your privacy seriously. This policy describes how we collect,
                                    use, and protect your personal information in accordance with Hong Kong's Personal Data
                                    (Privacy) Ordinance.
                                </p>
                            </section>

                            {/* Section 2 */}
                            <section className="bg-gray-50 rounded-2xl p-6 border border-gold/10">
                                <h2 className="text-2xl font-semibold text-burgundy mb-3">2. Information We Collect</h2>
                                <p className="text-plum/80 mb-4 leading-relaxed">We collect information you provide directly to us:</p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        'Name and contact information',
                                        'Account credentials',
                                        'Profile information',
                                        'Payment information',
                                        'Communications with us',
                                        'Size preferences',
                                        'Event participation history'
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start gap-2 text-plum/80">
                                            <span className="text-burgundy mt-1">•</span>
                                            <span className="leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            {/* Section 3 */}
                            <section className="bg-gray-50 rounded-2xl p-6 border border-gold/10">
                                <h2 className="text-2xl font-semibold text-burgundy mb-3">3. How We Use Your Information</h2>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        'Provide and maintain our services',
                                        'Process transactions',
                                        'Communicate with you',
                                        'Improve our platform',
                                        'Comply with legal obligations',
                                        'Coordinate events',
                                        'Match lenders with borrowers'
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start gap-2 text-plum/80">
                                            <span className="text-burgundy mt-1">•</span>
                                            <span className="leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            {/* Section 4 */}
                            <section className="bg-gray-50 rounded-2xl p-6 border border-gold/10">
                                <h2 className="text-2xl font-semibold text-burgundy mb-3">4. Information Sharing</h2>
                                <p className="text-plum/80 mb-4 leading-relaxed font-medium">
                                    We do not sell your personal information. We may share information with:
                                </p>
                                <ul className="space-y-2">
                                    {[
                                        'Service providers (delivery partners, payment processors)',
                                        'Legal authorities when required by law',
                                        'Other participants as necessary for event coordination',
                                        'Professional cleaners for item maintenance'
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start gap-2 text-plum/80">
                                            <span className="text-burgundy mt-1">•</span>
                                            <span className="leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            {/* Section 5 */}
                            <section className="bg-gray-50 rounded-2xl p-6 border border-gold/10">
                                <h2 className="text-2xl font-semibold text-burgundy mb-3">5. Your Rights</h2>
                                <p className="text-plum/80 mb-4 leading-relaxed">You have the right to:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        'Access your personal data',
                                        'Correct inaccurate data',
                                        'Request deletion of your data',
                                        'Withdraw consent',
                                        'Data portability',
                                        'Opt out of marketing'
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gold/10">
                                            <svg className="w-5 h-5 text-burgundy flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm text-plum/80">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Section 6 - Data Retention */}
                            <section className="bg-gray-50 rounded-2xl p-6 border border-gold/10">
                                <h2 className="text-2xl font-semibold text-burgundy mb-3">6. Data Retention</h2>
                                <p className="text-plum/80 leading-relaxed">
                                    We retain your personal information for as long as your account is active or as needed to
                                    provide you services, comply with legal obligations, resolve disputes, and enforce our agreements.
                                </p>
                            </section>

                            {/* Section 7 - Security */}
                            <section className="bg-gray-50 rounded-2xl p-6 border border-gold/10">
                                <h2 className="text-2xl font-semibold text-burgundy mb-3">7. Security</h2>
                                <p className="text-plum/80 leading-relaxed">
                                    We implement appropriate technical and organizational measures to protect your personal information
                                    against unauthorized access, alteration, disclosure, or destruction.
                                </p>
                            </section>

                            {/* Section 8 - Changes to Policy */}
                            <section className="bg-gray-50 rounded-2xl p-6 border border-gold/10">
                                <h2 className="text-2xl font-semibold text-burgundy mb-3">8. Changes to This Policy</h2>
                                <p className="text-plum/80 leading-relaxed">
                                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                                    the new policy on this page with an updated effective date.
                                </p>
                            </section>
                        </div>

                        {/* Back to Signup Button at bottom (optional) */}
                        <div className="mt-10 text-center">
                            <button
                                onClick={() => navigate('/signup')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-burgundy to-burgundy-light text-white rounded-xl hover:from-burgundy-dark hover:to-burgundy transition-all duration-200 shadow-md hover:shadow-lg"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Sign Up
                            </button>
                        </div>
                    </div>

                    {/* Decorative element */}
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-10" />
                </div>
            </main>
            <Footer />
        </div>
    );
};