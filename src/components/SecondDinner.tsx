// components/SecondDinner.tsx
import { useState, useEffect } from 'react';
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

export function SecondDinner() {
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
    const [images, setImages] = useState<ImageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            setLoading(true);
            setError(null);

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
                setImages(result.data || []);
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

    const downloadImage = (image: ImageData, index: number) => {
        const link = document.createElement('a');
        link.href = image.cloudinaryUrl;
        link.download = `second-dinner-photo-${index + 1}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getPreviousImage = () => {
        if (!selectedImage) return null;
        const currentIndex = images.findIndex(img => img._id === selectedImage._id);
        return currentIndex > 0 ? images[currentIndex - 1] : images[images.length - 1];
    };

    const getNextImage = () => {
        if (!selectedImage) return null;
        const currentIndex = images.findIndex(img => img._id === selectedImage._id);
        return currentIndex < images.length - 1 ? images[currentIndex + 1] : images[0];
    };

    if (loading) {
        return (
            <div className="font-sans">
                <Header />
                <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-8">
                    <div className="container mx-auto px-4 text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mb-4"></div>
                        <p className="text-plum text-xl">Loading images...</p>
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
                <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-8">
                    <div className="container mx-auto px-4 text-center py-20">
                        <div className="text-red-600 text-4xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-plum mb-4">Error Loading Images</h2>
                        <p className="text-plum/80 mb-6">{error}</p>
                        <button
                            onClick={fetchImages}
                            className="bg-gold text-plum px-6 py-3 rounded-full hover:bg-plum hover:text-cream transition-all duration-300 font-semibold"
                        >
                            Try Again
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
            <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-8">
                <div className="container mx-auto px-4">
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-6xl font-bold text-plum mb-6">
                            Second <span className="text-gold">Dinner</span>
                        </h1>
                        <p className="text-xl text-plum/80 max-w-2xl mx-auto">
                            Relive the magic of our second MUSED Diner event.
                            Browse through the gallery and download your favorite moments.
                        </p>

                        {/* Navigation to First Dinner */}
                        <div className="mt-8">
                            <Link
                                to="/first-dinner"
                                className="inline-flex items-center gap-2 bg-plum text-cream px-6 py-3 rounded-full hover:bg-gold hover:text-plum transition-all duration-300 font-semibold"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                                </svg>
                                View First Dinner Gallery
                            </Link>
                        </div>
                    </div>

                    {/* Empty State */}
                    {images.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-5xl mb-4">📷</div>
                            <h3 className="text-2xl font-bold text-plum mb-2">No Images Yet</h3>
                            <p className="text-plum/80 mb-6">Check back soon for photos from our second dinner event!</p>
                        </div>
                    ) : (
                        <>
                            {/* Gallery Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                                {images.map((image, index) => (
                                    <div
                                        key={image._id}
                                        className="group relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                        onClick={() => setSelectedImage(image)}
                                    >
                                        <img
                                            src={image.cloudinaryUrl}
                                            alt={`Photo ${index + 1}`}
                                            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                                            loading="lazy"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                                            <span className="text-cream font-semibold text-lg">
                                                Photo {index + 1}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Modal for enlarged image */}
                            {selectedImage && (
                                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                                    <div className="relative max-w-4xl max-h-full">
                                        <button
                                            onClick={() => setSelectedImage(null)}
                                            className="absolute -top-12 right-0 text-cream hover:text-gold transition-colors duration-300 text-2xl font-bold"
                                        >
                                            ✕ Close
                                        </button>

                                        <img
                                            src={selectedImage.cloudinaryUrl}
                                            alt={`Photo ${images.findIndex(img => img._id === selectedImage._id) + 1}`}
                                            className="max-w-full max-h-[80vh] object-contain rounded-lg"
                                        />

                                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                                            <button
                                                onClick={() => {
                                                    const currentIndex = images.findIndex(img => img._id === selectedImage._id);
                                                    downloadImage(selectedImage, currentIndex);
                                                }}
                                                className="bg-gold text-plum px-6 py-2 rounded-full hover:bg-plum hover:text-cream transition-all duration-300 font-semibold flex items-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download
                                            </button>

                                            <button
                                                onClick={() => {
                                                    const prevImage = getPreviousImage();
                                                    if (prevImage) setSelectedImage(prevImage);
                                                }}
                                                className="bg-plum text-cream px-4 py-2 rounded-full hover:bg-gold transition-all duration-300 font-semibold"
                                            >
                                                ← Previous
                                            </button>

                                            <button
                                                onClick={() => {
                                                    const nextImage = getNextImage();
                                                    if (nextImage) setSelectedImage(nextImage);
                                                }}
                                                className="bg-plum text-cream px-4 py-2 rounded-full hover:bg-gold transition-all duration-300 font-semibold"
                                            >
                                                Next →
                                            </button>
                                        </div>

                                        <div className="text-cream text-center mt-2">
                                            Photo {images.findIndex(img => img._id === selectedImage._id) + 1} of {images.length}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}