// config/nav.ts
//
// One source of truth for navigation, so the three places a logged-in user
// navigates from — the home feed shortcut row, the profile shortcut row and
// the drawer — always use the same labels, icons and destinations.
//
// The split is deliberate:
//   SITE_NAV     — the public app: pages anyone can browse
//   ACCOUNT_NAV  — your account: your own things, only yours
// Home shows what you can explore; the profile shows what's yours.
import {
    Home,
    ShoppingBag,
    Compass,
    Info,
    User,
    Shirt,
    MessageCircle,
    Heart,
    Truck,
    Settings,
    type LucideIcon,
} from 'lucide-react';

export interface NavItem {
    path: string;
    label: string;
    icon: LucideIcon;
    /** Blocked until the user has a phone number on file */
    needsPhone?: boolean;
}

// Public side of the app
export const SITE_NAV: NavItem[] = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/shop', label: 'Shop', icon: ShoppingBag },
    { path: '/events', label: 'Events', icon: Compass },
    { path: '/about', label: 'About', icon: Info },
];

// Personal side of the app
export const ACCOUNT_NAV: NavItem[] = [
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/closet', label: 'Closet', icon: Shirt },
    { path: '/style-check', label: 'Ask M', icon: MessageCircle },
    { path: '/my-picks', label: 'Favs', icon: Heart, needsPhone: true },
    { path: '/my-orders', label: 'Orders', icon: Truck },
    { path: '/settings', label: 'Settings', icon: Settings },
];

const byPath = (items: NavItem[], paths: string[]): NavItem[] =>
    paths.map((path) => {
        const item = items.find((i) => i.path === path);
        if (!item) throw new Error(`Unknown nav path: ${path}`);
        return item;
    });

// Home feed — things to explore and do
export const FEED_SHORTCUTS: NavItem[] = [
    ...byPath(SITE_NAV, ['/shop', '/events']),
    ...byPath(ACCOUNT_NAV, ['/closet', '/style-check']),
];

// Profile — your own account pages
export const PROFILE_SHORTCUTS: NavItem[] = byPath(ACCOUNT_NAV, [
    '/my-picks',
    '/my-orders',
    '/settings',
]);
