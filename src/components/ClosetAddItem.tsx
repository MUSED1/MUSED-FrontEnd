// components/ClosetAddItem.tsx
//
// "Add a piece" to the personal closet — mirrors the mobile app's
// app/listing.tsx. The moment a photo is attached, it's sent to
// POST /clothing/analyze-photo and the AI's guess pre-fills category/
// name/colors/style as editable fields — the user is confirming what
// the app sees, not filling a blank form. Submits a wardrobe-only
// payload to POST /clothing (no price/currency/stock/listingType —
// those are marketplace-only fields this flow never shows).
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sparkles, Upload, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { API_CONFIG, compressImage } from '../utils/api';

const CATEGORIES = ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories', 'Shoes', 'Bags', 'Jewelry', 'Skirts', 'Vests', 'Others'];
const NO_SIZE_RUN = new Set(['Accessories', 'Bags', 'Jewelry', 'Shoes', 'Others']);
const SIZE_SYSTEMS = ['S/M/L', 'UK', 'US', 'EU'] as const;
const SIZES_BY_SYSTEM: Record<string, string[]> = {
    'S/M/L': ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    UK: ['4', '6', '8', '10', '12', '14', '16', '18'],
    US: ['0', '2', '4', '6', '8', '10', '12', '14'],
    EU: ['32', '34', '36', '38', '40', '42', '44', '46'],
};
const SEASONS = [
    { value: 'all', label: 'All year' },
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
    { value: 'fall', label: 'Fall' },
    { value: 'winter', label: 'Winter' },
];

function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Could not read that file'));
        reader.readAsDataURL(file);
    });
}

