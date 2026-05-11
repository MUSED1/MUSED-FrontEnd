import { useState, useEffect } from 'react'
import { User, Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 40)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header
            className={`w-full fixed top-0 z-50 transition-all duration-500 ease-in-out ${
                isScrolled
                    ? 'bg-[#5b1b3a] shadow-md opacity-100'
                    : 'bg-transparent shadow-none opacity-0 pointer-events-none'
            }`}
        >
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
                            <div className="inline-flex flex-col items-center md:items-center">
                                <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-cream transition-all duration-300 ease-in-out hover:text-gold hover:scale-105 cursor-pointer font-kaldera">
                                    MUSED
                                </h1>
                                <span className="text-xs tracking-widest text-cream font-kaldera opacity-80 -mt-1">
                                    852
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:block">
                        <ul className="flex space-x-8">
                            {['/', '/diner', '/gallery', '/about'].map((path, i) => {
                                const labels = ['Home', 'The edit', 'Gallery', 'About']
                                return (
                                    <li key={path}>
                                        <Link
                                            to={path}
                                            className="text-cream hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:font-semibold font-kaldera"
                                        >
                                            {labels[i]}
                                        </Link>
                                    </li>
                                )
                            })}
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
                            {[['/', 'Home'], ['/diner', 'The edit'], ['/gallery', 'Gallery'], ['/about', 'About']].map(
                                ([path, label]) => (
                                    <li key={path}>
                                        <Link
                                            to={path}
                                            className="block text-cream hover:text-gold font-medium transition-all duration-300 ease-in-out transform hover:translate-x-2 hover:font-semibold font-kaldera"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                )
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </header>
    )
}