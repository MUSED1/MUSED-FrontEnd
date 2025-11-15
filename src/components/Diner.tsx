// components/Diner.tsx
import { Header } from './Header'
import { Footer } from './Footer'
import { Link } from 'react-router-dom' // Add this import

export function Diner() {
    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 ">
                <div className="container mx-auto px-4 py-16">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-bold text-plum mb-6">
                            MUSED <span className="text-gold">Diner</span>
                        </h1>
                        <p className="text-xl text-plum/80 max-w-2xl mx-auto font-amandine">
                            Be Mused and meet your muse around a table.
                            Mused is more than sharing style, it's sharing an experience.
                        </p>
                    </div>

                    {/* Wear Something Borrowed Section */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-16">
                        <div className="md:flex">
                            <div className="md:w-1/2 p-8">
                                <h2 className="text-3xl font-bold text-plum mb-4">Wear Something Borrowed Dinner</h2>
                                <p className="text-plum/80 mb-6 leading-relaxed font-amandine">
                                    Come to dinner wearing a borrowed piece from the dinner collection. This is where muses
                                    can meet the mused. Get to know who you are lending to and borrowing from. Share your
                                    style, share a moment.
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl font-bold text-gold">270 HKD</span>
                                    <Link
                                        to="/dinner-collection-two"
                                        className="bg-plum text-cream px-8 py-3 rounded-full hover:bg-gold transition-all duration-300 font-semibold"
                                    >
                                        PICK YOUR OUTFIT
                                    </Link>
                                </div>
                            </div>
                            <div className="md:w-1/2 bg-gradient-to-br from-plum to-gold p-8 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <h3 className="text-2xl font-bold mb-4">Next Event</h3>
                                    <p className="text-xl mb-2">Wear Something Borrowed</p>
                                    <p className="text-3xl font-bold mb-4">Nov 18, 2025</p>
                                    <p className="text-amber-100">8:00 PM - Central Hong Kong</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-center mb-16">
                        <Link
                            to="/first-dinner" // Use Link instead of button with navigate
                            className="bg-gold text-plum px-8 py-3 rounded-full hover:bg-plum hover:text-cream transition-all duration-300 font-semibold inline-block"
                        >
                            First Dinner Pictures
                        </Link>
                    </div>

                    {/* Past Events Section */}
                </div>
            </main>
            <Footer />
        </div>
    )
}