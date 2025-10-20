export default {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Kaldera Regular', 'system-ui', 'sans-serif'],
                serif: ['Kaldera Regular', 'Georgia', 'serif'],
            },
            colors: {
                burgundy: {
                    DEFAULT: '#800040',
                    light: '#a3305c',
                    dark: '#5e0030',
                },
                cream: '#f9f3e8',
                gold: '#d4af37',
                rose: '#e8c3c3',
                plum: '#46222f',
            }
        },
    },
    plugins: [],
}
