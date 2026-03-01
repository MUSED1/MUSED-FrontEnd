import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export const Privacy: React.FC = () => {
    return (
        <div className="font-sans min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow bg-cream py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-serif text-burgundy mb-6">
                        Privacy Policy
                    </h1>
                    <p className="text-plum/60 mb-8">
                        Last updated: 28/02/2026
                    </p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-plum mb-4">1. Introduction</h2>
                        <p className="text-plum/80">
                            At MUSED 852, we take your privacy seriously. This policy describes how we collect,
                            use, and protect your personal information in accordance with Hong Kong's Personal Data
                            (Privacy) Ordinance.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-plum mb-4">2. Information We Collect</h2>
                        <p className="text-plum/80 mb-4">We collect information you provide directly to us:</p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>Name and contact information</li>
                            <li>Account credentials</li>
                            <li>Profile information</li>
                            <li>Payment information</li>
                            <li>Communications with us</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-plum mb-4">3. How We Use Your Information</h2>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>Provide and maintain our services</li>
                            <li>Process transactions</li>
                            <li>Communicate with you</li>
                            <li>Improve our platform</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-plum mb-4">4. Information Sharing</h2>
                        <p className="text-plum/80 mb-4">
                            We do not sell your personal information. We may share information with:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>Service providers (delivery partners, payment processors)</li>
                            <li>Legal authorities when required by law</li>
                            <li>Other participants as necessary for event coordination</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-plum mb-4">5. Your Rights</h2>
                        <p className="text-plum/80 mb-4">You have the right to:</p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>Access your personal data</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Withdraw consent</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-plum mb-4">6. Contact Us</h2>
                        <p className="text-plum/80">
                            For privacy-related inquiries, please contact:<br />
                            Email: privacy@mused852.com<br />
                            Address: [Your Hong Kong Address]
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};