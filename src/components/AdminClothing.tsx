// components/AdminClothing.tsx
import { useState, useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { Edit, Trash2, Eye, Save, X, Image as ImageIcon } from 'lucide-react'

interface ClothingItem {
    _id: string;
    images: string[];
    size: string;
    category: string;
    address: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    pickupMethod: string;
    pickupTime: string;
    pickupDay: string;
    pickupInstructions: string;
    specialInstructions: string;
    status: 'available' | 'reserved' | 'sold';
    createdAt: string;
}

interface ClothingItemWithoutImages extends Omit<ClothingItem, 'images'> {
    images?: string[];
}

export function AdminClothing() {
    const [clothingItems, setClothingItems] = useState<ClothingItemWithoutImages[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<Partial<ClothingItemWithoutImages>>({})
    const [previewImage, setPreviewImage] = useState<{url: string, itemId: string} | null>(null)
    const [imageCache, setImageCache] = useState<{[key: string]: string[]}>({})

    const categories = [
        'Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories',
        'Shoes', 'Bags', 'Jewelry', 'Skirts', 'Vests', 'Others'
    ]

    const sizes = [
        'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXS',
        '32', '34', '36', '38', '40', '42', 'One Size'
    ]

    const statuses = ['available', 'reserved', 'sold']

    useEffect(() => {
        fetchClothingItems()
    }, [])

    const fetchClothingItems = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await fetch('https://mused-backend.onrender.com/api/clothing/admin/all')

            if (!response.ok) {
                throw new Error(`Failed to fetch clothing items: ${response.status}`)
            }

            const result = await response.json()

            if (result.success) {
                console.log('Fetched items:', result.data.length)
                setClothingItems(result.data)
            } else {
                throw new Error(result.message || 'Unknown error occurred')
            }
        } catch (err) {
            console.error('Fetch error:', err)
            setError(err instanceof Error ? err.message : 'Error fetching data')
        } finally {
            setLoading(false)
        }
    }

    const fetchItemImages = async (itemId: string) => {
        // Check if images are already cached
        if (imageCache[itemId]) {
            return imageCache[itemId]
        }

        try {
            const response = await fetch(`https://mused-backend.onrender.com/api/clothing/admin/${itemId}`)

            if (!response.ok) {
                throw new Error('Failed to fetch images')
            }

            const result = await response.json()

            if (result.success && result.data.images) {
                // Cache the images
                setImageCache(prev => ({
                    ...prev,
                    [itemId]: result.data.images
                }))
                return result.data.images
            }
            return []
        } catch (error) {
            console.error('Error fetching images:', error)
            return []
        }
    }

    const handleImageClick = async (itemId: string, imageIndex: number) => {
        try {
            const images = await fetchItemImages(itemId)
            if (images && images[imageIndex]) {
                setPreviewImage({
                    url: `data:image/jpeg;base64,${images[imageIndex]}`,
                    itemId
                })
            }
        } catch (error) {
            console.error('Error loading image:', error)
            setError('Failed to load image')
        }
    }

    const handleEdit = (item: ClothingItemWithoutImages) => {
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
                setClothingItems(prev =>
                    prev.map(item =>
                        item._id === id ? { ...item, ...editForm } : item
                    )
                )
                setEditingId(null)
                setEditForm({})
                setError('')
            } else {
                throw new Error(result.message || 'Failed to update item')
            }
        } catch (err) {
            console.error('Save error:', err)
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
                setClothingItems(prev => prev.filter(item => item._id !== id))
                // Remove from image cache
                setImageCache(prev => {
                    const newCache = { ...prev }
                    delete newCache[id]
                    return newCache
                })
                setError('')
            } else {
                throw new Error(result.message || 'Failed to delete item')
            }
        } catch (err) {
            console.error('Delete error:', err)
            setError(err instanceof Error ? err.message : 'Error deleting item')
        }
    }

    const handleCancel = () => {
        setEditingId(null)
        setEditForm({})
    }

    const handleInputChange = (field: keyof ClothingItemWithoutImages, value: string) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }))
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
                            Manage all uploaded clothing items ({clothingItems.length} items)
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-xl border border-red-300">
                            <div className="flex justify-between items-center">
                                <span>{error}</span>
                                <button
                                    onClick={() => setError('')}
                                    className="text-red-800 hover:text-red-900"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Refresh Button */}
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={fetchClothingItems}
                            className="bg-plum text-white px-4 py-2 rounded-lg hover:bg-plum/90 transition-colors"
                        >
                            Refresh Data
                        </button>
                    </div>

                    {/* Clothing Items Grid */}
                    <div className="grid gap-6">
                        {clothingItems.map((item) => (
                            <div key={item._id} className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="grid md:grid-cols-3 gap-6">
                                    {/* Image Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-plum">Images</h3>
                                        <div className="space-y-2">
                                            {/* Placeholder for images - will load on click */}
                                            {[0, 1, 2].map((index) => (
                                                <div key={index} className="relative">
                                                    <div
                                                        className="w-full h-32 bg-gray-100 rounded-lg cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center"
                                                        onClick={() => handleImageClick(item._id, index)}
                                                    >
                                                        <ImageIcon size={24} className="text-gray-400" />
                                                    </div>
                                                    <button
                                                        onClick={() => handleImageClick(item._id, index)}
                                                        className="absolute inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-all"
                                                    >
                                                        <Eye size={20} className="text-white opacity-0 hover:opacity-100" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Click to view images
                                        </p>
                                    </div>

                                    {/* Item Details */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-plum">Item Details</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
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

                                            <div className="flex justify-between">
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

                                            <div className="flex justify-between">
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

                                            {item.pickupInstructions && (
                                                <div>
                                                    <span className="font-semibold text-plum/80">Instructions:</span>
                                                    <span className="block text-plum">{item.pickupInstructions}</span>
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

                    {clothingItems.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <p className="text-plum text-lg">No clothing items found.</p>
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
                    <div
                        className="relative max-w-4xl max-h-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={previewImage.url}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain"
                        />
                        <button
                            onClick={() => setPreviewImage(null)}
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