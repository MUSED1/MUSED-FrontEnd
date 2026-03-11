// components/AdminReservations.tsx
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
    AlertCircle,
    Download,
    RefreshCw
} from 'lucide-react';

// Define proper types based on your MongoDB schema
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

export function AdminReservations() {
    const [allReservations, setAllReservations] = useState<ReservationItem[]>([]);
    const [filteredReservations, setFilteredReservations] = useState<ReservationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedReservation, setSelectedReservation] = useState<ReservationItem | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Use this for server-side pagination info
    const [pagination, setPagination] = useState({
        totalPages: 1,
        totalItems: 0
    });

    const statusOptions = ['all', 'active', 'completed', 'cancelled'];

    useEffect(() => {
        fetchReservations();
    }, [currentPage, statusFilter]);

    useEffect(() => {
        filterReservations();
    }, [allReservations, searchTerm]);

    const fetchReservations = async () => {
        try {
            setLoading(true);
            setError('');
            setRefreshing(true);

            const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

            // Build URL with filters
            let url = `${API_URL}/admin/reservations?page=${currentPage}&limit=${itemsPerPage}`;

            // Add status filter to API call if not 'all'
            if (statusFilter !== 'all') {
                url += `&status=${statusFilter}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch reservations: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch reservations');
            }

            // Handle different response structures
            const reservations = result.data || result.reservations || [];
            setAllReservations(reservations);

            // Set pagination info
            if (result.pagination) {
                setPagination({
                    totalPages: result.pagination.totalPages || 1,
                    totalItems: result.pagination.totalItems || reservations.length
                });
            }

        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Error fetching reservations');
            setAllReservations([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filterReservations = () => {
        // Only apply search filter client-side
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

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setFilteredReservations(filtered);
    };

    const updateReservationStatus = async (reservationId: string, newStatus: 'active' | 'completed' | 'cancelled') => {
        try {
            setUpdatingStatus(reservationId);
            setError('');

            const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

            const response = await fetch(`${API_URL}/admin/reservations/${reservationId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update reservation status');
            }

            const result = await response.json();

            if (result.success) {
                // Update local state
                const updatedReservations = allReservations.map(res =>
                    res._id === reservationId ? { ...res, status: newStatus } : res
                );

                setAllReservations(updatedReservations);

                // Also update the selected reservation if it's the one being viewed
                if (selectedReservation && selectedReservation._id === reservationId) {
                    setSelectedReservation({ ...selectedReservation, status: newStatus });
                }
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

    const handleFilterChange = (newStatus: string) => {
        setStatusFilter(newStatus);
        setCurrentPage(1); // Reset to first page when filter changes
        fetchReservations(); // Re-fetch with new filter
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

    // Pagination - use server-side pagination if we have it
    const totalPages = pagination.totalPages;
    const currentReservations = filteredReservations;

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

        const csvData = allReservations.map(res => [
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

    if (loading && !refreshing) {
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
                            Total reservations: {pagination.totalItems}
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
                                        onChange={(e) => handleFilterChange(e.target.value)}
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
                    {currentReservations.length === 0 ? (
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
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                                        <div>
                                                            <h3 className="text-xl font-semibold text-plum mb-1">
                                                                {reservation.fullName}
                                                            </h3>
                                                            <p className="text-plum/60 text-sm">
                                                                {reservation.email} • {reservation.phoneNumber}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {/* Status badge */}
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(reservation.status)}`}>
                                                                {getStatusIcon(reservation.status)}
                                                                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                                            </span>

                                                            {/* Status update buttons */}
                                                            {reservation.status === 'active' && (
                                                                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                                    <button
                                                                        onClick={() => updateReservationStatus(reservation._id, 'completed')}
                                                                        disabled={updatingStatus === reservation._id}
                                                                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                                                        title="Mark as completed"
                                                                    >
                                                                        <CheckCircle size={18} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => updateReservationStatus(reservation._id, 'cancelled')}
                                                                        disabled={updatingStatus === reservation._id}
                                                                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                                                        title="Cancel reservation"
                                                                    >
                                                                        <XCircle size={18} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {updatingStatus === reservation._id && (
                                                                <div className="w-5 h-5 border-2 border-plum border-t-transparent rounded-full animate-spin"></div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Item details */}
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                        <div>
                                                            <p className="text-sm text-plum/60">Category</p>
                                                            <p className="text-plum font-medium">{reservation.clothingId?.category || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-plum/60">Size</p>
                                                            <p className="text-plum font-medium">{reservation.clothingId?.size || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-plum/60">Owner</p>
                                                            <p className="text-plum font-medium">{reservation.clothingId?.fullName || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-plum/60">Reservation Date</p>
                                                            <p className="text-plum font-medium">{formatDate(reservation.createdAt)}</p>
                                                        </div>
                                                    </div>

                                                    {/* Pickup & Return Details */}
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-cream/30 rounded-xl">
                                                        <div>
                                                            <p className="text-sm text-plum/60">Pickup Method</p>
                                                            <p className="text-plum font-medium">{getPickupMethodLabel(reservation.pickupMethod)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-plum/60">Pickup Day</p>
                                                            <p className="text-plum font-medium">{reservation.pickupDay}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-plum/60">Pickup Time</p>
                                                            <p className="text-plum font-medium">{reservation.pickupTime}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-plum/60">Return Day</p>
                                                            <p className="text-plum font-medium">{reservation.returnDay}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-plum/60">Return Time</p>
                                                            <p className="text-plum font-medium">{reservation.returnTime}</p>
                                                        </div>
                                                    </div>

                                                    {/* Instructions */}
                                                    {(reservation.pickupInstructions || reservation.specialInstructions) && (
                                                        <div className="mt-4 space-y-2">
                                                            {reservation.pickupInstructions && (
                                                                <div>
                                                                    <p className="text-sm text-plum/60">Pickup Instructions</p>
                                                                    <p className="text-plum">{reservation.pickupInstructions}</p>
                                                                </div>
                                                            )}
                                                            {reservation.specialInstructions && (
                                                                <div>
                                                                    <p className="text-sm text-plum/60">Special Instructions</p>
                                                                    <p className="text-plum">{reservation.specialInstructions}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
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

            {/* Reservation Details Modal */}
            {selectedReservation && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedReservation(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-bold text-plum">Reservation Details</h2>
                                <button
                                    onClick={() => setSelectedReservation(null)}
                                    className="p-2 hover:bg-cream rounded-lg transition-colors"
                                >
                                    <XCircle size={24} className="text-plum" />
                                </button>
                            </div>

                            {/* Modal content - similar to card but more detailed */}
                            <div className="space-y-6">
                                {/* Customer Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-plum mb-3">Customer Information</h3>
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-cream/30 rounded-xl">
                                        <div>
                                            <p className="text-sm text-plum/60">Full Name</p>
                                            <p className="text-plum font-medium">{selectedReservation.fullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-plum/60">Email</p>
                                            <p className="text-plum font-medium">{selectedReservation.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-plum/60">Phone</p>
                                            <p className="text-plum font-medium">{selectedReservation.phoneNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-plum/60">Status</p>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedReservation.status)}`}>
                                                {getStatusIcon(selectedReservation.status)}
                                                {selectedReservation.status.charAt(0).toUpperCase() + selectedReservation.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Item Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-plum mb-3">Item Information</h3>
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-cream/30 rounded-xl">
                                        <div>
                                            <p className="text-sm text-plum/60">Category</p>
                                            <p className="text-plum font-medium">{selectedReservation.clothingId?.category || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-plum/60">Size</p>
                                            <p className="text-plum font-medium">{selectedReservation.clothingId?.size || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-plum/60">Owner</p>
                                            <p className="text-plum font-medium">{selectedReservation.clothingId?.fullName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-plum/60">Item Status</p>
                                            <p className="text-plum font-medium">{selectedReservation.clothingId?.status || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div>
                                    <h3 className="text-lg font-semibold text-plum mb-3">Schedule</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-cream/30 rounded-xl">
                                        <div>
                                            <p className="text-sm text-plum/60">Pickup Method</p>
                                            <p className="text-plum font-medium">{getPickupMethodLabel(selectedReservation.pickupMethod)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-plum/60">Pickup Day</p>
                                            <p className="text-plum font-medium">{selectedReservation.pickupDay}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-plum/60">Pickup Time</p>
                                            <p className="text-plum font-medium">{selectedReservation.pickupTime}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-plum/60">Return Day</p>
                                            <p className="text-plum font-medium">{selectedReservation.returnDay}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-plum/60">Return Time</p>
                                            <p className="text-plum font-medium">{selectedReservation.returnTime}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Instructions */}
                                {(selectedReservation.pickupInstructions || selectedReservation.specialInstructions) && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-plum mb-3">Instructions</h3>
                                        <div className="space-y-4 p-4 bg-cream/30 rounded-xl">
                                            {selectedReservation.pickupInstructions && (
                                                <div>
                                                    <p className="text-sm text-plum/60">Pickup Instructions</p>
                                                    <p className="text-plum">{selectedReservation.pickupInstructions}</p>
                                                </div>
                                            )}
                                            {selectedReservation.specialInstructions && (
                                                <div>
                                                    <p className="text-sm text-plum/60">Special Instructions</p>
                                                    <p className="text-plum">{selectedReservation.specialInstructions}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Dates */}
                                <div>
                                    <h3 className="text-lg font-semibold text-plum mb-3">Timeline</h3>
                                    <div className="p-4 bg-cream/30 rounded-xl">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-plum/60">Created At</p>
                                                <p className="text-plum font-medium">{formatDate(selectedReservation.createdAt)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-plum/60">Last Updated</p>
                                                <p className="text-plum font-medium">{formatDate(selectedReservation.createdAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                {selectedReservation.status === 'active' && (
                                    <div className="flex justify-end gap-3 pt-4 border-t border-cream">
                                        <button
                                            onClick={() => {
                                                updateReservationStatus(selectedReservation._id, 'completed');
                                                setSelectedReservation(null);
                                            }}
                                            disabled={updatingStatus === selectedReservation._id}
                                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            {updatingStatus === selectedReservation._id ? (
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
                                                updateReservationStatus(selectedReservation._id, 'cancelled');
                                                setSelectedReservation(null);
                                            }}
                                            disabled={updatingStatus === selectedReservation._id}
                                            className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                        >
                                            {updatingStatus === selectedReservation._id ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <XCircle size={18} />
                                                    Cancel Reservation
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