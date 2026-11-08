// components/ShopifyTest.tsx
// Test page: list Shopify products, build a cart, get shipping rates, pay.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, Loader2, Minus, Plus, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

interface Variant {
    id: string;
    title: string;
    price: string;
    availableForSale: boolean;
}

interface Product {
    id: string;
    title: string;
    handle: string;
    image: { url: string; altText?: string | null } | null;
    variants: Variant[];
}

interface CartLine {
    variantId: string;
    title: string;
    price: number;
    quantity: number;
}

interface Rate {
    handle: string;
    title: string;
    amount: string;
    currencyCode: string;
}

interface Quote {
    currency: string;
    subtotal: string;
    shipping: string;
    tax: string;
    total: string;
    rates: Rate[];
}

const emptyForm = {
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address1: '',
    city: '',
    provinceCode: '',
    zip: '',
    countryCode: 'US'
};

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const errMsg = (err: unknown) =>
    axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Something went wrong';

const inputClasses =
    'w-full rounded-2xl border border-plum-dark/15 bg-white px-4 py-2.5 text-sm text-plum-dark placeholder-plum/30 transition-colors focus:border-plum-dark/40 focus:outline-none focus:ring-2 focus:ring-plum-dark/10';

export function ShopifyTest() {
    const { isAuthenticated, loading: authLoading, user } = useAuth();
    const navigate = useNavigate();

    const [products, setProducts] = useState<Product[]>([]);
    const [currency, setCurrency] = useState('USD');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [variantChoice, setVariantChoice] = useState<Record<string, string>>({});
    const [cart, setCart] = useState<CartLine[]>([]);
    const [form, setForm] = useState(emptyForm);

    const [quote, setQuote] = useState<Quote | null>(null);
    const [selectedRate, setSelectedRate] = useState('');
    const [quoting, setQuoting] = useState(false);
    const [paying, setPaying] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) navigate('/login');
    }, [authLoading, isAuthenticated, navigate]);

    // Prefill email / name from the logged-in user
    useEffect(() => {
        if (!user) return;
        const [first, ...rest] = (user.name || '').split(' ');
        setForm(f => ({
            ...f,
            email: f.email || user.email || '',
            firstName: f.firstName || first || '',
            lastName: f.lastName || rest.join(' '),
            phone: f.phone || user.phone || ''
        }));
    }, [user]);

    useEffect(() => {
        if (!isAuthenticated) return;
        axios
            .get(`${API_URL}/shopify/products`)
            .then(res => {
                setProducts(res.data.products);
                setCurrency(res.data.currency);
            })
            .catch(err => setError(errMsg(err)))
            .finally(() => setLoading(false));
    }, [isAuthenticated]);

    const money = (amount: string | number, cur = currency) =>
        new Intl.NumberFormat(undefined, { style: 'currency', currency: cur }).format(Number(amount));

    const resetQuote = () => {
        setQuote(null);
        setSelectedRate('');
    };

    const cartSubtotal = useMemo(
        () => cart.reduce((sum, l) => sum + l.price * l.quantity, 0),
        [cart]
    );

    const addToCart = (product: Product) => {
        const variantId = variantChoice[product.id] || product.variants[0]?.id;
        const variant = product.variants.find(v => v.id === variantId);
        if (!variant) return;

        const title =
            variant.title === 'Default Title' ? product.title : `${product.title} — ${variant.title}`;

        setCart(prev => {
            const existing = prev.find(l => l.variantId === variant.id);
            if (existing) {
                return prev.map(l =>
                    l.variantId === variant.id ? { ...l, quantity: Math.min(l.quantity + 1, 10) } : l
                );
            }
            return [...prev, { variantId: variant.id, title, price: Number(variant.price), quantity: 1 }];
        });
        resetQuote();
    };

    const changeQty = (variantId: string, delta: number) => {
        setCart(prev =>
            prev
                .map(l =>
                    l.variantId === variantId
                        ? { ...l, quantity: Math.min(l.quantity + delta, 10) }
                        : l
                )
                .filter(l => l.quantity > 0)
        );
        resetQuote();
    };

    const removeLine = (variantId: string) => {
        setCart(prev => prev.filter(l => l.variantId !== variantId));
        resetQuote();
    };

    const handleField = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        resetQuote();
    };

    const requestBody = () => ({
        items: cart.map(l => ({ variantId: l.variantId, quantity: l.quantity })),
        email: form.email,
        address: {
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            address1: form.address1,
            city: form.city,
            provinceCode: form.provinceCode,
            zip: form.zip,
            countryCode: form.countryCode
        }
    });

    const formValid =
        cart.length > 0 &&
        form.email.trim() &&
        form.firstName.trim() &&
        form.lastName.trim() &&
        form.address1.trim() &&
        form.city.trim() &&
        form.zip.trim() &&
        form.countryCode.trim().length === 2;

    // Prices the cart for the address. Call without a handle to list the
    // shipping options, and again with a handle to price a chosen option.
    const getQuote = async (handle?: string) => {
        setCheckoutError('');
        setQuoting(true);
        try {
            const res = await axios.post(
                `${API_URL}/shopify/shipping-rates`,
                { ...requestBody(), shippingRateHandle: handle },
                { headers: authHeader() }
            );
            const q: Quote = res.data.quote;
            // Keep the earlier option list if Shopify omits it on the second pass
            setQuote(prev => ({ ...q, rates: q.rates.length ? q.rates : prev?.rates ?? [] }));
            if (handle) setSelectedRate(handle);
        } catch (err) {
            setCheckoutError(errMsg(err));
        } finally {
            setQuoting(false);
        }
    };

    const pay = async () => {
        setCheckoutError('');
        setPaying(true);
        try {
            const res = await axios.post(
                `${API_URL}/shopify/checkout`,
                { ...requestBody(), shippingRateHandle: selectedRate || undefined },
                { headers: authHeader() }
            );
            window.location.href = res.data.checkoutUrl;
        } catch (err) {
            setCheckoutError(errMsg(err));
            setPaying(false);
        }
    };

    if (authLoading || !isAuthenticated) return null;

    const canPay = !!quote && (quote.rates.length === 0 || !!selectedRate) && !paying;

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-white pb-12 pt-28 md:pt-32">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="mb-8 text-center">
                        <span className="text-xs uppercase tracking-label text-plum/40">Test</span>
                        <h1 className="mt-1 font-kaldera text-4xl text-plum-dark">Shopify checkout test</h1>
                        <p className="mx-auto mt-2 max-w-xl text-sm text-plum/60">
                            Pick products, enter an address, get shipping rates, then pay on Shopify's hosted page.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-2xl border border-[#C9614E]/25 bg-[#C9614E]/8 p-4 text-sm text-[#C9614E]">
                            {error}
                        </div>
                    )}

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* ── Products ── */}
                        <section className="lg:col-span-2">
                            {loading ? (
                                <div className="py-16 text-center">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-plum-dark" />
                                </div>
                            ) : products.length === 0 && !error ? (
                                <p className="py-16 text-center text-plum/60">No active products found.</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                                    {products.map(product => {
                                        const selected =
                                            product.variants.find(v => v.id === variantChoice[product.id]) ||
                                            product.variants[0];
                                        return (
                                            <div key={product.id}>
                                                <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-plum-dark/5">
                                                    {product.image ? (
                                                        <img
                                                            src={product.image.url}
                                                            alt={product.image.altText || product.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center">
                                                            <ShoppingBag size={36} className="text-plum-dark/20" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="pt-3">
                                                    <h3 className="font-kaldera text-base text-plum-dark">{product.title}</h3>
                                                    <p className="mt-0.5 text-sm text-plum/60">
                                                        {selected ? money(selected.price) : ''}
                                                    </p>

                                                    {product.variants.length > 1 && (
                                                        <select
                                                            value={selected?.id}
                                                            onChange={e =>
                                                                setVariantChoice(c => ({ ...c, [product.id]: e.target.value }))
                                                            }
                                                            className={`${inputClasses} mt-2`}
                                                        >
                                                            {product.variants.map(v => (
                                                                <option key={v.id} value={v.id} disabled={!v.availableForSale}>
                                                                    {v.title}
                                                                    {!v.availableForSale ? ' (sold out)' : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}

                                                    <button
                                                        onClick={() => addToCart(product)}
                                                        disabled={!selected?.availableForSale}
                                                        className="mt-2 w-full rounded-full bg-plum-dark py-2.5 text-sm text-cream transition-colors hover:bg-plum-dark/90 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        {selected?.availableForSale ? 'Add to cart' : 'Sold out'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* ── Cart + checkout ── */}
                        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
                            <div className="rounded-[1.75rem] border border-plum-dark/10 p-5">
                                <h2 className="mb-3 flex items-center gap-2 font-kaldera text-xl text-plum-dark">
                                    <ShoppingBag size={18} /> Cart
                                </h2>

                                {cart.length === 0 ? (
                                    <p className="text-sm text-plum/50">Your cart is empty.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {cart.map(line => (
                                            <div key={line.variantId} className="flex items-center justify-between gap-3 text-sm">
                                                <div className="min-w-0">
                                                    <p className="truncate text-plum-dark">{line.title}</p>
                                                    <p className="text-xs text-plum/50">{money(line.price)}</p>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-1.5">
                                                    <button
                                                        onClick={() => changeQty(line.variantId, -1)}
                                                        className="flex h-7 w-7 items-center justify-center rounded-full border border-plum-dark/15 hover:bg-plum-dark/5"
                                                        aria-label="Decrease"
                                                    >
                                                        <Minus size={13} />
                                                    </button>
                                                    <span className="w-5 text-center">{line.quantity}</span>
                                                    <button
                                                        onClick={() => changeQty(line.variantId, 1)}
                                                        className="flex h-7 w-7 items-center justify-center rounded-full border border-plum-dark/15 hover:bg-plum-dark/5"
                                                        aria-label="Increase"
                                                    >
                                                        <Plus size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => removeLine(line.variantId)}
                                                        className="ml-1 text-plum/40 hover:text-[#C9614E]"
                                                        aria-label="Remove"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex justify-between border-t border-plum-dark/10 pt-3 text-sm text-plum-dark">
                                            <span>Subtotal (estimate)</span>
                                            <span>{money(cartSubtotal)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="space-y-3 rounded-[1.75rem] border border-plum-dark/10 p-5">
                                    <h2 className="flex items-center gap-2 font-kaldera text-xl text-plum-dark">
                                        <Truck size={18} /> Shipping
                                    </h2>

                                    <input name="email" type="email" value={form.email} onChange={handleField} placeholder="Email" className={inputClasses} />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input name="firstName" value={form.firstName} onChange={handleField} placeholder="First name" className={inputClasses} />
                                        <input name="lastName" value={form.lastName} onChange={handleField} placeholder="Last name" className={inputClasses} />
                                    </div>
                                    <input name="phone" value={form.phone} onChange={handleField} placeholder="Phone (optional)" className={inputClasses} />
                                    <input name="address1" value={form.address1} onChange={handleField} placeholder="Street address" className={inputClasses} />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input name="city" value={form.city} onChange={handleField} placeholder="City" className={inputClasses} />
                                        <input name="zip" value={form.zip} onChange={handleField} placeholder="ZIP / Postal code" className={inputClasses} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input name="provinceCode" value={form.provinceCode} onChange={handleField} placeholder="State code (NY)" className={inputClasses} />
                                        <input name="countryCode" value={form.countryCode} onChange={handleField} maxLength={2} placeholder="Country (US)" className={inputClasses} />
                                    </div>

                                    <button
                                        onClick={() => getQuote()}
                                        disabled={!formValid || quoting}
                                        className="flex w-full items-center justify-center gap-2 rounded-full border border-plum-dark/20 py-2.5 text-sm text-plum-dark transition-colors hover:bg-plum-dark/5 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {quoting ? <Loader2 size={15} className="animate-spin" /> : <Truck size={15} />}
                                        Get shipping rates
                                    </button>

                                    {quote && (
                                        <div className="space-y-3">
                                            {quote.rates.length === 0 ? (
                                                <p className="rounded-2xl bg-[#C9A96E]/15 p-3 text-xs text-plum-dark">
                                                    No shipping rates for this address. Check Settings → Shipping and delivery in
                                                    Shopify. You can still create the checkout without shipping.
                                                </p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {quote.rates.map(rate => (
                                                        <label
                                                            key={rate.handle}
                                                            className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 text-sm transition-colors ${
                                                                selectedRate === rate.handle
                                                                    ? 'border-plum-dark bg-plum-dark/5'
                                                                    : 'border-plum-dark/15'
                                                            }`}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <input
                                                                    type="radio"
                                                                    name="rate"
                                                                    checked={selectedRate === rate.handle}
                                                                    onChange={() => getQuote(rate.handle)}
                                                                    className="accent-[#3D1028]"
                                                                />
                                                                {rate.title}
                                                            </span>
                                                            <span>{money(rate.amount, rate.currencyCode)}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="space-y-1 border-t border-plum-dark/10 pt-3 text-sm text-plum-dark">
                                                <div className="flex justify-between"><span>Subtotal</span><span>{money(quote.subtotal, quote.currency)}</span></div>
                                                <div className="flex justify-between"><span>Shipping</span><span>{money(quote.shipping, quote.currency)}</span></div>
                                                <div className="flex justify-between"><span>Tax</span><span>{money(quote.tax, quote.currency)}</span></div>
                                                <div className="flex justify-between font-medium"><span>Total</span><span>{money(quote.total, quote.currency)}</span></div>
                                            </div>

                                            <button
                                                onClick={pay}
                                                disabled={!canPay}
                                                className="flex w-full items-center justify-center gap-2 rounded-full bg-plum-dark py-3 text-sm text-cream transition-colors hover:bg-plum-dark/90 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                {paying ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                                                {paying ? 'Redirecting…' : 'Pay on Shopify'}
                                            </button>
                                        </div>
                                    )}

                                    {checkoutError && <p className="text-sm text-[#C9614E]">{checkoutError}</p>}
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}