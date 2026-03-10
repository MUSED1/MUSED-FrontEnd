// components/AdminClothing.tsx
import { useState, useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { Edit, Trash2, Eye, Save, X, Plus } from 'lucide-react'

interface ClothingItem {
    _id: string;
    images: string[];
    size: string;
    category: string;
    address: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    university: string;
    pickupMethod: string;
    pickupTime: string;
    pickupDay: string;
    pickupInstructions: string;
    specialInstructions: string;
    status: 'available' | 'reserved' | 'sold';
    createdAt: string;
}

export function AdminClothing() {
    const [allClothingItems, setAllClothingItems] = useState<ClothingItem[]>([])
    const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<Partial<ClothingItem>>({})
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [currentYear] = useState<number>(2026)
    const [uploadingForItem, setUploadingForItem] = useState<string | null>(null)
    const [deletingImageInfo, setDeletingImageInfo] = useState<{itemId: string, imageUrl: string} | null>(null)

    const categories = [
        'Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories',
        'Shoes', 'Bags', 'Jewelry', 'Skirts', 'Vests', 'Others'
    ]

    const sizes = [
        'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXS',
        '32', '34', '36', '38', '40', '42', 'One Size'
    ]

    const universities = [
        'HKU', 'CUHK', 'PolyU', 'HKUST', 'Baptist', 'NA'
    ]

    const statuses = ['available', 'reserved', 'sold']

    useEffect(() => {
        fetchClothingItems()
    }, [])

    const fetchClothingItems = async () => {
        try {
            setLoading(true)
            setError('')

            const response = await fetch('https://mused-backend.onrender.com/api/clothing/admin/all', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`)
            }

            const result = await response.json()

            if (result.success) {
                setAllClothingItems(result.data)
                // Filter items from 2026 onwards
                filterItemsFrom2026(result.data)
            } else {
                throw new Error(result.message || 'Failed to fetch items')
            }
        } catch (err) {
            console.error('Fetch error:', err)
            setError(err instanceof Error ? err.message : 'Error fetching data')
        } finally {
            setLoading(false)
        }
    }

    const filterItemsFrom2026 = (items: ClothingItem[]) => {
        const startDate2026 = new Date('2026-01-01T00:00:00.000Z')
        const filtered = items.filter((item: ClothingItem) => {
            const itemDate = new Date(item.createdAt)
            return itemDate >= startDate2026
        })
        setFilteredItems(filtered)
    }

    const handleEdit = (item: ClothingItem) => {
        setEditingId(item._id)
        setEditForm({ ...item })
    }

    const handleSave = async (id: string) => {
        try {
            const response = await fetch(`https://mused-backend.onrender.com/api/clothing/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editForm)
            })

            const result = await response.json()

            if (response.ok && result.success) {
                // Update both arrays
                const updatedAllItems = allClothingItems.map(item =>
                    item._id === id ? { ...item, ...editForm } : item
                )
                setAllClothingItems(updatedAllItems)

                // Re-filter the items
                filterItemsFrom2026(updatedAllItems)

                setEditingId(null)
                setEditForm({})
            } else {
                throw new Error(result.message)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error updating item')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) {
            return
        }

        try {
            const response = await fetch(`https://mused-backend.onrender.com/api/clothing/${id}`, {
                method: 'DELETE'
            })

            const result = await response.json()

            if (response.ok && result.success) {
                // Update both arrays
                const updatedAllItems = allClothingItems.filter(item => item._id !== id)
                setAllClothingItems(updatedAllItems)

                // Re-filter the items
                filterItemsFrom2026(updatedAllItems)
            } else {
                throw new Error(result.message)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error deleting item')
        }
    }

    const handleCancel = () => {
        setEditingId(null)
        setEditForm({})
    }

    const handleInputChange = (field: keyof ClothingItem, value: string) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }))
    }

    // Function to handle image upload
    const handleImageUpload = async (itemId: string, file: File) => {
        try {
            setUploadingForItem(itemId)
            setError('')

            // Convert file to base64
            const base64Image = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.readAsDataURL(file)
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = error => reject(error)
            })

            // Find the current item
            const currentItem = allClothingItems.find(item => item._id === itemId)
            if (!currentItem) return

            // Create updated images array with the new image
            const updatedImages = [...currentItem.images, base64Image]

            // Use the dedicated images endpoint
            const response = await fetch(`https://mused-backend.onrender.com/api/clothing/${itemId}/images`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    images: updatedImages
                })
            })

            const result = await response.json()

            if (response.ok && result.success) {
                // Update local state
                const updatedAllItems = allClothingItems.map(item =>
                    item._id === itemId
                        ? { ...item, images: updatedImages }
                        : item
                )
                setAllClothingItems(updatedAllItems)
                filterItemsFrom2026(updatedAllItems)
            } else {
                throw new Error(result.message || 'Failed to upload image')
            }
        } catch (err) {
            console.error('Upload error:', err)
            setError(err instanceof Error ? err.message : 'Error uploading image')
        } finally {
            setUploadingForItem(null)
        }
    }

    // Function to handle image deletion
    const handleImageDelete = async (itemId: string, imageUrl: string) => {
        if (!confirm('Are you sure you want to delete this image?')) {
            return
        }

        try {
            setDeletingImageInfo({ itemId, imageUrl })
            setError('')

            const currentItem = allClothingItems.find(item => item._id === itemId)
            if (!currentItem) return

            // Filter out the deleted image
            const updatedImages = currentItem.images.filter(url => url !== imageUrl)

            // Use the dedicated images endpoint
            const response = await fetch(`https://mused-backend.onrender.com/api/clothing/${itemId}/images`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    images: updatedImages
                })
            })

            const result = await response.json()

            if (response.ok && result.success) {
                // Update local state
                const updatedAllItems = allClothingItems.map(item =>
                    item._id === itemId
                        ? { ...item, images: updatedImages }
                        : item
                )
                setAllClothingItems(updatedAllItems)
                filterItemsFrom2026(updatedAllItems)

                console.log('Cloudinary deletion results:', result.data?.deletedFromCloudinary)
            } else {
                throw new Error(result.message || 'Failed to delete image')
            }
        } catch (err) {
            console.error('Delete error details:', err)
            setError(err instanceof Error ? err.message : 'Error deleting image')
        } finally {
            setDeletingImageInfo(null)
        }
    }

    // Helper function to handle image errors
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.target as HTMLImageElement;
        target.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'400\' viewBox=\'0 0 400 400\'%3E%3Crect width=\'400\' height=\'400\' fill=\'%23f0f0f0\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'20\' fill=\'%23999\'%3EImage Not Found%3C/text%3E%3C/svg%3E';
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800'
            case 'reserved': return 'bg-yellow-100 text-yellow-800'
            case 'sold': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    if (loading) {
        return (
            <div className="font-sans">
                <Header />
                <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-8">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-2 border-plum border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-plum mt-4">Loading clothing items...</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-8">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-plum mb-4">
                            Clothing Management
                        </h1>
                        <p className="text-lg text-plum/80">
                            Showing items from {currentYear} onwards ({filteredItems.length} items)
                        </p>
                        <p className="text-sm text-plum/60 mt-2">
                            Total items in database: {allClothingItems.length}
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

                    {/* Clothing Items Grid */}
                    <div className="grid gap-6">
                        {filteredItems.map((item) => (
                            <div key={item._id} className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="grid md:grid-cols-3 gap-6">
                                    {/* Image Section */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold text-plum">Images ({item.images.length})</h3>
                                            {editingId === item._id && (
                                                <div>
                                                    <input
                                                        type="file"
                                                        id={`image-upload-${item._id}`}
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0]
                                                            if (file) {
                                                                handleImageUpload(item._id, file)
                                                            }
                                                        }}
                                                        disabled={uploadingForItem === item._id}
                                                    />
                                                    <label
                                                        htmlFor={`image-upload-${item._id}`}
                                                        className={`cursor-pointer bg-plum text-white p-2 rounded-lg hover:bg-plum/80 transition-colors inline-flex items-center gap-2 ${
                                                            uploadingForItem === item._id ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                    >
                                                        {uploadingForItem === item._id ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                <span>Uploading...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Plus size={16} />
                                                                <span>Add Image</span>
                                                            </>
                                                        )}
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {item.images.map((imageUrl, index) => {
                                                const isDeleting = deletingImageInfo?.itemId === item._id &&
                                                    deletingImageInfo?.imageUrl === imageUrl;

                                                return (
                                                    <div key={`${item._id}-image-${index}`} className="relative group">
                                                        <img
                                                            src={imageUrl}
                                                            alt={`${item.category} ${index + 1}`}
                                                            className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                                            onClick={() => setPreviewImage(imageUrl)}
                                                            onError={handleImageError}
                                                            referrerPolicy="no-referrer"
                                                            crossOrigin="anonymous"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all">
                                                            <button
                                                                onClick={() => setPreviewImage(imageUrl)}
                                                                className="text-white opacity-0 group-hover:opacity-100 hover:scale-110 transition-all bg-black bg-opacity-50 rounded-full p-1"
                                                                disabled={isDeleting}
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                            {editingId === item._id && (
                                                                <button
                                                                    onClick={() => handleImageDelete(item._id, imageUrl)}
                                                                    disabled={isDeleting}
                                                                    className="text-red-500 opacity-0 group-hover:opacity-100 hover:scale-110 transition-all bg-white rounded-full p-1"
                                                                >
                                                                    {isDeleting ? (
                                                                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                                    ) : (
                                                                        <Trash2 size={16} />
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Item Details */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-plum">Item Details</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-plum/80">Category:</span>
                                                {editingId === item._id ? (
                                                    <select
                                                        value={editForm.category || ''}
                                                        onChange={(e) => handleInputChange('category', e.target.value)}
                                                        className="border border-cream rounded px-2 py-1"
                                                    >
                                                        {categories.map(cat => (
                                                            <option key={cat} value={cat}>{cat}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="text-plum">{item.category}</span>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-plum/80">Size:</span>
                                                {editingId === item._id ? (
                                                    <select
                                                        value={editForm.size || ''}
                                                        onChange={(e) => handleInputChange('size', e.target.value)}
                                                        className="border border-cream rounded px-2 py-1"
                                                    >
                                                        {sizes.map(size => (
                                                            <option key={size} value={size}>{size}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="text-plum">{item.size}</span>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-plum/80">University:</span>
                                                {editingId === item._id ? (
                                                    <select
                                                        value={editForm.university || ''}
                                                        onChange={(e) => handleInputChange('university', e.target.value)}
                                                        className="border border-cream rounded px-2 py-1"
                                                    >
                                                        {universities.map(uni => (
                                                            <option key={uni} value={uni}>{uni}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="text-plum">{item.university}</span>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-plum/80">Status:</span>
                                                {editingId === item._id ? (
                                                    <select
                                                        value={editForm.status || ''}
                                                        onChange={(e) => handleInputChange('status', e.target.value)}
                                                        className="border border-cream rounded px-2 py-1"
                                                    >
                                                        {statuses.map(status => (
                                                            <option key={status} value={status}>{status}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                                                        {item.status}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="font-semibold text-plum/80">Uploaded:</span>
                                                <span className="text-plum text-sm">{formatDate(item.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* User & Pickup Information */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-plum">Contact & Pickup</h3>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="font-semibold text-plum/80">Name:</span>
                                                {editingId === item._id ? (
                                                    <input
                                                        type="text"
                                                        value={editForm.fullName || ''}
                                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                                        className="w-full border border-cream rounded px-2 py-1 mt-1"
                                                    />
                                                ) : (
                                                    <span className="block text-plum">{item.fullName}</span>
                                                )}
                                            </div>

                                            <div>
                                                <span className="font-semibold text-plum/80">Email:</span>
                                                {editingId === item._id ? (
                                                    <input
                                                        type="email"
                                                        value={editForm.email || ''}
                                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                                        className="w-full border border-cream rounded px-2 py-1 mt-1"
                                                    />
                                                ) : (
                                                    <span className="block text-plum">{item.email}</span>
                                                )}
                                            </div>

                                            <div>
                                                <span className="font-semibold text-plum/80">Phone:</span>
                                                {editingId === item._id ? (
                                                    <input
                                                        type="tel"
                                                        value={editForm.phoneNumber || ''}
                                                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                                        className="w-full border border-cream rounded px-2 py-1 mt-1"
                                                    />
                                                ) : (
                                                    <span className="block text-plum">{item.phoneNumber}</span>
                                                )}
                                            </div>

                                            <div>
                                                <span className="font-semibold text-plum/80">Address:</span>
                                                {editingId === item._id ? (
                                                    <textarea
                                                        value={editForm.address || ''}
                                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                                        className="w-full border border-cream rounded px-2 py-1 mt-1 resize-none"
                                                        rows={2}
                                                    />
                                                ) : (
                                                    <span className="block text-plum">{item.address}</span>
                                                )}
                                            </div>

                                            <div>
                                                <span className="font-semibold text-plum/80">Pickup Method:</span>
                                                <span className="block text-plum capitalize">{item.pickupMethod}</span>
                                            </div>

                                            {item.pickupDay && (
                                                <div>
                                                    <span className="font-semibold text-plum/80">Pickup Day:</span>
                                                    <span className="block text-plum">{item.pickupDay}</span>
                                                </div>
                                            )}

                                            {item.pickupTime && (
                                                <div>
                                                    <span className="font-semibold text-plum/80">Pickup Time:</span>
                                                    <span className="block text-plum">{item.pickupTime}</span>
                                                </div>
                                            )}

                                            {item.pickupInstructions && (
                                                <div>
                                                    <span className="font-semibold text-plum/80">Pickup Instructions:</span>
                                                    <span className="block text-plum">{item.pickupInstructions}</span>
                                                </div>
                                            )}

                                            {item.specialInstructions && (
                                                <div>
                                                    <span className="font-semibold text-plum/80">Special Instructions:</span>
                                                    <span className="block text-plum">{item.specialInstructions}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-cream">
                                    {editingId === item._id ? (
                                        <>
                                            <button
                                                onClick={() => handleSave(item._id)}
                                                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                            >
                                                <Save size={16} />
                                                <span>Save</span>
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                            >
                                                <X size={16} />
                                                <span>Cancel</span>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                            >
                                                <Edit size={16} />
                                                <span>Edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                                <span>Delete</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredItems.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <p className="text-plum text-lg">No clothing items found from 2026 onwards.</p>
                            {allClothingItems.length > 0 && (
                                <p className="text-plum/60 text-sm mt-2">
                                    There are {allClothingItems.length} items in total from previous years.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-4xl max-h-full">
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            onError={handleImageError}
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setPreviewImage(null);
                            }}
                            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}