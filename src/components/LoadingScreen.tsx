// components/LoadingScreen.tsx
import { useEffect, useState } from 'react';

export function LoadingScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [showBackground, setShowBackground] = useState(false);
    const [showMused, setShowMused] = useState(false);
    const [show852, setShow852] = useState(false);

    useEffect(() => {
        // Animation sequence - 3.5 segundos total
        const t1 = setTimeout(() => {
            setShowBackground(true);
        }, 150); // Fondo aparece muy rápido

        const t2 = setTimeout(() => {
            setShowMused(true);
        }, 200); // MUSED aparece a los 0.5 segundos

        const t3 = setTimeout(() => {
            setShow852(true);
        }, 500); // 852 aparece a los 1.3 segundos

        const t4 = setTimeout(() => {
            setIsVisible(false);
        }, 3500); // Total: 3.5 segundos

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 flex flex-col items-center justify-center z-50 transition-all duration-500 ${showBackground ? 'opacity-100' : 'opacity-0'}`}
             style={{ backgroundColor: '#5b1b3a' }}>
            <div className="text-center flex flex-col items-center justify-center">
                {/* MUSED Logo - Using Kaldera font with cream color */}
                <h1 className={`text-cream text-8xl md:text-9xl lg:text-10xl font-kaldera font-bold transition-all duration-500 ${showMused ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                    style={{ color: '#FFF0C8' }}>
                    MUSED
                </h1>

                {/* 852 Text - Using Kaldera font with cream color */}
                <div className={`mt-5 transition-all duration-500 ${show852 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                    <span className="text-6xl md:text-7xl lg:text-8xl font-kaldera font-bold"
                          style={{ color: '#FFF0C8' }}>
                        852
                    </span>
                </div>
            </div>
        </div>
    );
}