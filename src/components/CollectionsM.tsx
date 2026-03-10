// components/CollectionsM.tsx
import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight, X } from 'lucide-react';
import axios from 'axios';

interface ClothingItem {
    _id: string;
    images: string[];
    size: string;
    category: string;
    status: 'available' | 'reserved' | 'sold';
    createdAt: string;
    fullName: string; // Added fullName field
}

interface UserPicks {
    [itemId: string]: boolean;
}

export function CollectionsM() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [allItems, setAllItems] = useState<ClothingItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);
    const [userPicks, setUserPicks] = useState<UserPicks>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedSize, setSelectedSize] = useState<string>('all');

    // API URL
    const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

    const categories = [
        'all', 'Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories',
        'Shoes', 'Bags', 'Jewelry', 'Skirts', 'Vests', 'Others'
    ];

    const sizes = [
        'all', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXS',
        '32', '34', '36', '38', '40', '42', 'One Size'
    ];

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchClothingItems();
            fetchUserPicks();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        filterItems();
    }, [allItems, selectedCategory, selectedSize]);

    const fetchClothingItems = async () => {
        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('token');

            const response = await axios.get(`${API_URL}/clothing/admin/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setAllItems(response.data.data);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Error fetching items');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserPicks = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await axios.get(`${API_URL}/users/picks`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const picksMap: UserPicks = {};
                response.data.data.forEach((item: ClothingItem) => {
                    picksMap[item._id] = true;
                });
                setUserPicks(picksMap);
            }
        } catch (err) {
            console.error('Error fetching user picks:', err);
        }
    };

    const filterItems = () => {
        const startDate2026 = new Date('2026-01-01T00:00:00.000Z');
        const filtered = allItems.filter(item => {
            const itemDate = new Date(item.createdAt);
            const isFrom2026 = itemDate >= startDate2026;
            const isAvailable = item.status === 'available';

            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            const matchesSize = selectedSize === 'all' || item.size === selectedSize;

            return isFrom2026 && isAvailable && matchesCategory && matchesSize;
        });

        setFilteredItems(filtered);
        setCurrentPage(1);
    };

    const togglePick = async (itemId: string) => {
        try {
            const token = localStorage.getItem('token');
            const isPicked = userPicks[itemId];

            if (isPicked) {
                // Remove from picks
                await axios.delete(`${API_URL}/users/picks/${itemId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Update local state
                const newPicks = { ...userPicks };
                delete newPicks[itemId];
                setUserPicks(newPicks);
            } else {
                // Add to picks
                await axios.post(`${API_URL}/users/picks/${itemId}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Update local state
                setUserPicks(prev => ({
                    ...prev,
                    [itemId]: true
                }));
            }
        } catch (err) {
            console.error('Error toggling pick:', err);
            setError('Failed to update picks. Please try again.');
        }
    };

    // Helper function to get image URL through proxy
    const getImageUrl = (itemId: string, index: number) => {
        return `${API_URL}/clothing/image/${itemId}/${index}`;
    };

    // Pagination
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredItems.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleReserve = (itemId: string) => {
        // Navigate to reservation page or open reservation modal
        // You can implement this based on your requirements
        console.log('Reserve item:', itemId);
        // navigate(`/reserve/${itemId}`);
    };

    if (authLoading || loading) {
        return (
            <div className="font-sans">
                <Header />
                <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-8">
                    <div className="container mx-auto px-4 max-w-7xl text-center">
                        <div className="bg-white rounded-2xl shadow-lg p-12">
                            <div className="w-16 h-16 border-4 border-rose border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-plum">Loading collection...</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-12">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-kaldera text-plum mb-4">
                            Dinner Collection No. 3
                        </h1>
                        <p className="text-lg text-plum/80 max-w-2xl mx-auto">
                            Let yourself be mused. Choose your item and receive it at your door.
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-plum/60 mb-2">Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full p-3 border border-cream rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-plum/60 mb-2">Size</label>
                                <select
                                    value={selectedSize}
                                    onChange={(e) => setSelectedSize(e.target.value)}
                                    className="w-full p-3 border border-cream rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50"
                                >
                                    {sizes.map(size => (
                                        <option key={size} value={size}>
                                            {size === 'all' ? 'All Sizes' : size}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-xl border border-red-300 flex justify-between items-center">
                            <span>{error}</span>
                            <button
                                onClick={() => setError('')}
                                className="ml-4 underline hover:no-underline"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {/* Items Grid */}
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                            <Heart size={64} className="text-plum/20 mx-auto mb-4" />
                            <p className="text-plum text-lg mb-2">No items found</p>
                            <p className="text-plum/60">Try adjusting your filters or check back later for new items.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {currentItems.map((item) => (
                                    <div
                                        key={item._id}
                                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all group"
                                    >
                                        <div className="relative aspect-square overflow-hidden">
                                            <img
                                                src={getImageUrl(item._id, 0)}
                                                alt={`${item.fullName}'s ${item.category}`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                                                onClick={() => setSelectedImage(getImageUrl(item._id, 0))}
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                                                }}
                                            />

                                            {/* Pick Button */}
                                            <button
                                                onClick={() => togglePick(item._id)}
                                                className={`absolute top-3 right-3 p-3 rounded-full transition-all transform hover:scale-110 ${
                                                    userPicks[item._id]
                                                        ? 'bg-rose text-white shadow-lg'
                                                        : 'bg-white/90 text-plum hover:bg-white'
                                                }`}
                                            >
                                                <Heart size={20} className={userPicks[item._id] ? 'fill-white' : ''} />
                                            </button>

                                            {/* Image indicator if multiple images */}
                                            {item.images.length > 1 && (
                                                <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                                    1/{item.images.length}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="font-semibold text-plum">
                                                    {item.fullName}'s {item.category}
                                                </h3>
                                                <span className="text-sm text-plum/60">Size {item.size}</span>
                                            </div>

                                            <button
                                                onClick={() => handleReserve(item._id)}
                                                className="w-full bg-rose text-white py-2 px-4 rounded-lg hover:bg-rose/90 transition-colors font-medium"
                                            >
                                                Reserve It
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 mt-12">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`p-2 rounded-lg transition-colors ${
                                            currentPage === 1
                                                ? 'text-plum/20 cursor-not-allowed'
                                                : 'text-plum hover:bg-cream'
                                        }`}
                                    >
                                        <ChevronLeft size={24} />
                                    </button>

                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => goToPage(pageNum)}
                                                    className={`w-10 h-10 rounded-lg transition-colors ${
                                                        currentPage === pageNum
                                                            ? 'bg-rose text-white'
                                                            : 'hover:bg-cream text-plum'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`p-2 rounded-lg transition-colors ${
                                            currentPage === totalPages
                                                ? 'text-plum/20 cursor-not-allowed'
                                                : 'text-plum hover:bg-cream'
                                        }`}
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />

            {/* Image Preview Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl max-h-full">
                        <img
                            src={selectedImage}
                            alt="Preview"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/800x800?text=Image+Not+Found';
                            }}
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(null);
                            }}
                            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}