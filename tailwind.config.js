import colors from 'tailwindcss/colors'

export default {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Baskerville', 'Georgia', 'serif'],
                serif: ['Kaldera', 'Georgia', 'serif'],
                kaldera: ['Kaldera', 'serif'],
                abril: ['Abril Display', 'serif'],
                austin: ['Austin Pen', 'cursive'],

                // New brand identity, introduced on the public landing
                // (MusedLanding.tsx) — editorial wine/cream boutique look.
                // Being migrated in screen by screen; old tokens above stay
                // untouched until every screen that used them is redone.
                playfair: ['"Playfair Display"', 'Georgia', 'serif'],
                jost: ['Jost', '"Helvetica Neue"', 'Arial', 'sans-serif'],
                poiret: ['"Poiret One"', 'Jost', 'sans-serif'],
            },
            colors: {
                ...colors, // 👈 This brings back rose, amber, and all the default colors!

                // Your Custom Colors
                plum: {
                    DEFAULT: '#5B1B3A',
                    dark: '#3D1028',
                    og: '#5B1B3A',
                },
                bordeaux: '#7A2B50',
                cream: {
                    DEFAULT: '#FFF0C8',
                    clear: '#fff9e6',
                    og: '#FFF0C8',
                },
                // Gold — minimize use
                gold: '#f5d98a',
                // Hand notes / quotes
                burgundy: '#6B0202',
                // Tailwind's default palette has no DEFAULT shade for
                // named colors, so bare classes like `bg-rose`, `text-rose`,
                // `border-rose` (used throughout MyBrand/BrandDashboard)
                // compile to nothing without this.
                rose: {
                    ...colors.rose,
                    DEFAULT: colors.rose[500],
                },

                // New brand identity palette (from MusedLanding.css)
                wine: {
                    DEFAULT: '#6b0035',
                    frame: '#6b0035',
                    deep: '#3c0020',
                    panel: 'rgba(112, 0, 56, .82)',
                },
                'landing-cream': '#fdf3e0',
            },
            letterSpacing: {
                'label': '0.2em',
                'location': '0.27em',
            },
            fontSize: {
                'logo': '111px',
                'logo-sub': '90px',
                'h1-home': '72px',
                'h1': '48px',
                'label': '15px',
                'quote': '36px',
            },
        },
    },
    plugins: [],
}