// components/AdminPickups.tsx
import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import {
    Package,
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    Eye,
    CheckCircle,
    XCircle,
    Download,
    RefreshCw,
    MapPin,
    Calendar,
    Clock,
    User,
    Mail,
    Phone,
    Truck
} from 'lucide-react';

// Types based on your schema
interface ClothingPickupItem {
    _id: string;
    images: string[];
    size: string;
    category: string;
    address: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    needsPickupHere: 'yes' | 'no';
    pickupMethod: 'without' | 'in-person';
    pickupTime: string;
    pickupDay: string;
    pickupInstructions: string;
    specialInstructions: string;
    status: 'available' | 'reserved' | 'sold';
    createdAt: string;
    approvalStatus: 'pending' | 'approved' | 'rejected';
}

interface ReservationPickupItem {
    _id: string;
    clothingId: {
        _id: string;
        images: string[];
        category: string;
        size: string;
        fullName: string;
        status: string;
    };
    fullName: string;
    email: string;
    phoneNumber: string;
    pickupMethod: 'without' | 'in-person';
    pickupTime: string;
    pickupDay: string;
    pickupInstructions: string;
    specialInstructions: string;
    returnDay: string;
    returnTime: string;
    status: 'active' | 'completed' | 'cancelled';
    createdAt: string;
}

type PickupType = 'clothing' | 'reservation';
type PickupStatus = 'pending' | 'completed' | 'cancelled';

interface UnifiedPickup {
    id: string;
    type: PickupType;
    originalId: string;
    images: string[];
    itemName: string;
    size: string;
    pickerName: string;
    pickerEmail: string;
    pickerPhone: string;
    address: string;
    needsPickupHere: string;
    pickupMethod: 'without' | 'in-person';
    pickupDay: string;
    pickupTime: string;
    pickupInstructions: string;
    specialInstructions: string;
    returnInfo?: {
        day: string;
        time: string;
    };
    status: PickupStatus;
    originalStatus: string;
    createdAt: string;
}

