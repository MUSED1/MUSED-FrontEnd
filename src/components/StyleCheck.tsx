// components/StyleCheck.tsx
//
// "M" — the AI stylecheck chatbot, ported from the mobile app's
// app/(tabs)/stylecheck.tsx. Send a photo + occasion, get an honest read
// + actionable tips; keep chatting from there. The backend already
// parses the model's first-turn JSON reply into `message.text` (the
// read) and `message.tips` (chip-able suggestions) — this client just
// renders what comes back, no JSON parsing needed here.
//
// One deliberate improvement over the mobile screen: mobile's own
// follow-up composer appears to be missing once a conversation starts
// (the API supports it, the UI for it doesn't seem to be there) — this
// version always shows a real follow-up composer.
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Camera, Send, Sparkles, X, RotateCcw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { API_CONFIG, convertHeicIfNeeded } from '../utils/api';

const OCCASIONS = ['Casual', 'Smart Casual', 'Formal'];

interface Tip {
    text: string;
    category: string;
}

interface MMessage {
    role: 'user' | 'assistant';
    text?: string;
    image?: string | null;
    tips?: Tip[];
}

interface MConversation {
    _id: string;
    coverImage: string;
    title: string;
    messages: MMessage[];
}

interface SuggestionItem {
    _id: string;
    productName?: string;
    brand?: string;
    images: string[];
    price?: number;
    currency?: string;
    category: string;
}

function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Could not read that file'));
        reader.readAsDataURL(file);
    });
}

