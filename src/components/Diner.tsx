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

                    {/* Event Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        {/* Event 1 */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                            <div className="aspect-video bg-gradient-to-r from-plum to-gold"></div>
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-plum mb-2">Seasonal Showcase</h3>
                                <p className="text-plum/70 mb-4">
                                    An intimate dinner featuring our latest seasonal collection with live styling sessions.
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="text-gold font-semibold">$120 per person</span>
                                    <button className="bg-plum text-cream px-6 py-2 rounded-full hover:bg-gold transition-all duration-300">
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Event 2 */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                            <div className="aspect-video bg-gradient-to-r from-gold to-plum"></div>
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-plum mb-2">Designer Night</h3>
                                <p className="text-plum/70 mb-4">
                                    Meet emerging designers and be the first to experience their exclusive collections.
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="text-gold font-semibold">$150 per person</span>
                                    <button className="bg-plum text-cream px-6 py-2 rounded-full hover:bg-gold transition-all duration-300">
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Event 3 */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                            <div className="aspect-video bg-gradient-to-r from-plum to-amber-200"></div>
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-plum mb-2">VIP Closet Exchange</h3>
                                <p className="text-plum/70 mb-4">
                                    Bring your pre-loved pieces and swap with other fashion enthusiasts in our community.
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="text-gold font-semibold">Members Only</span>
                                    <button className="bg-plum text-cream px-6 py-2 rounded-full hover:bg-gold transition-all duration-300">
                                        Learn More
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

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