import React, { useState } from 'react'
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="bg-[#5b1b3a] w-full sticky top-0 z-50 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Mobile menu button */}
                    <button
                        className="md:hidden text-cream transition-all duration-200 ease-in-out hover:scale-110 hover:text-gold"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Logo */}
                    <div className="flex-1 md:flex-none text-center md:text-left">
                        <Link to="/">
                            <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-cream transition-all duration-300 ease-in-out hover:text-gold hover:scale-105 cursor-pointer">
                                MUSED
                            </h1>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:block">
                        <ul className="flex space-x-8">
                            <li>
                                <Link
                                    to="/"
                                    className="text-cream hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:font-semibold"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-cream hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:font-semibold"
                                >
                                    Dinner
                                </a>
                            </li>
                            <li>
                                <Link
                                    to="/collections"
                                    className="text-cream hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:font-semibold"
                                >
                                    Collections
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-cream hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:font-semibold"
                                >
                                    About
                                </a>
                            </li>
                        </ul>
                    </nav>

                    {/* Icons */}
                    <div className="flex items-center space-x-4">
                        <button className="text-cream hover:text-gold transition-all duration-300 ease-in-out transform hover:scale-110">
                            <Search size={20} />
                        </button>
                        <button className="text-cream hover:text-gold transition-all duration-300 ease-in-out transform hover:scale-110">
                            <User size={20} />
                        </button>
                        <button className="text-cream hover:text-gold transition-all duration-300 ease-in-out transform hover:scale-110 relative">
                            <ShoppingBag size={20} />
                            <span className="absolute -top-1 -right-1 bg-gold text-[#5b1b3a] rounded-full w-4 h-4 flex items-center justify-center text-xs transition-all duration-300 ease-in-out hover:bg-cream hover:scale-110">
                                0
                            </span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden pt-4 pb-2 border-t mt-4 border-gold animate-slideDown">
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    to="/"
                                    className="block text-cream hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:translate-x-2 hover:font-semibold"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="block text-cream hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:translate-x-2 hover:font-semibold"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Diner
                                </a>
                            </li>
                            <li>
                                <Link
                                    to="/collections"
                                    className="block text-cream hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:translate-x-2 hover:font-semibold"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Collections
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="block text-cream hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:translate-x-2 hover:font-semibold"
                                    onClick={() => setIsMenuOpen(false)}
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