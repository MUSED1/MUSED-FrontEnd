import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'

type Product = {
    id: number
    name: string
    price: string
    image: string
    category: string
}

export function FeaturedProducts() {
    const navigate = useNavigate()
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

    const products: Product[] = [
        {
            id: 1,
            name: '',
            price: '',
            image: "src/assets/featured1.jpg",
            category: 'S',
        },
        {
            id: 2,
            name: ' ',
            category: 'XS',
            price: '',
            image: "src/assets/featured2.jpg",
        },
        {
            id: 3,
            name: '',
            price: '',
            image: "src/assets/featured3.jpg",
            category: 'M',
        },
        {
            id: 4,
            name: '',
            price: '',
            image: "src/assets/main1.jpg",
            category: 'S',
        },
    ]

    const handleSeeMore = () => {
        navigate('/collections')
    }

    const handleQuickView = (product: Product) => {
        setSelectedProduct(product)
    }

    return (
        <section className="py-16 bg-cream w-full">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">
                        Featured Products
                    </h2>
                    <div className="w-24 h-1 bg-burgundy mx-auto"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <div key={product.id} className="group">
                            <div className="relative overflow-hidden mb-4">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-80 object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-plum bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => handleQuickView(product)}
                                        className="bg-cream text-burgundy px-4 py-2 font-medium transform -translate-y-4 group-hover:translate-y-0 transition-transform hover:scale-105"
                                    >
                                        Quick View
                                    </button>
                                </div>
                                <div className="absolute top-2 left-2 bg-burgundy text-cream text-xs px-2 py-1">
                                    {product.category}
                                </div>
                            </div>
                            <h3 className="font-medium text-lg mb-1 text-plum">
                                {product.name}
                            </h3>
                            <p className="text-burgundy font-semibold">{product.price}</p>
                        </div>
                    ))}
                </div>

                {/* See More Button */}
                <div className="text-center mt-12">
                    <button
                        onClick={handleSeeMore}
                        className="bg-burgundy text-cream px-8 py-4 font-semibold rounded-lg hover:bg-plum transform hover:scale-105 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl"
                    >
                        See More
                    </button>
                </div>
            </div>

            {/* Quick View Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="relative">
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-all transform hover:scale-110 z-10 shadow-lg"
                            >
                                <X size={24} className="text-burgundy" />
                            </button>
                            <img
                                src={selectedProduct.image}
                                alt={selectedProduct.name}
                                className="w-full h-96 object-cover"
                            />
                        </div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-burgundy mb-2">
                                        {selectedProduct.name}
                                    </h3>
                                    <div className="flex items-center space-x-4">
                                        <span className="bg-burgundy text-cream px-3 py-1 rounded-full text-sm font-medium">
                                            Size: {selectedProduct.category}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-burgundy font-semibold text-lg">{selectedProduct.price}</p>
                            </div>

                            <p className="text-plum mb-6">
                                Featured outfit from our exclusive collection. Perfect for special occasions and elegant events.
                            </p>

                            <div className="flex space-x-4">
                                <button
                                    onClick={() => {
                                        setSelectedProduct(null)
                                        navigate('/collections')
                                    }}
                                    className="flex-1 bg-burgundy text-cream py-3 rounded-lg font-semibold hover:bg-plum transform hover:scale-105 transition-all duration-300"
                                >
                                    View in Collections
                                </button>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="flex-1 bg-gray-300 text-burgundy py-3 rounded-lg font-semibold hover:bg-gray-400 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}