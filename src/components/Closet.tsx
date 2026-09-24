// components/Closet.tsx
//
// The digital wardrobe — personal, non-commercial collection of a user's
// own clothes plus an AI-generated "style snapshot." This is a different
// concept from /my-uploads (listing an item for sale/rent in the
// marketplace) and from /shop (browsing brands) — nothing here is for sale.
// Ported from the mobile app's Wardrobe tab (app/(tabs)/index.tsx), which
// already proves out the same backend endpoints used here.
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Plus, Shirt, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { API_CONFIG, fetchPaginated, getImageUrl } from '../utils/api';

interface ClosetItem {
    _id: string;
    productName?: string;
    category: string;
    colors?: string[];
    styleTags?: string[];
    images: string[];
    outfitId?: string | null;
}

interface StyleProfile {
    summary?: string;
    wardrobeSignals?: {
        colors?: string[];
        styles?: string[];
        categories?: string[];
    };
}

export function Closet() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [items, setItems] = useState<ClosetItem[]>([]);
    const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [view, setView] = useState<'pieces' | 'outfits'>('pieces');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login', { state: { from: '/closet' } });
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        if (!isAuthenticated) return;

        const token = localStorage.getItem('token') || undefined;

        const loadItems = async () => {
            try {
                const { data } = await fetchPaginated<ClosetItem>(
                    API_CONFIG.endpoints.clothingMyItems,
                    1,
                    100,
                    token
                );
                setItems(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Could not load your closet');
            } finally {
                setLoading(false);
            }
        };

        const loadStyleProfile = async () => {
            try {
                const res = await fetch(`${API_CONFIG.baseURL}/profile/style`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                if (!res.ok) return;
                const result = await res.json();
                if (result.success) setStyleProfile(result.data);
            } catch {
                // Non-fatal — the closet still works without a style snapshot.
            }
        };

        loadItems();
        loadStyleProfile();
    }, [isAuthenticated]);

    const categories = useMemo(() => {
        const set = new Set<string>();
        items.forEach((item) => item.category && set.add(item.category));
        return ['All', ...Array.from(set).sort()];
    }, [items]);

    const filteredItems = useMemo(() => {
        if (selectedCategory === 'All') return items;
        return items.filter((item) => item.category === selectedCategory);
    }, [items, selectedCategory]);

    // Group pieces that were extracted together from the same outfit photo.
    // Each group's items[1] is the same shared source photo.
    const outfits = useMemo(() => {
        const groups = new Map<string, ClosetItem[]>();
        items.forEach((item) => {
            if (!item.outfitId) return;
            const group = groups.get(item.outfitId) || [];
            group.push(item);
            groups.set(item.outfitId, group);
        });
        return Array.from(groups.entries()).map(([outfitId, outfitItems]) => ({
            outfitId,
            photo: outfitItems[0]?.images?.[1] || outfitItems[0]?.images?.[0],
            items: outfitItems,
        }));
    }, [items]);

    const colorCount = new Set(items.flatMap((i) => i.colors || [])).size;
    const styleCount = new Set(items.flatMap((i) => i.styleTags || [])).size;

    if (authLoading || loading) {
        return (
            <div className="font-sans">
                <Header />
                <main className="min-h-screen bg-cream pt-28 pb-16 sm:pt-32">
                    <div className="container mx-auto max-w-5xl px-4 text-center py-20">
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
            <main className="min-h-screen bg-cream pt-28 pb-20 sm:pt-32">
                <div className="container mx-auto max-w-5xl px-4">
                    <div className="mb-8 flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs uppercase tracking-label text-plum/40">Your</span>
                            <h1 className="mt-1 font-kaldera font-normal text-3xl text-plum-dark sm:text-4xl">
                                Closet
                            </h1>
                        </div>
                        <Link
                            to="/closet/add"
                            className="flex items-center gap-2 rounded-full bg-gradient-to-b from-plum-dark to-plum px-5 py-3 text-sm font-medium text-cream shadow-[0_8px_16px_rgba(61,16,40,0.18)] transition-all hover:brightness-110 active:scale-[0.98]"
                        >
                            <Plus size={16} />
                            Add a Piece
                        </Link>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-2xl border border-[#C9614E]/25 bg-[#C9614E]/8 px-5 py-4 text-sm text-[#C9614E]">
                            {error}
                        </div>
                    )}

                    {/* Stats */}
                    <div className="mb-8 grid grid-cols-3 gap-3">
                        {[
                            { label: 'Pieces', value: items.length },
                            { label: 'Colours', value: colorCount },
                            { label: 'Styles', value: styleCount },
                        ].map(({ label, value }) => (
                            <div key={label} className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/60 px-4 py-4 text-center shadow-[0_2px_10px_rgba(93,27,58,0.06)]">
                                <div className="font-kaldera text-2xl text-plum-dark">{value}</div>
                                <div className="text-xs uppercase tracking-label text-plum/50 mt-1">{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* AI style snapshot */}
                    {styleProfile?.summary && (
                        <div className="mb-8 rounded-2xl bg-white/60 backdrop-blur-md border border-white/60 px-5 py-4 shadow-[0_2px_10px_rgba(93,27,58,0.06)]">
                            <div className="flex items-center gap-2 text-plum-dark">
                                <Sparkles size={16} className="text-[#C9A96E]" />
                                <span className="text-xs font-medium uppercase tracking-label">Style snapshot</span>
                            </div>
                            <p className="mt-2 font-sans italic text-plum/80">{styleProfile.summary}</p>
                            {(styleProfile.wardrobeSignals?.colors?.length || styleProfile.wardrobeSignals?.styles?.length) ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {(styleProfile.wardrobeSignals?.colors || []).slice(0, 6).map((c) => (
                                        <span key={c} className="rounded-full bg-plum/8 px-3 py-1 text-xs text-plum-dark">{c}</span>
                                    ))}
                                    {(styleProfile.wardrobeSignals?.styles || []).slice(0, 4).map((s) => (
                                        <span key={s} className="rounded-full bg-[#C9A96E]/15 px-3 py-1 text-xs text-plum-dark">{s}</span>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    )}

                    {/* Pieces / Outfits toggle */}
                    <div className="mb-6 inline-flex rounded-full bg-white/60 border border-white/60 p-1">
                        {(['pieces', 'outfits'] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`rounded-full px-5 py-1.5 text-sm font-medium capitalize transition-colors ${
                                    view === v ? 'bg-plum-dark text-cream' : 'text-plum/60 hover:text-plum-dark'
                                }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>

                    {view === 'pieces' ? (
                        <>
                            {/* Category filter */}
                            {categories.length > 1 && (
                                <div className="mb-6 flex flex-wrap gap-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors ${
                                                selectedCategory === cat
                                                    ? 'bg-plum-dark text-cream'
                                                    : 'bg-white/60 text-plum/60 border border-white/60 hover:bg-white'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Grid / empty state */}
                            {filteredItems.length === 0 ? (
                                <div className="rounded-3xl bg-white/60 backdrop-blur-md border border-white/60 py-16 text-center">
                                    <Shirt size={40} className="mx-auto mb-4 text-plum/25" />
                                    <p className="mb-5 text-plum/60">
                                        {items.length === 0 ? "Your closet's empty — add your first piece." : 'Nothing in this category yet.'}
                                    </p>
                                    <Link
                                        to="/closet/add"
                                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-plum-dark to-plum px-6 py-3 text-sm font-medium text-cream"
                                    >
                                        <Plus size={16} />
                                        Add a Piece
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-1 sm:gap-3">
                                    {filteredItems.map((item) => (
                                        <Link
                                            key={item._id}
                                            to={`/closet/${item._id}`}
                                            className="group aspect-square overflow-hidden rounded-lg sm:rounded-2xl bg-plum-dark/5"
                                        >
                                            <img
                                                src={item.images?.[0] || getImageUrl(item._id, 0)}
                                                alt={item.productName || item.category}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                onError={(e) => {
                                                    e.currentTarget.src = getImageUrl(item._id, 0);
                                                }}
                                            />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        /* Outfits — each card is the shared source photo; click in to see its pieces */
                        outfits.length === 0 ? (
                            <div className="rounded-3xl bg-white/60 backdrop-blur-md border border-white/60 py-16 text-center">
                                <Shirt size={40} className="mx-auto mb-4 text-plum/25" />
                                <p className="text-plum/60">
                                    No outfits yet — extract 2+ pieces from one photo when adding to your closet.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                                {outfits.map((outfit) => (
                                    <Link
                                        key={outfit.outfitId}
                                        to={`/closet/outfit/${outfit.outfitId}`}
                                        className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-plum-dark/5"
                                    >
                                        {outfit.photo && (
                                            <img
                                                src={outfit.photo}
                                                alt=""
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                                            <span className="text-xs font-medium text-white">{outfit.items.length} pieces</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
