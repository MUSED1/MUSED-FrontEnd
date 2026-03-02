import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useNavigate } from 'react-router-dom';

export const Terms: React.FC = () => {
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
                                Terms & Conditions
                            </h1>
                            <p className="text-plum/60 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Wear Something Borrowed Dinner – MUSED 852
                                <br />
                                Last updated: 28/02/2026
                            </p>
                        </div>

                        <div className="space-y-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {/* Section 1 - Introduction */}
                            <section className="bg-gray-50 rounded-2xl p-6 border border-gold/10">
                                <h2 className="text-2xl font-semibold text-burgundy mb-4">1. Introduction</h2>
                                <p className="text-plum/80 mb-4 leading-relaxed">
                                    These Terms & Conditions govern participation in the Wear Something Borrowed Dinner
                                    organized by MUSED 852.
                                </p>
                                <p className="text-plum/80 mb-3 font-medium">By:</p>
                                <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-2 leading-relaxed">
                                    <li>Creating a profile on our platform,</li>
                                    <li>Uploading items for lending,</li>
                                    <li>Borrowing an item,</li>
                                    <li>Attending the Event,</li>
                                </ul>
                                <p className="text-plum/80 leading-relaxed">
                                    you agree to be bound by these Terms. If you do not agree, please do not participate.
                                </p>
                            </section>

                            {/* Section 2 - Eligibility */}
                            <section className="bg-gray-50 rounded-2xl p-6 border border-gold/10">
                                <h2 className="text-2xl font-semibold text-burgundy mb-4">2. Eligibility</h2>
                                <p className="text-plum/80 mb-4 font-medium">Participants must:</p>
                                <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-2 leading-relaxed">
                                    <li>Be at least 18 years old</li>
                                    <li>Provide accurate and complete registration information</li>
                                    <li>Have legal authority to lend the items uploaded</li>
                                </ul>
                                <p className="text-plum/80 leading-relaxed">
                                    We reserve the right to refuse participation at our discretion.
                                </p>
                            </section>

                            {/* Section 3 - Account Creation & Data Protection */}
                            <section className="bg-gray-50 rounded-2xl p-6 border border-gold/10">
                                <h2 className="text-2xl font-semibold text-burgundy mb-4">3. Account Creation & Data Protection</h2>

                                <h3 className="text-xl font-medium text-plum mb-3">3.1 Profile Creation</h3>
                                <p className="text-plum/80 mb-4 leading-relaxed">
                                    To participate, users must create a profile including:
                                </p>
                                <ul className="list-disc pl-6 mb-6 text-plum/80 space-y-2 leading-relaxed">
                                    <li>Full name</li>
                                    <li>Contact details (email, phone)</li>
                                    <li>Size information</li>
                                    <li>Address for pickup/delivery</li>
                                    <li>Payment details</li>
                                </ul>

                                <h3 className="text-xl font-medium text-plum mb-3">3.2 Data Protection & Privacy</h3>
                                <p className="text-plum/80 mb-4 leading-relaxed">
                                    We collect and process personal data for:
                                </p>
                                <ul className="list-disc pl-6 mb-6 text-plum/80 space-y-2 leading-relaxed">
                                    <li>Event coordination</li>
                                    <li>Item pickup & delivery</li>
                                    <li>Platform functionality</li>
                                    <li>Marketing (if consented)</li>
                                    <li>Photography and promotion (see Section 8)</li>
                                </ul>
                                <p className="text-plum/80 mb-4 font-medium">Your data will:</p>
                                <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-2 leading-relaxed">
                                    <li>Be stored securely</li>
                                    <li>Not be sold to third parties</li>
                                    <li>Be shared only with necessary service providers</li>
                                </ul>
                            </section>

                            {/* Section 4 - Lending Items */}
                            <section className="bg-gray-50 rounded-2xl p-6 border border-gold/10">
                                <h2 className="text-2xl font-semibold text-burgundy mb-4">4. Lending Items</h2>
                                <p className="text-plum/80 mb-4 leading-relaxed">
                                    To participate as a lender, you must:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-2 leading-relaxed">
                                    <li>Upload at least two (2) items</li>
                                    <li>Provide accurate information including original price, size, condition, photos, and any existing damage</li>
                                </ul>

                                <h3 className="text-xl font-medium text-plum mb-3">4.1 Ownership</h3>
                                <p className="text-plum/80 mb-4 leading-relaxed">
                                    You confirm that you legally own the item and it is not stolen or counterfeit.
                                </p>

                                <h3 className="text-xl font-medium text-plum mb-3">4.2 Condition of Items</h3>
                                <p className="text-plum/80 mb-4 leading-relaxed">
                                    Items must be clean, free of excessive damage, safe to wear, and authentic.
                                    We reserve the right to reject items that do not meet our standards.
                                </p>

                                <h3 className="text-xl font-medium text-plum mb-3">4.3 Pickup Authorization</h3>
                                <p className="text-plum/80 leading-relaxed">
                                    By submitting items for lending, you authorize MUSED to collect, transport, temporarily store,
                                    and deliver the item to the borrower for the Event.
                                </p>
                            </section>

                            {/* Section 5 - Borrowing Items */}
                            <section className="bg-gray-50 rounded-2xl p-6 border border-gold/10">
                                <h2 className="text-2xl font-semibold text-burgundy mb-4">5. Borrowing Items</h2>
                                <p className="text-plum/80 mb-4 leading-relaxed">
                                    Borrowers agree to:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-2 leading-relaxed">
                                    <li>Wear the item only for the Event</li>
                                    <li>Treat the item with reasonable care</li>
                                    <li>Return the item at the specified time/location</li>
                                    <li>Not alter, wash, or modify the item</li>
                                </ul>
                                <p className="text-plum/80 leading-relaxed">
                                    You are financially responsible for significant damage beyond normal wear, loss, or theft while in your possession.
                                </p>
                            </section>

                            {/* Section 6 - Event Participation */}
                            <section className="bg-gray-50 rounded-2xl p-6 border border-gold/10">
                                <h2 className="text-2xl font-semibold text-burgundy mb-4">6. Event Participation</h2>
                                <p className="text-plum/80 mb-4 leading-relaxed">
                                    By attending the Wear Something Borrowed Dinner:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-2 leading-relaxed">
                                    <li>You agree to comply with event rules</li>
                                    <li>You behave respectfully toward other participants</li>
                                    <li>You understand this is a community-based experience</li>
                                </ul>
                                <p className="text-plum/80 leading-relaxed">
                                    MUSED reserves the right to remove participants for misconduct.
                                </p>
                            </section>

                            {/* Section 7 - Cleaning & Handling */}
                            <section className="bg-gray-50 rounded-2xl p-6 border border-gold/10">
                                <h2 className="text-2xl font-semibold text-burgundy mb-4">7. Cleaning & Handling</h2>
                                <p className="text-plum/80 mb-4 leading-relaxed">
                                    Cleaning logistics may be included in the participation fee or handled directly by MUSED.
                                    Items may undergo professional cleaning, and MUSED is not liable for minor changes due to standard cleaning processes.
                                </p>
                            </section>

                            {/* Section 8 - Photography & Media Release - Highlighted as important */}
                            <section className="bg-rose/10 rounded-2xl p-6 border-2 border-burgundy/20">
                                <h2 className="text-2xl font-semibold text-burgundy mb-4">8. Photography & Media Release</h2>
                                <p className="text-plum/80 mb-4 font-semibold text-burgundy">
                                    This is extremely important for you.
                                </p>
                                <p className="text-plum/80 mb-4 leading-relaxed">
                                    By attending the Event and wearing a borrowed item, you grant MUSED the irrevocable right to:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-2 leading-relaxed">
                                    <li>Take photographs and videos during the Event</li>
                                    <li>Use images featuring you and/or the borrowed item</li>
                                    <li>Publish content for marketing, social media, website, and press</li>
                                    <li>Use content without additional compensation</li>
                                </ul>
                                <p className="text-plum/80 leading-relaxed">
                                    If a participant does not wish to be photographed, they must inform MUSED in writing before the Event.
                                </p>
                            </section>

                            {/* Section 9 - Liability Limitation */}
                            <section className="bg-gray-50 rounded-2xl p-6 border border-gold/10">
                                <h2 className="text-2xl font-semibold text-burgundy mb-4">9. Liability Limitation</h2>
                                <p className="text-plum/80 mb-4 leading-relaxed">
                                    To the fullest extent permitted by law, MUSED is not liable for loss of personal belongings,
                                    indirect damages, minor wear from normal use, or actions between participants.
                                    Total liability, if any, is limited to the amount paid for participation.
                                </p>
                            </section>

                            {/* Section 10 - Assumption of Risk */}
                            <section className="bg-gray-50 rounded-2xl p-6 border border-gold/10">
                                <h2 className="text-2xl font-semibold text-burgundy mb-4">10. Assumption of Risk</h2>
                                <p className="text-plum/80 leading-relaxed">
                                    Participants acknowledge that wearing borrowed clothing involves inherent risk.
                                    Events may involve food, movement, and public spaces. You participate voluntarily and assume associated risks.
                                </p>
                            </section>

                            {/* Section 11 - Dispute Resolution */}
                            <section className="bg-gray-50 rounded-2xl p-6 border border-gold/10">
                                <h2 className="text-2xl font-semibold text-burgundy mb-4">11. Dispute Resolution</h2>
                                <p className="text-plum/80 leading-relaxed">
                                    Any disputes arising under these Terms shall first be attempted to resolve amicably,
                                    be governed by the laws of Hong Kong, and be subject to the jurisdiction of Hong Kong courts.
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