export function ClosetAddItem() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login', { state: { from: '/closet/add' } });
        }
    }, [isAuthenticated, authLoading, navigate]);

    const [photos, setPhotos] = useState<string[]>([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzed, setAnalyzed] = useState(false);

    const [category, setCategory] = useState('');
    const [sizeSystem, setSizeSystem] = useState<string>('S/M/L');
    const [size, setSize] = useState('');
    const [season, setSeason] = useState('all');
    const [productName, setProductName] = useState('');
    const [brand, setBrand] = useState('');
    const [colors, setColors] = useState('');
    const [styleTags, setStyleTags] = useState('');
    const [notes, setNotes] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };

    const runAnalyze = async (dataUrl: string) => {
        setAnalyzing(true);
        try {
            const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.clothingAnalyze}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ image: dataUrl }),
            });
            const result = await res.json();
            if (result.success && result.data) {
                const tags = result.data as { category?: string; suggestedName?: string; colors?: string[]; style?: string };
                if (tags.category && !category) setCategory(tags.category);
                if (tags.suggestedName && !productName) setProductName(tags.suggestedName);
                if (tags.colors?.length && !colors) setColors(tags.colors.join(', '));
                if (tags.style && !styleTags) setStyleTags(tags.style);
                setAnalyzed(true);
            }
        } catch {
            // Best-effort only — the form just stays blank for the user to fill in.
        } finally {
            setAnalyzing(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 8 * 1024 * 1024) {
            setError('File too large. Maximum size is 8MB.');
            return;
        }
        setError('');
        try {
            const dataUrl = await fileToDataUrl(file);
            const base64 = dataUrl.split(',')[1] || dataUrl;
            const compressed = await compressImage(base64);
            const compressedUrl = `data:image/jpeg;base64,${compressed}`;
            const isFirst = photos.length === 0;
            setPhotos((prev) => [...prev, compressedUrl].slice(0, 5));
            if (isFirst) runAnalyze(compressedUrl);
        } catch {
            setError('Could not process that photo. Try a different image.');
        }
        e.target.value = '';
    };

    const removePhoto = (index: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const sizeOptions = NO_SIZE_RUN.has(category) ? ['One Size'] : SIZES_BY_SYSTEM[sizeSystem] || [];
    const canSubmit = photos.length > 0 && category && (size || sizeOptions.length === 0) && !submitting;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        setError('');
        try {
            const body = {
                userInfo: {
                    fullName: user?.name || '',
                    email: user?.email || '',
                    phoneNumber: user?.phone || '',
                },
                clothingItems: [
                    {
                        images: photos,
                        category,
                        sizeSystem,
                        size: size || 'One Size',
                        season,
                        productName: productName.trim() || undefined,
                        brand: brand.trim() || undefined,
                        additionalInfo: notes.trim() || undefined,
                        colors: colors.split(',').map((c) => c.trim()).filter(Boolean),
                        styleTags: styleTags.split(',').map((s) => s.trim()).filter(Boolean),
                    },
                ],
            };

            const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.clothing}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(body),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                navigate('/closet');
            } else {
                throw new Error(result.message || 'Failed to add this piece');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add this piece');
        } finally {
            setSubmitting(false);
        }
    };

    const chipButton = (active: boolean) =>
        `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            active ? 'bg-plum-dark text-cream' : 'bg-white/60 text-plum/70 border border-white/60 hover:bg-white'
        }`;

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-cream pt-28 pb-20 sm:pt-32">
                <div className="container mx-auto max-w-2xl px-4">
                    <div className="mb-8">
                        <Link to="/closet" className="text-sm text-plum/60 hover:text-burgundy transition-colors">
                            ← Back to Closet
                        </Link>
                        <h1 className="mt-3 font-kaldera font-normal text-3xl text-plum-dark sm:text-4xl">
                            Add a Piece
                        </h1>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-2xl border border-[#C9614E]/25 bg-[#C9614E]/8 px-5 py-4 text-sm text-[#C9614E]">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6 rounded-3xl bg-white/60 backdrop-blur-md border border-white/60 p-6 sm:p-8 shadow-[0_2px_10px_rgba(93,27,58,0.06)]">
                        {/* Photos */}
                        <div>
                            <label className="block text-sm font-medium text-plum/80 mb-2">Photos</label>
                            <div className="flex flex-wrap gap-3">
                                {photos.map((photo, i) => (
                                    <div key={i} className="relative h-24 w-24 rounded-2xl overflow-hidden">
                                        <img src={photo} alt="" className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(i)}
                                            className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {photos.length < 5 && (
                                    <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-plum/20 text-plum/40 hover:border-plum/40 hover:text-plum/60 transition-colors">
                                        <Upload size={20} />
                                        <span className="text-[10px]">Add photo</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                                    </label>
                                )}
                            </div>
                            {analyzing && (
                                <p className="mt-3 flex items-center gap-2 text-sm text-plum/60">
                                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-plum/30 border-t-plum" />
                                    Reading your piece…
                                </p>
                            )}
                            {analyzed && !analyzing && (
                                <p className="mt-3 flex items-center gap-2 text-sm text-plum/60">
                                    <Sparkles size={14} className="text-[#C9A96E]" />
                                    Pre-filled from your photo — tweak anything below.
                                </p>
                            )}
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-plum/80 mb-2">Name (optional)</label>
                            <input
                                type="text"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="e.g. Black cropped blazer"
                                className="w-full px-5 py-3 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl text-plum placeholder-plum/40 focus:outline-none focus:ring-2 focus:ring-plum/25"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-plum/80 mb-2">Category</label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => { setCategory(cat); setSize(''); }}
                                        className={chipButton(category === cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Size system + size */}
                        {!NO_SIZE_RUN.has(category) && (
                            <div>
                                <label className="block text-sm font-medium text-plum/80 mb-2">Sizing system</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {SIZE_SYSTEMS.map((sys) => (
                                        <button
                                            key={sys}
                                            type="button"
                                            onClick={() => { setSizeSystem(sys); setSize(''); }}
                                            className={chipButton(sizeSystem === sys)}
                                        >
                                            {sys}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-plum/80 mb-2">Size</label>
                            <div className="flex flex-wrap gap-2">
                                {sizeOptions.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setSize(s)}
                                        className={chipButton(size === s)}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Season */}
                        <div>
                            <label className="block text-sm font-medium text-plum/80 mb-2">Season</label>
                            <div className="flex flex-wrap gap-2">
                                {SEASONS.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setSeason(value)}
                                        className={chipButton(season === value)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Brand */}
                        <div>
                            <label className="block text-sm font-medium text-plum/80 mb-2">Brand (optional)</label>
                            <input
                                type="text"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                className="w-full px-5 py-3 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl text-plum placeholder-plum/40 focus:outline-none focus:ring-2 focus:ring-plum/25"
                            />
                        </div>

                        {/* Colors */}
                        <div>
                            <label className="block text-sm font-medium text-plum/80 mb-2">Colours</label>
                            <input
                                type="text"
                                value={colors}
                                onChange={(e) => setColors(e.target.value)}
                                placeholder="black, cream"
                                className="w-full px-5 py-3 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl text-plum placeholder-plum/40 focus:outline-none focus:ring-2 focus:ring-plum/25"
                            />
                            <p className="mt-1.5 text-xs text-plum/50">Separate with commas</p>
                        </div>

                        {/* Style tags */}
                        <div>
                            <label className="block text-sm font-medium text-plum/80 mb-2">Style</label>
                            <input
                                type="text"
                                value={styleTags}
                                onChange={(e) => setStyleTags(e.target.value)}
                                placeholder="minimalist, tailored"
                                className="w-full px-5 py-3 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl text-plum placeholder-plum/40 focus:outline-none focus:ring-2 focus:ring-plum/25"
                            />
                            <p className="mt-1.5 text-xs text-plum/50">Separate with commas</p>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-plum/80 mb-2">Notes (optional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full px-5 py-3 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl text-plum placeholder-plum/40 focus:outline-none focus:ring-2 focus:ring-plum/25 resize-y"
                            />
                        </div>

                        <div className="rounded-full shadow-[0_8px_16px_rgba(61,16,40,0.18)]">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!canSubmit}
                                className="w-full rounded-full bg-gradient-to-b from-plum-dark to-plum px-6 py-4 text-base font-normal text-cream disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:brightness-110 active:scale-[0.98]"
                            >
                                {submitting ? 'Adding to your closet…' : 'Add to Closet'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
