// components/Profile.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { PhoneEdit } from './PhoneEdit';
import { useAuth } from '../hooks/useAuth';
import { User, Package, Heart, LogOut, Star, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface ClothingItem {
    _id: string;
    images: string[];
    category: string;
    size: string;
    status: string;
    createdAt: string;
    university?: string;
    address?: string;
    pickupMethod?: string;
    fullName?: string;
}

interface Reservation {
    _id: string;
    clothingId: ClothingItem;
    fullName: string;
    email: string;
    phoneNumber: string;
    pickupMethod: string;
    pickupTime: string;
    pickupDay: string;
    returnDay: string;
    returnTime: string;
    status: 'active' | 'completed' | 'cancelled';
    createdAt: string;
}

export function Profile() {
    const { user, isAuthenticated, loading, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'profile' | 'uploads' | 'picks' | 'reservations' | 'settings'>('profile');
    const [uploads, setUploads] = useState<ClothingItem[]>([]);
    const [picks, setPicks] = useState<ClothingItem[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoadingUploads, setIsLoadingUploads] = useState(false);
    const [isLoadingPicks, setIsLoadingPicks] = useState(false);
    const [isLoadingReservations, setIsLoadingReservations] = useState(false);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, loading, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            if (activeTab === 'uploads') {
                fetchUserUploads();
            } else if (activeTab === 'picks') {
                fetchUserPicks();
            } else if (activeTab === 'reservations') {
                fetchUserReservations();
            }
        }
    }, [isAuthenticated, activeTab]);

    const fetchUserUploads = async () => {
        setIsLoadingUploads(true);
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

            const response = await axios.get(`${API_URL}/clothing/my-items`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUploads(response.data.data);
        } catch (error) {
            console.error('Error fetching uploads:', error);
        } finally {
            setIsLoadingUploads(false);
        }
    };

    const fetchUserPicks = async () => {
        setIsLoadingPicks(true);
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

            const response = await axios.get(`${API_URL}/users/picks`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setPicks(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching picks:', error);
            setPicks([]);
        } finally {
            setIsLoadingPicks(false);
        }
    };

    const fetchUserReservations = async () => {
        setIsLoadingReservations(true);
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

            const response = await axios.get(`${API_URL}/users/reservations`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setReservations(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching reservations:', error);
            setReservations([]);
        } finally {
            setIsLoadingReservations(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handlePhoneUpdate = (newPhone: string) => {
        console.log('Phone updated to:', newPhone);
    };

    const handleRemovePick = async (itemId: string) => {
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

            await axios.delete(`${API_URL}/users/picks/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPicks(prev => prev.filter(item => item._id !== itemId));
        } catch (error) {
            console.error('Error removing pick:', error);
        }
    };

    if (loading) {
        return (
            <div className="font-inter">
                <Header />
                <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-8">
                    <div className="container mx-auto px-4 max-w-4xl text-center">
                        <div className="bg-white rounded-2xl shadow-lg p-12">
                            <div className="w-16 h-16 border-4 border-rose border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-plum">Loading profile...</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="font-inter">
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-12">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Profile Header */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                        <div className="h-32 bg-gradient-to-r from-plum to-rose"></div>
                        <div className="px-8 pb-8 relative">
                            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
                                <div className="w-32 h-32 bg-cream rounded-2xl border-4 border-white shadow-lg flex items-center justify-center">
                                    <User size={48} className="text-plum/40" />
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-3xl font-kaldera text-plum">{user.name}</h1>
                                    <p className="text-plum/60">{user.email}</p>
                                    {user.phone && (
                                        <p className="text-plum/60 text-sm mt-1">
                                            {user.phone}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            user.role === 'admin'
                                                ? 'bg-rose/20 text-rose'
                                                : 'bg-plum/10 text-plum'
                                        }`}>
                                            {user.role === 'admin' ? 'Administrator' : 'Member'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-8 border-b border-cream overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-6 py-3 font-medium transition-all relative whitespace-nowrap ${
                                activeTab === 'profile'
                                    ? 'text-rose after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-rose'
                                    : 'text-plum/60 hover:text-plum'
                            }`}
                        >
                            Profile Info
                        </button>
                        <button
                            onClick={() => setActiveTab('uploads')}
                            className={`px-6 py-3 font-medium transition-all relative whitespace-nowrap ${
                                activeTab === 'uploads'
                                    ? 'text-rose after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-rose'
                                    : 'text-plum/60 hover:text-plum'
                            }`}
                        >
                            My Uploads
                        </button>
                        <button
                            onClick={() => setActiveTab('picks')}
                            className={`px-6 py-3 font-medium transition-all relative whitespace-nowrap ${
                                activeTab === 'picks'
                                    ? 'text-rose after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-rose'
                                    : 'text-plum/60 hover:text-plum'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <Heart size={16} />
                                My Picks
                                {picks.length > 0 && (
                                    <span className="bg-rose text-white text-xs px-2 py-0.5 rounded-full">
                                        {picks.length}
                                    </span>
                                )}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('reservations')}
                            className={`px-6 py-3 font-medium transition-all relative whitespace-nowrap ${
                                activeTab === 'reservations'
                                    ? 'text-rose after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-rose'
                                    : 'text-plum/60 hover:text-plum'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <CheckCircle size={16} />
                                My Reservations
                                {reservations.length > 0 && (
                                    <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {reservations.length}
                                    </span>
                                )}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-6 py-3 font-medium transition-all relative whitespace-nowrap ${
                                activeTab === 'settings'
                                    ? 'text-rose after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-rose'
                                    : 'text-plum/60 hover:text-plum'
                            }`}
                        >
                            Settings
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-kaldera text-plum mb-6">Profile Information</h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-plum/60 mb-2">Full Name</label>
                                        <div className="p-3 bg-cream/30 rounded-lg text-plum">{user.name}</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-plum/60 mb-2">Email Address</label>
                                        <div className="p-3 bg-cream/30 rounded-lg text-plum">{user.email}</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-plum/60 mb-2">Phone Number</label>
                                        <div className="p-3 bg-cream/30 rounded-lg">
                                            <PhoneEdit
                                                phone={user.phone || ''}
                                                onUpdate={handlePhoneUpdate}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-plum/60 mb-2">Member Since</label>
                                        <div className="p-3 bg-cream/30 rounded-lg text-plum">
                                            {new Date().toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Summary */}
                                <div className="border-t border-cream pt-6 mt-6">
                                    <h3 className="text-lg font-kaldera text-plum mb-4">Activity Summary</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-cream/30 rounded-xl p-4 text-center">
                                            <Package className="mx-auto text-rose mb-2" size={24} />
                                            <div className="text-2xl font-bold text-plum">{uploads.length}</div>
                                            <div className="text-sm text-plum/60">Items Uploaded</div>
                                        </div>
                                        <div className="bg-cream/30 rounded-xl p-4 text-center">
                                            <Heart className="mx-auto text-rose mb-2" size={24} />
                                            <div className="text-2xl font-bold text-plum">{picks.length}</div>
                                            <div className="text-sm text-plum/60">Items Picked</div>
                                        </div>
                                        <div className="bg-cream/30 rounded-xl p-4 text-center">
                                            <CheckCircle className="mx-auto text-green-600 mb-2" size={24} />
                                            <div className="text-2xl font-bold text-plum">{reservations.length}</div>
                                            <div className="text-sm text-plum/60">Reservations</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-cream pt-6 mt-6">
                                    <h3 className="text-lg font-kaldera text-plum mb-4">Quick Actions</h3>
                                    <div className="flex flex-wrap gap-4">
                                        <button
                                            onClick={() => navigate('/upload')}
                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-plum to-rose text-cream rounded-lg hover:shadow-lg transition-all"
                                        >
                                            <Package size={18} />
                                            Upload New Item
                                        </button>
                                        <button
                                            onClick={() => {
                                                setActiveTab('uploads');
                                                fetchUserUploads();
                                            }}
                                            className="flex items-center gap-2 px-6 py-3 border-2 border-rose text-plum rounded-lg hover:bg-rose/10 transition-all"
                                        >
                                            <Heart size={18} />
                                            View My Uploads
                                        </button>
                                        <button
                                            onClick={() => {
                                                setActiveTab('picks');
                                                fetchUserPicks();
                                            }}
                                            className="flex items-center gap-2 px-6 py-3 border-2 border-plum/20 text-plum rounded-lg hover:bg-plum/5 transition-all"
                                        >
                                            <Star size={18} />
                                            View My Picks
                                        </button>
                                        <button
                                            onClick={() => {
                                                setActiveTab('reservations');
                                                fetchUserReservations();
                                            }}
                                            className="flex items-center gap-2 px-6 py-3 border-2 border-green-600/20 text-green-700 rounded-lg hover:bg-green-50 transition-all"
                                        >
                                            <CheckCircle size={18} />
                                            View My Reservations
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'uploads' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-kaldera text-plum">My Uploaded Items</h2>
                                    <button
                                        onClick={() => navigate('/upload')}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-plum to-rose text-cream rounded-lg text-sm hover:shadow-lg transition-all"
                                    >
                                        <Package size={16} />
                                        Upload New
                                    </button>
                                </div>

                                {isLoadingUploads ? (
                                    <div className="text-center py-12">
                                        <div className="w-12 h-12 border-4 border-rose border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </div>
                                ) : uploads.length === 0 ? (
                                    <div className="text-center py-12 bg-cream/30 rounded-xl">
                                        <Package size={48} className="text-plum/20 mx-auto mb-4" />
                                        <p className="text-plum/60 mb-4">You haven't uploaded any items yet.</p>
                                        <button
                                            onClick={() => navigate('/upload')}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-plum to-rose text-cream rounded-lg hover:shadow-lg transition-all"
                                        >
                                            Upload Your First Item
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {uploads.map((item) => (
                                            <div key={item._id} className="bg-cream/20 rounded-xl overflow-hidden border border-cream hover:shadow-lg transition-all group">
                                                <div
                                                    className="h-48 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                                                    style={{ backgroundImage: `url(${item.images[0]})` }}
                                                />
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h3 className="font-semibold text-plum">{item.category}</h3>
                                                            <p className="text-sm text-plum/60">Size: {item.size}</p>
                                                            {item.university && (
                                                                <p className="text-xs text-plum/40 mt-1">{item.university}</p>
                                                            )}
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                            item.status === 'available'
                                                                ? 'bg-green-100 text-green-700'
                                                                : item.status === 'reserved'
                                                                    ? 'bg-yellow-100 text-yellow-700'
                                                                    : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-plum/40">
                                                        Uploaded: {new Date(item.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'picks' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-kaldera text-plum flex items-center gap-2">
                                        <Heart className="text-rose" size={24} />
                                        My Picks
                                    </h2>
                                    <span className="text-sm text-plum/60 bg-cream/50 px-3 py-1 rounded-full">
                                        {picks.length} items saved
                                    </span>
                                </div>

                                {isLoadingPicks ? (
                                    <div className="text-center py-12">
                                        <div className="w-12 h-12 border-4 border-rose border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </div>
                                ) : picks.length === 0 ? (
                                    <div className="text-center py-12 bg-cream/30 rounded-xl">
                                        <Heart size={48} className="text-plum/20 mx-auto mb-4" />
                                        <p className="text-plum/60 mb-2">No picks yet</p>
                                        <p className="text-sm text-plum/40 mb-6">
                                            Browse the collection and save items you like
                                        </p>
                                        <button
                                            onClick={() => navigate('/collections-m')}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-plum to-rose text-cream rounded-lg hover:shadow-lg transition-all"
                                        >
                                            Browse Collection
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {picks.map((item) => (
                                            <div key={item._id} className="bg-cream/20 rounded-xl overflow-hidden border border-cream hover:shadow-lg transition-all group relative">
                                                <div
                                                    className="h-48 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                                                    style={{ backgroundImage: `url(${item.images[0]})` }}
                                                />
                                                <button
                                                    onClick={() => handleRemovePick(item._id)}
                                                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-rose hover:text-white transition-colors"
                                                    title="Remove from picks"
                                                >
                                                    <Heart size={16} className="fill-rose text-rose" />
                                                </button>
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h3 className="font-semibold text-plum">
                                                                {item.fullName ? `${item.fullName}'s ${item.category}` : item.category}
                                                            </h3>
                                                            <p className="text-sm text-plum/60">Size: {item.size}</p>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                            item.status === 'available'
                                                                ? 'bg-green-100 text-green-700'
                                                                : item.status === 'reserved'
                                                                    ? 'bg-yellow-100 text-yellow-700'
                                                                    : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-plum/40">
                                                        Added: {new Date(item.createdAt).toLocaleDateString()}
                                                    </p>
                                                    {item.status === 'reserved' && (
                                                        <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-1 rounded flex items-center gap-1">
                                                            <CheckCircle size={12} />
                                                            Already reserved by someone
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'reservations' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-kaldera text-plum flex items-center gap-2">
                                        <CheckCircle className="text-green-600" size={24} />
                                        My Reservations
                                    </h2>
                                    <span className="text-sm text-plum/60 bg-cream/50 px-3 py-1 rounded-full">
                                        {reservations.length} confirmed
                                    </span>
                                </div>

                                {isLoadingReservations ? (
                                    <div className="text-center py-12">
                                        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </div>
                                ) : reservations.length === 0 ? (
                                    <div className="text-center py-12 bg-cream/30 rounded-xl">
                                        <CheckCircle size={48} className="text-plum/20 mx-auto mb-4" />
                                        <p className="text-plum/60 mb-2">No reservations yet</p>
                                        <p className="text-sm text-plum/40 mb-6">
                                            Your paid and confirmed reservations will appear here
                                        </p>
                                        <button
                                            onClick={() => navigate('/collections-m')}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-plum to-rose text-cream rounded-lg hover:shadow-lg transition-all"
                                        >
                                            Browse Collection
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {reservations.map((reservation) => (
                                            <div key={reservation._id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl overflow-hidden border border-green-200 shadow-md hover:shadow-lg transition-all">
                                                <div className="flex flex-col md:flex-row">
                                                    {reservation.clothingId && reservation.clothingId.images && reservation.clothingId.images.length > 0 && (
                                                        <div className="md:w-48 h-48 md:h-auto">
                                                            <img
                                                                src={reservation.clothingId.images[0]}
                                                                alt={reservation.clothingId.category}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 p-6">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <h3 className="text-xl font-bold text-plum">
                                                                    {reservation.clothingId?.fullName
                                                                        ? `${reservation.clothingId.fullName}'s ${reservation.clothingId.category}`
                                                                        : 'Reserved Item'}
                                                                </h3>
                                                                <p className="text-plum/60">Size: {reservation.clothingId?.size || 'N/A'}</p>
                                                            </div>
                                                            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                                                <CheckCircle size={12} />
                                                                PAID & CONFIRMED
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                            <div className="bg-white/50 rounded-lg p-3">
                                                                <p className="text-xs text-plum/40">Delivery</p>
                                                                <p className="text-sm font-medium text-plum">{reservation.pickupDay || 'Not specified'}</p>
                                                                <p className="text-xs text-plum/60">{reservation.pickupTime || ''}</p>
                                                            </div>
                                                            <div className="bg-white/50 rounded-lg p-3">
                                                                <p className="text-xs text-plum/40">Return/Pickup</p>
                                                                <p className="text-sm font-medium text-plum">{reservation.returnDay || 'Not specified'}</p>
                                                                <p className="text-xs text-plum/60">{reservation.returnTime || ''}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-between items-center text-xs text-plum/40 border-t border-green-200 pt-3">
                                                            <span>Reserved on: {new Date(reservation.createdAt).toLocaleDateString()}</span>
                                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                                {reservation.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div>
                                <h2 className="text-2xl font-kaldera text-plum mb-6">Account Settings</h2>
                                <p className="text-plum/60 mb-8">Settings panel coming soon...</p>
                                <div className="bg-cream/30 rounded-xl p-6">
                                    <p className="text-plum">You'll be able to update your password, email preferences, and more here.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}