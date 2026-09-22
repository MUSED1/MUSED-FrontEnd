// components/AccountSettings.tsx
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '../hooks/useAuth';

export function AccountSettings() {
    const { user, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, loading, navigate]);

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="font-inter">
            <Header />
            <main className="min-h-screen bg-white pt-28 md:pt-32 pb-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm text-plum/50 hover:text-plum-dark transition-colors mb-4">
                        <ArrowLeft size={14} />
                        Profile
                    </Link>

                    <h1 className="text-3xl font-kaldera text-plum-dark mb-2">Settings</h1>
                    <div className="mb-8 h-px w-9 bg-[#C9A96E]" />

                    <div className="border-t border-plum-dark/6 pt-6">
                        <h2 className="text-lg font-kaldera text-plum-dark mb-3">Need help?</h2>
                        <p className="text-plum/70">
                            If you have an issue with your account please get in touch — we'll assist your issue within 24h.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
