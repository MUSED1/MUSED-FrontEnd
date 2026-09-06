// components/RequireSeller.tsx
//
// Route guard for the brand/storefront area (currently just /brand).
// - Not logged in            -> redirect to /seller/login
// - Logged in, wrong role    -> redirect to /seller/login with a message
// - Logged in as seller/admin -> render the protected page
//
// This is a UX convenience only — the real enforcement is server-side via
// `authorize('seller', 'admin')` on the brand.js routes. Don't rely on this
// component alone for security.
//
// ⚠️ ASSUMPTION: this reads `user` off useAuth(), matching the standard
// { user, loading, login, signup, logout } shape for a context created by
// an AuthProvider (App.tsx wraps the whole app in one). Login.tsx and
// Signup.tsx only ever destructure `login`/`signup`, so I couldn't confirm
// `user`/`loading` actually exist on the hook — share hooks/useAuth.ts (and
// context/AuthContext, if separate) and I'll adjust the field names if they
// differ.
import { JSX } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const SELLER_ROLES = ['seller', 'admin'];

interface RequireSellerProps {
    children: JSX.Element;
}

export function RequireSeller({ children }: RequireSellerProps) {
    const { user, loading } = useAuth() as { user: { role?: string } | null; loading?: boolean };
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream to-amber-50">
                <div className="w-8 h-8 border-2 border-plum border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <Navigate
                to="/seller/login"
                replace
                state={{ from: location.pathname, message: 'Please sign in with your brand account to continue.' }}
            />
        );
    }

    if (!SELLER_ROLES.includes(user.role || '')) {
        return (
            <Navigate
                to="/seller/login"
                replace
                state={{ message: 'This account isn\u2019t set up as a seller. Sign in with a brand account, or apply below.' }}
            />
        );
    }

    return children;
}