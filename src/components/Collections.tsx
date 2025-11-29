import { useState } from 'react';
import { ArrowLeft, Filter, X, Search, ArrowRight } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Link } from 'react-router-dom';

interface Outfit {
    id: number;
    name: string;
    image: string;
    description: string;
    size: string;
    category: string;
}

export function Collections() {
    const [showFilters, setShowFilters] = useState(false);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCollection, setActiveCollection] = useState<'upcoming' | 'past'>('upcoming');

    const outfits: Outfit[] = [
        { id: 1, name: "Lyn's #1 Outfit", image: "/clothe1.jpg", description: "Deep red set (xs/s)", size: "XS/S", category: "Set" },
        { id: 2, name: "Valerija's #1 Outfit", image: "/clothe2.jpg", description: "Sleeveless ivory blouse featuring cascading horizontal ruffles for a soft, romantic silhouette", size: "M", category: "Top" },
        { id: 3, name: "Clara's #3 Piece", image: "/clothe3.jpg", description: "Vest in grey pinstripe fabric featuring a single-button closure and structured lapels. Its oversized cut offers a modern twist", size: "XL", category: "Vest" },
        { id: 4, name: "Clara's #2 Piece", image: "/clothe4.jpg", description: "A chic envelope-style clutch featuring gold and ivory chevron beadwork with playful fringe detailing", size: "One Size", category: "Accessory" },
        { id: 5, name: "Clara's #1 Piece", image: "/clothe5.jpg", description: "Single shoulder strap Black Fringe Hobo Bag", size: "One Size", category: "Accessory" },
        { id: 6, name: "Alice's #2 Outfit", image: "/clothe6.jpg", description: "Jean top and linen white pants", size: "S", category: "Set" },
        { id: 7, name: "Alice's #1 Outfit", image: "/clothe7.jpg", description: "Halter-neck mini dress featuring a soft leopard print and tiered ruffle layers", size: "S", category: "Dress" },
        { id: 8, name: "Anna's #1 Outfit", image: "/clothe8.jpg", description: "A sleek and minimal beige mini dress featuring a structured, corset-inspired bodice and smooth silhouette", size: "S", category: "Dress" },
        { id: 9, name: "Alex's #2 Outfit", image: "/clothe9.png", description: "Leopard Print Short Dress", size: "S", category: "Dress" },
        { id: 10, name: "Katharina's #1 Outfit", image: "/clothe10.png", description: "Coral halter top paired with a floral paisley mini short", size: "M", category: "Set" },
        { id: 11, name: "TIPH's #1 Outfit", image: "/clothe11.jpg", description: "Leopard print shorts paired with a sleek black long-sleeve intimissimi top", size: "S", category: "Set" },
        { id: 12, name: "JANA's Outfit", image: "/clothe12.jpg", description: "Red midi dress with small v neck and ruffled sleeves and neckline", size: "S", category: "Dress" },
        { id: 13, name: "Antonia's #1", image: "/clothe13.jpg", description: "A matching two-piece set featuring a blue-and-white pinstripe pattern", size: "Unisize", category: "Set" },
        { id: 14, name: "Ling's #2 Outfit", image: "/clothe14.png", description: "Black sleeveless top paired with a flowing white tiered maxi skirt", size: "M", category: "Set" },
        { id: 15, name: "Alice's #1 Outfit", image: "/clothe15.png", description: "Fitted dark blue top paired with loose silk navy pants", size: "XS", category: "Set" },
        { id: 16, name: "Ling's #1 Outfit", image: "/clothe16.png", description: "Burgundy ruched off-shoulder top paired with a dark denim wrap-style skort", size: "M", category: "Set" },
        { id: 17, name: "VILDE's #1 OUTFIT", image: "/clothe17.png", description: "Short dark blue dress with open back", size: "M", category: "Dress" },
        { id: 18, name: "Jana's #1 Outfit", image: "/clothe18.jpg", description: "A vibrant red maxi dress adorned with bold pink and green floral prints, soft ruffle details and flutter sleeves", size: "S", category: "Dress" },
        { id: 19, name: "Alexandra's #1 Outfit", image: "/clothe19.png", description: "Light, flowy halter dress with a colorful bohemian print", size: "M", category: "Dress" },
        { id: 20, name: "EVA's #1 OUTFIT", image: "/clothe20.png", description: "A black cut-out maxi dress with intricate eyelet detailing throughout", size: "M", category: "Dress" },
        { id: 21, name: "Eva's #3 Outfit", image: "/clothe21.png", description: "Mini Dress, open back with jewelry detail", size: "S/M", category: "Dress" },
        { id: 22, name: "EVA's #4 Outfit", image: "/clothe22.png", description: "A sleek black slip dress featuring delicate spaghetti straps and a deep open back, elegantly outlined with a subtle pearled contour", size: "S/M", category: "Dress" },
        { id: 23, name: "LUDI's #1 OUTFIT", image: "/clothe23.png", description: "Vibrant one-shoulder mini dress with a playful lime-green and orange floral swirl print, featuring soft ruffles along the neckline", size: "36-38", category: "Dress" },
        { id: 24, name: "INGDRID's #2 OUTFIT", image: "/clothe24.png", description: "Flowy satin skirt with a bold brown leopard print", size: "M", category: "Skirt" },
        { id: 25, name: "Celestine's #1 Outfit", image: "/clothe25.png", description: "Open-back halter dress with a bright yellow, green, and blue floral print", size: "XS", category: "Dress" },
        { id: 26, name: "Celestine's #2 Outfit", image: "/clothe26.png", description: "Strapless halter-style maxi dress with a vibrant purple and pink paisley print", size: "0", category: "Dress" },
        { id: 27, name: "JANA's #4 OUTFIT", image: "/clothe27.jpg", description: "A long sleeve and skirt flowy set", size: "S", category: "Set" },
        { id: 28, name: "ALIX's Outfit", image: "/clothe28.jpg", description: "Short green dress with white daisy prints and ruffled straps", size: "S-M", category: "Dress" }
    ];

    const sizes = [...new Set(outfits.map(outfit => outfit.size))];
    const categories = [...new Set(outfits.map(outfit => outfit.category))];

    const filteredOutfits = outfits.filter(outfit => {
        const matchesSearch = outfit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            outfit.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSize = !selectedSize || outfit.size === selectedSize;
        const matchesCategory = !selectedCategory || outfit.category === selectedCategory;

        return matchesSearch && matchesSize && matchesCategory;
    });

    const clearFilters = () => {
        setSelectedSize('');
        setSelectedCategory('');
        setSearchTerm('');
    };

    const hasActiveFilters = selectedSize || selectedCategory || searchTerm;

    return (
        <div className="min-h-screen bg-[#FFF0C8]">
            <Header />

            {/* Collection Type Selector */}
            <div className="bg-[#5b1b3a] py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <button
                            onClick={() => setActiveCollection('upcoming')}
                            className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                                activeCollection === 'upcoming'
                                    ? 'bg-[#AD7301] text-white shadow-2xl'
                                    : 'bg-[#FFF0C8] text-[#5B1B3A] hover:bg-[#AD7301] hover:text-white'
                            }`}
                        >
                            Live Dinner Collection
                        </button>
                        <button
                            onClick={() => setActiveCollection('past')}
                            className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                                activeCollection === 'past'
                                    ? 'bg-[#AD7301] text-white shadow-2xl'
                                    : 'bg-[#FFF0C8] text-[#5B1B3A] hover:bg-[#AD7301] hover:text-white'
                            }`}
                        >
                            Past Dinner Collections
                        </button>
                    </div>
                </div>
            </div>

            {/* Header - Matching Main Header Style */}
            <header className="bg-[#5b1b3a] w-full sticky top-0 z-50 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        {/* Back Button */}
                        <button
                            onClick={() => window.history.back()}
                            className="text-[#FFF0C8] hover:text-[#AD7301] transition-all duration-300 ease-in-out transform hover:scale-110 flex items-center space-x-2"
                        >
                            <ArrowLeft size={24} />
                            <span className="font-medium hidden sm:inline">Back</span>
                        </button>

                        {/* Title */}
                        <div className="text-center">
                            <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-[#FFF0C8] transition-all duration-300 ease-in-out hover:text-[#AD7301] hover:scale-105">
                                COLLECTIONS
                            </h1>
                            <div className="text-lg md:text-xl text-[#AD7301] font-light italic mt-1">
                                {activeCollection === 'upcoming' ? 'Live Now!' : 'First Dinner Collection'}
                            </div>
                        </div>

                        {/* Filter Button - Solo mostrar para past collections */}
                        {activeCollection === 'past' && (
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="text-[#FFF0C8] hover:text-[#AD7301] transition-all duration-300 ease-in-out transform hover:scale-110 flex items-center space-x-2"
                            >
                                <Filter size={24} />
                                <span className="font-medium hidden sm:inline">Filter</span>
                            </button>
                        )}
                    </div>

                    {/* Search Bar - Only show for past collections */}
                    {activeCollection === 'past' && (
                        <div className="relative max-w-2xl mx-auto">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#5B1B3A] transition-all duration-300" size={20} />
                            <input
                                type="text"
                                placeholder="Search outfits by name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-full bg-[#FFF0C8] border-2 border-[#AD7301] focus:outline-none focus:border-[#891B81] focus:ring-2 focus:ring-[#AD7301]/30 text-[#5B1B3A] placeholder-[#5B1B3A]/60 transition-all duration-300 ease-in-out hover:shadow-lg"
                            />
                        </div>
                    )}
                </div>
            </header>

            {/* Filter Panel - Animated Slide Down - Only for past collections */}
            {activeCollection === 'past' && (
                <div
                    className={`bg-[#891B81] text-white shadow-lg overflow-hidden transition-all duration-500 ease-in-out ${
                        showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className="container mx-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold transition-all duration-300 hover:text-[#AD7301]">Filter Outfits</h3>
                            <div className="flex space-x-3">
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="bg-[#940000] text-white px-4 py-2 rounded-full hover:bg-[#AD7301] transition-all duration-300 font-medium transform hover:scale-105"
                                    >
                                        Clear All
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="bg-white text-[#5B1B3A] px-4 py-2 rounded-full hover:bg-[#FFF0C8] transition-all duration-300 font-medium transform hover:scale-105"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="transform transition-all duration-300 hover:scale-105">
                                <label className="block text-lg font-medium mb-3">Size</label>
                                <select
                                    value={selectedSize}
                                    onChange={(e) => setSelectedSize(e.target.value)}
                                    className="w-full bg-white text-[#5B1B3A] rounded-xl px-4 py-3 border-2 border-[#AD7301] focus:outline-none focus:border-[#4E4F06] focus:ring-2 focus:ring-[#AD7301]/30 transition-all duration-300"
                                >
                                    <option value="">All Sizes</option>
                                    {sizes.map(size => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="transform transition-all duration-300 hover:scale-105">
                                <label className="block text-lg font-medium mb-3">Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full bg-white text-[#5B1B3A] rounded-xl px-4 py-3 border-2 border-[#AD7301] focus:outline-none focus:border-[#4E4F06] focus:ring-2 focus:ring-[#AD7301]/30 transition-all duration-300"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                {activeCollection === 'upcoming' ? (
                    <div className="text-center py-16 animate-fadeIn">
                        <div className="bg-white rounded-2xl p-12 shadow-2xl border-2 border-[#AD7301] max-w-4xl mx-auto relative overflow-hidden">
                            {/* Efecto de brillo */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#AD7301] via-[#FFD166] to-[#AD7301] animate-pulse"></div>

                            <div className="relative z-10">
                                <h2 className="text-4xl font-bold text-[#5B1B3A] mb-6">Our New Collection is Live! </h2>

                                <p className="text-xl text-[#891B81] mb-8 font-medium">
                                    Discover our exclusive new outfits and accessories available for reservation
                                </p>

                                {/* Call to Action */}
                                <div className="bg-gradient-to-br from-[#5B1B3A] to-[#891B81] p-8 rounded-xl border-2 border-[#AD7301] mb-6">
                                    <p className="text-white text-lg mb-4 font-semibold">
                                        Ready to find your perfect outfit for the dinner?
                                    </p>
                                    <Link
                                        to="/dinner-collection-two"
                                        className="inline-flex items-center bg-[#AD7301] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#FFD166] hover:text-[#5B1B3A] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                    >
                                        Explore Live Collection
                                        <ArrowRight size={24} className="ml-2" />
                                    </Link>
                                </div>

                                {/* Additional Info */}
                                <div className="bg-[#FFF0C8] rounded-xl p-6 border-2 border-[#AD7301]">
                                    <p className="text-[#5B1B3A] font-medium">
                                        💫 <span className="font-bold">New Features:</span> Real-time availability, secure payment processing, and delivery scheduling
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-[#5B1B3A] text-lg font-medium">
                                Showing <span className="font-bold text-[#891B81]">{filteredOutfits.length}</span> of <span className="font-bold">{outfits.length}</span> outfits
                                {hasActiveFilters && (
                                    <span className="text-[#891B81] font-bold ml-2 animate-pulse">
                                        (filtered)
                                    </span>
                                )}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-[#940000] hover:text-[#891B81] font-medium transition-all duration-300 transform hover:scale-105"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>

                        {/* Outfits Grid */}
                        {filteredOutfits.length === 0 ? (
                            <div className="text-center py-16 animate-fadeIn">
                                <div className="text-[#5B1B3A] text-xl mb-4 font-semibold">No outfits found</div>
                                <button
                                    onClick={clearFilters}
                                    className="bg-[#891B81] text-white px-6 py-3 rounded-full hover:bg-[#940000] transition-all duration-300 font-medium transform hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {filteredOutfits.map((outfit, index) => (
                                    <div
                                        key={outfit.id}
                                        style={{
                                            animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                                        }}
                                        className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-300 relative group"
                                    >
                                        {/* Overlay de no disponible */}
                                        <div className="absolute inset-0 bg-gray-800 bg-opacity-70 z-10 flex items-center justify-center rounded-2xl">
                                            <div className="text-center text-white p-4">
                                                <div className="bg-[#5B1B3A] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                                                    <X size={32} />
                                                </div>
                                                <h3 className="text-xl font-bold mb-2">No Longer Available</h3>
                                                <p className="text-gray-300 text-sm">This outfit was part of a past collection</p>
                                            </div>
                                        </div>

                                        <div
                                            className="h-80 bg-gray-200 relative overflow-hidden"
                                        >
                                            <img
                                                src={outfit.image}
                                                alt={outfit.name}
                                                className="w-full h-full object-cover filter grayscale"
                                            />
                                            <div className="absolute top-4 left-4 bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                                                {outfit.size}
                                            </div>
                                            <div className="absolute top-4 right-4 bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                                                {outfit.category}
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="font-bold text-gray-500 text-lg mb-2">
                                                {outfit.name}
                                            </h3>
                                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                                {outfit.description}
                                            </p>
                                            <button
                                                disabled
                                                className="w-full bg-gray-400 text-white py-3 rounded-xl font-semibold cursor-not-allowed transition-all duration-300 shadow-lg"
                                            >
                                                Outfit No Longer Available
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <Footer />

            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }

                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .filter.grayscale {
                    filter: grayscale(100%);
                }
            `}</style>
        </div>
    );
}