// components/MyOrders.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, Truck, PackageCheck, MapPin, AlertCircle } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

interface Purchase {
    orderId: string;
    itemName: string;
    brand: string;
    size: string;
    itemImage: string | null;
    price: number | null;
    currency: string | null;
    trackingNumber: string;
    carrier: string;
    trackingStatus: string;
    trackingLastEvent: string;
    trackingLastEventTime: string | null;
    shippedAt: string | null;
    purchasedAt: string | null;
    deliveryAddress: string;
}

// Maps the backend's raw 17TRACK-style trackingStatus onto a simple 4-stage
// timeline for the buyer: Order Placed -> Preparing -> Shipped -> Delivered.
// "In transit"-ish statuses are folded into 'shipped' since from the
// buyer's perspective the meaningful line is just "it's on the way".
const DELIVERY_STAGES = ['Order Placed', 'Preparing', 'Shipped', 'Delivered'] as const;
const STAGE_ICONS = [Package, Clock, Truck, PackageCheck];

function getDeliveryStageIndex(purchase: Purchase): number {
    if (purchase.trackingStatus === 'delivered') return 3;
    if (purchase.trackingNumber || purchase.shippedAt) return 2; // shipped / in transit
    return 1; // paid, brand is preparing the package
}

function hasDeliveryIssue(purchase: Purchase): boolean {
    return purchase.trackingStatus === 'exception' || purchase.trackingStatus === 'delivery_failure';
}

function formatOrderDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

export function MyOrders() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchPurchases = async () => {
            try {
                const token = localStorage.getItem('token');
                const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

                const response = await axios.get(`${API_URL}/clothing/my-purchases`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    setPurchases(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching purchases:', error);
                setPurchases([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPurchases();
    }, [isAuthenticated, navigate]);

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
                        <h1 className="text-3xl font-kaldera text-plum-dark">My Orders</h1>
                        <span className="rounded-full bg-plum-dark/6 px-3 py-1 text-xs text-plum-dark">
                            {purchases.length} purchased
                        </span>
                    </div>
                    <div className="mb-8 h-px w-9 bg-[#C9A96E]" />

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-plum-dark/20 border-t-plum-dark rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : purchases.length === 0 ? (
                        <div className="rounded-[1.75rem] border border-plum-dark/8 bg-white p-12 text-center shadow-[0_8px_24px_rgba(61,16,40,0.06)]">
                            <Package size={40} className="text-plum/20 mx-auto mb-4" />
                            <p className="text-plum/60 mb-2">No orders yet</p>
                            <p className="text-sm text-plum/40 mb-6">Items you buy from brand shops will appear here with shipping updates</p>
                            <div className="inline-block rounded-full shadow-[0_8px_16px_rgba(61,16,40,0.18)]">
                                <button
                                    onClick={() => navigate('/shop')}
                                    className="rounded-full border border-white/15 bg-gradient-to-b from-plum-dark to-plum px-6 py-3 text-sm font-normal text-cream transition-all hover:brightness-110 active:scale-[0.98]"
                                >
                                    Browse Shop
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-plum-dark/6">
                            {purchases.map((purchase) => {
                                const stageIndex = getDeliveryStageIndex(purchase);
                                const issue = hasDeliveryIssue(purchase);

                                return (
                                    <div key={purchase.orderId} className="py-8 first:pt-0">
                                        <div className="flex flex-col md:flex-row md:gap-6">
                                            {purchase.itemImage && (
                                                <div className="md:w-48 h-48 md:h-auto shrink-0 overflow-hidden rounded-2xl mb-4 md:mb-0">
                                                    <img
                                                        src={purchase.itemImage}
                                                        alt={purchase.itemName}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div>
                                                        <h3 className="text-xl font-kaldera text-plum-dark">{purchase.itemName}</h3>
                                                        <p className="text-plum/60">
                                                            {purchase.brand ? `${purchase.brand} · ` : ''}Size: {purchase.size}
                                                        </p>
                                                    </div>
                                                    {purchase.price != null && (
                                                        <span className="text-sm font-medium text-[#C9A96E] whitespace-nowrap">
                                                            {(purchase.currency || '').toUpperCase()} {Number(purchase.price).toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-plum/40 mb-5">
                                                    Ordered on {formatOrderDate(purchase.purchasedAt)}
                                                </p>

                                                {/* Delivery stepper */}
                                                {issue ? (
                                                    <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[#C9614E]/20 bg-[#C9614E]/5 p-4">
                                                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#C9614E]" />
                                                        <div>
                                                            <p className="text-sm font-medium text-[#C9614E]">Delivery issue</p>
                                                            <p className="mt-1 text-xs text-plum/70">
                                                                {purchase.trackingLastEvent || 'There was a problem with this shipment. We\'ll follow up with you shortly.'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center mb-5">
                                                        {DELIVERY_STAGES.map((label, i) => {
                                                            const complete = i <= stageIndex;
                                                            const StageIcon = STAGE_ICONS[i];
                                                            return (
                                                                <div key={label} className="flex items-center flex-1 last:flex-none">
                                                                    <div className="flex flex-col items-center">
                                                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
                                                                            complete
                                                                                ? 'bg-plum-dark border-plum-dark text-cream'
                                                                                : 'bg-white border-plum-dark/15 text-plum/30'
                                                                        }`}>
                                                                            <StageIcon size={16} />
                                                                        </div>
                                                                        <span className={`mt-2 text-[11px] font-medium text-center leading-tight max-w-[70px] ${
                                                                            complete ? 'text-plum-dark' : 'text-plum/40'
                                                                        }`}>
                                                                            {label}
                                                                        </span>
                                                                    </div>
                                                                    {i < DELIVERY_STAGES.length - 1 && (
                                                                        <div className={`flex-1 h-px mx-1 mb-5 ${
                                                                            i < stageIndex ? 'bg-plum-dark' : 'bg-plum-dark/10'
                                                                        }`}></div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="rounded-2xl bg-plum-dark/[0.03] p-3">
                                                        <p className="text-xs text-plum/40">Tracking Number</p>
                                                        <p className="text-sm font-medium text-plum-dark">
                                                            {purchase.trackingNumber || 'Not shipped yet'}
                                                        </p>
                                                        {purchase.carrier && (
                                                            <p className="text-xs text-plum/60 mt-0.5">{purchase.carrier}</p>
                                                        )}
                                                    </div>
                                                    <div className="rounded-2xl bg-plum-dark/[0.03] p-3">
                                                        <p className="flex items-center gap-1 text-xs text-plum/40">
                                                            <MapPin size={12} /> Latest Update
                                                        </p>
                                                        <p className="text-sm font-medium text-plum-dark">
                                                            {purchase.trackingLastEvent || 'Waiting for shipment'}
                                                        </p>
                                                        {purchase.trackingLastEventTime && (
                                                            <p className="text-xs text-plum/60 mt-0.5">
                                                                {formatOrderDate(purchase.trackingLastEventTime)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
