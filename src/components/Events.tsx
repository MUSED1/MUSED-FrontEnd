import { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import { Header } from './Header'
import { Footer } from './Footer' // Add this import

export function Events() {
    const [currentSlide, setCurrentSlide] = useState(0)

    const images = [
        "/events-bg.jpg", // You'll need to add this image
    ]

    // Auto-slide functionality
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % images.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [images.length])

    return (
        <div className="bg-cream">
            <Header />

            {/* Hero Section */}
            <section className="relative h-screen w-full overflow-hidden font-amandine">
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
                                alt="WSB Dinner Event"
                                className="w-full h-full object-cover object-center"
                            />
                            <div className="absolute inset-0 bg-black/40"></div>
                        </div>
                    ))}
                </div>

                {/* Left-aligned Text Content */}
                <div className="relative container mx-auto h-full px-4 flex items-center z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold text-cream mb-6 tracking-tight drop-shadow-2xl text-left">
                            WSB Dinners
                        </h1>

                        <div className="space-y-4">

                            <p className="text-cream text-xl md:text-2xl lg:text-3xl font-light drop-shadow-lg text-left max-w-2xl">
                                Experience Wearing Something Borrowed.
                            </p>

                        </div>
                    </div>
                </div>

                {/* Animated Dots Indicator */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2 z-10">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2 rounded-full transform transition-all duration-500 ${
                                currentSlide === index
                                    ? 'w-8 bg-gold scale-125'
                                    : 'w-2 bg-cream/60 hover:bg-cream'
                            }`}
                        />
                    ))}
                </div>
            </section>

            {/* Coming Soon Cities Section */}
            <section className="py-20 bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-burgundy mb-2">
                                Coming Soon
                            </h2>
                            <div className="w-24 h-1 bg-gold mx-auto"></div>
                        </div>

                        {/* Two Rectangles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Hong Kong */}
                            <div className="bg-burgundy rounded-lg p-12 shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl border-2 border-gold/20">
                                <div className="text-center space-y-4">
                                    <MapPin className="w-16 h-16 text-gold mx-auto mb-4" />
                                    <h3 className="text-5xl md:text-6xl font-bold text-gold mb-2">
                                        HK
                                    </h3>
                                    <div className="w-16 h-1 bg-gold mx-auto opacity-50"></div>
                                    <p className="text-cream text-xl md:text-2xl font-light mt-4">
                                        Coming Soon
                                    </p>
                                    <p className="text-cream/70 text-lg">
                                        Hong Kong
                                    </p>
                                </div>
                            </div>

                            {/* New York */}
                            <div className="bg-burgundy rounded-lg p-12 shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl border-2 border-gold/20">
                                <div className="text-center space-y-4">
                                    <MapPin className="w-16 h-16 text-gold mx-auto mb-4" />
                                    <h3 className="text-5xl md:text-6xl font-bold text-gold mb-2">
                                        NY
                                    </h3>
                                    <div className="w-16 h-1 bg-gold mx-auto opacity-50"></div>
                                    <p className="text-cream text-xl md:text-2xl font-light mt-4">
                                        Coming Soon
                                    </p>
                                    <p className="text-cream/70 text-lg">
                                        New York
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* More cities to be announced */}
                        <div className="text-center mt-12">
                            <p className="text-burgundy/70 text-lg">
                                More cities to be announced
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How To Receive Your Invitation Section */}
            {/* How To Receive Your Invitation Section - MODIFIED with darker gradient */}
            <section className="py-16 bg-cream w-full">
                <div className="container mx-auto px-4">
                    {/* Title with same style as Coming Soon */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-burgundy mb-2">
                            HOW TO RECEIVE YOUR INVITATION
                        </h2>
                        <div className="w-24 h-1 bg-gold mx-auto"></div>
                    </div>

                    {/* 2x3 Grid - All with darker gradient overlay style */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-10">
                        {/* 1. Image - Upload */}
                        <div className="relative h-80 overflow-hidden group rounded-lg shadow-xl">
                            <img
                                src="/upload-image.jpg"
                                alt="Upload your items"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-burgundy/95 via-burgundy/70 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-cream">
                                <span className="text-gold font-bold text-lg">01</span>
                            </div>
                        </div>

                        {/* 2. Text - Upload */}
                        <div className="relative h-80 overflow-hidden group rounded-lg shadow-xl">
                            <img
                                src="/upload-image.jpg"
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-burgundy/95 via-burgundy/80 to-burgundy/30"></div>

                            <div className="absolute inset-0 flex flex-col justify-center px-8">
                                <div className="text-cream space-y-3">
                                    <span className="text-gold font-bold text-lg">01</span>
                                    <h3 className="text-2xl md:text-3xl font-bold text-gold">DATE: Upload</h3>
                                    <p className="text-cream text-base md:text-lg leading-relaxed">
                                        Upload 2 items you are willing to borrow on the website by completing the form.
                                    </p>
                                </div>
                            </div>

                            <div className="absolute bottom-4 left-4 text-cream">
                                <span className="text-gold font-bold text-lg">01</span>
                            </div>
                        </div>

                        {/* 3. Text - Choose */}
                        <div className="relative h-80 overflow-hidden group rounded-lg shadow-xl md:order-3">
                            <img
                                src="/choose-image.jpg"
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-burgundy/95 via-burgundy/80 to-burgundy/30"></div>

                            <div className="absolute inset-0 flex flex-col justify-center px-8">
                                <div className="text-cream space-y-3">
                                    <span className="text-gold font-bold text-lg">02</span>
                                    <h3 className="text-2xl md:text-3xl font-bold text-gold">DATE: Choose</h3>
                                    <p className="text-cream text-base md:text-lg leading-relaxed">
                                        Choose the item you want to wear at dinner & Receive it at your door!
                                    </p>
                                </div>
                            </div>

                            <div className="absolute bottom-4 left-4 text-cream">
                                <span className="text-gold font-bold text-lg">02</span>
                            </div>
                        </div>

                        {/* 4. Image - Choose */}
                        <div className="relative h-80 overflow-hidden group rounded-lg shadow-xl md:order-4">
                            <img
                                src="/choose-image.jpg"
                                alt="Choose your item"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-burgundy/95 via-burgundy/70 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-cream">
                                <span className="text-gold font-bold text-lg">02</span>
                            </div>
                        </div>

                        {/* 5. Image - Wear */}
                        <div className="relative h-80 overflow-hidden group rounded-lg shadow-xl md:order-5">
                            <img
                                src="/dinner-image.jpg"
                                alt="Dinner experience"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-burgundy/95 via-burgundy/70 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-cream">
                                <span className="text-gold font-bold text-lg">03</span>
                            </div>
                        </div>

                        {/* 6. Text - Wear */}
                        <div className="relative h-80 overflow-hidden group rounded-lg shadow-xl md:order-6">
                            <img
                                src="/dinner-image.jpg"
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-burgundy/95 via-burgundy/80 to-burgundy/30"></div>

                            <div className="absolute inset-0 flex flex-col justify-center px-8">
                                <div className="text-cream space-y-3">
                                    <span className="text-gold font-bold text-lg">03</span>
                                    <h3 className="text-2xl md:text-3xl font-bold text-gold">DATE: Wear Something Borrowed</h3>
                                    <p className="text-cream text-base md:text-lg leading-relaxed">
                                        & See you at dinner!
                                    </p>
                                </div>
                            </div>

                            <div className="absolute bottom-4 left-4 text-cream">
                                <span className="text-gold font-bold text-lg">03</span>
                            </div>
                        </div>
                    </div>

                    {/* See you there! Text - Sin rectángulo */}
                    <div className="flex justify-center">
                        <div className="text-center">
                            <p className="text-burgundy text-2xl md:text-3xl font-bold mb-1">See you there!</p>
                            <p className="text-burgundy/80 text-xl md:text-2xl font-medium">Eva & Jana</p>
                        </div>
                    </div>
                </div>
            </section>
            {/* Add Footer */}
            <Footer />
        </div>
    )
}