// App.tsx
import { useState, useEffect } from 'react'
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
import { Diner } from './components/Diner'
import { About } from './components/About'
import { FirstDinner } from './components/FirstDinner'
import { ClothingUploadForm } from './components/ClothingUploadForm'
import { AdminClothing } from './components/AdminClothing'
import { DinnerCollectionTwo } from './components/DinnerCollectionTwo'
import { Confirmation } from './components/Confirmation' // Add this import
import { SimpleImageUpload } from './components/SimpleImageUpload'


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
                <Route path="/diner" element={<Diner />} />
                <Route path="/about" element={<About />} />
                <Route path="/first-dinner" element={<FirstDinner />} />
                <Route path="/upload" element={<ClothingUploadForm />} />
                <Route path="/admin/clothing" element={<AdminClothing />} />
                <Route path="/dinner-collection-two" element={<DinnerCollectionTwo />} />
                <Route path="/confirmation" element={<Confirmation />} /> {/* Add this route */}
                <Route path="/upload-images" element={<SimpleImageUpload />} />
            </Routes>
        </Router>
    )
}