// components/SecondDinner.tsx
import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

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
                // Filtrar imágenes por tags si es necesario (opcional)
                // Por ahora mostramos todas las imágenes activas
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

    const downloadImage = (image: ImageData) => {
        const link = document.createElement('a');
        link.href = image.cloudinaryUrl;
        link.download = `second-dinner-${image.originalName}`;
        link.target = '_blank'; // Abrir en nueva pestaña para descargas grandes
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const deleteImage = async (imageId: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/images/${imageId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                // Remover la imagen eliminada de la lista
                setImages(prevImages => prevImages.filter(img => img._id !== imageId));

                // Si la imagen seleccionada fue eliminada, cerrar el modal
                if (selectedImage && selectedImage._id === imageId) {
                    setSelectedImage(null);
                }

                alert('Image deleted successfully');
            } else {
                throw new Error(result.message || 'Failed to delete image');
            }
        } catch (err) {
            console.error('Error deleting image:', err);
            alert(err instanceof Error ? err.message : 'Failed to delete image');
        }
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
                            Retry
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
                            Browse through the gallery of our second MUSED Diner event.
                            All images are fetched from our database in real-time.
                        </p>

                        {/* Stats */}
                        <div className="mt-6 flex justify-center items-center gap-6">
                            <div className="bg-white/50 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg">
                                <span className="text-2xl font-bold text-plum">{images.length}</span>
                                <span className="text-plum/80 ml-2">Images</span>
                            </div>
                            <button
                                onClick={fetchImages}
                                className="bg-plum text-cream px-4 py-2 rounded-full hover:bg-gold transition-all duration-300 font-semibold flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Empty State */}
                    {images.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-5xl mb-4">📷</div>
                            <h3 className="text-2xl font-bold text-plum mb-2">No Images Found</h3>
                            <p className="text-plum/80 mb-6">Upload some images to see them here!</p>
                            <a
                                href="/upload-images"
                                className="bg-gold text-plum px-6 py-3 rounded-full hover:bg-plum hover:text-cream transition-all duration-300 font-semibold inline-block"
                            >
                                Go to Upload Page
                            </a>
                        </div>
                    ) : (
                        <>
                            {/* Gallery Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                                {images.map((image) => (
                                    <div
                                        key={image._id}
                                        className="group relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                        onClick={() => setSelectedImage(image)}
                                    >
                                        <img
                                            src={image.cloudinaryUrl}
                                            alt={image.originalName}
                                            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                                            loading="lazy"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-4">
                                            <span className="text-cream font-semibold text-center mb-2">
                                                {image.originalName.length > 20
                                                    ? `${image.originalName.substring(0, 20)}...`
                                                    : image.originalName}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        downloadImage(image);
                                                    }}
                                                    className="bg-gold/80 hover:bg-gold text-plum px-3 py-1 rounded-full text-sm transition-all duration-300"
                                                >
                                                    Download
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteImage(image._id);
                                                    }}
                                                    className="bg-red-500/80 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm transition-all duration-300"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        <div className="absolute top-2 right-2 bg-black/50 text-cream text-xs px-2 py-1 rounded">
                                            {image.format.split('/')[1]}
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
                                            alt={selectedImage.originalName}
                                            className="max-w-full max-h-[80vh] object-contain rounded-lg"
                                        />

                                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 flex-wrap justify-center">
                                            <button
                                                onClick={() => downloadImage(selectedImage)}
                                                className="bg-gold text-plum px-6 py-2 rounded-full hover:bg-plum hover:text-cream transition-all duration-300 font-semibold flex items-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const prevImage = getPreviousImage();
                                                    if (prevImage) setSelectedImage(prevImage);
                                                }}
                                                className="bg-plum text-cream px-4 py-2 rounded-full hover:bg-gold transition-all duration-300 font-semibold"
                                            >
                                                ← Previous
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const nextImage = getNextImage();
                                                    if (nextImage) setSelectedImage(nextImage);
                                                }}
                                                className="bg-plum text-cream px-4 py-2 rounded-full hover:bg-gold transition-all duration-300 font-semibold"
                                            >
                                                Next →
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteImage(selectedImage._id);
                                                }}
                                                className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-all duration-300 font-semibold"
                                            >
                                                Delete Image
                                            </button>
                                        </div>

                                        <div className="text-cream text-center mt-4">
                                            <div className="font-bold">
                                                {selectedImage.originalName}
                                            </div>
                                            <div className="text-sm opacity-80">
                                                Size: {(selectedImage.size / 1024 / 1024).toFixed(2)} MB •
                                                Format: {selectedImage.format} •
                                                Uploaded: {new Date(selectedImage.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="mt-2">
                                                Photo {images.findIndex(img => img._id === selectedImage._id) + 1} of {images.length}
                                            </div>
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