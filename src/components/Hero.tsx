import { useState, useEffect, useRef } from 'react'

export function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [scrollY, setScrollY] = useState(0)

    const sectionRef = useRef<HTMLElement>(null)

    const mobileImage = "https://res.cloudinary.com/dapfjngt2/image/upload/v1778469118/phone_image_kklqsh.png"
    const desktopImage = "https://res.cloudinary.com/dapfjngt2/image/upload/v1778469118/laptop_image_hdlgre.png"

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

    // Derive opacity and translateY from scroll position
    const sectionHeight = sectionRef.current?.offsetHeight || window.innerHeight
    const progress = Math.min(scrollY / (sectionHeight * 0.5), 1)
    const opacity = 1 - progress
    const translateY = scrollY * 0.4

    return (
        <section ref={sectionRef} className="relative h-screen bg-[#fff0c8] w-full overflow-hidden">
            {/* Responsive Background Image */}
            <div className="absolute inset-0 w-full h-full">
                {/* Mobile image */}
                <img
                    src={mobileImage}
                    alt="Mused collection - mobile"
                    className="block md:hidden w-full h-full object-cover object-center"
                />
                {/* Desktop image */}
                <img
                    src={desktopImage}
                    alt="Mused collection - desktop"
                    className="hidden md:block w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/25" />
            </div>

            {/* HK - NY - LDN — top right */}
            <div className="absolute top-6 right-6 z-20">
                <span
                    className="font-kaldera tracking-[0.25em] text-sm"
                    style={{ color: '#FFF0C8' }}
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
                        <h1
                            className="text-8xl md:text-9xl lg:text-[10rem] font-kaldera tracking-tight drop-shadow-2xl"
                            style={{ color: '#FFF0C8' }}
                        >
                            MUSED
                        </h1>
                        <span
                            className="text-xl tracking-widest font-kaldera opacity-80 -mt-2"
                            style={{ color: '#FFF0C8' }}
                        >
                            852
                        </span>
                    </div>

                    <p
                        className="text-xl md:text-2xl lg:text-3xl font-light max-w-2xl drop-shadow-lg font-kaldera"
                        style={{ color: '#FFF0C8' }}
                    >
                        A members-only shared wardrobe. Because your next favorite piece already exists.
                    </p>
                </div>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2 z-10">
                <button
                    onClick={() => setCurrentSlide(0)}
                    className={`h-2 rounded-full transform transition-all duration-500 ${
                        currentSlide === 0
                            ? 'w-8 bg-gold scale-125'
                            : 'w-2 bg-[#FFF0C8]/60 hover:bg-[#FFF0C8]'
                    }`}
                />
            </div>
        </section>
    )
}