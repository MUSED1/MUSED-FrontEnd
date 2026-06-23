// components/WishlistHK.tsx
import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Ruler, Heart, Loader2, CheckCircle, ArrowRight, X } from 'lucide-react';
import axios from 'axios';

const IMAGES = [
    'https://res.cloudinary.com/dapfjngt2/image/upload/v1782188416/WhatsApp_Image_2026-06-22_at_10.12.06_PM_sv79dj.jpg',
    'https://res.cloudinary.com/dapfjngt2/image/upload/v1782188416/WhatsApp_Image_2026-06-22_at_10.12.06_PM_1_gkkxir.jpg',
];


interface WishlistFormData {
    fullName: string;
    email: string;
    phoneNumber: string;
    deliveryAddress: string;
    size: string;
}

export function WishlistHK() {
    const { isAuthenticated, loading: authLoading, user } = useAuth();
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

    const [activeImage, setActiveImage] = useState(0);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect to login if not authenticated (same pattern as CollectionsHK)
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login?redirect=/wishlist-hk');
        }
    }, [isAuthenticated, authLoading, navigate]);

    const [formData, setFormData] = useState<WishlistFormData>({
        fullName: '',
        email: '',
        phoneNumber: '',
        deliveryAddress: '',
        size: '',
    });

    // Pre-fill from logged-in user
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.name || '',
                email: user.email || '',
                phoneNumber: user.phone || '',
            }));
        }
    }, [user]);

    // Auto-cycle hero images
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveImage(i => (i + 1) % IMAGES.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/wishlist`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSubmitted(true);
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-plum" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream font-sans">
            <Header />

            {/* ── Hero ── */}
            <section className="relative h-[70vh] min-h-[520px] overflow-hidden">
                {IMAGES.map((src, i) => (
                    <img
                        key={src}
                        src={src}
                        alt="MUSED HK collection"
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 cursor-pointer ${
                            i === activeImage ? 'opacity-100' : 'opacity-0'
                        }`}
                        onClick={() => setLightboxImage(src)}
                    />
                ))}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-plum/40 via-plum/20 to-cream" />

                {/* Dots */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                    {IMAGES.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveImage(i)}
                            className={`w-2 h-2 rounded-full transition-all ${
                                i === activeImage ? 'bg-cream w-6' : 'bg-cream/50'
                            }`}
                        />
                    ))}
                </div>

                {/* Hero text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pb-16">
                    <p className="font-abril text-cream/80 text-lg italic mb-2 tracking-wide">
                        you've been waiting —
                    </p>
                    <h1 className="font-kaldera text-cream text-5xl md:text-7xl tracking-widest leading-none mb-4">
                        WISHLIST
                    </h1>
                    <p className="text-cream/70 text-sm tracking-[0.25em] uppercase">
                        Hong Kong · Next Collection
                    </p>
                </div>
            </section>

            {/* ── Body copy ── */}
            <section className="max-w-2xl mx-auto px-6 py-12 text-center">
                <div className="w-12 h-px bg-plum/30 mx-auto mb-8" />
                <p className="text-plum/80 text-lg leading-relaxed mb-4">
                    Our next Hong Kong collection is being curated. Join the wishlist and we'll
                    reach out first when it drops — with priority access to the pieces you love.
                </p>
                <p className="text-plum/50 text-sm tracking-wide">
                    Leave your details below and we'll be in touch.
                </p>
                <div className="w-12 h-px bg-plum/30 mx-auto mt-8" />
            </section>

            {/* ── Form ── */}
            <section className="max-w-xl mx-auto px-6 pb-20">
                {submitted ? (
                    <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h2 className="font-kaldera text-plum text-3xl tracking-widest mb-3">
                            You're on the list
                        </h2>
                        <p className="text-plum/70 leading-relaxed mb-8">
                            We'll be in touch when the next HK collection is ready. Keep an eye on your inbox — and your wardrobe.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-2 bg-plum text-cream px-8 py-3 rounded-full text-sm tracking-widest uppercase hover:bg-plum-dark transition-all"
                        >
                            Back to MUSED <ArrowRight size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                        {/* Card header */}
                        <div className="bg-gradient-to-r from-plum to-bordeaux px-8 py-6 text-center">
                            <Heart className="w-6 h-6 text-cream/60 mx-auto mb-2" />
                            <h2 className="font-kaldera text-cream text-2xl tracking-[0.2em]">
                                {isAuthenticated ? `Hello, ${user?.name?.split(' ')[0]}` : 'Join the wishlist'}
                            </h2>
                            {!isAuthenticated && (
                                <p className="text-cream/60 text-xs mt-1 tracking-wide">
                                    Sign in or fill in your details below
                                </p>
                            )}
                        </div>



                        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">

                            {/* Full name */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-semibold text-plum/60 uppercase tracking-widest mb-2">
                                    <User size={12} /> Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Your full name"
                                    className="w-full px-4 py-3 border border-plum/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-plum/30 text-plum bg-cream/40 placeholder-plum/30"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-semibold text-plum/60 uppercase tracking-widest mb-2">
                                    <Mail size={12} /> Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-3 border border-plum/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-plum/30 text-plum bg-cream/40 placeholder-plum/30"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-semibold text-plum/60 uppercase tracking-widest mb-2">
                                    <Phone size={12} /> Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    required
                                    placeholder="+852 ···"
                                    className="w-full px-4 py-3 border border-plum/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-plum/30 text-plum bg-cream/40 placeholder-plum/30"
                                />
                            </div>

                            {/* Delivery address */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-semibold text-plum/60 uppercase tracking-widest mb-2">
                                    <MapPin size={12} /> Delivery Address *
                                </label>
                                <textarea
                                    name="deliveryAddress"
                                    value={formData.deliveryAddress}
                                    onChange={handleChange}
                                    required
                                    rows={3}
                                    placeholder="Your Hong Kong delivery address"
                                    className="w-full px-4 py-3 border border-plum/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-plum/30 text-plum bg-cream/40 placeholder-plum/30 resize-none"
                                />
                            </div>

                            {/* Size */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-semibold text-plum/60 uppercase tracking-widest mb-2">
                                    <Ruler size={12} /> Size *
                                </label>
                                <select
                                    name="size"
                                    value={formData.size}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-plum/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-plum/30 text-plum bg-cream/40"
                                >
                                    <option value="">Select your size</option>
                                    <optgroup label="S / M / L">
                                        {['XXS','XS','S','M','L','XL','XXL'].map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="UK / US">
                                        {['0','2','4','6','8','10','12','14','16'].map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="EU">
                                        {['32','34','36','38','40','42','44','46'].map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </optgroup>
                                    <option value="One Size">One Size</option>
                                </select>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-plum to-bordeaux text-cream py-4 rounded-xl font-semibold tracking-widest uppercase text-sm hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Joining…
                                    </>
                                ) : (
                                    <>
                                        <Heart size={16} />
                                        Join the Wishlist
                                    </>
                                )}
                            </button>

                        </form>
                    </div>
                )}
            </section>

            <Footer />

            {/* ── Lightbox ── */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm cursor-zoom-out"
                    onClick={() => setLightboxImage(null)}
                >
                    <button
                        className="absolute top-5 right-5 z-10 text-white/70 hover:text-white transition-colors bg-black/40 rounded-full p-1"
                        onClick={() => setLightboxImage(null)}
                        aria-label="Close"
                    >
                        <X size={28} />
                    </button>
                    <img
                        src={lightboxImage}
                        alt="MUSED HK"
                        className="max-h-screen max-w-full w-auto h-auto object-contain"
                        style={{ maxHeight: '100dvh', maxWidth: '100dvw' }}
                        onClick={() => setLightboxImage(null)}
                    />
                </div>
            )}
        </div>
    );
}