import { useState } from 'react'
import { User, Menu, X } from 'lucide-react'
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
                            <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-cream transition-all duration-300 ease-in-out hover:text-gold hover:scale-105 cursor-pointer font-kaldera">
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
                                    className="text-cream hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:font-semibold font-kaldera"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/diner"
                                    className="text-cream hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:font-semibold font-kaldera"
                                >
                                    Dinner
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/gallery"
                                    className="text-cream hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:font-semibold font-kaldera"
                                >
                                    Gallery
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/about"
                                    className="text-cream hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:font-semibold font-kaldera"
                                >
                                    About
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Icons */}
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/profile"
                            className="text-cream hover:text-gold transition-all duration-300 ease-in-out transform hover:scale-110"
                        >
                            <User size={20} />
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden pt-4 pb-2 border-t mt-4 border-gold animate-slideDown">
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    to="/"
                                    className="block text-cream hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:translate-x-2 hover:font-semibold font-kaldera"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/diner"
                                    className="block text-cream hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:translate-x-2 hover:font-semibold font-kaldera"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Dinner
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/gallery"
                                    className="block text-cream hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:translate-x-2 hover:font-semibold font-kaldera"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Gallery
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/about"
                                    className="block text-cream hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:translate-x-2 hover:font-semibold font-kaldera"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    About
                                </Link>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </header>
    )
}