// components/PartnerWithUs.tsx
//
// Public "Partner With Us" page — where "Partner With Us" links (Header,
// Footer) now point, instead of straight into the seller-only /brand
// onboarding form. This is the actual current process: a brand reaches
// out, the founder has a conversation with them by email, and only once
// that's settled does the brand go create an account and apply
// (/seller/signup → /brand). This page doesn't gate anything or require
// an account — it just sends an email via POST /api/brand/inquiries.
//
// Already-selling brands (or ones ready to skip the conversation and
// apply directly) still have links here to /seller/login and
// /seller/signup — this page doesn't replace that path, just adds a
// front door for everyone else.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CheckCircle2 } from 'lucide-react';
import { API_CONFIG } from '../utils/api';

export function PartnerWithUs() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [brandName, setBrandName] = useState('');
    const [message, setMessage] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const canSubmit = name.trim() && email.trim() && message.trim() && !submitting;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setSubmitting(true);
        setError('');
        try {
            const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.brandInquiries}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    brandName: brandName.trim() || undefined,
                    message: message.trim(),
                }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setSubmitted(true);
            } else {
                throw new Error(result.message || 'Could not send your message. Please try again.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not send your message. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-cream pt-28 pb-20 sm:pt-32">
                <div className="container mx-auto max-w-2xl px-4">
                    <div className="mb-10 text-center">
                        <span className="text-xs uppercase tracking-label text-plum/40">For Brands</span>
                        <h1 className="mt-1 font-kaldera font-normal text-3xl text-plum-dark sm:text-4xl">
                            Partner With Us
                        </h1>
                        <div className="mx-auto mt-4 h-px w-9 bg-[#C9A96E]" />
                        <p className="mt-4 font-sans italic text-plum/70">
                            MUSED puts your pieces in front of a curated community ready to rent, wear and love them.
                            Tell us about your brand and we'll be in touch to talk through what a storefront with us
                            could look like.
                        </p>
                    </div>

                    {submitted ? (
                        <div className="rounded-3xl bg-white/60 backdrop-blur-md border border-white/60 p-8 text-center shadow-[0_2px_10px_rgba(93,27,58,0.06)]">
                            <CheckCircle2 size={40} className="mx-auto mb-4 text-[#C9A96E]" />
                            <h2 className="font-kaldera text-2xl text-plum-dark">Message sent</h2>
                            <p className="mt-2 text-plum/70">
                                Thanks for reaching out — we'll get back to you at {email} soon.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl bg-white/60 backdrop-blur-md border border-white/60 p-6 sm:p-8 shadow-[0_2px_10px_rgba(93,27,58,0.06)]">
                            {error && (
                                <div className="rounded-2xl border border-[#C9614E]/25 bg-[#C9614E]/8 px-5 py-4 text-sm text-[#C9614E]">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-plum/80 mb-2">Your name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl text-plum placeholder-plum/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_10px_rgba(93,27,58,0.06)] focus:outline-none focus:ring-2 focus:ring-plum/25 focus:border-plum/40 focus:bg-white/70 transition-all duration-200"
                                    disabled={submitting}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-plum/80 mb-2">Email address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl text-plum placeholder-plum/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_10px_rgba(93,27,58,0.06)] focus:outline-none focus:ring-2 focus:ring-plum/25 focus:border-plum/40 focus:bg-white/70 transition-all duration-200"
                                    disabled={submitting}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-plum/80 mb-2">Brand name (optional)</label>
                                <input
                                    type="text"
                                    value={brandName}
                                    onChange={(e) => setBrandName(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl text-plum placeholder-plum/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_10px_rgba(93,27,58,0.06)] focus:outline-none focus:ring-2 focus:ring-plum/25 focus:border-plum/40 focus:bg-white/70 transition-all duration-200"
                                    disabled={submitting}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-plum/80 mb-2">Tell us about your brand</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={5}
                                    placeholder="What you make, where you're based, what you're hoping for..."
                                    className="w-full px-5 py-3.5 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl text-plum placeholder-plum/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_10px_rgba(93,27,58,0.06)] focus:outline-none focus:ring-2 focus:ring-plum/25 focus:border-plum/40 focus:bg-white/70 transition-all duration-200 resize-y"
                                    disabled={submitting}
                                />
                            </div>

                            <div className="rounded-full shadow-[0_8px_16px_rgba(61,16,40,0.18)]">
                                <button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="w-full rounded-full bg-gradient-to-b from-plum-dark to-plum px-6 py-4 text-base font-normal text-cream disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:brightness-110 active:scale-[0.98]"
                                >
                                    {submitting ? 'Sending…' : 'Send message'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-8 text-center text-sm text-plum/50">
                        Already selling with us?{' '}
                        <Link to="/seller/login" className="text-burgundy font-medium hover:text-gold transition-colors">
                            Sign in
                        </Link>
                        {' '}· Ready to apply directly?{' '}
                        <Link to="/seller/signup" className="text-burgundy font-medium hover:text-gold transition-colors">
                            Create a brand account
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
