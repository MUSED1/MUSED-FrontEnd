// components/AdminReservations.tsx
import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import {
    Calendar,
    Mail,
    Phone,
    User,
    MapPin,
    Clock,
    Package,
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    X,
    Eye,
    CheckCircle,
    XCircle,
    AlertCircle,
    Download,
    RefreshCw
} from 'lucide-react';

// Define proper types
interface ClothingItemType {
    _id: string;
    images: string[];
    category: string;
    size: string;
    fullName: string;
    status: string;
    address?: string;
    pickupMethod?: string;
    pickupTime?: string;
    pickupDay?: string;
    pickupInstructions?: string;
    specialInstructions?: string;
    email?: string;
    phoneNumber?: string;
    createdAt?: string;
}

interface ReservationItem {
    _id: string;
    clothingId: ClothingItemType;
    fullName: string;
    email: string;
    phoneNumber: string;
    pickupMethod: string;
    pickupTime: string;
    pickupDay: string;
    pickupInstructions: string;
    specialInstructions: string;
    returnDay: string;
    returnTime: string;
    status: 'active' | 'completed' | 'cancelled';
    createdAt: string;
}

// Mock data generator with proper typing
const generateMockReservations = (clothingItems: ClothingItemType[]): ReservationItem[] => {
    const mockReservations: ReservationItem[] = [];
    const statuses: Array<'active' | 'completed' | 'cancelled'> = ['active', 'completed', 'cancelled'];
    const pickupMethods = ['without', 'in-person'];
    const deliveryDays = ['Monday 16th', 'Tuesday 17th', 'Wednesday 18th'];
    const returnDays = ['Friday 20th', 'Saturday 21st', 'Monday 22nd'];
    const times = ['12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM'];

    const names = ['Emma Watson', 'James Smith', 'Maria Garcia', 'John Doe', 'Sarah Johnson', 'Michael Brown'];
    const emails = ['emma@example.com', 'james@example.com', 'maria@example.com', 'john@example.com', 'sarah@example.com', 'michael@example.com'];
    const phones = ['+852 9123 4567', '+852 9234 5678', '+852 9345 6789', '+852 9456 7890', '+852 9567 8901', '+852 9678 9012'];

    // Use actual clothing items if available
    if (clothingItems.length > 0) {
        clothingItems.slice(0, 8).forEach((clothing, index) => {
            mockReservations.push({
                _id: `res_${clothing._id}`,
                clothingId: {
                    _id: clothing._id,
                    images: clothing.images,
                    category: clothing.category,
                    size: clothing.size,
                    fullName: clothing.fullName,
                    status: clothing.status,
                    address: clothing.address,
                    pickupMethod: clothing.pickupMethod,
                    pickupTime: clothing.pickupTime,
                    pickupDay: clothing.pickupDay,
                    pickupInstructions: clothing.pickupInstructions,
                    specialInstructions: clothing.specialInstructions,
                    email: clothing.email,
                    phoneNumber: clothing.phoneNumber,
                    createdAt: clothing.createdAt
                },
                fullName: clothing.fullName || names[index % 6],
                email: clothing.email || emails[index % 6],
                phoneNumber: clothing.phoneNumber || phones[index % 6],
                pickupMethod: pickupMethods[index % 2],
                pickupTime: times[index % 3],
                pickupDay: deliveryDays[index % 3],
                pickupInstructions: 'Please leave with concierge',
                specialInstructions: index % 2 === 0 ? 'Fragile item' : '',
                returnDay: returnDays[index % 3],
                returnTime: times[(index + 1) % 3],
                status: statuses[index % 3],
                createdAt: clothing.createdAt || new Date().toISOString()
            });
        });
    }

    // Add more mock reservations if needed
    for (let i = mockReservations.length; i < 12; i++) {
        const randomDate = new Date(2026, 0, 1 + i);
        mockReservations.push({
            _id: `mock_res_${i}`,
            clothingId: {
                _id: `mock_clothing_${i}`,
                images: [`https://via.placeholder.com/400x400?text=Item+${i+1}`],
                category: ['Dresses', 'Tops', 'Bottoms', 'Accessories'][i % 4],
                size: ['S', 'M', 'L', 'XL'][i % 4],
                fullName: names[i % 6],
                status: 'reserved',
                address: '123 Main St, Hong Kong',
                pickupMethod: pickupMethods[i % 2],
                pickupTime: times[i % 3],
                pickupDay: deliveryDays[i % 3],
                pickupInstructions: i % 2 === 0 ? 'Call upon arrival' : 'Ring the doorbell',
                specialInstructions: i % 3 === 0 ? 'Handle with care' : '',
                email: emails[i % 6],
                phoneNumber: phones[i % 6]
            },
            fullName: names[i % 6],
            email: emails[i % 6],
            phoneNumber: phones[i % 6],
            pickupMethod: pickupMethods[i % 2],
            pickupTime: times[i % 3],
            pickupDay: deliveryDays[i % 3],
            pickupInstructions: i % 2 === 0 ? 'Call upon arrival' : 'Ring the doorbell',
            specialInstructions: i % 3 === 0 ? 'Handle with care' : '',
            returnDay: returnDays[i % 3],
            returnTime: times[(i + 1) % 3],
            status: statuses[i % 3],
            createdAt: randomDate.toISOString()
        });
    }

    return mockReservations;
};

