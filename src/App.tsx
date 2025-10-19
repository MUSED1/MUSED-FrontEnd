import React, { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { FeaturedProducts } from './components/FeaturedProducts'
import { Categories } from './components/Categories'
import { BrandStory } from './components/BrandStory'
import { Newsletter } from './components/Newsletter'
import { Footer } from './components/Footer'
import { LoadingScreen } from './components/LoadingScreen'

export function App() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading time or wait for essential resources
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="font-sans">
            <Header />
            <main>
                <Hero />
                <FeaturedProducts />
                <Categories />
                <BrandStory />
                <Newsletter />
            </main>
            <Footer />
        </div>
    )
}