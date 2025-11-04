// components/UploadClothing.tsx
import { useState } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { Upload, X, Plus } from 'lucide-react'

export function ClothingUploadForm() {
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitMessage, setSubmitMessage] = useState<{type: 'success' | 'error', message: string} | null>(null)

    const [formData, setFormData] = useState({
        category: '',
        size: '',
        address: '', // ✅ Added address
        fullName: '',
        email: '',
        phoneNumber: '',
        preferredPickupDate: '',
        specialInstructions: ''
    })

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveImage = () => {
        setSelectedImage(null)
        setImagePreview(null)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitMessage(null)

        try {
            // Convert image to base64 for backend
            let imageBase64 = ''
            if (selectedImage) {
                imageBase64 = await convertToBase64(selectedImage)
            }

            // Prepare data for submission
            const submissionData = {
                ...formData,
                image: imageBase64,
                phoneNumber: formData.phoneNumber
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
                    message: 'Clothing uploaded successfully! We will contact you soon.' // ✅ Updated message
                })

                // Reset form
                setFormData({
                    category: '',
                    size: '',
                    address: '', // ✅ Added address
                    fullName: '',
                    email: '',
                    phoneNumber: '',
                    preferredPickupDate: '',
                    specialInstructions: ''
                })
                setSelectedImage(null)
                setImagePreview(null)
            } else {
                setSubmitMessage({
                    type: 'error',
                    message: result.message || 'Error uploading clothing. Please try again.' // ✅ Updated message
                })
            }
        } catch (error) {
            console.error('Error:', error)
            setSubmitMessage({
                type: 'error',
                message: 'Connection error. Please check your internet and try again.' // ✅ Updated message
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Function to convert file to base64
    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => {
                const base64 = reader.result as string
                const base64Data = base64.split(',')[1] || base64
                resolve(base64Data)
            }
            reader.onerror = error => reject(error)
        })
    }

    const categories = [
        'Dresses',
        'Tops',
        'Bottoms',
        'Outerwear',
        'Accessories',
        'Shoes',
        'Bags',
        'Jewelry'
    ]

    const sizes = [
        'XS', 'S', 'M', 'L', 'XL',
        'XXS', 'XXL',
        '32', '34', '36', '38', '40', '42',
        'One Size'
    ]

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

                    {/* Status message */}
                    {submitMessage && (
                        <div className={`mb-6 p-4 rounded-xl ${
                            submitMessage.type === 'success'
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                            {submitMessage.message}
                        </div>
                    )}

                    {/* Upload Form */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Image Upload Section */}
                            <div>
                                <label className="block text-lg font-semibold text-plum mb-4">
                                    Clothing Image *
                                </label>
                                <div className="border-2 border-dashed border-gold/50 rounded-2xl p-8 text-center hover:border-gold transition-all duration-300">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                        required
                                    />

                                    {!imagePreview ? (
                                        <label htmlFor="image-upload" className="cursor-pointer">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center">
                                                    <Upload className="text-gold" size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-plum font-semibold text-lg">
                                                        Click to upload or drag and drop
                                                    </p>
                                                    <p className="text-plum/60 mt-2">
                                                        PNG, JPG, JPEG up to 10MB
                                                    </p>
                                                </div>
                                            </div>
                                        </label>
                                    ) : (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="max-h-64 mx-auto rounded-lg shadow-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="absolute top-2 right-2 bg-plum text-cream rounded-full p-1 hover:bg-gold transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Category and Size */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-lg font-semibold text-plum mb-3">
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300 bg-cream/30 text-plum"
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
                                        name="size"
                                        value={formData.size}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300 bg-cream/30 text-plum"
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

                            {/* Address */}
                            <div>
                                <label className="block text-lg font-semibold text-plum mb-3">
                                    Address *
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300 bg-cream/30 text-plum placeholder-plum/40"
                                    placeholder="Enter your full address for pickup"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* Your Information Section */}
                            <div className="border-t border-cream pt-8">
                                <h3 className="text-2xl font-bold text-plum mb-6">Your Information</h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-lg font-semibold text-plum mb-3">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
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
                                                value={formData.email}
                                                onChange={handleInputChange}
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
                                                value={formData.phoneNumber}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300 bg-cream/30 text-plum placeholder-plum/40"
                                                placeholder="+1 (555) 123-4567"
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-lg font-semibold text-plum mb-3">
                                            Preferred Pickup Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="preferredPickupDate"
                                            value={formData.preferredPickupDate}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300 bg-cream/30 text-plum"
                                            required
                                            disabled={isSubmitting}
                                        />
                                        <p className="text-plum/60 mt-2 text-sm">dd/mm/aaaa</p>
                                    </div>

                                    <div>
                                        <label className="block text-lg font-semibold text-plum mb-3">
                                            Special Instructions (Optional)
                                        </label>
                                        <textarea
                                            name="specialInstructions"
                                            value={formData.specialInstructions}
                                            onChange={handleInputChange}
                                            rows={4}
                                            className="w-full px-4 py-3 border-2 border-cream rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300 bg-cream/30 text-plum placeholder-plum/40 resize-none"
                                            placeholder="Any special care instructions, notes about the item, or pickup preferences..."
                                            disabled={isSubmitting}
                                        />
                                    </div>
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
                                            <span>Upload Clothing</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Updated "What happens next" Section */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center">
                        <h3 className="text-2xl font-bold text-plum mb-4">What happens next?</h3>
                        <div className="grid md:grid-cols-3 gap-6 text-plum/80">
                            <div className="space-y-2">
                                <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-cream font-bold mx-auto mb-2">1</div>
                                <p className="font-semibold">We'll pick up your item at your selected time</p>
                            </div>
                            <div className="space-y-2">
                                <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-cream font-bold mx-auto mb-2">2</div>
                                <p className="font-semibold">Dinner collection launches November 11th</p>
                                <p className="text-sm">choose your item then</p>
                            </div>
                            <div className="space-y-2">
                                <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-cream font-bold mx-auto mb-2">3</div>
                                <p className="font-semibold">Receive your item</p>
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