import { Button } from './Button'

export function BrandStory() {
    return (
        <section className="py-20 bg-gradient-to-br from-cream to-amber-50 w-full overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Text Content */}
                    <div className="w-full lg:w-1/2">
                        <div className="max-w-2xl">
                            <div className="inline-block mb-4">
                                <span className="text-gold font-semibold text-sm uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-gold/20">
                                    Our Journey
                                </span>
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-plum transform transition-all duration-700 ease-out hover:translate-x-3 hover:text-gold">
                                Our <span className="text-gold italic">Story</span>
                            </h2>

                            <div className="space-y-6">
                                <p className="text-plum/80 text-lg leading-relaxed transform transition-all duration-500 delay-100 hover:translate-x-2 hover:text-plum bg-white/50 p-4 rounded-xl border-l-4 border-gold font-amandine">
                                    First we arrived in HK: We arrived in Hk, one suitcase in hand, living in a tiny 6² room
                                    we borrowed everything from friends & we weren't the only ones!
                                    Then, we saw the coolest fits. We realized there were so many hidden gems tucked away in closets
                                    so many stylish girls walking down the streets. We Were Mused!
                                </p>

                                <p className="text-plum/80 text-lg leading-relaxed transform transition-all duration-500 delay-200 hover:translate-x-2 hover:text-plum bg-white/50 p-4 rounded-xl border-l-4 border-plum font-amandine">
                                    So we decided to create Mused- We wanted to create a space where this inspiration was shared.
                                    A place where people could rent, lend, and inspire each other. Together let's create an augmented wardrobe built YOU, for YOU!
                                </p>
                            </div>

                            <div className="mt-8 transform transition-all duration-500 delay-300 hover:scale-105 hover:translate-x-2">
                                <Button variant="primary" className="group">
                                    <span className="flex items-center gap-2 font-amandine">
                                        Learn More
                                        <svg className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Single Image with Enhanced Styling */}
                    <div className="w-full lg:w-1/2">
                        <div className="relative group">
                            {/* Background Decoration */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-gold/20 to-plum/20 rounded-2xl transform rotate-2 group-hover:rotate-3 transition-all duration-700 ease-in-out"></div>
                            <div className="absolute -inset-2 bg-white/50 rounded-xl transform -rotate-1 group-hover:-rotate-2 transition-all duration-500 ease-in-out"></div>

                            {/* Main Image Container */}
                            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl transform transition-all duration-700 ease-out group-hover:scale-105 group-hover:rotate-1 group-hover:shadow-2xl border-8 border-white shadow-xl">
                                <img
                                    src="/t1.jpg"
                                    alt="Mused atelier - Fashion inspiration and clothing rental"
                                    className="w-full h-full object-cover transform transition-all duration-800 ease-in-out group-hover:scale-110"
                                />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-plum/20 via-transparent to-gold/10 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                                {/* Floating Elements */}
                                <div className="absolute top-4 right-4 w-8 h-8 bg-gold rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-200"></div>
                                <div className="absolute bottom-4 left-4 w-6 h-6 bg-plum rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-300"></div>
                            </div>

                            {/* Decorative Text */}
                            <div className="absolute -bottom-6 -right-6 transform rotate-12 opacity-60">
                                <span className="text-6xl font-bold text-gold/30 select-none font-amandine">MUSED</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}