export function StyleCheck() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [weather, setWeather] = useState<string | null>(null);

    // Pre-start composer
    const [startPhoto, setStartPhoto] = useState<string | null>(null);
    const [occasion, setOccasion] = useState<string | null>(null);
    const [detail, setDetail] = useState('');
    const [starting, setStarting] = useState(false);

    // Conversation state
    const [conversation, setConversation] = useState<MConversation | null>(null);
    const [suggestionsByIndex, setSuggestionsByIndex] = useState<Record<number, SuggestionItem[]>>({});
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    // Follow-up composer
    const [followUpText, setFollowUpText] = useState('');
    const [followUpPhoto, setFollowUpPhoto] = useState<string | null>(null);

    const threadEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login', { state: { from: '/style-check' } });
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit`
                    );
                    const json = await res.json();
                    const temp = json?.current_weather?.temperature;
                    if (typeof temp === 'number') setWeather(`${Math.round(temp)}°F`);
                } catch {
                    // Silent — weather is a nice-to-have, not required to use M.
                }
            },
            () => {
                // Silent — user declined location, that's fine.
            }
        );
    }, []);

    useEffect(() => {
        threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation?.messages.length]);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };

    const handleStartPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setStartPhoto(await fileToDataUrl(await convertHeicIfNeeded(file)));
        } catch {
            setError('Could not read that photo.');
        }
        e.target.value = '';
    };

    const handleFollowUpPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setFollowUpPhoto(await fileToDataUrl(await convertHeicIfNeeded(file)));
        } catch {
            setError('Could not read that photo.');
        }
        e.target.value = '';
    };

    const startConversation = async () => {
        if (!startPhoto || !occasion) return;
        setStarting(true);
        setError('');
        try {
            const context = [occasion, detail.trim(), weather && `weather: ${weather}`]
                .filter(Boolean)
                .join(', ');
            const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.styleCheck}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ image: startPhoto, context }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setConversation(result.data);
            } else {
                throw new Error(result.message || "M couldn't read that outfit — try again.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "M couldn't read that outfit — try again.");
        } finally {
            setStarting(false);
        }
    };

    const sendFollowUp = async (text?: string, image?: string | null) => {
        if (!conversation) return;
        const messageText = text ?? followUpText.trim();
        const messageImage = image !== undefined ? image : followUpPhoto;
        if (!messageText && !messageImage) return;

        setSending(true);
        setError('');
        try {
            const res = await fetch(
                `${API_CONFIG.baseURL}${API_CONFIG.endpoints.styleCheck}/${conversation._id}/messages`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ text: messageText || undefined, image: messageImage || undefined }),
                }
            );
            const result = await res.json();
            if (res.ok && result.success) {
                setConversation(result.data);
                setFollowUpText('');
                setFollowUpPhoto(null);
            } else {
                throw new Error(result.message || 'Message failed to send.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Message failed to send.');
        } finally {
            setSending(false);
        }
    };

    const handleTipTap = async (tip: Tip, messageIndex: number) => {
        await sendFollowUp(tip.text, null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(
                `${API_CONFIG.baseURL}${API_CONFIG.endpoints.styleCheck}/${conversation?._id}/suggestions?category=${encodeURIComponent(tip.category)}`,
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            const result = await res.json();
            if (result.success) {
                setSuggestionsByIndex((prev) => ({ ...prev, [messageIndex]: result.data }));
            }
        } catch {
            // Non-fatal — suggestions are a bonus, not required.
        }
    };

    const startOver = () => {
        setConversation(null);
        setStartPhoto(null);
        setOccasion(null);
        setDetail('');
        setSuggestionsByIndex({});
        setError('');
    };

    const canStart = Boolean(startPhoto && occasion) && !starting;

    if (authLoading || !isAuthenticated) {
        return (
            <div className="font-sans">
                <Header />
                <main className="min-h-screen bg-cream pt-28 pb-16 sm:pt-32">
                    <div className="container mx-auto max-w-2xl px-4 text-center py-20">
                        <div className="w-8 h-8 border-2 border-plum border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-cream pt-28 pb-8 sm:pt-32">
                <div className="container mx-auto max-w-2xl px-4">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <span className="text-xs uppercase tracking-label text-plum/40">Ask</span>
                            <h1 className="mt-1 font-kaldera font-normal text-3xl text-plum-dark sm:text-4xl">M</h1>
                        </div>
                        {conversation && (
                            <button
                                onClick={startOver}
                                className="flex items-center gap-1.5 rounded-full border border-plum/20 px-4 py-2 text-sm text-plum-dark hover:bg-plum/5 transition-colors"
                            >
                                <RotateCcw size={14} />
                                New
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="mb-4 rounded-2xl border border-[#C9614E]/25 bg-[#C9614E]/8 px-5 py-4 text-sm text-[#C9614E]">
                            {error}
                        </div>
                    )}

                    {!conversation ? (
                        <div className="rounded-3xl bg-white/60 backdrop-blur-md border border-white/60 p-6 sm:p-8 shadow-[0_2px_10px_rgba(93,27,58,0.06)]">
                            <p className="mb-6 font-sans italic text-plum/70">
                                I'm M — the roommate you wish you had. Send a photo of your outfit and tell me the occasion, and I'll give you an honest read.
                            </p>

                            {startPhoto ? (
                                <div className="relative mb-6 h-64 w-full overflow-hidden rounded-2xl">
                                    <img src={startPhoto} alt="" className="h-full w-full object-cover" />
                                    <button
                                        onClick={() => setStartPhoto(null)}
                                        className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label className="mb-6 flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-plum/20 text-plum/40 hover:border-plum/40 hover:text-plum/60 transition-colors">
                                    <Camera size={24} />
                                    <span className="text-sm">Attach a photo of your outfit</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleStartPhoto} />
                                </label>
                            )}

                            <label className="block text-sm font-medium text-plum/80 mb-2">Occasion</label>
                            <div className="mb-4 flex flex-wrap gap-2">
                                {OCCASIONS.map((o) => (
                                    <button
                                        key={o}
                                        type="button"
                                        onClick={() => setOccasion(o)}
                                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                            occasion === o ? 'bg-plum-dark text-cream' : 'bg-white/60 text-plum/70 border border-white/60 hover:bg-white'
                                        }`}
                                    >
                                        {o}
                                    </button>
                                ))}
                            </div>

                            <label className="block text-sm font-medium text-plum/80 mb-2">Add detail (optional)</label>
                            <input
                                type="text"
                                value={detail}
                                onChange={(e) => setDetail(e.target.value)}
                                placeholder="e.g. dinner with a client then drinks after"
                                className="mb-6 w-full px-5 py-3 bg-white/50 border border-white/60 rounded-2xl text-plum placeholder-plum/40 focus:outline-none focus:ring-2 focus:ring-plum/25"
                            />

                            <div className="rounded-full shadow-[0_8px_16px_rgba(61,16,40,0.18)]">
                                <button
                                    onClick={startConversation}
                                    disabled={!canStart}
                                    className="w-full rounded-full bg-gradient-to-b from-plum-dark to-plum px-6 py-4 text-base font-normal text-cream disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:brightness-110 active:scale-[0.98]"
                                >
                                    {starting ? 'Reading your fit…' : 'Ask M'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 rounded-3xl bg-white/60 backdrop-blur-md border border-white/60 p-4 sm:p-6 shadow-[0_2px_10px_rgba(93,27,58,0.06)] max-h-[60vh] overflow-y-auto">
                                {conversation.messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                                msg.role === 'user'
                                                    ? 'bg-plum-dark text-cream'
                                                    : 'bg-white text-plum-dark border border-plum/10'
                                            }`}
                                        >
                                            {msg.role === 'assistant' && (
                                                <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[#C9A96E]">
                                                    <Sparkles size={12} />
                                                    M
                                                </div>
                                            )}
                                            {msg.image && (
                                                <img src={msg.image} alt="" className="mb-2 max-h-48 rounded-xl object-cover" />
                                            )}
                                            {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}

                                            {msg.tips && msg.tips.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {msg.tips.map((tip, ti) => (
                                                        <button
                                                            key={ti}
                                                            onClick={() => handleTipTap(tip, i)}
                                                            className="rounded-full bg-[#C9A96E]/15 px-3 py-1.5 text-xs text-plum-dark hover:bg-[#C9A96E]/25 transition-colors"
                                                        >
                                                            {tip.text}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {suggestionsByIndex[i] && suggestionsByIndex[i].length > 0 && (
                                                <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                                                    {suggestionsByIndex[i].map((item) => (
                                                        <div key={item._id} className="w-24 shrink-0">
                                                            <div className="h-24 w-24 overflow-hidden rounded-xl bg-plum-dark/5">
                                                                {item.images?.[0] && (
                                                                    <img src={item.images[0]} alt="" className="h-full w-full object-cover" />
                                                                )}
                                                            </div>
                                                            <p className="mt-1 truncate text-[10px] text-plum/60">{item.productName || item.category}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={threadEndRef} />
                            </div>

                            {/* Follow-up composer */}
                            <div className="mt-4 rounded-3xl bg-white/60 backdrop-blur-md border border-white/60 p-3 shadow-[0_2px_10px_rgba(93,27,58,0.06)]">
                                {followUpPhoto && (
                                    <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-xl">
                                        <img src={followUpPhoto} alt="" className="h-full w-full object-cover" />
                                        <button
                                            onClick={() => setFollowUpPhoto(null)}
                                            className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-plum/8 text-plum-dark hover:bg-plum/15 transition-colors">
                                        <Camera size={18} />
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFollowUpPhoto} />
                                    </label>
                                    <input
                                        type="text"
                                        value={followUpText}
                                        onChange={(e) => setFollowUpText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !sending) sendFollowUp();
                                        }}
                                        placeholder="Ask a follow-up…"
                                        className="flex-1 px-4 py-3 bg-white/50 border border-white/60 rounded-full text-plum placeholder-plum/40 focus:outline-none focus:ring-2 focus:ring-plum/25"
                                    />
                                    <button
                                        onClick={() => sendFollowUp()}
                                        disabled={sending || (!followUpText.trim() && !followUpPhoto)}
                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-plum-dark to-plum text-cream disabled:opacity-50 transition-all hover:brightness-110"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
