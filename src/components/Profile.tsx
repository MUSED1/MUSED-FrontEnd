// components/Profile.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { PhoneEdit } from './PhoneEdit';
import { useAuth } from '../hooks/useAuth';
import { User, Package, Heart, LogOut, Star, CheckCircle, AlertCircle, Camera, X } from 'lucide-react';
import axios from 'axios';

interface ClothingItem {
    _id: string;
    images: string[];
    category: string;
    size: string;
    status: string;
    createdAt: string;
    aiProcessed?: boolean;
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
    const { user, isAuthenticated, loading, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showUploadSuccess, setShowUploadSuccess] = useState(
        (location.state as { uploadSuccess?: boolean })?.uploadSuccess === true
    );
    const [activeTab, setActiveTab] = useState<'profile' | 'uploads' | 'picks' | 'reservations' | 'settings'>('profile');
    const [uploads, setUploads] = useState<ClothingItem[]>([]);
    const [picks, setPicks] = useState<ClothingItem[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoadingUploads, setIsLoadingUploads] = useState(false);
    const [isLoadingPicks, setIsLoadingPicks] = useState(false);
    const [isLoadingReservations, setIsLoadingReservations] = useState(false);
    const [showPhoneRequiredWarning, setShowPhoneRequiredWarning] = useState(false);

