// components/FifthDinner.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Link } from 'react-router-dom';

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

// Only show images uploaded between June 19 and June 25, 2026 (Fifth Dinner date range)
const FIFTH_DINNER_START_DATE = new Date('2026-06-19T00:00:00Z');
const FIFTH_DINNER_END_DATE   = new Date('2026-06-25T23:59:59Z');

export function FifthDinner() {
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
    const [images, setImages] = useState<ImageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [brokenIds, setBrokenIds] = useState<Set<string>>(new Set());

    const handleImageError = (id: string) => {
        setBrokenIds(prev => new Set(prev).add(id));
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all pages until there are no more results
            let allImages: ImageData[] = [];
            let page = 1;
            const limit = 100;
            let hasMore = true;

            while (hasMore) {
                const response = await fetch(
                    `${API_BASE_URL}/api/images?page=${page}&limit=${limit}`,
                    {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                    }
                );

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.message || 'Failed to fetch images');
                }

                const pageData: ImageData[] = result.data || [];
                allImages = [...allImages, ...pageData];

                // Stop if we got fewer results than requested (last page)
                // or if the API tells us there are no more pages
                const totalPages = result.pagination?.totalPages ?? 1;
                if (page >= totalPages || pageData.length < limit) {
                    hasMore = false;
                } else {
                    page++;
                }
            }

            // Filter: only images uploaded ON or AFTER April 2, 2026
            const fifthDinnerImages = allImages.filter((image: ImageData) => {
                const uploadDate = new Date(image.createdAt);
                return uploadDate >= FIFTH_DINNER_START_DATE && uploadDate <= FIFTH_DINNER_END_DATE;
            });

            console.log(`Total images fetched: ${allImages.length}, Fifth Dinner images: ${fifthDinnerImages.length}`);
            setImages(fifthDinnerImages);
        } catch (err) {
            console.error('Error fetching images:', err);
            setError(err instanceof Error ? err.message : 'Failed to load images');
        } finally {
            setLoading(false);
        }
    };

    const downloadImage = (image: ImageData, index: number) => {
        const link = document.createElement('a');
        link.href = image.cloudinaryUrl;
        link.download = `fifth-dinner-photo-${index + 1}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const visibleImages = images.filter(img => !brokenIds.has(img._id));

    const getPreviousImage = () => {
        if (!selectedImage) return null;
        const currentIndex = visibleImages.findIndex(img => img._id === selectedImage._id);
        return currentIndex > 0 ? visibleImages[currentIndex - 1] : visibleImages[visibleImages.length - 1];
    };

    const getNextImage = () => {
        if (!selectedImage) return null;
        const currentIndex = visibleImages.findIndex(img => img._id === selectedImage._id);
        return currentIndex < visibleImages.length - 1 ? visibleImages[currentIndex + 1] : visibleImages[0];
    };

    if (loading) {
        return (
            <div className="font-sans">
                <Header />
                <main className="min-h-screen bg-cream pt-28 md:pt-32 pb-8">
                    <div className="container mx-auto px-4 text-center py-20">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-plum-dark/20 border-t-plum-dark"></div>
                        <p className="text-sm text-plum/50">Loading images…</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="font-sans">
                <Header />
                <main className="min-h-screen bg-cream pt-28 md:pt-32 pb-8">
                    <div className="container mx-auto px-4 text-center py-20">
                        <h2 className="mb-3 font-kaldera text-2xl text-plum-dark">Unable to load images</h2>
                        <p className="mb-6 text-plum/60">{error}</p>
                        <button
                            onClick={fetchImages}
                            className="rounded-full bg-plum-dark px-6 py-3 text-cream transition-colors hover:bg-plum-dark/90"
                        >
                            Try again
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="font-sans">
            <Header />

            {/* Persistent floating back button — always reachable while scrolling the gallery */}
            <Link
                to="/events"
                className="fixed bottom-6 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-plum-dark text-cream shadow-lg transition-transform hover:scale-105 sm:bottom-8 sm:left-6"
                aria-label="Back to Events"
            >
                <ArrowLeft size={18} />
            </Link>
            <main className="min-h-screen bg-cream pt-28 md:pt-32 pb-8">
                <div className="container mx-auto max-w-6xl px-4">
                    {/* Header Section */}
                    <div className="mb-12 text-center">
                        <Link to="/events" className="mb-4 inline-flex items-center gap-1.5 text-sm text-plum/50 transition-colors hover:text-plum-dark">
                            <ArrowLeft size={14} />
                            Events
                        </Link>
                        <br />
                        <h1 className="font-kaldera text-4xl text-plum-dark sm:text-5xl">
                            Mused in the <span className="italic">Far East</span>
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-plum/60">
                            Step inside our fifth Wear Something Borrowed Dinner event.
                            Browse through the gallery and download your favorite moments.
                        </p>
                    </div>

                    {/* Empty State */}
                    {visibleImages.length === 0 ? (
                        <div className="text-center py-20">
                            <h3 className="mb-2 font-kaldera text-2xl text-plum-dark">No images yet</h3>
                            <p className="text-plum/80 mb-6">Check back soon for photos from our fifth dinner event!</p>
                        </div>
                    ) : (
                        <>
                            {/* Gallery Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                                {images.filter(img => !brokenIds.has(img._id)).map((image, index) => (
                                    <div
                                        key={image._id}
                                        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
                                        onClick={() => setSelectedImage(image)}
                                    >
                                        <img
                                            src={image.cloudinaryUrl}
                                            alt={`Photo ${index + 1}`}
                                            className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                            onError={() => handleImageError(image._id)}
                                        />
                                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-plum-dark/70 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                            <span className="text-sm text-cream">
                                                Photo {index + 1}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Back to Gallery Button */}
                    <div className="pb-8 text-center">
                        <Link
                            to="/events"
                            className="inline-flex items-center gap-2 rounded-full border border-plum-dark/15 px-6 py-2.5 text-sm text-plum-dark transition-colors hover:bg-plum-dark/5"
                        >
                            <ArrowLeft size={15} />
                            Back to Events
                        </Link>
                    </div>

                    {/* Modal for enlarged image */}
                    {selectedImage && (
                        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                            <div className="relative max-w-4xl max-h-full">
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute -top-12 right-0 flex items-center gap-1.5 text-sm text-cream/80 transition-colors hover:text-cream"
                                >
                                    <X size={16} />
                                    Close
                                </button>

                                <img
                                    src={selectedImage.cloudinaryUrl}
                                    alt={`Photo ${visibleImages.findIndex(img => img._id === selectedImage._id) + 1}`}
                                    className="max-w-full max-h-[80vh] object-contain rounded-lg"
                                />

                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                                    <button
                                        onClick={() => {
                                            const currentIndex = visibleImages.findIndex(img => img._id === selectedImage._id);
                                            downloadImage(selectedImage, currentIndex);
                                        }}
                                        className="flex items-center gap-2 rounded-full bg-cream px-5 py-2 text-sm text-plum-dark transition-colors hover:bg-white"
                                    >
                                        <Download size={15} />
                                        Download
                                    </button>

                                    <button
                                        onClick={() => {
                                            const prevImage = getPreviousImage();
                                            if (prevImage) setSelectedImage(prevImage);
                                        }}
                                        className="rounded-full bg-white/10 p-2.5 text-cream transition-colors hover:bg-white/20"
                                        aria-label="Previous"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>

                                    <button
                                        onClick={() => {
                                            const nextImage = getNextImage();
                                            if (nextImage) setSelectedImage(nextImage);
                                        }}
                                        className="rounded-full bg-white/10 p-2.5 text-cream transition-colors hover:bg-white/20"
                                        aria-label="Next"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>

                                <div className="text-cream text-center mt-2">
                                    Photo {visibleImages.findIndex(img => img._id === selectedImage._id) + 1} of {visibleImages.length}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}