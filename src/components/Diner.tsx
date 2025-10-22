// components/Diner.tsx
import { Header } from './Header'
import { Footer } from './Footer'

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
                        <p className="text-xl text-plum/80 max-w-2xl mx-auto">
                            Experience fashion in a whole new light. Our exclusive dining events combine
                            style, community, and culinary excellence.
                        </p>
                    </div>

                    {/* Wear Something Borrowed Section */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-16">
                        <div className="md:flex">
                            <div className="md:w-1/2 p-8">
                                <h2 className="text-3xl font-bold text-plum mb-4">Wear Something Borrowed Dinner</h2>
                                <p className="text-plum/80 mb-6 leading-relaxed">
                                    Come to dinner wearing a borrowed piece from the dinner collection. This is where muses
                                    can meet the mused. Get to know who you are lending to and borrowing from. Share your
                                    style, share a moment.
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl font-bold text-gold">300 HKD</span>
                                    <button className="bg-plum text-cream px-8 py-3 rounded-full hover:bg-gold transition-all duration-300 font-semibold">
                                        Reserve Your Seat
                                    </button>
                                </div>
                            </div>
                            <div className="md:w-1/2 bg-gradient-to-br from-plum to-gold p-8 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <h3 className="text-2xl font-bold mb-4">Next Event</h3>
                                    <p className="text-xl mb-2">Wear Something Borrowed</p>
                                    <p className="text-3xl font-bold mb-4">Oct 23, 2025</p>
                                    <p className="text-amber-100">7:00 PM - Central Hong Kong</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Past Events Section */}

                    {/* Info Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-plum mb-6 text-center">About MUSED Diner</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold text-gold mb-4">What to Expect</h3>
                                <ul className="space-y-3 text-plum/80">
                                    <li className="flex items-center">
                                        <span className="w-2 h-2 bg-gold rounded-full mr-3"></span>
                                        Curated fashion presentations
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-2 h-2 bg-gold rounded-full mr-3"></span>
                                        Gourmet dining experience
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-2 h-2 bg-gold rounded-full mr-3"></span>
                                        Live styling consultations
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-2 h-2 bg-gold rounded-full mr-3"></span>
                                        Exclusive rental opportunities
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gold mb-4">Location & Details</h3>
                                <ul className="space-y-3 text-plum/80">
                                    <li className="flex items-center">
                                        <span className="w-2 h-2 bg-plum rounded-full mr-3"></span>
                                        Central Hong Kong Location
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-2 h-2 bg-plum rounded-full mr-3"></span>
                                        Limited to 20 guests per event
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-2 h-2 bg-plum rounded-full mr-3"></span>
                                        Dress code: Creative Elegance
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-2 h-2 bg-plum rounded-full mr-3"></span>
                                        Reservations required 48h in advance
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}