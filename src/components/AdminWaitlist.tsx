// components/AdminWaitlist.tsx
//
// Admin-only view of the waitlist signups collected on the public landing
// (and anywhere else that posts to POST /api/waitlist). The backend has had
// GET /api/waitlist since the waitlist route shipped — this is the first
// screen that reads it.
import { useState, useEffect, useCallback } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { BackLink } from './BackLink';
import { ChevronLeft, ChevronRight, Copy, Check, Users } from 'lucide-react';
import { API_CONFIG, fetchPaginated } from '../utils/api';

interface WaitlistEntry {
    _id: string;
    email: string;
    source: string;
    createdAt: string;
}

export function AdminWaitlist() {
    const [entries, setEntries] = useState<WaitlistEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [copied, setCopied] = useState(false);

    const fetchEntries = useCallback(async (page: number) => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token') || undefined;
            const result = await fetchPaginated<WaitlistEntry>(API_CONFIG.endpoints.waitlist, page, 50, token);
            setEntries(result.data);
            setTotalPages(result.pagination.totalPages);
            setTotalItems(result.pagination.totalItems);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching the waitlist');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEntries(currentPage);
    }, [currentPage, fetchEntries]);

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const copyEmails = async () => {
        try {
            await navigator.clipboard.writeText(entries.map((e) => e.email).join('\n'));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard access denied — nothing to recover, the list is still on screen.
        }
    };

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-cream pt-28 pb-20 sm:pt-32">
                <div className="container mx-auto max-w-4xl px-4">
                    <BackLink to="/admin" label="Admin" className="mb-4" />

                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <span className="text-xs uppercase tracking-label text-plum/40">Admin</span>
                            <h1 className="mt-1 font-kaldera font-normal text-3xl text-plum-dark sm:text-4xl">
                                Waitlist
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 rounded-full bg-plum-dark/6 px-3 py-1.5 text-xs text-plum-dark">
                                <Users size={13} />
                                {totalItems} signed up
                            </span>
                            <button
                                onClick={copyEmails}
                                disabled={entries.length === 0}
                                className="flex items-center gap-1.5 rounded-full border border-plum-dark/15 px-4 py-1.5 text-xs font-medium text-plum-dark transition-colors hover:bg-plum-dark/5 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {copied ? <Check size={13} /> : <Copy size={13} />}
                                {copied ? 'Copied' : 'Copy emails on this page'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-2xl border border-[#C9614E]/25 bg-[#C9614E]/8 px-5 py-4 text-sm text-[#C9614E]">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-plum-dark/20 border-t-plum-dark" />
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="rounded-3xl border border-white/60 bg-white/60 py-16 text-center backdrop-blur-md">
                            <Users size={36} className="mx-auto mb-4 text-plum/25" />
                            <p className="text-plum/60">No signups yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/60 backdrop-blur-md">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-plum-dark/8 text-left text-xs uppercase tracking-label text-plum/40">
                                        <th className="px-5 py-3 font-medium">Email</th>
                                        <th className="px-5 py-3 font-medium">Source</th>
                                        <th className="px-5 py-3 font-medium">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-plum-dark/6">
                                    {entries.map((entry) => (
                                        <tr key={entry._id}>
                                            <td className="px-5 py-3 text-plum-dark">{entry.email}</td>
                                            <td className="px-5 py-3 text-plum/60">{entry.source || '—'}</td>
                                            <td className="px-5 py-3 text-plum/60">
                                                {new Date(entry.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-center gap-4">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-plum-dark/15 text-plum-dark transition-colors hover:bg-plum-dark/5 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm text-plum/60">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-plum-dark/15 text-plum-dark transition-colors hover:bg-plum-dark/5 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
