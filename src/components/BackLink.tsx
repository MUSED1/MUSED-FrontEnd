// components/BackLink.tsx
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackLinkProps {
    /** Where the arrow goes — defaults to the profile */
    to?: string;
    /** What it's called there — defaults to "Profile" */
    label?: string;
    className?: string;
}

// The single back affordance for account pages, so every one of them
// offers the same way out without opening the drawer.
export function BackLink({ to = '/profile', label = 'Profile', className = '' }: BackLinkProps) {
    return (
        <Link
            to={to}
            className={`inline-flex items-center gap-1.5 text-sm text-plum/50 transition-colors hover:text-plum-dark ${className}`}
        >
            <ArrowLeft size={14} />
            {label}
        </Link>
    );
}
