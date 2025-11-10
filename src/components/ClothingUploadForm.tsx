// components/UploadClothing.tsx
import { useState, useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { Upload, Plus, AlertTriangle } from 'lucide-react'

interface ClothingItem {
    image: string;
    category: string;
    size: string;
}

export function ClothingUploadForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitMessage, setSubmitMessage] = useState<{type: 'success' | 'error', message: string} | null>(null)

    // User information
    const [userInfo, setUserInfo] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        address: ''
    })

    // Pickup information
    const [pickupInfo, setPickupInfo] = useState({
        pickupMethod: '',
        pickupTime: '',
        pickupDay: '',
        pickupInstructions: '',
        specialInstructions: ''
    })

    // Clothing items - exactly 2 items, no more
    const [clothingItems, setClothingItems] = useState<ClothingItem[]>([
        { image: '', category: '', size: '' },
        { image: '', category: '', size: '' }
    ])

    // Scroll to top when submit message changes
    useEffect(() => {
        if (submitMessage) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }, [submitMessage])

    const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setUserInfo(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handlePickupInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setPickupInfo(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleClothingItemChange = (index: number, field: keyof ClothingItem, value: string) => {
        setClothingItems(prev =>
            prev.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        )
    }

    const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const base64Image = e.target?.result as string
                const base64Data = base64Image.split(',')[1] || base64Image
                handleClothingItemChange(index, 'image', base64Data)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitMessage(null)

        // Scroll to top immediately when submitting
        window.scrollTo({ top: 0, behavior: 'smooth' })

        // Validate user info
        if (!userInfo.fullName || !userInfo.email || !userInfo.phoneNumber || !userInfo.address) {
            setSubmitMessage({
                type: 'error',
                message: 'Please complete all user information fields'
            })
            setIsSubmitting(false)
            return
        }

        // Validate pickup method
        if (!pickupInfo.pickupMethod) {
            setSubmitMessage({
                type: 'error',
                message: 'Please select a pickup method'
            })
            setIsSubmitting(false)
            return
        }

        // Validate clothing items
        const validItems = clothingItems.filter(item => item.image && item.category && item.size)
        if (validItems.length === 0) {
            setSubmitMessage({
                type: 'error',
                message: 'Please add at least one complete clothing item'
            })
            setIsSubmitting(false)
            return
        }

        // Validate that both items are completed
        if (validItems.length < 2) {
            setSubmitMessage({
                type: 'error',
                message: 'Please complete both clothing items'
            })
            setIsSubmitting(false)
            return
        }

        try {
            // Prepare data for submission
            const submissionData = {
                userInfo,
                clothingItems: validItems,
                ...pickupInfo
            }

            // Send to backend
            const response = await fetch('https://mused-backend.onrender.com/api/clothing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData)
            })

            const result = await response.json()

            if (response.ok && result.success) {
                setSubmitMessage({
                    type: 'success',
                    message: 'Clothing items uploaded successfully! We will contact you soon.'
                })

                // Reset form
                setUserInfo({
                    fullName: '',
                    email: '',
                    phoneNumber: '',
                    address: ''
                })
                setPickupInfo({
                    pickupMethod: '',
                    pickupTime: '',
                    pickupDay: '',
                    pickupInstructions: '',
                    specialInstructions: ''
                })
                setClothingItems([
                    { image: '', category: '', size: '' },
                    { image: '', category: '', size: '' }
                ])
            } else {
                setSubmitMessage({
                    type: 'error',
                    message: result.message || 'Error uploading clothing items. Please try again.'
                })
            }
        } catch (error) {
            console.error('Error:', error)
            setSubmitMessage({
                type: 'error',
                message: 'Connection error. Please check your internet and try again.'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const categories = [
        'Dresses',
        'Tops',
        'Bottoms',
        'Outerwear',
        'Accessories',
        'Bags',
        'Jewelry'
    ]

    const sizes = [
        'XS', 'S', 'M', 'L', 'XL',
        'XXS', 'XXL',
        '32', '34', '36', '38', '40', '42',
        'One Size'
    ]

    const timeSlots = {
        '9': ['21:00-23:00'],
        '10': ['16:00-19:00', '19:00-21:00', '21:00-23:00'],
        '11': ['8:00-10:00', '10:00-12:00', '16:00-18:00', '18:00-20:00', '20:00-22:00'],
        '12': ['8:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00'] // Add time slots for day 12
    }

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-6xl font-bold text-plum mb-6">
                            Share Your <span className="text-gold">Style</span>
                        </h1>
                        <p className="text-xl text-plum/80 max-w-2xl mx-auto">
                            Upload your pieces and become part of the MUSED community.
                            Share your style, earn from your wardrobe, and inspire others.
                        </p>
                    </div>

                    {/* Loading Overlay */}
                    {isSubmitting && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
                                <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <h3 className="text-2xl font-bold text-plum mb-4">Uploading Your Items</h3>
                                <p className="text-plum/80 mb-2">Please wait while we process your submission...</p>
                                <p className="text-sm text-plum/60 flex items-center justify-center gap-2">
                                    <AlertTriangle size={16} />
                                    Don't close this window
                                </p>
                                <div className="mt-4 bg-cream rounded-full h-2">
                                    <div className="bg-gradient-to-r from-plum to-gold h-2 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Status message */}
                    {submitMessage && (
                        <div className={`mb-6 p-6 rounded-2xl ${
                            submitMessage.type === 'success'
                                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                                : 'bg-red-100 text-red-800 border-2 border-red-300'
                        }`}>
                            <div className="flex items-center gap-3">
                                {submitMessage.type === 'success' ? (
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">
                                        ✓
                                    </div>
                                ) : (
                                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white">
                                        !
                                    </div>
                                )}
                                <p className="text-lg font-semibold">{submitMessage.message}</p>
                            </div>
                        </div>
                    )}

                    {/* Upload Form */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Your Information Section */}
                            <div>
                                <h3 className="text-2xl font-bold text-plum mb-6">Your Information</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-lg font-semibold text-plum mb-3">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={userInfo.fullName}
                                            onChange={handleUserInfoChange}
                                            className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300 bg-cream/30 text-plum placeholder-plum/40"
                                            placeholder="Enter your full name"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-lg font-semibold text-plum mb-3">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={userInfo.email}
                                                onChange={handleUserInfoChange}
                                                className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300 bg-cream/30 text-plum placeholder-plum/40"
                                                placeholder="your@email.com"
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-lg font-semibold text-plum mb-3">
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                value={userInfo.phoneNumber}
                                                onChange={handleUserInfoChange}
                                                className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300 bg-cream/30 text-plum placeholder-plum/40"
                                                placeholder="+1 (555) 123-4567"
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-lg font-semibold text-plum mb-3">
                                            Address *
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={userInfo.address}
                                            onChange={handleUserInfoChange}
                                            className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300 bg-cream/30 text-plum placeholder-plum/40"
                                            placeholder="Enter your full address for pickup"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Pickup Method Section */}
                            <div className="border-t border-cream pt-8">
                                <h3 className="text-2xl font-bold text-plum mb-6">Pickup Method</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-lg font-semibold text-plum mb-3">
                                            Can you leave your item for pickup?
                                        </label>
                                        <div className="space-y-3">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="radio"
                                                    name="pickupMethod"
                                                    value="without"
                                                    checked={pickupInfo.pickupMethod === 'without'}
                                                    onChange={handlePickupInfoChange}
                                                    className="text-gold focus:ring-gold"
                                                    required
                                                    disabled={isSubmitting}
                                                />
                                                <span className="text-plum">Yes, you can pick it up without me being there</span>
                                            </label>
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="radio"
                                                    name="pickupMethod"
                                                    value="in-person"
                                                    checked={pickupInfo.pickupMethod === 'in-person'}
                                                    onChange={handlePickupInfoChange}
                                                    className="text-gold focus:ring-gold"
                                                    required
                                                    disabled={isSubmitting}
                                                />
                                                <span className="text-plum">No, I need to be present for pickup</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Conditional fields based on pickup method */}
                                    {pickupInfo.pickupMethod === 'without' && (
                                        <div className="space-y-4 p-4 bg-cream/30 rounded-xl">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-lg font-semibold text-plum mb-3">
                                                        Choose a day
                                                    </label>
                                                    <select
                                                        name="pickupDay"
                                                        value={pickupInfo.pickupDay}
                                                        onChange={handlePickupInfoChange}
                                                        className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300 bg-white text-plum"
                                                        required
                                                        disabled={isSubmitting}
                                                    >
                                                        <option value="">Select day</option>
                                                        <option value="9">9 November (Sunday)</option>
                                                        <option value="10">10 November (Monday)</option>
                                                        <option value="11">11 November (Tuesday)</option>
                                                        <option value="12">12 November (Wednesday)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-lg font-semibold text-plum mb-3">
                                                        Choose a time window
                                                    </label>
                                                    <select
                                                        name="pickupTime"
                                                        value={pickupInfo.pickupTime}
                                                        onChange={handlePickupInfoChange}
                                                        className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300 bg-white text-plum"
                                                        required
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
                                                <label className="block text-lg font-semibold text-plum mb-3">
                                                    Any pickup instructions?
                                                </label>
                                                <textarea
                                                    name="pickupInstructions"
                                                    value={pickupInfo.pickupInstructions}
                                                    onChange={handlePickupInfoChange}
                                                    rows={3}
                                                    className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300 bg-white text-plum placeholder-plum/40 resize-none"
                                                    placeholder="Example: 'Leave with concierge,' 'Door code 12A,' 'Bag on balcony,' etc."
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {pickupInfo.pickupMethod === 'in-person' && (
                                        <div className="space-y-4 p-4 bg-cream/30 rounded-xl">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-lg font-semibold text-plum mb-3">
                                                        Choose a day
                                                    </label>
                                                    <select
                                                        name="pickupDay"
                                                        value={pickupInfo.pickupDay}
                                                        onChange={handlePickupInfoChange}
                                                        className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300 bg-white text-plum"
                                                        required
                                                        disabled={isSubmitting}
                                                    >
                                                        <option value="">Select day</option>
                                                        <option value="9">9 November (Sunday)</option>
                                                        <option value="10">10 November (Monday)</option>
                                                        <option value="11">11 November (Tuesday)</option>
                                                        <option value="12">12 November (Wednesday)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-lg font-semibold text-plum mb-3">
                                                        Choose a time slot
                                                    </label>
                                                    <select
                                                        name="pickupTime"
                                                        value={pickupInfo.pickupTime}
                                                        onChange={handlePickupInfoChange}
                                                        className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300 bg-white text-plum"
                                                        required
                                                        disabled={isSubmitting}
                                                    >
                                                        <option value="">Select time</option>
                                                        {pickupInfo.pickupDay && timeSlots[pickupInfo.pickupDay as keyof typeof timeSlots]?.map((time, index) => (
                                                            <option key={index} value={time}>
                                                                {time}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Special Instructions */}
                            <div>
                                <label className="block text-lg font-semibold text-plum mb-3">
                                    Special Instructions (Optional)
                                </label>
                                <textarea
                                    name="specialInstructions"
                                    value={pickupInfo.specialInstructions}
                                    onChange={handlePickupInfoChange}
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300 bg-cream/30 text-plum placeholder-plum/40 resize-none"
                                    placeholder="Any special care instructions, notes about the items, or pickup preferences..."
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* Clothing Items Section */}
                            <div className="border-t border-cream pt-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-plum">Your Clothing Items</h3>
                                    <div className="text-plum/60 text-sm">
                                        Exactly 2 items required
                                    </div>
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
                                                    <label className="block text-lg font-semibold text-plum mb-3">
                                                        Image *
                                                    </label>
                                                    <div className={`border-2 ${item.image ? 'border-solid border-green-500' : 'border-dashed border-gold/50'} rounded-xl p-6 text-center hover:border-gold transition-all duration-300`}>
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
                                                                    >
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <p className="text-green-600 font-semibold text-lg">
                                                                            ✓ Image Uploaded
                                                                        </p>
                                                                        <p className="text-plum/60 text-sm mt-1">
                                                                            Click to change image
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-center justify-center space-y-4 py-4">
                                                                    <Upload className="text-gold" size={32} />
                                                                    <div className="text-center">
                                                                        <p className="text-plum font-semibold text-lg">
                                                                            Upload Image for Item {index + 1}
                                                                        </p>
                                                                        <p className="text-plum/60 text-sm mt-1">
                                                                            PNG, JPG, JPEG up to 10MB
                                                                        </p>
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
                                                        <label className="block text-lg font-semibold text-plum mb-3">
                                                            Category *
                                                        </label>
                                                        <select
                                                            value={item.category}
                                                            onChange={(e) => handleClothingItemChange(index, 'category', e.target.value)}
                                                            className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300 bg-white text-plum"
                                                            required
                                                            disabled={isSubmitting}
                                                        >
                                                            <option value="">Select a category</option>
                                                            {categories.map(category => (
                                                                <option key={category} value={category}>
                                                                    {category}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-lg font-semibold text-plum mb-3">
                                                            Size *
                                                        </label>
                                                        <select
                                                            value={item.size}
                                                            onChange={(e) => handleClothingItemChange(index, 'size', e.target.value)}
                                                            className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300 bg-white text-plum"
                                                            required
                                                            disabled={isSubmitting}
                                                        >
                                                            <option value="">Select size</option>
                                                            {sizes.map(size => (
                                                                <option key={size} value={size}>
                                                                    {size}
                                                                </option>
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
                                    className="bg-gradient-to-r from-plum to-gold text-cream px-12 py-4 rounded-full font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-cream border-t-transparent rounded-full animate-spin"></div>
                                            <span>Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={20} />
                                            <span>Upload Clothing Items</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* "What happens next" Section */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center">
                        <h3 className="text-2xl font-bold text-plum mb-4">What happens next?</h3>
                        <div className="grid md:grid-cols-3 gap-6 text-plum/80">
                            <div className="space-y-2">
                                <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-cream font-bold mx-auto mb-2">1</div>
                                <p className="font-semibold">We'll pick up your items at your selected time</p>
                            </div>
                            <div className="space-y-2">
                                <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-cream font-bold mx-auto mb-2">2</div>
                                <p className="font-semibold">Dinner collection launches November 11th</p>
                                <p className="text-sm">choose your items then</p>
                            </div>
                            <div className="space-y-2">
                                <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-cream font-bold mx-auto mb-2">3</div>
                                <p className="font-semibold">Receive your items</p>
                                <p className="text-sm">and you're all set for dinner</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}