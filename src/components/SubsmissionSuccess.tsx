// pages/SubmissionSuccess.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Check, Plus, Copy, Gift } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { API_CONFIG } from '../utils/api';

export function SubmissionSuccess() {
    const { user, isAuthenticated, loading, updateUser } = useAuth();
    const navigate = useNavigate();
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [referralLink, setReferralLink] = useState('');
    const [referralProcessed, setReferralProcessed] = useState(false);
    const [referrerName, setReferrerName] = useState<string | null>(null);

    // FIX: useRef guard prevents the referral API call from firing more than once
    //      even if the component re-renders (e.g. user navigates away and back).
    const referralAttempted = useRef(false);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, loading, navigate]);

    useEffect(() => {
        if (!user) return;

        // Build referral link using the user's ID
        const base = window.location.origin;
        setReferralLink(`${base}/upload?ref=${user.id}`);

        // Only process if user has a referrer and hasn't completed yet,
        // and we haven't already attempted this in the current session.
        if (user.referredBy && !user.referralCompleted && !referralAttempted.current) {
            referralAttempted.current = true;

            const processReferral = async () => {
                const token = localStorage.getItem('token');
                if (!token) return;

                try {
                    const response = await fetch(`${API_CONFIG.baseURL}/auth/process-referral`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    const data = await response.json();

                    if (data.success && data.credited) {
                        console.log('✅ Referral completed:', data.referrerName);
                        setReferrerName(data.referrerName);
                        setReferralProcessed(true);

                        // Update user context to reflect referral completed
                        if (updateUser) {
                            updateUser({ referralCompleted: true });
                        }
                    }
                } catch (error) {
                    console.error('Error processing referral:', error);
                }
            };

            processReferral();
        }
    }, [user, updateUser]);

    const handleCopyLink = async (index: number) => {
        if (!referralLink) return;
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2500);
        } catch {
            const el = document.createElement('textarea');
            el.value = referralLink;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2500);
        }
    };

    if (loading) {
        return (
            <div className="font-sans">
                <Header />
                <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-rose border-t-transparent rounded-full animate-spin" />
                </main>
                <Footer />
            </div>
        );
    }

    if (!isAuthenticated || !user) return null;

    return (
        <div className="font-sans">
            <Header />

            <main className="min-h-screen bg-gradient-to-br from-cream via-amber-50 to-rose/20 py-16 px-4">
                <div className="max-w-2xl mx-auto space-y-10">

                    {/* Confirmation card */}
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-plum via-rose to-burgundy" />

                        <div className="p-10 text-center space-y-5">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose to-plum flex items-center justify-center mx-auto shadow-lg animate-[fadeInScale_0.5s_ease-out_both]">
                                <Check size={36} className="text-cream" strokeWidth={3} />
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm tracking-[0.25em] uppercase text-rose font-inter font-medium">
                                    Welcome
                                </p>
                                <h1 className="font-kaldera text-4xl sm:text-5xl text-plum leading-tight">
                                    You entered<br />the collection
                                </h1>
                            </div>

                            <p className="text-plum/70 font-inter text-base max-w-sm mx-auto leading-relaxed">
                                Your pieces are now under review.
                                Upon successful verification of your profile, we will be in touch with the next steps.
                            </p>

                            {/* Show referral success message if applicable */}
                            {referralProcessed && referrerName && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-[fadeInScale_0.3s_ease-out]">
                                    <div className="flex items-center gap-2 justify-center mb-1">
                                        <Gift size={16} className="text-green-600" />
                                        <p className="text-green-700 font-medium text-sm">
                                             Referral credited!
                                        </p>
                                    </div>
                                    <p className="text-green-600 text-sm">
                                        {referrerName} got credit for referring you. Thank you for joining!
                                    </p>
                                </div>
                            )}

                            {user.referredBy && !referralProcessed && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <p className="text-amber-700 text-sm">
                                         You were referred by someone! They'll get credit for your submission.
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center gap-4 py-2">
                                <div className="flex-1 h-px bg-rose/30" />
                                <span className="font-kaldera text-rose text-xl tracking-widest">MUSED</span>
                                <div className="flex-1 h-px bg-rose/30" />
                            </div>
                        </div>
                    </div>

                    {/* Referral card */}
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                        <div className="p-10 text-center space-y-8">
                            <div className="space-y-2">
                                <p className="text-sm tracking-[0.2em] uppercase text-plum/50 font-inter">
                                    Bring your circle
                                </p>
                                <h2 className="font-kaldera text-3xl text-plum">
                                </h2>
                                <p className="text-plum/60 font-inter text-sm max-w-xs mx-auto leading-relaxed">
                                    Share your link — Bring your favourite fashionistas instead of circle

                                </p>
                            </div>

                            <div className="flex items-center justify-center gap-6 sm:gap-10">
                                {[0, 1, 2].map((i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleCopyLink(i)}
                                        className="group relative flex flex-col items-center gap-3"
                                    >
                                        <div
                                            className={`
                                                w-20 h-20 rounded-full border-2 flex items-center justify-center
                                                transition-all duration-300 shadow-md
                                                ${copiedIndex === i
                                                ? 'bg-plum border-plum scale-110'
                                                : 'bg-white border-rose/50 group-hover:border-plum group-hover:bg-rose/10 group-hover:scale-110'
                                            }
                                            `}
                                        >
                                            {copiedIndex === i ? (
                                                <Copy size={24} className="text-cream" />
                                            ) : (
                                                <Plus
                                                    size={28}
                                                    className="text-rose group-hover:text-plum transition-colors duration-200"
                                                    strokeWidth={2}
                                                />
                                            )}
                                        </div>
                                        <span
                                            className={`
                                                text-xs font-inter font-medium tracking-wide transition-colors duration-200
                                                ${copiedIndex === i ? 'text-plum' : 'text-plum/50 group-hover:text-plum'}
                                            `}
                                        >
                                            {copiedIndex === i ? 'Link copied!' : `Friend ${i + 1}`}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {referralLink && (
                                <button
                                    onClick={() => handleCopyLink(-1)}
                                    className="group flex items-center gap-3 mx-auto bg-cream/80 border border-rose/30 hover:border-plum/40 rounded-xl px-5 py-3 transition-all duration-200 max-w-sm w-full"
                                >
                                    <span className="flex-1 text-left truncate text-xs font-inter text-plum/60 group-hover:text-plum transition-colors">
                                        {referralLink}
                                    </span>
                                    <Copy size={14} className="text-rose shrink-0 group-hover:text-plum transition-colors" />
                                </button>
                            )}

                            <p className="text-plum/40 font-inter text-xs">
                            </p>
                        </div>
                    </div>

                    <div className="text-center pb-4">
                        <button
                            onClick={() => navigate('/profile')}
                            className="font-inter text-sm text-plum/50 hover:text-plum underline underline-offset-4 transition-colors"
                        >
                            View my profile →
                        </button>
                    </div>
                </div>
            </main>

            <style>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.6); }
                    to   { opacity: 1; transform: scale(1); }
                }
            `}</style>

            <Footer />
        </div>
    );
}