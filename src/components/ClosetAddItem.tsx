// components/ClosetAddItem.tsx
//
// "Add a piece" to the personal closet — mirrors the mobile app's
// app/listing.tsx, plus a multi-item extraction step this web version
// adds on top. The moment the first photo is attached, it's sent to
// POST /clothing/analyze-photo (single-item tags) AND POST
// /clothing/detect-items (multi-item detection) in parallel:
//   - If detect-items finds 0 or 1 item, nothing changes — the normal
//     single-item form below fills in from analyze-photo, exactly as
//     before.
//   - If it finds 2+, we switch into an "extract pieces" flow: the
//     photo is shown with a draggable/resizable crop box (react-image-
//     crop), pre-positioned from the AI's proposed box for each item in
//     turn. The AI's box is a starting point, not a pixel-perfect
//     segmentation — the user always confirms/adjusts before a piece is
//     cropped out. Once all detected items are processed, every cropped
//     piece is submitted in one POST /clothing call (its `clothingItems`
//     array already supports more than one entry).
//
// Either way, this only ever submits a wardrobe-only payload (no price/
// currency/stock/listingType — those are marketplace-only fields this
// flow never shows).
import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sparkles, Upload, X, Trash2, ArrowRight, SkipForward } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { API_CONFIG, compressImage, convertHeicIfNeeded } from '../utils/api';

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

