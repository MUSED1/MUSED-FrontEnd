import React, { useState, useEffect } from 'react'
import { Button } from './Button'

export function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0)

    // Auto-slide functionality
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % 3)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <section className="relative h-[80vh] bg-rose/20 w-full overflow-hidden">
            <div className="container mx-auto h-full px-4 flex flex-col md:flex-row items-center">
                {/* Text Content */}
                <div className="w-full md:w-1/2 z-10 pt-16 md:pt-0">
                    <h2 className="text-4xl md:text-6xl font-bold text-plum mb-4 transform transition-all duration-1000 ease-out hover:translate-x-4 hover:text-burgundy">
                        First <span className="text-burgundy transform transition-all duration-700 hover:text-gold hover:scale-110">Night</span>
                    </h2>
                    <p className="text-plum/80 text-lg md:text-xl mb-8 max-w-md transform transition-all duration-700 delay-200 hover:translate-x-2 hover:text-plum">
                        Browse the collection Claim your look. Then join us for night one -the first gathering where this idea comes to life.An evening where style circulates. connections form and you witness the concept become reality
                    </p>
                    <div className="flex space-x-4 transform transition-all duration-700 delay-300">
                        <Button variant="primary" className="transform transition-all duration-300 hover:scale-110 hover:shadow-2xl">
                            Reserve Now
                        </Button>
                        <Button variant="secondary" className="transform transition-all duration-300 hover:scale-110 hover:shadow-2xl">
                            View Lookbook
                        </Button>
                    </div>
                </div>

                {/* Image Section */}
                <div className="w-full md:w-1/2 h-full relative mt-8 md:mt-0">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 h-4/5 w-full md:w-11/12">
                        <img
                            src="src/assets/mimage.jpg"
                            alt="Fashion model wearing Mused autumn collection"
                            className="h-full w-full object-cover object-center transform transition-all duration-1000 ease-in-out hover:scale-110 hover:rotate-1"
                        />
                        <div className="absolute inset-0 bg-burgundy opacity-10 transform transition-all duration-700 hover:opacity-5"></div>

                        {/* Floating elements */}
                        <div className="absolute -top-4 -left-4 w-8 h-8 bg-gold rounded-full opacity-30 animate-float"></div>
                        <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-plum/20 rounded-full opacity-40 animate-float-delayed"></div>
                    </div>
                </div>
            </div>

            {/* Animated Dots Indicator */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
                {[0, 1, 2].map((index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transform transition-all duration-500 ${
                            currentSlide === index
                                ? 'w-8 bg-gold scale-125'
                                : 'w-2 bg-plum/30 hover:bg-plum/50'
                        }`}
                    />
                ))}
            </div>

            {/* Animated background elements */}
            <div className="absolute top-10 left-10 w-20 h-20 border-2 border-plum/10 rounded-full animate-ping-slow"></div>
            <div className="absolute bottom-20 right-20 w-16 h-16 border-2 border-burgundy/10 rounded-full animate-ping-slower"></div>
        </section>
    )
}