export function AdminPickups() {
    const [clothingItems, setClothingItems] = useState<ClothingPickupItem[]>([]);
    const [reservations, setReservations] = useState<ReservationPickupItem[]>([]);
    const [allPickups, setAllPickups] = useState<UnifiedPickup[]>([]);
    const [filteredPickups, setFilteredPickups] = useState<UnifiedPickup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<PickupType | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<PickupStatus | 'all'>('all');
    const [selectedPickup, setSelectedPickup] = useState<UnifiedPickup | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingPickup, setUpdatingPickup] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchPickups();
    }, []);

    useEffect(() => {
        filterPickups();
    }, [allPickups, searchTerm, typeFilter, statusFilter]);

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    const fetchPickups = async () => {
        try {
            setLoading(true);
            setError('');
            setRefreshing(true);

            const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

            // Fetch clothing items that need pickup
            const clothingResponse = await fetch(
                `${API_URL}/admin/clothing/pickups?needsPickupHere=yes`,
                { headers: getAuthHeaders() }
            );

            // Fetch active reservations with pickup info
            const reservationsResponse = await fetch(
                `${API_URL}/admin/reservations/pickups?status=active`,
                { headers: getAuthHeaders() }
            );

            if (!clothingResponse.ok || !reservationsResponse.ok) {
                throw new Error('Failed to fetch pickup data');
            }

            const clothingData = await clothingResponse.json();
            const reservationsData = await reservationsResponse.json();

            console.log('Clothing pickups:', clothingData);
            console.log('Reservation pickups:', reservationsData);

            // Process clothing items
            const clothingPickups: UnifiedPickup[] = (clothingData.data || clothingData.clothing || [])
                .filter((item: ClothingPickupItem) => item.needsPickupHere === 'yes')
                .map((item: ClothingPickupItem) => ({
                    id: `clothing-${item._id}`,
                    type: 'clothing',
                    originalId: item._id,
                    images: item.images || [],
                    itemName: `${item.category} (${item.size})`,
                    size: item.size,
                    pickerName: item.fullName,
                    pickerEmail: item.email,
                    pickerPhone: item.phoneNumber,
                    address: item.address || '',
                    needsPickupHere: item.needsPickupHere,
                    pickupMethod: item.pickupMethod,
                    pickupDay: item.pickupDay || '',
                    pickupTime: item.pickupTime || '',
                    pickupInstructions: item.pickupInstructions || '',
                    specialInstructions: item.specialInstructions || '',
                    status: item.status === 'sold' ? 'completed' : 'pending',
                    originalStatus: item.status,
                    createdAt: item.createdAt
                }));

            // Process reservations
            const reservationPickups: UnifiedPickup[] = (reservationsData.data || reservationsData.reservations || [])
                .map((res: ReservationPickupItem) => ({
                    id: `reservation-${res._id}`,
                    type: 'reservation',
                    originalId: res._id,
                    images: res.clothingId?.images || [],
                    itemName: `${res.clothingId?.category || 'Item'} (${res.clothingId?.size || 'N/A'})`,
                    size: res.clothingId?.size || 'N/A',
                    pickerName: res.fullName,
                    pickerEmail: res.email,
                    pickerPhone: res.phoneNumber,
                    address: '',
                    needsPickupHere: 'yes',
                    pickupMethod: res.pickupMethod,
                    pickupDay: res.pickupDay || '',
                    pickupTime: res.pickupTime || '',
                    pickupInstructions: res.pickupInstructions || '',
                    specialInstructions: res.specialInstructions || '',
                    returnInfo: {
                        day: res.returnDay,
                        time: res.returnTime
                    },
                    status: res.status === 'completed' ? 'completed' :
                        res.status === 'cancelled' ? 'cancelled' : 'pending',
                    originalStatus: res.status,
                    createdAt: res.createdAt
                }));

            const all = [...clothingPickups, ...reservationPickups];
            // Sort by date (newest first)
            all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setClothingItems(clothingData.data || clothingData.clothing || []);
            setReservations(reservationsData.data || reservationsData.reservations || []);
            setAllPickups(all);

        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Error fetching pickups');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filterPickups = () => {
        let filtered = [...allPickups];

        // Filter by type
        if (typeFilter !== 'all') {
            filtered = filtered.filter(p => p.type === typeFilter);
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(p => p.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.pickerName.toLowerCase().includes(term) ||
                p.pickerEmail.toLowerCase().includes(term) ||
                p.pickerPhone.includes(term) ||
                p.itemName.toLowerCase().includes(term)
            );
        }

        setFilteredPickups(filtered);
    };

    const updatePickupStatus = async (pickup: UnifiedPickup, newStatus: PickupStatus) => {
        try {
            setUpdatingPickup(pickup.id);
            setError('');

            const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

            if (pickup.type === 'clothing') {
                // Update clothing item status
                const clothingStatus = newStatus === 'completed' ? 'sold' : 'available';
                const response = await fetch(`${API_URL}/admin/clothing/${pickup.originalId}`, {
                    method: 'PATCH',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ status: clothingStatus })
                });

                if (!response.ok) throw new Error('Failed to update clothing pickup status');
            } else {
                // Update reservation status
                const reservationStatus = newStatus === 'completed' ? 'completed' :
                    newStatus === 'cancelled' ? 'cancelled' : 'active';
                const response = await fetch(`${API_URL}/admin/reservations/${pickup.originalId}`, {
                    method: 'PATCH',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ status: reservationStatus })
                });

                if (!response.ok) throw new Error('Failed to update reservation pickup status');
            }

            // Update local state
            setAllPickups(prev => prev.map(p =>
                p.id === pickup.id ? { ...p, status: newStatus } : p
            ));

            if (selectedPickup && selectedPickup.id === pickup.id) {
                setSelectedPickup({ ...selectedPickup, status: newStatus });
            }

        } catch (err) {
            console.error('Error updating pickup status:', err);
            setError(err instanceof Error ? err.message : 'Error updating pickup status');
        } finally {
            setUpdatingPickup(null);
        }
    };

    const handleRefresh = () => {
        fetchPickups();
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

    const getStatusColor = (status: PickupStatus) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: PickupStatus) => {
        switch (status) {
            case 'pending': return <Clock size={16} className="text-yellow-600" />;
            case 'completed': return <CheckCircle size={16} className="text-green-600" />;
            case 'cancelled': return <XCircle size={16} className="text-red-600" />;
            default: return null;
        }
    };

    const getTypeBadge = (type: PickupType) => {
        return type === 'clothing'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-purple-100 text-purple-800';
    };

    const getPickupMethodLabel = (method: 'without' | 'in-person') => {
        return method === 'without' ? 'Drop-off (no need to be present)' : 'In-person pickup';
    };

    // Pagination
    const totalPages = Math.ceil(filteredPickups.length / itemsPerPage);
    const currentPickups = filteredPickups.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Export to CSV
    const exportToCSV = () => {
        const headers = [
            'Type',
            'Item Name',
            'Picker Name',
            'Email',
            'Phone',
            'Address',
            'Pickup Method',
            'Pickup Day',
            'Pickup Time',
            'Return Day',
            'Return Time',
            'Status',
            'Pickup Instructions',
            'Special Instructions',
            'Created At'
        ];

        const csvData = filteredPickups.map(p => [
            p.type === 'clothing' ? 'Clothing Donation' : 'Reservation',
            p.itemName,
            p.pickerName,
            p.pickerEmail,
            p.pickerPhone,
            p.address || 'N/A',
            getPickupMethodLabel(p.pickupMethod),
            p.pickupDay || 'N/A',
            p.pickupTime || 'N/A',
            p.returnInfo?.day || 'N/A',
            p.returnInfo?.time || 'N/A',
            p.status,
            p.pickupInstructions || 'None',
            p.specialInstructions || 'None',
            formatDate(p.createdAt)
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `pickups_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading && !refreshing) {
        return (
            <div className="font-sans">
                <Header />
                <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-8">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-2 border-plum border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-plum mt-4">Loading pickups...</p>
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
                            Pickup Management
                        </h1>
                        <p className="text-lg text-plum/80">
                            Total pickups: {allPickups.length}
                            <span className="text-sm ml-2">
                                ({clothingItems.length} donations, {reservations.length} reservations)
                            </span>
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
                                        placeholder="Search by name, email, phone, or item..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-cream rounded-lg focus:outline-none focus:ring-2 focus:ring-plum/20 text-plum"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Filter size={20} className="text-plum/60" />
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value as PickupType | 'all')}
                                        className="border border-cream rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-plum/20 text-plum"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="clothing">Donations</option>
                                        <option value="reservation">Reservations</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as PickupStatus | 'all')}
                                        className="border border-cream rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-plum/20 text-plum"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
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

                    {/* Pickups Grid */}
                    {currentPickups.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                            <Truck size={64} className="text-plum/20 mx-auto mb-4" />
                            <p className="text-plum text-lg mb-2">No pickups found</p>
                            <p className="text-plum/60">Try adjusting your filters or check back later.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-6">
                                {currentPickups.map((pickup) => (
                                    <div
                                        key={pickup.id}
                                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                                        onClick={() => setSelectedPickup(pickup)}
                                    >
                                        <div className="p-6">
                                            <div className="flex flex-col lg:flex-row gap-6">
                                                {/* Item Image */}
                                                <div className="lg:w-48 flex-shrink-0">
                                                    <div className="relative aspect-square rounded-xl overflow-hidden bg-cream">
                                                        {pickup.images[0] ? (
                                                            <img
                                                                src={pickup.images[0]}
                                                                alt={pickup.itemName}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = 'https://via.placeholder.com/400x400?text=No+Image';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package size={48} className="text-plum/30" />
                                                            </div>
                                                        )}
                                                        {pickup.images[0] && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setPreviewImage(pickup.images[0]);
                                                                }}
                                                                className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                                                            >
                                                                <Eye size={16} className="text-plum" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Pickup Details */}
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeBadge(pickup.type)}`}>
                                                                    {pickup.type === 'clothing' ? 'Donation' : 'Reservation'}
                                                                </span>
                                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(pickup.status)}`}>
                                                                    {getStatusIcon(pickup.status)}
                                                                    {pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1)}
                                                                </span>
                                                            </div>
                                                            <h3 className="text-xl font-semibold text-plum">
                                                                {pickup.itemName}
                                                            </h3>
                                                            <p className="text-plum/60 text-sm mt-1">
                                                                Size: {pickup.size}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Picker Info */}
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <User size={16} className="text-plum/40" />
                                                            <div>
                                                                <p className="text-xs text-plum/60">Name</p>
                                                                <p className="text-plum font-medium">{pickup.pickerName}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Mail size={16} className="text-plum/40" />
                                                            <div>
                                                                <p className="text-xs text-plum/60">Email</p>
                                                                <p className="text-plum font-medium">{pickup.pickerEmail}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Phone size={16} className="text-plum/40" />
                                                            <div>
                                                                <p className="text-xs text-plum/60">Phone</p>
                                                                <p className="text-plum font-medium">{pickup.pickerPhone}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Pickup Schedule */}
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-cream/30 rounded-xl mb-4">
                                                        <div>
                                                            <p className="text-xs text-plum/60 flex items-center gap-1">
                                                                <Truck size={12} /> Method
                                                            </p>
                                                            <p className="text-plum text-sm font-medium">{getPickupMethodLabel(pickup.pickupMethod)}</p>
                                                        </div>
                                                        {pickup.pickupDay && (
                                                            <div>
                                                                <p className="text-xs text-plum/60 flex items-center gap-1">
                                                                    <Calendar size={12} /> Pickup Day
                                                                </p>
                                                                <p className="text-plum text-sm font-medium">{pickup.pickupDay}</p>
                                                            </div>
                                                        )}
                                                        {pickup.pickupTime && (
                                                            <div>
                                                                <p className="text-xs text-plum/60 flex items-center gap-1">
                                                                    <Clock size={12} /> Pickup Time
                                                                </p>
                                                                <p className="text-plum text-sm font-medium">{pickup.pickupTime}</p>
                                                            </div>
                                                        )}
                                                        {pickup.address && (
                                                            <div>
                                                                <p className="text-xs text-plum/60 flex items-center gap-1">
                                                                    <MapPin size={12} /> Address
                                                                </p>
                                                                <p className="text-plum text-sm font-medium truncate">{pickup.address}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Return Info for Reservations */}
                                                    {pickup.type === 'reservation' && pickup.returnInfo && (
                                                        <div className="p-4 bg-blue-50 rounded-xl">
                                                            <p className="text-sm font-semibold text-plum mb-2">Return Information</p>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-xs text-plum/60">Return Day</p>
                                                                    <p className="text-plum font-medium">{pickup.returnInfo.day}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-plum/60">Return Time</p>
                                                                    <p className="text-plum font-medium">{pickup.returnInfo.time}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Instructions */}
                                                    {(pickup.pickupInstructions || pickup.specialInstructions) && (
                                                        <div className="mt-4 space-y-2 text-sm">
                                                            {pickup.pickupInstructions && (
                                                                <div>
                                                                    <p className="text-xs text-plum/60">Pickup Instructions</p>
                                                                    <p className="text-plum">{pickup.pickupInstructions}</p>
                                                                </div>
                                                            )}
                                                            {pickup.specialInstructions && (
                                                                <div>
                                                                    <p className="text-xs text-plum/60">Special Instructions</p>
                                                                    <p className="text-plum">{pickup.specialInstructions}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Buttons */}
                                                {pickup.status === 'pending' && (
                                                    <div className="flex flex-col gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => updatePickupStatus(pickup, 'completed')}
                                                            disabled={updatingPickup === pickup.id}
                                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                                                        >
                                                            {updatingPickup === pickup.id ? (
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            ) : (
                                                                <CheckCircle size={16} />
                                                            )}
                                                            Mark Completed
                                                        </button>
                                                        <button
                                                            onClick={() => updatePickupStatus(pickup, 'cancelled')}
                                                            disabled={updatingPickup === pickup.id}
                                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                                                        >
                                                            {updatingPickup === pickup.id ? (
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            ) : (
                                                                <XCircle size={16} />
                                                            )}
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
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

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="w-full h-full object-contain"
                        />
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                        >
                            <XCircle size={24} className="text-plum" />
                        </button>
                    </div>
                </div>
            )}

            {/* Pickup Details Modal */}
            {selectedPickup && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedPickup(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-bold text-plum">Pickup Details</h2>
                                <button
                                    onClick={() => setSelectedPickup(null)}
                                    className="p-2 hover:bg-cream rounded-lg transition-colors"
                                >
                                    <XCircle size={24} className="text-plum" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Type and Status */}
                                <div className="flex items-center gap-3">
                                    <span className={`text-sm px-3 py-1 rounded-full font-medium ${getTypeBadge(selectedPickup.type)}`}>
                                        {selectedPickup.type === 'clothing' ? 'Donation Pickup' : 'Reservation Pickup'}
                                    </span>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedPickup.status)}`}>
                                        {getStatusIcon(selectedPickup.status)}
                                        {selectedPickup.status.charAt(0).toUpperCase() + selectedPickup.status.slice(1)}
                                    </span>
                                </div>

                                {/* Item Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-plum mb-3">Item Information</h3>
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-cream/30 rounded-xl">
                                        <div>
                                            <p className="text-sm text-plum/60">Item</p>
                                            <p className="text-plum font-medium">{selectedPickup.itemName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-plum/60">Size</p>
                                            <p className="text-plum font-medium">{selectedPickup.size}</p>
                                        </div>
                                        {selectedPickup.type === 'clothing' && (
                                            <>
                                                <div>
                                                    <p className="text-sm text-plum/60">Item Status</p>
                                                    <p className="text-plum font-medium">{selectedPickup.originalStatus}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Picker Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-plum mb-3">Contact Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-cream/30 rounded-xl">
                                        <div>
                                            <p className="text-sm text-plum/60">Name</p>
                                            <p className="text-plum font-medium">{selectedPickup.pickerName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-plum/60">Email</p>
                                            <p className="text-plum font-medium">{selectedPickup.pickerEmail}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-plum/60">Phone</p>
                                            <p className="text-plum font-medium">{selectedPickup.pickerPhone}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Pickup Details */}
                                <div>
                                    <h3 className="text-lg font-semibold text-plum mb-3">Pickup Details</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-cream/30 rounded-xl">
                                        <div>
                                            <p className="text-sm text-plum/60">Method</p>
                                            <p className="text-plum font-medium">{getPickupMethodLabel(selectedPickup.pickupMethod)}</p>
                                        </div>
                                        {selectedPickup.pickupDay && (
                                            <div>
                                                <p className="text-sm text-plum/60">Day</p>
                                                <p className="text-plum font-medium">{selectedPickup.pickupDay}</p>
                                            </div>
                                        )}
                                        {selectedPickup.pickupTime && (
                                            <div>
                                                <p className="text-sm text-plum/60">Time</p>
                                                <p className="text-plum font-medium">{selectedPickup.pickupTime}</p>
                                            </div>
                                        )}
                                        {selectedPickup.address && (
                                            <div className="col-span-full">
                                                <p className="text-sm text-plum/60">Address</p>
                                                <p className="text-plum">{selectedPickup.address}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Return Info for Reservations */}
                                {selectedPickup.type === 'reservation' && selectedPickup.returnInfo && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-plum mb-3">Return Information</h3>
                                        <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl">
                                            <div>
                                                <p className="text-sm text-plum/60">Return Day</p>
                                                <p className="text-plum font-medium">{selectedPickup.returnInfo.day}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-plum/60">Return Time</p>
                                                <p className="text-plum font-medium">{selectedPickup.returnInfo.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Instructions */}
                                {(selectedPickup.pickupInstructions || selectedPickup.specialInstructions) && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-plum mb-3">Instructions</h3>
                                        <div className="space-y-3 p-4 bg-cream/30 rounded-xl">
                                            {selectedPickup.pickupInstructions && (
                                                <div>
                                                    <p className="text-sm text-plum/60">Pickup Instructions</p>
                                                    <p className="text-plum">{selectedPickup.pickupInstructions}</p>
                                                </div>
                                            )}
                                            {selectedPickup.specialInstructions && (
                                                <div>
                                                    <p className="text-sm text-plum/60">Special Instructions</p>
                                                    <p className="text-plum">{selectedPickup.specialInstructions}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Timeline */}
                                <div>
                                    <h3 className="text-lg font-semibold text-plum mb-3">Timeline</h3>
                                    <div className="p-4 bg-cream/30 rounded-xl">
                                        <div>
                                            <p className="text-sm text-plum/60">Created At</p>
                                            <p className="text-plum font-medium">{formatDate(selectedPickup.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                {selectedPickup.status === 'pending' && (
                                    <div className="flex justify-end gap-3 pt-4 border-t border-cream">
                                        <button
                                            onClick={() => {
                                                updatePickupStatus(selectedPickup, 'completed');
                                                setSelectedPickup(null);
                                            }}
                                            disabled={updatingPickup === selectedPickup.id}
                                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            {updatingPickup === selectedPickup.id ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <CheckCircle size={18} />
                                                    Mark as Completed
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                updatePickupStatus(selectedPickup, 'cancelled');
                                                setSelectedPickup(null);
                                            }}
                                            disabled={updatingPickup === selectedPickup.id}
                                            className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                        >
                                            {updatingPickup === selectedPickup.id ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <XCircle size={18} />
                                                    Cancel Pickup
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}