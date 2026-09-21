// components/Profile.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { PhoneEdit } from './PhoneEdit';
import { useAuth } from '../hooks/useAuth';
import { User, Package, LogOut, Star, CheckCircle, AlertCircle, Camera, X, MoreHorizontal, Settings, ArrowUpRight, ArrowLeft, Truck } from 'lucide-react';
import axios from 'axios';

interface UploadPreview {
    _id: string;
    images: string[];
}

export function Profile() {
    const { user, isAuthenticated, loading, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showUploadSuccess, setShowUploadSuccess] = useState(
        (location.state as { uploadSuccess?: boolean })?.uploadSuccess === true
    );
    const [showPhoneRequiredWarning, setShowPhoneRequiredWarning] = useState(false);

    // Avatar states
    const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cover photo — stored locally per device (no backend field for this yet)
    const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
    const [coverError, setCoverError] = useState<string | null>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const coverStorageKey = user?.email ? `mused_cover_photo_${user.email}` : null;

    const [activityCounts, setActivityCounts] = useState({
        uploads: 0,
        picks: 0,
        reservations: 0
    });
    const [menuOpen, setMenuOpen] = useState(false);
    const [uploadPreviews, setUploadPreviews] = useState<UploadPreview[]>([]);

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

    // Fetch activity counts for the summary tiles
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchActivityCounts = async () => {
            try {
                const token = localStorage.getItem('token');
                const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

                const [uploadsRes, picksRes, reservationsRes] = await Promise.all([
                    axios.get(`${API_URL}/clothing/my-items`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/users/picks`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/users/reservations`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                setActivityCounts({
                    uploads: uploadsRes.data.success ? uploadsRes.data.data.length : 0,
                    picks: picksRes.data.success ? picksRes.data.data.length : 0,
                    reservations: reservationsRes.data.success ? reservationsRes.data.data.length : 0,
                });

                if (uploadsRes.data.success) {
                    setUploadPreviews(uploadsRes.data.data.slice(0, 6));
                }
            } catch (error) {
                console.error('Error fetching activity counts:', error);
            }
        };

        fetchActivityCounts();
    }, [isAuthenticated]);

    // Load a saved cover photo for this device, if any
    useEffect(() => {
        if (!coverStorageKey) return;
        try {
            const saved = localStorage.getItem(coverStorageKey);
            if (saved) setCoverPhoto(saved);
        } catch {
            // localStorage unavailable — fall back to the default cover
        }
    }, [coverStorageKey]);

    // Sync avatar when user changes
    useEffect(() => {
        if (user?.avatar) {
            setAvatar(user.avatar);
        }
    }, [user?.avatar]);

    const hasPhoneNumber = () => {
        return !!(user?.phone && user.phone.trim().length > 0);
    };

    // Wrapper for actions that require a phone number on file
    const requirePhoneNumber = (action: () => void) => {
        if (hasPhoneNumber()) {
            action();
        } else {
            setShowPhoneRequiredWarning(true);
            setTimeout(() => {
                document.getElementById('phone-required-warning')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };

    const handleAvatarUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setAvatarError('Please select an image file');
            setTimeout(() => setAvatarError(null), 3000);
            return;
        }

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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleAvatarUpload(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Resize a chosen cover photo down to a reasonable size before storing it,
    // so it stays well under the browser's localStorage quota.
    const handleCoverPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (e.target) e.target.value = '';
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setCoverError('Please select an image file');
            setTimeout(() => setCoverError(null), 3000);
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setCoverError('Image must be less than 10MB');
            setTimeout(() => setCoverError(null), 3000);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const maxWidth = 1600;
                const scale = Math.min(1, maxWidth / img.width);
                const canvas = document.createElement('canvas');
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
                setCoverPhoto(dataUrl);

                if (coverStorageKey) {
                    try {
                        localStorage.setItem(coverStorageKey, dataUrl);
                    } catch {
                        setCoverError('Photo set for this session, but too large to save permanently');
                        setTimeout(() => setCoverError(null), 4000);
                    }
                }
            };
            img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handlePhoneUpdate = (newPhone: string) => {
        if (user) {
            user.phone = newPhone;
        }
        setShowPhoneRequiredWarning(false);
    };

    if (loading) {
        return (
            <div className="font-inter">
                <Header />
                <main className="min-h-screen bg-cream pt-28 md:pt-32 pb-8">
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
            <main className="min-h-screen bg-white">
                {/* Immersive profile hero — full-bleed photo, frosted panel */}
                <div className="relative flex min-h-[44vh] w-full flex-col justify-end overflow-hidden">
                    <img
                        src={coverPhoto || '/main1-hero.jpg'}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
                    />
                    <div className="absolute inset-0 bg-black/10" />

                    <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverPhotoSelect}
                        className="hidden"
                    />

                    {coverError && (
                        <div className="absolute left-1/2 top-20 z-20 -translate-x-1/2 rounded-full bg-[#C9614E] px-4 py-2 text-xs text-cream shadow-lg sm:top-24">
                            {coverError}
                        </div>
                    )}

                    {/* Top controls */}
                    <div className="absolute inset-x-4 top-4 z-20 flex items-center justify-between sm:top-6">
                        <button
                            onClick={() => navigate('/')}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-cream backdrop-blur-sm transition-colors hover:bg-black/50"
                            aria-label="Back"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => coverInputRef.current?.click()}
                                className="flex items-center gap-1.5 rounded-full bg-black/30 px-3.5 py-2.5 text-xs text-cream backdrop-blur-sm transition-colors hover:bg-black/50"
                                aria-label="Change cover photo"
                            >
                                <Camera size={14} />
                                <span className="hidden sm:inline">Change cover</span>
                            </button>

                            <div className="relative">
                            <button
                                onClick={() => setMenuOpen((v) => !v)}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-cream backdrop-blur-sm transition-colors hover:bg-black/50"
                                aria-label="More options"
                            >
                                <MoreHorizontal size={18} />
                            </button>

                            {menuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                                    <div className="absolute right-0 top-12 z-20 w-48 overflow-hidden rounded-2xl bg-white py-2 shadow-xl">
                                        <button
                                            onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-plum-dark transition-colors hover:bg-plum-dark/5"
                                        >
                                            <Settings size={16} />
                                            Settings
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#C9614E] transition-colors hover:bg-[#C9614E]/5"
                                        >
                                            <LogOut size={16} />
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        </div>
                    </div>

                    {/* Frosted bottom panel */}
                    <div className="relative z-10 bg-gradient-to-t from-plum-dark/90 via-plum-dark/50 to-transparent px-6 pb-8 pt-14 sm:px-10">
                        <div className="mx-auto max-w-md text-center">
                            {/* Avatar Section with Upload */}
                            <div className="group relative mx-auto mb-4 h-24 w-24">
                                <div className="h-full w-full rounded-full bg-white p-1 shadow-md">
                                    <div className="h-full w-full rounded-full bg-gradient-to-br from-[#C9A96E] via-burgundy to-plum-dark p-[3px]">
                                        <div className="h-full w-full overflow-hidden rounded-full bg-white">
                                            {avatar ? (
                                                <img
                                                    src={avatar}
                                                    alt={user.name}
                                                    className="h-full w-full object-cover"
                                                    onError={() => setAvatar(null)}
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <User size={30} className="text-plum/30" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Upload button overlay - appears on hover */}
                                <div className="absolute inset-1 flex items-center justify-center gap-2 rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingAvatar}
                                        className="rounded-full bg-white p-1.5 transition-colors hover:bg-cream disabled:opacity-50"
                                        title="Upload photo"
                                    >
                                        <Camera size={14} className="text-plum" />
                                    </button>
                                    {avatar && (
                                        <button
                                            onClick={handleRemoveAvatar}
                                            disabled={isUploadingAvatar}
                                            className="rounded-full bg-white p-1.5 transition-colors hover:bg-red-50 disabled:opacity-50"
                                            title="Remove photo"
                                        >
                                            <X size={14} className="text-[#C9614E]" />
                                        </button>
                                    )}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                {isUploadingAvatar && (
                                    <div className="absolute inset-1 flex items-center justify-center rounded-full bg-white/80">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-plum-dark border-t-transparent" />
                                    </div>
                                )}

                                {avatarError && (
                                    <p className="absolute left-1/2 top-full mt-2 w-40 -translate-x-1/2 text-center text-xs text-[#C9614E] font-inter">
                                        {avatarError}
                                    </p>
                                )}
                            </div>

                            <h1 className="flex items-center justify-center gap-2 font-amandine font-normal text-3xl text-cream">
                                {user.name}
                                <Star size={16} className={user.role === 'admin' ? 'text-[#C9A96E]' : 'text-cream/30'} />
                            </h1>
                            <p className="mt-1 text-sm text-cream/50">@{user.email.split('@')[0]}</p>

                            <div className="mt-6 inline-flex items-center justify-center gap-10 rounded-2xl bg-black/20 px-8 py-3 backdrop-blur-xl">
                                <Link to="/my-uploads" className="text-center transition-opacity hover:opacity-80">
                                    <div className="font-kaldera text-xl text-cream">{activityCounts.uploads}</div>
                                    <div className="text-xs text-cream/50">Uploads</div>
                                </Link>
                                <Link to="/my-picks" className="text-center transition-opacity hover:opacity-80">
                                    <div className="font-kaldera text-xl text-cream">{activityCounts.picks}</div>
                                    <div className="text-xs text-cream/50">Picks</div>
                                </Link>
                                <Link to="/my-reservations" className="text-center transition-opacity hover:opacity-80">
                                    <div className="font-kaldera text-xl text-cream">{activityCounts.reservations}</div>
                                    <div className="text-xs text-cream/50">Reservations</div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 max-w-4xl py-8 md:py-12">
                    {/* Phone Required Warning Banner */}
                    {showPhoneRequiredWarning && !hasPhoneNumber() && (
                        <div id="phone-required-warning" className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-5 py-4 mb-6 shadow-sm animate-fadeIn">
                            <div className="flex items-center gap-3">
                                <AlertCircle size={22} className="text-amber-500 shrink-0" />
                                <div>
                                    <p className="font-semibold">Phone Number Required </p>
                                    <p className="text-sm text-amber-700">Please add your phone number below before accessing these features.</p>
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

                    {/* Creations — preview grid of your uploaded pieces */}
                    {uploadPreviews.length > 0 && (
                        <div className="mb-10">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-kaldera text-lg text-plum-dark">Creations</h2>
                                <Link
                                    to="/my-uploads"
                                    className="flex items-center gap-1 text-sm text-plum/50 transition-colors hover:text-plum-dark"
                                >
                                    See all
                                    <ArrowUpRight size={14} />
                                </Link>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                                {uploadPreviews.map((item) => (
                                    <Link
                                        key={item._id}
                                        to="/my-uploads"
                                        className="aspect-square overflow-hidden rounded-xl bg-plum-dark/5"
                                    >
                                        {item.images?.[0] && (
                                            <img
                                                src={item.images[0]}
                                                alt=""
                                                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                            />
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Information — full-width white section, flush with the screen */}
                <div className="w-full bg-white">
                    <div className="container mx-auto max-w-4xl px-4 py-10">
                        <h2 className="font-kaldera text-xl text-plum-dark mb-6">Profile Information</h2>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-xs uppercase tracking-label text-plum/40">Full Name</label>
                                <div className="rounded-2xl bg-cream/40 p-3.5 text-plum-dark">{user.name}</div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs uppercase tracking-label text-plum/40">Email Address</label>
                                <div className="rounded-2xl bg-cream/40 p-3.5 text-plum-dark">{user.email}</div>
                            </div>
                            <div>
                                <label className="mb-1.5 flex items-center gap-2 text-xs uppercase tracking-label text-plum/40">
                                    Phone Number
                                    {!user.phone && <span className="normal-case tracking-normal text-[#C9614E]">Required for actions</span>}
                                </label>
                                <div className="rounded-2xl bg-cream/40 p-3.5">
                                    <PhoneEdit
                                        phone={user.phone || ''}
                                        onUpdate={handlePhoneUpdate}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs uppercase tracking-label text-plum/40">Member Since</label>
                                <div className="rounded-2xl bg-cream/40 p-3.5 text-plum-dark">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Navigate to the dedicated app screens */}
                        <div className="mt-8 border-t border-cream pt-6">
                            <h3 className="mb-4 font-kaldera text-lg text-plum-dark">Quick Actions</h3>
                            <div className="flex flex-wrap gap-3">
                                <div className="rounded-full shadow-[0_8px_16px_rgba(61,16,40,0.18)]">
                                    <button
                                        onClick={() => requirePhoneNumber(() => navigate('/upload'))}
                                        className={`relative flex items-center gap-2 overflow-hidden rounded-full border border-white/15 bg-gradient-to-b from-plum-dark to-plum px-6 py-3 text-sm font-normal text-cream transition-all hover:brightness-110 ${
                                            !hasPhoneNumber() ? 'cursor-not-allowed opacity-50' : ''
                                        }`}
                                        title={!hasPhoneNumber() ? 'Phone number required' : 'Upload a clothing item'}
                                    >
                                        <Package size={16} />
                                        Start uploading
                                    </button>
                                </div>
                                <button
                                    onClick={() => navigate('/collections-hk')}
                                    className="rounded-full border border-plum-dark/15 px-6 py-3 text-sm text-plum-dark transition-colors hover:bg-plum-dark/5"
                                >
                                    Browse collection
                                </button>
                                <button
                                    onClick={() => requirePhoneNumber(() => navigate('/my-uploads'))}
                                    className={`flex items-center gap-2 rounded-full border border-plum-dark/15 px-6 py-3 text-sm text-plum-dark transition-colors hover:bg-plum-dark/5 ${
                                        !hasPhoneNumber() ? 'cursor-not-allowed opacity-50' : ''
                                    }`}
                                    title={!hasPhoneNumber() ? 'Phone number required' : ''}
                                >
                                    <Package size={16} />
                                    My uploads
                                </button>
                                <button
                                    onClick={() => requirePhoneNumber(() => navigate('/my-picks'))}
                                    className={`flex items-center gap-2 rounded-full border border-plum-dark/15 px-6 py-3 text-sm text-plum-dark transition-colors hover:bg-plum-dark/5 ${
                                        !hasPhoneNumber() ? 'cursor-not-allowed opacity-50' : ''
                                    }`}
                                    title={!hasPhoneNumber() ? 'Phone number required' : ''}
                                >
                                    <Star size={16} />
                                    My picks
                                </button>
                                <button
                                    onClick={() => requirePhoneNumber(() => navigate('/my-reservations'))}
                                    className={`flex items-center gap-2 rounded-full border border-plum-dark/15 px-6 py-3 text-sm text-plum-dark transition-colors hover:bg-plum-dark/5 ${
                                        !hasPhoneNumber() ? 'cursor-not-allowed opacity-50' : ''
                                    }`}
                                    title={!hasPhoneNumber() ? 'Phone number required' : ''}
                                >
                                    <CheckCircle size={16} />
                                    My reservations
                                </button>
                                <button
                                    onClick={() => navigate('/my-orders')}
                                    className="flex items-center gap-2 rounded-full border border-plum-dark/15 px-6 py-3 text-sm text-plum-dark transition-colors hover:bg-plum-dark/5"
                                >
                                    <Truck size={16} />
                                    My orders
                                </button>
                            </div>
                            {!hasPhoneNumber() && (
                                <p className="mt-4 flex items-center gap-2 text-sm text-[#C9614E]">
                                    <AlertCircle size={16} />
                                    Please add your phone number above to access these features.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