    // Avatar states
    const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Add state for activity counts
    const [activityCounts, setActivityCounts] = useState({
        uploads: 0,
        picks: 0,
        reservations: 0
    });

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, loading, navigate]);

    // Auto-dismiss upload success banner after 6 seconds
    useEffect(() => {
        if (!showUploadSuccess) return;
        const timer = setTimeout(() => setShowUploadSuccess(false), 6000);
        return () => clearTimeout(timer);
    }, [showUploadSuccess]);

    // Auto-dismiss phone warning after 6 seconds
    useEffect(() => {
        if (!showPhoneRequiredWarning) return;
        const timer = setTimeout(() => setShowPhoneRequiredWarning(false), 6000);
        return () => clearTimeout(timer);
    }, [showPhoneRequiredWarning]);

    // Fetch all activity data when component mounts
    useEffect(() => {
        if (isAuthenticated) {
            fetchAllActivityData();
        }
    }, [isAuthenticated]);

    // Sync avatar when user changes
    useEffect(() => {
        if (user?.avatar) {
            setAvatar(user.avatar);
        }
    }, [user?.avatar]);

    // Check if user has phone number
    const hasPhoneNumber = () => {
        return user?.phone && user.phone.trim().length > 0;
    };

    // Wrapper function for actions that require phone number
    const requirePhoneNumber = (action: () => void) => {
        if (hasPhoneNumber()) {
            action();
        } else {
            setShowPhoneRequiredWarning(true);
            // Scroll to the warning
            setTimeout(() => {
                document.getElementById('phone-required-warning')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };

    // Avatar upload handler
    const handleAvatarUpload = async (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            setAvatarError('Please select an image file');
            setTimeout(() => setAvatarError(null), 3000);
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setAvatarError('Image must be less than 5MB');
            setTimeout(() => setAvatarError(null), 3000);
            return;
        }

        setIsUploadingAvatar(true);
        setAvatarError(null);

        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

            const formData = new FormData();
            formData.append('avatar', file);

            const response = await axios.post(`${API_URL}/profile/avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setAvatar(response.data.avatar);
                // Update user context with new avatar
                updateUser({ avatar: response.data.avatar });
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            setAvatarError('Failed to upload image. Please try again.');
            setTimeout(() => setAvatarError(null), 3000);
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    // Avatar removal handler
    const handleRemoveAvatar = async () => {
        if (!avatar) return;

        setIsUploadingAvatar(true);
        setAvatarError(null);

        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

            await axios.delete(`${API_URL}/profile/avatar`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setAvatar(null);
            updateUser({ avatar: undefined });
        } catch (error) {
            console.error('Error removing avatar:', error);
            setAvatarError('Failed to remove image. Please try again.');
            setTimeout(() => setAvatarError(null), 3000);
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    // File selection handler
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleAvatarUpload(file);
        }
        // Reset input so same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const fetchAllActivityData = async () => {
        // Fetch uploads
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

            // Fetch uploads
            const uploadsResponse = await axios.get(`${API_URL}/clothing/my-items`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (uploadsResponse.data.success) {
                setUploads(uploadsResponse.data.data);
                setActivityCounts(prev => ({ ...prev, uploads: uploadsResponse.data.data.length }));
            }

            // Fetch picks
            const picksResponse = await axios.get(`${API_URL}/users/picks`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (picksResponse.data.success) {
                setPicks(picksResponse.data.data);
                setActivityCounts(prev => ({ ...prev, picks: picksResponse.data.data.length }));
            }

            // Fetch reservations
            const reservationsResponse = await axios.get(`${API_URL}/users/reservations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (reservationsResponse.data.success) {
                setReservations(reservationsResponse.data.data);
                setActivityCounts(prev => ({ ...prev, reservations: reservationsResponse.data.data.length }));
            }
        } catch (error) {
            console.error('Error fetching activity data:', error);
        }
    };

    const fetchUserUploads = async () => {
        setIsLoadingUploads(true);
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

            const response = await axios.get(`${API_URL}/clothing/my-items`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUploads(response.data.data);
            setActivityCounts(prev => ({ ...prev, uploads: response.data.data.length }));
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
                setActivityCounts(prev => ({ ...prev, picks: response.data.data.length }));
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
                setActivityCounts(prev => ({ ...prev, reservations: response.data.data.length }));
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
        // Refresh user data or update local state
        if (user) {
            user.phone = newPhone;
        }
        // Dismiss warning if it was showing
        setShowPhoneRequiredWarning(false);
    };

    const handleRemovePick = async (itemId: string) => {
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

            await axios.delete(`${API_URL}/users/picks/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPicks(prev => prev.filter(item => item._id !== itemId));
            setActivityCounts(prev => ({ ...prev, picks: prev.picks - 1 }));
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
                    {/* Phone Required Warning Banner */}
                    {showPhoneRequiredWarning && !hasPhoneNumber() && (
                        <div id="phone-required-warning" className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-5 py-4 mb-6 shadow-sm animate-fadeIn">
                            <div className="flex items-center gap-3">
                                <AlertCircle size={22} className="text-amber-500 shrink-0" />
                                <div>
                                    <p className="font-semibold">Phone Number Required </p>
                                    <p className="text-sm text-amber-700">Please add your phone number in the Profile Info tab before accessing these features.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPhoneRequiredWarning(false)}
                                className="text-amber-500 hover:text-amber-700 transition-colors shrink-0 text-lg leading-none"
                                aria-label="Dismiss"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Upload success banner */}
                    {showUploadSuccess && (
                        <div className="flex items-center justify-between gap-4 bg-green-50 border border-green-200 text-green-800 rounded-xl px-5 py-4 mb-6 shadow-sm animate-fadeIn">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={22} className="text-green-500 shrink-0" />
                                <div>
                                    <p className="font-semibold">Thank you for your submission! </p>
                                    <p className="text-sm text-green-700">Your clothing items were uploaded successfully and are now being reviewed.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowUploadSuccess(false)}
                                className="text-green-500 hover:text-green-700 transition-colors shrink-0 text-lg leading-none"
                                aria-label="Dismiss"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Profile Header */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                        <div className="h-32 bg-gradient-to-r from-plum to-rose"></div>
                        <div className="px-8 pb-8 relative">
                            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
                                {/* Avatar Section with Upload */}
                                <div className="relative group">
                                    <div className="w-32 h-32 bg-cream rounded-2xl border-4 border-white shadow-lg overflow-hidden">
                                        {avatar ? (
                                            <img
                                                src={avatar}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                                onError={() => setAvatar(null)}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User size={48} className="text-plum/40" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Upload button overlay - appears on hover */}
                                    <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploadingAvatar}
                                            className="p-2 bg-white rounded-full hover:bg-cream transition-colors disabled:opacity-50"
                                            title="Upload photo"
                                        >
                                            <Camera size={18} className="text-plum" />
                                        </button>
                                        {avatar && (
                                            <button
                                                onClick={handleRemoveAvatar}
                                                disabled={isUploadingAvatar}
                                                className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                                                title="Remove photo"
                                            >
                                                <X size={18} className="text-red-500" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Hidden file input */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />

                                    {/* Loading spinner */}
                                    {isUploadingAvatar && (
                                        <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-rose border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>

                                {/* Avatar error message */}
                                {avatarError && (
                                    <p className="text-red-500 text-xs mt-1 absolute left-36 bottom-0">{avatarError}</p>
                                )}

                                <div className="flex-1">
                                    <h1 className="text-3xl font-kaldera text-plum">{user.name}</h1>
                                    <p className="text-plum/60">{user.email}</p>
                                    {user.phone && (
                                        <p className="text-plum/60 text-sm mt-1">
                                            {user.phone}
                                        </p>
                                    )}
                                    {!user.phone && (
                                        <p className="text-amber-600 text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle size={14} />
                                            Phone number required for certain actions
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
                                {activityCounts.picks > 0 && (
                                    <span className="bg-rose text-white text-xs px-2 py-0.5 rounded-full">
                                        {activityCounts.picks}
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
                                {activityCounts.reservations > 0 && (
                                    <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {activityCounts.reservations}
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
                                        <label className="block text-sm font-medium text-plum/60 mb-2">
                                            Phone Number
                                            {!user.phone && <span className="text-amber-500 ml-2">* Required for actions</span>}
                                        </label>
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
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Summary - Now using real data */}
                                <div className="border-t border-cream pt-6 mt-6">
                                    <h3 className="text-lg font-kaldera text-plum mb-4">Activity Summary</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-cream/30 rounded-xl p-4 text-center">
                                            <Package className="mx-auto text-rose mb-2" size={24} />
                                            <div className="text-2xl font-bold text-plum">{activityCounts.uploads}</div>
                                            <div className="text-sm text-plum/60">Items Uploaded</div>
                                        </div>
                                        <div className="bg-cream/30 rounded-xl p-4 text-center">
                                            <Heart className="mx-auto text-rose mb-2" size={24} />
                                            <div className="text-2xl font-bold text-plum">{activityCounts.picks}</div>
                                            <div className="text-sm text-plum/60">Items Picked</div>
                                        </div>
                                        <div className="bg-cream/30 rounded-xl p-4 text-center">
                                            <CheckCircle className="mx-auto text-green-600 mb-2" size={24} />
                                            <div className="text-2xl font-bold text-plum">{activityCounts.reservations}</div>
                                            <div className="text-sm text-plum/60">Reservations</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-cream pt-6 mt-6">
                                    <h3 className="text-lg font-kaldera text-plum mb-4">Quick Actions</h3>
                                    <div className="flex flex-wrap gap-4">
                                        <button
                                            onClick={() => requirePhoneNumber(() => navigate('/upload'))}
                                            className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-plum to-rose text-cream rounded-lg hover:shadow-lg transition-all ${
                                                !hasPhoneNumber() ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                            title={!hasPhoneNumber() ? 'Phone number required' : ''}
                                        >
                                            <Package size={18} />
                                            Be Part Of The Collection APPLY HERE
                                        </button>
                                        <button
                                            onClick={() => requirePhoneNumber(() => {
                                                setActiveTab('uploads');
                                                fetchUserUploads();
                                            })}
                                            className={`flex items-center gap-2 px-6 py-3 border-2 border-rose text-plum rounded-lg hover:bg-rose/10 transition-all ${
                                                !hasPhoneNumber() ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                            title={!hasPhoneNumber() ? 'Phone number required' : ''}
                                        >
                                            <Heart size={18} />
                                            View My Uploads
                                        </button>
                                        <button
                                            onClick={() => requirePhoneNumber(() => {
                                                setActiveTab('picks');
                                                fetchUserPicks();
                                            })}
                                            className={`flex items-center gap-2 px-6 py-3 border-2 border-plum/20 text-plum rounded-lg hover:bg-plum/5 transition-all ${
                                                !hasPhoneNumber() ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                            title={!hasPhoneNumber() ? 'Phone number required' : ''}
                                        >
                                            <Star size={18} />
                                            View My Picks
                                        </button>
                                        <button
                                            onClick={() => requirePhoneNumber(() => {
                                                setActiveTab('reservations');
                                                fetchUserReservations();
                                            })}
                                            className={`flex items-center gap-2 px-6 py-3 border-2 border-green-600/20 text-green-700 rounded-lg hover:bg-green-50 transition-all ${
                                                !hasPhoneNumber() ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                            title={!hasPhoneNumber() ? 'Phone number required' : ''}
                                        >
                                            <CheckCircle size={18} />
                                            View My Reservations
                                        </button>
                                        {/* <button
    onClick={() => requirePhoneNumber(() => navigate('/collections-m'))}
    className={`flex items-center gap-2 px-6 py-3 border-2 border-plum/20 text-plum rounded-lg hover:bg-plum/5 transition-all ${
        !hasPhoneNumber() ? 'opacity-50 cursor-not-allowed' : ''
    }`}
    title={!hasPhoneNumber() ? 'Phone number required' : ''}
>
    Browse Collection
</button> */}
                                    </div>
                                    {!hasPhoneNumber() && (
                                        <p className="text-sm text-amber-600 mt-4 flex items-center gap-2">
                                            <AlertCircle size={16} />
                                            Please add your phone number in the Profile Info section to access these features.
                                        </p>
                                    )}
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
                                                {/* Image — shimmer while AI is still processing */}
                                                {item.aiProcessed === false ? (
                                                    <div className="h-48 bg-gradient-to-r from-cream via-amber-50 to-cream bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                                                        <style>{`
                                                            @keyframes shimmer {
                                                                0% { background-position: 200% 0; }
                                                                100% { background-position: -200% 0; }
                                                            }
                                                        `}</style>
                                                        <div className="w-6 h-6 border-2 border-rose/50 border-t-rose rounded-full animate-spin" />
                                                        <p className="text-xs text-plum/50 font-medium">Enhancing with AI…</p>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="h-48 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                                                        style={{ backgroundImage: `url(${item.images[0]})` }}
                                                    />
                                                )}
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
                                        {activityCounts.picks} items saved
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
                                        {activityCounts.reservations} confirmed
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

                                <div className="bg-cream/30 rounded-xl p-6">
                                    <p className="text-plum">If you have an issue with your account or have forgotten your password, please DM us on Instagram. We’ll be in touch within 24 hours. .</p>
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