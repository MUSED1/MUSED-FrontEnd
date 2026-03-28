export default {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['Kaldera', 'Georgia', 'serif'],
                amandine: ['Amandine', 'cursive', 'serif'],
                kaldera: ['Kaldera', 'serif'],
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