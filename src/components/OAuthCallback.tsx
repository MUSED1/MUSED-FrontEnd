// components/OAuthCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleOAuthCallback = async () => {
            const token = searchParams.get('token');
            const userStr = searchParams.get('user');

            console.log('🔍 OAuthCallback - Token present:', !!token);
            console.log('🔍 OAuthCallback - User data present:', !!userStr);

            if (!token) {
                setError('No token received');
                setTimeout(() => navigate('/login?error=oauth_error'), 2000);
                return;
            }

            try {
                // ✅ FIX: Use loginWithToken - it will use the correct API URL internally
                const result = await loginWithToken(token);

                if (result.success) {
                    console.log('✅ OAuth login successful, redirecting to profile');
                    navigate('/profile', { replace: true });
                } else {
                    console.error('❌ OAuth login failed:', result.error);
                    setError(result.error || 'Login failed');
                    setTimeout(() => navigate('/login?error=oauth_error'), 2000);
                }
            } catch (err) {
                console.error('❌ OAuth callback error:', err);
                setError('Authentication failed');
                setTimeout(() => navigate('/login?error=oauth_error'), 2000);
            }
        };

        handleOAuthCallback();
    }, [searchParams, navigate, loginWithToken]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <p className="text-gray-600">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy mx-auto mb-4"></div>
                <p className="text-gray-600">Completing your sign in...</p>
            </div>
        </div>
    );
};