// components/BrandDashboard.tsx
//
// The seller's "admin page for my brand": manage inventory (add items,
// set/edit prices & currency, track stock, mark available/reserved/sold,
// delete), sync a buy item's price to Stripe, see incoming orders, and add
// shipment tracking numbers as orders go out.
//
// Talks to the existing routes/clothing.js + routes/brand.js endpoints:
//   GET    /api/brand/me                       (existing — brand header)
//   GET    /api/clothing/my-items               (existing)
//   GET    /api/clothing/my-orders              (existing — now also returns
//                                                orderId, trackingNumber,
//                                                carrier, stripeProductId)
//   POST   /api/clothing                        (existing — auto-syncs 'buy'
//                                                items to Stripe)
//   PUT    /api/clothing/:id                    (existing — now also accepts
//                                                `trackingNumber`/`carrier`
//                                                for sold 'buy' items)
//   PUT    /api/clothing/orders/:id/tracking    (NEW — tracking for 'rent'
//                                                orders, i.e. reservations)
//   DELETE /api/clothing/:id                    (existing)
//   POST   /api/clothing/:id/sync-stripe        (existing — manual retry)
//
// Stripe: there's no Connect onboarding flow yet, so we can't deep-link to
// a brand's own Stripe dashboard. What we CAN do today is link straight to
// the Stripe Product page for each synced 'buy' item (we already have
// stripeProductId once an item syncs) — that's the "access to the Stripe
// link" piece. The brand-level "Open Stripe dashboard" button in the header
// is wired to `brandProfile.stripeAccountId`, which is `null` until Connect
// is actually built — until then it just renders as a disabled/greyed
// affordance so the UI doesn't lie about being connected.
//
// Tracking numbers are plain free-text — no carrier API is called. The
// brand just types in whatever the courier gave them.
//
// NOTE: this assumes `API_CONFIG.endpoints.clothing` resolves to
// '/api/clothing' (same base used by ClothingUploadForm.tsx). If your
// utils/api.ts uses different keys, adjust `clothingBase` below.

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import {
    Plus, Trash2, RefreshCw, X, Package, ShoppingBag,
    CheckCircle2, AlertCircle, Clock, Upload, Boxes, Store, Layers,
    ExternalLink, Search, Truck, Check, ChevronDown, Ban
} from 'lucide-react'
import { API_CONFIG } from '../utils/api'

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
type SizeSystem = 'S/M/L' | 'UK' | 'US' | 'EU';
type Currency = 'HKD' | 'USD' | 'GBP' | 'EUR';

interface ClothingItem {
    _id: string;
    productName?: string;
    brand?: string;
    category: string;
    size: string;
    sizeSystem: SizeSystem;
    listingType: 'rent' | 'buy';
    price?: number | null;
    resalePrice?: number | null;
    retailPrice?: number | null;
    currency: Currency;
    stock: number;
    status: 'available' | 'reserved' | 'sold';
    images: string[];
    stripeProductId?: string | null;
    stripeSyncStatus?: 'not_applicable' | 'pending' | 'synced' | 'failed';
    stripeSyncError?: string | null;
}

interface Order {
    orderType: 'rent' | 'buy';
    // orderId is what tracking updates PATCH to. For 'rent' this is the
    // Reservation _id; for 'buy' it's the Clothing _id (a sold buy item IS
    // the order).
    orderId: string;
    clothingId: string;
    itemName: string;
    itemImage: string | null;
    price: number | null;
    currency: string | null;
    status: string;
    buyerName: string | null;
    buyerEmail: string | null;
    buyerPhone?: string | null;
    pickupDay?: string | null;
    pickupTime?: string | null;
    returnDay?: string | null;
    returnTime?: string | null;
    trackingNumber?: string;
    carrier?: string;
    // Live status from 17TRACK, filled in once a tracking number has been
    // registered and the carrier has reported at least one event. Stays
    // 'unknown' until the first webhook push arrives — see
    // POST /webhooks/17track in routes/clothing.js.
    trackingStatus?: 'unknown' | 'not_found' | 'info_received' | 'in_transit' | 'available_for_pickup' | 'out_for_delivery' | 'delivery_failure' | 'delivered' | 'exception';
    trackingLastEvent?: string;
    trackingLastEventTime?: string | null;
    stripeProductId?: string | null;
    createdAt: string | null;
}

interface BrandProfile {
    brandName: string;
    logoUrl: string;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    stripeAccountId?: string | null;
}

