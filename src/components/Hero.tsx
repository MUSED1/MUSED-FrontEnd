import { useState, useEffect, useRef } from 'react'

export function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [scrollY, setScrollY] = useState(0)
    // El guion bajo indica que esta variable no se usa intencionalmente
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })

    const sectionRef = useRef<HTMLElement>(null)

    const images = [
        "https://res.cloudinary.com/dapfjngt2/image/upload/v1778392270/mused_hero_mzehsb.png"
    ]

    // Event date: October 23, 2025 at 19:00
    const eventDate = new Date('2025-11-18T19:00:00').getTime()

    // Countdown timer
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime()
            const difference = eventDate - now

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000)
                })
            }
        }

        const timer = setInterval(calculateTimeLeft, 1000)
        calculateTimeLeft()

        return () => clearInterval(timer)
    }, [eventDate])

    // Auto-slide functionality
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % images.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [images.length])

    // Scroll listener for parallax fade-up effect
    useEffect(() => {
        const handleScroll = () => {
            if (sectionRef.current) {
                const rect = sectionRef.current.getBoundingClientRect()
                const scrolled = -rect.top
                setScrollY(Math.max(0, scrolled))
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const goToSlide = (index: number) => {
        setCurrentSlide(index)
    }

    // Derive opacity and translateY from scroll position
    const sectionHeight = sectionRef.current?.offsetHeight || window.innerHeight
    const progress = Math.min(scrollY / (sectionHeight * 0.5), 1) // fades out over first 50% of scroll
    const opacity = 1 - progress
    const translateY = scrollY * 0.4 // moves up at 40% of scroll speed

    return (
        <section ref={sectionRef} className="relative h-screen bg-[#fff0c8] w-full overflow-hidden font-amandine">
            {/* Full-width Image Background */}
            <div className="absolute inset-0 w-full h-full">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                            index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <img
                            src={image}
                            alt={`Fashion model wearing Mused collection - Look ${index + 1}`}
                            className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-black/30"></div>
                    </div>
                ))}
            </div>

            {/* Text Content - Left-aligned Over Image */}
            <div className="relative container mx-auto h-full px-4 flex flex-col items-start justify-center z-10">
                <div
                    className="max-w-3xl"
                    style={{
                        opacity,
                        transform: `translateY(-${translateY}px)`,
                        willChange: 'opacity, transform',
                    }}
                >
                    <div className="inline-flex flex-col items-center mb-6">
                        <h1 className="text-8xl md:text-9xl lg:text-[10rem] font-amandine text-cream tracking-tight drop-shadow-2xl text-left">
                            MUSED
                        </h1>
                        <span className="text-xl tracking-widest text-cream font-kaldera opacity-80 -mt-2">
                            852
                        </span>
                    </div>

                    <div className="space-y-4">
                        <p className="text-cream text-xl md:text-2xl lg:text-3xl font-light max-w-3xl drop-shadow-lg text-left">
                            A members-only shared wardrobe. Because your next favorite piece already exists.
                        </p>
                    </div>
                </div>
            </div>

            {/* Animated Dots Indicator */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2 z-10">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-2 rounded-full transform transition-all duration-500 ${
                            currentSlide === index
                                ? 'w-8 bg-gold scale-125'
                                : 'w-2 bg-cream/60 hover:bg-cream'
                        }`}
                    />
                ))}
            </div>
        </section>
    )
}