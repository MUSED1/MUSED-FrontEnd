import { useState, useEffect } from 'react'
import { Menu, X, User, LogOut, ShoppingBag, MessageCircle, Heart, Compass, Settings, ShieldCheck, Truck, Shirt } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const NAV_LINKS = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/about', label: 'About' },
]

// Account section of the logged-in drawer. `path: null` = not live yet ("Soon")
const ACCOUNT_LINKS = [
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/closet', label: 'Closet', icon: Shirt },
    { path: '/collections-hk', label: 'Collection', icon: ShoppingBag },
    { path: '/style-check', label: 'Chat', icon: MessageCircle },
    { path: '/my-picks', label: 'Favs', icon: Heart },
    { path: '/my-reservations', label: 'My Events', icon: Compass },
    { path: '/my-orders', label: 'Orders', icon: Truck },
    { path: '/settings', label: 'Settings', icon: Settings },
]

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const { user, isAuthenticated, logout } = useAuth()
    const isAdmin = (user as { role?: string } | null)?.role === 'admin'
    const navigate = useNavigate()

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 40)
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Lock page scroll while the logged-in drawer is open
    useEffect(() => {
        if (!isAuthenticated) return
        document.body.style.overflow = isMenuOpen ? 'hidden' : ''
        return () => {
            document.body.style.overflow = ''
        }
    }, [isMenuOpen, isAuthenticated])

    const closeMenu = () => setIsMenuOpen(false)

    const handleLogout = () => {
        logout()
        closeMenu()
        navigate('/')
    }

    // Logged-in header — glass bar + right-side blurred drawer
    if (isAuthenticated) {
        return (
            <>
                <header
                    className={`fixed top-0 z-50 w-full transition-all duration-500 ease-in-out ${
                        isScrolled ? 'bg-transparent' : 'bg-[#5b1b3a] shadow-sm'
                    }`}
                >
                    <div className="container mx-auto flex items-center justify-between px-4 py-3.5">
                        <Link
                            to="/"
                            onClick={closeMenu}
                            className={`transition-opacity duration-300 ${
                                isScrolled ? 'pointer-events-none opacity-0' : 'opacity-100'
                            }`}
                        >
                            <div className="inline-flex flex-col items-center">
                                <h1 className="font-kaldera text-2xl tracking-wider text-cream transition-colors hover:text-gold">
                                    MUSED
                                </h1>
                                <span className="-mt-1 font-kaldera text-xs tracking-widest text-cream opacity-80">
                                    852
                                </span>
                            </div>
                        </Link>

                        <button
                            onClick={() => setIsMenuOpen((v) => !v)}
                            className={`ml-auto text-cream transition-all duration-200 ease-in-out hover:scale-110 hover:text-gold ${
                                isScrolled
                                    ? 'rounded-full bg-[#5b1b3a] p-2.5 shadow-md'
                                    : ''
                            }`}
                            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={isMenuOpen}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </header>

                {/* Blurred scrim — blur applies instantly, no fade lag */}
                <div
                    className={`fixed inset-0 z-40 ${
                        isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
                    }`}
                >
                    <div
                        className={`absolute inset-0 bg-plum-dark/25 backdrop-blur-2xl transition-opacity duration-100 ${
                            isMenuOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                        onClick={closeMenu}
                    />
                </div>

                {/* Right-side drawer — full height, ~half width, slides in from the right */}
                <nav
                    className={`fixed inset-y-0 right-0 z-50 flex w-1/2 max-w-sm flex-col items-start justify-center gap-2 border-l border-white/20 bg-plum-dark/60 px-8 backdrop-blur-2xl transition-transform duration-300 ease-in-out sm:px-10 ${
                        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    {NAV_LINKS.map(({ path, label }) => (
                        <Link
                            key={path}
                            to={path}
                            onClick={closeMenu}
                            className="py-2 font-kaldera text-2xl text-cream transition-colors hover:text-gold sm:text-3xl"
                        >
                            {label}
                        </Link>
                    ))}

                    <Link
                        to="/brand"
                        onClick={closeMenu}
                        className="py-2 font-kaldera text-2xl text-gold transition-colors hover:text-cream sm:text-3xl"
                    >
                        Partner With Us
                    </Link>
                    {isAdmin && (
                        <Link
                            to="/admin/brands"
                            onClick={closeMenu}
                            className="flex items-center gap-2 py-2 font-kaldera text-2xl text-gold transition-colors hover:text-cream sm:text-3xl"
                        >
                            <ShieldCheck size={22} />
                            Brand Approvals
                        </Link>
                    )}

                    <div className="my-5 h-px w-9 bg-[#C9A96E]" />

                    <div className="flex flex-col items-start gap-0.5 font-inter">
                        <span className="px-2 pb-1 text-xs uppercase tracking-label text-cream/40">
                            {user?.name || 'Account'}
                        </span>
                        {ACCOUNT_LINKS.map(({ path, label, icon: Icon }) =>
                            path ? (
                                <Link
                                    key={label}
                                    to={path}
                                    onClick={closeMenu}
                                    className="flex items-center gap-2 rounded-full px-2 py-1.5 text-sm text-cream/80 transition-colors hover:text-gold"
                                >
                                    <Icon size={15} />
                                    {label}
                                </Link>
                            ) : (
                                <span
                                    key={label}
                                    className="flex cursor-default items-center gap-2 px-2 py-1.5 text-sm text-cream/40"
                                    aria-disabled="true"
                                >
                                    <Icon size={15} />
                                    {label}
                                    <span className="rounded-full bg-[#C9A96E] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white">
                                        Soon
                                    </span>
                                </span>
                            )
                        )}
                        <button
                            onClick={handleLogout}
                            className="mt-1 flex items-center gap-2 rounded-full px-2 py-1.5 text-sm text-cream/45 transition-colors hover:text-[#C9614E]"
                        >
                            <LogOut size={15} />
                            Logout
                        </button>
                    </div>
                </nav>
            </>
        )
    }

    // Public / landing header — unchanged classic nav
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
                            {['/', '/shop', '/events', '/about'].map((path, i) => {
                                const labels = ['Home', 'Shop', 'Events', 'About']
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
                        {isAdmin && (
                            <Link
                                to="/admin/brands"
                                className="hidden sm:inline-flex items-center gap-1.5 text-gold hover:text-cream text-xs font-semibold tracking-widest uppercase border border-gold/50 hover:border-gold rounded-full px-4 py-1.5 transition-all duration-300"
                            >
                                <ShieldCheck size={14} />
                                Brand Approvals
                            </Link>
                        )}
                        <Link
                            to="/brand"
                            className="hidden sm:inline-block text-cream/90 hover:text-gold text-xs font-semibold tracking-widest uppercase border border-cream/30 hover:border-gold rounded-full px-4 py-1.5 transition-all duration-300"
                        >
                            Partner With Us
                        </Link>
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
                            {[['/', 'Home'], ['/shop', 'Shop'], ['/events', 'Events'], ['/about', 'About']].map(
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
                            <li className="pt-3 mt-3 border-t border-gold/30">
                                <Link
                                    to="/brand"
                                    className="block text-gold font-medium transition-all duration-300 ease-in-out transform hover:translate-x-2 font-kaldera"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Partner With Us
                                </Link>
                            </li>
                            {isAdmin && (
                                <li>
                                    <Link
                                        to="/admin/brands"
                                        className="block text-gold font-medium transition-all duration-300 ease-in-out transform hover:translate-x-2 font-kaldera"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Brand Approvals
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </header>
    )
}
