// components/OAuthCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const OAuthCallback: React.FC = () => {
    const { loginWithToken } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userParam = params.get('user');
        const errorParam = params.get('error');

        if (errorParam) {
            setError(errorParam);
            setTimeout(() => navigate('/login', { state: { error: errorParam } }), 2000);
            return;
        }

        if (token) {
            // Store token and user data
            localStorage.setItem('token', token);

            if (userParam) {
                try {
                    JSON.parse(userParam);
// Update auth context
                    loginWithToken(token).then(() => {
                        // Redirect to upload page
                        navigate('/upload', { replace: true });
                    }).catch(err => {
                        console.error('Login with token failed:', err);
                        setError('Authentication failed');
                        setTimeout(() => navigate('/login'), 2000);
                    });
                } catch (err) {
                    console.error('Failed to parse user data:', err);
                    setError('Invalid user data');
                    setTimeout(() => navigate('/login'), 2000);
                }
            } else {
                // If no user data in URL, fetch it
                loginWithToken(token).then(() => {
                    navigate('/upload', { replace: true });
                }).catch(err => {
                    console.error('Login with token failed:', err);
                    setError('Authentication failed');
                    setTimeout(() => navigate('/login'), 2000);
                });
            }
        } else {
            setError('No authentication token received');
            setTimeout(() => navigate('/login'), 2000);
        }
    }, [location, loginWithToken, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-cream to-rose/30">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 border border-gold/20 text-center">
                {error ? (
                    <>
                        <div className="text-red-600 text-xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Authentication Error</h2>
                        <p className="text-plum/70">{error}</p>
                        <p className="text-plum/50 text-sm mt-4">Redirecting to login...</p>
                    </>
                ) : (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-burgundy mb-2">Completing Login...</h2>
                        <p className="text-plum/70">Please wait while we redirect you.</p>
                    </>
                )}
            </div>
        </div>
    );
};