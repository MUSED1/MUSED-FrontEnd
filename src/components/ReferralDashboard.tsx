// components/ReferralDashboard.tsx
import { useState, useEffect } from 'react';
import { Copy, Check, Share2, Gift, Users, Award, TrendingUp } from 'lucide-react';
import { API_CONFIG } from '../utils/api';
import { Header } from './Header';
import { Footer } from './Footer';

interface ReferralStats {
    referralCode: string;
    referralLink: string;
    totalReferrals: number;
    completedReferrals: number;
    referrals: Array<{
        _id: string;
        name: string;
        email: string;
        hasSubmitted: boolean;
        submissionCount: number;
        createdAt: string;
    }>;
}

export function ReferralDashboard() {
    // FIX: Remove unused 'user' variable
    // const { user } = useAuth();  // DELETE THIS LINE

    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchReferralStats();
    }, []);

    const fetchReferralStats = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_CONFIG.baseURL}/auth/referral-stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setStats(data.data);
            } else {
                setError(data.message || 'Failed to load referral stats');
            }
        } catch (err) {  // FIX: Remove unused 'err' parameter or use it
            console.error('Error fetching referral stats:', err);
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyReferralLink = () => {
        if (stats?.referralLink) {
            navigator.clipboard.writeText(stats.referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareReferralLink = async () => {
        if (stats?.referralLink && navigator.share) {
            try {
                await navigator.share({
                    title: 'Join MUSED',
                    text: 'Become part of the MUSED collection! Use my referral link to sign up.',
                    url: stats.referralLink
                });
            } catch (err) {  // FIX: Use the error parameter or rename to _
                console.log('Share cancelled:', err);
            }
        } else {
            copyReferralLink();
        }
    };

    // Rest of your component remains the same...
    if (loading) {
        return (
            <div className="font-sans">
                <Header />
                <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-8">
                    <div className="container mx-auto px-4 max-w-4xl text-center">
                        <div className="bg-white rounded-2xl shadow-lg p-12">
                            <div className="w-16 h-16 border-4 border-rose border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-plum mt-4">Loading your referral stats...</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        // ... rest of your JSX remains the same
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-5xl md:text-6xl font-bold text-plum mb-4" style={{ fontFamily: 'Kaldera, serif' }}>
                            Refer & <span className="text-rose">Earn</span>
                        </h1>
                        <p className="text-xl text-plum/70 max-w-2xl mx-auto">
                            Share MUSED with friends and earn rewards when they submit their first piece!
                        </p>
                    </div>

                    {/* Error state */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-center">
                            {error}
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-xl p-6 shadow-md border border-cream">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-plum/60">Total Referrals</p>
                                    <p className="text-3xl font-bold text-plum">{stats?.totalReferrals || 0}</p>
                                </div>
                                <Users className="text-rose" size={28} />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-md border border-cream">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-plum/60">Completed</p>
                                    <p className="text-3xl font-bold text-green-600">{stats?.completedReferrals || 0}</p>
                                </div>
                                <Award className="text-green-500" size={28} />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-md border border-cream">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-plum/60">Pending</p>
                                    <p className="text-3xl font-bold text-amber-500">
                                        {(stats?.totalReferrals || 0) - (stats?.completedReferrals || 0)}
                                    </p>
                                </div>
                                <TrendingUp className="text-amber-500" size={28} />
                            </div>
                        </div>
                    </div>

                    {/* Referral Link Section */}
                    <div className="bg-gradient-to-r from-rose/10 to-plum/10 rounded-2xl p-8 mb-8 border-2 border-rose/30">
                        <div className="text-center mb-4">
                            <Gift className="inline-block text-rose mb-2" size={32} />
                            <h3 className="text-2xl font-bold text-plum mb-2">Your Unique Referral Link</h3>
                            <p className="text-plum/70">Share this link with friends. When they submit their first piece, you both earn rewards!</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                            <div className="flex-1 bg-white rounded-xl px-4 py-3 border-2 border-cream">
                                <code className="text-sm text-plum break-all">{stats?.referralLink || 'Loading...'}</code>
                            </div>

                            <button
                                onClick={copyReferralLink}
                                className="px-6 py-3 bg-white border-2 border-rose text-rose rounded-xl font-medium hover:bg-rose hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>

                            <button
                                onClick={shareReferralLink}
                                className="px-6 py-3 bg-rose text-white rounded-xl font-medium hover:bg-rose/90 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <Share2 size={18} />
                                Share
                            </button>
                        </div>
                    </div>

                    {/* Referrals List */}
                    {stats?.referrals && stats.referrals.length > 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-plum mb-4">Your Referrals</h3>
                            <div className="space-y-3">
                                {stats.referrals.map((ref) => (
                                    <div key={ref._id} className="flex items-center justify-between p-4 bg-cream/30 rounded-xl">
                                        <div>
                                            <p className="font-medium text-plum">{ref.name}</p>
                                            <p className="text-sm text-plum/60">{ref.email}</p>
                                            <p className="text-xs text-plum/40">
                                                Joined: {new Date(ref.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            {ref.hasSubmitted ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                                                    <Check size={14} />
                                                    Completed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                            <Users className="mx-auto text-rose/30 mb-4" size={48} />
                            <h3 className="text-xl font-bold text-plum mb-2">No referrals yet</h3>
                            <p className="text-plum/60">Share your link above to start earning rewards!</p>
                        </div>
                    )}

                    {/* How It Works */}
                    <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-8">
                        <h3 className="text-2xl font-bold text-plum mb-6 text-center">How It Works</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-rose/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-rose font-bold">1</span>
                                </div>
                                <p className="font-semibold text-plum">Share Your Link</p>
                                <p className="text-sm text-plum/70">Send your unique referral link to friends</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-rose/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-rose font-bold">2</span>
                                </div>
                                <p className="font-semibold text-plum">They Submit</p>
                                <p className="text-sm text-plum/70">Friend creates account and submits their first piece</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-rose/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-rose font-bold">3</span>
                                </div>
                                <p className="font-semibold text-plum">You Earn</p>
                                <p className="text-sm text-plum/70">Get rewards when they complete their first submission</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}