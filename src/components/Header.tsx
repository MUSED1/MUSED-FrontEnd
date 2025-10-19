import React, { useState } from 'react'
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react'

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="bg-cream w-full sticky top-0 z-50 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Mobile menu button */}
                    <button
                        className="md:hidden text-plum transition-all duration-200 ease-in-out hover:scale-110 hover:text-gold"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Logo */}
                    <div className="flex-1 md:flex-none text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-burgundy transition-all duration-300 ease-in-out hover:text-gold hover:scale-105 cursor-pointer">
                            MUSED
                        </h1>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:block">
                        <ul className="flex space-x-8">
                            <li>
                                <a
                                    href="#"
                                    className="text-plum hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:font-semibold"
                                >
                                    Home
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-plum hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:font-semibold"
                                >
                                    Dinner
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-plum hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:font-semibold"
                                >
                                    Collections
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-plum hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:font-semibold"
                                >
                                    About
                                </a>
                            </li>
                        </ul>
                    </nav>

                    {/* Icons */}
                    <div className="flex items-center space-x-4">
                        <button className="text-plum hover:text-gold transition-all duration-300 ease-in-out transform hover:scale-110">
                            <Search size={20} />
                        </button>
                        <button className="text-plum hover:text-gold transition-all duration-300 ease-in-out transform hover:scale-110">
                            <User size={20} />
                        </button>
                        <button className="text-plum hover:text-gold transition-all duration-300 ease-in-out transform hover:scale-110 relative">
                            <ShoppingBag size={20} />
                            <span className="absolute -top-1 -right-1 bg-burgundy text-cream rounded-full w-4 h-4 flex items-center justify-center text-xs transition-all duration-300 ease-in-out hover:bg-gold hover:scale-110">
                                0
                            </span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden pt-4 pb-2 border-t mt-4 border-rose animate-slideDown">
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="#"
                                    className="block text-plum hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:translate-x-2 hover:font-semibold"
                                >
                                    Home
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="block text-plum hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:translate-x-2 hover:font-semibold"
                                >
                                    Diner
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="block text-plum hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:translate-x-2 hover:font-semibold"
                                >
                                    Collections
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="block text-plum hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:translate-x-2 hover:font-semibold"
                                >
                                    About
                                </a>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </header>
    )
}