// components/AdminHome.tsx
//
// One entry point for admin tools, so Header/Feed/Profile only ever need to
// link to /admin instead of growing a new top-level link per tool.
import { Link, Navigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ShieldCheck, Users, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const TOOLS = [
    {
        to: '/admin/brands',
        icon: ShieldCheck,
        label: 'Brand Approvals',
        description: 'Review seller brand stories before they go live.',
    },
    {
        to: '/admin/waitlist',
        icon: Users,
        label: 'Waitlist',
        description: 'Everyone who signed up on the landing page.',
    },
];

export function AdminHome() {
    const { user, isAuthenticated, loading } = useAuth();
    const isAdmin = (user as { role?: string } | null)?.role === 'admin';

    if (loading) return null;
    if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />;

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-cream pt-28 pb-20 sm:pt-32">
                <div className="container mx-auto max-w-2xl px-4">
                    <span className="text-xs uppercase tracking-label text-plum/40">MUSED 852</span>
                    <h1 className="mt-1 font-kaldera font-normal text-3xl text-plum-dark sm:text-4xl">
                        Admin
                    </h1>

                    <div className="mt-8 space-y-3">
                        {TOOLS.map(({ to, icon: Icon, label, description }) => (
                            <Link
                                key={to}
                                to={to}
                                className="group flex items-center gap-4 rounded-2xl border border-white/60 bg-white/60 p-5 backdrop-blur-md transition-colors hover:bg-white"
                            >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-plum-dark/6 text-plum-dark transition-colors group-hover:bg-plum-dark group-hover:text-cream">
                                    <Icon size={18} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-kaldera text-base text-plum-dark">{label}</p>
                                    <p className="text-sm text-plum/50">{description}</p>
                                </div>
                                <ChevronRight size={18} className="shrink-0 text-plum/30" />
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
