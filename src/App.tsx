// App.tsx
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { JoinWsb } from './components/JoinWsb.tsx'
import { HowItWorks } from './components/HowItWorks.tsx'
import { BrandStory } from './components/BrandStory'
import { Footer } from './components/Footer'
import { LoadingScreen } from './components/LoadingScreen'
import { Collections } from './components/Collections'
import { Diner } from './components/Diner'
import { About } from './components/About'
import { FirstDinner } from './components/FirstDinner'
import { ClothingUploadForm } from './components/ClothingUploadForm'
import { AdminClothing } from './components/AdminClothing'
import { DinnerCollectionTwo } from './components/DinnerCollectionTwo'
import { Confirmation } from './components/Confirmation'
import { SimpleImageUpload } from './components/SimpleImageUpload'
import { SecondDinner } from './components/SecondDinner'
import { Events } from './components/Events'
import { Collection } from './components/Collection'
import { ThePics } from './components/ThePics'
import { FAQ } from './components/FAQ'
import { Reachout } from './components/Reachout'
import { Login } from './components/Login'
import { Signup } from './components/Signup'
import { MyUploads } from './components/MyUploads'
import { Profile } from './components/Profile'
import { OAuthSuccess } from './components/OAuthSuccess'
import { Terms } from './components/Terms'
import { Privacy } from './components/Privacy'

function HomePage() {
    return (
        <div className="font-sans">
            <Header />
            <main>
                <Hero />
                <JoinWsb />
                <HowItWorks />
                <BrandStory />
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
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/collections" element={<Collections />} />
                    <Route path="/diner" element={<Diner />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/first-dinner" element={<FirstDinner />} />
                    <Route path="/second-dinner" element={<SecondDinner />} />
                    <Route path="/upload" element={<ClothingUploadForm />} />
                    <Route path="/admin/clothing" element={<AdminClothing />} />
                    <Route path="/dinner-collection-two" element={<DinnerCollectionTwo />} />
                    <Route path="/confirmation" element={<Confirmation />} />
                    <Route path="/upload-images" element={<SimpleImageUpload />} />
                    <Route path="/collection" element={<Collection />} />
                    <Route path="/the-pics" element={<ThePics />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/reachout" element={<Reachout />} />
                    <Route path="/my-uploads" element={<MyUploads />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/oauth-success" element={<OAuthSuccess />} />
                    {/* Legal Pages */}
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/cookies" element={<Privacy />} />
                </Routes>
            </Router>
        </AuthProvider>
    )
}