import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const Privacy: React.FC = () => {
    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-cream pt-28 pb-20 sm:pt-32">
                <div className="container mx-auto max-w-3xl px-4">
                    <Link to="/" className="inline-flex items-center gap-1 text-plum/60 hover:text-burgundy text-sm font-medium mb-6 transition-colors">
                        ← Back to MUSED
                    </Link>

                    <div className="mb-10 text-center">
                        <h1 className="font-kaldera font-normal text-3xl text-plum-dark sm:text-4xl">
                            Privacy Policy
                        </h1>
                        <div className="mx-auto mt-4 h-px w-9 bg-[#C9A96E]" />
                        <p className="mt-4 text-sm text-plum/50">
                            Last updated: 28/02/2026
                        </p>
                    </div>

                    <div className="space-y-5 rounded-3xl bg-white/60 backdrop-blur-md border border-white/60 p-6 sm:p-8 shadow-[0_2px_10px_rgba(93,27,58,0.06)]">
                        {/* Section 1 */}
                        <section className="rounded-2xl bg-cream/60 border border-plum/10 p-6">
                            <h2 className="font-kaldera text-xl text-plum-dark mb-3">1. Introduction</h2>
                            <p className="text-plum/70 leading-relaxed">
                                At MUSED 852, we take your privacy seriously. This policy describes how we collect,
                                use, and protect your personal information in accordance with Hong Kong's Personal Data
                                (Privacy) Ordinance.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section className="rounded-2xl bg-cream/60 border border-plum/10 p-6">
                            <h2 className="font-kaldera text-xl text-plum-dark mb-3">2. Information We Collect</h2>
                            <p className="text-plum/70 mb-4 leading-relaxed">We collect information you provide directly to us:</p>
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
                                    <li key={index} className="flex items-start gap-2 text-plum/70">
                                        <span className="text-[#C9A96E] mt-1">•</span>
                                        <span className="leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Section 3 */}
                        <section className="rounded-2xl bg-cream/60 border border-plum/10 p-6">
                            <h2 className="font-kaldera text-xl text-plum-dark mb-3">3. How We Use Your Information</h2>
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
                                    <li key={index} className="flex items-start gap-2 text-plum/70">
                                        <span className="text-[#C9A96E] mt-1">•</span>
                                        <span className="leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section className="rounded-2xl bg-cream/60 border border-plum/10 p-6">
                            <h2 className="font-kaldera text-xl text-plum-dark mb-3">4. Information Sharing</h2>
                            <p className="text-plum/70 mb-4 leading-relaxed font-medium">
                                We do not sell your personal information. We may share information with:
                            </p>
                            <ul className="space-y-2">
                                {[
                                    'Service providers (delivery partners, payment processors)',
                                    'Legal authorities when required by law',
                                    'Other participants as necessary for event coordination',
                                    'Professional cleaners for item maintenance'
                                ].map((item, index) => (
                                    <li key={index} className="flex items-start gap-2 text-plum/70">
                                        <span className="text-[#C9A96E] mt-1">•</span>
                                        <span className="leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Section 5 */}
                        <section className="rounded-2xl bg-cream/60 border border-plum/10 p-6">
                            <h2 className="font-kaldera text-xl text-plum-dark mb-3">5. Your Rights</h2>
                            <p className="text-plum/70 mb-4 leading-relaxed">You have the right to:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    'Access your personal data',
                                    'Correct inaccurate data',
                                    'Request deletion of your data',
                                    'Withdraw consent',
                                    'Data portability',
                                    'Opt out of marketing'
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 p-3 bg-white/70 rounded-xl border border-plum/10">
                                        <svg className="w-5 h-5 text-[#C9A96E] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm text-plum/70">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section 6 - Data Retention */}
                        <section className="rounded-2xl bg-cream/60 border border-plum/10 p-6">
                            <h2 className="font-kaldera text-xl text-plum-dark mb-3">6. Data Retention</h2>
                            <p className="text-plum/70 leading-relaxed">
                                We retain your personal information for as long as your account is active or as needed to
                                provide you services, comply with legal obligations, resolve disputes, and enforce our agreements.
                            </p>
                        </section>

                        {/* Section 7 - Security */}
                        <section className="rounded-2xl bg-cream/60 border border-plum/10 p-6">
                            <h2 className="font-kaldera text-xl text-plum-dark mb-3">7. Security</h2>
                            <p className="text-plum/70 leading-relaxed">
                                We implement appropriate technical and organizational measures to protect your personal information
                                against unauthorized access, alteration, disclosure, or destruction.
                            </p>
                        </section>

                        {/* Section 8 - Changes to Policy */}
                        <section className="rounded-2xl bg-cream/60 border border-plum/10 p-6">
                            <h2 className="font-kaldera text-xl text-plum-dark mb-3">8. Changes to This Policy</h2>
                            <p className="text-plum/70 leading-relaxed">
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                                the new policy on this page with an updated effective date.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};
