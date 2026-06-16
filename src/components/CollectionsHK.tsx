// components/CollectionsHK.tsx
import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight, X, User, Mail, Phone, Calendar, MapPin, CreditCard, Loader2, Shield, Eye, ShoppingBag, Tag } from 'lucide-react';
import axios from 'axios';

interface ClothingItem {
    _id: string;
    images: string[];
    size: string;
    category: string;
    status: 'available' | 'reserved' | 'sold';
    createdAt: string;
    fullName: string;
    // ✅ NEW fields
    listingType?: 'rent' | 'buy';
    productName?: string;
    price?: number;
}

interface GroupedClothingItem extends ClothingItem {
    count: number;
    allIds: string[];
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

// ✅ NEW: Simplified form data for buy items
interface PurchaseFormData {
    name: string;
    email: string;
    phone: string;
    // 'delivery' = home delivery with slot; 'store' = pick up at RIIDE store
    fulfillmentMethod: 'delivery' | 'store' | '';
    deliveryDay: string;      // only when fulfillmentMethod === 'delivery'
    deliveryAddress: string;  // only when fulfillmentMethod === 'delivery'
    agreeToTerms: boolean;
}

// ============================================
// ✅ RIIDE buy-only catalogue
// These items are NOT in the DB fetched from /clothing/admin/all;
// they are a separate hardcoded list that each maps to their own DB _id.
// You must insert these items into MongoDB (listingType: 'buy') and put
// the real _ids here. Prices are in HKD.
// ============================================
const RIIDE_ITEMS: Array<{
    productName: string;
    price: number;
    category: string;
    size: string;
    image: string;
    dbId: string;        // ← replace with real MongoDB _id after seeding
}> = [
    { productName: 'RIIDE - White Mandarin Bamboo Collar',  price: 1290, category: 'Tops',   size: 'One Size', image: '', dbId: 'REPLACE_ME_2'  },
    { productName: 'RIIDE - Black Maxi Bamboo Skirt',       price: 990,  category: 'Skirts', size: 'One Size', image: '', dbId: 'REPLACE_ME_3'  },
    { productName: 'RIIDE - Black Mini Bamboo Skirt',       price: 890,  category: 'Skirts', size: 'One Size', image: '', dbId: 'REPLACE_ME_4'  },
    { productName: 'RIIDE - Black Mandarin Bamboo Collar',  price: 990,  category: 'Tops',   size: 'One Size', image: '', dbId: 'REPLACE_ME_5'  },
    { productName: 'RIIDE - Red Mini Bamboo Skirt',         price: 890,  category: 'Skirts', size: 'One Size', image: '', dbId: 'REPLACE_ME_6'  },
    { productName: 'RIIDE - Red Mandarin Bamboo Collar',    price: 990,  category: 'Tops',   size: 'One Size', image: '', dbId: 'REPLACE_ME_7'  },
    { productName: 'RIIDE - White Mini Bamboo Skirt',    price: 980,  category: 'Skirts',   size: 'One Size', image: '', dbId: '6a2b7a7f3dcec0c77519c32a'  },

];

export function CollectionsHK() {
    const { isAuthenticated, loading: authLoading, user } = useAuth();
    const navigate = useNavigate();

    const [allItems, setAllItems] = useState<ClothingItem[]>([]);
    const [groupedFilteredItems, setGroupedFilteredItems] = useState<GroupedClothingItem[]>([]);
    const [userPicks, setUserPicks] = useState<UserPicks>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedOutfit, setSelectedOutfit] = useState<ClothingItem | null>(null);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    // ✅ Runtime RIIDE items — starts as the hardcoded list; dbIds get resolved from the DB on mount.
    const [riideItems, setRiideItems] = useState(RIIDE_ITEMS);

    // ✅ Buy item modal state
    const [selectedBuyItem, setSelectedBuyItem] = useState<typeof RIIDE_ITEMS[0] | null>(null);
    const [processingBuy, setProcessingBuy] = useState(false);

