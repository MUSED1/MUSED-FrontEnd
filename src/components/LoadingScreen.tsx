// components/LoadingScreen.tsx
import  { useEffect, useState } from 'react';

export function LoadingScreen() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2000); // Show for 2 seconds

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-burgundy flex items-center justify-center z-50">
            <h1 className="text-cream text-6xl md:text-8xl font-sans">MUSED</h1>
        </div>
    );
}