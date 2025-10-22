import React, { useState } from 'react';
import { ArrowLeft, Filter, X, Search, Ruler, Tag, Calendar, User, MapPin, Phone, Mail } from 'lucide-react';

interface Outfit {
    id: number;
    name: string;
    image: string;
    description: string;
    size: string;
    category: string;
}

export function Collections() {
    const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const outfits: Outfit[] = [
        { id: 1, name: "Lyn's #1 Outfit", image: "src/assets/clothe1.jpg", description: "Deep red set (xs/s)", size: "XS/S", category: "Set" },
        { id: 2, name: "Valerija's #1 Outfit", image: "src/assets/clothe2.jpg", description: "Sleeveless ivory blouse featuring cascading horizontal ruffles for a soft, romantic silhouette", size: "M", category: "Top" },
        { id: 3, name: "Clara's #3 Piece", image: "src/assets/clothe3.jpg", description: "Vest in grey pinstripe fabric featuring a single-button closure and structured lapels. Its oversized cut offers a modern twist", size: "XL", category: "Vest" },
        { id: 4, name: "Clara's #2 Piece", image: "src/assets/clothe4.jpg", description: "A chic envelope-style clutch featuring gold and ivory chevron beadwork with playful fringe detailing", size: "One Size", category: "Accessory" },
        { id: 5, name: "Clara's #1 Piece", image: "src/assets/clothe5.jpg", description: "Single shoulder strap Black Fringe Hobo Bag", size: "One Size", category: "Accessory" },
        { id: 6, name: "Alice's #2 Outfit", image: "src/assets/clothe6.jpg", description: "Jean top and linen white pants", size: "S", category: "Set" },
        { id: 7, name: "Alice's #1 Outfit", image: "src/assets/clothe7.jpg", description: "Halter-neck mini dress featuring a soft leopard print and tiered ruffle layers", size: "S", category: "Dress" },
        { id: 8, name: "Anna's #1 Outfit", image: "src/assets/clothe8.jpg", description: "A sleek and minimal beige mini dress featuring a structured, corset-inspired bodice and smooth silhouette", size: "S", category: "Dress" },
        { id: 9, name: "Alex's #2 Outfit", image: "src/assets/clothe9.png", description: "Leopard Print Short Dress", size: "S", category: "Dress" },
        { id: 10, name: "Katharina's #1 Outfit", image: "src/assets/clothe10.png", description: "Coral halter top paired with a floral paisley mini short", size: "M", category: "Set" },
        { id: 11, name: "TIPH's #1 Outfit", image: "src/assets/clothe11.jpg", description: "Leopard print shorts paired with a sleek black long-sleeve intimissimi top", size: "S", category: "Set" },
        { id: 12, name: "JANA's Outfit", image: "src/assets/clothe12.jpg", description: "Red midi dress with small v neck and ruffled sleeves and neckline", size: "S", category: "Dress" },
        { id: 13, name: "Antonia's #1", image: "src/assets/clothe13.jpg", description: "A matching two-piece set featuring a blue-and-white pinstripe pattern", size: "Unisize", category: "Set" },
        { id: 14, name: "Ling's #2 Outfit", image: "src/assets/clothe14.png", description: "Black sleeveless top paired with a flowing white tiered maxi skirt", size: "M", category: "Set" },
        { id: 15, name: "Alice's #1 Outfit", image: "src/assets/clothe15.png", description: "Fitted dark blue top paired with loose silk navy pants", size: "XS", category: "Set" },
        { id: 16, name: "Ling's #1 Outfit", image: "src/assets/clothe16.png", description: "Burgundy ruched off-shoulder top paired with a dark denim wrap-style skort", size: "M", category: "Set" },
        { id: 17, name: "VILDE's #1 OUTFIT", image: "src/assets/clothe17.png", description: "Short dark blue dress with open back", size: "M", category: "Dress" },
        { id: 18, name: "Jana's #1 Outfit", image: "src/assets/clothe18.jpg", description: "A vibrant red maxi dress adorned with bold pink and green floral prints, soft ruffle details and flutter sleeves", size: "S", category: "Dress" },
        { id: 19, name: "Alexandra's #1 Outfit", image: "src/assets/clothe19.png", description: "Light, flowy halter dress with a colorful bohemian print", size: "M", category: "Dress" },
        { id: 20, name: "EVA's #1 OUTFIT", image: "src/assets/clothe20.png", description: "A black cut-out maxi dress with intricate eyelet detailing throughout", size: "M", category: "Dress" },
        { id: 21, name: "Eva's #3 Outfit", image: "src/assets/clothe21.png", description: "Mini Dress, open back with jewelry detail", size: "S/M", category: "Dress" },
        { id: 22, name: "EVA's #4 Outfit", image: "src/assets/clothe22.png", description: "A sleek black slip dress featuring delicate spaghetti straps and a deep open back, elegantly outlined with a subtle pearled contour", size: "S/M", category: "Dress" },
        { id: 23, name: "LUDI's #1 OUTFIT", image: "src/assets/clothe23.png", description: "Vibrant one-shoulder mini dress with a playful lime-green and orange floral swirl print, featuring soft ruffles along the neckline", size: "36-38", category: "Dress" },
        { id: 24, name: "INGDRID's #2 OUTFIT", image: "src/assets/clothe24.png", description: "Flowy satin skirt with a bold brown leopard print", size: "M", category: "Skirt" },
        { id: 25, name: "Celestine's #1 Outfit", image: "src/assets/clothe25.png", description: "Open-back halter dress with a bright yellow, green, and blue floral print", size: "XS", category: "Dress" },
        { id: 26, name: "Celestine's #2 Outfit", image: "src/assets/clothe26.png", description: "Strapless halter-style maxi dress with a vibrant purple and pink paisley print", size: "0", category: "Dress" },
        { id: 27, name: "JANA's #4 OUTFIT", image: "src/assets/clothe27.jpg", description: "A long sleeve and skirt flowy set", size: "S", category: "Set" },
        { id: 28, name: "ALIX's Outfit", image: "src/assets/clothe28.jpg", description: "Short green dress with white daisy prints and ruffled straps", size: "S-M", category: "Dress" }
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
                                First Dinner Collection
                            </div>
                        </div>

                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="text-[#FFF0C8] hover:text-[#AD7301] transition-all duration-300 ease-in-out transform hover:scale-110 flex items-center space-x-2"
                        >
                            <Filter size={24} />
                            <span className="font-medium hidden sm:inline">Filter</span>
                        </button>
                    </div>

                    {/* Search Bar */}
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
                </div>
            </header>

            {/* Filter Panel - Animated Slide Down */}
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

            {/* Results Info */}
            <div className="container mx-auto px-4 py-6">
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
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#AD7301] group"
                            >
                                <div
                                    className="h-80 bg-gray-200 relative overflow-hidden cursor-pointer"
                                    onClick={() => setSelectedOutfit(outfit)}
                                >
                                    <img
                                        src={outfit.image}
                                        alt={outfit.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="absolute top-4 left-4 bg-[#5B1B3A] text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                        {outfit.size}
                                    </div>
                                    <div className="absolute top-4 right-4 bg-[#AD7301] text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                        {outfit.category}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-[#5B1B3A] text-lg mb-2 group-hover:text-[#891B81] transition-colors duration-300">
                                        {outfit.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {outfit.description}
                                    </p>
                                    <button
                                        onClick={() => setSelectedOutfit(outfit)}
                                        className="w-full bg-[#891B81] text-white py-3 rounded-xl font-semibold hover:bg-[#940000] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Request This Outfit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Reservation Modal */}
            {selectedOutfit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform animate-scaleIn">
                        <div className="relative">
                            <img
                                src={selectedOutfit.image}
                                alt={selectedOutfit.name}
                                className="w-full h-80 object-cover"
                            />
                            <button
                                onClick={() => setSelectedOutfit(null)}
                                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 hover:rotate-90 shadow-lg"
                            >
                                <X size={24} className="text-[#5B1B3A]" />
                            </button>
                        </div>

                        <div className="p-8">
                            <h2 className="text-3xl font-bold text-[#5B1B3A] mb-3">{selectedOutfit.name}</h2>
                            <p className="text-gray-600 text-lg mb-6">{selectedOutfit.description}</p>

                            {/* Elegant Size and Category Display */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-gradient-to-br from-[#5B1B3A] to-[#891B81] p-4 rounded-xl text-white transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                    <div className="flex items-center space-x-3">
                                        <Ruler className="text-[#AD7301]" size={24} />
                                        <div>
                                            <p className="text-sm font-semibold opacity-90">Size</p>
                                            <p className="text-xl font-bold">{selectedOutfit.size}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-[#AD7301] to-[#FFD166] p-4 rounded-xl text-[#5B1B3A] transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                    <div className="flex items-center space-x-3">
                                        <Tag className="text-[#891B81]" size={24} />
                                        <div>
                                            <p className="text-sm font-semibold opacity-90">Category</p>
                                            <p className="text-xl font-bold">{selectedOutfit.category}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <ReservationForm outfit={selectedOutfit} onClose={() => setSelectedOutfit(null)} />
                        </div>
                    </div>
                </div>
            )}

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
            `}</style>
        </div>
    );
}

// Reservation Form Component
function ReservationForm({ outfit, onClose }: { outfit: Outfit; onClose: () => void }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        instructions: '',
        pickupDate: '',
        agreeToTerms: false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Reservation request:', { outfit, ...formData });
        alert('Reservation request submitted successfully! We will contact you soon.');
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-2xl font-bold text-[#5B1B3A] mb-2">Reserve This Outfit</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="transform transition-all duration-300 hover:scale-105">
                    <label className="block text-sm font-semibold text-[#5B1B3A] mb-2 flex items-center">
                        <User size={16} className="mr-2 text-[#891B81]" />
                        Full Name *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#891B81] focus:border-[#891B81] text-[#5B1B3A] transition-all duration-300"
                        placeholder="Enter your full name"
                    />
                </div>
                <div className="transform transition-all duration-300 hover:scale-105">
                    <label className="block text-sm font-semibold text-[#5B1B3A] mb-2 flex items-center">
                        <Mail size={16} className="mr-2 text-[#891B81]" />
                        Email *
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#891B81] focus:border-[#891B81] text-[#5B1B3A] transition-all duration-300"
                        placeholder="Enter your email"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="transform transition-all duration-300 hover:scale-105">
                    <label className="block text-sm font-semibold text-[#5B1B3A] mb-2 flex items-center">
                        <Phone size={16} className="mr-2 text-[#891B81]" />
                        Phone Number *
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#891B81] focus:border-[#891B81] text-[#5B1B3A] transition-all duration-300"
                        placeholder="Enter your phone number"
                    />
                </div>
                <div className="transform transition-all duration-300 hover:scale-105">
                    <label className="block text-sm font-semibold text-[#5B1B3A] mb-2 flex items-center">
                        <Calendar size={16} className="mr-2 text-[#891B81]" />
                        Preferred Pickup Date *
                    </label>
                    <input
                        type="date"
                        name="pickupDate"
                        value={formData.pickupDate}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#891B81] focus:border-[#891B81] text-[#5B1B3A] transition-all duration-300"
                    />
                </div>
            </div>

            <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-semibold text-[#5B1B3A] mb-2 flex items-center">
                    <MapPin size={16} className="mr-2 text-[#891B81]" />
                    Delivery Address *
                </label>
                <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#891B81] focus:border-[#891B81] text-[#5B1B3A] transition-all duration-300"
                    placeholder="Enter your complete delivery address"
                />
            </div>

            <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-semibold text-[#5B1B3A] mb-2">Special Instructions</label>
                <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#891B81] focus:border-[#891B81] text-[#5B1B3A] transition-all duration-300"
                    placeholder="Any special requests, styling preferences, or instructions..."
                />
            </div>

            <div className="bg-gradient-to-br from-[#FFF0C8] to-[#FFE8A5] p-6 rounded-xl border-2 border-[#AD7301] transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className="flex items-start space-x-4">
                    <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        required
                        className="mt-1 w-5 h-5 text-[#891B81] focus:ring-[#891B81] border-gray-300 rounded transition-all duration-300"
                    />
                    <label className="text-sm text-[#5B1B3A] font-medium">
                        I agree to treat the borrowed item with care and cover any repair or replacement costs for damage beyond normal wear.
                    </label>
                </div>
            </div>

            <div className="flex space-x-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-gray-300 text-[#5B1B3A] py-4 rounded-xl font-semibold hover:bg-gray-400 transition-all duration-300 transform hover:scale-105"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!formData.agreeToTerms}
                    className="flex-1 bg-gradient-to-r from-[#940000] to-[#891B81] text-white py-4 rounded-xl font-semibold hover:from-[#891B81] hover:to-[#5B1B3A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    Submit Reservation
                </button>
            </div>
        </form>
    );
}