    // Resolve real MongoDB _ids for RIIDE items from the DB so the buy session works.
    // The backend now also supports a productName-based lookup fallback, so this is best-effort.
    useEffect(() => {
        if (!isAuthenticated) return;
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/clothing/admin/all`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { listingType: 'buy', status: 'available', limit: 100 }
        }).then(res => {
            if (!res.data.success) return;
            const dbItems: ClothingItem[] = res.data.data;
            setRiideItems(prev => prev.map(riide => {
                const match = dbItems.find(db =>
                    db.productName?.trim().toLowerCase() === riide.productName.trim().toLowerCase()
                );
                return match
                    ? { ...riide, dbId: match._id, image: riide.image || match.images?.[0] || '' }
                    : riide;
            }));
        }).catch(() => { /* non-fatal — backend productName fallback handles it */ });
    }, [isAuthenticated]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedSize, setSelectedSize] = useState<string>('all');

    // ✅ NEW: Active tab — 'rent' | 'buy'
    const [activeTab, setActiveTab] = useState<'rent' | 'buy'>('rent');

    const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

    const categories = [
        'all', 'Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories',
        'Shoes', 'Bags', 'Jewelry', 'Skirts', 'Vests', 'Others'
    ];

    const sizes = [
        'all', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXS',
        '32', '34', '36', '38', '40', '42', 'One Size'
    ];

    // Delivery options — June 16 & 17
    const deliveryDays = [
        { value: 'Tuesday-jun16-8-11',  label: 'Tuesday Jun 16th: 8am–11am' },
        { value: 'Tuesday-jun16-12-14', label: 'Tuesday Jun 16th: 12pm–2pm' },
        { value: 'Tuesday-jun16-14-17', label: 'Tuesday Jun 16th: 2pm–5pm' },
        { value: 'Tuesday-jun16-17-19', label: 'Tuesday Jun 16th: 5pm–7pm' },
        { value: 'Wednesday-jun17-8-11',  label: 'Wednesday Jun 17th: 8am–11am' },
        { value: 'Wednesday-jun17-12-14', label: 'Wednesday Jun 17th: 12pm–2pm' },
        { value: 'Wednesday-jun17-14-17', label: 'Wednesday Jun 17th: 2pm–5pm' },
        { value: 'Wednesday-jun17-17-19', label: 'Wednesday Jun 17th: 5pm–7pm' },
    ];

    // Pick-up (return) options — June 19 & 20
    const returnDays = [
        { value: 'friday-jun19-8-11',  label: 'Friday Jun 19th: 8am–11am' },
        { value: 'friday-jun19-12-14', label: 'Friday Jun 19th: 12pm–2pm' },
        { value: 'friday-jun19-14-17', label: 'Friday Jun 19th: 2pm–5pm' },
        { value: 'friday-jun19-17-19', label: 'Friday Jun 19th: 5pm–7pm' },
        { value: 'saturday-jun20-8-11',  label: 'Saturday Jun 20th: 8am–11am' },
        { value: 'saturday-jun20-12-14', label: 'Saturday Jun 20th: 12pm–2pm' },
        { value: 'saturday-jun20-14-17', label: 'Saturday Jun 20th: 2pm–5pm' },
        { value: 'saturday-jun20-17-19', label: 'Saturday Jun 20th: 5pm–7pm' },
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

            if (paymentSuccess === 'true' && sessionId) {
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

            const allFetched: ClothingItem[] = [];
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const response = await axios.get(`${API_URL}/clothing/admin/all`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        status: 'available',
                        from: '2026-06-03',
                        to: '2026-06-11',
                        page,
                        limit: 50
                    }
                });

                if (response.data.success) {
                    allFetched.push(...response.data.data);
                    hasMore = response.data.pagination?.hasNextPage ?? false;
                    page++;
                } else {
                    hasMore = false;
                }
            }

            // ✅ Only keep rent items in the main list (buy items live in their own tab).
            // Also exclude any item whose fullName starts with "RIIDE" regardless of listingType
            // (guards against items that were submitted with listingType unset).
            setAllItems(allFetched.filter(item =>
                item.listingType !== 'buy' &&
                !item.fullName?.trim().toUpperCase().startsWith('RIIDE')
            ));
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
        const filtered = allItems.filter(item => {
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            const matchesSize = selectedSize === 'all' || item.size === selectedSize;
            return matchesCategory && matchesSize;
        });

        const musedItems = filtered.filter(item => item.fullName.trim().toUpperCase() === 'MUSED');
        const otherItems = filtered.filter(item => item.fullName.trim().toUpperCase() !== 'MUSED');

        const musedGroupMap = new Map<string, GroupedClothingItem>();
        musedItems.forEach(item => {
            const key = `${item.category}-${item.size}`.toLowerCase();
            if (musedGroupMap.has(key)) {
                const existing = musedGroupMap.get(key)!;
                existing.count += 1;
                existing.allIds.push(item._id);
            } else {
                musedGroupMap.set(key, { ...item, count: 1, allIds: [item._id] });
            }
        });

        const grouped: GroupedClothingItem[] = [
            ...Array.from(musedGroupMap.values()),
            ...otherItems.map(item => ({ ...item, count: 1, allIds: [item._id] })),
        ];
        setGroupedFilteredItems(grouped);
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
                setUserPicks(prev => ({ ...prev, [itemId]: true }));
            }
        } catch (err) {
            console.error('Error toggling pick:', err);
            setError('Failed to update picks. Please try again.');
        }
    };

    // Handle rent reservation with payment flow
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

    // Process rent payment via Stripe
    const processPayment = async (formData: ReservationFormData, outfit: ClothingItem) => {
        setProcessingPayment(true);

        try {
            const sessionId = `reservation_${outfit._id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const reservationSession = {
                sessionId,
                formData: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    instructions: formData.instructions,
                    deliveryDay: formData.deliveryDay,
                    deliveryTime: formData.deliveryTime,
                    returnDay: formData.returnDay,
                    returnTime: formData.returnTime,
                    deliveryMethod: formData.deliveryMethod,
                    agreeToTerms: formData.agreeToTerms
                },
                outfit: {
                    id: outfit._id,
                    _id: outfit._id,
                    name: outfit.fullName,
                    category: outfit.category,
                    size: outfit.size,
                    images: outfit.images
                },
                timestamp: new Date().toISOString()
            };

            try {
                localStorage.setItem('pendingReservation', JSON.stringify(reservationSession));
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                console.warn('LocalStorage unavailable, proceeding without storage');
            }

            const parseDay = (raw: string) => {
                if (!raw) return { day: '', time: '' };
                const parts = raw.split('-');
                if (parts.length >= 3) {
                    return { day: parts[0], time: `${parts[1]}-${parts[2]} pm` };
                }
                return { day: raw, time: '' };
            };
            const delivery = parseDay(formData.deliveryDay);
            const ret = parseDay(formData.returnDay);

            const reservationData = {
                fullName: formData.name,
                email: formData.email,
                phoneNumber: formData.phone,
                pickupMethod: formData.deliveryMethod || 'without',
                pickupDay: delivery.day,
                pickupTime: delivery.time || formData.deliveryTime || '',
                pickupInstructions: formData.instructions || '',
                specialInstructions: formData.instructions || '',
                returnDay: ret.day,
                returnTime: ret.time || formData.returnTime || '',
            };

            const response = await axios.post(`${API_URL}/create-checkout-session`, {
                itemId: outfit._id,
                itemName: `${outfit.fullName.split(' ')[0]}'s ${outfit.category}`,
                amount: 290,
                customerEmail: formData.email,
                sessionId: sessionId,
                reservationData
            });

            if (response.data.success && response.data.url) {
                window.location.href = response.data.url;
            } else {
                throw new Error('Failed to create checkout session');
            }

        } catch (err) {
            console.error('Payment processing error:', err);
            setProcessingPayment(false);
            throw new Error(err instanceof Error ? err.message : 'Failed to process payment');
        }
    };

