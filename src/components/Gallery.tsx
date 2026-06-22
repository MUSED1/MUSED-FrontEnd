import { useState, useEffect, useRef } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

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

// Typewriter hook
function useTypewriter(text: string, speed = 60, startDelay = 0) {
    const [displayed, setDisplayed] = useState('')
    const [done, setDone] = useState(false)

    useEffect(() => {
        setDisplayed('')
        setDone(false)
        let timeout: ReturnType<typeof setTimeout>
        let interval: ReturnType<typeof setInterval>

        timeout = setTimeout(() => {
            let i = 0
            interval = setInterval(() => {
                i++
                setDisplayed(text.slice(0, i))
                if (i >= text.length) {
                    clearInterval(interval)
                    setDone(true)
                }
            }, speed)
        }, startDelay)

        return () => {
            clearTimeout(timeout)
            clearInterval(interval)
        }
    }, [text, speed, startDelay])

    return { displayed, done }
}

// Dinner date boundaries (must match the individual dinner pages)
const SECOND_DINNER_END_DATE   = new Date('2026-03-20T00:00:00Z');
const THIRD_DINNER_START_DATE  = new Date('2026-03-20T00:00:00Z');
const THIRD_DINNER_END_DATE    = new Date('2026-04-02T00:00:00Z');
const FOURTH_DINNER_START_DATE = new Date('2026-04-02T00:00:00Z');
const FOURTH_DINNER_END_DATE   = new Date('2026-05-31T23:59:59Z');
const FIFTH_DINNER_START_DATE  = new Date('2026-06-19T00:00:00Z');
const FIFTH_DINNER_END_DATE    = new Date('2026-06-25T23:59:59Z');

