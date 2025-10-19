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
                            Founded in 2025, Mused was born from a passion for creating
                            clothing that combines contemporary aesthetics with timeless
                            elegance
                        </p>
                        <p className="text-plum/80 mb-8 leading-relaxed transform transition-all duration-500 delay-200 hover:translate-x-1 hover:text-plum">
                            kahsdlkjañhksjdhj,alhsdkjhasjdhaksjdhañs,kdh,ñ
                            ak.sdjaksjdkahsjdlkajskdjlaksjdlajlskdjlkasjd
                            askldjañsldkhjñaskdjñlaksjdñlkashf,hgsaj,ghla,jshgas
                            asldjaksjdkasjldkajlskdjlaksjdlaksjdlkasjdlkajsdkJla
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
                                src="https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
                                alt="Mused atelier"
                                className="w-full h-full object-cover transform transition-all duration-700 ease-in-out hover:scale-110"
                            />
                        </div>

                        {/* Top Right Image */}
                        <div className="aspect-square overflow-hidden mt-8 transform transition-all duration-700 ease-out hover:scale-105 hover:-rotate-1 hover:shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1605289355680-75fb41239154?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80"
                                alt="Fabric selection"
                                className="w-full h-full object-cover transform transition-all duration-700 ease-in-out hover:scale-110"
                            />
                        </div>

                        {/* Bottom Left Image */}
                        <div className="aspect-square overflow-hidden transform transition-all duration-700 ease-out hover:scale-105 hover:-rotate-1 hover:shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1574634534894-89d7576c8259?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80"
                                alt="Design process"
                                className="w-full h-full object-cover transform transition-all duration-700 ease-in-out hover:scale-110"
                            />
                        </div>

                        {/* Bottom Right Image */}
                        <div className="aspect-square overflow-hidden mt-8 transform transition-all duration-700 ease-out hover:scale-105 hover:rotate-1 hover:shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
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