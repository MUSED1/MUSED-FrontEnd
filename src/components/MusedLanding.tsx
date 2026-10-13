// components/MusedLanding.tsx
import { useState, type FormEvent, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { API_CONFIG } from '../utils/api';
import './MusedLanding.css';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const CONTACT_EMAIL = 'info@mused852.com';
const INSTAGRAM_URL = 'https://www.instagram.com/mused852/';

// Pre-filled email draft for brands
const MAILTO_HREF =
    `mailto:${CONTACT_EMAIL}` +
    `?subject=${encodeURIComponent('Emerging brand enquiry — MUSED 852')}` +
    `&body=${encodeURIComponent(
        "Hi Jana & Eva,\n\n" +
        "I'd love to tell you about my brand.\n\n" +
        "Name:\n" +
        "Brand name:\n" +
        "Instagram / website:\n\n" +
        "About the brand:\n\n"
    )}`;

type ApiResponse = { success: boolean; message?: string };

async function postJson(path: string, body: unknown): Promise<{ ok: boolean; status: number; data: ApiResponse }> {
    const res = await fetch(`${API_CONFIG.baseURL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
    });
    let data: ApiResponse = { success: false };
    try {
        data = await res.json();
    } catch {
        /* non-JSON response */
    }
    return { ok: res.ok, status: res.status, data };
}

// Smooth-scroll to an element by id (works with the sticky-free layout)
function scrollToId(id: string, focusId?: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
    if (focusId) {
        // focus after the scroll has had time to land, without jumping again
        window.setTimeout(() => {
            (document.getElementById(focusId) as HTMLInputElement | null)?.focus({ preventScroll: true });
        }, 600);
    }
}

// ─────────────────────────────────────────────
// Wait-list form
// ─────────────────────────────────────────────
function WaitlistForm() {
    const [email, setEmail] = useState('');
    const [consent, setConsent] = useState(false);
    const [honeypot, setHoneypot] = useState('');
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const value = email.trim();

        if (!EMAIL_RE.test(value)) {
            setNote('Please enter a valid email address.');
            return;
        }
        if (!consent) {
            setNote('Please tick the box to join the waitlist.');
            return;
        }

        setSubmitting(true);
        setNote('');
        try {
            const { ok, status, data } = await postJson(API_CONFIG.endpoints.waitlist, {
                email: value,
                consent,
                website: honeypot,
                source: 'landing',
            });

            if (ok || status === 409) {
                // 409 = already on the list, which is still good news for the visitor
                setNote(data.message || "You're on the list. We'll be in touch soon.");
                setEmail('');
                setConsent(false);
            } else {
                setNote(data.message || 'Something went wrong. Please try again.');
            }
        } catch {
            setNote('Could not connect. Please check your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} noValidate>
                <input
                    id="waitlist-email"
                    className="email"
                    type="email"
                    placeholder="your@email.com"
                    aria-label="Email address"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {/* Honeypot: hidden from people, bots fill it in */}
                <input
                    className="hp"
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                />
                <label className="consent">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                    <span>
                        I'd like to receive emails from MUSED about launches, emerging brands, events, and new
                        collections. I can unsubscribe anytime.
                    </span>
                </label>
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Joining…' : 'Join'}
                </button>
            </form>

            <div className="note" role="status" aria-live="polite">
                {note}
            </div>
        </>
    );
}

export function MusedLanding() {
    const goToWhat = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        scrollToId('what');
    };

    const goToWaitlist = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        scrollToId('waitlist', 'waitlist-email');
    };

    return (
        <div className="mused-landing">
            <main className="frame">
                <h1 className="logo">
                    <img src="/mused-logo.png" alt="MUSED 852" width={700} height={281} />
                </h1>
                <p className="tag">A powerhouse for rising brands.</p>

                <div className="box" id="waitlist">
                    <h2>Coming soon…</h2>
                    <p className="ctx">
                        A curated digital closet for unique pieces from emerging designers, made with intention. A
                        place to discover &amp; get discovered.
                    </p>
                    <p>Join the wait-list for first access.</p>

                    <WaitlistForm />

                    <p className="terms">
                        By joining, you acknowledge our <Link to="/waitlist-terms">Waitlist Terms &amp; Privacy Notice</Link>.
                    </p>
                </div>

                <a className="cue" href="#what" onClick={goToWhat}>
                    What is MUSED 852?
                </a>
            </main>

            <section className="what" id="what">
                <div className="what-in">
                    <h2>What is MUSED 852?</h2>
                    <p className="intro">
                        MUSED helps consumers discover and shop emerging fashion brands through a curated digital
                        wardrobe and exclusive events, while giving independent designers access to new customers, a
                        community of founders, and opportunities to grow their businesses.
                    </p>

                    <div className="pillars">
                        <div>
                            <h3>Our digital shop</h3>
                            <p>
                                Shop unique pieces from rising designers, each one chosen with care. Your next &ldquo;Where
                                is that from?&rdquo; starts here.
                            </p>
                        </div>
                        <div>
                            <h3>Our events</h3>
                            <p>
                                Curated nights in Hong Kong, New York and London, bringing the people who wear fashion
                                closer to the people who make it.
                            </p>
                        </div>
                        <div>
                            <h3>A founders' community</h3>
                            <p>Brand founders sharing connections and lifting each other up.</p>
                        </div>
                    </div>

                    <p className="story">
                        We started in Hong Kong &amp; now building beyond.{' '}
                        <a href="#waitlist" onClick={goToWaitlist}>
                            Join the wait-list.
                        </a>
                    </p>

                    <div className="box">
                        <h2 className="sm">Emerging brand? Let's talk.</h2>
                        <a className="btn" href={MAILTO_HREF}>
                            Get in touch
                        </a>
                        <p className="mail-alt">
                            or email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                        </p>
                    </div>

                    <p className="names">Jana &amp; Eva</p>
                    <a className="ig" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                        @mused852 on Instagram
                    </a>
                </div>
            </section>
        </div>
    );
}