export function AdminReservations() {
    const [allReservations, setAllReservations] = useState<ReservationItem[]>([]);
    const [filteredReservations, setFilteredReservations] = useState<ReservationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentYear] = useState<number>(2026);
    const [selectedReservation, setSelectedReservation] = useState<ReservationItem | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const statusOptions = ['all', 'active', 'completed', 'cancelled'];

    useEffect(() => {
        fetchReservations();
    }, []);

    useEffect(() => {
        filterReservations();
    }, [allReservations, searchTerm, statusFilter]);

    const fetchReservations = async () => {
        try {
            setLoading(true);
            setError('');
            setRefreshing(true);

            const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

            // Fetch all clothing items (admin endpoint)
            const clothingResponse = await fetch(`${API_URL}/clothing/admin/all`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!clothingResponse.ok) {
                throw new Error(`Failed to fetch clothing items: ${clothingResponse.status}`);
            }

            const clothingResult = await clothingResponse.json();

            if (!clothingResult.success) {
                throw new Error(clothingResult.message || 'Failed to fetch clothing items');
            }

            // Filter clothing items from 2026 onwards
            const startDate2026 = new Date('2026-01-01T00:00:00.000Z');
            const clothingItems2026: ClothingItemType[] = clothingResult.data.filter((item: ClothingItemType) => {
                const itemDate = new Date(item.createdAt || '');
                return itemDate >= startDate2026;
            });

            // Create reservation data from clothing items
            const allReservationsData: ReservationItem[] = [];

            clothingItems2026.forEach((clothing: ClothingItemType) => {
                // Only create reservations for items that might have them
                if (clothing.status === 'reserved') {
                    allReservationsData.push({
                        _id: `res_${clothing._id}`,
                        clothingId: {
                            _id: clothing._id,
                            images: clothing.images,
                            category: clothing.category,
                            size: clothing.size,
                            fullName: clothing.fullName,
                            status: clothing.status,
                            address: clothing.address,
                            pickupMethod: clothing.pickupMethod,
                            pickupTime: clothing.pickupTime,
                            pickupDay: clothing.pickupDay,
                            pickupInstructions: clothing.pickupInstructions,
                            specialInstructions: clothing.specialInstructions,
                            email: clothing.email,
                            phoneNumber: clothing.phoneNumber,
                            createdAt: clothing.createdAt
                        },
                        fullName: clothing.fullName,
                        email: clothing.email || '',
                        phoneNumber: clothing.phoneNumber || '',
                        pickupMethod: clothing.pickupMethod || 'in-person',
                        pickupTime: clothing.pickupTime || '12:00 PM - 2:00 PM',
                        pickupDay: clothing.pickupDay || 'Monday 16th',
                        pickupInstructions: clothing.pickupInstructions || 'Please ring the bell',
                        specialInstructions: clothing.specialInstructions || '',
                        returnDay: 'Friday 20th',
                        returnTime: '2:00 PM - 4:00 PM',
                        status: 'active',
                        createdAt: clothing.createdAt || new Date().toISOString()
                    });
                }
            });

            // For development, add some mock data if none exists
            if (allReservationsData.length === 0) {
                const mockReservations = generateMockReservations(clothingItems2026);
                setAllReservations(mockReservations);
            } else {
                setAllReservations(allReservationsData);
            }

        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Error fetching reservations');

            // For development, generate mock data
            setAllReservations(generateMockReservations([]));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filterReservations = () => {
        let filtered = [...allReservations];

        // Filter by search term (name, email, phone, category)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(res =>
                res.fullName.toLowerCase().includes(term) ||
                res.email.toLowerCase().includes(term) ||
                res.phoneNumber.includes(term) ||
                (res.clothingId?.category || '').toLowerCase().includes(term)
            );
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(res => res.status === statusFilter);
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setFilteredReservations(filtered);
        setCurrentPage(1);
    };

    const updateReservationStatus = async (reservationId: string, newStatus: 'active' | 'completed' | 'cancelled') => {
        try {
            setUpdatingStatus(reservationId);
            setError('');

            // In a real implementation, you would call your API here
            // For now, we'll just update locally
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

            const updatedReservations = allReservations.map(res =>
                res._id === reservationId ? { ...res, status: newStatus } : res
            );

            setAllReservations(updatedReservations);

            // Also update the selected reservation if it's the one being viewed
            if (selectedReservation && selectedReservation._id === reservationId) {
                setSelectedReservation({ ...selectedReservation, status: newStatus });
            }

        } catch (err) {
            console.error('Error updating status:', err);
            setError(err instanceof Error ? err.message : 'Error updating reservation status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleRefresh = () => {
        fetchReservations();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle size={16} className="text-green-600" />;
            case 'completed': return <CheckCircle size={16} className="text-blue-600" />;
            case 'cancelled': return <XCircle size={16} className="text-red-600" />;
            default: return <AlertCircle size={16} className="text-gray-600" />;
        }
    };

    const getPickupMethodLabel = (method: string) => {
        return method === 'without' ? 'No need to be present' : 'Must be present';
    };

    // Pagination
    const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentReservations = filteredReservations.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Export to CSV
    const exportToCSV = () => {
        const headers = [
            'Reservation ID',
            'Customer Name',
            'Email',
            'Phone',
            'Item Category',
            'Item Size',
            'Owner Name',
            'Status',
            'Pickup Method',
            'Pickup Day',
            'Pickup Time',
            'Return Day',
            'Return Time',
            'Pickup Instructions',
            'Special Instructions',
            'Reservation Date'
        ];

        const csvData = filteredReservations.map(res => [
            res._id,
            res.fullName,
            res.email,
            res.phoneNumber,
            res.clothingId?.category || 'N/A',
            res.clothingId?.size || 'N/A',
            res.clothingId?.fullName || 'N/A',
            res.status,
            getPickupMethodLabel(res.pickupMethod),
            res.pickupDay,
            res.pickupTime,
            res.returnDay,
            res.returnTime,
            res.pickupInstructions || 'None',
            res.specialInstructions || 'None',
            formatDate(res.createdAt)
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `reservations_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="font-sans">
                <Header />
                <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-8">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-2 border-plum border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-plum mt-4">Loading reservations...</p>
                        </div>
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
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-plum mb-4">
                            Reservations Management
                        </h1>
                        <p className="text-lg text-plum/80">
                            Showing reservations from {currentYear} onwards ({filteredReservations.length} reservations)
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-xl border border-red-300 flex justify-between items-center">
                            <span>{error}</span>
                            <button
                                onClick={() => setError('')}
                                className="ml-4 underline hover:no-underline"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {/* Filters and Actions */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            <div className="flex-1 w-full md:w-auto">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-plum/40" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, phone, or category..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-cream rounded-lg focus:outline-none focus:ring-2 focus:ring-plum/20 text-plum"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="flex items-center gap-2">
                                    <Filter size={20} className="text-plum/60" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="border border-cream rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-plum/20 text-plum"
                                    >
                                        {statusOptions.map(status => (
                                            <option key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={exportToCSV}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    title="Export to CSV"
                                >
                                    <Download size={18} />
                                    <span className="hidden sm:inline">Export</span>
                                </button>

                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className={`flex items-center gap-2 px-4 py-2 bg-plum text-cream rounded-lg hover:bg-plum/80 transition-colors ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                                    <span className="hidden sm:inline">Refresh</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Reservations Grid */}
                    {filteredReservations.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                            <Package size={64} className="text-plum/20 mx-auto mb-4" />
                            <p className="text-plum text-lg mb-2">No reservations found</p>
                            <p className="text-plum/60">Try adjusting your filters or check back later.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-6">
                                {currentReservations.map((reservation) => (
                                    <div
                                        key={reservation._id}
                                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                                        onClick={() => setSelectedReservation(reservation)}
                                    >
                                        <div className="p-6">
                                            <div className="flex flex-col lg:flex-row gap-6">
                                                {/* Item Image */}
                                                <div className="lg:w-48 flex-shrink-0">
                                                    <div className="relative aspect-square rounded-xl overflow-hidden">
                                                        <img
                                                            src={reservation.clothingId?.images?.[0] || 'https://via.placeholder.com/400x400?text=No+Image'}
                                                            alt={reservation.clothingId?.category}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src = 'https://via.placeholder.com/400x400?text=No+Image';
                                                            }}
                                                        />
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (reservation.clothingId?.images?.[0]) {
                                                                    setPreviewImage(reservation.clothingId.images[0]);
                                                                }
                                                            }}
                                                            className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                                                        >
                                                            <Eye size={16} className="text-plum" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Reservation Details */}
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Customer Info */}
                                                    <div className="space-y-3">
                                                        <h3 className="font-semibold text-plum flex items-center gap-2 border-b border-cream pb-2">
                                                            <User size={18} className="text-rose" />
                                                            Customer Information
                                                        </h3>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <User size={16} className="text-plum/40" />
                                                                <span className="font-medium text-plum">{reservation.fullName}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Mail size={16} className="text-plum/40" />
                                                                <a href={`mailto:${reservation.email}`} className="text-plum hover:underline">
                                                                    {reservation.email}
                                                                </a>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Phone size={16} className="text-plum/40" />
                                                                <a href={`tel:${reservation.phoneNumber}`} className="text-plum">
                                                                    {reservation.phoneNumber}
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Item Info */}
                                                    <div className="space-y-3">
                                                        <h3 className="font-semibold text-plum flex items-center gap-2 border-b border-cream pb-2">
                                                            <Package size={18} className="text-rose" />
                                                            Item Information
                                                        </h3>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-plum/60">Category:</span>
                                                                <span className="font-medium text-plum">{reservation.clothingId?.category || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-plum/60">Size:</span>
                                                                <span className="font-medium text-plum">{reservation.clothingId?.size || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-plum/60">Owner:</span>
                                                                <span className="font-medium text-plum">{reservation.clothingId?.fullName || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Pickup Details */}
                                                    <div className="space-y-3">
                                                        <h3 className="font-semibold text-plum flex items-center gap-2 border-b border-cream pb-2">
                                                            <Calendar size={18} className="text-rose" />
                                                            Pickup Details
                                                        </h3>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={16} className="text-plum/40" />
                                                                <span className="text-plum">{reservation.pickupDay} {reservation.pickupTime}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <MapPin size={16} className="text-plum/40" />
                                                                <span className="text-plum">{getPickupMethodLabel(reservation.pickupMethod)}</span>
                                                            </div>
                                                            {reservation.pickupInstructions && (
                                                                <div className="text-plum/80 text-xs mt-1 bg-cream/50 p-2 rounded">
                                                                    📝 {reservation.pickupInstructions}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Return Details */}
                                                    <div className="space-y-3">
                                                        <h3 className="font-semibold text-plum flex items-center gap-2 border-b border-cream pb-2">
                                                            <Clock size={18} className="text-rose" />
                                                            Return Details
                                                        </h3>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={16} className="text-plum/40" />
                                                                <span className="text-plum">{reservation.returnDay} {reservation.returnTime}</span>
                                                            </div>
                                                            {reservation.specialInstructions && (
                                                                <div className="text-plum/80 text-xs mt-1 bg-amber-50 p-2 rounded">
                                                                    ✨ {reservation.specialInstructions}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Status and Date */}
                                                <div className="lg:w-48 flex-shrink-0 flex flex-col items-end justify-between">
                                                    <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border ${getStatusColor(reservation.status)}`}>
                                                        {getStatusIcon(reservation.status)}
                                                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                                    </div>
                                                    <div className="text-xs text-plum/40 mt-4">
                                                        Reserved on:<br />
                                                        {formatDate(reservation.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 mt-8">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`p-2 rounded-lg transition-colors ${
                                            currentPage === 1
                                                ? 'text-plum/20 cursor-not-allowed'
                                                : 'text-plum hover:bg-cream'
                                        }`}
                                    >
                                        <ChevronLeft size={24} />
                                    </button>

                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => goToPage(pageNum)}
                                                    className={`w-10 h-10 rounded-lg transition-colors ${
                                                        currentPage === pageNum
                                                            ? 'bg-rose text-white'
                                                            : 'hover:bg-cream text-plum'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`p-2 rounded-lg transition-colors ${
                                            currentPage === totalPages
                                                ? 'text-plum/20 cursor-not-allowed'
                                                : 'text-plum hover:bg-cream'
                                        }`}
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />

            {/* Reservation Detail Modal */}
            {selectedReservation && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedReservation(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white border-b border-cream p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-plum">Reservation Details</h2>
                            <button
                                onClick={() => setSelectedReservation(null)}
                                className="p-2 hover:bg-cream rounded-full transition-colors"
                            >
                                <X size={24} className="text-plum" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Item Images */}
                            {selectedReservation.clothingId?.images && selectedReservation.clothingId.images.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-plum mb-4">Item Images</h3>
                                    <div className="grid grid-cols-4 gap-4">
                                        {selectedReservation.clothingId.images.map((image, index) => (
                                            <div
                                                key={index}
                                                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                                                onClick={() => setPreviewImage(image)}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`Item ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://via.placeholder.com/400x400?text=No+Image';
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                                    <Eye className="text-white opacity-0 group-hover:opacity-100" size={24} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* All Information in Detail */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Customer Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-plum flex items-center gap-2 border-b border-cream pb-2">
                                        <User size={20} className="text-rose" />
                                        Customer Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm text-plum/60">Full Name</label>
                                            <p className="font-medium text-plum">{selectedReservation.fullName}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-plum/60">Email Address</label>
                                            <p className="font-medium text-plum">
                                                <a href={`mailto:${selectedReservation.email}`} className="hover:underline">
                                                    {selectedReservation.email}
                                                </a>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-plum/60">Phone Number</label>
                                            <p className="font-medium text-plum">
                                                <a href={`tel:${selectedReservation.phoneNumber}`}>
                                                    {selectedReservation.phoneNumber}
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Item Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-plum flex items-center gap-2 border-b border-cream pb-2">
                                        <Package size={20} className="text-rose" />
                                        Item Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm text-plum/60">Item ID</label>
                                            <p className="font-medium text-plum text-sm break-all">{selectedReservation.clothingId?._id}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-plum/60">Category</label>
                                            <p className="font-medium text-plum">{selectedReservation.clothingId?.category || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-plum/60">Size</label>
                                            <p className="font-medium text-plum">{selectedReservation.clothingId?.size || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-plum/60">Owner Name</label>
                                            <p className="font-medium text-plum">{selectedReservation.clothingId?.fullName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-plum/60">Item Status</label>
                                            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedReservation.clothingId?.status || '')}`}>
                                                {selectedReservation.clothingId?.status || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Pickup Details */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-plum flex items-center gap-2 border-b border-cream pb-2">
                                        <Calendar size={20} className="text-rose" />
                                        Pickup Details
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm text-plum/60">Pickup Day</label>
                                            <p className="font-medium text-plum">{selectedReservation.pickupDay || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-plum/60">Pickup Time</label>
                                            <p className="font-medium text-plum">{selectedReservation.pickupTime || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-plum/60">Pickup Method</label>
                                            <p className="font-medium text-plum capitalize">
                                                {getPickupMethodLabel(selectedReservation.pickupMethod)}
                                            </p>
                                        </div>
                                        {selectedReservation.pickupInstructions && (
                                            <div>
                                                <label className="text-sm text-plum/60">Pickup Instructions</label>
                                                <p className="mt-1 p-3 bg-cream/30 rounded-lg text-plum">
                                                    {selectedReservation.pickupInstructions}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Return Details */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-plum flex items-center gap-2 border-b border-cream pb-2">
                                        <Clock size={20} className="text-rose" />
                                        Return Details
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm text-plum/60">Return Day</label>
                                            <p className="font-medium text-plum">{selectedReservation.returnDay || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-plum/60">Return Time</label>
                                            <p className="font-medium text-plum">{selectedReservation.returnTime || 'Not specified'}</p>
                                        </div>
                                        {selectedReservation.specialInstructions && (
                                            <div>
                                                <label className="text-sm text-plum/60">Special Instructions</label>
                                                <p className="mt-1 p-3 bg-amber-50 rounded-lg text-plum">
                                                    {selectedReservation.specialInstructions}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Reservation Status */}
                                <div className="space-y-4 md:col-span-2">
                                    <h3 className="text-lg font-semibold text-plum flex items-center gap-2 border-b border-cream pb-2">
                                        <AlertCircle size={20} className="text-rose" />
                                        Reservation Status
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor(selectedReservation.status)}`}>
                                            {getStatusIcon(selectedReservation.status)}
                                            Current Status: {selectedReservation.status.charAt(0).toUpperCase() + selectedReservation.status.slice(1)}
                                        </span>

                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-plum/60">Update to:</span>
                                            <button
                                                onClick={() => updateReservationStatus(selectedReservation._id, 'active')}
                                                disabled={updatingStatus === selectedReservation._id || selectedReservation.status === 'active'}
                                                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                                    selectedReservation.status === 'active'
                                                        ? 'bg-green-100 text-green-400 cursor-not-allowed'
                                                        : 'bg-green-600 text-white hover:bg-green-700'
                                                }`}
                                            >
                                                Active
                                            </button>
                                            <button
                                                onClick={() => updateReservationStatus(selectedReservation._id, 'completed')}
                                                disabled={updatingStatus === selectedReservation._id || selectedReservation.status === 'completed'}
                                                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                                    selectedReservation.status === 'completed'
                                                        ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                            >
                                                Completed
                                            </button>
                                            <button
                                                onClick={() => updateReservationStatus(selectedReservation._id, 'cancelled')}
                                                disabled={updatingStatus === selectedReservation._id || selectedReservation.status === 'cancelled'}
                                                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                                    selectedReservation.status === 'cancelled'
                                                        ? 'bg-red-100 text-red-400 cursor-not-allowed'
                                                        : 'bg-red-600 text-white hover:bg-red-700'
                                                }`}
                                            >
                                                Cancelled
                                            </button>
                                            {updatingStatus === selectedReservation._id && (
                                                <div className="w-5 h-5 border-2 border-plum border-t-transparent rounded-full animate-spin"></div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="space-y-4 md:col-span-2 border-t border-cream pt-4">
                                    <h3 className="text-sm font-semibold text-plum/60">Metadata</h3>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <span className="text-plum/40">Reservation ID:</span>
                                            <p className="text-plum break-all">{selectedReservation._id}</p>
                                        </div>
                                        <div>
                                            <span className="text-plum/40">Created At:</span>
                                            <p className="text-plum">{formatDate(selectedReservation.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-5xl max-h-full">
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/800x800?text=Image+Not+Found';
                            }}
                        />
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}