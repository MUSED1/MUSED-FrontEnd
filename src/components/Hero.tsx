import  { useState, useEffect } from 'react'
import { Button } from './Button'

export function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })

    const images = [
        "/first.jpg",
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
        calculateTimeLeft() // Initial call

        return () => clearInterval(timer)
    }, [eventDate])

    // Auto-slide functionality
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % images.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [images.length])

    const goToSlide = (index: number) => {
        setCurrentSlide(index)
    }

    return (
        <section className="relative h-[80vh] bg-[#fff0c8] w-full overflow-hidden font-amandine">
            <div className="container mx-auto h-full px-4 flex flex-col md:flex-row items-center">
                {/* Text Content */}
                <div className="w-full md:w-1/2 z-10 pt-16 md:pt-0">
                    <h2 className="text-4xl md:text-6xl font-bold text-plum mb-4 transform transition-all duration-1000 ease-out hover:translate-x-4 hover:text-burgundy">
                        First <span className="text-burgundy transform transition-all duration-700 hover:text-gold hover:scale-110">Night</span>
                    </h2>
                    <p className="text-plum/80 text-lg md:text-xl mb-8 max-w-md transform transition-all duration-700 delay-200 hover:translate-x-2 hover:text-plum leading-relaxed">
                        Browse the collection Claim your look. Then join us for night one -the first gathering where this idea comes to life.An evening where style circulates. connections form and you witness the concept become reality
                    </p>

                    {/* Minimalistic Countdown Timer */}
                    <div className="mb-8 transform transition-all duration-700 delay-300">
                        <h1 className="text-2xl md:text-3xl font-bold text-plum mb-4 transform transition-all duration-1000 ease-out hover:translate-x-2 tracking-tight">
                            {timeLeft.days}d : {timeLeft.hours}h : {timeLeft.minutes}m : {timeLeft.seconds}s
                        </h1>
                    </div>

                    <div className="flex space-x-4 transform transition-all duration-700 delay-300">
                        <Button variant="primary" className="transform transition-all duration-300 hover:scale-110 hover:shadow-2xl font-amandine">
                            Reserve Now
                        </Button>
                        <Button variant="secondary" className="transform transition-all duration-300 hover:scale-110 hover:shadow-2xl font-amandine">
                            View Lookbook
                        </Button>
                    </div>
                </div>

                {/* Image Carousel Section */}
                <div className="w-full md:w-1/2 h-full relative mt-8 md:mt-0">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 h-4/5 w-full md:w-11/12">
                        {/* Carousel Container */}
                        <div className="relative h-full w-full overflow-hidden rounded-lg">
                            {/* Images */}
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 h-full w-full transform transition-all duration-1000 ease-in-out ${
                                        index === currentSlide
                                            ? 'opacity-100 scale-100'
                                            : 'opacity-0 scale-105'
                                    }`}
                                >
                                    <img
                                        src={image}
                                        alt={`Fashion model wearing Mused collection - Look ${index + 1}`}
                                        className="h-full w-full object-cover object-center transform transition-all duration-1000 ease-in-out hover:scale-110 hover:rotate-1"
                                    />
                                    <div className="absolute inset-0 bg-burgundy opacity-10 transform transition-all duration-700 hover:opacity-5"></div>
                                </div>
                            ))}
                        </div>

                        {/* Floating elements */}
                        <div className="absolute -top-4 -left-4 w-8 h-8 bg-gold rounded-full opacity-40 animate-float z-10"></div>
                        <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-plum/30 rounded-full opacity-50 animate-float-delayed z-10"></div>
                    </div>
                </div>
            </div>

            {/* Animated Dots Indicator */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-2 rounded-full transform transition-all duration-500 ${
                            currentSlide === index
                                ? 'w-8 bg-burgundy scale-125'
                                : 'w-2 bg-plum/40 hover:bg-plum/60'
                        }`}
                    />
                ))}
            </div>
        </section>
    )
}