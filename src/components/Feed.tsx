// components/Feed.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
    Search,
    ShoppingBag,
    MessageCircle,
    Heart,
    Compass,
    Package,
    ArrowUpRight,
    User,
    Shirt,
} from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '../hooks/useAuth';

// `to: null` marks a feature that isn't live yet — rendered as a "Soon" tile
const CATEGORIES = [
    { to: '/closet', icon: Shirt, label: 'Closet' },
    { to: '/shop', icon: ShoppingBag, label: 'Shop' },
    { to: '/style-check', icon: MessageCircle, label: 'Chat' },
    { to: '/my-picks', icon: Heart, label: 'Favs' },
    { to: '/events', icon: Compass, label: 'Events' },
    { to: '/my-orders', icon: Package, label: 'Orders' },
];

const EDITS = [
    { image: '/main1-hero.jpg', title: 'Night Out', note: 'Cocktail & dinner pieces' },
    { image: '/dress3.png', title: 'Coastal', note: 'Resort & beach ready' },
    { image: '/clothe20.png', title: 'Street Style', note: 'Everyday statement pieces' },
];

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

export function Feed() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        navigate('/shop');
    };

    const firstName = user?.name?.split(' ')[0];

    return (
        <div className="font-inter">
            <Header />
            <main className="min-h-screen bg-white">
                <div className="container mx-auto max-w-5xl px-4 pt-28 pb-20 sm:pt-32">
                    {/* Greeting row */}
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs uppercase tracking-label text-plum/40">
                                MUSED 852
                            </span>
                            <h1 className="mt-1 font-kaldera font-normal text-3xl text-plum-dark sm:text-4xl">
                                {getGreeting()}{firstName ? `, ${firstName}` : ''}.
                            </h1>
                        </div>

                        <Link
                            to="/profile"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-plum-dark text-cream transition-transform hover:scale-105"
                            aria-label="Profile"
                        >
                            <User size={18} />
                        </Link>
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="mt-6">
                        <div className="flex items-center gap-3 rounded-full border border-plum-dark/10 bg-cream px-5 py-3.5 shadow-sm transition-colors focus-within:border-plum-dark/30">
                            <Search size={18} className="text-plum/40" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search pieces, styles, brands…"
                                className="w-full bg-transparent text-sm text-plum-dark placeholder-plum/40 focus:outline-none"
                            />
                        </div>
                    </form>

                    {/* Categories */}
                    <div className="mt-8 grid grid-cols-6 gap-1 pt-2 sm:gap-4">
                        {CATEGORIES.map(({ to, icon: Icon, label }) =>
                            to ? (
                                <Link
                                    key={label}
                                    to={to}
                                    className="group flex min-w-0 flex-col items-center gap-2"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-plum-dark/6 text-plum-dark transition-colors sm:h-14 sm:w-14 group-hover:bg-plum-dark group-hover:text-cream">
                                        <Icon size={20} />
                                    </div>
                                    <span className="w-full truncate text-center text-[11px] text-plum/60 sm:text-xs">{label}</span>
                                </Link>
                            ) : (
                                <div
                                    key={label}
                                    className="flex min-w-0 cursor-default flex-col items-center gap-2"
                                    aria-disabled="true"
                                >
                                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-plum-dark/6 text-plum-dark/40 sm:h-14 sm:w-14">
                                        <Icon size={20} />
                                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#C9A96E] px-1.5 py-0.5 text-[9px] leading-none font-medium uppercase tracking-wide text-white">
                                            Soon
                                        </span>
                                    </div>
                                    <span className="w-full truncate text-center text-[11px] text-plum/40 sm:text-xs">{label}</span>
                                </div>
                            )
                        )}
                    </div>

                    {/* Featured card */}
                    <Link
                        to="/shop"
                        className="group relative mt-10 block h-72 overflow-hidden rounded-3xl sm:h-80"
                    >
                        <img
                            src="/main1-hero.jpg"
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover object-[center_25%] transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-plum-dark/90 via-plum-dark/20 to-transparent" />
                        <div className="absolute inset-x-6 bottom-6 sm:inset-x-8 sm:bottom-8">
                            <div className="mb-3 h-px w-9 bg-[#C9A96E]" />
                            <h2 className="font-amandine font-normal text-3xl text-cream sm:text-4xl">
                                Find your next
                                <br />
                                obsession.
                            </h2>
                            <p className="mt-2 max-w-sm font-sans italic text-cream/70">
                                Discover up &amp; rising designers, curated just for you.
                            </p>
                        </div>
                        <div className="absolute bottom-6 right-6 flex h-11 w-11 items-center justify-center rounded-full bg-white text-plum-dark transition-transform group-hover:scale-110 sm:bottom-8 sm:right-8">
                            <ArrowUpRight size={18} />
                        </div>
                    </Link>

                    {/* Edits — horizontal scroll */}
                    <div className="mt-12 flex items-center justify-between">
                        <h3 className="font-kaldera text-xl text-plum-dark">Collections</h3>
                        <Link to="/shop" className="text-sm text-plum/50 transition-colors hover:text-plum-dark">
                            See all
                        </Link>
                    </div>

                    <div className="mt-5 flex gap-4 overflow-x-auto pb-4">
                        {EDITS.map(({ image, title, note }) => (
                            <Link
                                key={title}
                                to="/shop"
                                className="group w-40 shrink-0 sm:w-48"
                            >
                                <div className="h-56 w-full overflow-hidden rounded-2xl bg-plum-dark/5 sm:h-64">
                                    <img
                                        src={image}
                                        alt=""
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <h4 className="mt-3 font-kaldera text-base text-plum-dark">{title}</h4>
                                <p className="text-xs text-plum/50">{note}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
