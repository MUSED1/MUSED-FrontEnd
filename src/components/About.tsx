// components/About.tsx
import React, { useState, useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { ChevronDown, ChevronUp, Heart, Shirt, Users, DollarSign, Leaf, Clock, Truck, Shield } from 'lucide-react'

// Typewriter hook
function useTypewriter(text: string, speed = 60, startDelay = 0) {
    const [displayed, setDisplayed] = useState('')
    const [done, setDone] = useState(false)

    useEffect(() => {
        setDisplayed('')
        setDone(false)
        let timeout: ReturnType<typeof setTimeout>
        let interval: ReturnType<typeof setInterval>

        timeout = setTimeout(() => {
            let i = 0
            interval = setInterval(() => {
                i++
                setDisplayed(text.slice(0, i))
                if (i >= text.length) {
                    clearInterval(interval)
                    setDone(true)
                }
            }, speed)
        }, startDelay)

        return () => {
            clearTimeout(timeout)
            clearInterval(interval)
        }
    }, [text, speed, startDelay])

    return { displayed, done }
}

interface FAQItem {
    question: string
    answer: string
    icon: React.ReactNode
}

export function About() {
    const [openItems, setOpenItems] = useState<number[]>([])

    // Typewriter: "About" then "MUSED" italic
    const { displayed: aboutText, done: aboutDone } = useTypewriter('About', 80, 200)
    const { displayed: musedText }                   = useTypewriter('MUSED', 80, aboutDone ? 600 : 9999)

    const [taglineVisible, setTaglineVisible] = useState(false)
    useEffect(() => {
        const id = setTimeout(() => setTaglineVisible(true), 2600)
        return () => clearTimeout(id)
    }, [])

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
            icon: <Shirt size={22} style={{ color: '#5B1B3A' }} />
        },
        {
            question: "HOW TO BORROW? To get Mused",
            answer: "Explore the wardrobe on our website & discover other's style. Select: Choose your favorite item & submit a request. We'll review it and get back to you within 24 hours. Once approved, you're ready to borrow! We'll deliver the item right to your door and collect it when you're done.",
            icon: <Heart size={22} style={{ color: '#5B1B3A' }} />
        },
        {
            question: "Wear Something Borrowed",
            answer: "Explore a rotating closet of handpicked finds. Mused is the platform that lets you lend and borrow clothes from each other. Mused connects you to friends and friends of friends. Let your clothes spark their creativity, and let theirs spark yours. Sharing clothes has never been this easy.",
            icon: <Shirt size={22} style={{ color: '#5B1B3A' }} />
        },
        {
            question: "Trust & Community",
            answer: "Every piece is shared by real women in your city. Mused is about sharing with friends & friends of friends. Meet the people you borrow from and lend to by attending our 'Wear Something Borrowed' dinners. Mused sharing is easy, personal, and social.",
            icon: <Users size={22} style={{ color: '#5B1B3A' }} />
        },
        {
            question: "Monetize Your Wardrobe",
            answer: "Just like you shouldn't let your money sleep in your bank account, your clothes shouldn't sleep in your closet! With Mused, you can earn by renting out pieces you're not wearing. Turn your personal style into a side hustle.",
            icon: <DollarSign size={22} style={{ color: '#5B1B3A' }} />
        },
        {
            question: "Future For Fashion",
            answer: "Refresh your wardrobe, reduce waste, and join a movement that's better for your closet, wallet, and the planet. Mused is building the future of fashion - one where you can try new trends and skip the pile-up. Join us to create a more sustainable, affordable and flexible way to shop.",
            icon: <Leaf size={22} style={{ color: '#5B1B3A' }} />
        },
        {
            question: "Delivery & Pickup Process",
            answer: "We handle all the logistics! Once your item is booked, we'll deliver it directly to your door. When you're done, we'll come collect it and handle the cleaning. For lenders, we pick up your pieces when they're booked and return them cleaned and ready for your next wear.",
            icon: <Truck size={22} style={{ color: '#5B1B3A' }} />
        },
        {
            question: "Quality & Safety Assurance",
            answer: "All pieces go through our quality check process. We verify condition, authenticity, and ensure proper cleaning between uses. Our insurance coverage protects both lenders and borrowers, giving you peace of mind throughout the entire process.",
            icon: <Shield size={22} style={{ color: '#5B1B3A' }} />
        },
        {
            question: "Timeline & Availability",
            answer: "Most rental requests are approved within 24 hours. You can book items up to 2 months in advance. Standard rental period is 4 days, with options to extend. Lenders typically see their pieces rented within the first 2 weeks of listing.",
            icon: <Clock size={22} style={{ color: '#5B1B3A' }} />
        }
    ]

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

                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        {/* H1: Kaldera 72px, one word italic — typewriter */}
                        <h1
                            className="font-kaldera tracking-tight drop-shadow-sm mb-6"
                            style={{ fontSize: 'clamp(48px, 8vw, 72px)', color: '#5B1B3A', lineHeight: 1 }}
                        >
                            {aboutText}
                            {!aboutDone && (
                                <span
                                    className="inline-block w-[3px] h-[0.8em] ml-1 align-middle animate-pulse"
                                    style={{ backgroundColor: '#5B1B3A', verticalAlign: 'middle' }}
                                />
                            )}{' '}
                            <span style={{ fontStyle: 'italic', color: '#7A2B50' }}>
                                {musedText}
                                {aboutDone && musedText.length < 5 && (
                                    <span
                                        className="inline-block w-[3px] h-[0.8em] ml-1 align-middle animate-pulse"
                                        style={{ backgroundColor: '#7A2B50', verticalAlign: 'middle' }}
                                    />
                                )}
                            </span>
                        </h1>

                        {/* Tagline: Abril Display italic, burgundy */}
                        <p
                            className={`tagline-text font-abril max-w-3xl mx-auto leading-relaxed${taglineVisible ? ' visible' : ''}`}
                            style={{
                                color: '#6B0202',
                                fontSize: '28px',
                                fontStyle: 'italic',
                                lineHeight: 1.4,
                            }}
                        >
                            Where Fashion Meets Connection · Sustainable Style Revolution · Your Closet, Expanded
                        </p>
                    </div>

                    {/* Concept Section */}
                    <div className="max-w-6xl mx-auto mb-16">
                        <div
                            className="rounded-2xl p-8 shadow-lg"
                            style={{ backgroundColor: 'rgba(255,240,200,0.6)', border: '1px solid rgba(91,27,58,0.1)' }}
                        >
                            <div className="text-center mb-8">
                                {/* Section label */}
                                <div className="mb-4">
                                    <span
                                        className="font-abril text-[15px] uppercase border rounded-full px-3 py-1"
                                        style={{
                                            color: '#5B1B3A',
                                            letterSpacing: '0.2em',
                                            borderColor: 'rgba(91,27,58,0.2)',
                                            backgroundColor: '#fff9e6',
                                        }}
                                    >
                                        What We Do
                                    </span>
                                </div>

                                {/* H2: Kaldera, italic on one word */}
                                <h2
                                    className="font-kaldera mb-6"
                                    style={{ fontSize: 'clamp(32px, 5vw, 48px)', color: '#5B1B3A', lineHeight: 1.1 }}
                                >
                                    The <span style={{ fontStyle: 'italic' }}>Mused</span> Concept
                                </h2>

                                {/* Pill labels: Abril Display, uppercase */}
                                <div className="flex flex-wrap justify-center gap-4 mb-6">
                                    <span
                                        className="font-abril text-[13px] uppercase px-4 py-1.5 rounded-full"
                                        style={{
                                            backgroundColor: '#5B1B3A',
                                            color: '#FFF0C8',
                                            letterSpacing: '0.2em',
                                        }}
                                    >
                                        Wear Something Borrowed
                                    </span>
                                    <span
                                        className="font-abril text-[13px] uppercase px-4 py-1.5 rounded-full"
                                        style={{
                                            backgroundColor: '#7A2B50',
                                            color: '#FFF0C8',
                                            letterSpacing: '0.2em',
                                        }}
                                    >
                                        Share Your Style
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* Body: Baskerville */}
                                <p
                                    className="font-sans text-xl leading-relaxed max-w-4xl mx-auto text-center"
                                    style={{ color: 'rgba(91,27,58,0.8)' }}
                                >
                                    Explore a rotating closet of handpicked finds. Mused is the platform that lets you lend and borrow clothes from each other. Mused connects you to friends and friends of friends. Let your clothes spark their creativity, and let theirs spark yours. Sharing clothes has never been this easy.
                                </p>

                                {/* 3-column cards */}
                                <div className="grid md:grid-cols-3 gap-6 mt-12">
                                    {[
                                        {
                                            icon: <Users size={28} style={{ color: '#5B1B3A' }} />,
                                            num: '1.',
                                            title: 'Trust & Community',
                                            body: "Every piece is shared by real women in your city. Mused is about sharing with friends & friends of friends. Meet the people you borrow from and lend to at our dinners.",
                                        },
                                        {
                                            icon: <DollarSign size={28} style={{ color: '#5B1B3A' }} />,
                                            num: '2.',
                                            title: 'Monetize',
                                            body: "Just like you shouldn't let your money sleep in your bank account, your clothes shouldn't sleep in your closet! Turn your personal style into a side hustle.",
                                        },
                                        {
                                            icon: <Leaf size={28} style={{ color: '#5B1B3A' }} />,
                                            num: '3.',
                                            title: 'Future For Fashion',
                                            body: "Refresh your wardrobe, reduce waste, and join a movement that's better for your closet, wallet, and the planet. Join us to create a more sustainable, affordable, and flexible way to shop.",
                                        },
                                    ].map((card) => (
                                        <div
                                            key={card.num}
                                            className="rounded-2xl p-6 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                                            style={{
                                                backgroundColor: '#fff9e6',
                                                border: '1px solid rgba(91,27,58,0.15)',
                                            }}
                                        >
                                            <div className="text-center mb-4">
                                                <div className="mx-auto mb-3">{card.icon}</div>
                                                {/* Card title: Kaldera */}
                                                <h3
                                                    className="font-kaldera"
                                                    style={{ fontSize: '22px', color: '#5B1B3A' }}
                                                >
                                                    {card.num} {card.title}
                                                </h3>
                                            </div>
                                            {/* Card body: Baskerville */}
                                            <p className="font-sans text-base leading-relaxed" style={{ color: 'rgba(91,27,58,0.75)' }}>
                                                {card.body}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Full-width image */}
                    <div className="max-w-6xl mx-auto mb-16">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-[1.01]">
                            <img
                                src="https://res.cloudinary.com/dapfjngt2/image/upload/v1778956155/WhatsApp_Image_2026-05-16_at_11.55.28_AM_chsrty.jpg"
                                alt="Mused Community - Fashion Sharing Experience"
                                className="w-full h-[800px] object-cover"
                            />
                            <div
                                className="absolute inset-0"
                                style={{ background: 'linear-gradient(to top, rgba(61,16,40,0.5), rgba(91,27,58,0.1) 50%, transparent)' }}
                            />
                            <div className="absolute bottom-8 left-8 right-8">
                                {/* Image caption title: Kaldera */}
                                <h3
                                    className="font-kaldera mb-2"
                                    style={{ fontSize: '32px', color: '#FFF0C8' }}
                                >

                                </h3>
                                {/* Caption body: Abril Display italic */}
                                <p
                                    className="font-abril"
                                    style={{ fontSize: '20px', color: 'rgba(255,240,200,0.85)', fontStyle: 'italic' }}
                                >
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            {/* Label */}
                            <div className="mb-4">
                                <span
                                    className="font-abril text-[15px] uppercase border rounded-full px-3 py-1"
                                    style={{
                                        color: '#5B1B3A',
                                        letterSpacing: '0.2em',
                                        borderColor: 'rgba(91,27,58,0.2)',
                                        backgroundColor: '#FFF0C8',
                                    }}
                                >
                                    Got Questions?
                                </span>
                            </div>
                            {/* H2: Kaldera, italic on one word */}
                            <h2
                                className="font-kaldera mb-4"
                                style={{ fontSize: 'clamp(32px, 5vw, 48px)', color: '#5B1B3A', lineHeight: 1.1 }}
                            >
                                Frequently <span style={{ fontStyle: 'italic' }}>Asked</span> Questions
                            </h2>
                            <p className="font-sans text-lg max-w-2xl mx-auto" style={{ color: 'rgba(91,27,58,0.7)' }}>
                                Everything you need to know about lending, borrowing, and joining our community
                            </p>
                        </div>

                        <div className="space-y-3">
                            {faqItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="rounded-2xl overflow-hidden transform transition-all duration-500 hover:shadow-xl"
                                    style={{
                                        backgroundColor: '#FFF0C8',
                                        border: '1px solid rgba(91,27,58,0.12)',
                                        boxShadow: '0 2px 8px rgba(91,27,58,0.06)',
                                    }}
                                >
                                    <button
                                        onClick={() => toggleItem(index)}
                                        className="w-full px-8 py-5 text-left flex items-center justify-between transition-all duration-300"
                                        style={{
                                            backgroundColor: openItems.includes(index)
                                                ? 'rgba(91,27,58,0.06)'
                                                : 'transparent',
                                        }}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div
                                                className="p-2.5 rounded-xl flex-shrink-0"
                                                style={{ backgroundColor: 'rgba(91,27,58,0.08)' }}
                                            >
                                                {item.icon}
                                            </div>
                                            {/* FAQ question: Abril Display, uppercase, tracking 200 */}
                                            <h3
                                                className="font-abril uppercase text-left pr-4"
                                                style={{
                                                    fontSize: '15px',
                                                    color: '#5B1B3A',
                                                    letterSpacing: '0.2em',
                                                    lineHeight: 1.4,
                                                }}
                                            >
                                                {item.question}
                                            </h3>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {openItems.includes(index) ? (
                                                <ChevronUp size={20} style={{ color: '#5B1B3A' }} />
                                            ) : (
                                                <ChevronDown size={20} style={{ color: '#5B1B3A' }} />
                                            )}
                                        </div>
                                    </button>

                                    {openItems.includes(index) && (
                                        <div className="px-8 pb-6">
                                            <div
                                                className="pl-16"
                                                style={{ borderLeft: '2px solid rgba(91,27,58,0.2)' }}
                                            >
                                                {/* FAQ answer: Baskerville */}
                                                <p
                                                    className="font-sans text-lg leading-relaxed"
                                                    style={{ color: 'rgba(91,27,58,0.8)' }}
                                                >
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
                        <div
                            className="rounded-2xl p-10 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
                            style={{ backgroundColor: '#3D1028' }}
                        >
                            {/* CTA title: Kaldera */}
                            <h3
                                className="font-kaldera mb-4"
                                style={{ fontSize: '36px', color: '#FFF0C8', lineHeight: 1.1 }}
                            >
                                Ready to Join the <span style={{ fontStyle: 'italic' }}>Movement?</span>
                            </h3>
                            {/* CTA body: Baskerville */}
                            <p
                                className="font-sans text-lg mb-8"
                                style={{ color: 'rgba(255,240,200,0.75)' }}
                            >
                                Start lending your pieces or discover amazing styles from our community today.
                            </p>
                            {/* Hand note: Abril Display italic */}
                            <p
                                className="font-abril mb-8"
                                style={{
                                    color: 'rgba(255,240,200,0.5)',
                                    fontSize: '24px',
                                    fontStyle: 'italic',
                                }}
                            >
                                Let yourself be Mused...
                            </p>
                            {/* Buttons: Abril Display, uppercase, tracking 200 */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    className="rounded-full transition-all duration-300 transform hover:scale-105"
                                    style={{
                                        backgroundColor: '#FFF0C8',
                                        color: '#3D1028',
                                        padding: '12px 32px',
                                    }}
                                >
                                    <span
                                        className="font-abril uppercase"
                                        style={{ fontSize: '15px', letterSpacing: '0.2em' }}
                                    >
                                        Start Lending
                                    </span>
                                </button>
                                <button
                                    className="rounded-full transition-all duration-300 transform hover:scale-105"
                                    style={{
                                        border: '2px solid rgba(255,240,200,0.5)',
                                        color: '#FFF0C8',
                                        padding: '12px 32px',
                                        backgroundColor: 'transparent',
                                    }}
                                >
                                    <span
                                        className="font-abril uppercase"
                                        style={{ fontSize: '15px', letterSpacing: '0.2em' }}
                                    >
                                        Start Borrowing
                                    </span>
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