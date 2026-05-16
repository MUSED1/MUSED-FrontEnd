import { Button } from './Button'

export function BrandStory() {
    return (
        <section className="py-20 bg-cream-clear w-full overflow-hidden" style={{ backgroundColor: '#fff9e6' }}>
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Text Content */}
                    <div className="w-full lg:w-1/2">
                        <div className="max-w-2xl">

                            {/* Label: Abril Display, uppercase, tracking 200, size 15 */}
                            <div className="inline-block mb-4">
                                <span
                                    className="font-abril text-[15px] uppercase border rounded-full px-3 py-1"
                                    style={{
                                        color: '#5B1B3A',
                                        letterSpacing: '0.2em',
                                        borderColor: 'rgba(91,27,58,0.2)',
                                        backgroundColor: '#fff9e6',
                                    }}
                                >
                                    Our Journey
                                </span>
                            </div>

                            {/* Title: Kaldera, one word italic */}
                            <h2
                                className="font-kaldera mb-8 transform transition-all duration-700 ease-out hover:translate-x-3"
                                style={{
                                    fontSize: '48px',
                                    color: '#5B1B3A',
                                    lineHeight: 1.1,
                                }}
                            >
                                Our <span style={{ fontStyle: 'italic' }}>Story</span>
                            </h2>

                            {/* Body: Baskerville */}
                            <div className="space-y-6">
                                <p
                                    className="font-sans text-lg leading-relaxed transform transition-all duration-500 delay-100 hover:translate-x-2 p-4 rounded-xl"
                                    style={{
                                        color: 'rgba(91,27,58,0.8)',
                                        backgroundColor: 'rgba(255,255,255,0.5)',
                                        borderLeft: '4px solid #5B1B3A',
                                    }}
                                >
                                    First we arrived in HK: We arrived in Hk, one suitcase in hand, living in a tiny 6² room
                                    we borrowed everything from friends & we weren't the only ones!
                                    Then, we saw the coolest fits. We realized there were so many hidden gems tucked away in closets
                                    so many stylish girls walking down the streets. We Were Mused!
                                </p>

                                <p
                                    className="font-sans text-lg leading-relaxed transform transition-all duration-500 delay-200 hover:translate-x-2 p-4 rounded-xl"
                                    style={{
                                        color: 'rgba(91,27,58,0.8)',
                                        backgroundColor: 'rgba(255,255,255,0.5)',
                                        borderLeft: '4px solid #3D1028',
                                    }}
                                >
                                    So we decided to create Mused- We wanted to create a space where this inspiration was shared.
                                    A place where people could rent, lend, and inspire each other. Together let's create an augmented wardrobe built YOU, for YOU!
                                </p>

                                {/* Hand note / quote: Abril Display italic, burgundy, size 36 */}
                                <p
                                    className="font-abril"
                                    style={{
                                        color: '#6B0202',
                                        fontSize: '36px',
                                        lineHeight: 1.3,
                                        fontStyle: 'italic',
                                    }}
                                >
                                    Let Your Clothes Inspire — Let Yourself Be MUSED...
                                </p>
                            </div>

                            {/* CTA Button: Abril Display, uppercase, tracking 200, size 15 */}
                            <div className="mt-8 transform transition-all duration-500 delay-300 hover:scale-105 hover:translate-x-2">
                                <Button variant="primary" className="group">
                                    <span
                                        className="flex items-center gap-2 font-abril uppercase"
                                        style={{ fontSize: '15px', letterSpacing: '0.2em' }}
                                    >
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
                            <div
                                className="absolute -inset-4 rounded-2xl transform rotate-2 group-hover:rotate-3 transition-all duration-700 ease-in-out"
                                style={{ background: 'linear-gradient(to right, rgba(91,27,58,0.2), rgba(61,16,40,0.2))' }}
                            />
                            <div className="absolute -inset-2 bg-white/50 rounded-xl transform -rotate-1 group-hover:-rotate-2 transition-all duration-500 ease-in-out" />

                            {/* Main Image Container */}
                            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl transform transition-all duration-700 ease-out group-hover:scale-105 group-hover:rotate-1 group-hover:shadow-2xl border-8 border-white shadow-xl">
                                <img
                                    src="/t1.jpg"
                                    alt="Mused atelier - Fashion inspiration and clothing rental"
                                    className="w-full h-full object-cover transform transition-all duration-800 ease-in-out group-hover:scale-110"
                                />
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
                                    style={{ background: 'linear-gradient(to top, rgba(61,16,40,0.2), transparent, rgba(91,27,58,0.1))' }}
                                />
                                <div className="absolute top-4 right-4 w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-200" style={{ backgroundColor: '#5B1B3A' }} />
                                <div className="absolute bottom-4 left-4 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-300" style={{ backgroundColor: '#3D1028' }} />
                            </div>

                            {/* Decorative Text: Kaldera, plum/30 */}
                            <div className="absolute -bottom-6 -right-6 transform rotate-12 opacity-60">
                                <span
                                    className="text-6xl font-bold select-none font-kaldera"
                                    style={{ color: 'rgba(91,27,58,0.3)' }}
                                >
                                    MUSED
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}