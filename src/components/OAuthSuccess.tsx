// components/OAuthSuccess.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Header } from './Header';
import { Footer } from './Footer';
import { CheckCircle, XCircle } from 'lucide-react';

export function OAuthSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const handleOAuthCallback = async () => {
            const token = searchParams.get('token');
            const error = searchParams.get('error');

            if (error) {
                setStatus('error');
                setErrorMessage('Authentication failed. Please try again.');
                return;
            }

            if (!token) {
                setStatus('error');
                setErrorMessage('No authentication token received.');
                return;
            }

            try {
                const result = await loginWithToken(token);

                if (result.success) {
                    setStatus('success');
                    // Redirect to profile after 2 seconds
                    setTimeout(() => {
                        navigate('/profile');
                    }, 2000);
                } else {
                    setStatus('error');
                    setErrorMessage(result.error || 'Login failed');
                }
            } catch (error) {
                setStatus('error');
                setErrorMessage('An unexpected error occurred.');
            }
        };

        handleOAuthCallback();
    }, [searchParams, loginWithToken, navigate]);

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-12">
                <div className="container mx-auto px-4 max-w-md">
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        {status === 'loading' && (
                            <>
                                <div className="w-20 h-20 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                                <h2 className="text-2xl font-bold text-plum mb-2">Completing Login</h2>
                                <p className="text-plum/60">Please wait while we redirect you...</p>
                            </>
                        )}

                        {status === 'success' && (
                            <>
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle size={40} className="text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-plum mb-2">Login Successful!</h2>
                                <p className="text-plum/60">Redirecting to your profile...</p>
                            </>
                        )}

                        {status === 'error' && (
                            <>
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <XCircle size={40} className="text-red-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-plum mb-2">Login Failed</h2>
                                <p className="text-plum/60 mb-6">{errorMessage}</p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-6 py-3 bg-gradient-to-r from-plum to-gold text-cream rounded-lg hover:shadow-lg transition-all"
                                >
                                    Back to Login
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}