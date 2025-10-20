import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { FeaturedProducts } from './components/FeaturedProducts'
import { Categories } from './components/Categories'
import { BrandStory } from './components/BrandStory'
import { Newsletter } from './components/Newsletter'
import { Footer } from './components/Footer'
import { LoadingScreen } from './components/LoadingScreen'
import { Collections } from './components/Collections'

function HomePage() {
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

export function App() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/collections" element={<Collections />} />
            </Routes>
        </Router>
    )
}