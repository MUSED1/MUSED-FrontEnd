// components/Profile.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { PhoneEdit } from './PhoneEdit';
import { useAuth } from '../hooks/useAuth';
import { User, Package, Heart, LogOut, Star, Calendar, Clock, MapPin } from 'lucide-react';
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
}

interface CollectionDrop {
    id: string;
    date: string;
    time: string;
    location: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    items: number;
}

export function Profile() {
    const { user, isAuthenticated, loading, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'profile' | 'uploads' | 'picks' | 'settings'>('profile');
    const [uploads, setUploads] = useState<ClothingItem[]>([]);
    const [isLoadingUploads, setIsLoadingUploads] = useState(false);
    const [isLoadingPicks, setIsLoadingPicks] = useState(false);

    // Sample collection drops data - replace with actual API data
    const [collectionDrops, setCollectionDrops] = useState<CollectionDrop[]>([
        {
            id: '1',
            date: 'Tuesday, March 10',
            time: '12:00 PM - 3:00 PM',
            location: 'HKU Campus - Main Library',
            status: 'upcoming',
            items: 3
        },
        {
            id: '2',
            date: 'Wednesday, March 11',
            time: '3:00 PM - 6:00 PM',
            location: 'CUHK - University Station',
            status: 'upcoming',
            items: 2
        },
        {
            id: '3',
            date: 'Thursday, March 12',
            time: '12:00 PM - 3:00 PM',
            location: 'PolyU - Block A',
            status: 'upcoming',
            items: 1
        }
    ]);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, loading, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            if (activeTab === 'uploads') {
                fetchUserUploads();
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

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handlePhoneUpdate = (newPhone: string) => {
        // This will trigger a re-render with the updated user data
        // The actual update is handled by the PhoneEdit component
        console.log('Phone updated to:', newPhone);
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
                                    <p className="text-plum/60 text-sm mt-1">
                                    </p>
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
                            Collection Drops
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

                                {/* Recent Activity Summary */}
                                <div className="border-t border-cream pt-6 mt-6">
                                    <h3 className="text-lg font-kaldera text-plum mb-4">Recent Activity</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-cream/30 rounded-xl p-4 text-center">
                                            <Package className="mx-auto text-rose mb-2" size={24} />
                                            <div className="text-2xl font-bold text-plum">{uploads.length}</div>
                                            <div className="text-sm text-plum/60">Items Uploaded</div>
                                        </div>
                                        <div className="bg-cream/30 rounded-xl p-4 text-center">
                                            <Calendar className="mx-auto text-rose mb-2" size={24} />
                                            <div className="text-2xl font-bold text-plum">{collectionDrops.length}</div>
                                            <div className="text-sm text-plum/60">Collection Drops</div>
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
                                            onClick={() => setActiveTab('uploads')}
                                            className="flex items-center gap-2 px-6 py-3 border-2 border-rose text-plum rounded-lg hover:bg-rose/10 transition-all"
                                        >
                                            <Heart size={18} />
                                            View My Uploads
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('picks')}
                                            className="flex items-center gap-2 px-6 py-3 border-2 border-plum/20 text-plum rounded-lg hover:bg-plum/5 transition-all"
                                        >
                                            <Calendar size={18} />
                                            View Collection Drops
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
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-kaldera text-plum mb-3">Collection Drops</h2>
                                    <p className="text-plum/70 text-lg">March 10-12, 2025</p>
                                </div>

                                {isLoadingPicks ? (
                                    <div className="text-center py-12">
                                        <div className="w-12 h-12 border-4 border-rose border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {collectionDrops.map((drop) => (
                                            <div
                                                key={drop.id}
                                                className="bg-gradient-to-r from-cream to-amber-50 rounded-2xl p-6 border-2 border-cream hover:border-rose/30 transition-all"
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 text-rose">
                                                            <Calendar size={20} />
                                                            <span className="font-semibold text-plum">{drop.date}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-plum/70">
                                                            <Clock size={18} />
                                                            <span>{drop.time}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-plum/70">
                                                            <MapPin size={18} />
                                                            <span>{drop.location}</span>
                                                        </div>
                                                        <div className="mt-2">
                                                            <span className="inline-flex items-center px-3 py-1 bg-rose/10 text-rose rounded-full text-sm">
                                                                {drop.items} {drop.items === 1 ? 'item' : 'items'} to collect
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                                            drop.status === 'upcoming'
                                                                ? 'bg-green-100 text-green-700'
                                                                : drop.status === 'completed'
                                                                    ? 'bg-gray-100 text-gray-700'
                                                                    : 'bg-red-100 text-red-700'
                                                        }`}>
                                                            {drop.status.charAt(0).toUpperCase() + drop.status.slice(1)}
                                                        </span>
                                                        {drop.status === 'upcoming' && (
                                                            <button className="px-4 py-2 bg-gradient-to-r from-plum to-rose text-cream rounded-lg text-sm hover:shadow-lg transition-all">
                                                                View Details
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Info message about collection drops */}
                                <div className="mt-8 bg-rose/5 rounded-xl p-6 text-center border border-rose/20">
                                    <Calendar className="mx-auto text-rose mb-3" size={32} />
                                    <h3 className="text-xl font-kaldera text-plum mb-2">Collection Schedule</h3>
                                    <p className="text-plum/70 mb-4">
                                        Items are collected on scheduled dates. Make sure your items are ready for pickup!
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-3">
                                        <span className="px-3 py-1 bg-cream rounded-full text-sm text-plum">March 10</span>
                                        <span className="px-3 py-1 bg-cream rounded-full text-sm text-plum">March 11</span>
                                        <span className="px-3 py-1 bg-cream rounded-full text-sm text-plum">March 12</span>
                                    </div>
                                </div>

                                {/* Link to browse items */}
                                <div className="mt-6 text-center">
                                    <p className="text-plum/60 text-sm">
                                        Want to see what's available?{' '}
                                        <button
                                            onClick={() => navigate('/browse')}
                                            className="text-rose font-semibold hover:underline"
                                        >
                                            Browse collection
                                        </button>
                                    </p>
                                </div>
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