// components/CollectionsM.tsx
import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight, X, User, Mail, Phone, Calendar, MapPin, CreditCard, Loader2, Shield } from 'lucide-react';
import axios from 'axios';

interface ClothingItem {
    _id: string;
    images: string[];
    size: string;
    category: string;
    status: 'available' | 'reserved' | 'sold';
    createdAt: string;
    fullName: string;
}

interface UserPicks {
    [itemId: string]: boolean;
}

interface ReservationFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    instructions: string;
    deliveryDay: string;
    deliveryTime: string;
    returnDay: string;
    returnTime: string;
    deliveryMethod: string;
    agreeToTerms: boolean;
}

// Stripe configuration
const STRIPE_PAYMENT_URL = 'https://buy.stripe.com/dRm3cw5z59sH1vedS4ew802';

export function CollectionsM() {
    const { isAuthenticated, loading: authLoading, user } = useAuth();
    const navigate = useNavigate();

    const [allItems, setAllItems] = useState<ClothingItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);
    const [userPicks, setUserPicks] = useState<UserPicks>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedOutfit, setSelectedOutfit] = useState<ClothingItem | null>(null);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

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

    // Delivery options
    const deliveryDays = [
        { value: 'sunday-4-6', label: 'Sunday 15th: 4-6 pm' },
        { value: 'sunday-6-8', label: 'Sunday 15th: 6-8 pm' },
        { value: 'monday-12-2', label: 'Monday 16th: 12-2 pm' },
        { value: 'monday-2-4', label: 'Monday 16th: 2-4 pm' },
        { value: 'monday-4-6', label: 'Monday 16th: 4-6 pm' },
        { value: 'tuesday-12-2', label: 'Tuesday 17th: 12-2 pm' },
        { value: 'tuesday-2-4', label: 'Tuesday 17th: 2-4 pm' },
        { value: 'tuesday-4-6', label: 'Tuesday 17th: 4-6 pm' },
        { value: 'wednesday-12-2', label: 'Wednesday 18th: 12-2 pm' },
        { value: 'wednesday-2-4', label: 'Wednesday 18th: 2-4 pm' },
        { value: 'wednesday-4-6', label: 'Wednesday 18th: 4-6 pm' },
        { value: 'other', label: 'Other (choose date before March 19th)' }
    ];

    // Return options - updated with new dates
    const returnDays = [
        { value: 'friday-12-2', label: 'Friday 20th: 12-2 pm' },
        { value: 'friday-2-4', label: 'Friday 20th: 2-4 pm' },
        { value: 'friday-4-6', label: 'Friday 20th: 4-6 pm' },
        { value: 'saturday-12-2', label: 'Saturday 21st: 12-2 pm' },
        { value: 'saturday-2-4', label: 'Saturday 21st: 2-4 pm' },
        { value: 'saturday-4-6', label: 'Saturday 21st: 4-6 pm' },
        { value: 'monday-12-2', label: 'Monday 22nd: 12-2 pm' },
        { value: 'monday-2-4', label: 'Monday 22nd: 2-4 pm' },
        { value: 'monday-4-6', label: 'Monday 22nd: 4-6 pm' },
        { value: 'tuesday-12-2', label: 'Tuesday 23rd: 12-2 pm' },
        { value: 'tuesday-2-4', label: 'Tuesday 23rd: 2-4 pm' },
        { value: 'tuesday-4-6', label: 'Tuesday 23rd: 4-6 pm' },
        { value: 'other', label: 'Other (arrange separately)' }
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

    // Check for successful payment return
    useEffect(() => {
        const checkPaymentStatus = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const paymentSuccess = urlParams.get('payment_success');
            const sessionId = urlParams.get('session_id');

            if (paymentSuccess === 'true' || sessionId) {
                window.location.href = '/confirmation';
            }
        };

        checkPaymentStatus();
    }, []);

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
                await axios.delete(`${API_URL}/users/picks/${itemId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const newPicks = { ...userPicks };
                delete newPicks[itemId];
                setUserPicks(newPicks);
            } else {
                await axios.post(`${API_URL}/users/picks/${itemId}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

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

    // Handle reservation with payment flow
    const handleReservation = async (formData: ReservationFormData, outfit: ClothingItem) => {
        try {
            setPaymentError(null);
            await processPayment(formData, outfit);
        } catch (error) {
            console.error('Reservation error:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            setPaymentError(`Failed to process reservation: ${errorMessage}`);
            setProcessingPayment(false);
        }
    };

    // Process payment via Stripe
    const processPayment = async (formData: ReservationFormData, outfit: ClothingItem) => {
        setProcessingPayment(true);

        try {
            const sessionId = `reservation_${outfit._id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const reservationSession = {
                sessionId,
                formData,
                outfit,
                timestamp: new Date().toISOString()
            };

            try {
                localStorage.setItem('pendingReservation', JSON.stringify(reservationSession));
            } catch {
                console.warn('LocalStorage unavailable, proceeding without storage');
            }

            const successParams = new URLSearchParams({
                payment_success: 'true',
                session_id: sessionId,
                item_id: outfit._id
            }).toString();

            const paymentUrl = `${STRIPE_PAYMENT_URL}?${successParams}&client_reference_id=${sessionId}&prefilled_email=${encodeURIComponent(formData.email)}`;

            const newWindow = window.open(paymentUrl, '_blank');

            if (!newWindow) {
                window.location.href = paymentUrl;
            } else {
                const checkInterval = setInterval(() => {
                    if (newWindow.closed) {
                        clearInterval(checkInterval);
                        window.location.href = '/confirmation';
                    }
                }, 2000);
            }

        } catch (err) {
            console.error('Payment processing error:', err);
            setProcessingPayment(false);
            throw new Error('Failed to process payment');
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
                    {/* Payment Processing Overlay */}
                    {processingPayment && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 transform animate-scaleIn">
                                <div className="text-center">
                                    <CreditCard className="w-16 h-16 text-plum mx-auto mb-4 animate-pulse" />
                                    <h3 className="text-2xl font-bold text-plum mb-4">Processing Payment</h3>
                                    <p className="text-gray-600 mb-4">
                                        You are being redirected to secure payment. Please complete the payment to reserve your item.
                                    </p>
                                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
                                        <Shield size={16} />
                                        <span>Secure payment by Stripe</span>
                                    </div>
                                    <Loader2 className="w-8 h-8 text-rose animate-spin mx-auto" />
                                    <p className="text-sm text-gray-500 mt-4">
                                        Don't close this window. You'll be redirected back after payment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Error Alert */}
                    {paymentError && (
                        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl z-50 animate-fadeIn max-w-md">
                            <div className="flex items-center space-x-2">
                                <X className="w-5 h-5" />
                                <span className="font-semibold">Payment Error</span>
                            </div>
                            <p className="text-sm mt-1">{paymentError}</p>
                            <button
                                onClick={() => setPaymentError(null)}
                                className="text-red-600 hover:text-red-800 text-sm mt-2 font-medium"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-kaldera text-plum mb-4">
                            Dinner Collection Number 3
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
                                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                                        onClick={() => setSelectedOutfit(item)}
                                    >
                                        <div className="relative aspect-square overflow-hidden">
                                            <img
                                                src={getImageUrl(item._id, 0)}
                                                alt={`${item.fullName}'s ${item.category}`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                                                }}
                                            />

                                            {/* Pick Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    togglePick(item._id);
                                                }}
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
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-plum">
                                                    {item.fullName}'s {item.category}
                                                </h3>
                                                <span className="text-sm text-plum/60">Size {item.size}</span>
                                            </div>

                                            {userPicks[item._id] && (
                                                <div className="mt-2">
                                                    <span className="text-xs text-rose flex items-center gap-1">
                                                        <Heart size={12} className="fill-rose" />
                                                        Picked
                                                    </span>
                                                </div>
                                            )}
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

            {/* Reservation Modal */}
            {selectedOutfit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform animate-scaleIn">
                        <div className="relative">
                            <img
                                src={getImageUrl(selectedOutfit._id, 0)}
                                alt={selectedOutfit.fullName}
                                className="w-full h-64 object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                                }}
                            />
                            <button
                                onClick={() => setSelectedOutfit(null)}
                                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 hover:rotate-90 shadow-lg"
                            >
                                <X size={24} className="text-plum" />
                            </button>
                        </div>

                        <div className="p-8">
                            <h2 className="text-3xl font-bold text-plum mb-3">
                                {selectedOutfit.fullName}'s {selectedOutfit.category}
                            </h2>
                            <p className="text-gray-600 text-lg mb-6">Size: {selectedOutfit.size}</p>

                            <ReservationForm
                                outfit={selectedOutfit}
                                user={user}
                                onClose={() => setSelectedOutfit(null)}
                                onSubmit={handleReservation}
                                processing={processingPayment}
                                deliveryDays={deliveryDays}
                                returnDays={returnDays}
                            />
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }

                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}

// Reservation Form Component
function ReservationForm({
                             outfit,
                             user,
                             onClose,
                             onSubmit,
                             processing,
                             deliveryDays,
                             returnDays
                         }: {
    outfit: ClothingItem;
    user: any;
    onClose: () => void;
    onSubmit: (formData: ReservationFormData, outfit: ClothingItem) => void;
    processing: boolean;
    deliveryDays: { value: string; label: string; }[];
    returnDays: { value: string; label: string; }[];
}) {
    const [formData, setFormData] = useState<ReservationFormData>({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: '',
        instructions: '',
        deliveryDay: '',
        deliveryTime: '',
        returnDay: '',
        returnTime: '',
        deliveryMethod: '',
        agreeToTerms: false
    });

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.agreeToTerms) {
            alert('Please agree to the terms and conditions');
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit(formData, outfit);
        } catch (error) {
            console.error('Reservation failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            alert(`Reservation failed: ${errorMessage}`);
            setSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-2xl font-bold text-plum mb-2">Reserve This Item</h3>

            <div className="bg-gradient-to-br from-amber-100 to-amber-50 p-4 rounded-xl border-2 border-amber-300">
                <div className="flex items-center space-x-3">
                    <CreditCard className="text-plum flex-shrink-0" size={24} />
                    <div>
                        <p className="text-plum font-semibold">Payment Required</p>
                        <p className="text-plum text-sm">
                            After submitting this form, you'll be redirected to secure payment to complete your reservation.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="transform transition-all duration-300 hover:scale-105">
                    <label className="block text-sm font-semibold text-plum mb-2 flex items-center">
                        <User size={16} className="mr-2 text-rose" />
                        Full Name *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose focus:border-rose text-plum transition-all duration-300"
                        placeholder="Enter your full name"
                    />
                </div>
                <div className="transform transition-all duration-300 hover:scale-105">
                    <label className="block text-sm font-semibold text-plum mb-2 flex items-center">
                        <Mail size={16} className="mr-2 text-rose" />
                        Email *
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose focus:border-rose text-plum transition-all duration-300"
                        placeholder="Enter your email"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="transform transition-all duration-300 hover:scale-105">
                    <label className="block text-sm font-semibold text-plum mb-2 flex items-center">
                        <Phone size={16} className="mr-2 text-rose" />
                        Phone Number *
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose focus:border-rose text-plum transition-all duration-300"
                        placeholder="Enter your phone number"
                    />
                </div>
                <div className="transform transition-all duration-300 hover:scale-105">
                    <label className="block text-sm font-semibold text-plum mb-2 flex items-center">
                        <Calendar size={16} className="mr-2 text-rose" />
                        Delivery Day & Time *
                    </label>
                    <select
                        name="deliveryDay"
                        value={formData.deliveryDay}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose focus:border-rose text-plum transition-all duration-300"
                    >
                        <option value="">Select delivery day & time</option>
                        {deliveryDays.map((day, index) => (
                            <option key={index} value={day.value}>
                                {day.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Return Day */}
            <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-semibold text-plum mb-2 flex items-center">
                    <Calendar size={16} className="mr-2 text-rose" />
                    Return/Pickup Day & Time *
                </label>
                <select
                    name="returnDay"
                    value={formData.returnDay}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose focus:border-rose text-plum transition-all duration-300"
                >
                    <option value="">Select return day & time</option>
                    {returnDays.map((day, index) => (
                        <option key={index} value={day.value}>
                            {day.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Delivery Method */}
            <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-semibold text-plum mb-2">
                    Delivery Method *
                </label>
                <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                        <input
                            type="radio"
                            name="deliveryMethod"
                            value="without"
                            checked={formData.deliveryMethod === 'without'}
                            onChange={handleChange}
                            className="text-rose focus:ring-rose"
                            required
                        />
                        <span className="text-plum">I don't need to be there</span>
                    </label>
                    <label className="flex items-center space-x-3">
                        <input
                            type="radio"
                            name="deliveryMethod"
                            value="in-person"
                            checked={formData.deliveryMethod === 'in-person'}
                            onChange={handleChange}
                            className="text-rose focus:ring-rose"
                            required
                        />
                        <span className="text-plum">I need to be there</span>
                    </label>
                </div>
            </div>

            <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-semibold text-plum mb-2 flex items-center">
                    <MapPin size={16} className="mr-2 text-rose" />
                    Delivery Address *
                </label>
                <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose focus:border-rose text-plum transition-all duration-300"
                    placeholder="Enter your complete delivery address"
                />
            </div>

            <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-semibold text-plum mb-2">Special Instructions</label>
                <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose focus:border-rose text-plum transition-all duration-300"
                    placeholder="Any special requests, styling preferences, or instructions..."
                />
            </div>

            <div className="bg-gradient-to-br from-cream to-amber-50 p-6 rounded-xl border-2 border-amber-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className="flex items-start space-x-4">
                    <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        required
                        className="mt-1 w-5 h-5 text-rose focus:ring-rose border-gray-300 rounded transition-all duration-300"
                    />
                    <label className="text-sm text-plum font-medium">
                        I agree to treat the borrowed item with care and cover any repair or replacement costs for damage beyond normal wear.
                    </label>
                </div>
            </div>

            <div className="flex space-x-4">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting || processing}
                    className="flex-1 bg-cream text-plum py-4 rounded-xl font-semibold hover:bg-amber-200 hover:text-plum transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!formData.agreeToTerms || submitting || processing}
                    className="flex-1 bg-gradient-to-r from-plum to-rose text-cream py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                >
                    {submitting || processing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            {processing ? 'Redirecting to Payment...' : 'Processing...'}
                        </>
                    ) : (
                        <>
                            <CreditCard className="w-5 h-5 mr-2" />
                            Proceed to Payment
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}