export function Gallery() {
    const [isVisible, setIsVisible] = useState(false);
    const [firstDinnerImages, setFirstDinnerImages] = useState<string[]>([]);
    const [secondDinnerImages, setSecondDinnerImages] = useState<ImageData[]>([]);
    const [thirdDinnerImages, setThirdDinnerImages] = useState<ImageData[]>([]);
    const [fourthDinnerImages, setFourthDinnerImages] = useState<ImageData[]>([]);
    const [fifthDinnerImages, setFifthDinnerImages] = useState<ImageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [randomizedImages, setRandomizedImages] = useState<Array<{ url: string; type: 'first' | 'second' | 'third' | 'fourth' | 'fifth'; id: string }>>([]);
    const carouselRef = useRef<HTMLDivElement>(null);

    // Typewriter: "Our" then "Gallery" in italic
    const { displayed: ourText, done: ourDone }         = useTypewriter('Our', 80, 200)
    const { displayed: galleryText }                     = useTypewriter('Gallery', 80, ourDone ? 600 : 9999)

    const [taglineVisible, setTaglineVisible] = useState(false)
    useEffect(() => {
        const id = setTimeout(() => setTaglineVisible(true), 2000)
        return () => clearTimeout(id)
    }, [])

    useEffect(() => {
        const paths = Array.from({ length: 56 }, (_, i) => `/dinnerimages/fd${i + 1}.jpeg`);
        setFirstDinnerImages(paths);
    }, []);

    useEffect(() => {
        fetchDinnerImages();
    }, []);

    useEffect(() => {
        setIsVisible(true);
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
            setCurrentIndex(0);
        }
    }, [firstDinnerImages, secondDinnerImages, thirdDinnerImages, fourthDinnerImages, fifthDinnerImages]);

    useEffect(() => {
        const interval = setInterval(() => {
            const isMobile = window.innerWidth < 640;
            const imagesToShow = isMobile ? 1 : 4;
            if (randomizedImages.length > imagesToShow) {
                setCurrentIndex((prev) => (prev + 1) % (randomizedImages.length - imagesToShow + 1));
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [randomizedImages]);

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

    const getImagesToShow = () => {
        const isMobile = window.innerWidth < 640;
        return isMobile ? 1 : 4;
    };

    const imagesToShow = getImagesToShow();
    const visibleImages = randomizedImages.slice(currentIndex, currentIndex + imagesToShow);

    const nextSlide = () => {
        if (currentIndex < randomizedImages.length - imagesToShow) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(0);
        }
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else {
            setCurrentIndex(randomizedImages.length - imagesToShow);
        }
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
        <div className="font-sans" style={{ backgroundColor: '#fff9e6' }}>
            <Header />

            {/* Hero Section */}
            <style>{`
                .tagline-text {
                    opacity: 0;
                    transition: opacity 1.4s ease;
                }
                .tagline-text.visible {
                    opacity: 1;
                }
            `}</style>
            <section
                className="relative overflow-hidden py-16"
                style={{ backgroundColor: '#3D1028' }}
            >
                {/* Soft glow decorations */}
                <div className="absolute top-10 left-10 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#FFF0C8' }} />
                <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full blur-3xl opacity-10" style={{ backgroundColor: '#FFF0C8' }} />

                <div className="container mx-auto px-4 relative z-10">
                    <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        {/* H1: Kaldera, 72px, one word italic */}
                        <h1
                            className="font-kaldera tracking-tight drop-shadow-sm mb-4"
                            style={{ fontSize: 'clamp(48px, 8vw, 72px)', color: '#FFF0C8', lineHeight: 1 }}
                        >
                            {ourText}
                            {!ourDone && (
                                <span
                                    className="inline-block w-[3px] h-[0.8em] ml-1 align-middle animate-pulse"
                                    style={{ backgroundColor: '#FFF0C8', verticalAlign: 'middle' }}
                                />
                            )}{' '}
                            <span style={{ fontStyle: 'italic', color: '#FFF0C8' }}>
                                {galleryText}
                                {ourDone && galleryText.length < 7 && (
                                    <span
                                        className="inline-block w-[3px] h-[0.8em] ml-1 align-middle animate-pulse"
                                        style={{ backgroundColor: '#FFF0C8', verticalAlign: 'middle' }}
                                    />
                                )}
                            </span>
                        </h1>

                        {/* Tagline: Abril Display italic, cream/75 */}
                        <p
                            className={`tagline-text font-abril max-w-2xl mx-auto${taglineVisible ? ' visible' : ''}`}
                            style={{
                                color: 'rgba(255,240,200,0.75)',
                                fontSize: '22px',
                                fontStyle: 'italic',
                                lineHeight: 1.4,
                            }}
                        >
                            MUSED moments captured on film. Browse & download your favorites.
                        </p>
                    </div>
                </div>
            </section>

            {/* Collections Grid */}
            <section className="container mx-auto px-4 py-16">
                {/* Section label */}
                <div className="text-center mb-10">
                    <span
                        className="font-abril text-[15px] uppercase border rounded-full px-3 py-1"
                        style={{
                            color: '#5B1B3A',
                            letterSpacing: '0.2em',
                            borderColor: 'rgba(91,27,58,0.2)',
                            backgroundColor: '#FFF0C8',
                        }}
                    >
                        Past Events
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {collections.map((collection, index) => (
                        <div
                            key={collection.id}
                            className={`transform transition-all duration-700 delay-${index * 200} ${
                                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                            }`}
                        >
                            <Link
                                to={collection.path}
                                className="block group relative rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 aspect-[3/4]"
                            >
                                <div className="absolute inset-0">
                                    <img
                                        src={collection.image}
                                        alt={collection.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=2070&auto=format&fit=crop';
                                        }}
                                    />
                                </div>

                                {/* Gradient overlay */}
                                <div
                                    className="absolute inset-0 flex flex-col justify-end p-4"
                                    style={{ background: 'linear-gradient(to top, rgba(61,16,40,0.85), rgba(61,16,40,0.15) 50%, transparent)' }}
                                >
                                    <div className="relative z-10 transform transition-transform duration-500 group-hover:-translate-y-1">
                                        {/* Card title: Kaldera */}
                                        <h2
                                            className="font-kaldera mb-1"
                                            style={{ fontSize: '22px', color: '#FFF0C8', lineHeight: 1.1 }}
                                        >
                                            {collection.title}
                                        </h2>
                                        {/* Description: Baskerville */}
                                        <p
                                            className="font-sans text-sm line-clamp-2 mb-2"
                                            style={{ color: 'rgba(255,240,200,0.8)' }}
                                        >
                                            {collection.description}
                                        </p>
                                        {/* Location: Abril Display, uppercase, tracking 270 */}
                                        {collection.location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin size={11} style={{ color: 'rgba(255,240,200,0.6)' }} />
                                                <span
                                                    className="font-abril uppercase text-[11px]"
                                                    style={{ color: 'rgba(255,240,200,0.6)', letterSpacing: '0.27em' }}
                                                >
                                                    {collection.location}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* Sneak Peeks Section */}
            <section className="py-16" style={{ backgroundColor: '#FFF0C8' }}>
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        {/* Section label */}
                        <div className="mb-4">
                            <span
                                className="font-abril text-[15px] uppercase border rounded-full px-3 py-1"
                                style={{
                                    color: '#5B1B3A',
                                    letterSpacing: '0.2em',
                                    borderColor: 'rgba(91,27,58,0.2)',
                                    backgroundColor: '#fff9e6',
                                }}
                            >
                                Behind the scenes
                            </span>
                        </div>
                        {/* H2: Kaldera, one word italic */}
                        <h2
                            className="font-kaldera mb-3"
                            style={{ fontSize: 'clamp(32px, 5vw, 48px)', color: '#5B1B3A', lineHeight: 1.1 }}
                        >
                            Sneak Peeks of Our <span style={{ fontStyle: 'italic' }}>Muses</span>
                        </h2>
                        {/* Body: Baskerville */}
                        <p className="font-sans text-lg max-w-2xl mx-auto" style={{ color: 'rgba(91,27,58,0.7)' }}>
                            Behind the scenes moments captured at MUSED gatherings
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div
                                className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mb-4"
                                style={{ borderColor: '#5B1B3A' }}
                            />
                            {/* Loading label: Abril Display, uppercase */}
                            <p
                                className="font-abril uppercase text-[15px]"
                                style={{ color: '#5B1B3A', letterSpacing: '0.2em' }}
                            >
                                Loading memories...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="font-sans text-lg" style={{ color: '#6B0202' }}>
                                Unable to load memories. Please try again later.
                            </p>
                        </div>
                    ) : randomizedImages.length > 0 ? (
                        <div className="relative max-w-6xl mx-auto" ref={carouselRef}>
                            <div className="relative">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                    {visibleImages.map((image, index) => (
                                        <div
                                            key={`${image.id}-${currentIndex}-${index}`}
                                            className="group relative aspect-square rounded-lg overflow-hidden shadow-md cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-xl"
                                            onClick={() => setSelectedImage(image.url)}
                                        >
                                            <img
                                                src={image.url}
                                                alt={`Memory ${currentIndex + index + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=2070&auto=format&fit=crop';
                                                }}
                                            />
                                            <div
                                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4"
                                                style={{ background: 'linear-gradient(to top, rgba(61,16,40,0.7), transparent)' }}
                                            >
                                                {/* Hover label: Abril Display, uppercase */}
                                                <span
                                                    className="font-abril uppercase text-[13px]"
                                                    style={{ color: '#FFF0C8', letterSpacing: '0.2em' }}
                                                >
                                                    {image.type === 'first' ? 'First Dinner'
                                                        : image.type === 'second' ? 'Second Dinner'
                                                            : image.type === 'third' ? 'Third Dinner'
                                                                : image.type === 'fourth' ? 'Fourth Dinner'
                                                                    : 'Fifth Dinner'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Nav buttons */}
                                {randomizedImages.length > imagesToShow && (
                                    <>
                                        <button
                                            onClick={prevSlide}
                                            className="absolute -left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
                                            style={{ backgroundColor: '#5B1B3A', color: '#FFF0C8' }}
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            onClick={nextSlide}
                                            className="absolute -right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
                                            style={{ backgroundColor: '#5B1B3A', color: '#FFF0C8' }}
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </>
                                )}
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
    );
}