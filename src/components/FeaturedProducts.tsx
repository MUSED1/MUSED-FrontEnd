import React from 'react'
type Product = {
    id: number
    name: string
    price: string
    image: string
    category: string
}
export function FeaturedProducts() {
    const products: Product[] = [
        {
            id: 1,
            name: 'Beige mini dress',
            price: '',
            image:
                "src/assets/featured1.jpg",
            category: 'S',
        },
        {
            id: 2,
            name: 'Halter dress',
            category: 'XS',
            price: '',
            image:
                "src/assets/featured2.jpg",
        },
        {
            id: 3,
            name: 'Two-piece white set',
            price: '',
            image:
                "src/assets/featured3.jpg",
            category: 'M',
        },
        {
            id: 4,
            name: 'MINI dress',
            price: '',
            image:
                "src/assets/main1.jpg",
            category: 'S',
        },
    ]
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
                                    <button className="bg-cream text-burgundy px-4 py-2 font-medium transform -translate-y-4 group-hover:translate-y-0 transition-transform">
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
                //add a button to that says see more
            </div>
        </section>
    )
}
