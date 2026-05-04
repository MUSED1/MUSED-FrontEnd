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

export function Gallery() {
    const [isVisible, setIsVisible] = useState(false);
    const [firstDinnerImages, setFirstDinnerImages] = useState<string[]>([]);
    const [secondDinnerImages, setSecondDinnerImages] = useState<ImageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [randomizedImages, setRandomizedImages] = useState<Array<{ url: string; type: 'first' | 'second'; id: string }>>([]);
    const carouselRef = useRef<HTMLDivElement>(null);

    // Generate first dinner image paths (fd1 to fd56)
    useEffect(() => {
        const paths = Array.from({ length: 56 }, (_, i) => `/dinnerimages/fd${i + 1}.jpeg`);
        setFirstDinnerImages(paths);
    }, []);

    // Fetch second dinner images from API
    useEffect(() => {
        fetchSecondDinnerImages();
    }, []);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    // Randomize images when both sets are loaded
    useEffect(() => {
        if (firstDinnerImages.length > 0 || secondDinnerImages.length > 0) {
            const allImages = getAllImages();
            const shuffled = [...allImages];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            setRandomizedImages(shuffled);
            setCurrentIndex(0);
        }
    }, [firstDinnerImages, secondDinnerImages]);

    // Auto-rotate carousel every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            const getImagesForCurrentView = () => {
                const isMobile = window.innerWidth < 640;
                const imagesToShow = isMobile ? 1 : 4;
                if (randomizedImages.length > imagesToShow) {
                    setCurrentIndex((prev) => (prev + 1) % (randomizedImages.length - imagesToShow + 1));
                }
            };

            getImagesForCurrentView();
        }, 5000);

        return () => clearInterval(interval);
    }, [randomizedImages]);

    const fetchSecondDinnerImages = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/images`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                setSecondDinnerImages(result.data || []);
            } else {
                throw new Error(result.message || 'Failed to fetch images');
            }
        } catch (err) {
            console.error('Error fetching images:', err);
            setError(err instanceof Error ? err.message : 'Failed to load images');
        } finally {
            setLoading(false);
        }
    };

    const getAllImages = (): Array<{ url: string; type: 'first' | 'second'; id: string }> => {
        const firstImages = firstDinnerImages.map((url, index) => ({
            url,
            type: 'first' as const,
            id: `first-${index}`
        }));

        const secondImages = secondDinnerImages.map((img) => ({
            url: img.cloudinaryUrl,
            type: 'second' as const,
            id: img._id
        }));

        return [...firstImages, ...secondImages];
    };

    // Get responsive number of images to show
    const getImagesToShow = () => {
        // Check if it's mobile (you can also use a resize listener for dynamic updates)
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
            id: 4,
            title: "Fourth Dinner",
            date: "2026",
            image: "https://res.cloudinary.com/dapfjngt2/image/upload/v1777850352/mused-clothing/ugb3kphrjxuzr9kd5gpp.jpg",
            path: "/fourth-dinner",
            description: "The one where we celebrated our biggest milestone yet",
            stats: { photos: 0, attendees: 0 },
            color: "",
            icon: "",
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
            color: "",
            icon: "",
            location: "HK"
        },
        {
            id: 2,
            title: "Second Dinner",
            image: "https://res.cloudinary.com/dapfjngt2/image/upload/v1774682835/WhatsApp_Image_2026-03-28_at_12.37.31_AM_1_tyuldc.jpg",
            path: "/second-dinner",
            description: "The one where we opened MUSED to everyone",
            stats: { photos: secondDinnerImages.length, attendees: 30 },
            color: "",
            icon: "",
            location: "HK"
        },
        {
            id: 1,
            title: "First Dinner",
            image: "/dinnerimages/fd1.jpeg",
            path: "/first-dinner",
            description: "The first table, The one where it all started ",
            color: "",
            icon: "",
            location: "HK"
        }
    ];
    return (
        <div className="min-h-screen bg-cream">
            <Header />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-[#5b1b3a] py-12">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-gold blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-cream blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <h1 className="text-5xl md:text-7xl font-bold text-cream mb-4 font-kaldera">
                            Our <span className="text-gold">Gallery</span>
                        </h1>
                        <p className="text-xl text-cream/90 max-w-2xl mx-auto font-light">
                            MUSED moments captured on film. Browse & download your favorites
                        </p>
                    </div>
                </div>
            </section>

            {/* Collections Grid - Smaller container */}
            <section className="container mx-auto px-4 py-12">
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
                                {/* Background Image - now fills the entire card */}
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

                                {/* Content - overlay on bottom */}
                                <div className="absolute inset-0 flex flex-col justify-end p-4 text-white bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                                    <div className="relative z-10 transform transition-transform duration-500 group-hover:translate-y-[-5px]">
                                        <h2 className="text-xl md:text-2xl font-bold font-kaldera mb-1">
                                            {collection.title}
                                        </h2>
                                        <p className="text-xs md:text-sm text-cream/90 line-clamp-2 mb-2">
                                            {collection.description}
                                        </p>
                                        {collection.location && (
                                            <div className="flex items-center gap-1 text-cream/80 text-xs">
                                                <MapPin size={12} className="text-purple-400" />
                                                <span>{collection.location}</span>
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
            <section className="bg-cream py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center text-plum mb-10">
                        <h2 className="text-4xl md:text-5xl font-bold font-kaldera mb-3">
                            Sneak Peeks of Our <span className="text-gold">Muses</span>
                        </h2>
                        <p className="text-lg text-plum/70 max-w-2xl mx-auto">
                            Behind the scenes moments captured at MUSED gatherings
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mb-4"></div>
                            <p className="text-plum text-lg">Loading memories...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-rose-300 text-lg">Unable to load memories. Please try again later.</p>
                        </div>
                    ) : randomizedImages.length > 0 ? (
                        <div className="relative max-w-6xl mx-auto" ref={carouselRef}>
                            {/* Responsive Carousel */}
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
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                                                <span className="text-cream font-semibold text-lg">
                                                    {image.type === 'first' ? 'First Dinner' : 'Second Dinner'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Navigation Buttons - Hide on mobile if only one image is shown */}
                                {randomizedImages.length > imagesToShow && (
                                    <>
                                        <button
                                            onClick={prevSlide}
                                            className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-gold text-plum p-2 rounded-full hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl z-10"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            onClick={nextSlide}
                                            className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-gold text-plum p-2 rounded-full hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl z-10"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-plum text-lg">No memories available yet.</p>
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
                            className="absolute -top-12 right-0 text-white hover:text-gold transition-colors duration-300 text-2xl font-bold"
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