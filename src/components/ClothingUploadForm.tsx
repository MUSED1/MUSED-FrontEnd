// components/ClothingUploadForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Upload, Plus, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { PhoneEdit } from './PhoneEdit';
import { API_CONFIG, compressImage } from '../utils/api';

interface ClothingItem {
    image: string;
    category: string;
    size: string;
}

// Loading messages shown while processing images
const LOADING_MESSAGES = [
    'Uploading your images to the cloud...',
    'Processing your images...',
    'Enhancing lighting and background...',
    'Saving your styled items...',
];

export function ClothingUploadForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [loadingStep, setLoadingStep] = useState(0);

    const { user, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            setIsCheckingAuth(false);
            if (!isAuthenticated) {
                navigate('/login', {
                    state: { from: '/upload', message: 'Please login to upload clothing items' }
                });
            }
        }
    }, [isAuthenticated, loading, navigate]);

    // Cycle through loading messages while submitting
    useEffect(() => {
        if (!isSubmitting) {
            setLoadingStep(0);
            return;
        }
        const interval = setInterval(() => {
            setLoadingStep(prev => (prev + 1) % LOADING_MESSAGES.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [isSubmitting]);

    const [userInfo, setUserInfo] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        university: ''
    });

    const [pickupInfo, setPickupInfo] = useState({
        pickupMethod: '',
        pickupTime: '',
        pickupDay: '',
        pickupInstructions: '',
        specialInstructions: ''
    });

    const [clothingItems, setClothingItems] = useState<ClothingItem[]>([
        { image: '', category: '', size: '' },
        { image: '', category: '', size: '' }
    ]);

    const universities = [
        { value: 'HKU', label: 'HKU' },
        { value: 'CUHK', label: 'CUHK' },
        { value: 'PolyU', label: 'PolyU' },
        { value: 'HKUST', label: 'HKUST' },
        { value: 'Baptist', label: 'Baptist' },
        { value: 'NA', label: 'NA' }
    ];

    useEffect(() => {
        if (user) {
            setUserInfo(prev => ({
                ...prev,
                fullName: user.name,
                email: user.email,
                phoneNumber: user.phone || prev.phoneNumber || ''
            }));
        }
    }, [user]);

    useEffect(() => {
        if (submitMessage) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [submitMessage]);

    if (loading || isCheckingAuth) {
        return (
            <div className="font-sans">
                <Header />
                <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-8">
                    <div className="container mx-auto px-4 max-w-4xl text-center">
                        <div className="bg-white rounded-2xl shadow-lg p-12">
                            <div className="w-16 h-16 border-4 border-rose border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-plum">Loading...</p>
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

    const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'fullName' || name === 'email') return;
        setUserInfo(prev => ({ ...prev, [name]: value }));
    };

    const handlePickupInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPickupInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleClothingItemChange = (index: number, field: keyof ClothingItem, value: string) => {
        setClothingItems(prev =>
            prev.map((item, i) => i === index ? { ...item, [field]: value } : item)
        );
    };

    const handleImageUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File too large. Maximum size is 5MB.');
                return;
            }

            setUploadProgress(0);

            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Image = e.target?.result as string;
                const base64Data = base64Image.split(',')[1] || base64Image;

                try {
                    setUploadProgress(50);
                    const compressed = await compressImage(base64Data);
                    setUploadProgress(100);
                    handleClothingItemChange(index, 'image', compressed);
                    setTimeout(() => setUploadProgress(0), 1000);
                } catch (error) {
                    console.error('Image compression error:', error);
                    alert('Failed to process image. Please try another image.');
                    setUploadProgress(0);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhoneUpdate = (newPhone: string) => {
        setUserInfo(prev => ({ ...prev, phoneNumber: newPhone }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (!userInfo.phoneNumber || !userInfo.address || !userInfo.university) {
            setSubmitMessage({
                type: 'error',
                message: 'Please complete phone number, address, and university'
            });
            setIsSubmitting(false);
            return;
        }

        if (!pickupInfo.pickupMethod) {
            setSubmitMessage({
                type: 'error',
                message: 'Please select a pickup method'
            });
            setIsSubmitting(false);
            return;
        }

        const validItems = clothingItems.filter(item => item.image && item.category && item.size);
        if (validItems.length === 0) {
            setSubmitMessage({
                type: 'error',
                message: 'Please add at least one complete clothing item'
            });
            setIsSubmitting(false);
            return;
        }

        if (validItems.length < 2) {
            setSubmitMessage({
                type: 'error',
                message: 'Please complete both clothing items'
            });
            setIsSubmitting(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');

            // Send base64 images — the server will process them automatically
            const processedItems = validItems.map(item => ({
                ...item,
                image: `data:image/jpeg;base64,${item.image}`
            }));

            const submissionData = {
                userInfo: {
                    fullName: user.name,
                    email: user.email,
                    phoneNumber: userInfo.phoneNumber,
                    address: userInfo.address,
                    university: userInfo.university
                },
                clothingItems: processedItems,
                ...pickupInfo
            };

            const API_URL = API_CONFIG.baseURL;

            const response = await fetch(`${API_URL}${API_CONFIG.endpoints.clothing}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submissionData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSubmitMessage({
                    type: 'success',
                    message: '✨ Your items have been uploaded successfully! Redirecting to your profile...'
                });

                setUserInfo(prev => ({
                    ...prev,
                    phoneNumber: '',
                    address: '',
                    university: ''
                }));
                setPickupInfo({
                    pickupMethod: '',
                    pickupTime: '',
                    pickupDay: '',
                    pickupInstructions: '',
                    specialInstructions: ''
                });
                setClothingItems([
                    { image: '', category: '', size: '' },
                    { image: '', category: '', size: '' }
                ]);

                setTimeout(() => {
                    navigate('/profile');
                }, 2000);
            } else {
                setSubmitMessage({
                    type: 'error',
                    message: result.message || 'Error uploading clothing items. Please try again.'
                });
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Error:', error);
            setSubmitMessage({
                type: 'error',
                message: 'Connection error. Please check your internet and try again.'
            });
            setIsSubmitting(false);
        }
    };

    const categories = ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories', 'Bags', 'Jewelry'];
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXS', 'XXL', '32', '34', '36', '38', '40', '42', 'One Size'];

    const pickupDays = [
        { value: 'tuesday', label: 'Tuesday, March 10' },
        { value: 'wednesday', label: 'Wednesday, March 11' },
        { value: 'thursday', label: 'Thursday, March 12' }
    ];

    const timeSlots = {
        'tuesday': ['12:00 PM - 3:00 PM', '3:00 PM - 6:00 PM', '6:00 PM - 9:00 PM'],
        'wednesday': ['10:00 AM - 12:00 PM', '12:00 PM - 3:00 PM', '5:00 PM - 7:00 PM'],
        'thursday': ['12:00 PM - 3:00 PM', '3:00 PM - 6:00 PM']
    };

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-6xl font-bold text-plum mb-6" style={{ fontFamily: 'Kaldera, serif' }}>
                            Share Your <span className="text-rose">Style</span>
                        </h1>
                        <p className="text-xl text-plum/80 max-w-2xl mx-auto">
                            Welcome back, <span className="font-bold text-rose">{user.name}</span>!
                            Upload your pieces and become part of the MUSED community.
                        </p>
                    </div>

                    {/* ── Processing Loading Overlay ────────────────────────── */}
                    {isSubmitting && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
                                {/* Animated icon */}
                                <div className="relative w-20 h-20 mx-auto mb-6">
                                    <div className="w-20 h-20 border-4 border-rose/30 border-t-rose rounded-full animate-spin"></div>
                                </div>

                                <h3 className="text-2xl font-bold text-plum mb-2">Processing Your Items</h3>
                                <p className="text-plum/60 text-sm mb-4">This may take up to 30 seconds per item</p>

                                {/* Animated step message */}
                                <div className="bg-cream/60 rounded-xl px-4 py-3 mb-5 min-h-[48px] flex items-center justify-center">
                                    <p className="text-plum font-medium text-sm transition-all duration-500">
                                        {LOADING_MESSAGES[loadingStep]}
                                    </p>
                                </div>

                                {/* Step dots */}
                                <div className="flex justify-center gap-2 mb-5">
                                    {LOADING_MESSAGES.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                                i === loadingStep ? 'bg-rose scale-125' : 'bg-rose/25'
                                            }`}
                                        />
                                    ))}
                                </div>

                                <p className="text-sm text-plum/50 flex items-center justify-center gap-2">
                                    <AlertTriangle size={14} />
                                    Don't close this window
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── Status message ───────────────────────────────────────── */}
                    {submitMessage && (
                        <div className={`mb-6 p-6 rounded-2xl ${
                            submitMessage.type === 'success'
                                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                                : 'bg-red-100 text-red-800 border-2 border-red-300'
                        }`}>
                            <div className="flex items-center gap-3">
                                {submitMessage.type === 'success' ? (
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">✓</div>
                                ) : (
                                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white">!</div>
                                )}
                                <p className="text-lg font-semibold">{submitMessage.message}</p>
                            </div>
                        </div>
                    )}

                    {/* ── Processing notice banner ─────────────────────────────────────── */}
                    <div className="bg-gradient-to-r from-plum/10 to-rose/10 border border-rose/30 rounded-2xl px-6 py-4 mb-6">
                        <p className="text-plum text-sm text-center">
                            Your photos will be professionally processed after upload.
                        </p>
                    </div>

                    {/* ── Form ─────────────────────────────────────────────────── */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Your Information Section */}
                            <div>
                                <h3 className="text-2xl font-bold text-plum mb-6">Your Information</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-lg font-semibold text-plum mb-3">Full Name *</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={userInfo.fullName}
                                            className="w-full px-4 py-3 border-2 border-cream rounded-xl bg-cream/30 text-plum cursor-not-allowed"
                                            required
                                            disabled={true}
                                            readOnly
                                        />
                                        <p className="text-sm text-plum/60 mt-1">Your name from account</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-lg font-semibold text-plum mb-3">Email *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={userInfo.email}
                                                className="w-full px-4 py-3 border-2 border-cream rounded-xl bg-cream/30 text-plum cursor-not-allowed"
                                                required
                                                disabled={true}
                                                readOnly
                                            />
                                            <p className="text-sm text-plum/60 mt-1">Your email from account</p>
                                        </div>

                                        <div>
                                            <label className="block text-lg font-semibold text-plum mb-3">Phone Number *</label>
                                            <div className="w-full px-4 py-3 border-2 border-cream rounded-xl bg-cream/30">
                                                <PhoneEdit
                                                    phone={userInfo.phoneNumber}
                                                    onUpdate={handlePhoneUpdate}
                                                />
                                            </div>
                                            <p className="text-sm text-plum/60 mt-1">Click the pencil icon to edit</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-lg font-semibold text-plum mb-3">Address *</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={userInfo.address}
                                            onChange={handleUserInfoChange}
                                            className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-rose focus:ring-2 focus:ring-rose/20 transition-all duration-300 bg-cream/30 text-plum placeholder-plum/40"
                                            placeholder="Enter your full address for pickup"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-lg font-semibold text-plum mb-3">University *</label>
                                        <select
                                            name="university"
                                            value={userInfo.university}
                                            onChange={handleUserInfoChange}
                                            className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-rose focus:ring-2 focus:ring-rose/20 transition-all duration-300 bg-white text-plum"
                                            required
                                            disabled={isSubmitting}
                                        >
                                            <option value="">Select your university</option>
                                            {universities.map(u => (
                                                <option key={u.value} value={u.value}>{u.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Pickup Method */}
                            <div className="border-t border-cream pt-8">
                                <h3 className="text-2xl font-bold text-plum mb-6">Pickup Method</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {['without', 'in-person'].map(method => (
                                        <label
                                            key={method}
                                            className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                                pickupInfo.pickupMethod === method
                                                    ? 'border-rose bg-rose/10'
                                                    : 'border-cream hover:border-rose/50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="pickupMethod"
                                                value={method}
                                                checked={pickupInfo.pickupMethod === method}
                                                onChange={handlePickupInfoChange}
                                                className="accent-rose"
                                                disabled={isSubmitting}
                                            />
                                            <span className="text-plum font-medium capitalize">
                                                {method === 'without' ? 'Without (we come to you)' : 'In-person drop-off'}
                                            </span>
                                        </label>
                                    ))}
                                </div>

                                {pickupInfo.pickupMethod === 'without' && (
                                    <div className="space-y-4 mt-4 p-4 bg-cream/30 rounded-xl">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-lg font-semibold text-plum mb-3">Preferred pickup day</label>
                                                <select
                                                    name="pickupDay"
                                                    value={pickupInfo.pickupDay}
                                                    onChange={handlePickupInfoChange}
                                                    className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-rose focus:ring-2 focus:ring-rose/20 transition-all duration-300 bg-white text-plum"
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="">Select day</option>
                                                    {pickupDays.map(day => (
                                                        <option key={day.value} value={day.value}>{day.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-lg font-semibold text-plum mb-3">Preferred time</label>
                                                <select
                                                    name="pickupTime"
                                                    value={pickupInfo.pickupTime}
                                                    onChange={handlePickupInfoChange}
                                                    className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-rose focus:ring-2 focus:ring-rose/20 transition-all duration-300 bg-white text-plum"
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="">Select time window</option>
                                                    {pickupInfo.pickupDay && (
                                                        <>
                                                            <option value="morning">Morning (8:00–11:00)</option>
                                                            <option value="afternoon">Afternoon (12:00–16:00)</option>
                                                            <option value="evening">Evening (17:00–20:00)</option>
                                                        </>
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-lg font-semibold text-plum mb-3">Any pickup instructions?</label>
                                            <textarea
                                                name="pickupInstructions"
                                                value={pickupInfo.pickupInstructions}
                                                onChange={handlePickupInfoChange}
                                                rows={3}
                                                className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-rose focus:ring-2 focus:ring-rose/20 transition-all duration-300 bg-white text-plum placeholder-plum/40 resize-none"
                                                placeholder="Example: 'Leave with concierge,' 'Door code 12A,' etc."
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>
                                )}

                                {pickupInfo.pickupMethod === 'in-person' && (
                                    <div className="space-y-4 mt-4 p-4 bg-cream/30 rounded-xl">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-lg font-semibold text-plum mb-3">Choose a day</label>
                                                <select
                                                    name="pickupDay"
                                                    value={pickupInfo.pickupDay}
                                                    onChange={handlePickupInfoChange}
                                                    className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-rose focus:ring-2 focus:ring-rose/20 transition-all duration-300 bg-white text-plum"
                                                    required
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="">Select day</option>
                                                    {pickupDays.map(day => (
                                                        <option key={day.value} value={day.value}>{day.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-lg font-semibold text-plum mb-3">Choose a time slot</label>
                                                <select
                                                    name="pickupTime"
                                                    value={pickupInfo.pickupTime}
                                                    onChange={handlePickupInfoChange}
                                                    className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-rose focus:ring-2 focus:ring-rose/20 transition-all duration-300 bg-white text-plum"
                                                    required
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="">Select time</option>
                                                    {pickupInfo.pickupDay && timeSlots[pickupInfo.pickupDay as keyof typeof timeSlots]?.map((time, index) => (
                                                        <option key={index} value={time}>{time}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Special Instructions */}
                            <div>
                                <label className="block text-lg font-semibold text-plum mb-3">Special Instructions (Optional)</label>
                                <textarea
                                    name="specialInstructions"
                                    value={pickupInfo.specialInstructions}
                                    onChange={handlePickupInfoChange}
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-rose focus:ring-2 focus:ring-rose/20 transition-all duration-300 bg-cream/30 text-plum placeholder-plum/40 resize-none"
                                    placeholder="Any special care instructions, notes about the items, or pickup preferences..."
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* Clothing Items Section */}
                            <div className="border-t border-cream pt-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-plum">Your Clothing Items</h3>
                                    <div className="text-plum/60 text-sm">Exactly 2 items required</div>
                                </div>

                                <div className="space-y-8">
                                    {clothingItems.map((item, index) => (
                                        <div key={index} className="border-2 border-cream rounded-2xl p-6 bg-cream/20">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-xl font-bold text-plum">Clothing {index + 1}</h4>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* Image Upload */}
                                                <div>
                                                    <label className="block text-lg font-semibold text-plum mb-3">Image *</label>
                                                    <div className={`border-2 ${item.image ? 'border-solid border-green-500' : 'border-dashed border-rose/50'} rounded-xl p-6 text-center hover:border-rose transition-all duration-300`}>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleImageUpload(index, e)}
                                                            className="hidden"
                                                            id={`image-upload-${index}`}
                                                            disabled={isSubmitting}
                                                        />
                                                        <label htmlFor={`image-upload-${index}`} className="cursor-pointer">
                                                            {item.image ? (
                                                                <div className="flex flex-col items-center justify-center space-y-4">
                                                                    <div
                                                                        className="w-32 h-32 bg-cover bg-center rounded-lg border-2 border-cream shadow-md"
                                                                        style={{ backgroundImage: `url(data:image/jpeg;base64,${item.image})` }}
                                                                    />
                                                                    <div className="text-center">
                                                                        <p className="text-green-600 font-semibold text-lg">✓ Image Uploaded</p>
                                                                        {uploadProgress > 0 && uploadProgress < 100 && (
                                                                            <div className="w-full bg-cream rounded-full h-1 mt-2">
                                                                                <div className="bg-green-500 h-1 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                                                                            </div>
                                                                        )}
                                                                        <p className="text-plum/60 text-sm mt-1">Click to change image</p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-center justify-center space-y-4 py-4">
                                                                    <Upload className="text-rose" size={32} />
                                                                    <div className="text-center">
                                                                        <p className="text-plum font-semibold text-lg">Upload Image for Item {index + 1}</p>
                                                                        <p className="text-plum/60 text-sm mt-1">PNG, JPG, JPEG up to 5MB</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </label>
                                                    </div>
                                                    {item.image && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleClothingItemChange(index, 'image', '')}
                                                            className="mt-3 text-red-500 text-sm hover:text-red-700 disabled:opacity-50 flex items-center justify-center w-full"
                                                            disabled={isSubmitting}
                                                        >
                                                            Remove Image
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Category and Size */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-lg font-semibold text-plum mb-3">Category *</label>
                                                        <select
                                                            value={item.category}
                                                            onChange={(e) => handleClothingItemChange(index, 'category', e.target.value)}
                                                            className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-rose focus:ring-2 focus:ring-rose/20 transition-all duration-300 bg-white text-plum"
                                                            required
                                                            disabled={isSubmitting}
                                                        >
                                                            <option value="">Select a category</option>
                                                            {categories.map(category => (
                                                                <option key={category} value={category}>{category}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-lg font-semibold text-plum mb-3">Size *</label>
                                                        <select
                                                            value={item.size}
                                                            onChange={(e) => handleClothingItemChange(index, 'size', e.target.value)}
                                                            className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-rose focus:ring-2 focus:ring-rose/20 transition-all duration-300 bg-white text-plum"
                                                            required
                                                            disabled={isSubmitting}
                                                        >
                                                            <option value="">Select size</option>
                                                            {sizes.map(size => (
                                                                <option key={size} value={size}>{size}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-gradient-to-r from-plum to-rose text-cream px-12 py-4 rounded-full font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-cream border-t-transparent rounded-full animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={20} />
                                            <span>Upload Items</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* "What happens next" Section */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center">
                        <h3 className="text-3xl font-bold text-plum mb-6 font-kaldera">What happens next?</h3>
                        <div className="grid md:grid-cols-3 gap-6 text-plum">
                            <div className="space-y-3">
                                <div className="w-12 h-12 bg-rose rounded-full flex items-center justify-center text-plum font-bold text-xl mx-auto mb-3">1</div>
                                <p className="font-semibold text-lg">We'll pick up your items at your selected time</p>
                            </div>
                            <div className="space-y-3">
                                <div className="w-12 h-12 bg-rose rounded-full flex items-center justify-center text-plum font-bold text-xl mx-auto mb-3">2</div>
                                <p className="font-semibold text-lg">Dinner collection launches March 11th</p>
                                <p className="text-sm text-plum/70">choose your items then</p>
                            </div>
                            <div className="space-y-3">
                                <div className="w-12 h-12 bg-rose rounded-full flex items-center justify-center text-plum font-bold text-xl mx-auto mb-3">3</div>
                                <p className="font-semibold text-lg">Receive your items</p>
                                <p className="text-sm text-plum/70">and you're all set for dinner</p>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-cream">
                            <p className="text-2xl font-kaldera text-rose">MUSED</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}