const CATEGORIES = ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories', 'Shoes', 'Bags', 'Jewelry', 'Skirts', 'Vests', 'Others'];

const SIZE_OPTIONS: Record<SizeSystem, string[]> = {
    'S/M/L': ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'UK': ['4', '6', '8', '10', '12', '14', '16'],
    'US': ['0', '2', '4', '6', '8', '10', '12'],
    'EU': ['32', '34', '36', '38', '40', '42', '44', '46']
};

const CURRENCIES: Currency[] = ['HKD', 'USD', 'GBP', 'EUR'];
const CURRENCY_SYMBOL: Record<Currency, string> = { HKD: 'HK$', USD: '$', GBP: '£', EUR: '€' };

// Stripe dashboard links point at the LIVE dashboard. This only affects
// which dashboard these links *open* — it has no effect on which Stripe
// secret key the backend actually charges with (that's whatever
// STRIPE_SECRET_KEY is set to in routes/stripe.js / routes/clothing.js).
// If you ever need to debug against test-mode data again, flip this back
// to `true`.
const STRIPE_TEST_MODE = false;
const stripeProductUrl = (productId: string) =>
    `https://dashboard.stripe.com/${STRIPE_TEST_MODE ? 'test/' : ''}products/${productId}`;
const stripeAccountUrl = (accountId: string) =>
    `https://dashboard.stripe.com/${STRIPE_TEST_MODE ? 'test/' : ''}connect/accounts/${accountId}`;

