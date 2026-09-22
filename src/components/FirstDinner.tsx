import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Link } from 'react-router-dom';

export function FirstDinner() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Generate image paths from fd1 to fd56
    const imagePaths = Array.from({ length: 56 }, (_, i) =>
        `/dinnerimages/fd${i + 1}.jpeg`
    );

    const downloadImage = (imagePath: string) => {
        const link = document.createElement('a');
        link.href = imagePath;
        link.download = `first-dinner-${imagePath.split('/').pop()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
            <main className="min-h-screen bg-cream pt-28 pb-8 md:pt-32">
                <div className="container mx-auto max-w-6xl px-4">
                    {/* Header Section */}
                    <div className="mb-12 text-center">
                        <Link to="/events" className="mb-4 inline-flex items-center gap-1.5 text-sm text-plum/50 transition-colors hover:text-plum-dark">
                            <ArrowLeft size={14} />
                            Events
                        </Link>
                        <br />
                        <h1 className="font-kaldera text-4xl text-plum-dark sm:text-5xl">
                            First <span className="italic">Dinner</span>
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-plum/60">
                            Step inside our first Wear Something Borrowed Dinner event.
                            Browse through the gallery and download your favorite moments.
                        </p>
                    </div>

                    {/* Gallery Grid */}
                    <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {imagePaths.map((imagePath, index) => (
                            <div
                                key={index}
                                className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
                                onClick={() => setSelectedImage(imagePath)}
                            >
                                <img
                                    src={imagePath}
                                    alt={`First Dinner Moment ${index + 1}`}
                                    className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                    }}
                                />
                                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-plum-dark/70 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <span className="text-sm text-cream">
                                        Photo {index + 1}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

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
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
                            <div className="relative max-h-full max-w-4xl">
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute -top-12 right-0 flex items-center gap-1.5 text-sm text-cream/80 transition-colors hover:text-cream"
                                >
                                    <X size={16} />
                                    Close
                                </button>

                                <img
                                    src={selectedImage}
                                    alt="Enlarged view"
                                    className="max-h-[80vh] max-w-full rounded-lg object-contain"
                                />

                                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform gap-4">
                                    <button
                                        onClick={() => downloadImage(selectedImage)}
                                        className="flex items-center gap-2 rounded-full bg-cream px-5 py-2 text-sm text-plum-dark transition-colors hover:bg-white"
                                    >
                                        <Download size={15} />
                                        Download
                                    </button>

                                    <button
                                        onClick={() => {
                                            const currentIndex = imagePaths.indexOf(selectedImage);
                                            const prevIndex = (currentIndex - 1 + imagePaths.length) % imagePaths.length;
                                            setSelectedImage(imagePaths[prevIndex]);
                                        }}
                                        className="rounded-full bg-white/10 p-2.5 text-cream transition-colors hover:bg-white/20"
                                        aria-label="Previous"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>

                                    <button
                                        onClick={() => {
                                            const currentIndex = imagePaths.indexOf(selectedImage);
                                            const nextIndex = (currentIndex + 1) % imagePaths.length;
                                            setSelectedImage(imagePaths[nextIndex]);
                                        }}
                                        className="rounded-full bg-white/10 p-2.5 text-cream transition-colors hover:bg-white/20"
                                        aria-label="Next"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>

                                <div className="mt-2 text-center text-sm text-cream/60">
                                    Photo {imagePaths.indexOf(selectedImage) + 1} of {imagePaths.length}
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
