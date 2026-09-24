// components/Profile.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { PhoneEdit } from './PhoneEdit';
import { useAuth } from '../hooks/useAuth';
import { User, LogOut, Star, CheckCircle, AlertCircle, Camera, X, MoreHorizontal, Settings, ArrowUpRight, ArrowLeft, Truck, ShoppingBag, MessageCircle, Heart, Shirt, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { convertHeicIfNeeded } from '../utils/api';
import {
    type Purchase,
    DELIVERY_STAGES,
    STAGE_ICONS,
    getDeliveryStageIndex,
    hasDeliveryIssue,
    formatOrderDate,
} from '../utils/orderTracking';

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
        orders: 0,
        picks: 0,
        events: 0
    });
    const [latestOrder, setLatestOrder] = useState<Purchase | null>(null);
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

                const [uploadsRes, picksRes, reservationsRes, purchasesRes] = await Promise.all([
                    axios.get(`${API_URL}/clothing/my-items`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/users/picks`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/users/reservations`, { headers: { Authorization: `Bearer ${token}` } }),
                    // Orders are optional here — don't let a failure blank out the other counts
                    axios.get(`${API_URL}/clothing/my-purchases`, { headers: { Authorization: `Bearer ${token}` } })
                        .catch(() => ({ data: { success: false, data: [] } })),
                ]);

                const purchases: Purchase[] = purchasesRes.data.success ? purchasesRes.data.data : [];

                setActivityCounts({
                    orders: purchases.length,
                    picks: picksRes.data.success ? picksRes.data.data.length : 0,
                    events: reservationsRes.data.success ? reservationsRes.data.data.length : 0,
                });

                // Track the most recent order that hasn't arrived yet, else the most recent one
                setLatestOrder(purchases.find((p) => p.trackingStatus !== 'delivered') || purchases[0] || null);

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
    const handleCoverPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawFile = e.target.files?.[0];
        if (e.target) e.target.value = '';
        if (!rawFile) return;

        if (!rawFile.type.startsWith('image/')) {
            setCoverError('Please select an image file');
            setTimeout(() => setCoverError(null), 3000);
            return;
        }

        if (rawFile.size > 10 * 1024 * 1024) {
            setCoverError('Image must be less than 10MB');
            setTimeout(() => setCoverError(null), 3000);
            return;
        }

        // HEIC (the default iPhone photo format) can't be decoded by the
        // canvas below — convert to JPEG first.
        let file: File;
        try {
            file = await convertHeicIfNeeded(rawFile);
        } catch {
            setCoverError('Could not process that photo. Try a different image.');
            setTimeout(() => setCoverError(null), 3000);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => {
                setCoverError('Could not process that photo. Try a different image.');
                setTimeout(() => setCoverError(null), 3000);
            };
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
                            {user.role === 'admin' && (
                                <div className="mt-3 flex justify-center">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A96E]/40 bg-[#C9A96E]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#C9A96E]">
                                        <ShieldCheck size={12} />
                                        Admin
                                    </span>
                                </div>
                            )}

                            <div className="mt-6 inline-flex items-center justify-center gap-10 rounded-2xl bg-black/20 px-8 py-3 backdrop-blur-xl">
                                <Link to="/my-orders" className="text-center transition-opacity hover:opacity-80">
                                    <div className="font-kaldera text-xl text-cream">{activityCounts.orders}</div>
                                    <div className="text-xs text-cream/50">Orders</div>
                                </Link>
                                <Link to="/my-picks" className="text-center transition-opacity hover:opacity-80">
                                    <div className="font-kaldera text-xl text-cream">{activityCounts.picks}</div>
                                    <div className="text-xs text-cream/50">Favs</div>
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

                    {/* Quick actions */}
                    <div className="mb-10">
                        <h2 className="mb-4 font-kaldera text-lg text-plum-dark">Quick Actions</h2>
                        <div className={`grid gap-1 pt-2 sm:gap-4 ${user?.role === 'admin' ? 'grid-cols-6' : 'grid-cols-5'}`}>
                            {[
                                { label: 'Closet', icon: Shirt, onClick: () => navigate('/closet') },
                                { label: 'Shop', icon: ShoppingBag, onClick: () => navigate('/shop') },
                                { label: 'Chat', icon: MessageCircle, onClick: () => navigate('/style-check') },
                                { label: 'Favs', icon: Heart, onClick: () => requirePhoneNumber(() => navigate('/my-picks')), needsPhone: true },
                                { label: 'Orders', icon: Truck, onClick: () => navigate('/my-orders') },
                                // Same profile everyone else gets, plus this one admin-only action —
                                // no separate admin dashboard/profile for now.
                                ...(user?.role === 'admin'
                                    ? [{ label: 'Approvals', icon: ShieldCheck, onClick: () => navigate('/admin/brands') }]
                                    : []),
                            ].map(({ label, icon: Icon, onClick, needsPhone }) =>
                                onClick ? (
                                    <button
                                        key={label}
                                        onClick={onClick}
                                        title={needsPhone && !hasPhoneNumber() ? 'Phone number required' : undefined}
                                        className={`group flex min-w-0 flex-col items-center gap-2 ${
                                            needsPhone && !hasPhoneNumber() ? 'cursor-not-allowed opacity-50' : ''
                                        }`}
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-plum-dark/6 text-plum-dark transition-colors sm:h-14 sm:w-14 group-hover:bg-plum-dark group-hover:text-cream">
                                            <Icon size={20} />
                                        </div>
                                        <span className="w-full truncate text-center text-[11px] text-plum/60 sm:text-xs">{label}</span>
                                    </button>
                                ) : (
                                    <div
                                        key={label}
                                        className="flex min-w-0 cursor-default flex-col items-center gap-2"
                                        aria-disabled="true"
                                    >
                                        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-plum-dark/6 text-plum-dark/40 sm:h-14 sm:w-14">
                                            <Icon size={20} />
                                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#C9A96E] px-1.5 py-0.5 text-[9px] leading-none font-medium uppercase tracking-wide text-white">
                                                Soon
                                            </span>
                                        </div>
                                        <span className="w-full truncate text-center text-[11px] text-plum/40 sm:text-xs">{label}</span>
                                    </div>
                                )
                            )}
                        </div>
                        {!hasPhoneNumber() && (
                            <p className="mt-3 flex items-center gap-2 text-sm text-[#C9614E]">
                                <AlertCircle size={16} />
                                Add your phone number below to access Favs and Events.
                            </p>
                        )}
                    </div>

                    {/* Order tracking — latest order at a glance */}
                    {latestOrder && (
                        <div className="mb-10">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-kaldera text-lg text-plum-dark">Track your order</h2>
                                <Link
                                    to="/my-orders"
                                    className="flex items-center gap-1 text-sm text-plum/50 transition-colors hover:text-plum-dark"
                                >
                                    See all
                                    <ArrowUpRight size={14} />
                                </Link>
                            </div>

                            <Link
                                to="/my-orders"
                                className="block rounded-[1.75rem] border border-plum-dark/8 bg-white p-5 shadow-[0_8px_24px_rgba(61,16,40,0.06)] transition-shadow hover:shadow-[0_12px_28px_rgba(61,16,40,0.1)]"
                            >
                                <div className="mb-5 flex items-center gap-4">
                                    {latestOrder.itemImage && (
                                        <img
                                            src={latestOrder.itemImage}
                                            alt=""
                                            className="h-14 w-14 shrink-0 rounded-xl object-cover"
                                        />
                                    )}
                                    <div className="min-w-0">
                                        <h3 className="truncate font-kaldera text-base text-plum-dark">{latestOrder.itemName}</h3>
                                        <p className="text-xs text-plum/50">
                                            {latestOrder.brand ? `${latestOrder.brand} · ` : ''}Ordered {formatOrderDate(latestOrder.purchasedAt)}
                                        </p>
                                    </div>
                                </div>

                                {hasDeliveryIssue(latestOrder) ? (
                                    <div className="flex items-start gap-3 rounded-2xl border border-[#C9614E]/20 bg-[#C9614E]/5 p-4">
                                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#C9614E]" />
                                        <p className="text-sm text-[#C9614E]">
                                            {latestOrder.trackingLastEvent || 'There was a problem with this shipment.'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        {DELIVERY_STAGES.map((label, i) => {
                                            const stageIndex = getDeliveryStageIndex(latestOrder);
                                            const complete = i <= stageIndex;
                                            const StageIcon = STAGE_ICONS[i];
                                            return (
                                                <div key={label} className="flex flex-1 items-center last:flex-none">
                                                    <div className="flex flex-col items-center">
                                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                                                            complete
                                                                ? 'border-plum-dark bg-plum-dark text-cream'
                                                                : 'border-plum-dark/15 bg-white text-plum/30'
                                                        }`}>
                                                            <StageIcon size={14} />
                                                        </div>
                                                        <span className={`mt-2 max-w-[64px] text-center text-[10px] font-medium leading-tight ${
                                                            complete ? 'text-plum-dark' : 'text-plum/40'
                                                        }`}>
                                                            {label}
                                                        </span>
                                                    </div>
                                                    {i < DELIVERY_STAGES.length - 1 && (
                                                        <div className={`mx-1 mb-5 h-px flex-1 ${
                                                            i < stageIndex ? 'bg-plum-dark' : 'bg-plum-dark/10'
                                                        }`} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </Link>
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

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
