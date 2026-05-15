import { useState, useEffect, useRef } from 'react'

// Shuffles an array of indices randomly
function shuffleIndices(length: number): number[] {
    const arr = Array.from({ length }, (_, i) => i)
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

// Hook: reveals tokens (chars or words) one-by-one in random order, each fading in
function useRandomReveal(count: number, intervalMs = 120, startDelay = 0) {
    const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set())
    const [done, setDone] = useState(false)

    useEffect(() => {
        setVisibleIndices(new Set())
        setDone(false)

        const order = shuffleIndices(count)
        let step = 0
        let timeoutId: ReturnType<typeof setTimeout>
        let intervalId: ReturnType<typeof setInterval>

        timeoutId = setTimeout(() => {
            intervalId = setInterval(() => {
                if (step >= order.length) {
                    clearInterval(intervalId)
                    setDone(true)
                    return
                }
                const idx = order[step]
                setVisibleIndices(prev => new Set(prev).add(idx))
                step++
            }, intervalMs)
        }, startDelay)

        return () => {
            clearTimeout(timeoutId)
            clearInterval(intervalId)
        }
    }, [count, intervalMs, startDelay])

    return { visibleIndices, done }
}

// Timing (all slowed down):
// MUSED:   5 chars  × 160ms apart, fade 1.1s  — starts at 400ms  → done ≈ 1200ms
// 852:     3 chars  × 200ms apart, fade 1.4s  — starts at 1400ms → done ≈ 2000ms
// tagline: 12 words × 140ms apart, fade 1.2s  — starts at 2300ms

const MUSED_INTERVAL   = 160
const MUSED_DELAY      = 400
const SUB_INTERVAL     = 200
const SUB_DELAY        = 1400
const TAGLINE_INTERVAL = 140
const TAGLINE_DELAY    = 2300

const TAGLINE = 'Your trusted shared wardrobe. Because your favorite piece already exists.'
const TAGLINE_WORDS = TAGLINE.split(' ')

export function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [scrollY, setScrollY] = useState(0)
    const sectionRef = useRef<HTMLElement>(null)

    const mobileImage  = "https://res.cloudinary.com/dapfjngt2/image/upload/v1778469118/phone_image_kklqsh.png"
    const desktopImage = "https://res.cloudinary.com/dapfjngt2/image/upload/v1778469118/laptop_image_hdlgre.png"

    // Random-reveal for MUSED (5 chars)
    const { visibleIndices: musedVisible } = useRandomReveal(5, MUSED_INTERVAL, MUSED_DELAY)

    // Random-reveal for 852 (3 chars)
    const { visibleIndices: subVisible } = useRandomReveal(3, SUB_INTERVAL, SUB_DELAY)

    // Random-reveal for tagline words
    const { visibleIndices: taglineVisible } =
        useRandomReveal(TAGLINE_WORDS.length, TAGLINE_INTERVAL, TAGLINE_DELAY)

    // Scroll parallax
    useEffect(() => {
        const handleScroll = () => {
            if (sectionRef.current) {
                const rect = sectionRef.current.getBoundingClientRect()
                setScrollY(Math.max(0, -rect.top))
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const sectionHeight = sectionRef.current?.offsetHeight || window.innerHeight
    const progress   = Math.min(scrollY / (sectionHeight * 0.5), 1)
    const opacity    = 1 - progress
    const translateY = scrollY * 0.4

    return (
        <section ref={sectionRef} className="relative h-screen bg-cream w-full overflow-hidden">
            <style>{`
                @keyframes fadeInToken {
                    0%   { opacity: 0; filter: blur(8px); transform: translateY(4px); }
                    100% { opacity: 1; filter: blur(0px); transform: translateY(0px); }
                }
                .token {
                    display: inline-block;
                    opacity: 0;
                }
                /* MUSED chars: 1.1s fade */
                .token-mused.visible {
                    animation: fadeInToken 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
                /* 852 chars: slower, 1.4s fade */
                .token-sub.visible {
                    animation: fadeInToken 1.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
                /* Tagline words: 1.2s fade */
                .token-tag.visible {
                    animation: fadeInToken 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
            `}</style>

            {/* Responsive Background Image */}
            <div className="absolute inset-0 w-full h-full">
                <img
                    src={mobileImage}
                    alt="Mused collection - mobile"
                    className="block md:hidden w-full h-full object-cover object-center"
                />
                <img
                    src={desktopImage}
                    alt="Mused collection - desktop"
                    className="hidden md:block w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/25" />
            </div>

            {/* HK — NY — LDN */}
            <div className="absolute top-6 right-6 z-20">
                <span
                    className="font-abril text-[15px] uppercase"
                    style={{ color: '#FFF0C8', letterSpacing: '0.27em' }}
                >
                    HK — NY — LDN
                </span>
            </div>

            {/* Centered Text Content */}
            <div className="relative h-full flex flex-col items-center justify-center z-10 px-4 text-center">
                <div
                    style={{
                        opacity,
                        transform: `translateY(-${translateY}px)`,
                        willChange: 'opacity, transform',
                    }}
                >
                    <div className="inline-flex flex-col items-center mb-6">

                        {/* MUSED — random char reveal */}
                        <h1
                            className="font-kaldera tracking-tight drop-shadow-2xl"
                            style={{
                                color: '#FFF0C8',
                                fontSize: 'clamp(68px, 12vw, 111px)',
                                lineHeight: 1,
                            }}
                        >
                            {'MUSED'.split('').map((char, i) => (
                                <span
                                    key={i}
                                    className={`token token-mused${musedVisible.has(i) ? ' visible' : ''}`}
                                >
                                    {char}
                                </span>
                            ))}
                        </h1>

                        {/* 852 — random char reveal, slower */}
                        <span
                            className="font-kaldera opacity-80 -mt-2"
                            style={{
                                color: '#FFF0C8',
                                fontSize: 'clamp(52px, 9vw, 90px)',
                                lineHeight: 1,
                            }}
                        >
                            {'852'.split('').map((char, i) => (
                                <span
                                    key={i}
                                    className={`token token-sub${subVisible.has(i) ? ' visible' : ''}`}
                                >
                                    {char}
                                </span>
                            ))}
                        </span>
                    </div>

                    {/* Tagline — random word reveal */}
                    <p
                        className="font-abril max-w-2xl drop-shadow-lg"
                        style={{
                            color: '#FFF0C8',
                            fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                            fontStyle: 'italic',
                            minHeight: '3em',
                            lineHeight: 1.6,
                        }}
                    >
                        {TAGLINE_WORDS.map((word, i) => (
                            <span key={i}>
                                <span
                                    className={`token token-tag${taglineVisible.has(i) ? ' visible' : ''}`}
                                >
                                    {word}
                                </span>
                                {i < TAGLINE_WORDS.length - 1 ? ' ' : ''}
                            </span>
                        ))}
                    </p>
                </div>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2 z-10">
                <button
                    onClick={() => setCurrentSlide(0)}
                    className={`h-2 rounded-full transform transition-all duration-500 ${
                        currentSlide === 0
                            ? 'w-8 bg-cream scale-125'
                            : 'w-2 bg-cream/60 hover:bg-cream'
                    }`}
                />
            </div>
        </section>
    )
}