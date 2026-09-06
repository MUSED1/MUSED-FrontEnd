// components/MyBrand.tsx
import { useState, useEffect, useRef } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { Upload, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { API_CONFIG } from '../utils/api'

interface BrandProfile {
    _id: string;
    brandName: string;
    founderStory: string;
    specialNote: string;
    logoUrl: string;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    rejectionReason: string | null;
}

const FOUNDER_STORY_MIN = 150;
const FOUNDER_STORY_MAX = 300;
const SPECIAL_NOTE_MAX = 60;

function countWords(str: string): number {
    return str.trim().split(/\s+/).filter(Boolean).length;
}

function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Could not read file'));
        reader.readAsDataURL(file);
    });
}

export function MyBrand() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [existing, setExisting] = useState<BrandProfile | null>(null);

    const [brandName, setBrandName] = useState('');
    const [founderStory, setFounderStory] = useState('');
    const [specialNote, setSpecialNote] = useState('');
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
    const [logoError, setLogoError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
    };

    useEffect(() => {
        const loadBrand = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.brandMe}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });

                if (res.status === 404) {
                    setLoading(false);
                    return;
                }

                const result = await res.json();
                if (res.ok && result.success) {
                    const brand: BrandProfile = result.data;
                    setExisting(brand);
                    setBrandName(brand.brandName);
                    setFounderStory(brand.founderStory);
                    setSpecialNote(brand.specialNote);
                    setLogoPreview(brand.logoUrl);
                } else {
                    throw new Error(result.message || 'Failed to load brand profile');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error loading brand profile');
            } finally {
                setLoading(false);
            }
        };

        loadBrand();
    }, []);

    const handleLogoSelect = async (file: File | undefined) => {
        setLogoError('');
        if (!file) return;

        if (file.type !== 'image/png') {
            setLogoError('Logo must be a PNG file with a transparent background');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setLogoError('File too large. Maximum size is 5MB.');
            return;
        }

        try {
            const dataUrl = await fileToDataUrl(file);
            setLogoDataUrl(dataUrl);
            setLogoPreview(dataUrl);
        } catch {
            setLogoError('Could not read that file. Try a different image.');
        }
    };

    const founderStoryWords = countWords(founderStory);
    const specialNoteWords = countWords(specialNote);

    const founderStoryValid = founderStoryWords >= FOUNDER_STORY_MIN && founderStoryWords <= FOUNDER_STORY_MAX;
    const specialNoteValid = specialNoteWords > 0 && specialNoteWords <= SPECIAL_NOTE_MAX;
    const hasLogo = Boolean(logoDataUrl || existing?.logoUrl);

    const canSubmit = brandName.trim().length > 0 && founderStoryValid && specialNoteValid && hasLogo && !saving;

    const handleSubmit = async () => {
        if (!canSubmit) return;

        try {
            setSaving(true);
            setError('');

            const body: Record<string, string> = {
                brandName: brandName.trim(),
                founderStory: founderStory.trim(),
                specialNote: specialNote.trim()
            };
            if (logoDataUrl) {
                body.logo = logoDataUrl;
            }

            const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.brand}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(body)
            });

            const result = await res.json();
            if (res.ok && result.success) {
                setExisting(result.data);
                setLogoDataUrl(null);
                setLogoPreview(result.data.logoUrl);
            } else {
                throw new Error(result.message || 'Failed to save brand profile');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error saving brand profile');
        } finally {
            setSaving(false);
        }
    };

    const statusBadge = () => {
        if (!existing) return null;
        const map = {
            pending: { icon: Clock, classes: 'bg-yellow-100 text-yellow-800', label: 'Pending review' },
            approved: { icon: CheckCircle2, classes: 'bg-green-100 text-green-800', label: 'Approved' },
            rejected: { icon: AlertCircle, classes: 'bg-red-100 text-red-800', label: 'Changes needed' }
        } as const;
        const { icon: Icon, classes, label } = map[existing.approvalStatus];
        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${classes}`}>
                <Icon size={16} />
                {label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="font-sans">
                <Header />
                <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-8">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-2 border-plum border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-plum mt-4">Loading your brand profile...</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-8">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-plum mb-4">Your Brand Story</h1>
                        <p className="text-lg text-plum/80">
                            Tell shoppers who you are. This appears on your public storefront once approved.
                        </p>
                        {existing && <div className="mt-4">{statusBadge()}</div>}
                    </div>

                    {existing?.approvalStatus === 'rejected' && existing.rejectionReason && (
                        <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-xl border border-red-200">
                            <p className="font-semibold mb-1">An admin asked for changes:</p>
                            <p>{existing.rejectionReason}</p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-xl border border-red-300 flex justify-between items-center">
                            <span>{error}</span>
                            <button onClick={() => setError('')} className="ml-4 underline hover:no-underline">
                                Dismiss
                            </button>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-8">
                        {/* Logo */}
                        <div>
                            <label className="block font-semibold text-plum mb-2">Logo</label>
                            <p className="text-sm text-plum/60 mb-3">Transparent PNG, up to 5MB.</p>
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 rounded-xl bg-cream border-2 border-dashed border-plum/20 flex items-center justify-center overflow-hidden shrink-0">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                                    ) : (
                                        <Upload className="text-plum/40" size={28} />
                                    )}
                                </div>
                                <div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png"
                                        className="hidden"
                                        onChange={(e) => handleLogoSelect(e.target.files?.[0])}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-plum text-white px-4 py-2 rounded-lg hover:bg-plum/90 transition-colors text-sm font-medium"
                                    >
                                        {logoPreview ? 'Replace logo' : 'Upload logo'}
                                    </button>
                                    {logoError && <p className="text-sm text-red-600 mt-2">{logoError}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Brand name */}
                        <div>
                            <label className="block font-semibold text-plum mb-2">Brand name</label>
                            <input
                                type="text"
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                                maxLength={100}
                                placeholder="e.g. Rosewood & Rivet"
                                className="w-full px-4 py-3 rounded-lg border border-plum/20 focus:outline-none focus:ring-2 focus:ring-rose text-plum"
                            />
                        </div>

                        {/* Founder story */}
                        <div>
                            <div className="flex justify-between items-baseline mb-2">
                                <label className="block font-semibold text-plum">Founder story</label>
                                <span className={`text-sm ${founderStoryValid ? 'text-plum/60' : 'text-red-600'}`}>
                                    {founderStoryWords} / {FOUNDER_STORY_MIN}–{FOUNDER_STORY_MAX} words
                                </span>
                            </div>
                            <p className="text-sm text-plum/60 mb-2">
                                What's the story behind your brand? Between 150 and 300 words.
                            </p>
                            <textarea
                                value={founderStory}
                                onChange={(e) => setFounderStory(e.target.value)}
                                rows={8}
                                placeholder="Share how your brand started and what drives it..."
                                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-rose text-plum resize-y ${
                                    founderStory.length === 0 || founderStoryValid ? 'border-plum/20' : 'border-red-300'
                                }`}
                            />
                        </div>

                        {/* Special note */}
                        <div>
                            <div className="flex justify-between items-baseline mb-2">
                                <label className="block font-semibold text-plum">What makes your brand special</label>
                                <span className={`text-sm ${specialNoteValid || specialNote.length === 0 ? 'text-plum/60' : 'text-red-600'}`}>
                                    {specialNoteWords} / {SPECIAL_NOTE_MAX} words max
                                </span>
                            </div>
                            <textarea
                                value={specialNote}
                                onChange={(e) => setSpecialNote(e.target.value)}
                                rows={3}
                                placeholder="One or two sentences that sum up what sets you apart..."
                                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-rose text-plum resize-y ${
                                    specialNoteWords <= SPECIAL_NOTE_MAX ? 'border-plum/20' : 'border-red-300'
                                }`}
                            />
                        </div>

                        <div className="flex justify-end pt-2 border-t border-cream">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!canSubmit}
                                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                    canSubmit
                                        ? 'bg-rose text-white hover:bg-rose/90'
                                        : 'bg-plum/10 text-plum/40 cursor-not-allowed'
                                }`}
                            >
                                {saving ? 'Saving...' : existing ? 'Save changes' : 'Submit for review'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}