function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Could not read file'));
        reader.readAsDataURL(file);
    });
}

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------
export function BrandDashboard() {
    const [tab, setTab] = useState<'inventory' | 'orders'>('inventory');
    const [items, setItems] = useState<ClothingItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});

    const clothingBase = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.clothing}`;

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
    };

    const loadItems = useCallback(async () => {
        const res = await fetch(`${clothingBase}/my-items?limit=100`, { headers: getAuthHeaders() });
        const result = await res.json();
        if (res.ok && result.success) {
            setItems(result.data);
        } else {
            throw new Error(result.message || 'Failed to load your listings');
        }
    }, [clothingBase]);

    const loadOrders = useCallback(async () => {
        const res = await fetch(`${clothingBase}/my-orders`, { headers: getAuthHeaders() });
        const result = await res.json();
        if (res.ok && result.success) {
            setOrders(result.data);
        } else {
            throw new Error(result.message || 'Failed to load orders');
        }
    }, [clothingBase]);

    const loadBrandProfile = useCallback(async () => {
        try {
            const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.brandMe}`, { headers: getAuthHeaders() });
            if (!res.ok) return; // no profile yet, or not a seller — header just falls back
            const result = await res.json();
            if (result.success) setBrandProfile(result.data);
        } catch {
            // Non-fatal — dashboard still works without the brand header.
        }
    }, []);

    // Tracking status arrives asynchronously via the 17TRACK webhook
    // (POST /webhooks/17track), not the request that saved the tracking
    // number — so poll while the Orders tab is open to pick up updates
    // without asking the brand to refresh manually.
    useEffect(() => {
        if (tab !== 'orders') return;
        const id = setInterval(() => {
            loadOrders().catch(() => {}); // silent — a missed poll isn't worth surfacing an error for
        }, 30000);
        return () => clearInterval(id);
    }, [tab, loadOrders]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            setError('');
            try {
                await Promise.all([loadItems(), loadOrders(), loadBrandProfile()]);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error loading dashboard');
            } finally {
                setLoading(false);
            }
        })();
    }, [loadItems, loadOrders, loadBrandProfile]);

    const setItemSaving = (id: string, val: boolean) =>
        setSavingIds(prev => ({ ...prev, [id]: val }));

    const updateItem = async (id: string, patch: Partial<ClothingItem>) => {
        setItemSaving(id, true);
        setError('');
        try {
            const res = await fetch(`${clothingBase}/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(patch)
            });
            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.message || 'Update failed');
            setItems(prev => prev.map(it => (it._id === id ? { ...it, ...result.data } : it)));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error updating item');
        } finally {
            setItemSaving(id, false);
        }
    };

    const deleteItem = async (id: string) => {
        if (!confirm('Delete this listing? This cannot be undone.')) return;
        setItemSaving(id, true);
        setError('');
        try {
            const res = await fetch(`${clothingBase}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.message || 'Delete failed');
            setItems(prev => prev.filter(it => it._id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error deleting item');
        } finally {
            setItemSaving(id, false);
        }
    };

    const syncStripe = async (id: string) => {
        setItemSaving(id, true);
        setError('');
        try {
            const res = await fetch(`${clothingBase}/${id}/sync-stripe`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.message || 'Stripe sync failed');
            await loadItems();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error syncing to Stripe');
        } finally {
            setItemSaving(id, false);
        }
    };

    // Tracking updates go to different endpoints depending on order type —
    // 'buy' orders are Clothing docs (existing PUT /:id), 'rent' orders are
    // Reservation docs (new PUT /orders/:id/tracking).
    const updateTracking = async (order: Order, patch: { trackingNumber?: string; carrier?: string }) => {
        setItemSaving(order.orderId, true);
        setError('');
        try {
            const url = order.orderType === 'buy'
                ? `${clothingBase}/${order.orderId}`
                : `${clothingBase}/orders/${order.orderId}/tracking`;
            const res = await fetch(url, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(patch)
            });
            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.message || 'Failed to save tracking number');
            setOrders(prev => prev.map(o => (o.orderId === order.orderId ? { ...o, ...patch } : o)));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error saving tracking number');
        } finally {
            setItemSaving(order.orderId, false);
        }
    };

    const stripeBadge = (item: ClothingItem): React.ReactNode => {
        if (item.listingType !== 'buy') return null;
        const map = {
            not_applicable: null,
            pending: { icon: Clock, classes: 'bg-amber-100 text-amber-800', label: 'Syncing…' },
            synced: { icon: CheckCircle2, classes: 'bg-emerald-100 text-emerald-800', label: 'On Stripe' },
            failed: { icon: AlertCircle, classes: 'bg-red-100 text-red-800', label: 'Sync failed' }
        } as const;
        const entry = map[item.stripeSyncStatus || 'not_applicable'];
        if (!entry) return null;
        const { icon: Icon, classes, label } = entry;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${classes}`} title={item.stripeSyncError || ''}>
                <Icon size={12} />
                {label}
            </span>
        );
    };

    // ── Dashboard-level stats, computed from what's already loaded ────────
    const totalStock = items.reduce((sum, it) => sum + (it.stock ?? 0), 0);
    const availableCount = items.filter(it => it.status === 'available').length;
    const needsAttentionCount = items.filter(it => it.listingType === 'buy' && it.stripeSyncStatus === 'failed').length;
    const unshippedCount = orders.filter(o => !o.trackingNumber && o.status !== 'cancelled').length;

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-8">
                <div className="container mx-auto px-4 max-w-6xl">

                    {/* ── Brand header ────────────────────────────────────── */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-16 h-16 rounded-xl bg-cream border border-plum/10 flex items-center justify-center overflow-hidden shrink-0">
                                {brandProfile?.logoUrl ? (
                                    <img src={brandProfile.logoUrl} alt={`${brandProfile.brandName} logo`} className="w-full h-full object-contain" />
                                ) : (
                                    <Store className="text-plum/30" size={26} />
                                )}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-2xl md:text-3xl font-bold text-plum leading-tight truncate">
                                        {brandProfile?.brandName || 'Brand Dashboard'}
                                    </h1>
                                    {brandProfile?.approvalStatus && brandProfile.approvalStatus !== 'approved' && (
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                                            brandProfile.approvalStatus === 'pending'
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {brandProfile.approvalStatus === 'pending' ? 'Pending review' : 'Rejected'}
                                        </span>
                                    )}
                                </div>
                                <p className="text-plum/60 text-sm mt-0.5">Manage your stock, prices, and orders.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <StripeDashboardButton accountId={brandProfile?.stripeAccountId} />
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center justify-center gap-2 bg-rose text-white px-5 py-3 rounded-lg font-medium hover:bg-rose/90 transition-colors"
                            >
                                <Plus size={18} /> Add item
                            </button>
                        </div>
                    </div>

                    {/* ── Stat cards ──────────────────────────────────────── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <StatCard icon={Package} label="Listings" value={items.length} />
                        <StatCard icon={Boxes} label="Units in stock" value={totalStock} />
                        <StatCard icon={Layers} label="Available now" value={availableCount} />
                        <StatCard
                            icon={ShoppingBag}
                            label="Orders to ship"
                            value={unshippedCount}
                            accent={unshippedCount > 0 ? 'bg-amber-100 text-amber-700' : undefined}
                        />
                    </div>

                    {needsAttentionCount > 0 && (
                        <div className="mb-6 p-4 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 flex items-center gap-2 text-sm">
                            <AlertCircle size={16} className="shrink-0" />
                            {needsAttentionCount} item{needsAttentionCount > 1 ? 's need' : ' needs'} a Stripe re-sync — check the Inventory tab.
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-xl border border-red-300 flex justify-between items-center">
                            <span>{error}</span>
                            <button onClick={() => setError('')} className="ml-4 underline hover:no-underline">Dismiss</button>
                        </div>
                    )}

                    <div className="flex gap-2 mb-6 border-b border-plum/10">
                        <button
                            onClick={() => setTab('inventory')}
                            className={`px-4 py-2 font-medium inline-flex items-center gap-2 border-b-2 -mb-px transition-colors ${
                                tab === 'inventory' ? 'border-rose text-plum' : 'border-transparent text-plum/50 hover:text-plum/80'
                            }`}
                        >
                            <Package size={16} /> Inventory ({items.length})
                        </button>
                        <button
                            onClick={() => setTab('orders')}
                            className={`px-4 py-2 font-medium inline-flex items-center gap-2 border-b-2 -mb-px transition-colors relative ${
                                tab === 'orders' ? 'border-rose text-plum' : 'border-transparent text-plum/50 hover:text-plum/80'
                            }`}
                        >
                            <ShoppingBag size={16} /> Orders ({orders.length})
                            {unshippedCount > 0 && (
                                <span className="w-2 h-2 rounded-full bg-rose" />
                            )}
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-16">
                            <div className="w-8 h-8 border-2 border-plum border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-plum mt-4">Loading...</p>
                        </div>
                    ) : tab === 'inventory' ? (
                        <InventoryTable
                            items={items}
                            savingIds={savingIds}
                            onUpdate={updateItem}
                            onDelete={deleteItem}
                            onSyncStripe={syncStripe}
                            stripeBadge={stripeBadge}
                        />
                    ) : (
                        <OrdersPanel orders={orders} savingIds={savingIds} onUpdateTracking={updateTracking} />
                    )}
                </div>
            </main>
            <Footer />

            {showAddModal && (
                <AddItemModal
                    clothingBase={clothingBase}
                    getAuthHeaders={getAuthHeaders}
                    brandName={brandProfile?.brandName}
                    onClose={() => setShowAddModal(false)}
                    onCreated={async () => {
                        setShowAddModal(false);
                        setLoading(true);
                        try { await loadItems(); } finally { setLoading(false); }
                    }}
                />
            )}
        </div>
    );
}

// ------------------------------------------------------------------
// Stripe dashboard button (header) — greyed out until Connect is wired up
// ------------------------------------------------------------------
function StripeDashboardButton({ accountId }: { accountId?: string | null }) {
    if (!accountId) {
        return (
            <span
                className="inline-flex items-center gap-2 border border-plum/15 text-plum/40 px-4 py-3 rounded-lg font-medium text-sm cursor-not-allowed select-none"
                title="Stripe account linking isn't set up yet — per-item Stripe links are still available from the Inventory tab."
            >
                <Ban size={16} /> Stripe not connected
            </span>
        );
    }
    return (
        <a
            href={stripeAccountUrl(accountId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-plum/20 text-plum px-4 py-3 rounded-lg font-medium text-sm hover:bg-plum/5 transition-colors"
        >
            <ExternalLink size={16} /> Open Stripe dashboard
        </a>
    );
}

// ------------------------------------------------------------------
// Stat card
// ------------------------------------------------------------------
function StatCard({ icon: Icon, label, value, accent }: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    value: number;
    accent?: string;
}) {
    return (
        <div className="bg-white rounded-2xl shadow p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent || 'bg-rose/10 text-rose'}`}>
                <Icon size={20} />
            </div>
            <div>
                <div className="text-2xl font-bold text-plum leading-none">{value}</div>
                <div className="text-plum/50 text-xs mt-1">{label}</div>
            </div>
        </div>
    );
}

