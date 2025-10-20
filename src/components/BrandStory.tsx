import React from 'react'
import { Button } from './Button'

export function BrandStory() {
    return (
        <section className="py-16 bg-cream w-full overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center">
                    {/* Text Content */}
                    <div className="w-full md:w-1/2 mb-10 md:mb-0 md:pr-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-plum transform transition-all duration-700 ease-out hover:translate-x-2 hover:text-gold">
                            Our Story
                        </h2>
                        <p className="text-plum/80 mb-6 leading-relaxed transform transition-all duration-500 delay-100 hover:translate-x-1 hover:text-plum">
                            First we arrived in HK: We arrived in Hk, one suitcase in hand, living in a tiny 6^2 room
                            we borrowed everything from friends & we weren’t the only ones!
                            Then, we saw the coolest fits. We realized there were so many hidden gems tucked away in closets
                            so many stylish girls walking down the streets. We Were Mused!

                        </p>
                        <p className="text-plum/80 mb-8 leading-relaxed transform transition-all duration-500 delay-200 hover:translate-x-1 hover:text-plum">
                            So we decided to create Mused- We wanted to create a space where this inspiration was shared.
                            A place where people could rent, lend, and inspire each other. Together let’s create an augmented wardrobe built YOU, for YOU!
                        </p>
                        <div className="transform transition-all duration-500 delay-300 hover:scale-105">
                            <Button variant="primary">Learn More</Button>
                        </div>
                    </div>

                    {/* Image Grid */}
                    <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
                        {/* Top Left Image */}
                        <div className="aspect-square overflow-hidden transform transition-all duration-700 ease-out hover:scale-105 hover:rotate-1 hover:shadow-2xl">
                            <img
                                src="src/assets/t1.jpg"
                            alt="Mused atelier"
                                className="w-full h-full object-cover transform transition-all duration-700 ease-in-out hover:scale-110"
                            />
                        </div>

                        {/* Top Right Image */}
                        <div className="aspect-square overflow-hidden mt-8 transform transition-all duration-700 ease-out hover:scale-105 hover:-rotate-1 hover:shadow-2xl">
                            <img
                                src="src/assets/t2.jpg"
                                alt="Fabric selection"
                                className="w-full h-full object-cover transform transition-all duration-700 ease-in-out hover:scale-110"
                            />
                        </div>

                        {/* Bottom Left Image */}
                        <div className="aspect-square overflow-hidden transform transition-all duration-700 ease-out hover:scale-105 hover:-rotate-1 hover:shadow-2xl">
                            <img
                                src="src/assets/t4.jpg"
                                alt="Design process"
                                className="w-full h-full object-cover transform transition-all duration-700 ease-in-out hover:scale-110"
                            />
                        </div>

                        {/* Bottom Right Image */}
                        <div className="aspect-square overflow-hidden mt-8 transform transition-all duration-700 ease-out hover:scale-105 hover:rotate-1 hover:shadow-2xl">
                            <img
                                src="src/assets/t5.jpg"
                                alt="Finished garment"
                                className="w-full h-full object-cover transform transition-all duration-700 ease-in-out hover:scale-110"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}