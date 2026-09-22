// components/CollectionsHK.tsx
import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight, X, User, Mail, Phone, Calendar, MapPin, CreditCard, Loader2, Shield, Eye, ShoppingBag, Tag, Search, SlidersHorizontal } from 'lucide-react';
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
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const activeFilterCount = (selectedCategory !== 'all' ? 1 : 0) + (selectedSize !== 'all' ? 1 : 0);

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
    }, [allItems, selectedCategory, selectedSize, searchQuery]);

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
        const query = searchQuery.trim().toLowerCase();
        const filtered = allItems.filter(item => {
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            const matchesSize = selectedSize === 'all' || item.size === selectedSize;
            const matchesSearch = !query ||
                item.fullName?.toLowerCase().includes(query) ||
                item.category?.toLowerCase().includes(query);
            return matchesCategory && matchesSize && matchesSearch;
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

    // RIIDE (buy) items filtered by the same search query
    const filteredRiideItems = riideItems.filter(item => {
        const query = searchQuery.trim().toLowerCase();
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSize = selectedSize === 'all' || item.size === selectedSize;
        const matchesSearch = !query ||
            item.productName.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query);
        return matchesCategory && matchesSize && matchesSearch;
    });

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
                <main className="min-h-screen bg-white pt-28 md:pt-32 pb-8">
                    <div className="container mx-auto px-4 max-w-7xl text-center">
                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-plum-dark/20 border-t-plum-dark"></div>
                        <p className="mt-4 text-sm text-plum/50">Loading HK collection…</p>
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
            <main className="min-h-screen bg-white pt-28 md:pt-32 pb-12">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Payment Processing Overlay */}
                    {(processingPayment || processingBuy) && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-dark/50 backdrop-blur-sm animate-fadeIn">
                            <div className="mx-4 w-full max-w-md transform rounded-[1.75rem] bg-white p-8 animate-scaleIn">
                                <div className="text-center">
                                    <CreditCard className="mx-auto mb-4 h-14 w-14 animate-pulse text-plum-dark" />
                                    <h3 className="mb-3 font-kaldera text-2xl text-plum-dark">Processing payment</h3>
                                    <p className="mb-4 text-plum/60">
                                        You are being redirected to secure payment. Please complete the payment to confirm your order.
                                    </p>
                                    <div className="mb-4 flex items-center justify-center gap-2 text-sm text-plum/40">
                                        <Shield size={16} />
                                        <span>Secure payment by Stripe</span>
                                    </div>
                                    <Loader2 className="mx-auto h-7 w-7 animate-spin text-plum-dark" />
                                    <p className="mt-4 text-sm text-plum/40">
                                        Don't close this window. You'll be redirected back after payment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Error Alert */}
                    {paymentError && (
                        <div className="fixed top-4 right-4 z-50 max-w-md rounded-2xl border border-[#C9614E]/25 bg-white p-4 shadow-lg animate-fadeIn">
                            <div className="flex items-center gap-2 text-[#C9614E]">
                                <X className="h-4 w-4" />
                                <span className="font-medium">Payment error</span>
                            </div>
                            <p className="mt-1 text-sm text-plum/60">{paymentError}</p>
                            <button
                                onClick={() => setPaymentError(null)}
                                className="mt-2 text-sm text-[#C9614E] hover:opacity-70"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {/* Header */}
                    <div className="mb-8 text-center">
                        <span className="text-xs uppercase tracking-label text-plum/40">MUSED 852</span>
                        <h1 className="mt-1 font-kaldera text-4xl text-plum-dark md:text-5xl">
                            HK Collection
                        </h1>
                        <p className="mx-auto mt-3 max-w-2xl text-plum/60">
                            Discover our HK-inspired collection. Rent an outfit or shop RIIDE pieces to keep.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="mx-auto mb-8 flex max-w-md items-center gap-2">
                        <div className="flex flex-1 items-center gap-3 rounded-full border border-plum-dark/10 bg-white px-5 py-3 shadow-sm transition-colors focus-within:border-plum-dark/30">
                            <Search size={17} className="shrink-0 text-plum/40" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or category…"
                                className="w-full bg-transparent text-sm text-plum-dark placeholder-plum/40 focus:outline-none"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="shrink-0 text-plum/40 transition-colors hover:text-plum-dark"
                                    aria-label="Clear search"
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setFiltersOpen(true)}
                            className="relative flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full border border-plum-dark/10 bg-white text-plum-dark shadow-sm transition-colors hover:bg-plum-dark/5"
                            aria-label="Filters"
                        >
                            <SlidersHorizontal size={17} />
                            {activeFilterCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-plum-dark text-[10px] text-cream">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* ✅ Tab switcher */}
                    <div className="mb-8 flex justify-center">
                        <div className="inline-flex items-center gap-1 rounded-full bg-plum-dark/6 p-1">
                            <button
                                onClick={() => setActiveTab('rent')}
                                className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm transition-all ${
                                    activeTab === 'rent'
                                        ? 'bg-white font-medium text-plum-dark shadow-sm'
                                        : 'font-normal text-plum/50 hover:text-plum-dark'
                                }`}
                            >
                                <Calendar size={15} />
                                Rent
                            </button>
                            <button
                                onClick={() => setActiveTab('buy')}
                                className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm transition-all ${
                                    activeTab === 'buy'
                                        ? 'bg-white font-medium text-plum-dark shadow-sm'
                                        : 'font-normal text-plum/50 hover:text-plum-dark'
                                }`}
                            >
                                <ShoppingBag size={15} />
                                Shop RIIDE
                            </button>
                        </div>
                    </div>

                    {/* ─────────────────────────────── RENT TAB ─────────────────────────────── */}
                    {activeTab === 'rent' && (
                        <>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 flex items-center justify-between rounded-2xl border border-[#C9614E]/25 bg-[#C9614E]/8 p-4 text-[#C9614E]">
                                    <span>{error}</span>
                                    <button onClick={() => setError('')} className="text-[#C9614E] hover:opacity-70">
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
                                                className="group cursor-pointer"
                                                onClick={() => setSelectedOutfit(item)}
                                            >
                                                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-plum-dark/5">
                                                    <img
                                                        src={getImageUrl(item, 0)}
                                                        alt={item.fullName}
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                                                        className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-plum-dark backdrop-blur-sm transition-colors hover:bg-white"
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    {/* Pick Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            togglePick(item._id);
                                                        }}
                                                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-plum-dark backdrop-blur-sm transition-colors hover:bg-white"
                                                    >
                                                        <Heart size={16} className={userPicks[item._id] ? 'fill-burgundy text-burgundy' : ''} />
                                                    </button>

                                                    {item.images.length > 1 && (
                                                        <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs text-plum-dark backdrop-blur-sm">
                                                            1/{item.images.length}
                                                        </div>
                                                    )}

                                                    {item.count > 1 && (
                                                        <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-xs text-plum-dark backdrop-blur-sm">
                                                            ×{item.count} available
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="pt-3">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="font-kaldera text-base text-plum-dark">
                                                            {getFirstName(item.fullName)}'s {item.category}
                                                        </h3>
                                                        <span className="shrink-0 text-xs text-plum/50">Size {item.size}</span>
                                                    </div>

                                                    {userPicks[item._id] && (
                                                        <span className="mt-1 flex items-center gap-1 text-xs text-burgundy">
                                                            <Heart size={11} className="fill-burgundy" />
                                                            Picked
                                                        </span>
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
                                                className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                                                    currentPage === 1 ? 'text-plum-dark/20' : 'text-plum-dark hover:bg-plum-dark/5'
                                                }`}
                                            >
                                                <ChevronLeft size={20} />
                                            </button>

                                            <div className="flex items-center gap-1.5">
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
                                                            className={`h-9 w-9 rounded-full text-sm transition-colors ${
                                                                currentPage === pageNum ? 'bg-plum-dark text-cream' : 'text-plum-dark hover:bg-plum-dark/5'
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
                                                className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                                                    currentPage === totalPages ? 'text-plum-dark/20' : 'text-plum-dark hover:bg-plum-dark/5'
                                                }`}
                                            >
                                                <ChevronRight size={20} />
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
                            <div className="mb-8 text-center">
                                <p className="mx-auto max-w-xl text-plum/60">
                                    This item is a collaboration with RIIDE. Buy it and get your free ticket to MUSED — pick your size and we'll hand-deliver it, or collect it in store.
                                </p>
                            </div>

                            {filteredRiideItems.length === 0 ? (
                                <div className="py-16 text-center text-plum/50">
                                    <p>No RIIDE items match your search.</p>
                                </div>
                            ) : (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
                                {filteredRiideItems.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="group cursor-pointer"
                                        onClick={() => setSelectedBuyItem(item)}
                                    >
                                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-plum-dark/5">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.productName}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://via.placeholder.com/400x400?text=RIIDE';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <ShoppingBag size={40} className="text-plum-dark/20" />
                                                </div>
                                            )}

                                            {/* Preview (Eye) Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (item.image) setSelectedImage(item.image);
                                                }}
                                                className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-plum-dark backdrop-blur-sm transition-colors hover:bg-white"
                                            >
                                                <Eye size={16} />
                                            </button>

                                            {/* Heart (Pick) Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    togglePick(item.dbId);
                                                }}
                                                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-plum-dark backdrop-blur-sm transition-colors hover:bg-white"
                                            >
                                                <Heart size={16} className={userPicks[item.dbId] ? 'fill-burgundy text-burgundy' : ''} />
                                            </button>
                                        </div>

                                        <div className="pt-3">
                                            <h3 className="font-kaldera text-sm leading-tight text-plum-dark">
                                                {item.productName}
                                            </h3>
                                            <div className="mt-1 flex items-center justify-between">
                                                <div className="flex items-center gap-1 text-sm text-plum-dark">
                                                    <Tag size={12} className="text-[#C9A96E]" />
                                                    HKD {item.price.toLocaleString()}
                                                </div>
                                                <span className="text-xs text-plum/50">{item.category} · {item.size}</span>
                                            </div>
                                            {userPicks[item.dbId] && (
                                                <span className="mt-1 flex items-center gap-1 text-xs text-burgundy">
                                                    <Heart size={11} className="fill-burgundy" />
                                                    Picked
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />

            {/* Filters Modal */}
            {filtersOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-md animate-overlayFadeIn sm:items-center sm:p-4"
                    onClick={() => setFiltersOpen(false)}
                >
                    <div
                        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-[1.75rem] bg-white p-6 animate-sheetIn sm:rounded-[1.75rem] sm:p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="font-kaldera text-2xl text-plum-dark">Filters</h3>
                            <button
                                onClick={() => setFiltersOpen(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-plum-dark transition-colors hover:bg-plum-dark/5"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <p className="mb-2 text-xs uppercase tracking-label text-plum/40">Category</p>
                        <div className="mb-6 flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                                        selectedCategory === cat
                                            ? 'border-plum-dark bg-plum-dark text-cream'
                                            : 'border-plum-dark/15 text-plum-dark hover:border-plum-dark/30 hover:bg-plum-dark/5'
                                    }`}
                                >
                                    {cat === 'all' ? 'Everything' : cat}
                                </button>
                            ))}
                        </div>

                        <p className="mb-2 text-xs uppercase tracking-label text-plum/40">Size</p>
                        <div className="mb-8 flex flex-wrap gap-2">
                            {sizes.map(size => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                                        selectedSize === size
                                            ? 'border-plum-dark bg-plum-dark/5 text-plum-dark'
                                            : 'border-plum-dark/15 text-plum/50 hover:border-plum-dark/30'
                                    }`}
                                >
                                    {size === 'all' ? 'All sizes' : size}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setSelectedCategory('all');
                                    setSelectedSize('all');
                                }}
                                className="flex-1 rounded-full border border-plum-dark/15 py-3 text-sm text-plum-dark transition-colors hover:bg-plum-dark/5"
                            >
                                Clear all
                            </button>
                            <button
                                onClick={() => setFiltersOpen(false)}
                                className="flex-1 rounded-full bg-plum-dark py-3 text-sm text-cream transition-colors hover:bg-plum-dark/90"
                            >
                                Show results
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-plum-dark/90 p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl max-h-full">
                        <img
                            src={selectedImage}
                            alt="Preview"
                            className="max-w-full max-h-[90vh] object-contain rounded-2xl"
                            onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/800x800?text=Image+Not+Found';
                            }}
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(null);
                            }}
                            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-plum-dark transition-colors hover:bg-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* RENT — Reservation Modal */}
            {selectedOutfit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-dark/50 p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="max-h-[90vh] w-full max-w-2xl transform overflow-y-auto rounded-[1.75rem] bg-white animate-scaleIn">
                        <div className="sticky top-0 z-10">
                            <img
                                src={getImageUrl(selectedOutfit, 0)}
                                alt={selectedOutfit.fullName}
                                className="h-64 w-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                                }}
                            />
                            <button
                                onClick={() => setSelectedOutfit(null)}
                                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-plum-dark backdrop-blur-sm transition-colors hover:bg-white"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-8">
                            <h2 className="mb-2 font-kaldera text-3xl text-plum-dark">
                                {selectedOutfit.fullName.split(' ')[0]}'s {selectedOutfit.category}
                            </h2>
                            <p className="mb-6 text-plum/50">Size: {selectedOutfit.size}</p>

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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-dark/50 p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="max-h-[90vh] w-full max-w-lg transform overflow-y-auto rounded-[1.75rem] bg-white animate-scaleIn">
                        <div className="sticky top-0 z-10">
                            {selectedBuyItem.image ? (
                                <img
                                    src={selectedBuyItem.image}
                                    alt={selectedBuyItem.productName}
                                    className="h-52 w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-52 w-full items-center justify-center bg-plum-dark/5">
                                    <ShoppingBag size={56} className="text-plum-dark/20" />
                                </div>
                            )}
                            <button
                                onClick={() => setSelectedBuyItem(null)}
                                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-plum-dark backdrop-blur-sm transition-colors hover:bg-white"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-8">
                            <h2 className="mb-1 font-kaldera text-2xl text-plum-dark">{selectedBuyItem.productName}</h2>
                            <p className="mb-1 text-sm text-plum/50">{selectedBuyItem.category} · Size {selectedBuyItem.size}</p>
                            <p className="mb-6 font-kaldera text-2xl text-plum-dark">HKD {selectedBuyItem.price.toLocaleString()}</p>

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

                @keyframes overlayFadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }

                @keyframes sheetIn {
                    from { opacity: 0; transform: translateY(24px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }

                .animate-overlayFadeIn { animation: overlayFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-sheetIn       { animation: sheetIn 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
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

    const inputClasses = "w-full rounded-2xl border border-plum-dark/15 bg-white px-4 py-3 text-plum-dark placeholder-plum/30 transition-colors focus:border-plum-dark/40 focus:outline-none focus:ring-2 focus:ring-plum-dark/10";
    const labelClasses = "mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-label text-plum/40";

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <h3 className="font-kaldera text-2xl text-plum-dark">Reserve this item</h3>
                <div className="mt-2 h-px w-9 bg-[#C9A96E]" />
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-plum-dark/5 p-4">
                <CreditCard className="mt-0.5 shrink-0 text-plum-dark" size={20} />
                <div>
                    <p className="text-sm font-medium text-plum-dark">Payment required</p>
                    <p className="mt-0.5 text-sm text-plum/60">
                        After submitting this form, you'll be redirected to secure payment to complete your reservation.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className={labelClasses}>
                        <User size={13} />
                        Full Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={inputClasses}
                        placeholder="Enter your full name"
                    />
                </div>
                <div>
                    <label className={labelClasses}>
                        <Mail size={13} />
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={inputClasses}
                        placeholder="Enter your email"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className={labelClasses}>
                        <Phone size={13} />
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className={inputClasses}
                        placeholder="Enter your phone number"
                    />
                </div>

                {/* Delivery Day — hidden for MUSED Accessories (picked up at dinner) */}
                {!isMusedAccessory && (
                    <div>
                        <label className={labelClasses}>
                            <Calendar size={13} />
                            Delivery Day & Time
                        </label>
                        <select
                            name="deliveryDay"
                            value={formData.deliveryDay}
                            onChange={handleChange}
                            required
                            className={inputClasses}
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
                <div>
                    <label className={labelClasses}>
                        <Calendar size={13} />
                        Pick-up Day & Time
                    </label>
                    <select
                        name="returnDay"
                        value={formData.returnDay}
                        onChange={handleChange}
                        required
                        className={inputClasses}
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
                <div>
                    <label className={labelClasses}>Delivery Method</label>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 rounded-2xl border border-plum-dark/15 px-4 py-3 text-sm text-plum-dark">
                            <input
                                type="radio"
                                name="deliveryMethod"
                                value="without"
                                checked={formData.deliveryMethod === 'without'}
                                onChange={handleChange}
                                className="accent-[#3D1028]"
                                required
                            />
                            I don't need to be there
                        </label>
                        <label className="flex items-center gap-3 rounded-2xl border border-plum-dark/15 px-4 py-3 text-sm text-plum-dark">
                            <input
                                type="radio"
                                name="deliveryMethod"
                                value="in-person"
                                checked={formData.deliveryMethod === 'in-person'}
                                onChange={handleChange}
                                className="accent-[#3D1028]"
                                required
                            />
                            I need to be there
                        </label>
                    </div>
                </div>
            )}

            {/* Delivery Address — hidden for MUSED Accessories */}
            {!isMusedAccessory && (
                <div>
                    <label className={labelClasses}>
                        <MapPin size={13} />
                        Delivery Address
                    </label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        rows={3}
                        className={inputClasses}
                        placeholder="Enter your complete delivery address"
                    />
                </div>
            )}

            {/* Special Instructions — hidden for MUSED Accessories */}
            {!isMusedAccessory && (
                <div>
                    <label className={labelClasses}>Special Instructions</label>
                    <textarea
                        name="instructions"
                        value={formData.instructions}
                        onChange={handleChange}
                        rows={2}
                        className={inputClasses}
                        placeholder="Any special requests, styling preferences, or instructions..."
                    />
                </div>
            )}

            {/* Dinner pickup info banner — shown only for MUSED Accessories */}
            {isMusedAccessory && (
                <div className="flex items-start gap-3 rounded-2xl bg-plum-dark/5 p-4">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-plum-dark" />
                    <div>
                        <p className="text-sm font-medium text-plum-dark">Pickup at the dinner</p>
                        <p className="mt-0.5 text-sm text-plum/60">
                            This accessory will be available for you to collect at the MUSED dinner event. No delivery needed!
                        </p>
                    </div>
                </div>
            )}

            {/* Terms and Conditions */}
            <label className="flex items-start gap-3 rounded-2xl border border-plum-dark/15 p-4 text-sm text-plum-dark">
                <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    required
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#3D1028]"
                />
                <span>
                    I agree to the{' '}
                    <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-burgundy underline underline-offset-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Terms & Conditions
                    </a>{' '}
                    and agree to treat the borrowed item with care and cover any repair or replacement costs for damage beyond normal wear.
                </span>
            </label>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting || processing}
                    className="flex-1 rounded-full border border-plum-dark/15 py-3.5 text-sm text-plum-dark transition-colors hover:bg-plum-dark/5 disabled:opacity-50"
                >
                    Cancel
                </button>
                <div className="flex-1 rounded-full shadow-[0_8px_16px_rgba(61,16,40,0.18)]">
                    <button
                        type="submit"
                        disabled={!formData.agreeToTerms || submitting || processing}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-gradient-to-b from-plum-dark to-plum py-3.5 text-sm font-normal text-cream transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting || processing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {processing ? 'Redirecting to payment…' : 'Processing…'}
                            </>
                        ) : (
                            <>
                                <CreditCard className="h-4 w-4" />
                                Proceed to payment
                            </>
                        )}
                    </button>
                </div>
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

    const inputClasses = "w-full rounded-2xl border border-plum-dark/15 bg-white px-4 py-3 text-plum-dark placeholder-plum/30 transition-colors focus:border-plum-dark/40 focus:outline-none focus:ring-2 focus:ring-plum-dark/10";
    const labelClasses = "mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-label text-plum/40";

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <h3 className="font-kaldera text-2xl text-plum-dark">Complete your purchase</h3>
                <div className="mt-2 h-px w-9 bg-[#C9A96E]" />
            </div>

            {/* No-return banner */}
            <div className="flex items-center gap-3 rounded-2xl bg-plum-dark/5 p-4">
                <ShoppingBag className="shrink-0 text-plum-dark" size={20} />
                <div>
                    <p className="text-sm font-medium text-plum-dark">One-time purchase — yours to keep</p>
                    <p className="text-sm text-plum/60">No return required. You'll be redirected to secure payment.</p>
                </div>
            </div>

            {/* Name */}
            <div>
                <label className={labelClasses}>
                    <User size={13} />
                    Full Name
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                    placeholder="Enter your full name"
                />
            </div>

            {/* Email */}
            <div>
                <label className={labelClasses}>
                    <Mail size={13} />
                    Email
                </label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                    placeholder="Enter your email"
                />
            </div>

            {/* Phone */}
            <div>
                <label className={labelClasses}>
                    <Phone size={13} />
                    Phone Number
                </label>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                    placeholder="Enter your phone number"
                />
            </div>

            {/* ── Fulfillment method ── */}
            <div>
                <label className={labelClasses}>How would you like to receive your item?</label>
                <div className="grid grid-cols-2 gap-3">
                    {/* Delivery option */}
                    <label
                        className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border p-4 transition-colors ${
                            formData.fulfillmentMethod === 'delivery'
                                ? 'border-plum-dark bg-plum-dark/5'
                                : 'border-plum-dark/15 hover:border-plum-dark/30'
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
                        <Calendar size={20} className={formData.fulfillmentMethod === 'delivery' ? 'text-plum-dark' : 'text-plum/40'} />
                        <span className="text-center text-sm text-plum-dark">Home Delivery</span>
                        <span className="text-center text-xs text-plum/50">We bring it to you</span>
                    </label>

                    {/* Store pick-up option */}
                    <label
                        className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border p-4 transition-colors ${
                            formData.fulfillmentMethod === 'store'
                                ? 'border-plum-dark bg-plum-dark/5'
                                : 'border-plum-dark/15 hover:border-plum-dark/30'
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
                        <MapPin size={20} className={formData.fulfillmentMethod === 'store' ? 'text-plum-dark' : 'text-plum/40'} />
                        <span className="text-center text-sm text-plum-dark">Pick Up in Store</span>
                        <span className="text-center text-xs text-plum/50">Collect at RIIDE</span>
                    </label>
                </div>
            </div>

            {/* Delivery slot — shown only when delivery is selected */}
            {formData.fulfillmentMethod === 'delivery' && (
                <>
                    <div>
                        <label className={labelClasses}>
                            <Calendar size={13} />
                            Delivery Time Slot
                        </label>
                        <select
                            name="deliveryDay"
                            value={formData.deliveryDay}
                            onChange={handleChange}
                            required
                            className={inputClasses}
                        >
                            <option value="">Select a delivery slot</option>
                            {deliveryDays.map((day, i) => (
                                <option key={i} value={day.value}>{day.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClasses}>
                            <MapPin size={13} />
                            Delivery Address
                        </label>
                        <textarea
                            name="deliveryAddress"
                            value={formData.deliveryAddress}
                            onChange={handleChange}
                            required
                            rows={3}
                            className={inputClasses}
                            placeholder="Enter your complete delivery address"
                        />
                    </div>
                </>
            )}

            {/* Store info — shown only when store pick-up is selected */}
            {formData.fulfillmentMethod === 'store' && (
                <div className="flex items-start gap-3 rounded-2xl bg-plum-dark/5 p-4">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-plum-dark" />
                    <div>
                        <p className="text-sm font-medium text-plum-dark">RIIDE Store</p>
                        <p className="mt-0.5 text-sm text-plum/60">24-26 Aberdeen St, Hong Kong</p>
                        <p className="mt-1 text-xs text-plum/50">Open daily: 9am – 6pm</p>
                        <p className="mt-2 text-xs text-plum/50">
                            Please bring your order confirmation when you come to collect.
                        </p>
                    </div>
                </div>
            )}

            {/* Terms */}
            <label className="flex items-start gap-3 rounded-2xl border border-plum-dark/15 p-4 text-sm text-plum-dark">
                <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    required
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#3D1028]"
                />
                <span>
                    I agree to the{' '}
                    <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-burgundy underline underline-offset-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Terms & Conditions
                    </a>
                    . This purchase is final — no returns or exchanges.
                </span>
            </label>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting || processing}
                    className="flex-1 rounded-full border border-plum-dark/15 py-3.5 text-sm text-plum-dark transition-colors hover:bg-plum-dark/5 disabled:opacity-50"
                >
                    Cancel
                </button>
                <div className="flex-1 rounded-full shadow-[0_8px_16px_rgba(61,16,40,0.18)]">
                    <button
                        type="submit"
                        disabled={!formData.agreeToTerms || !formData.fulfillmentMethod || submitting || processing}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-gradient-to-b from-plum-dark to-plum py-3.5 text-sm font-normal text-cream transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting || processing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Redirecting…
                            </>
                        ) : (
                            <>
                                <CreditCard className="h-4 w-4" />
                                Pay HKD {item.price.toLocaleString()}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}