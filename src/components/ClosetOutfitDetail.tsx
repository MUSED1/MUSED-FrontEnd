// components/ClosetOutfitDetail.tsx
//
// The "click in to reveal each piece" screen for an outfit — the shared
// source photo up top, then every piece extracted from it below, each
// linking to its own full item detail page. Reached from Closet.tsx's
// "Outfits" toggle, or from a piece's own detail page.
//
// There's no dedicated backend endpoint for this — it just fetches the
// user's items (the same call the Closet grid already uses) and filters
// client-side for whichever ones share this outfitId.
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '../hooks/useAuth';
import { API_CONFIG, fetchPaginated, getImageUrl } from '../utils/api';

interface ClosetItem {
    _id: string;
    productName?: string;
    category: string;
    images: string[];
    outfitId?: string | null;
}

export function ClosetOutfitDetail() {
    const { outfitId } = useParams<{ outfitId: string }>();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState<ClosetItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login', { state: { from: `/closet/outfit/${outfitId}` } });
        }
    }, [isAuthenticated, authLoading, navigate, outfitId]);

    useEffect(() => {
        if (!outfitId || !isAuthenticated) return;
        const token = localStorage.getItem('token') || undefined;

        const load = async () => {
            try {
                const { data } = await fetchPaginated<ClosetItem>(API_CONFIG.endpoints.clothingMyItems, 1, 100, token);
                const matching = data.filter((item) => item.outfitId === outfitId);
                if (matching.length === 0) {
                    setError('This outfit could not be found.');
                } else {
                    setItems(matching);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Could not load this outfit');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [outfitId, isAuthenticated]);

    if (authLoading || loading) {
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

    if (error || items.length === 0) {
        return (
            <div className="font-sans">
                <Header />
                <main className="min-h-screen bg-cream pt-28 pb-16 sm:pt-32">
                    <div className="container mx-auto max-w-2xl px-4 text-center py-20">
                        <p className="text-plum/60">{error}</p>
                        <Link to="/closet" className="mt-4 inline-block text-burgundy hover:text-gold">← Back to Closet</Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const photo = items[0].images?.[1] || items[0].images?.[0];

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-cream pt-28 pb-20 sm:pt-32">
                <div className="container mx-auto max-w-2xl px-4">
                    <Link to="/closet" className="text-sm text-plum/60 hover:text-burgundy transition-colors">
                        ← Back to Closet
                    </Link>

                    <h1 className="mt-3 mb-6 font-kaldera font-normal text-3xl text-plum-dark sm:text-4xl">
                        This Outfit
                    </h1>

                    {photo && (
                        <div className="mb-8 aspect-[3/4] w-full overflow-hidden rounded-3xl bg-plum-dark/5">
                            <img src={photo} alt="" className="h-full w-full object-cover" />
                        </div>
                    )}

                    <h2 className="mb-4 font-kaldera text-lg text-plum-dark">
                        {items.length} Piece{items.length === 1 ? '' : 's'}
                    </h2>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {items.map((item) => (
                            <Link
                                key={item._id}
                                to={`/closet/${item._id}`}
                                className="group"
                            >
                                <div className="aspect-square overflow-hidden rounded-2xl bg-plum-dark/5">
                                    <img
                                        src={item.images?.[0] || getImageUrl(item._id, 0)}
                                        alt={item.productName || item.category}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <p className="mt-1.5 truncate text-xs text-plum/60">{item.productName || item.category}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
