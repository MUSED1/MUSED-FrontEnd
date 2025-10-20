import React from 'react'
import { useNavigate } from 'react-router-dom'

export function Categories() {
    const navigate = useNavigate()

    const handleExploreCollection = () => {
        navigate('/collections')
    }

    return (
        <section className="py-16 bg-rose/10 w-full">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">
                        See the collection
                    </h2>
                    <div className="w-24 h-1 bg-burgundy mx-auto"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative h-96 overflow-hidden group">
                        <img
                            src="src/assets/dress.png"
                            alt="Women's Collection"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-burgundy/80 to-transparent flex items-end p-6">
                            <div className="text-cream">
                                <h3 className="text-2xl font-bold mb-2">Dresses</h3>
                                <button
                                    onClick={handleExploreCollection}
                                    className="inline-block border-b-2 border-cream pb-1 hover:text-gold transition-colors text-left"
                                >
                                    Explore collection
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="relative h-96 overflow-hidden group">
                        <img
                            src="src/assets/pants.png"
                            alt="Men's Collection"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-burgundy/80 to-transparent flex items-end p-6">
                            <div className="text-cream">
                                <h3 className="text-2xl font-bold mb-2">Trousers</h3>
                                <button
                                    onClick={handleExploreCollection}
                                    className="inline-block border-b-2 border-cream pb-1 hover:text-gold transition-colors text-left"
                                >
                                    Explore collection
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="relative h-96 overflow-hidden group">
                        <img
                            src="src/assets/bag.jpg"
                            alt="Accessories Collection"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-burgundy/80 to-transparent flex items-end p-6">
                            <div className="text-cream">
                                <h3 className="text-2xl font-bold mb-2">Accessories</h3>
                                <button
                                    onClick={handleExploreCollection}
                                    className="inline-block border-b-2 border-cream pb-1 hover:text-gold transition-colors text-left"
                                >
                                    Explore collection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}