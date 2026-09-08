import { Button } from './Button'

export function BrandStory() {
    return (
        <div className="w-full">
            {/* 01 — OUR STORY */}
            <section className="py-20 bg-cream-clear w-full overflow-hidden" style={{ backgroundColor: '#fff9e6' }}>
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        {/* Text Content */}
                        <div className="w-full lg:w-1/2">
                            <div className="max-w-2xl">

                                {/* Label */}
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
                                        01 — Our Story
                                    </span>
                                </div>

                                {/* Title */}
                                <h2
                                    className="font-kaldera mb-8 transform transition-all duration-700 ease-out hover:translate-x-3"
                                    style={{
                                        fontSize: '48px',
                                        color: '#5B1B3A',
                                        lineHeight: 1.1,
                                    }}
                                >
                                    Where It <span style={{ fontStyle: 'italic' }}>Started</span>
                                </h2>

                                {/* Body */}
                                <div className="space-y-6">
                                    <p
                                        className="font-sans text-lg leading-relaxed transform transition-all duration-500 delay-100 hover:translate-x-2 p-4 rounded-xl"
                                        style={{
                                            color: 'rgba(91,27,58,0.8)',
                                            backgroundColor: 'rgba(255,255,255,0.5)',
                                            borderLeft: '4px solid #5B1B3A',
                                        }}
                                    >
                                        We arrived in Hong Kong with one suitcase each, living in a tiny room, borrowing everything from friends — and we weren't the only ones. We noticed hidden gems tucked away in closets and girls with incredible style walking the streets. We were MUSED.
                                    </p>

                                    <p
                                        className="font-sans text-lg leading-relaxed transform transition-all duration-500 delay-200 hover:translate-x-2 p-4 rounded-xl"
                                        style={{
                                            color: 'rgba(91,27,58,0.8)',
                                            backgroundColor: 'rgba(255,255,255,0.5)',
                                            borderLeft: '4px solid #3D1028',
                                        }}
                                    >
                                        So we created MUSED: a space to rent, lend and inspire. We tested the idea through dinners. People uploaded pieces they'd lend, guests chose what to wear, and we personally delivered every piece before the night.
                                    </p>

                                    <p
                                        className="font-sans text-lg leading-relaxed transform transition-all duration-500 delay-300 hover:translate-x-2 p-4 rounded-xl"
                                        style={{
                                            color: 'rgba(91,27,58,0.8)',
                                            backgroundColor: 'rgba(255,255,255,0.5)',
                                            borderLeft: '4px solid #7A2B50',
                                        }}
                                    >
                                        From there, a community of 500+ grew across Hong Kong, New York and Geneva. And we learned something: people weren't just looking for clothes. They were looking for connection, uniqueness and meaning.
                                    </p>
                                </div>

                                {/* Hand note: breathes on its own */}
                                <p
                                    className="font-abril mt-8"
                                    style={{
                                        color: '#6B0202',
                                        fontSize: '28px',
                                        lineHeight: 1.3,
                                        fontStyle: 'italic',
                                    }}
                                >
                                    That was the real luxury.
                                </p>
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

                                {/* Decorative Text */}
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

            {/* 02 — WHO WE ARE TODAY */}
            <section className="py-20 w-full overflow-hidden" style={{ backgroundColor: '#FFF0C8' }}>
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <div className="inline-block mb-4">
                            <span
                                className="font-abril text-[15px] uppercase border rounded-full px-3 py-1"
                                style={{
                                    color: '#5B1B3A',
                                    letterSpacing: '0.2em',
                                    borderColor: 'rgba(91,27,58,0.2)',
                                    backgroundColor: '#FFF0C8',
                                }}
                            >
                                02 — Who We Are Today
                            </span>
                        </div>
                        <h2
                            className="font-kaldera mb-6"
                            style={{ fontSize: 'clamp(32px, 5vw, 48px)', color: '#5B1B3A', lineHeight: 1.1 }}
                        >
                            The <span style={{ fontStyle: 'italic' }}>Roommate</span> You Wish You Had
                        </h2>
                        <p
                            className="font-sans text-lg leading-relaxed"
                            style={{ color: 'rgba(91,27,58,0.8)' }}
                        >
                            Today, MUSED is the roommate you wish you had — the one whose closet you'd raid, whose taste you trust, and who always knows where to find the good stuff.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <div
                            className="rounded-2xl p-8 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                            style={{ backgroundColor: '#fff9e6', border: '1px solid rgba(91,27,58,0.15)' }}
                        >
                            <h3 className="font-kaldera mb-3" style={{ fontSize: '24px', color: '#5B1B3A' }}>
                                She Hosts
                            </h3>
                            <p className="font-sans text-base leading-relaxed" style={{ color: 'rgba(91,27,58,0.75)' }}>
                                Dinners and community events across Hong Kong, New York, London and Geneva.
                            </p>
                        </div>

                        <div
                            className="rounded-2xl p-8 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                            style={{ backgroundColor: '#fff9e6', border: '1px solid rgba(91,27,58,0.15)' }}
                        >
                            <h3 className="font-kaldera mb-3" style={{ fontSize: '24px', color: '#5B1B3A' }}>
                                She Styles
                            </h3>
                            <p className="font-sans text-base leading-relaxed" style={{ color: 'rgba(91,27,58,0.75)' }}>
                                Personalised outfit inspiration that feels more like advice from a friend than an algorithm.
                            </p>
                        </div>

                        <div
                            className="rounded-2xl p-8 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                            style={{ backgroundColor: '#fff9e6', border: '1px solid rgba(91,27,58,0.15)' }}
                        >
                            <h3 className="font-kaldera mb-3" style={{ fontSize: '24px', color: '#5B1B3A' }}>
                                She Sources
                            </h3>
                            <p className="font-sans text-base leading-relaxed" style={{ color: 'rgba(91,27,58,0.75)' }}>
                                The best rising brands and pieces, hand-picked so you don't have to search for them.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 03 — THE VISION */}
            <section className="py-20 w-full overflow-hidden" style={{ backgroundColor: '#3D1028' }}>
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="inline-block mb-4">
                            <span
                                className="font-abril text-[15px] uppercase border rounded-full px-3 py-1"
                                style={{
                                    color: '#FFF0C8',
                                    letterSpacing: '0.2em',
                                    borderColor: 'rgba(255,240,200,0.3)',
                                    backgroundColor: 'transparent',
                                }}
                            >
                                03 — The Vision
                            </span>
                        </div>
                        <h2
                            className="font-kaldera mb-8"
                            style={{ fontSize: 'clamp(32px, 5vw, 48px)', color: '#FFF0C8', lineHeight: 1.1 }}
                        >
                            A Marketplace for <span style={{ fontStyle: 'italic' }}>Rising Brands</span>
                        </h2>

                        <div className="space-y-6 text-left mb-10">
                            <p className="font-sans text-lg leading-relaxed" style={{ color: 'rgba(255,240,200,0.85)' }}>
                                The best brands shouldn't have to be the biggest. MUSED is building a curated marketplace for rising designers and independent brands worth knowing.
                            </p>
                            <p className="font-sans text-lg leading-relaxed" style={{ color: 'rgba(255,240,200,0.85)' }}>
                                No endless listings. No noise. Just the good stuff — hand-picked, personal and trusted.
                            </p>
                            <p className="font-sans text-lg leading-relaxed" style={{ color: 'rgba(255,240,200,0.85)' }}>
                                For brands, it's a way to get discovered by a community already looking for what's next.
                            </p>
                        </div>

                        <p
                            className="font-abril mb-10"
                            style={{
                                color: 'rgba(255,240,200,0.9)',
                                fontSize: '28px',
                                fontStyle: 'italic',
                                lineHeight: 1.3,
                            }}
                        >
                            You find it. You fall for it. You get MUSED.
                        </p>

                        {/* CTA Button */}
                        <div className="inline-block transform transition-all duration-500 hover:scale-105">
                            <Button variant="primary" className="group" onClick={() => window.open('https://www.mused852.com/brand', '_blank', 'noopener,noreferrer')}>
                                <span
                                    className="flex items-center gap-2 font-abril uppercase"
                                    style={{ fontSize: '15px', letterSpacing: '0.2em' }}
                                >
                                    Have An Eye On Something? Know A Brand Owner You Want To Bet On?
                                    <svg className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
