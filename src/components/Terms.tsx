import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const Terms: React.FC = () => {
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
                            Terms & Conditions
                        </h1>
                        <div className="mx-auto mt-4 h-px w-9 bg-[#C9A96E]" />
                        <p className="mt-4 text-sm text-plum/50">
                            Wear Something Borrowed Dinner – MUSED 852 · Last updated: 28/02/2026
                        </p>
                    </div>

                    <div className="space-y-5 rounded-3xl bg-white/60 backdrop-blur-md border border-white/60 p-6 sm:p-8 shadow-[0_2px_10px_rgba(93,27,58,0.06)]">
                        {/* Section 1 - Introduction */}
                        <section className="rounded-2xl bg-cream/60 border border-plum/10 p-6">
                            <h2 className="font-kaldera text-xl text-plum-dark mb-4">1. Introduction</h2>
                            <p className="text-plum/70 mb-4 leading-relaxed">
                                These Terms & Conditions govern participation in the Wear Something Borrowed Dinner
                                organized by MUSED 852.
                            </p>
                            <p className="text-plum/70 mb-3 font-medium">By:</p>
                            <ul className="list-disc pl-6 mb-4 text-plum/70 space-y-2 leading-relaxed">
                                <li>Creating a profile on our platform,</li>
                                <li>Uploading items for lending,</li>
                                <li>Borrowing an item,</li>
                                <li>Attending the Event,</li>
                            </ul>
                            <p className="text-plum/70 leading-relaxed">
                                you agree to be bound by these Terms. If you do not agree, please do not participate.
                            </p>
                        </section>

                        {/* Section 2 - Eligibility */}
                        <section className="rounded-2xl bg-cream/60 border border-plum/10 p-6">
                            <h2 className="font-kaldera text-xl text-plum-dark mb-4">2. Eligibility</h2>
                            <p className="text-plum/70 mb-4 font-medium">Participants must:</p>
                            <ul className="list-disc pl-6 mb-4 text-plum/70 space-y-2 leading-relaxed">
                                <li>Be at least 18 years old</li>
                                <li>Provide accurate and complete registration information</li>
                                <li>Have legal authority to lend the items uploaded</li>
                            </ul>
                            <p className="text-plum/70 leading-relaxed">
                                We reserve the right to refuse participation at our discretion.
                            </p>
                        </section>

                        {/* Section 3 - Account Creation & Data Protection */}
                        <section className="rounded-2xl bg-cream/60 border border-plum/10 p-6">
                            <h2 className="font-kaldera text-xl text-plum-dark mb-4">3. Account Creation & Data Protection</h2>

                            <h3 className="text-base font-semibold text-plum-dark mb-3">3.1 Profile Creation</h3>
                            <p className="text-plum/70 mb-4 leading-relaxed">
                                To participate, users must create a profile including:
                            </p>
                            <ul className="list-disc pl-6 mb-6 text-plum/70 space-y-2 leading-relaxed">
                                <li>Full name</li>
                                <li>Contact details (email, phone)</li>
                                <li>Size information</li>
                                <li>Address for pickup/delivery</li>
                                <li>Payment details</li>
                            </ul>

                            <h3 className="text-base font-semibold text-plum-dark mb-3">3.2 Data Protection & Privacy</h3>
                            <p className="text-plum/70 mb-4 leading-relaxed">
                                We collect and process personal data for:
                            </p>
                            <ul className="list-disc pl-6 mb-6 text-plum/70 space-y-2 leading-relaxed">
                                <li>Event coordination</li>
                                <li>Item pickup & delivery</li>
                                <li>Platform functionality</li>
                                <li>Marketing (if consented)</li>
                                <li>Photography and promotion (see Section 8)</li>
                            </ul>
                            <p className="text-plum/70 mb-4 font-medium">Your data will:</p>
                            <ul className="list-disc pl-6 mb-4 text-plum/70 space-y-2 leading-relaxed">
                                <li>Be stored securely</li>
                                <li>Not be sold to third parties</li>
                                <li>Be shared only with necessary service providers</li>
                            </ul>
                        </section>

                        {/* Section 4 - Lending Items */}
                        <section className="rounded-2xl bg-cream/60 border border-plum/10 p-6">
                            <h2 className="font-kaldera text-xl text-plum-dark mb-4">4. Lending Items</h2>
                            <p className="text-plum/70 mb-4 leading-relaxed">
                                To participate as a lender, you must:
                            </p>
                            <ul className="list-disc pl-6 mb-4 text-plum/70 space-y-2 leading-relaxed">
                                <li>Upload at least two (2) items</li>
                                <li>Provide accurate information including original price, size, condition, photos, and any existing damage</li>
                            </ul>

                            <h3 className="text-base font-semibold text-plum-dark mb-3">4.1 Ownership</h3>
                            <p className="text-plum/70 mb-4 leading-relaxed">
                                You confirm that you legally own the item and it is not stolen or counterfeit.
                            </p>

                            <h3 className="text-base font-semibold text-plum-dark mb-3">4.2 Condition of Items</h3>
                            <p className="text-plum/70 mb-4 leading-relaxed">
                                Items must be clean, free of excessive damage, safe to wear, and authentic.
                                We reserve the right to reject items that do not meet our standards.
                            </p>

                            <h3 className="text-base font-semibold text-plum-dark mb-3">4.3 Pickup Authorization</h3>
                            <p className="text-plum/70 leading-relaxed">
                                By submitting items for lending, you authorize MUSED to collect, transport, temporarily store,
                                and deliver the item to the borrower for the Event.
                            </p>
                        </section>

                        {/* Section 5 - Borrowing Items */}
                        <section className="rounded-2xl bg-cream/60 border border-plum/10 p-6">
                            <h2 className="font-kaldera text-xl text-plum-dark mb-4">5. Borrowing Items</h2>
                            <p className="text-plum/70 mb-4 leading-relaxed">
                                Borrowers agree to:
                            </p>
                            <ul className="list-disc pl-6 mb-4 text-plum/70 space-y-2 leading-relaxed">
                                <li>Wear the item only for the Event</li>
                                <li>Treat the item with reasonable care</li>
                                <li>Return the item at the specified time/location</li>
                                <li>Not alter, wash, or modify the item</li>
                            </ul>
                            <p className="text-plum/70 leading-relaxed">
                                You are financially responsible for significant damage beyond normal wear, loss, or theft while in your possession.
                            </p>
                        </section>

                        {/* Section 6 - Event Participation */}
                        <section className="rounded-2xl bg-cream/60 border border-plum/10 p-6">
                            <h2 className="font-kaldera text-xl text-plum-dark mb-4">6. Event Participation</h2>
                            <p className="text-plum/70 mb-4 leading-relaxed">
                                By attending the Wear Something Borrowed Dinner:
                            </p>
                            <ul className="list-disc pl-6 mb-4 text-plum/70 space-y-2 leading-relaxed">
                                <li>You agree to comply with event rules</li>
                                <li>You behave respectfully toward other participants</li>
                                <li>You understand this is a community-based experience</li>
                            </ul>
                            <p className="text-plum/70 leading-relaxed">
                                MUSED reserves the right to remove participants for misconduct.
                            </p>
                        </section>

                        {/* Section 7 - Cleaning & Handling */}
                        <section className="rounded-2xl bg-cream/60 border border-plum/10 p-6">
                            <h2 className="font-kaldera text-xl text-plum-dark mb-4">7. Cleaning & Handling</h2>
                            <p className="text-plum/70 leading-relaxed">
                                Cleaning logistics may be included in the participation fee or handled directly by MUSED.
                                Items may undergo professional cleaning, and MUSED is not liable for minor changes due to standard cleaning processes.
                            </p>
                        </section>

                        {/* Section 8 - Photography & Media Release */}
                        <section className="rounded-2xl bg-[#C9A96E]/10 border-2 border-[#C9A96E]/40 p-6">
                            <h2 className="font-kaldera text-xl text-plum-dark mb-4">8. Photography & Media Release</h2>
                            <p className="text-burgundy mb-4 font-semibold">
                                This is extremely important for you.
                            </p>
                            <p className="text-plum/70 mb-4 leading-relaxed">
                                By attending the Event and wearing a borrowed item, you grant MUSED the irrevocable right to:
                            </p>
                            <ul className="list-disc pl-6 mb-4 text-plum/70 space-y-2 leading-relaxed">
                                <li>Take photographs and videos during the Event</li>
                                <li>Use images featuring you and/or the borrowed item</li>
                                <li>Publish content for marketing, social media, website, and press</li>
                                <li>Use content without additional compensation</li>
                            </ul>
                            <p className="text-plum/70 leading-relaxed">
                                If a participant does not wish to be photographed, they must inform MUSED in writing before the Event.
                            </p>
                        </section>

                        {/* Section 9 - Liability Limitation */}
                        <section className="rounded-2xl bg-cream/60 border border-plum/10 p-6">
                            <h2 className="font-kaldera text-xl text-plum-dark mb-4">9. Liability Limitation</h2>
                            <p className="text-plum/70 leading-relaxed">
                                To the fullest extent permitted by law, MUSED is not liable for loss of personal belongings,
                                indirect damages, minor wear from normal use, or actions between participants.
                                Total liability, if any, is limited to the amount paid for participation.
                            </p>
                        </section>

                        {/* Section 10 - Assumption of Risk */}
                        <section className="rounded-2xl bg-cream/60 border border-plum/10 p-6">
                            <h2 className="font-kaldera text-xl text-plum-dark mb-4">10. Assumption of Risk</h2>
                            <p className="text-plum/70 leading-relaxed">
                                Participants acknowledge that wearing borrowed clothing involves inherent risk.
                                Events may involve food, movement, and public spaces. You participate voluntarily and assume associated risks.
                            </p>
                        </section>

                        {/* Section 11 - Dispute Resolution */}
                        <section className="rounded-2xl bg-cream/60 border border-plum/10 p-6">
                            <h2 className="font-kaldera text-xl text-plum-dark mb-4">11. Dispute Resolution</h2>
                            <p className="text-plum/70 leading-relaxed">
                                Any disputes arising under these Terms shall first be attempted to resolve amicably,
                                be governed by the laws of Hong Kong, and be subject to the jurisdiction of Hong Kong courts.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};
