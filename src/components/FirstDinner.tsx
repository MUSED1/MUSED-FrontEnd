// components/FirstDinner.tsx
import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

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
            <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-8">
                <div className="container mx-auto px-4">
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-6xl font-bold text-plum mb-6">
                            First <span className="text-gold">Dinner</span>
                        </h1>
                        <p className="text-xl text-plum/80 max-w-2xl mx-auto">
                            Relive the magic of our inaugural MUSED Diner event.
                            Browse through the gallery and download your favorite moments.
                        </p>
                    </div>

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                        {imagePaths.map((imagePath, index) => (
                            <div
                                key={index}
                                className="group relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                onClick={() => setSelectedImage(imagePath)}
                            >
                                <img
                                    src={imagePath}
                                    alt={`First Dinner Moment ${index + 1}`}
                                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
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
                                    src={selectedImage}
                                    alt="Enlarged view"
                                    className="max-w-full max-h-[80vh] object-contain rounded-lg"
                                />

                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
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
                                        onClick={() => {
                                            const currentIndex = imagePaths.indexOf(selectedImage);
                                            const prevIndex = (currentIndex - 1 + imagePaths.length) % imagePaths.length;
                                            setSelectedImage(imagePaths[prevIndex]);
                                        }}
                                        className="bg-plum text-cream px-4 py-2 rounded-full hover:bg-gold transition-all duration-300 font-semibold"
                                    >
                                        ← Previous
                                    </button>

                                    <button
                                        onClick={() => {
                                            const currentIndex = imagePaths.indexOf(selectedImage);
                                            const nextIndex = (currentIndex + 1) % imagePaths.length;
                                            setSelectedImage(imagePaths[nextIndex]);
                                        }}
                                        className="bg-plum text-cream px-4 py-2 rounded-full hover:bg-gold transition-all duration-300 font-semibold"
                                    >
                                        Next →
                                    </button>
                                </div>

                                <div className="text-cream text-center mt-2">
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