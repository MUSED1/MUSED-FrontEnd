import React from 'react'
import { Instagram, Facebook, Twitter } from 'lucide-react'
export function Footer() {
    return (
        <footer className="bg-plum text-cream w-full">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">MUSED</h3>
                        <p className="text-cream/70 mb-4">
                            Join the future of Fashion Mused
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="#"
                                className="text-cream/70 hover:text-gold transition-colors"
                            >
                                <Instagram size={20} />
                            </a>
                            <a
                                href="#"
                                className="text-cream/70 hover:text-gold transition-colors"
                            >

                            </a>
                            <a
                                href="#"
                                className="text-cream/70 hover:text-gold transition-colors"
                            >

                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-lg font-medium mb-4">Lend & Rent</h4>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="text-cream/70 hover:text-gold transition-colors"
                                >
                                    Dresses
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-cream/70 hover:text-gold transition-colors"
                                >
                                    Skirts
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-cream/70 hover:text-gold transition-colors"
                                >
                                    Accessories
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-cream/70 hover:text-gold transition-colors"
                                >
                                    New Arrivals
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-cream/70 hover:text-gold transition-colors"
                                >
                                    Upload
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-medium mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="text-cream/70 hover:text-gold transition-colors"
                                >
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-cream/70 hover:text-gold transition-colors"
                                >
                                    Sustainability
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-cream/70 hover:text-gold transition-colors"
                                >

                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-cream/70 hover:text-gold transition-colors"
                                >

                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-cream/70 hover:text-gold transition-colors"
                                >
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-medium mb-4">Customer Service</h4>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="text-cream/70 hover:text-gold transition-colors"
                                >
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-cream/70 hover:text-gold transition-colors"
                                >

                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-cream/70 hover:text-gold transition-colors"
                                >

                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-cream/70 hover:text-gold transition-colors"
                                >

                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-cream/70 hover:text-gold transition-colors"
                                >
                                    Next Events
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-burgundy-light/20 mt-12 pt-8 text-center text-cream/50 text-sm">
                    <p>© 2025 Mused. All rights reserved.</p>
                    <div className="mt-2 flex justify-center space-x-4">
                        <a href="#" className="hover:text-gold transition-colors">
                            Privacy Policy
                        </a>
                        <a href="#" className="hover:text-gold transition-colors">
                            Terms of Service
                        </a>
                        <a href="#" className="hover:text-gold transition-colors">
                            Cookie Policy
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
