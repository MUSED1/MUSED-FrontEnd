// components/BrandsShop.tsx
//
// Public "Shop" screen — browse buy-to-keep items from ALL approved brands,
// with filters for Category, Brand, and Size. Modeled directly on the "Shop
// RIIDE" (buy) tab inside CollectionsHK.tsx: same card layout, image preview
// modal, wishlist heart, and purchase flow — but generalized from one
// hardcoded catalogue to every brand's live listings, with a Brand filter
// added alongside Category and Size.
//
// Data source: GET /api/clothing/admin/all
//   ?listingType=buy&status=available&approvalStatus=approved
// (paginated; looped until hasNextPage is false — same pattern CollectionsHK
// uses). The `brand` field on each item (set by the seller from the brand
// dashboard) drives the Brand filter dropdown, built dynamically from
// whichever brands currently have live stock so it's never stale or empty.
//
// Purchase flow: posts to /api/create-buy-session, same endpoint the RIIDE
// items in CollectionsHK use, generalized to send each item's own
// price/currency instead of a hardcoded HKD amount. If that endpoint on
// your backend still assumes HKD only, it will need a small update to also
// accept `currency` — check routes/stripe.js.
//
// Note: the old CollectionsHK "store pick-up" option pointed at one fixed
// address (the single RIIDE store). That doesn't generalize across brands
// with different fulfillment locations, so this screen only offers home
// delivery. If brands later get their own pickup address on the Brand
// model, a per-brand pick-up option can be added back here.

import { useState, useEffect, useMemo } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
    Heart, X, Eye, ShoppingBag, Tag, Store, User, Mail, Phone,
    Calendar, MapPin, CreditCard, Loader2, Shield, ChevronLeft, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { API_CONFIG, getImageUrl as buildImageUrl } from '../utils/api';

type Currency = 'HKD' | 'USD' | 'GBP' | 'EUR';

interface ShopItem {
    _id: string;
    images: string[];
    productName?: string;
    brand?: string;
    category: string;
    size: string;
    status: 'available' | 'reserved' | 'sold';
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    listingType?: 'rent' | 'buy';
    price?: number | null;
    resalePrice?: number | null;
    currency?: Currency;
    stock?: number;
}

interface UserPicks {
    [itemId: string]: boolean;
}

interface PurchaseFormData {
    name: string;
    email: string;
    phone: string;
    deliveryDate: string;
    deliveryAddress: string;
    notes: string;
    agreeToTerms: boolean;
}

const CURRENCY_SYMBOL: Record<Currency, string> = { HKD: 'HK$', USD: '$', GBP: '£', EUR: '€' };

const CATEGORIES = [
    'all', 'Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories',
    'Shoes', 'Bags', 'Jewelry', 'Skirts', 'Vests', 'Others'
];

const SIZES = [
    'all', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL',
    '0', '2', '4', '6', '8', '10', '12', '14', '16',
    '32', '34', '36', '38', '40', '42', '44', '46', 'One Size'
];

// Price shown/charged for a listing — 'buy' items store their sale price on
// resalePrice, with `price` kept only as a legacy fallback (see BrandDashboard.tsx).
function getItemPrice(item: ShopItem): number {
    return item.resalePrice ?? item.price ?? 0;
}

function getItemImage(item: ShopItem, index: number = 0): string {
    if (item.images && item.images.length > index && item.images[index]) {
        return item.images[index];
    }
    return buildImageUrl(item._id, index);
}

