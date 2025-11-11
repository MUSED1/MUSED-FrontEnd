import React, { useState, useEffect } from 'react';
import { ArrowLeft, Filter, X, Search, Ruler, Tag, Calendar, User, MapPin, Phone, Mail, Loader2, EyeOff, CreditCard } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';

interface ClothingItem {
    _id: string;
    images: string[];
    size: string;
    category: string;
    address: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    pickupMethod: string;
    pickupTime?: string;
    pickupDay?: string;
    pickupInstructions?: string;
    specialInstructions?: string;
    status: 'available' | 'reserved' | 'donated';
    createdAt: string;
    updatedAt: string;
}

interface Outfit {
    id: string;
    name: string;
    image: string;
    description: string;
    size: string;
    category: string;
    status: string;
}

interface ReservationFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    instructions: string;
    pickupDate: string;
    pickupMethod: string;
    agreeToTerms: boolean;
}

// Stripe configuration
const STRIPE_PAYMENT_URL = 'https://buy.stripe.com/test_5kQ14mcsSdKi0Ml7Ayfw402';
export function DinnerCollectionTwo() {
    const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCollection, setActiveCollection] = useState<'available' | 'all'>('available');
    const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [, setReservationData] = useState<{formData: ReservationFormData, outfit: Outfit} | null>(null);
    const [processingPayment, setProcessingPayment] = useState(false);

    const API_BASE_URL = 'https://mused-backend.onrender.com/api/clothing';

    // Fetch clothing items from API
    useEffect(() => {
        const fetchClothingItems = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(API_BASE_URL);

                if (!response.ok) {
                    throw new Error(`Failed to fetch clothing items: ${response.status}`);
                }

                const result = await response.json();

                if (result.success) {
                    setClothingItems(result.data || []);
                } else {
                    throw new Error(result.message || 'Failed to fetch clothing items');
                }
            } catch (err) {
                console.error('Error fetching clothing items:', err);
                setError(err instanceof Error ? err.message : 'An error occurred while fetching clothing items');
            } finally {
                setLoading(false);
            }
        };

        fetchClothingItems();
    }, []);

    // Transform API data to outfit format
    const outfits: Outfit[] = clothingItems.map(item => ({
        id: item._id,
        name: `${item.fullName}'s ${item.category}`,
        image: item.images[0] || '/placeholder-clothing.jpg',
        description: `${item.category} in size ${item.size}${item.specialInstructions ? ` - ${item.specialInstructions}` : ''}`,
        size: item.size,
        category: item.category,
        status: item.status
    }));

    const sizes = [...new Set(outfits.map(outfit => outfit.size))];
    const categories = [...new Set(outfits.map(outfit => outfit.category))];

    const filteredOutfits = outfits.filter(outfit => {
        // Filter by collection type
        if (activeCollection === 'available' && outfit.status !== 'available') {
            return false;
        }

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

    // Handle reservation submission with payment flow
    const handleReservation = async (formData: ReservationFormData, outfit: Outfit) => {
        try {
            // Store reservation data for after payment
            setReservationData({ formData, outfit });

            // Process payment first
            await processPayment(formData, outfit);

        } catch (error) {
            console.error('Reservation error:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            alert(`Failed to process reservation: ${errorMessage}`);
            setProcessingPayment(false);
        }
    };

    // Process payment via Stripe
    const processPayment = async (formData: ReservationFormData, outfit: Outfit) => {
        setProcessingPayment(true);

        try {
            // Create a unique session ID for this reservation
            const sessionId = `reservation_${outfit.id}_${Date.now()}`;

            // Store reservation data in localStorage for recovery after payment
            const reservationSession = {
                sessionId,
                formData,
                outfit,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('pendingReservation', JSON.stringify(reservationSession));

            // Redirect to Stripe payment with success URL parameters
            const paymentUrl = `${STRIPE_PAYMENT_URL}?client_reference_id=${sessionId}&prefilled_email=${encodeURIComponent(formData.email)}`;

            // Use window.location.replace to avoid issues with back button
            window.location.replace(paymentUrl);

        } catch (err) {
            console.error('Payment processing error:', err);
            setProcessingPayment(false);
            throw new Error('Failed to process payment');
        }
    };

    // Check for successful payment return and complete reservation
    useEffect(() => {
        const checkPaymentStatus = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const paymentSuccess = urlParams.get('payment_success');
            const sessionId = urlParams.get('session_id');

            // Only process if we're coming from Stripe with success indication
            if (paymentSuccess === 'true' && sessionId) {
                // Try to get reservation data from localStorage
                const pendingReservation = localStorage.getItem('pendingReservation');

                if (pendingReservation) {
                    try {
                        const { formData, outfit } = JSON.parse(pendingReservation);
                        await completeReservation(formData, outfit);

                        // Clear the pending reservation
                        localStorage.removeItem('pendingReservation');

                        // Redirect to confirmation page if not already there
                        if (window.location.pathname !== '/confirmation') {
                            window.location.href = '/confirmation';
                        }
                    } catch (error) {
                        console.error('Error completing reservation after payment:', error);
                        alert('Payment was successful but reservation failed. Please contact support.');
                    }
                }
            }
        };

        checkPaymentStatus();
    }, []);

    // Complete reservation after successful payment
    const completeReservation = async (formData: ReservationFormData, outfit: Outfit) => {
        try {
            const reservationData = {
                fullName: formData.name,
                email: formData.email,
                phoneNumber: formData.phone,
                pickupMethod: formData.pickupMethod,
                pickupTime: formData.pickupDate,
                pickupDay: '',
                pickupInstructions: formData.instructions,
                specialInstructions: formData.instructions
            };

            console.log('Completing reservation after payment:', reservationData);

            const response = await fetch(`${API_BASE_URL}/${outfit.id}/reserve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reservationData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error response:', errorData);
                throw new Error(errorData.message || `Failed to submit reservation: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                console.log('Reservation completed successfully after payment');
                // The user is already on the confirmation page per Stripe configuration
                // You can show a success message or let the confirmation page handle it
            } else {
                throw new Error(result.message || 'Failed to submit reservation');
            }
        } catch (err) {
            console.error('Reservation completion error:', err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            alert(`Payment was successful but reservation failed: ${errorMessage}. Please contact support.`);
        } finally {
            setProcessingPayment(false);
            setReservationData(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFF0C8] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#5B1B3A] animate-spin mx-auto mb-4" />
                    <p className="text-[#5B1B3A] text-lg">Loading clothing collection...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#FFF0C8] flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#AD7301] max-w-md">
                        <h2 className="text-2xl font-bold text-[#5B1B3A] mb-4">Error Loading Collection</h2>
                        <p className="text-[#891B81] mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-[#891B81] text-white px-6 py-3 rounded-full hover:bg-[#940000] transition-all duration-300"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF0C8]">
            <Header />

            {/* Payment Processing Overlay */}
            {processingPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl p-8 max-w-md mx-4 transform animate-scaleIn">
                        <div className="text-center">
                            <CreditCard className="w-16 h-16 text-[#5B1B3A] mx-auto mb-4 animate-pulse" />
                            <h3 className="text-2xl font-bold text-[#5B1B3A] mb-4">Processing Payment</h3>
                            <p className="text-gray-600 mb-6">
                                You are being redirected to secure payment. Please wait...
                            </p>
                            <Loader2 className="w-8 h-8 text-[#891B81] animate-spin mx-auto" />
                        </div>
                    </div>
                </div>
            )}

            {/* Collection Type Selector */}
            <div className="bg-[#5b1b3a] py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <button
                            onClick={() => setActiveCollection('available')}
                            className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                                activeCollection === 'available'
                                    ? 'bg-[#AD7301] text-white shadow-2xl'
                                    : 'bg-[#FFF0C8] text-[#5B1B3A] hover:bg-[#AD7301] hover:text-white'
                            }`}
                        >
                            Available Items
                        </button>
                        <button
                            onClick={() => setActiveCollection('all')}
                            className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                                activeCollection === 'all'
                                    ? 'bg-[#AD7301] text-white shadow-2xl'
                                    : 'bg-[#FFF0C8] text-[#5B1B3A] hover:bg-[#AD7301] hover:text-white'
                            }`}
                        >
                            All Items
                        </button>
                    </div>
                </div>
            </div>

            {/* Header */}
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
                                CLOTHING COLLECTION
                            </h1>
                            <div className="text-lg md:text-xl text-[#AD7301] font-light italic mt-1">
                                {activeCollection === 'available' ? 'Available Now' : 'All Items'}
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
                            placeholder="Search items by name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-full bg-[#FFF0C8] border-2 border-[#AD7301] focus:outline-none focus:border-[#891B81] focus:ring-2 focus:ring-[#AD7301]/30 text-[#5B1B3A] placeholder-[#5B1B3A]/60 transition-all duration-300 ease-in-out hover:shadow-lg"
                        />
                    </div>
                </div>
            </header>

            {/* Filter Panel */}
            <div
                className={`bg-[#891B81] text-white shadow-lg overflow-hidden transition-all duration-500 ease-in-out ${
                    showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="container mx-auto p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold transition-all duration-300 hover:text-[#AD7301]">Filter Items</h3>
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

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-[#5B1B3A] text-lg font-medium">
                        Showing <span className="font-bold text-[#891B81]">{filteredOutfits.length}</span> of <span className="font-bold">{outfits.length}</span> items
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

                {/* Items Grid */}
                {filteredOutfits.length === 0 ? (
                    <div className="text-center py-16 animate-fadeIn">
                        <div className="text-[#5B1B3A] text-xl mb-4 font-semibold">
                            {activeCollection === 'available' ? 'No available items found' : 'No items found'}
                        </div>
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
                                className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 ${
                                    outfit.status === 'available'
                                        ? 'border-transparent hover:border-[#AD7301] group'
                                        : 'border-gray-300 opacity-75'
                                }`}
                            >
                                <div
                                    className={`h-80 bg-gray-200 relative overflow-hidden ${
                                        outfit.status === 'available' ? 'cursor-pointer' : 'cursor-not-allowed'
                                    }`}
                                    onClick={() => outfit.status === 'available' && setSelectedOutfit(outfit)}
                                >
                                    <img
                                        src={outfit.image}
                                        alt={outfit.name}
                                        className={`w-full h-full object-cover transition-transform duration-500 ${
                                            outfit.status === 'available' ? 'group-hover:scale-110' : 'grayscale'
                                        }`}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder-clothing.jpg';
                                        }}
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent ${
                                        outfit.status === 'available'
                                            ? 'opacity-0 group-hover:opacity-100'
                                            : 'opacity-50 bg-gray-400'
                                    } transition-opacity duration-300`}></div>

                                    {/* Size Badge */}
                                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium shadow-lg transform transition-transform duration-300 ${
                                        outfit.status === 'available'
                                            ? 'bg-[#5B1B3A] text-white group-hover:scale-110'
                                            : 'bg-gray-500 text-gray-200'
                                    }`}>
                                        {outfit.size}
                                    </div>

                                    {/* Category Badge */}
                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium shadow-lg transform transition-transform duration-300 ${
                                        outfit.status === 'available'
                                            ? 'bg-[#AD7301] text-white group-hover:scale-110'
                                            : 'bg-gray-400 text-gray-200'
                                    }`}>
                                        {outfit.category}
                                    </div>

                                    {/* Reserved Overlay */}
                                    {outfit.status !== 'available' && (
                                        <>
                                            <div className="absolute inset-0 bg-gray-600 bg-opacity-60 flex items-center justify-center">
                                                <div className="text-center text-white">
                                                    <EyeOff size={48} className="mx-auto mb-2 opacity-80" />
                                                    <div className="bg-[#940000] px-4 py-2 rounded-full font-bold text-lg">
                                                        RESERVED
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-4 left-4 bg-[#940000] text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                                                {outfit.status.toUpperCase()}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="p-6">
                                    <h3 className={`font-bold text-lg mb-2 transition-colors duration-300 ${
                                        outfit.status === 'available'
                                            ? 'text-[#5B1B3A] group-hover:text-[#891B81]'
                                            : 'text-gray-500'
                                    }`}>
                                        {outfit.name}
                                    </h3>
                                    <p className={`text-sm mb-4 line-clamp-2 ${
                                        outfit.status === 'available' ? 'text-gray-600' : 'text-gray-400'
                                    }`}>
                                        {outfit.description}
                                    </p>
                                    <button
                                        onClick={() => setSelectedOutfit(outfit)}
                                        disabled={outfit.status !== 'available'}
                                        className={`w-full py-3 rounded-xl font-semibold transform transition-all duration-300 shadow-lg ${
                                            outfit.status === 'available'
                                                ? 'bg-[#891B81] text-white hover:bg-[#940000] hover:scale-105 hover:shadow-xl'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        {outfit.status === 'available' ? 'Reserve This Item' : 'Already Reserved'}
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
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-clothing.jpg';
                                }}
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

                            {/* Size and Category Display */}
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

                            <ReservationForm
                                outfit={selectedOutfit}
                                onClose={() => setSelectedOutfit(null)}
                                onSubmit={handleReservation}
                                processing={processingPayment}
                            />
                        </div>
                    </div>
                </div>
            )}

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
            `}</style>
        </div>
    );
}

// Updated Reservation Form Component with Payment Integration
function ReservationForm({
                             outfit,
                             onClose,
                             onSubmit,
                             processing
                         }: {
    outfit: Outfit;
    onClose: () => void;
    onSubmit: (formData: ReservationFormData, outfit: Outfit) => void;
    processing: boolean;
}) {
    const [formData, setFormData] = useState<ReservationFormData>({
        name: '',
        email: '',
        phone: '',
        address: '',
        instructions: '',
        pickupDate: '',
        pickupMethod: 'in-person',
        agreeToTerms: false
    });

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.agreeToTerms) {
            alert('Please agree to the terms and conditions');
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit(formData, outfit);
        } catch (error) {
            console.error('Reservation failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            alert(`Reservation failed: ${errorMessage}`);
            setSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-2xl font-bold text-[#5B1B3A] mb-2">Reserve This Item</h3>

            {/* Payment Notice */}
            <div className="bg-gradient-to-br from-[#FFE8A5] to-[#FFD166] p-4 rounded-xl border-2 border-[#AD7301]">
                <div className="flex items-center space-x-3">
                    <CreditCard className="text-[#5B1B3A] flex-shrink-0" size={24} />
                    <div>
                        <p className="text-[#5B1B3A] font-semibold">Payment Required</p>
                        <p className="text-[#5B1B3A] text-sm">
                            After submitting this form, you'll be redirected to secure payment to complete your reservation.
                        </p>
                    </div>
                </div>
            </div>

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

            {/* Pickup Method Selection */}
            <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-semibold text-[#5B1B3A] mb-2">
                    Pickup Method *
                </label>
                <select
                    name="pickupMethod"
                    value={formData.pickupMethod}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#891B81] focus:border-[#891B81] text-[#5B1B3A] transition-all duration-300"
                >
                    <option value="in-person">In-Person Pickup</option>
                    <option value="without">Without Pickup (Specify in instructions)</option>
                </select>
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
                    disabled={submitting || processing}
                    className="flex-1 bg-[#FFF0C8] text-[#5B1B3A] py-4 rounded-xl font-semibold hover:bg-[#AD7301] hover:text-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!formData.agreeToTerms || submitting || processing}
                    className="flex-1 bg-[#5B1B3A] text-white py-4 rounded-xl font-semibold hover:bg-[#891B81] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                >
                    {submitting || processing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            {processing ? 'Redirecting to Payment...' : 'Processing...'}
                        </>
                    ) : (
                        <>
                            <CreditCard className="w-5 h-5 mr-2" />
                            Proceed to Payment
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}