// ------------------------------------------------------------------
// Inventory table
// ------------------------------------------------------------------
function InventoryTable({
                            items, savingIds, onUpdate, onDelete, onSyncStripe, stripeBadge
                        }: {
    items: ClothingItem[];
    savingIds: Record<string, boolean>;
    onUpdate: (id: string, patch: Partial<ClothingItem>) => void;
    onDelete: (id: string) => void;
    onSyncStripe: (id: string) => void;
    stripeBadge: (item: ClothingItem) => React.ReactNode;
}) {
    const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
    const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'rent' | 'buy'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | ClothingItem['status']>('all');

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return items.filter(it => {
            if (typeFilter !== 'all' && it.listingType !== typeFilter) return false;
            if (statusFilter !== 'all' && it.status !== statusFilter) return false;
            if (q && !(it.productName?.toLowerCase().includes(q) || it.category.toLowerCase().includes(q))) return false;
            return true;
        });
    }, [items, search, typeFilter, statusFilter]);

    if (items.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow p-12 text-center text-plum/60">
                No items yet. Click "Add item" to list your first piece.
            </div>
        );
    }

    const priceField = (item: ClothingItem) => (item.listingType === 'buy' ? 'resalePrice' : 'price');

    return (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
            {/* ── Filters ─────────────────────────────────────────────── */}
            <div className="p-4 border-b border-cream flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="relative flex-1 min-w-[180px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-plum/30" />
                    <input
                        placeholder="Search by name or category"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-plum/15 rounded-lg text-sm"
                    />
                </div>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}
                        className="border border-plum/15 rounded-lg px-3 py-2 text-sm text-plum/80">
                    <option value="all">All types</option>
                    <option value="buy">Sell</option>
                    <option value="rent">Rent</option>
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="border border-plum/15 rounded-lg px-3 py-2 text-sm text-plum/80">
                    <option value="all">All statuses</option>
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-cream text-plum/70 text-left">
                    <tr>
                        <th className="p-3">Item</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Size</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Stripe</th>
                        <th className="p-3 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.map(item => {
                        const field = priceField(item);
                        const currentPrice = item[field] ?? '';
                        const priceDraft = priceDrafts[item._id] ?? String(currentPrice);
                        const stockDraft = stockDrafts[item._id] ?? String(item.stock ?? 0);
                        const busy = !!savingIds[item._id];
                        const outOfStock = (item.stock ?? 0) <= 0;
                        return (
                            <tr key={item._id} className="border-t border-cream hover:bg-cream/40 transition-colors">
                                <td className="p-3">
                                    <div className="flex items-center gap-3">
                                        {item.images?.[0] && (
                                            <img src={item.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                        )}
                                        <div>
                                            <div className="font-medium text-plum">{item.productName || item.category}</div>
                                            <div className="text-plum/50">{item.category}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3 capitalize">{item.listingType}</td>
                                <td className="p-3">{item.size}</td>
                                <td className="p-3">
                                    <div className="flex items-center gap-1">
                                        <select
                                            value={item.currency}
                                            disabled={busy}
                                            onChange={(e) => onUpdate(item._id, { currency: e.target.value as Currency })}
                                            className="border border-plum/20 rounded px-1 py-1 text-plum/70 text-xs"
                                        >
                                            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <input
                                            type="number"
                                            className="w-20 border border-plum/20 rounded px-2 py-1"
                                            value={priceDraft}
                                            onChange={(e) => setPriceDrafts(prev => ({ ...prev, [item._id]: e.target.value }))}
                                        />
                                        <button
                                            disabled={busy}
                                            onClick={() => onUpdate(item._id, { [field]: Number(priceDraft) } as Partial<ClothingItem>)}
                                            className="text-xs text-rose font-medium hover:underline disabled:opacity-40"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            min={0}
                                            className={`w-16 border rounded px-2 py-1 ${outOfStock ? 'border-red-300 text-red-700' : 'border-plum/20'}`}
                                            value={stockDraft}
                                            onChange={(e) => setStockDrafts(prev => ({ ...prev, [item._id]: e.target.value }))}
                                        />
                                        <button
                                            disabled={busy}
                                            onClick={() => onUpdate(item._id, { stock: Math.max(0, Number(stockDraft)) })}
                                            className="text-xs text-rose font-medium hover:underline disabled:opacity-40"
                                        >
                                            Save
                                        </button>
                                    </div>
                                    {outOfStock && <div className="text-xs text-red-600 mt-1">Out of stock</div>}
                                </td>
                                <td className="p-3">
                                    <select
                                        value={item.status}
                                        disabled={busy}
                                        onChange={(e) => onUpdate(item._id, { status: e.target.value as ClothingItem['status'] })}
                                        className="border border-plum/20 rounded px-2 py-1"
                                    >
                                        <option value="available">Available</option>
                                        <option value="reserved">Reserved</option>
                                        <option value="sold">Sold</option>
                                    </select>
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {stripeBadge(item)}
                                        {item.listingType === 'buy' && item.stripeSyncStatus !== 'synced' && (
                                            <button
                                                disabled={busy}
                                                onClick={() => onSyncStripe(item._id)}
                                                className="inline-flex items-center gap-1 text-xs text-plum/70 hover:text-plum disabled:opacity-40"
                                            >
                                                <RefreshCw size={12} /> Sync
                                            </button>
                                        )}
                                        {item.listingType === 'buy' && item.stripeProductId && (
                                            <a
                                                href={stripeProductUrl(item.stripeProductId)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-plum/70 hover:text-plum"
                                                title="Open this product in Stripe"
                                            >
                                                <ExternalLink size={12} /> View
                                            </a>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3 text-right">
                                    <button
                                        disabled={busy}
                                        onClick={() => onDelete(item._id)}
                                        className="text-plum/40 hover:text-red-600 disabled:opacity-40"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={8} className="p-8 text-center text-plum/50">No items match those filters.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ------------------------------------------------------------------
// Orders panel — filterable list of order cards, each with an inline
// tracking-number editor.
// ------------------------------------------------------------------
function OrdersPanel({
                         orders, savingIds, onUpdateTracking
                     }: {
    orders: Order[];
    savingIds: Record<string, boolean>;
    onUpdateTracking: (order: Order, patch: { trackingNumber?: string; carrier?: string }) => void;
}) {
    const [filter, setFilter] = useState<'all' | 'to_ship' | 'shipped'>('all');

    const filtered = useMemo(() => {
        if (filter === 'to_ship') return orders.filter(o => !o.trackingNumber);
        if (filter === 'shipped') return orders.filter(o => !!o.trackingNumber);
        return orders;
    }, [orders, filter]);

    if (orders.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow p-12 text-center text-plum/60">
                No orders yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                {([
                    ['all', 'All'],
                    ['to_ship', 'To ship'],
                    ['shipped', 'Shipped'],
                ] as const).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            filter === key ? 'bg-plum text-white' : 'bg-white text-plum/60 border border-plum/15 hover:bg-cream'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow divide-y divide-cream overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-12 text-center text-plum/50">No orders in this view.</div>
                ) : (
                    filtered.map((o) => (
                        <OrderRow
                            key={`${o.orderType}-${o.orderId}`}
                            order={o}
                            busy={!!savingIds[o.orderId]}
                            onUpdateTracking={onUpdateTracking}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

// Label + color for the live 17TRACK status, shown next to the tracking
// number once it's known. 'unknown' means we've registered the number but
// haven't heard back from the carrier yet (can take a few minutes).
const TRACKING_STATUS_META: Record<string, { label: string; className: string }> = {
    unknown: { label: 'Awaiting carrier', className: 'bg-gray-100 text-gray-600' },
    not_found: { label: 'Not found', className: 'bg-gray-100 text-gray-600' },
    info_received: { label: 'Label created', className: 'bg-blue-50 text-blue-700' },
    in_transit: { label: 'In transit', className: 'bg-blue-50 text-blue-700' },
    available_for_pickup: { label: 'Ready for pickup', className: 'bg-amber-50 text-amber-700' },
    out_for_delivery: { label: 'Out for delivery', className: 'bg-amber-50 text-amber-700' },
    delivery_failure: { label: 'Delivery failed', className: 'bg-red-50 text-red-700' },
    delivered: { label: 'Delivered', className: 'bg-emerald-50 text-emerald-700' },
    exception: { label: 'Exception', className: 'bg-red-50 text-red-700' }
};

function OrderRow({
                      order, busy, onUpdateTracking
                  }: {
    order: Order;
    busy: boolean;
    onUpdateTracking: (order: Order, patch: { trackingNumber?: string; carrier?: string }) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [trackingDraft, setTrackingDraft] = useState(order.trackingNumber || '');
    const [carrierDraft, setCarrierDraft] = useState(order.carrier || '');

    const hasTracking = !!order.trackingNumber;

    const save = () => {
        onUpdateTracking(order, { trackingNumber: trackingDraft.trim(), carrier: carrierDraft.trim() });
        setEditing(false);
    };

    return (
        <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {order.itemImage && <img src={order.itemImage} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />}
                <div className="min-w-0">
                    <div className="font-medium text-plum truncate">{order.itemName}</div>
                    <div className="text-xs text-plum/50 flex items-center gap-2 flex-wrap mt-0.5">
                        <span className="capitalize px-1.5 py-0.5 bg-cream rounded text-plum/70">{order.orderType}</span>
                        <span className="capitalize">{order.status}</span>
                        {order.price != null && <span>{order.currency ?? ''} {order.price}</span>}
                        {order.orderType === 'rent' && (order.pickupDay || order.returnDay) && (
                            <span>{[order.pickupDay, order.returnDay].filter(Boolean).join(' → ')}</span>
                        )}
                    </div>
                    {order.buyerName && (
                        <div className="text-xs text-plum/50 mt-0.5">
                            {order.buyerName} · {order.buyerEmail}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {order.orderType === 'buy' && order.stripeProductId && (
                    <a
                        href={stripeProductUrl(order.stripeProductId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-plum/60 hover:text-plum"
                        title="Open this product in Stripe"
                    >
                        <ExternalLink size={12} /> Stripe
                    </a>
                )}

                {editing ? (
                    <div className="flex items-center gap-2 bg-cream/60 rounded-lg p-2">
                        <input
                            placeholder="Carrier (optional)"
                            value={carrierDraft}
                            onChange={(e) => setCarrierDraft(e.target.value)}
                            className="w-28 border border-plum/20 rounded px-2 py-1 text-xs"
                        />
                        <input
                            placeholder="Tracking number"
                            value={trackingDraft}
                            onChange={(e) => setTrackingDraft(e.target.value)}
                            className="w-36 border border-plum/20 rounded px-2 py-1 text-xs"
                            autoFocus
                        />
                        <button
                            disabled={busy || !trackingDraft.trim()}
                            onClick={save}
                            className="inline-flex items-center gap-1 text-xs font-medium text-white bg-rose px-3 py-1.5 rounded disabled:opacity-40"
                        >
                            <Check size={12} /> Save
                        </button>
                        <button
                            onClick={() => { setEditing(false); setTrackingDraft(order.trackingNumber || ''); setCarrierDraft(order.carrier || ''); }}
                            className="text-plum/40 hover:text-plum/70"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : hasTracking ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setEditing(true)}
                            className="inline-flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
                        >
                            <Truck size={13} />
                            {order.carrier ? `${order.carrier}: ` : ''}{order.trackingNumber}
                            <ChevronDown size={12} />
                        </button>
                        {order.trackingStatus && (
                            <span
                                className={`text-xs px-2 py-1 rounded-full ${TRACKING_STATUS_META[order.trackingStatus]?.className || 'bg-gray-100 text-gray-600'}`}
                                title={order.trackingLastEvent || undefined}
                            >
                                {TRACKING_STATUS_META[order.trackingStatus]?.label || order.trackingStatus}
                            </span>
                        )}
                    </div>
                ) : (
                    <button
                        disabled={busy}
                        onClick={() => setEditing(true)}
                        className="inline-flex items-center gap-2 text-xs font-medium text-plum border border-plum/20 px-3 py-1.5 rounded-full hover:bg-cream transition-colors disabled:opacity-40"
                    >
                        <Truck size={13} /> Add tracking number
                    </button>
                )}
            </div>
        </div>
    );
}

// ------------------------------------------------------------------
// Add item modal
// ------------------------------------------------------------------
function AddItemModal({
                          clothingBase, getAuthHeaders, brandName, onClose, onCreated
                      }: {
    clothingBase: string;
    getAuthHeaders: () => Record<string, string>;
    brandName?: string;
    onClose: () => void;
    onCreated: () => void;
}) {
    const [productName, setProductName] = useState('');
    const [category, setCategory] = useState('Dresses');
    const [sizeSystem, setSizeSystem] = useState<SizeSystem>('S/M/L');
    const [size, setSize] = useState('M');
    const [listingType, setListingType] = useState<'rent' | 'buy'>('buy');
    const [currency, setCurrency] = useState<Currency>('HKD');
    const [price, setPrice] = useState('');
    const [retailPrice, setRetailPrice] = useState('');
    const [stock, setStock] = useState('1');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = async (files: FileList | null) => {
        if (!files) return;
        const urls: string[] = [];
        for (const file of Array.from(files).slice(0, 3)) {
            urls.push(await fileToDataUrl(file));
        }
        setImages(prev => [...prev, ...urls].slice(0, 3));
    };

    const canSubmit =
        category && size && images.length > 0 && Number(stock) >= 0 &&
        (listingType === 'rent' ? price : retailPrice) && !saving;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setSaving(true);
        setError('');
        try {
            const payload = {
                // Contact details are no longer collected here — the backend
                // fills them in from the logged-in seller's own account.
                clothingItems: [{
                    images,
                    productName,
                    category,
                    sizeSystem,
                    size,
                    listingType,
                    currency,
                    stock: Number(stock),
                    price: listingType === 'rent' ? Number(price) : undefined,
                    // 'buy' items: resalePrice is the actual sale price synced to Stripe
                    resalePrice: listingType === 'buy' ? Number(retailPrice) : undefined,
                    retailPrice: retailPrice ? Number(retailPrice) : undefined,
                    additionalInfo
                }]
            };

            const res = await fetch(clothingBase, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.message || 'Failed to create item');
            onCreated();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error creating item');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-1">
                    <h2 className="text-xl font-bold text-plum">Add item</h2>
                    <button onClick={onClose}><X size={20} className="text-plum/60" /></button>
                </div>
                {brandName && (
                    <p className="text-sm text-plum/50 mb-4">Listing under <span className="font-medium text-plum/70">{brandName}</span></p>
                )}

                {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">{error}</div>}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-plum mb-1">Photos (up to 3)</label>
                        <div className="flex gap-2 flex-wrap">
                            {images.map((img, i) => (
                                <img key={i} src={img} className="w-16 h-16 rounded-lg object-cover" alt="" />
                            ))}
                            {images.length < 3 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-16 h-16 rounded-lg border-2 border-dashed border-plum/20 flex items-center justify-center"
                                >
                                    <Upload size={18} className="text-plum/40" />
                                </button>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFiles(e.target.files)}
                        />
                    </div>

                    <input placeholder="Product name" value={productName} onChange={(e) => setProductName(e.target.value)}
                           className="w-full border border-plum/20 rounded-lg px-3 py-2" />

                    <div className="grid grid-cols-3 gap-3">
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-plum/20 rounded-lg px-3 py-2">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select
                            value={sizeSystem}
                            onChange={(e) => {
                                const newSystem = e.target.value as SizeSystem;
                                setSizeSystem(newSystem);
                                setSize(SIZE_OPTIONS[newSystem][0]);
                            }}
                            className="border border-plum/20 rounded-lg px-3 py-2"
                        >
                            {Object.keys(SIZE_OPTIONS).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select value={size} onChange={(e) => setSize(e.target.value)} className="border border-plum/20 rounded-lg px-3 py-2">
                            {SIZE_OPTIONS[sizeSystem].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="flex gap-3">
                        <label className="inline-flex items-center gap-2">
                            <input type="radio" checked={listingType === 'buy'} onChange={() => setListingType('buy')} /> Sell
                        </label>
                        <label className="inline-flex items-center gap-2">
                            <input type="radio" checked={listingType === 'rent'} onChange={() => setListingType('rent')} /> Rent
                        </label>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}
                                className="border border-plum/20 rounded-lg px-3 py-2">
                            {CURRENCIES.map(c => <option key={c} value={c}>{c} ({CURRENCY_SYMBOL[c]})</option>)}
                        </select>
                        {listingType === 'buy' ? (
                            <input placeholder="Sale price" type="number" value={retailPrice} onChange={(e) => setRetailPrice(e.target.value)}
                                   className="border border-plum/20 rounded-lg px-3 py-2" />
                        ) : (
                            <input placeholder="Rental price" type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                                   className="border border-plum/20 rounded-lg px-3 py-2" />
                        )}
                        <input placeholder="Stock" type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)}
                               className="border border-plum/20 rounded-lg px-3 py-2" />
                    </div>

                    <textarea placeholder="Additional details" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)}
                              rows={2} className="w-full border border-plum/20 rounded-lg px-3 py-2" />

                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className={`w-full py-3 rounded-lg font-medium ${
                            canSubmit ? 'bg-rose text-white hover:bg-rose/90' : 'bg-plum/10 text-plum/40 cursor-not-allowed'
                        }`}
                    >
                        {saving ? 'Saving...' : 'Add item'}
                    </button>
                </div>
            </div>
        </div>
    );
}