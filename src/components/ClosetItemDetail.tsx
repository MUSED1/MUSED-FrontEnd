// components/ClosetItemDetail.tsx
//
// View/edit a single closet item — mirrors the mobile app's
// app/item/[id].tsx. Photos aren't editable here (same constraint as
// mobile — the backend's PUT /clothing/:id doesn't accept an images
// field on this route).
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { MessageCircle, Trash2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_CONFIG } from '../utils/api';

const CATEGORIES = ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories', 'Shoes', 'Bags', 'Jewelry', 'Skirts', 'Vests', 'Others'];
const SEASONS = [
    { value: 'all', label: 'All year' },
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
    { value: 'fall', label: 'Fall' },
    { value: 'winter', label: 'Winter' },
];

interface ClosetItemDoc {
    _id: string;
    productName?: string;
    brand?: string;
    category: string;
    size: string;
    sizeSystem: string;
    season?: string;
    colors?: string[];
    styleTags?: string[];
    additionalInfo?: string;
    images: string[];
}

export function ClosetItemDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [item, setItem] = useState<ClosetItemDoc | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [photoIndex, setPhotoIndex] = useState(0);

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        productName: '', brand: '', category: '', season: 'all',
        colors: '', styleTags: '', additionalInfo: '',
    });

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };

    useEffect(() => {
        if (!id) return;
        const load = async () => {
            try {
                const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.clothing}/${id}`);
                const result = await res.json();
                if (res.ok && result.success) {
                    const doc: ClosetItemDoc = result.data;
                    setItem(doc);
                    setForm({
                        productName: doc.productName || '',
                        brand: doc.brand || '',
                        category: doc.category,
                        season: doc.season || 'all',
                        colors: (doc.colors || []).join(', '),
                        styleTags: (doc.styleTags || []).join(', '),
                        additionalInfo: doc.additionalInfo || '',
                    });
                } else {
                    throw new Error(result.message || 'Could not find this piece');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Could not find this piece');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleSave = async () => {
        if (!id) return;
        setSaving(true);
        setError('');
        try {
            const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.clothing}/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    productName: form.productName.trim() || undefined,
                    brand: form.brand.trim() || undefined,
                    category: form.category,
                    season: form.season,
                    colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
                    styleTags: form.styleTags.split(',').map((s) => s.trim()).filter(Boolean),
                    additionalInfo: form.additionalInfo.trim() || undefined,
                }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setItem(result.data);
                setEditing(false);
            } else {
                throw new Error(result.message || 'Could not save changes');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save changes');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        if (!window.confirm('Remove this piece from your closet? This can\'t be undone.')) return;
        try {
            const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.clothing}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                navigate('/closet');
            } else {
                throw new Error(result.message || 'Could not delete this piece');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not delete this piece');
        }
    };

    if (loading) {
        return (
            <div className="font-sans">
                <Header />
                <main className="min-h-screen bg-cream pt-28 pb-16 sm:pt-32">
                    <div className="container mx-auto max-w-2xl px-4 text-center py-20">
                        <div className="w-8 h-8 border-2 border-plum border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!item) {
        return (
            <div className="font-sans">
                <Header />
                <main className="min-h-screen bg-cream pt-28 pb-16 sm:pt-32">
                    <div className="container mx-auto max-w-2xl px-4 text-center py-20">
                        <p className="text-plum/60">{error || 'This piece could not be found.'}</p>
                        <Link to="/closet" className="mt-4 inline-block text-burgundy hover:text-gold">← Back to Closet</Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const chipButton = (active: boolean) =>
        `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            active ? 'bg-plum-dark text-cream' : 'bg-white/60 text-plum/70 border border-white/60 hover:bg-white'
        }`;

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-cream pt-28 pb-20 sm:pt-32">
                <div className="container mx-auto max-w-2xl px-4">
                    <Link to="/closet" className="text-sm text-plum/60 hover:text-burgundy transition-colors">
                        ← Back to Closet
                    </Link>

                    {error && (
                        <div className="mt-4 rounded-2xl border border-[#C9614E]/25 bg-[#C9614E]/8 px-5 py-4 text-sm text-[#C9614E]">
                            {error}
                        </div>
                    )}

                    {/* Photo gallery */}
                    <div className="relative mt-6 aspect-square overflow-hidden rounded-3xl bg-plum-dark/5">
                        <img
                            src={item.images[photoIndex]}
                            alt={item.productName || item.category}
                            className="h-full w-full object-cover"
                        />
                        {item.images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setPhotoIndex((i) => (i === 0 ? item.images.length - 1 : i - 1))}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-plum-dark"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={() => setPhotoIndex((i) => (i === item.images.length - 1 ? 0 : i + 1))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-plum-dark"
                                >
                                    <ChevronRight size={18} />
                                </button>
                                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                                    {item.images.map((_, i) => (
                                        <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === photoIndex ? 'bg-white' : 'bg-white/40'}`} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-6 rounded-3xl bg-white/60 backdrop-blur-md border border-white/60 p-6 sm:p-8 shadow-[0_2px_10px_rgba(93,27,58,0.06)]">
                        {!editing ? (
                            <>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h1 className="font-kaldera font-normal text-2xl text-plum-dark">
                                            {item.productName || item.category}
                                        </h1>
                                        <p className="mt-1 text-sm text-plum/60">
                                            {item.category} · {item.size} ({item.sizeSystem}) · {SEASONS.find((s) => s.value === item.season)?.label || 'All year'}
                                        </p>
                                        {item.brand && <p className="mt-1 text-sm text-plum/50">{item.brand}</p>}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditing(true)} className="rounded-full bg-plum/8 p-2.5 text-plum-dark hover:bg-plum/15 transition-colors">
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={handleDelete} className="rounded-full bg-[#C9614E]/10 p-2.5 text-[#C9614E] hover:bg-[#C9614E]/20 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {(item.colors?.length || item.styleTags?.length) ? (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {(item.colors || []).map((c) => (
                                            <span key={c} className="rounded-full bg-plum/8 px-3 py-1 text-xs text-plum-dark">{c}</span>
                                        ))}
                                        {(item.styleTags || []).map((s) => (
                                            <span key={s} className="rounded-full bg-[#C9A96E]/15 px-3 py-1 text-xs text-plum-dark">{s}</span>
                                        ))}
                                    </div>
                                ) : null}

                                {item.additionalInfo && (
                                    <p className="mt-4 text-sm text-plum/70">{item.additionalInfo}</p>
                                )}

                                <Link
                                    to="/style-check"
                                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-plum/20 px-5 py-2.5 text-sm font-medium text-plum-dark hover:bg-plum/5 transition-colors"
                                >
                                    <MessageCircle size={16} />
                                    Ask M about this piece
                                </Link>
                            </>
                        ) : (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-plum/80 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={form.productName}
                                        onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))}
                                        className="w-full px-5 py-3 bg-white/50 border border-white/60 rounded-2xl text-plum focus:outline-none focus:ring-2 focus:ring-plum/25"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-plum/80 mb-2">Category</label>
                                    <div className="flex flex-wrap gap-2">
                                        {CATEGORIES.map((cat) => (
                                            <button key={cat} type="button" onClick={() => setForm((f) => ({ ...f, category: cat }))} className={chipButton(form.category === cat)}>
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-plum/80 mb-2">Season</label>
                                    <div className="flex flex-wrap gap-2">
                                        {SEASONS.map(({ value, label }) => (
                                            <button key={value} type="button" onClick={() => setForm((f) => ({ ...f, season: value }))} className={chipButton(form.season === value)}>
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-plum/80 mb-2">Brand</label>
                                    <input
                                        type="text"
                                        value={form.brand}
                                        onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                                        className="w-full px-5 py-3 bg-white/50 border border-white/60 rounded-2xl text-plum focus:outline-none focus:ring-2 focus:ring-plum/25"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-plum/80 mb-2">Colours</label>
                                    <input
                                        type="text"
                                        value={form.colors}
                                        onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))}
                                        className="w-full px-5 py-3 bg-white/50 border border-white/60 rounded-2xl text-plum focus:outline-none focus:ring-2 focus:ring-plum/25"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-plum/80 mb-2">Style</label>
                                    <input
                                        type="text"
                                        value={form.styleTags}
                                        onChange={(e) => setForm((f) => ({ ...f, styleTags: e.target.value }))}
                                        className="w-full px-5 py-3 bg-white/50 border border-white/60 rounded-2xl text-plum focus:outline-none focus:ring-2 focus:ring-plum/25"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-plum/80 mb-2">Notes</label>
                                    <textarea
                                        value={form.additionalInfo}
                                        onChange={(e) => setForm((f) => ({ ...f, additionalInfo: e.target.value }))}
                                        rows={3}
                                        className="w-full px-5 py-3 bg-white/50 border border-white/60 rounded-2xl text-plum focus:outline-none focus:ring-2 focus:ring-plum/25 resize-y"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setEditing(false)}
                                        className="flex-1 rounded-full border border-plum/20 py-3 text-sm font-medium text-plum-dark hover:bg-plum/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 rounded-full bg-gradient-to-b from-plum-dark to-plum py-3 text-sm font-medium text-cream disabled:opacity-50 transition-all hover:brightness-110"
                                    >
                                        {saving ? 'Saving…' : 'Save changes'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
