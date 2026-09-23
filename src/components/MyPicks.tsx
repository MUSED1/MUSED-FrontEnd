// components/MyPicks.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, CheckCircle } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

interface ClothingItem {
    _id: string;
    images: string[];
    category: string;
    size: string;
    status: string;
    createdAt: string;
    fullName?: string;
}

export function MyPicks() {
    const [picks, setPicks] = useState<ClothingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchPicks = async () => {
            try {
                const token = localStorage.getItem('token');
                const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

                const response = await axios.get(`${API_URL}/users/picks`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    setPicks(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching picks:', error);
                setPicks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPicks();
    }, [isAuthenticated, navigate]);

    const handleRemovePick = async (itemId: string) => {
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

            await axios.delete(`${API_URL}/users/picks/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPicks(prev => prev.filter(item => item._id !== itemId));
        } catch (error) {
            console.error('Error removing pick:', error);
        }
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="font-inter">
            <Header />
            <main className="min-h-screen bg-white pt-28 md:pt-32 pb-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm text-plum/50 hover:text-plum-dark transition-colors mb-4">
                        <ArrowLeft size={14} />
                        Profile
                    </Link>

                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-kaldera text-plum-dark">My Picks</h1>
                        <span className="rounded-full bg-plum-dark/6 px-3 py-1 text-xs text-plum-dark">
                            {picks.length} items saved
                        </span>
                    </div>
                    <div className="mb-8 h-px w-9 bg-[#C9A96E]" />

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-plum-dark/20 border-t-plum-dark rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : picks.length === 0 ? (
                        <div className="rounded-[1.75rem] border border-plum-dark/8 bg-white p-12 text-center shadow-[0_8px_24px_rgba(61,16,40,0.06)]">
                            <Heart size={40} className="text-plum/20 mx-auto mb-4" />
                            <p className="text-plum/60 mb-2">No picks yet</p>
                            <p className="text-sm text-plum/40 mb-6">Browse the collection and save items you like</p>
                            <div className="inline-block rounded-full shadow-[0_8px_16px_rgba(61,16,40,0.18)]">
                                <button
                                    onClick={() => navigate('/shop')}
                                    className="rounded-full border border-white/15 bg-gradient-to-b from-plum-dark to-plum px-6 py-3 text-sm font-normal text-cream transition-all hover:brightness-110 active:scale-[0.98]"
                                >
                                    Browse Collection
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {picks.map((item) => (
                                <div key={item._id} className="group">
                                    <div className="relative overflow-hidden rounded-2xl">
                                        <div
                                            className="h-64 bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.02]"
                                            style={{ backgroundImage: `url(${item.images[0]})` }}
                                        />
                                        <button
                                            onClick={() => handleRemovePick(item._id)}
                                            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white"
                                            title="Remove from picks"
                                        >
                                            <Heart size={16} className="fill-burgundy text-burgundy" />
                                        </button>
                                    </div>
                                    <div className="pt-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-kaldera text-lg text-plum-dark">
                                                    {item.fullName ? `${item.fullName}'s ${item.category}` : item.category}
                                                </h3>
                                                <p className="text-sm text-plum/60">Size: {item.size}</p>
                                            </div>
                                            <span className={`rounded-full border px-2.5 py-1 text-xs ${
                                                item.status === 'available'
                                                    ? 'border-emerald-600/20 bg-emerald-50/60 text-emerald-700'
                                                    : item.status === 'reserved'
                                                        ? 'border-[#C9A96E]/40 bg-[#C9A96E]/10 text-[#8a6d3f]'
                                                        : 'border-plum-dark/10 bg-plum-dark/5 text-plum/50'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-plum/40">
                                            Added: {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                        {item.status === 'reserved' && (
                                            <div className="mt-3 flex items-center gap-1.5 rounded-full bg-[#C9A96E]/10 px-3 py-1.5 text-xs text-[#8a6d3f]">
                                                <CheckCircle size={12} />
                                                Already reserved by someone
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
