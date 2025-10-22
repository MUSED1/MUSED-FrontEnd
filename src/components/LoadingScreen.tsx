// components/LoadingScreen.tsx
import { useEffect, useState } from 'react';

export function LoadingScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [showBackground, setShowBackground] = useState(false);
    const [showMused, setShowMused] = useState(false);
    const [show852, setShow852] = useState(false);
    const [highlight852, setHighlight852] = useState(false);

    useEffect(() => {
        // Animation sequence with longer timing
        const t1 = setTimeout(() => {
            setShowBackground(true);
        }, 300);

        const t2 = setTimeout(() => {
            setShowMused(true);
        }, 1000); // Show MUSED 1 second after start

        const t3 = setTimeout(() => {
            setShow852(true);
        }, 2200); // Show 852 2.2 seconds after start

        const t4 = setTimeout(() => {
            setHighlight852(true);
        }, 3500); // Highlight 852 at 3.5 seconds

        const t5 = setTimeout(() => {
            setIsVisible(false);
        }, 5500); // Total animation duration ~5.5 seconds

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
            clearTimeout(t5);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 bg-burgundy flex flex-col items-center justify-center z-50 transition-all duration-1000 ${showBackground ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-center">
                {/* MUSED Logo */}
                <h1 className={`text-cream text-8xl md:text-9xl lg:text-10xl font-sans font-bold transition-all duration-1000 ${showMused ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    MUSED
                </h1>

                {/* 852 Text */}
                <div className={`mt-8 transition-all duration-1000 ${show852 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <span className={`text-6xl md:text-7xl lg:text-8xl font-sans font-bold transition-colors duration-1500 ease-in-out ${highlight852 ? 'text-gold' : 'text-cream'}`}>
                        852
                    </span>
                </div>
            </div>
        </div>
    );
}