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