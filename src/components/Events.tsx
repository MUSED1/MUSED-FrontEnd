import { useState, useEffect } from 'react'
import { MapPin, Calendar, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

interface ImageData {
    _id: string;
    filename: string;
    originalName: string;
    cloudinaryUrl: string;
    cloudinaryPublicId: string;
    size: number;
    format: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

const API_BASE_URL = 'https://mused-backend.onrender.com';

// Dinner date boundaries (must match the individual dinner pages)
const SECOND_DINNER_END_DATE   = new Date('2026-03-20T00:00:00Z');
const THIRD_DINNER_START_DATE  = new Date('2026-03-20T00:00:00Z');
const THIRD_DINNER_END_DATE    = new Date('2026-04-02T00:00:00Z');
const FOURTH_DINNER_START_DATE = new Date('2026-04-02T00:00:00Z');
const FOURTH_DINNER_END_DATE   = new Date('2026-05-31T23:59:59Z');
const FIFTH_DINNER_START_DATE  = new Date('2026-06-19T00:00:00Z');
const FIFTH_DINNER_END_DATE    = new Date('2026-06-25T23:59:59Z');

export function Events() {
    // --- Gallery state (Gallery) ---
    const [firstDinnerImages, setFirstDinnerImages] = useState<string[]>([]);
    const [secondDinnerImages, setSecondDinnerImages] = useState<ImageData[]>([]);
    const [thirdDinnerImages, setThirdDinnerImages] = useState<ImageData[]>([]);
    const [fourthDinnerImages, setFourthDinnerImages] = useState<ImageData[]>([]);
    const [fifthDinnerImages, setFifthDinnerImages] = useState<ImageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [randomizedImages, setRandomizedImages] = useState<Array<{ url: string; type: 'first' | 'second' | 'third' | 'fourth' | 'fifth'; id: string }>>([]);

    useEffect(() => {
        const paths = Array.from({ length: 56 }, (_, i) => `/dinnerimages/fd${i + 1}.jpeg`);
        setFirstDinnerImages(paths);
    }, []);

    useEffect(() => {
        fetchDinnerImages();
    }, []);

    useEffect(() => {
        const allImages = getAllImages();
        if (allImages.length > 0) {
            const shuffled = [...allImages];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            setRandomizedImages(shuffled);
        }
    }, [firstDinnerImages, secondDinnerImages, thirdDinnerImages, fourthDinnerImages, fifthDinnerImages]);

    const fetchDinnerImages = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all pages
            let allImages: ImageData[] = [];
            let page = 1;
            const limit = 100;
            let hasMore = true;

            while (hasMore) {
                const response = await fetch(
                    `${API_BASE_URL}/api/images?page=${page}&limit=${limit}`,
                    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
                );
                if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
                const result = await response.json();
                if (!result.success) throw new Error(result.message || 'Failed to fetch images');
                const pageData: ImageData[] = result.data || [];
                allImages = [...allImages, ...pageData];
                const totalPages = result.pagination?.totalPages ?? 1;
                if (page >= totalPages || pageData.length < limit) {
                    hasMore = false;
                } else {
                    page++;
                }
            }

            // Split by date range into the correct dinner buckets
            setSecondDinnerImages(allImages.filter(img => new Date(img.createdAt) < SECOND_DINNER_END_DATE));
            setThirdDinnerImages(allImages.filter(img => {
                const d = new Date(img.createdAt);
                return d >= THIRD_DINNER_START_DATE && d < THIRD_DINNER_END_DATE;
            }));
            setFourthDinnerImages(allImages.filter(img => {
                const d = new Date(img.createdAt);
                return d >= FOURTH_DINNER_START_DATE && d < FOURTH_DINNER_END_DATE;
            }));
            setFifthDinnerImages(allImages.filter(img => {
                const d = new Date(img.createdAt);
                return d >= FIFTH_DINNER_START_DATE && d <= FIFTH_DINNER_END_DATE;
            }));
        } catch (err) {
            console.error('Error fetching dinner images:', err);
            setError(err instanceof Error ? err.message : 'Failed to load images');
        } finally {
            setLoading(false);
        }
    };

    const getAllImages = (): Array<{ url: string; type: 'first' | 'second' | 'third' | 'fourth' | 'fifth'; id: string }> => {
        const firstImages = firstDinnerImages.map((url, index) => ({
            url, type: 'first' as const, id: `first-${index}`
        }));
        const secondImages = secondDinnerImages.map((img) => ({
            url: img.cloudinaryUrl, type: 'second' as const, id: img._id
        }));
        const thirdImages = thirdDinnerImages.map((img) => ({
            url: img.cloudinaryUrl, type: 'third' as const, id: img._id
        }));
        const fourthImages = fourthDinnerImages.map((img) => ({
            url: img.cloudinaryUrl, type: 'fourth' as const, id: img._id
        }));
        const fifthImages = fifthDinnerImages.map((img) => ({
            url: img.cloudinaryUrl, type: 'fifth' as const, id: img._id
        }));
        return [...firstImages, ...secondImages, ...thirdImages, ...fourthImages, ...fifthImages];
    };

    const collections = [
        {
            id: 5,
            title: "Fifth Dinner",
            date: "2026",
            image: "https://res.cloudinary.com/dapfjngt2/image/upload/v1782104109/WhatsApp_Image_2026-06-21_at_10.05.50_PM_1_gdfqvo.jpg",
            path: "/fifth-dinner",
            description: "The one where east met west",
            stats: { photos: fifthDinnerImages.length, attendees: 0 },
            location: "HK"
        },
        {
            id: 4,
            title: "Fourth Dinner",
            date: "2026",
            image: "https://res.cloudinary.com/dapfjngt2/image/upload/v1777850352/mused-clothing/ugb3kphrjxuzr9kd5gpp.jpg",
            path: "/fourth-dinner",
            description: "The one where we celebrated our biggest milestone yet",
            stats: { photos: 0, attendees: 0 },
            location: "NY"
        },
        {
            id: 3,
            title: "Third Dinner",
            date: "2025",
            image: "https://res.cloudinary.com/dapfjngt2/image/upload/v1774682644/WhatsApp_Image_2026-03-28_at_12.37.30_AM_ow9yhs.jpg",
            path: "/third-dinner",
            description: "The one in the former victoria prison",
            stats: { photos: 0, attendees: 0 },
            location: "HK"
        },
        {
            id: 2,
            title: "Second Dinner",
            date: "2025",
            image: "https://res.cloudinary.com/dapfjngt2/image/upload/v1774682835/WhatsApp_Image_2026-03-28_at_12.37.31_AM_1_tyuldc.jpg",
            path: "/second-dinner",
            description: "The one where we opened MUSED to everyone",
            stats: { photos: secondDinnerImages.length, attendees: 30 },
            location: "HK"
        },
        {
            id: 1,
            title: "First Dinner",
            date: "2024",
            image: "/dinnerimages/fd1.jpeg",
            path: "/first-dinner",
            description: "The first table. The one where it all started.",
            stats: { photos: 56, attendees: 0 },
            location: "HK"
        }
    ];

    return (
        <div className="bg-white">
            <Header />

            {/* ============================================================ */}
            {/* HEADER — app-style greeting                                   */}
            {/* ============================================================ */}
            <section className="w-full px-4 pb-6 pt-28 md:pt-32">
                <div className="container mx-auto max-w-5xl">
                    <span className="text-xs uppercase tracking-label text-plum/40">MUSED 852</span>
                    <h1 className="mt-1 font-kaldera font-normal text-3xl text-plum-dark sm:text-4xl">
                        Events
                    </h1>
                    <p className="mt-2 max-w-md text-sm text-plum/50">
                        Dinners, drops and MUSED moments across Hong Kong, New York and London.
                    </p>
                </div>
            </section>

            {/* ============================================================ */}
            {/* UPCOMING — the next real event, clickable into its own page   */}
            {/* ============================================================ */}
            <section className="w-full px-4 pb-4">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="mb-4 font-kaldera text-xl text-plum-dark">Upcoming</h2>

                    <Link
                        to="/events/next"
                        className="group relative flex flex-col overflow-hidden rounded-3xl bg-plum-dark sm:flex-row"
                    >
                        <div className="relative h-56 w-full overflow-hidden sm:h-auto sm:w-2/5">
                            <img
                                src="https://res.cloudinary.com/dapfjngt2/image/upload/v1778993726/quick_Eternity_2__page-0001_kgg4kr.jpg"
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs text-plum-dark">
                                Dinner
                            </span>
                        </div>

                        <div className="flex flex-1 flex-col justify-center p-6 sm:p-8">
                            <h3 className="font-kaldera text-2xl text-cream sm:text-3xl">
                                Wear Something <span className="italic">Borrowed</span>
                            </h3>
                            <div className="mt-3 space-y-1.5 text-sm text-cream/60">
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} />
                                    Sai Ying Pun, Hong Kong
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} />
                                    June 18 — 8:00 PM
                                </div>
                            </div>

                            <div className="mt-5 flex items-center justify-between">
                                <span className="font-kaldera text-xl text-cream">HK$ 290</span>
                                <span className="flex items-center gap-1.5 text-sm text-cream/80 transition-colors group-hover:text-gold">
                                    RSVP
                                    <ArrowUpRight size={15} />
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>
            </section>

            {/* ============================================================ */}
            {/* SECTION 3: GALLERY — past events + sneak peeks                */}
            {/* ============================================================ */}

            {/* Past Events Collections Grid */}
            <section className="w-full bg-white px-4 py-16">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="mb-6 font-kaldera text-xl text-plum-dark">Past Events</h2>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
                        {collections.map((collection) => (
                            <Link
                                key={collection.id}
                                to={collection.path}
                                className="group block"
                            >
                                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-plum-dark/5">
                                    <img
                                        src={collection.image}
                                        alt=""
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=2070&auto=format&fit=crop';
                                        }}
                                    />
                                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-plum-dark/80 via-plum-dark/0 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                        <span className="flex items-center gap-1 text-xs text-cream">
                                            Know more about this event
                                            <ArrowUpRight size={13} />
                                        </span>
                                    </div>
                                </div>
                                <h3 className="mt-3 font-kaldera text-base text-plum-dark">{collection.title}</h3>
                                <p className="text-xs text-plum/50 line-clamp-1">{collection.description}</p>
                                {collection.location && (
                                    <div className="mt-1 flex items-center gap-1 text-xs text-plum/40">
                                        <MapPin size={11} />
                                        {collection.location}
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sneak Peeks Section */}
            <section className="w-full bg-cream px-4 py-16">
                <div className="container mx-auto max-w-6xl">
                    <div className="mb-10 text-center">
                        <span className="text-xs uppercase tracking-label text-plum/40">Behind the scenes</span>
                        <h2 className="mt-3 font-kaldera text-4xl text-plum-dark" style={{ fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.1 }}>
                            Sneak peeks of our <span className="italic">muses</span>
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl text-plum/60">
                            Behind the scenes moments captured at MUSED gatherings.
                        </p>
                    </div>

                    {loading ? (
                        <div className="py-12 text-center">
                            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-plum-dark/20 border-t-plum-dark" />
                            <p className="text-sm text-plum/50">Loading memories…</p>
                        </div>
                    ) : error ? (
                        <div className="py-12 text-center">
                            <p className="text-[#C9614E]">Unable to load memories. Please try again later.</p>
                        </div>
                    ) : randomizedImages.length > 0 ? (
                        <div className="-mx-4 overflow-hidden sm:mx-0">
                            <style>{`
                                @keyframes gallery-marquee {
                                    from { transform: translateX(0); }
                                    to { transform: translateX(-50%); }
                                }
                                .gallery-marquee-track {
                                    animation: gallery-marquee 420s linear infinite;
                                }
                                .gallery-marquee-track:hover {
                                    animation-play-state: paused;
                                }
                            `}</style>
                            <div className="gallery-marquee-track flex w-max gap-4 px-4 sm:px-0">
                                {[...randomizedImages, ...randomizedImages].map((image, index) => (
                                    <button
                                        key={`${image.id}-${index}`}
                                        onClick={() => setSelectedImage(image.url)}
                                        className="group relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-lg sm:h-48 sm:w-48"
                                    >
                                        <img
                                            src={image.url}
                                            alt=""
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=2070&auto=format&fit=crop';
                                            }}
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-plum-dark/80 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                            <span className="text-xs text-cream">
                                                {image.type === 'first' ? 'First Dinner'
                                                    : image.type === 'second' ? 'Second Dinner'
                                                        : image.type === 'third' ? 'Third Dinner'
                                                            : image.type === 'fourth' ? 'Fourth Dinner'
                                                                : 'Fifth Dinner'}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="font-sans text-lg" style={{ color: 'rgba(91,27,58,0.7)' }}>
                                No memories available yet.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
                    <div className="relative max-w-6xl max-h-full">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 transition-colors duration-300 font-abril uppercase text-[13px]"
                            style={{ color: '#FFF0C8', letterSpacing: '0.2em' }}
                        >
                            ✕ Close
                        </button>
                        <img
                            src={selectedImage}
                            alt="Enlarged view"
                            className="max-w-full max-h-[80vh] object-contain rounded-lg"
                        />
                    </div>
                </div>
            )}

            <Footer />
        </div>
    )
}
