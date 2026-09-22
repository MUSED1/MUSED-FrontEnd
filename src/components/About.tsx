// components/About.tsx
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { Header } from './Header'
import { Footer } from './Footer'

const STATS = [
    { value: '500+', label: 'Community members' },
    { value: '3', label: 'Cities — HK, NY, London' },
    { value: '1', label: 'Suitcase each, to start' },
]

export function About() {
    return (
        <div className="bg-white font-sans">
            <Header />

            {/* ============================================================ */}
            {/* MASTHEAD — full-bleed opening moment                          */}
            {/* ============================================================ */}
            <section className="relative flex h-screen min-h-[560px] w-full items-end overflow-hidden">
                <img
                    src="/clothe27.jpg"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-[center_25%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-plum-dark via-plum-dark/40 to-plum-dark/10" />

                <div className="container relative z-10 mx-auto px-4 pb-16 sm:pb-20">
                    <span className="text-xs uppercase tracking-label text-cream/60">
                        MUSED 852 — Our Story
                    </span>
                    <div className="my-5 h-px w-9 bg-[#C9A96E]" />
                    <h1 className="font-kaldera text-cream" style={{ fontSize: 'clamp(40px, 8vw, 96px)', lineHeight: 1.02 }}>
                        A marketplace
                        <br />
                        for <span className="italic">rising brands.</span>
                    </h1>
                    <p className="mt-6 max-w-md font-sans italic text-cream/70 sm:text-lg">
                        The best brands shouldn't have to be the biggest.
                    </p>
                </div>

                <div className="absolute bottom-6 right-6 z-10 text-cream/60 sm:right-10">
                    <ArrowDown size={20} className="animate-bounce" />
                </div>
            </section>

            {/* ============================================================ */}
            {/* MANIFESTO — a pause, plumDeep, nothing but type               */}
            {/* ============================================================ */}
            <section className="w-full bg-plum-dark px-4 py-24 sm:py-32">
                <div className="container mx-auto max-w-3xl text-center">
                    <p className="font-amandine font-normal text-cream" style={{ fontSize: 'clamp(28px, 5vw, 44px)', lineHeight: 1.3 }}>
                        No endless listings. No noise.
                        <br />
                        Just the good stuff — hand-picked, personal and trusted.
                    </p>
                    <div className="mx-auto my-8 h-px w-9 bg-[#C9A96E]" />
                    <p className="font-sans text-lg italic text-cream/60">
                        You find it. You fall for it. You get MUSED.
                    </p>
                </div>
            </section>

            {/* ============================================================ */}
            {/* CHAPTER 01 — Who We Are Today                                 */}
            {/* ============================================================ */}
            <section className="w-full bg-cream px-4 py-20 sm:py-28">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <div className="order-2 lg:order-1">
                            <span className="font-kaldera text-sm text-plum/40">01</span>
                            <h2 className="mt-3 font-kaldera text-4xl text-plum-dark sm:text-5xl" style={{ lineHeight: 1.1 }}>
                                The <span className="italic">roommate</span> you wish you had
                            </h2>
                            <p className="mt-6 max-w-lg leading-relaxed text-plum/70">
                                Today, MUSED is the roommate you wish you had — the one whose closet
                                you'd raid, whose taste you trust, and who always knows where to find
                                the good stuff.
                            </p>

                            <div className="mt-10 space-y-6 border-t border-plum-dark/10 pt-6">
                                {[
                                    { title: 'She hosts', body: 'Dinners and community events across Hong Kong, New York and London.' },
                                    { title: 'She styles', body: 'Personalised outfit inspiration that feels more like advice from a friend than an algorithm.' },
                                    { title: 'She sources', body: "The best rising brands and pieces, hand-picked so you don't have to search for them." },
                                ].map((item, i) => (
                                    <div key={item.title} className="flex gap-4">
                                        <span className="font-kaldera text-sm text-plum/30">0{i + 1}</span>
                                        <div>
                                            <h3 className="font-kaldera text-lg text-plum-dark">{item.title}</h3>
                                            <p className="mt-1 text-sm leading-relaxed text-plum/60">{item.body}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="order-1 aspect-[4/5] overflow-hidden rounded-3xl lg:order-2">
                            <img src="/dress4.jpg" alt="" className="h-full w-full object-cover" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* CHAPTER 02 — Where It Started                                 */}
            {/* ============================================================ */}
            <section className="w-full bg-white px-4 py-20 sm:py-28">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <div className="aspect-[4/5] overflow-hidden rounded-3xl">
                            <img src="/t1.jpg" alt="" className="h-full w-full object-cover" />
                        </div>

                        <div>
                            <span className="font-kaldera text-sm text-plum/40">02</span>
                            <h2 className="mt-3 font-kaldera text-4xl text-plum-dark sm:text-5xl" style={{ lineHeight: 1.1 }}>
                                Where it <span className="italic">started</span>
                            </h2>

                            <div className="mt-6 space-y-5">
                                <p className="leading-relaxed text-plum/70">
                                    We arrived in Hong Kong with one suitcase each, living in a tiny
                                    room, borrowing everything from friends — and we weren't the only
                                    ones. We noticed hidden gems tucked away in closets and girls with
                                    incredible style walking the streets. We were MUSED.
                                </p>
                                <p className="leading-relaxed text-plum/70">
                                    So we created MUSED: a space to rent, lend and inspire. We tested
                                    the idea through dinners. People uploaded pieces they'd lend,
                                    guests chose what to wear, and we personally delivered every piece
                                    before the night.
                                </p>
                                <p className="leading-relaxed text-plum/70">
                                    From there, a community of 500+ grew across Hong Kong, New York
                                    and London. And we learned something: people weren't just looking
                                    for clothes. They were looking for connection, uniqueness and
                                    meaning.
                                </p>
                            </div>

                            <p className="mt-8 font-amandine font-normal text-3xl text-burgundy">
                                That was the real luxury.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* STATS — plain typographic numbers                             */}
            {/* ============================================================ */}
            <section className="w-full bg-cream px-4 py-16">
                <div className="container mx-auto max-w-4xl">
                    <div className="grid grid-cols-1 divide-y divide-plum-dark/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                        {STATS.map((stat) => (
                            <div key={stat.label} className="px-4 py-8 text-center first:pt-0 sm:py-0">
                                <div className="font-kaldera text-5xl text-plum-dark">{stat.value}</div>
                                <div className="mt-2 text-sm text-plum/50">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* CLOSE — invitation                                            */}
            {/* ============================================================ */}
            <section className="w-full bg-white px-4 pb-24 pt-8 text-center">
                <h2 className="font-amandine font-normal text-4xl text-plum-dark sm:text-5xl">
                    Ready to get MUSED?
                </h2>
                <div className="mx-auto my-6 h-px w-9 bg-[#C9A96E]" />

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <div className="rounded-full shadow-[0_8px_16px_rgba(61,16,40,0.18)]">
                        <Link
                            to="/signup"
                            className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/15 bg-gradient-to-b from-plum-dark to-plum px-8 py-4 text-base font-normal text-cream transition-all duration-200 hover:brightness-110"
                        >
                            Join the community
                            <ArrowUpRight size={16} />
                        </Link>
                    </div>
                    <Link
                        to="/collections-hk"
                        className="text-sm text-plum/60 transition-colors hover:text-plum-dark"
                    >
                        Or browse the collection
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    )
}
