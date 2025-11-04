import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
            image: "/featured1.jpg",
            category: '',
        },
        {
            id: 2,
            name: ' ',
            category: '',
            price: '',
            image: "/featured2.jpg",
        },
        {
            id: 3,
            name: '',
            price: '',
            image: "/featured3.jpg",
            category: '',
        },
        {
            id: 4,
            name: '',
            price: '',
            image: "/replace.jpg",
            category: '',
        },
    ]

    const handleSeeMore = () => {
        navigate('/collections')
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
        </section>
    )
}