export function BrandsShop() {
    const { isAuthenticated, loading: authLoading, user } = useAuth();
    const navigate = useNavigate();

    const [allItems, setAllItems] = useState<ShopItem[]>([]);
    const [userPicks, setUserPicks] = useState<UserPicks>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
    const [processingBuy, setProcessingBuy] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedBrand, setSelectedBrand] = useState<string>('all');
    const [selectedSize, setSelectedSize] = useState<string>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const API_URL = API_CONFIG.baseURL;

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchShopItems();
            fetchUserPicks();
        }
    }, [isAuthenticated]);

    const fetchShopItems = async () => {
        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('token');
            const allFetched: ShopItem[] = [];
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const response = await axios.get(`${API_URL}/clothing/admin/all`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        listingType: 'buy',
                        status: 'available',
                        approvalStatus: 'approved',
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

            setAllItems(allFetched.filter(item => (item.stock ?? 1) > 0));
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
                response.data.data.forEach((item: { _id: string }) => {
                    picksMap[item._id] = true;
                });
                setUserPicks(picksMap);
            }
        } catch (err) {
            console.error('Error fetching user picks:', err);
        }
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

    // ✅ Brand filter options, built from whatever brands currently have
    // live stock — never shows a brand with nothing to sell.
    const brands = useMemo(() => {
        const names = new Set<string>();
        allItems.forEach(item => {
            const name = item.brand?.trim();
            if (name) names.add(name);
        });
        return Array.from(names).sort((a, b) => a.localeCompare(b));
    }, [allItems]);

    const filteredItems = useMemo(() => {
        return allItems.filter(item => {
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            const matchesSize = selectedSize === 'all' || item.size === selectedSize;
            const matchesBrand = selectedBrand === 'all' || (item.brand?.trim() === selectedBrand);
            return matchesCategory && matchesSize && matchesBrand;
        });
    }, [allItems, selectedCategory, selectedSize, selectedBrand]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, selectedSize, selectedBrand]);

    const processBuyPayment = async (purchaseData: PurchaseFormData, item: ShopItem) => {
        setProcessingBuy(true);
        try {
            const currency = item.currency || 'HKD';
            const response = await axios.post(`${API_URL}/create-buy-session`, {
                itemId: item._id,
                productName: item.productName || item.category,
                price: getItemPrice(item),
                currency,
                brand: item.brand || '',
                customerEmail: purchaseData.email,
                customerName: purchaseData.name,
                customerPhone: purchaseData.phone,
                size: item.size,
                fulfillmentMethod: 'delivery',
                deliveryDay: purchaseData.deliveryDate,
                deliveryAddress: purchaseData.deliveryAddress,
                notes: purchaseData.notes
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

    // Pagination
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

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
                            <p className="text-plum">Loading shop...</p>
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
                    {processingBuy && (
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
                            Shop
                        </h1>
                        <p className="text-lg text-plum/80 max-w-2xl mx-auto">
                            Discover pieces from all our brands, yours to keep.
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="filter-container">
                                <label className="filter-label">Brand</label>
                                <select
                                    value={selectedBrand}
                                    onChange={(e) => setSelectedBrand(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">All Brands</option>
                                    {brands.map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-container">
                                <label className="filter-label">Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="filter-select"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>
                                            {cat === 'all' ? 'All Categories' : cat}
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
                                    {SIZES.map(size => (
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
                            <button onClick={() => setError('')} className="text-red-600 hover:text-red-900">
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    {/* Empty state */}
                    {!error && filteredItems.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                            <ShoppingBag size={48} className="text-plum/30 mx-auto mb-4" />
                            <p className="text-plum/70">No items match these filters yet. Try a different brand, category, or size.</p>
                        </div>
                    )}

                    {/* Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {currentItems.map((item) => {
                            const image = getItemImage(item, 0);
                            const price = getItemPrice(item);
                            const currency = item.currency || 'HKD';
                            return (
                                <div
                                    key={item._id}
                                    className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <div className="relative">
                                        {image ? (
                                            <img
                                                src={image}
                                                alt={item.productName || item.category}
                                                className="w-full h-64 object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://via.placeholder.com/400x400?text=No+Image';
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
                                                if (image) setSelectedImage(image);
                                            }}
                                            className="absolute top-3 left-3 p-3 rounded-full bg-white/90 text-plum hover:bg-white transition-all transform hover:scale-110"
                                        >
                                            <Eye size={20} />
                                        </button>

                                        {/* Heart (Pick) Button */}
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
                                    </div>

                                    <div className="p-4">
                                        {item.brand && (
                                            <p className="text-xs uppercase tracking-wide text-rose font-semibold flex items-center gap-1 mb-1">
                                                <Store size={11} />
                                                {item.brand}
                                            </p>
                                        )}
                                        <h3 className="font-semibold text-plum text-sm leading-tight mb-1">
                                            {item.productName || item.category}
                                        </h3>
                                        <div className="flex items-center justify-between mt-1">
                                            <div className="flex items-center gap-1 text-plum font-bold text-sm">
                                                <Tag size={12} className="text-rose" />
                                                {CURRENCY_SYMBOL[currency]} {price.toLocaleString()}
                                            </div>
                                            <span className="text-xs text-plum/60">{item.category} · {item.size}</span>
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
                            );
                        })}
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

            {/* Purchase Modal */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform animate-scaleIn">
                        <div className="relative">
                            {getItemImage(selectedItem, 0) ? (
                                <img
                                    src={getItemImage(selectedItem, 0)}
                                    alt={selectedItem.productName || selectedItem.category}
                                    className="w-full h-52 object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://via.placeholder.com/400x400?text=No+Image';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-52 bg-gradient-to-br from-cream to-amber-100 flex items-center justify-center">
                                    <ShoppingBag size={64} className="text-plum/30" />
                                </div>
                            )}
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 hover:rotate-90 shadow-lg"
                            >
                                <X size={24} className="text-plum" />
                            </button>
                        </div>

                        <div className="p-8">
                            {selectedItem.brand && (
                                <p className="text-xs uppercase tracking-wide text-rose font-semibold flex items-center gap-1 mb-2">
                                    <Store size={12} />
                                    {selectedItem.brand}
                                </p>
                            )}
                            <h2 className="text-2xl font-bold text-plum mb-1">
                                {selectedItem.productName || selectedItem.category}
                            </h2>
                            <p className="text-gray-500 text-sm mb-1">{selectedItem.category} · Size {selectedItem.size}</p>
                            <p className="text-2xl font-bold text-rose mb-6">
                                {CURRENCY_SYMBOL[selectedItem.currency || 'HKD']} {getItemPrice(selectedItem).toLocaleString()}
                            </p>

                            <PurchaseForm
                                item={selectedItem}
                                user={user}
                                onClose={() => setSelectedItem(null)}
                                onSubmit={processBuyPayment}
                                processing={processingBuy}
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

// ─── Purchase Form ────────────────────────────────────────────────────────
function PurchaseForm({
                          item, user, onClose, onSubmit, processing
                      }: {
    item: ShopItem;
    user: any;
    onClose: () => void;
    onSubmit: (data: PurchaseFormData, item: ShopItem) => void;
    processing: boolean;
}) {
    const [formData, setFormData] = useState<PurchaseFormData>({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        deliveryDate: '',
        deliveryAddress: '',
        notes: '',
        agreeToTerms: false
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        if (!formData.deliveryAddress.trim()) {
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

            {/* Delivery date */}
            <div>
                <label className="block text-sm font-semibold text-plum mb-2 flex items-center">
                    <Calendar size={14} className="mr-2 text-rose" />
                    Preferred Delivery Date *
                </label>
                <input
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose focus:border-rose text-plum"
                />
            </div>

            {/* Delivery address */}
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

            {/* Optional notes */}
            <div>
                <label className="block text-sm font-semibold text-plum mb-2">
                    Notes (optional)
                </label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose focus:border-rose text-plum"
                    placeholder="Any delivery instructions"
                />
            </div>

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
                    disabled={!formData.agreeToTerms || submitting || processing}
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
                            Pay {CURRENCY_SYMBOL[item.currency || 'HKD']} {getItemPrice(item).toLocaleString()}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}