    // ✅ NEW: Process buy payment via Stripe
    const processBuyPayment = async (purchaseData: PurchaseFormData, item: typeof RIIDE_ITEMS[0]) => {
        setProcessingBuy(true);
        try {
            const response = await axios.post(`${API_URL}/create-buy-session`, {
                itemId: item.dbId,
                productName: item.productName,
                priceHKD: item.price,
                customerEmail: purchaseData.email,
                customerName: purchaseData.name,
                customerPhone: purchaseData.phone,
                size: item.size,
                fulfillmentMethod: purchaseData.fulfillmentMethod,
                deliveryDay: purchaseData.fulfillmentMethod === 'delivery' ? purchaseData.deliveryDay : null,
                deliveryAddress: purchaseData.fulfillmentMethod === 'delivery' ? purchaseData.deliveryAddress : '24-26 Aberdeen St, Hong Kong',
            });

            if (response.data.success && response.data.url) {
                window.location.href = response.data.url;
            } else {
                throw new Error('Failed to create purchase session');
            }
        } catch (err) {
            console.error('Buy payment error:', err);
            setProcessingBuy(false);
            throw new Error(err instanceof Error ? err.message : 'Failed to process payment');
        }
    };

    const getImageUrl = (item: ClothingItem, index: number = 0): string => {
        if (item.images && item.images.length > index && item.images[index]) {
            return item.images[index];
        }
        return `${API_URL}/clothing/image/${item._id}/${index}`;
    };

