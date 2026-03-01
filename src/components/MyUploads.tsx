// components/MyUploads.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h1 className="text-4xl font-bold text-plum mb-8">My Uploaded Items</h1>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                            <p className="text-xl text-plum/80 mb-4">You haven't uploaded any items yet.</p>
                            <button
                                onClick={() => navigate('/upload')}
                                className="bg-gradient-to-r from-plum to-gold text-cream px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                            >
                                Upload Your First Item
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map((item) => (
                                <div key={item._id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                    <div
                                        className="h-64 bg-cover bg-center"
                                        style={{ backgroundImage: `url(${item.images[0]})` }}
                                    />
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-plum">{item.category}</h3>
                                                <p className="text-plum/60">Size: {item.size}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                item.status === 'available'
                                                    ? 'bg-green-100 text-green-800'
                                                    : item.status === 'reserved'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-plum/40">
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