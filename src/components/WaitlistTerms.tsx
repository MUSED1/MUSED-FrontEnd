// components/WaitlistTerms.tsx
import { Link } from 'react-router-dom';
import './MusedLanding.css';

const CONTACT_EMAIL = 'info@mused852.com';

const Mail = () => <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

export function WaitlistTerms() {
    return (
        <div className="mused-landing">
            <article className="legal">
                <Link to="/" className="legal-back">
                    ← Back to MUSED 852
                </Link>

                <h1>MUSED 852 — Waitlist Terms &amp; Privacy Notice</h1>
                <p className="legal-date">
                    <strong>Effective Date:</strong> October 11, 2026
                </p>

                <section>
                    <h2>1. About MUSED</h2>
                    <p>
                        MUSED 852 (&ldquo;MUSED,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is a
                        platform dedicated to supporting emerging fashion brands through digital discovery, curated
                        marketplaces, events, and community experiences.
                    </p>
                    <p>
                        MUSED is operated by <em>MUSED852</em>, a limited liability company registered in{' '}
                        <strong>DE</strong>, United States.
                    </p>
                </section>

                <section>
                    <h2>2. Information We Collect</h2>
                    <p>
                        When you join the MUSED waitlist, we collect your email address and may retain information
                        relating to your signup, including the date and your communication preferences.
                    </p>
                </section>

                <section>
                    <h2>3. How We Use Your Information</h2>
                    <p>We use your email address to:</p>
                    <ul>
                        <li>Notify you about MUSED&rsquo;s platform and product launches.</li>
                        <li>Share announcements about new brands, collections, and marketplace developments.</li>
                        <li>Inform you about MUSED events, community initiatives, and early-access opportunities.</li>
                        <li>Send marketing communications where you have consented to receive them.</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Consent and Unsubscribing</h2>
                    <p>
                        By subscribing to MUSED&rsquo;s marketing emails, you consent to receiving the communications
                        described above.
                    </p>
                    <p>
                        You can withdraw your consent at any time by clicking the unsubscribe link in our emails or
                        contacting us at <Mail />.
                    </p>
                </section>

                <section>
                    <h2>5. Data Storage and Sharing</h2>
                    <p>
                        We may store and process your information in the United States or other countries where our
                        trusted service providers operate.
                    </p>
                    <p>
                        We may share your information with service providers that help us operate our waitlist, manage
                        subscriber information, and deliver emails.
                    </p>
                    <p>We do not sell your email address to third-party advertisers.</p>
                    <p>Where required, we implement appropriate safeguards for international transfers of personal data.</p>
                </section>

                <section>
                    <h2>6. Data Retention</h2>
                    <p>
                        We retain your email address while you remain subscribed or while it is reasonably necessary to
                        administer the waitlist.
                    </p>
                    <p>
                        If you unsubscribe or request deletion, we will delete or anonymize your information unless
                        limited retention is necessary to comply with applicable laws or maintain an unsubscribe record.
                    </p>
                </section>

                <section>
                    <h2>7. Your Privacy Rights</h2>
                    <p>
                        Depending on your location, you may have the right to access, correct, delete, or request
                        information about how your personal data is processed.
                    </p>
                    <p>
                        To exercise these rights, contact <Mail />.
                    </p>
                    <p>You may also have the right to lodge a complaint with your local data protection authority.</p>
                </section>

                <section>
                    <h2>8. Waitlist Participation</h2>
                    <p>
                        Joining the MUSED waitlist is free and does not guarantee early access, product availability, or
                        a specific launch date.
                    </p>
                    <p>MUSED may modify or discontinue the waitlist at its discretion, subject to applicable law.</p>
                </section>

                <section>
                    <h2>9. Updates to This Notice</h2>
                    <p>
                        We may update this notice as our services evolve or legal requirements change. The latest version
                        will be available on our website.
                    </p>
                </section>

                <section>
                    <h2>10. Contact</h2>
                    <p>
                        MUSED 852
                        <br />
                        Operated by MUSED 852 LLC
                        <br />
                        <Mail />
                    </p>
                </section>
            </article>
        </div>
    );
}