const chipButton = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active ? 'bg-plum-dark text-cream' : 'bg-white/60 text-plum/70 border border-white/60 hover:bg-white'
    }`;

function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Could not read that file'));
        reader.readAsDataURL(file);
    });
}

interface PieceFields {
    category: string;
    sizeSystem: string;
    size: string;
    season: string;
    productName: string;
    brand: string;
    colors: string;
    styleTags: string;
    notes: string;
}

const emptyPieceFields = (): PieceFields => ({
    category: '', sizeSystem: 'S/M/L', size: '', season: 'all',
    productName: '', brand: '', colors: '', styleTags: '', notes: '',
});

interface DetectedItem {
    category?: string;
    suggestedName?: string;
    colors?: string[];
    style?: string;
    box?: { x: number; y: number; width: number; height: number };
}

interface Piece extends PieceFields {
    id: string;
    image: string;
}

// Shared field block — used once for the single-item path, and once per
// extracted piece in the multi-item review list.
function PieceFieldsBlock({ values, onChange }: { values: PieceFields; onChange: (patch: Partial<PieceFields>) => void }) {
    const sizeOptions = NO_SIZE_RUN.has(values.category) ? ['One Size'] : SIZES_BY_SYSTEM[values.sizeSystem] || [];

    return (
        <>
            <div>
                <label className="block text-sm font-medium text-plum/80 mb-2">Name (optional)</label>
                <input
                    type="text"
                    value={values.productName}
                    onChange={(e) => onChange({ productName: e.target.value })}
                    placeholder="e.g. Black cropped blazer"
                    className="w-full px-5 py-3 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl text-plum placeholder-plum/40 focus:outline-none focus:ring-2 focus:ring-plum/25"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-plum/80 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => onChange({ category: cat, size: '' })}
                            className={chipButton(values.category === cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {!NO_SIZE_RUN.has(values.category) && (
                <div>
                    <label className="block text-sm font-medium text-plum/80 mb-2">Sizing system</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {SIZE_SYSTEMS.map((sys) => (
                            <button
                                key={sys}
                                type="button"
                                onClick={() => onChange({ sizeSystem: sys, size: '' })}
                                className={chipButton(values.sizeSystem === sys)}
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
                            onClick={() => onChange({ size: s })}
                            className={chipButton(values.size === s)}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-plum/80 mb-2">Season</label>
                <div className="flex flex-wrap gap-2">
                    {SEASONS.map(({ value, label }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => onChange({ season: value })}
                            className={chipButton(values.season === value)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-plum/80 mb-2">Brand (optional)</label>
                <input
                    type="text"
                    value={values.brand}
                    onChange={(e) => onChange({ brand: e.target.value })}
                    className="w-full px-5 py-3 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl text-plum placeholder-plum/40 focus:outline-none focus:ring-2 focus:ring-plum/25"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-plum/80 mb-2">Colours</label>
                <input
                    type="text"
                    value={values.colors}
                    onChange={(e) => onChange({ colors: e.target.value })}
                    placeholder="black, cream"
                    className="w-full px-5 py-3 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl text-plum placeholder-plum/40 focus:outline-none focus:ring-2 focus:ring-plum/25"
                />
                <p className="mt-1.5 text-xs text-plum/50">Separate with commas</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-plum/80 mb-2">Style</label>
                <input
                    type="text"
                    value={values.styleTags}
                    onChange={(e) => onChange({ styleTags: e.target.value })}
                    placeholder="minimalist, tailored"
                    className="w-full px-5 py-3 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl text-plum placeholder-plum/40 focus:outline-none focus:ring-2 focus:ring-plum/25"
                />
                <p className="mt-1.5 text-xs text-plum/50">Separate with commas</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-plum/80 mb-2">Notes (optional)</label>
                <textarea
                    value={values.notes}
                    onChange={(e) => onChange({ notes: e.target.value })}
                    rows={3}
                    className="w-full px-5 py-3 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl text-plum placeholder-plum/40 focus:outline-none focus:ring-2 focus:ring-plum/25 resize-y"
                />
            </div>
        </>
    );
}

export function ClosetAddItem() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login', { state: { from: '/closet/add' } });
        }
    }, [isAuthenticated, authLoading, navigate]);

    // 'single' — today's normal one-item flow. 'extracting' — stepping
    // through AI-detected items, one crop at a time. 'review' — editing
    // the extracted pieces before submitting them all at once.
    const [stage, setStage] = useState<'single' | 'extracting' | 'review'>('single');

    const [photos, setPhotos] = useState<string[]>([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzed, setAnalyzed] = useState(false);
    const [singleItem, setSingleItem] = useState<PieceFields>(emptyPieceFields());
    const updateSingle = (patch: Partial<PieceFields>) => setSingleItem((prev) => ({ ...prev, ...patch }));

    // Multi-item extraction state
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [outfitId, setOutfitId] = useState<string | null>(null);
    const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
    const [detectIndex, setDetectIndex] = useState(0);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [pieces, setPieces] = useState<Piece[]>([]);
    const imgRef = useRef<HTMLImageElement>(null);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };

    // Reset the crop box to the current item's AI-proposed box whenever we
    // move to a new one.
    useEffect(() => {
        if (stage !== 'extracting') return;
        const box = detectedItems[detectIndex]?.box;
        if (box) {
            setCrop({ unit: '%', x: box.x * 100, y: box.y * 100, width: box.width * 100, height: box.height * 100 });
        } else {
            setCrop({ unit: '%', x: 10, y: 10, width: 80, height: 80 });
        }
    }, [stage, detectIndex, detectedItems]);

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
                setSingleItem((prev) => ({
                    ...prev,
                    category: prev.category || tags.category || prev.category,
                    productName: prev.productName || tags.suggestedName || prev.productName,
                    colors: prev.colors || (tags.colors?.length ? tags.colors.join(', ') : prev.colors),
                    styleTags: prev.styleTags || tags.style || prev.styleTags,
                }));
                setAnalyzed(true);
            }
        } catch {
            // Best-effort only — the form just stays blank for the user to fill in.
        } finally {
            setAnalyzing(false);
        }
    };

    const runDetect = async (dataUrl: string) => {
        try {
            const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.clothingDetectItems}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ image: dataUrl }),
            });
            const result = await res.json();
            const items: DetectedItem[] = result?.data?.items || [];
            if (items.length >= 2) {
                setDetectedItems(items);
                setDetectIndex(0);
                setSourceImage(dataUrl);
                setOutfitId(crypto.randomUUID());
                setStage('extracting');
            }
        } catch {
            // Silent — falls back to the single-item flow above, which already works.
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
            const usableFile = await convertHeicIfNeeded(file);
            const dataUrl = await fileToDataUrl(usableFile);
            const base64 = dataUrl.split(',')[1] || dataUrl;
            const compressed = await compressImage(base64);
            const compressedUrl = `data:image/jpeg;base64,${compressed}`;
            const isFirst = photos.length === 0;
            setPhotos((prev) => [...prev, compressedUrl].slice(0, 5));
            if (isFirst) {
                runAnalyze(compressedUrl);
                runDetect(compressedUrl);
            }
        } catch {
            setError('Could not process that photo. Try a different image.');
        }
        e.target.value = '';
    };

    const removePhoto = (index: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const advanceOrFinish = () => {
        if (detectIndex + 1 < detectedItems.length) {
            setDetectIndex((i) => i + 1);
        } else {
            setStage('review');
        }
    };

    const handleExtractCurrent = () => {
        const img = imgRef.current;
        if (!img || !crop) return;

        // onComplete only fires once the user actually drags the box — if
        // they accept the AI's initial position as-is, fall back to
        // converting the current (percent-based) crop state to pixels
        // ourselves so "Extract" still works without requiring a touch.
        const pixelCrop: PixelCrop =
            completedCrop && completedCrop.width > 0 && completedCrop.height > 0
                ? completedCrop
                : {
                      unit: 'px',
                      x: (crop.x / 100) * img.width,
                      y: (crop.y / 100) * img.height,
                      width: (crop.width / 100) * img.width,
                      height: (crop.height / 100) * img.height,
                  };
        if (!pixelCrop.width || !pixelCrop.height) return;

        const scaleX = img.naturalWidth / img.width;
        const scaleY = img.naturalHeight / img.height;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(pixelCrop.width * scaleX);
        canvas.height = Math.round(pixelCrop.height * scaleY);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(
            img,
            pixelCrop.x * scaleX, pixelCrop.y * scaleY,
            pixelCrop.width * scaleX, pixelCrop.height * scaleY,
            0, 0, canvas.width, canvas.height
        );
        const croppedUrl = canvas.toDataURL('image/jpeg', 0.9);

        const detected = detectedItems[detectIndex] || {};
        setPieces((prev) => [
            ...prev,
            {
                id: `piece-${Date.now()}-${detectIndex}`,
                image: croppedUrl,
                ...emptyPieceFields(),
                category: detected.category && CATEGORIES.includes(detected.category) ? detected.category : '',
                productName: detected.suggestedName || '',
                colors: detected.colors?.length ? detected.colors.join(', ') : '',
                styleTags: detected.style || '',
            },
        ]);
        advanceOrFinish();
    };

    const updatePiece = (id: string, patch: Partial<PieceFields>) => {
        setPieces((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    };
    const removePiece = (id: string) => {
        setPieces((prev) => prev.filter((p) => p.id !== id));
    };

    const singleSizeOptions = NO_SIZE_RUN.has(singleItem.category) ? ['One Size'] : SIZES_BY_SYSTEM[singleItem.sizeSystem] || [];
    const canSubmitSingle = photos.length > 0 && singleItem.category && (singleItem.size || singleSizeOptions.length === 0) && !submitting;

    const canSubmitPieces =
        pieces.length > 0 &&
        pieces.every((p) => p.category && (p.size || NO_SIZE_RUN.has(p.category))) &&
        !submitting;

    const handleSubmitSingle = async () => {
        if (!canSubmitSingle) return;
        setSubmitting(true);
        setError('');
        try {
            const body = {
                userInfo: { fullName: user?.name || '', email: user?.email || '', phoneNumber: user?.phone || '' },
                clothingItems: [
                    {
                        images: photos,
                        category: singleItem.category,
                        sizeSystem: singleItem.sizeSystem,
                        size: singleItem.size || 'One Size',
                        season: singleItem.season,
                        productName: singleItem.productName.trim() || undefined,
                        brand: singleItem.brand.trim() || undefined,
                        additionalInfo: singleItem.notes.trim() || undefined,
                        colors: singleItem.colors.split(',').map((c) => c.trim()).filter(Boolean),
                        styleTags: singleItem.styleTags.split(',').map((s) => s.trim()).filter(Boolean),
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

    const handleSubmitPieces = async () => {
        if (!canSubmitPieces) return;
        setSubmitting(true);
        setError('');
        try {
            const body = {
                userInfo: { fullName: user?.name || '', email: user?.email || '', phoneNumber: user?.phone || '' },
                clothingItems: pieces.map((p) => ({
                    // Cropped piece in both slots — index 0 becomes the AI
                    // ghost-mannequin cover photo, index 1 stays the plain
                    // cropped photo (the backend skips the AI transform for
                    // outfit pieces past index 0). The shared full outfit
                    // photo goes in outfitSourceImage instead, so a piece's
                    // own gallery shows itself, not the whole outfit.
                    images: sourceImage ? [p.image, p.image] : [p.image],
                    outfitId,
                    outfitSourceImage: outfitId ? sourceImage : undefined,
                    category: p.category,
                    sizeSystem: p.sizeSystem,
                    size: p.size || 'One Size',
                    season: p.season,
                    productName: p.productName.trim() || undefined,
                    brand: p.brand.trim() || undefined,
                    additionalInfo: p.notes.trim() || undefined,
                    colors: p.colors.split(',').map((c) => c.trim()).filter(Boolean),
                    styleTags: p.styleTags.split(',').map((s) => s.trim()).filter(Boolean),
                })),
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
                throw new Error(result.message || 'Failed to add these pieces');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add these pieces');
        } finally {
            setSubmitting(false);
        }
    };

    const currentDetected = detectedItems[detectIndex];

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
                            {stage === 'single' ? 'Add a Piece' : stage === 'extracting' ? 'Extract Pieces' : `Review ${pieces.length} Piece${pieces.length === 1 ? '' : 's'}`}
                        </h1>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-2xl border border-[#C9614E]/25 bg-[#C9614E]/8 px-5 py-4 text-sm text-[#C9614E]">
                            {error}
                        </div>
                    )}

                    {/* ---------- SINGLE ITEM (default) ---------- */}
                    {stage === 'single' && (
                        <div className="space-y-6 rounded-3xl bg-white/60 backdrop-blur-md border border-white/60 p-6 sm:p-8 shadow-[0_2px_10px_rgba(93,27,58,0.06)]">
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
                                        Pre-filled from your photo — tweak anything below. Multiple pieces in this photo? Give it a second — we'll offer to split them out.
                                    </p>
                                )}
                            </div>

                            <PieceFieldsBlock values={singleItem} onChange={updateSingle} />

                            <div className="rounded-full shadow-[0_8px_16px_rgba(61,16,40,0.18)]">
                                <button
                                    type="button"
                                    onClick={handleSubmitSingle}
                                    disabled={!canSubmitSingle}
                                    className="w-full rounded-full bg-gradient-to-b from-plum-dark to-plum px-6 py-4 text-base font-normal text-cream disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:brightness-110 active:scale-[0.98]"
                                >
                                    {submitting ? 'Adding to your closet…' : 'Add to Closet'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ---------- EXTRACTING (2+ items detected) ---------- */}
                    {stage === 'extracting' && sourceImage && (
                        <div className="space-y-5 rounded-3xl bg-white/60 backdrop-blur-md border border-white/60 p-6 sm:p-8 shadow-[0_2px_10px_rgba(93,27,58,0.06)]">
                            <p className="flex items-center gap-2 text-sm text-plum/70">
                                <Sparkles size={14} className="text-[#C9A96E]" />
                                Found {detectedItems.length} pieces in this photo — drag the box to adjust, then extract each one. ({detectIndex + 1} of {detectedItems.length})
                            </p>

                            <div className="font-medium text-plum-dark">
                                {currentDetected?.suggestedName || currentDetected?.category || 'This piece'}
                            </div>

                            <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)}>
                                <img ref={imgRef} src={sourceImage} alt="" style={{ maxHeight: '60vh', width: '100%', objectFit: 'contain' }} />
                            </ReactCrop>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={advanceOrFinish}
                                    className="flex items-center justify-center gap-2 rounded-full border border-plum/20 px-5 py-3 text-sm font-medium text-plum-dark hover:bg-plum/5 transition-colors"
                                >
                                    <SkipForward size={16} />
                                    Skip
                                </button>
                                <button
                                    type="button"
                                    onClick={handleExtractCurrent}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-plum-dark to-plum px-6 py-3 text-sm font-medium text-cream transition-all hover:brightness-110 active:scale-[0.98]"
                                >
                                    Extract this piece
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ---------- REVIEW extracted pieces ---------- */}
                    {stage === 'review' && (
                        <div className="space-y-6">
                            {pieces.length === 0 && (
                                <div className="rounded-3xl bg-white/60 backdrop-blur-md border border-white/60 p-8 text-center text-plum/60">
                                    You skipped every piece — nothing to add. <Link to="/closet" className="text-burgundy hover:text-gold">Back to Closet</Link>
                                </div>
                            )}
                            {pieces.map((piece, i) => (
                                <div key={piece.id} className="space-y-5 rounded-3xl bg-white/60 backdrop-blur-md border border-white/60 p-6 sm:p-8 shadow-[0_2px_10px_rgba(93,27,58,0.06)]">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <img src={piece.image} alt="" className="h-20 w-20 rounded-2xl object-cover" />
                                            <span className="font-medium text-plum-dark">Piece {i + 1}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removePiece(piece.id)}
                                            className="rounded-full bg-[#C9614E]/10 p-2.5 text-[#C9614E] hover:bg-[#C9614E]/20 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <PieceFieldsBlock values={piece} onChange={(patch) => updatePiece(piece.id, patch)} />
                                </div>
                            ))}

                            {pieces.length > 0 && (
                                <div className="rounded-full shadow-[0_8px_16px_rgba(61,16,40,0.18)]">
                                    <button
                                        type="button"
                                        onClick={handleSubmitPieces}
                                        disabled={!canSubmitPieces}
                                        className="w-full rounded-full bg-gradient-to-b from-plum-dark to-plum px-6 py-4 text-base font-normal text-cream disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:brightness-110 active:scale-[0.98]"
                                    >
                                        {submitting ? 'Adding to your closet…' : `Add ${pieces.length} Piece${pieces.length === 1 ? '' : 's'} to Closet`}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
