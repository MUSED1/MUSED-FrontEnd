// components/MyUploads.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { Header } from './Header';
import { BackLink } from './BackLink';
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
    aiProcessed?: boolean;
    university?: string;
}

export function MyUploads() {
    const [items, setItems] = useState<ClothingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchItems = async () => {
            try {
                const token = localStorage.getItem('token');
                const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

                const response = await axios.get(
                    `${API_URL}/clothing/my-items`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setItems(response.data.data);
            } catch (error) {
                console.error('Error fetching items:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="font-inter">
            <Header />
            <main className="min-h-screen bg-white pt-28 md:pt-32 pb-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    <BackLink className="mb-4" />

                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-kaldera text-plum-dark">My Uploads</h1>
                        <div className="rounded-full shadow-[0_8px_16px_rgba(61,16,40,0.18)]">
                            <button
                                onClick={() => navigate('/upload')}
                                className="flex items-center gap-2 rounded-full border border-white/15 bg-gradient-to-b from-plum-dark to-plum px-5 py-2.5 text-sm font-normal text-cream transition-all hover:brightness-110 active:scale-[0.98]"
                            >
                                <Package size={15} />
                                Upload New
                            </button>
                        </div>
                    </div>
                    <div className="mb-8 h-px w-9 bg-[#C9A96E]" />

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-plum-dark/20 border-t-plum-dark rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="rounded-[1.75rem] border border-plum-dark/8 bg-white p-12 text-center shadow-[0_8px_24px_rgba(61,16,40,0.06)]">
                            <Package size={40} className="text-plum/20 mx-auto mb-4" />
                            <p className="text-plum/60 mb-6">You haven't uploaded any items yet.</p>
                            <div className="inline-block rounded-full shadow-[0_8px_16px_rgba(61,16,40,0.18)]">
                                <button
                                    onClick={() => navigate('/upload')}
                                    className="rounded-full border border-white/15 bg-gradient-to-b from-plum-dark to-plum px-6 py-3 text-sm font-normal text-cream transition-all hover:brightness-110 active:scale-[0.98]"
                                >
                                    Upload Your First Item
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map((item) => (
                                <div key={item._id} className="group">
                                    <div className="overflow-hidden rounded-2xl">
                                        {item.aiProcessed === false ? (
                                            <div className="h-64 bg-gradient-to-r from-cream via-amber-50 to-cream bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] flex flex-col items-center justify-center gap-2">
                                                <style>{`
                                                    @keyframes shimmer {
                                                        0% { background-position: 200% 0; }
                                                        100% { background-position: -200% 0; }
                                                    }
                                                `}</style>
                                                <div className="w-6 h-6 border-2 border-plum-dark/40 border-t-plum-dark rounded-full animate-spin" />
                                                <p className="text-xs text-plum/50 font-medium">Enhancing with AI…</p>
                                            </div>
                                        ) : (
                                            <div
                                                className="h-64 bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.02]"
                                                style={{ backgroundImage: `url(${item.images[0]})` }}
                                            />
                                        )}
                                    </div>
                                    <div className="pt-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-xl font-kaldera text-plum-dark">{item.category}</h3>
                                                <p className="text-plum/60">Size: {item.size}</p>
                                                {item.university && (
                                                    <p className="text-xs text-plum/40 mt-1">{item.university}</p>
                                                )}
                                            </div>
                                            <span className={`rounded-full border px-3 py-1 text-xs ${
                                                item.status === 'available'
                                                    ? 'border-emerald-600/20 bg-emerald-50/60 text-emerald-700'
                                                    : item.status === 'reserved'
                                                        ? 'border-[#C9A96E]/40 bg-[#C9A96E]/10 text-[#8a6d3f]'
                                                        : 'border-plum-dark/10 bg-plum-dark/5 text-plum/50'
                                            }`}>
                                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-plum/40">
                                            Uploaded: {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
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
