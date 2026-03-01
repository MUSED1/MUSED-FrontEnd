import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export const Terms: React.FC = () => {
    return (
        <div className="font-sans min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow bg-cream py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-serif text-burgundy mb-6">
                        Terms & Conditions
                    </h1>
                    <p className="text-plum/60 mb-8">
                        Wear Something Borrowed Dinner – MUSED 852
                        <br />
                        Last updated: 28/02/2026
                    </p>

                    {/* Section 1 - Introduction */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-plum mb-4">1. Introduction</h2>
                        <p className="text-plum/80 mb-4">
                            These Terms & Conditions govern participation in the Wear Something Borrowed Dinner
                            organized by MUSED 852.
                        </p>
                        <p className="text-plum/80 mb-2">By:</p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>Creating a profile on our platform,</li>
                            <li>Uploading items for lending,</li>
                            <li>Borrowing an item,</li>
                            <li>Attending the Event,</li>
                        </ul>
                        <p className="text-plum/80">
                            you agree to be bound by these Terms. If you do not agree, please do not participate.
                        </p>
                    </section>

                    {/* Section 2 - Eligibility */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-plum mb-4">2. Eligibility</h2>
                        <p className="text-plum/80 mb-4">Participants must:</p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>Be at least 18 years old</li>
                            <li>Provide accurate and complete registration information</li>
                            <li>Have legal authority to lend the items uploaded</li>
                        </ul>
                        <p className="text-plum/80">
                            We reserve the right to refuse participation at our discretion.
                        </p>
                    </section>

                    {/* Section 3 - Account Creation & Data Protection */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-plum mb-4">3. Account Creation & Data Protection</h2>

                        <h3 className="text-lg font-medium text-plum mb-2">3.1 Profile Creation</h3>
                        <p className="text-plum/80 mb-4">
                            To participate, users must create a profile including:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>Full name</li>
                            <li>Contact details (email, phone)</li>
                            <li>Size information</li>
                            <li>Address for pickup/delivery</li>
                            <li>Payment details</li>
                        </ul>
                        <p className="text-plum/80 mb-4">
                            You agree that all information provided is accurate.
                        </p>

                        <h3 className="text-lg font-medium text-plum mb-2">3.2 Data Protection & Privacy</h3>
                        <p className="text-plum/80 mb-4">
                            We collect and process personal data for:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>Event coordination</li>
                            <li>Item pickup & delivery</li>
                            <li>Platform functionality</li>
                            <li>Marketing (if consented)</li>
                            <li>Photography and promotion (see Section 8)</li>
                        </ul>
                        <p className="text-plum/80 mb-4">Your data will:</p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>Be stored securely</li>
                            <li>Not be sold to third parties</li>
                            <li>Be shared only with necessary service providers (e.g., delivery partners, payment processors)</li>
                        </ul>
                        <p className="text-plum/80">You may request:</p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>Access to your data</li>
                            <li>Correction</li>
                            <li>Deletion (subject to legal obligations)</li>
                        </ul>
                    </section>

                    {/* Section 4 - Lending Items */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-plum mb-4">4. Lending Items</h2>
                        <p className="text-plum/80 mb-4">
                            To participate as a lender, you must:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>Upload at least two (2) items</li>
                            <li>Provide accurate information:
                                <ul className="list-circle pl-6 mt-2 space-y-1">
                                    <li>Original price</li>
                                    <li>Size</li>
                                    <li>Condition</li>
                                    <li>Photos</li>
                                    <li>Any existing damage</li>
                                </ul>
                            </li>
                        </ul>

                        <h3 className="text-lg font-medium text-plum mb-2">4.1 Ownership</h3>
                        <p className="text-plum/80 mb-4">
                            You confirm that:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>You legally own the item</li>
                            <li>The item is not stolen</li>
                            <li>The item is not counterfeit</li>
                        </ul>

                        <h3 className="text-lg font-medium text-plum mb-2">4.2 Condition of Items</h3>
                        <p className="text-plum/80 mb-4">
                            Items must be:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>Clean</li>
                            <li>Free of excessive damage</li>
                            <li>Safe to wear</li>
                            <li>Authentic</li>
                        </ul>
                        <p className="text-plum/80 mb-4">
                            We reserve the right to reject items that do not meet our standards.
                        </p>

                        <h3 className="text-lg font-medium text-plum mb-2">4.3 Pickup Authorization</h3>
                        <p className="text-plum/80 mb-4">
                            By submitting items for lending, you authorize MUSED to:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>Collect the item at the time and location specified</li>
                            <li>Transport and temporarily store the item</li>
                            <li>Deliver it to the borrower for the Event</li>
                        </ul>
                        <p className="text-plum/80">
                            MUSED is not responsible for minor wear consistent with normal use during the Event.
                        </p>
                    </section>

                    {/* Section 5 - Borrowing Items */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-plum mb-4">5. Borrowing Items</h2>
                        <p className="text-plum/80 mb-4">
                            Borrowers agree to:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>Wear the item only for the Event</li>
                            <li>Treat the item with reasonable care</li>
                            <li>Return the item at the specified time/location</li>
                            <li>Not alter, wash, or modify the item</li>
                        </ul>
                        <p className="text-plum/80 mb-4">
                            You are financially responsible for:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>Significant damage beyond normal wear</li>
                            <li>Loss of the item</li>
                            <li>Theft while in your possession</li>
                        </ul>
                        <p className="text-plum/80">
                            Damage assessments will be made reasonably and in good faith.
                        </p>
                    </section>

                    {/* Continue with remaining sections... */}

                    {/* Section 6 - Event Participation */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-plum mb-4">6. Event Participation</h2>
                        <p className="text-plum/80 mb-4">
                            By attending the Wear Something Borrowed Dinner:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>You agree to comply with event rules</li>
                            <li>You behave respectfully toward other participants</li>
                            <li>You understand this is a community-based experience</li>
                        </ul>
                        <p className="text-plum/80">
                            MUSED reserves the right to remove participants for misconduct.
                        </p>
                    </section>

                    {/* Section 7 - Cleaning & Handling */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-plum mb-4">7. Cleaning & Handling</h2>
                        <p className="text-plum/80 mb-4">
                            Cleaning logistics may be:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>Included in the participation fee, or</li>
                            <li>Handled directly by MUSED</li>
                        </ul>
                        <p className="text-plum/80 mb-4">Participants agree that:</p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>Items may undergo professional cleaning</li>
                            <li>MUSED is not liable for minor changes due to standard cleaning processes</li>
                        </ul>
                    </section>

                    {/* Section 8 - Photography & Media Release */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-plum mb-4">8. Photography & Media Release</h2>
                        <p className="text-plum/80 mb-4">
                            <strong>This is extremely important for you.</strong>
                        </p>
                        <p className="text-plum/80 mb-4">
                            By attending the Event and wearing a borrowed item:
                        </p>
                        <p className="text-plum/80 mb-4">You grant MUSED the irrevocable right to:</p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>Take photographs and videos during the Event</li>
                            <li>Use images featuring you and/or the borrowed item</li>
                            <li>Publish content for marketing, social media, website, and press</li>
                            <li>Use content without additional compensation</li>
                        </ul>
                        <p className="text-plum/80 mb-4">
                            If a participant does not wish to be photographed, they must inform MUSED in writing before the Event.
                        </p>
                        <p className="text-plum/80">
                            You waive any right to inspect or approve final images.
                        </p>
                    </section>

                    {/* Section 9 - Liability Limitation */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-plum mb-4">9. Liability Limitation</h2>
                        <p className="text-plum/80 mb-4">
                            To the fullest extent permitted by law:
                        </p>
                        <p className="text-plum/80 mb-4">MUSED is not liable for:</p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>Loss of personal belongings</li>
                            <li>Indirect or consequential damages</li>
                            <li>Minor wear from normal use</li>
                            <li>Actions between participants</li>
                        </ul>
                        <p className="text-plum/80">
                            Total liability, if any, is limited to the amount paid for participation.
                        </p>
                    </section>

                    {/* Section 10 - Assumption of Risk */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-plum mb-4">10. Assumption of Risk</h2>
                        <p className="text-plum/80 mb-4">
                            Participants acknowledge that:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>Wearing borrowed clothing involves inherent risk</li>
                            <li>Events may involve food, movement, public spaces</li>
                        </ul>
                        <p className="text-plum/80">
                            You participate voluntarily and assume associated risks.
                        </p>
                    </section>

                    {/* Section 11 - Dispute Resolution */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-plum mb-4">11. Dispute Resolution</h2>
                        <p className="text-plum/80 mb-4">
                            Any disputes arising under these Terms shall:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-plum/80 space-y-1">
                            <li>First be attempted to resolve amicably</li>
                            <li>Be governed by the laws of Hong Kong</li>
                            <li>Be subject to the jurisdiction of Hong Kong courts</li>
                        </ul>
                    </section>

                    {/* Contact Information */}
                    <section className="mt-12 pt-8 border-t border-gold/30">
                        <h2 className="text-xl font-semibold text-plum mb-4">Contact Us</h2>
                        <p className="text-plum/80 mb-2">
                            If you have any questions about these Terms, please contact us:
                        </p>
                        <ul className="text-plum/80 space-y-1">
                            <li>Email: legal@mused852.com</li>
                            <li>Address: [Your Hong Kong Address]</li>
                        </ul>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};