    const getFirstName = (fullName: string) => fullName?.split(' ')[0] || fullName;

    // Pagination — rent tab only
    const totalPages = Math.ceil(groupedFilteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = groupedFilteredItems.slice(startIndex, endIndex);

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
                            <p className="text-plum">Loading HK collection...</p>
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
                    {(processingPayment || processingBuy) && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 transform animate-scaleIn">
                                <div className="text-center">
                                    <CreditCard className="w-16 h-16 text-plum mx-auto mb-4 animate-pulse" />
                                    <h3 className="text-2xl font-bold text-plum mb-4">Processing Payment</h3>
                                    <p className="text-gray-600 mb-4">
                                        You are being redirected to secure payment. Please complete the payment to confirm your order.
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
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-kaldera text-plum mb-4">
                            HK Collection
                        </h1>
                        <p className="text-lg text-plum/80 max-w-2xl mx-auto">
                            Discover our HK-inspired collection. Rent an outfit or shop RIIDE pieces to keep.
                        </p>
                    </div>

                    {/* ✅ Tab switcher */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white rounded-2xl shadow-md p-1.5 flex gap-1.5">
                            <button
                                onClick={() => setActiveTab('rent')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                                    activeTab === 'rent'
                                        ? 'bg-gradient-to-r from-plum to-rose text-cream shadow-lg'
                                        : 'text-plum hover:bg-cream'
                                }`}
                            >
                                <Calendar size={16} />
                                Rent
                            </button>
                            <button
                                onClick={() => setActiveTab('buy')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                                    activeTab === 'buy'
                                        ? 'bg-gradient-to-r from-plum to-rose text-cream shadow-lg'
                                        : 'text-plum hover:bg-cream'
                                }`}
                            >
                                <ShoppingBag size={16} />
                                Shop RIIDE
                            </button>
                        </div>
                    </div>

                    {/* ─────────────────────────────── RENT TAB ─────────────────────────────── */}
                    {activeTab === 'rent' && (
                        <>
                            {/* Filters */}
                            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="filter-container">
                                        <label className="filter-label">Category</label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="filter-select"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>
                                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="filter-container">
                                        <label className="filter-label">Size</label>
                                        <select
                                            value={selectedSize}
                                            onChange={(e) => setSelectedSize(e.target.value)}
                                            className="filter-select"
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
                                    <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            {groupedFilteredItems.length === 0 ? (
                                <div className="text-center py-16 text-plum/60">
                                    <p className="text-xl">No rental items found.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {currentItems.map((item) => (
                                            <div
                                                key={item._id}
                                                className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                                onClick={() => setSelectedOutfit(item)}
                                            >
                                                <div className="relative">
                                                    <img
                                                        src={getImageUrl(item, 0)}
                                                        alt={item.fullName}
                                                        className="w-full h-64 object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                                                        }}
                                                    />

                                                    {/* Preview Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedImage(getImageUrl(item, 0));
                                                        }}
                                                        className="absolute top-3 left-3 p-3 rounded-full bg-white/90 text-plum hover:bg-white transition-all transform hover:scale-110"
                                                    >
                                                        <Eye size={20} />
                                                    </button>

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

                                                    {item.images.length > 1 && (
                                                        <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                                            1/{item.images.length}
                                                        </div>
                                                    )}

                                                    {item.count > 1 && (
                                                        <div className="absolute bottom-3 right-3 bg-plum text-white text-xs font-semibold px-2 py-1 rounded-full">
                                                            ×{item.count} available
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-semibold text-plum">
                                                            {getFirstName(item.fullName)}'s {item.category}
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
                                                    currentPage === 1 ? 'text-plum/20 cursor-not-allowed' : 'text-plum hover:bg-cream'
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
                                                                currentPage === pageNum ? 'bg-rose text-white' : 'hover:bg-cream text-plum'
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
                                                    currentPage === totalPages ? 'text-plum/20 cursor-not-allowed' : 'text-plum hover:bg-cream'
                                                }`}
                                            >
                                                <ChevronRight size={24} />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {/* ─────────────────────────────── BUY TAB (RIIDE) ─────────────────────────────── */}
                    {activeTab === 'buy' && (
                        <div>
                            <div className="text-center mb-8">
                                <p className="text-plum/70 max-w-xl mx-auto">
                                    This item is collaboration with RIIDE. Buy it & get your FREE ticket to MUSED. You can specify size (XS - S - M - L - XL) & We will hand deliver it to you. Or come to the store & Pick it your self xx
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {riideItems.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                        onClick={() => setSelectedBuyItem(item)}
                                    >
                                        <div className="relative">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.productName}
                                                    className="w-full h-64 object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://via.placeholder.com/400x400?text=RIIDE';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-64 bg-gradient-to-br from-cream to-amber-100 flex items-center justify-center">
                                                    <ShoppingBag size={48} className="text-plum/30" />
                                                </div>
                                            )}

                                            {/* Preview (Eye) Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (item.image) setSelectedImage(item.image);
                                                }}
                                                className="absolute top-3 left-3 p-3 rounded-full bg-white/90 text-plum hover:bg-white transition-all transform hover:scale-110"
                                            >
                                                <Eye size={20} />
                                            </button>

                                            {/* Heart (Pick) Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    togglePick(item.dbId);
                                                }}
                                                className={`absolute top-3 right-3 p-3 rounded-full transition-all transform hover:scale-110 ${
                                                    userPicks[item.dbId]
                                                        ? 'bg-rose text-white shadow-lg'
                                                        : 'bg-white/90 text-plum hover:bg-white'
                                                }`}
                                            >
                                                <Heart size={20} className={userPicks[item.dbId] ? 'fill-white' : ''} />
                                            </button>
                                        </div>

                                        <div className="p-4">
                                            <h3 className="font-semibold text-plum text-sm leading-tight mb-1">
                                                {item.productName}
                                            </h3>
                                            <div className="flex items-center justify-between mt-1">
                                                <div className="flex items-center gap-1 text-plum font-bold text-sm">
                                                    <Tag size={12} className="text-rose" />
                                                    HKD {item.price.toLocaleString()}
                                                </div>
                                                <span className="text-xs text-plum/60">{item.category} · {item.size}</span>
                                            </div>
                                            {userPicks[item.dbId] && (
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
                        </div>
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

            {/* RENT — Reservation Modal */}
            {selectedOutfit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform animate-scaleIn">
                        <div className="relative">
                            <img
                                src={getImageUrl(selectedOutfit, 0)}
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
                                {selectedOutfit.fullName.split(' ')[0]}'s {selectedOutfit.category}
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

            {/* ✅ BUY — Purchase Modal */}
            {selectedBuyItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform animate-scaleIn">
                        <div className="relative">
                            {selectedBuyItem.image ? (
                                <img
                                    src={selectedBuyItem.image}
                                    alt={selectedBuyItem.productName}
                                    className="w-full h-52 object-cover"
                                />
                            ) : (
                                <div className="w-full h-52 bg-gradient-to-br from-cream to-amber-100 flex items-center justify-center">
                                    <ShoppingBag size={64} className="text-plum/30" />
                                </div>
                            )}
                            <button
                                onClick={() => setSelectedBuyItem(null)}
                                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 hover:rotate-90 shadow-lg"
                            >
                                <X size={24} className="text-plum" />
                            </button>
                        </div>

                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-plum mb-1">{selectedBuyItem.productName}</h2>
                            <p className="text-gray-500 text-sm mb-1">{selectedBuyItem.category} · Size {selectedBuyItem.size}</p>
                            <p className="text-2xl font-bold text-rose mb-6">HKD {selectedBuyItem.price.toLocaleString()}</p>

                            <PurchaseForm
                                item={selectedBuyItem}
                                user={user}
                                onClose={() => setSelectedBuyItem(null)}
                                onSubmit={processBuyPayment}
                                processing={processingBuy}
                                deliveryDays={deliveryDays}
                            />
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }

                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to   { opacity: 1; transform: scale(1); }
                }

                .animate-fadeIn  { animation: fadeIn  0.3s ease-out; }
                .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
            `}</style>
        </div>
    );
}

// ─── Rent Reservation Form ───────────────────────────────────────────────────
function ReservationForm({
                             outfit, user, onClose, onSubmit, processing, deliveryDays, returnDays
                         }: {
    outfit: ClothingItem;
    user: any;
    onClose: () => void;
    onSubmit: (formData: ReservationFormData, outfit: ClothingItem) => void;
    processing: boolean;
    deliveryDays: { value: string; label: string }[];
    returnDays: { value: string; label: string }[];
}) {
    // MUSED Accessories are picked up at the dinner — no logistics fields needed
    const isMusedAccessory =
        outfit.fullName.trim().toUpperCase() === 'MUSED' &&
        outfit.category === 'Accessories';

    const [formData, setFormData] = useState<ReservationFormData>({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        // Pre-fill fixed values for MUSED Accessories so the backend never sees empty required fields
        address: isMusedAccessory ? 'Pickup at MUSED Dinner' : '',
        instructions: isMusedAccessory ? 'Pickup at the dinner event' : '',
        deliveryDay: isMusedAccessory ? 'dinner-pickup' : '',
        deliveryTime: isMusedAccessory ? 'at-dinner' : '',
        returnDay: isMusedAccessory ? 'dinner-pickup' : '',
        returnTime: isMusedAccessory ? 'at-dinner' : '',
        deliveryMethod: isMusedAccessory ? 'in-person' : '',
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

                {/* Delivery Day — hidden for MUSED Accessories (picked up at dinner) */}
                {!isMusedAccessory && (
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
                                <option key={index} value={day.value}>{day.label}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Pick-up Day — hidden for MUSED Accessories */}
            {!isMusedAccessory && (
                <div className="transform transition-all duration-300 hover:scale-105">
                    <label className="block text-sm font-semibold text-plum mb-2 flex items-center">
                        <Calendar size={16} className="mr-2 text-rose" />
                        Pick-up Day & Time *
                    </label>
                    <select
                        name="returnDay"
                        value={formData.returnDay}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose focus:border-rose text-plum transition-all duration-300"
                    >
                        <option value="">Select pick-up day & time</option>
                        {returnDays.map((day, index) => (
                            <option key={index} value={day.value}>{day.label}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Delivery Method — hidden for MUSED Accessories */}
            {!isMusedAccessory && (
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
            )}

            {/* Delivery Address — hidden for MUSED Accessories */}
            {!isMusedAccessory && (
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
            )}

            {/* Special Instructions — hidden for MUSED Accessories */}
            {!isMusedAccessory && (
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
            )}

            {/* Dinner pickup info banner — shown only for MUSED Accessories */}
            {isMusedAccessory && (
                <div className="bg-gradient-to-br from-plum/5 to-rose/5 p-4 rounded-xl border-2 border-plum/20">
                    <div className="flex items-start gap-3">
                        <MapPin size={20} className="text-rose flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-plum font-semibold text-sm">Pickup at the Dinner</p>
                            <p className="text-plum/80 text-sm mt-0.5">
                                This accessory will be available for you to collect at the MUSED dinner event. No delivery needed!
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Terms and Conditions */}
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
                        I agree to the{' '}
                        <a
                            href="/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-rose hover:text-burgundy underline underline-offset-2 transition-colors duration-200 font-semibold"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Terms & Conditions
                        </a>{' '}
                        and agree to treat the borrowed item with care and cover any repair or replacement costs for damage beyond normal wear.
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

// ─── ✅ Buy Purchase Form — with delivery or store pick-up ────────────────────
function PurchaseForm({
                          item, user, onClose, onSubmit, processing, deliveryDays
                      }: {
    item: typeof RIIDE_ITEMS[0];
    user: any;
    onClose: () => void;
    onSubmit: (data: PurchaseFormData, item: typeof RIIDE_ITEMS[0]) => void;
    processing: boolean;
    deliveryDays: { value: string; label: string }[];
}) {
    const [formData, setFormData] = useState<PurchaseFormData>({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        fulfillmentMethod: '',
        deliveryDay: '',
        deliveryAddress: '',
        agreeToTerms: false
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.agreeToTerms) {
            alert('Please agree to the terms and conditions');
            return;
        }
        if (!formData.fulfillmentMethod) {
            alert('Please choose delivery or store pick-up');
            return;
        }
        if (formData.fulfillmentMethod === 'delivery' && !formData.deliveryDay) {
            alert('Please select a delivery time slot');
            return;
        }
        if (formData.fulfillmentMethod === 'delivery' && !formData.deliveryAddress.trim()) {
            alert('Please enter your delivery address');
            return;
        }
        setSubmitting(true);
        try {
            await onSubmit(formData, item);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            alert(`Purchase failed: ${errorMessage}`);
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-xl font-bold text-plum">Complete Your Purchase</h3>

            {/* No-return banner */}
            <div className="bg-gradient-to-br from-amber-100 to-amber-50 p-4 rounded-xl border-2 border-amber-300">
                <div className="flex items-center space-x-3">
                    <ShoppingBag className="text-plum flex-shrink-0" size={22} />
                    <div>
                        <p className="text-plum font-semibold text-sm">One-time purchase — yours to keep!</p>
                        <p className="text-plum text-xs">No return required. You'll be redirected to secure payment.</p>
                    </div>
                </div>
            </div>

            {/* Name */}
            <div>
                <label className="block text-sm font-semibold text-plum mb-2 flex items-center">
                    <User size={14} className="mr-2 text-rose" />
                    Full Name *
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose focus:border-rose text-plum"
                    placeholder="Enter your full name"
                />
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-semibold text-plum mb-2 flex items-center">
                    <Mail size={14} className="mr-2 text-rose" />
                    Email *
                </label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose focus:border-rose text-plum"
                    placeholder="Enter your email"
                />
            </div>

            {/* Phone */}
            <div>
                <label className="block text-sm font-semibold text-plum mb-2 flex items-center">
                    <Phone size={14} className="mr-2 text-rose" />
                    Phone Number *
                </label>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose focus:border-rose text-plum"
                    placeholder="Enter your phone number"
                />
            </div>

            {/* ── Fulfillment method ── */}
            <div>
                <label className="block text-sm font-semibold text-plum mb-3">
                    How would you like to receive your item? *
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {/* Delivery option */}
                    <label
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            formData.fulfillmentMethod === 'delivery'
                                ? 'border-rose bg-rose/5 shadow-md'
                                : 'border-gray-200 hover:border-rose/40'
                        }`}
                    >
                        <input
                            type="radio"
                            name="fulfillmentMethod"
                            value="delivery"
                            checked={formData.fulfillmentMethod === 'delivery'}
                            onChange={handleChange}
                            className="sr-only"
                        />
                        <Calendar size={24} className={formData.fulfillmentMethod === 'delivery' ? 'text-rose' : 'text-plum/50'} />
                        <span className="text-sm font-semibold text-plum text-center">Home Delivery</span>
                        <span className="text-xs text-plum/60 text-center">We bring it to you</span>
                    </label>

                    {/* Store pick-up option */}
                    <label
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            formData.fulfillmentMethod === 'store'
                                ? 'border-rose bg-rose/5 shadow-md'
                                : 'border-gray-200 hover:border-rose/40'
                        }`}
                    >
                        <input
                            type="radio"
                            name="fulfillmentMethod"
                            value="store"
                            checked={formData.fulfillmentMethod === 'store'}
                            onChange={handleChange}
                            className="sr-only"
                        />
                        <MapPin size={24} className={formData.fulfillmentMethod === 'store' ? 'text-rose' : 'text-plum/50'} />
                        <span className="text-sm font-semibold text-plum text-center">Pick Up in Store</span>
                        <span className="text-xs text-plum/60 text-center">Collect at RIIDE</span>
                    </label>
                </div>
            </div>

            {/* Delivery slot — shown only when delivery is selected */}
            {formData.fulfillmentMethod === 'delivery' && (
                <>
                    <div>
                        <label className="block text-sm font-semibold text-plum mb-2 flex items-center">
                            <Calendar size={14} className="mr-2 text-rose" />
                            Delivery Time Slot *
                        </label>
                        <select
                            name="deliveryDay"
                            value={formData.deliveryDay}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose focus:border-rose text-plum"
                        >
                            <option value="">Select a delivery slot</option>
                            {deliveryDays.map((day, i) => (
                                <option key={i} value={day.value}>{day.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-plum mb-2 flex items-center">
                            <MapPin size={14} className="mr-2 text-rose" />
                            Delivery Address *
                        </label>
                        <textarea
                            name="deliveryAddress"
                            value={formData.deliveryAddress}
                            onChange={handleChange}
                            required
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose focus:border-rose text-plum"
                            placeholder="Enter your complete delivery address"
                        />
                    </div>
                </>
            )}

            {/* Store info — shown only when store pick-up is selected */}
            {formData.fulfillmentMethod === 'store' && (
                <div className="bg-gradient-to-br from-plum/5 to-rose/5 p-4 rounded-xl border-2 border-plum/20">
                    <div className="flex items-start gap-3">
                        <MapPin size={20} className="text-rose flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-plum font-semibold text-sm">RIIDE Store</p>
                            <p className="text-plum text-sm mt-0.5">24-26 Aberdeen St, Hong Kong</p>
                            <p className="text-plum/70 text-xs mt-1">Open daily: 9am – 6pm</p>
                            <p className="text-plum/60 text-xs mt-2">
                                Please bring your order confirmation when you come to collect.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Terms */}
            <div className="bg-gradient-to-br from-cream to-amber-50 p-4 rounded-xl border-2 border-amber-200">
                <div className="flex items-start space-x-3">
                    <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        required
                        className="mt-1 w-5 h-5 text-rose focus:ring-rose border-gray-300 rounded"
                    />
                    <label className="text-sm text-plum font-medium">
                        I agree to the{' '}
                        <a
                            href="/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-rose hover:text-burgundy underline underline-offset-2 font-semibold"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Terms & Conditions
                        </a>
                        . This purchase is final — no returns or exchanges.
                    </label>
                </div>
            </div>

            <div className="flex space-x-4">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting || processing}
                    className="flex-1 bg-cream text-plum py-3.5 rounded-xl font-semibold hover:bg-amber-200 transition-all disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!formData.agreeToTerms || !formData.fulfillmentMethod || submitting || processing}
                    className="flex-1 bg-gradient-to-r from-plum to-rose text-cream py-3.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                >
                    {submitting || processing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Redirecting...
                        </>
                    ) : (
                        <>
                            <CreditCard className="w-5 h-5" />
                            Pay HKD {item.price.toLocaleString()}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}