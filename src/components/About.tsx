// components/About.tsx
import { Header } from './Header'
import { Footer } from './Footer'
import { BrandStory } from './BrandStory'

export function About() {
    return (
        <div className="font-sans" style={{ backgroundColor: '#fff9e6' }}>
            <Header />
            <style>{`
                .tagline-text {
                    opacity: 0;
                    transition: opacity 1.4s ease;
                }
                .tagline-text.visible {
                    opacity: 1;
                }
            `}</style>
            <main className="min-h-screen">
                <div className="container mx-auto px-4 py-16">

                    {/* Founder's Story */}
                    <div className="max-w-6xl mx-auto mb-16 -mx-4">
                        <BrandStory />
                    </div>


                </div>
            </main>
            <Footer />
        </div>
    )
}