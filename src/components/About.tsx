// components/About.tsx
import React, { useState } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { ChevronDown, ChevronUp, Heart, Shirt, Users, DollarSign, Leaf, Clock, Truck, Shield, Sparkles, Star } from 'lucide-react'

interface FAQItem {
    question: string
    answer: string
    icon: React.ReactNode
}

export function About() {
    const [openItems, setOpenItems] = useState<number[]>([])

    const toggleItem = (index: number) => {
        setOpenItems(prev =>
            prev.includes(index)
                ? prev.filter(item => item !== index)
                : [...prev, index]
        )
    }

    const faqItems: FAQItem[] = [
        {
            question: "HOW TO LEND? Be the Muse",
            answer: "Upload your pieces: Go to the website and upload 1+ pieces from your wardrobe. We need: Photo worn, size, OG price, cleaning & pickup preferences. Relax: Your piece is now part of our wardrobe. We'll contact you once it has been mused. Monetize your piece: Once your piece has been Mused, we'll pick it up and deliver it to the borrower. Get your piece back: We'll return your piece to your door cleaned according to your preference.",
            icon: <Shirt className="text-gold" size={24} />
        },
        {
            question: "HOW TO BORROW? To get Mused",
            answer: "Explore the wardrobe on our website & discover other's style. Select: Choose your favorite item & submit a request. We'll review it and get back to you within 24 hours. Once approved, you're ready to borrow! We'll deliver the item right to your door and collect it when you're done.",
            icon: <Heart className="text-gold" size={24} />
        },
        {
            question: "Wear Something Borrowed",
            answer: "Explore a rotating closet of handpicked finds. Mused is the platform that lets you lend and borrow clothes from each other. Mused connects you to friends and friends of friends. Let your clothes spark their creativity, and let theirs spark yours. Sharing clothes has never been this easy.",
            icon: <Shirt className="text-gold" size={24} />
        },
        {
            question: "Trust & Community",
            answer: "Every piece is shared by real women in your city. Mused is about sharing with friends & friends of friends. Meet the people you borrow from and lend to by attending our 'Wear Something Borrowed' dinners. Mused sharing is easy, personal, and social.",
            icon: <Users className="text-gold" size={24} />
        },
        {
            question: "Monetize Your Wardrobe",
            answer: "Just like you shouldn't let your money sleep in your bank account, your clothes shouldn't sleep in your closet! With Mused, you can earn by renting out pieces you're not wearing. Turn your personal style into a side hustle.",
            icon: <DollarSign className="text-gold" size={24} />
        },
        {
            question: "Future For Fashion",
            answer: "Refresh your wardrobe, reduce waste, and join a movement that's better for your closet, wallet, and the planet. Mused is building the future of fashion - one where you can try new trends and skip the pile-up. Join us to create a more sustainable, affordable and flexible way to shop.",
            icon: <Leaf className="text-gold" size={24} />
        },
        {
            question: "Delivery & Pickup Process",
            answer: "We handle all the logistics! Once your item is booked, we'll deliver it directly to your door. When you're done, we'll come collect it and handle the cleaning. For lenders, we pick up your pieces when they're booked and return them cleaned and ready for your next wear.",
            icon: <Truck className="text-gold" size={24} />
        },
        {
            question: "Quality & Safety Assurance",
            answer: "All pieces go through our quality check process. We verify condition, authenticity, and ensure proper cleaning between uses. Our insurance coverage protects both lenders and borrowers, giving you peace of mind throughout the entire process.",
            icon: <Shield className="text-gold" size={24} />
        },
        {
            question: "Timeline & Availability",
            answer: "Most rental requests are approved within 24 hours. You can book items up to 2 months in advance. Standard rental period is 4 days, with options to extend. Lenders typically see their pieces rented within the first 2 weeks of listing.",
            icon: <Clock className="text-gold" size={24} />
        }
    ]

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50">
                <div className="container mx-auto px-4 py-16">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <div className="flex flex-col items-center gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <Sparkles className="text-gold" size={20} />
                                <span className="bg-gradient-to-r from-plum to-gold text-cream px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                                    Above & Beyond Fashion
                                </span>
                                <Sparkles className="text-gold" size={20} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="text-plum" size={18} />
                                <span className="bg-gradient-to-r from-gold to-plum text-cream px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                                    Style Without Limits
                                </span>
                                <Star className="text-plum" size={18} />
                            </div>
                        </div>
                        <h1 className="text-6xl md:text-7xl font-bold text-plum mb-6">
                            About <span className="text-gold">MUSED</span>
                        </h1>
                        <p className="text-2xl text-plum/80 max-w-3xl mx-auto leading-relaxed">
                            Where Fashion Meets Connection • Sustainable Style Revolution • Your Closet, Expanded
                        </p>
                    </div>

                    {/* Image Section */}
                    <div className="max-w-6xl mx-auto mb-16">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-[1.02]">
                            <img
                                src="src/assets/t2.jpg"
                                alt="Mused Community - Fashion Sharing Experience"
                                className="w-full h-[800px] object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-plum/40 to-gold/20"></div>
                            <div className="absolute bottom-8 left-8 right-8 text-cream">
                                <h3 className="text-3xl font-bold mb-2">Join Our Fashion Community</h3>
                                <p className="text-xl opacity-90">Where style meets sustainability and connection</p>
                            </div>
                        </div>
                    </div>

                    {/* About Concept Section */}
                    <div className="max-w-6xl mx-auto mb-16">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                            <div className="text-center mb-8">
                                <h2 className="text-4xl font-bold text-plum mb-4">
                                    The <span className="text-gold">Mused</span> Concept
                                </h2>
                                <div className="flex justify-center gap-4 mb-6">
                                    <span className="bg-gradient-to-r from-plum to-gold text-cream px-4 py-1 rounded-full text-sm font-bold">
                                        Wear Something Borrowed
                                    </span>
                                    <span className="bg-gradient-to-r from-gold to-plum text-cream px-4 py-1 rounded-full text-sm font-bold">
                                        Share Your Style
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="text-center">
                                    <p className="text-xl text-plum/80 leading-relaxed max-w-4xl mx-auto">
                                        Explore a rotating closet of handpicked finds. Mused is the platform that lets you lend and borrow clothes from each other. Mused connects you to friends and friends of friends. Let your clothes spark their creativity, and let theirs spark yours. Sharing clothes has never been this easy.
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6 mt-12">
                                    <div className="bg-gradient-to-br from-cream to-amber-50 rounded-2xl p-6 border-2 border-gold/20 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                                        <div className="text-center mb-4">
                                            <Users className="text-plum mx-auto mb-3" size={32} />
                                            <h3 className="text-2xl font-bold text-plum mb-2">1. Trust & Community</h3>
                                        </div>
                                        <p className="text-plum/80 text-lg leading-relaxed">
                                            Every piece is shared by real women in your city. Mused is about sharing with friends & friends of friends. Meet the people you borrow from and lend to by attending our "Wear Something Borrowed" dinners. Mused sharing is easy, personal, and social.
                                        </p>
                                    </div>

                                    <div className="bg-gradient-to-br from-cream to-amber-50 rounded-2xl p-6 border-2 border-gold/20 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                                        <div className="text-center mb-4">
                                            <DollarSign className="text-plum mx-auto mb-3" size={32} />
                                            <h3 className="text-2xl font-bold text-plum mb-2">2. Monetize</h3>
                                        </div>
                                        <p className="text-plum/80 text-lg leading-relaxed">
                                            Just like you shouldn't let your money sleep in your bank account, your clothes shouldn't sleep in your closet! With Mused, you can earn by renting out pieces you're not wearing. Turn your personal style into a side hustle.
                                        </p>
                                    </div>

                                    <div className="bg-gradient-to-br from-cream to-amber-50 rounded-2xl p-6 border-2 border-gold/20 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                                        <div className="text-center mb-4">
                                            <Leaf className="text-plum mx-auto mb-3" size={32} />
                                            <h3 className="text-2xl font-bold text-plum mb-2">3. Future For Fashion</h3>
                                        </div>
                                        <p className="text-plum/80 text-lg leading-relaxed">
                                            Refresh your wardrobe, reduce waste, and join a movement that's better for your closet, wallet, and the planet. Mused is building the future of fashion - one where you can try new trends and skip the pile-up. Join us to create a more sustainable, affordable and flexible way to shop.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="max-w-6xl mx-auto mb-16">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                                <div className="text-3xl md:text-4xl font-bold text-plum mb-2">500+</div>
                                <div className="text-gold font-semibold">Active Members</div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                                <div className="text-3xl md:text-4xl font-bold text-plum mb-2">1K+</div>
                                <div className="text-gold font-semibold">Pieces Shared</div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                                <div className="text-3xl md:text-4xl font-bold text-plum mb-2">85%</div>
                                <div className="text-gold font-semibold">Repeat Users</div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                                <div className="text-3xl md:text-4xl font-bold text-plum mb-2">24h</div>
                                <div className="text-gold font-semibold">Avg. Response</div>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Accordion Section */}
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-bold text-plum mb-4">
                                Frequently Asked <span className="text-gold">Questions</span>
                            </h2>
                            <p className="text-xl text-plum/70 max-w-2xl mx-auto">
                                Everything you need to know about lending, borrowing, and joining our community
                            </p>
                        </div>

                        <div className="space-y-4">
                            {faqItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-2xl"
                                >
                                    <button
                                        onClick={() => toggleItem(index)}
                                        className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-plum/5 transition-all duration-300"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-cream p-3 rounded-xl">
                                                {item.icon}
                                            </div>
                                            <h3 className="text-xl font-bold text-plum pr-4">
                                                {item.question}
                                            </h3>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {openItems.includes(index) ? (
                                                <ChevronUp className="text-gold" size={24} />
                                            ) : (
                                                <ChevronDown className="text-gold" size={24} />
                                            )}
                                        </div>
                                    </button>

                                    {openItems.includes(index) && (
                                        <div className="px-8 pb-6 animate-slideDown">
                                            <div className="pl-16 border-l-2 border-gold">
                                                <p className="text-plum/80 text-lg leading-relaxed">
                                                    {item.answer}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="max-w-2xl mx-auto mt-16 text-center">
                        <div className="bg-gradient-to-r from-plum to-gold rounded-2xl p-8 text-cream transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                            <h3 className="text-3xl font-bold mb-4">Ready to Join the Movement?</h3>
                            <p className="text-xl mb-6 opacity-90">
                                Start lending your pieces or discover amazing styles from our community today.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button className="bg-cream text-plum px-8 py-3 rounded-full font-bold hover:bg-white transition-all duration-300 transform hover:scale-105">
                                    Start Lending
                                </button>
                                <button className="border-2 border-cream text-cream px-8 py-3 rounded-full font-bold hover:bg-cream hover:text-plum transition-all duration-300 transform hover:scale-105">
                                    Start Borrowing
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}