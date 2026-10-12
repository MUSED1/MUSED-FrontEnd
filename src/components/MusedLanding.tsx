// components/MusedLanding.tsx
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { API_CONFIG } from '../utils/api';
import './MusedLanding.css';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

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

// ─────────────────────────────────────────────
// "Emerging brand? Let's talk." — Get in touch form
// ─────────────────────────────────────────────
function BrandEnquiryForm() {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: '', brandName: '', email: '', link: '', message: '' });
    const [honeypot, setHoneypot] = useState('');
    const [note, setNote] = useState('');
    const [sent, setSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [field]: e.target.value }));

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!form.name.trim() || !form.brandName.trim() || !form.message.trim()) {
            setNote('Please fill in your name, brand and message.');
            return;
        }
        if (!EMAIL_RE.test(form.email.trim())) {
            setNote('Please enter a valid email address.');
            return;
        }

        setSubmitting(true);
        setNote('');
        try {
            const { ok, data } = await postJson(API_CONFIG.endpoints.brandEnquiries, { ...form, website: honeypot });
            if (ok) {
                setSent(true);
                setNote(data.message || "Thanks! We'll get back to you soon.");
                setForm({ name: '', brandName: '', email: '', link: '', message: '' });
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
        <div className="box">
            <h2 className="sm">Emerging brand? Let's talk.</h2>

            {!open && !sent && (
                <button type="button" className="btn" onClick={() => setOpen(true)}>
                    Get in touch
                </button>
            )}

            {open && !sent && (
                <form className="enquiry" onSubmit={handleSubmit} noValidate>
                    <input className="field" placeholder="Your name" aria-label="Your name" autoComplete="name" value={form.name} onChange={update('name')} maxLength={120} />
                    <input className="field" placeholder="Brand name" aria-label="Brand name" autoComplete="organization" value={form.brandName} onChange={update('brandName')} maxLength={120} />
                    <input className="field" type="email" placeholder="your@email.com" aria-label="Email address" autoComplete="email" value={form.email} onChange={update('email')} maxLength={254} />
                    <input className="field" placeholder="Instagram or website (optional)" aria-label="Instagram or website" value={form.link} onChange={update('link')} maxLength={300} />
                    <textarea className="field" placeholder="Tell us about your brand" aria-label="Message" rows={4} value={form.message} onChange={update('message')} maxLength={2000} />
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
                    <button type="submit" className="btn" disabled={submitting}>
                        {submitting ? 'Sending…' : 'Send'}
                    </button>
                </form>
            )}

            <div className="note" role="status" aria-live="polite">
                {note}
            </div>
        </div>
    );
}

export function MusedLanding() {
    const scrollToWhat = () => {
        document.getElementById('what')?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToTop = (e: React.MouseEvent) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="mused-landing">
            <main className="frame">
                <h1 className="logo">
                    <img src="/mused-logo.png" alt="MUSED 852" width={700} height={281} />
                </h1>
                <p className="tag">A powerhouse for rising brands.</p>

                <div className="box">
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

                <button type="button" className="cue" onClick={scrollToWhat}>
                    What is MUSED 852?
                </button>
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
                        <a href="#" onClick={scrollToTop}>
                            Join the wait-list.
                        </a>
                    </p>

                    <BrandEnquiryForm />

                    <p className="names">Jana &amp; Eva</p>
                    <a className="ig" href="https://instagram.com/mused852" target="_blank" rel="noopener noreferrer">
                        @mused852 on Instagram
                    </a>
                </div>
            </section>
        </div>
    );
}