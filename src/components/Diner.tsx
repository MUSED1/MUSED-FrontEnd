// components/Diner.tsx
import { useState, useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { Link } from "react-router-dom";

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

export function Diner() {
    const { displayed: musedText, done: musedDone } = useTypewriter('MUSED', 80, 200)
    const { displayed: eventText }                  = useTypewriter('EVENT', 80, 780)

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen w-full overflow-hidden" style={{ backgroundColor: '#fff9e6' }}>
                <div className="container mx-auto px-4 py-16">

                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        {/* H1: Kaldera, 72px on home / 48px elsewhere — using 72px as this is a hero */}
                        <h1
                            className="font-kaldera tracking-tight drop-shadow-sm mb-6"
                            style={{ fontSize: 'clamp(48px, 8vw, 72px)', lineHeight: 1, color: '#5B1B3A' }}
                        >
                            {musedText}
                            {!musedDone && (
                                <span
                                    className="inline-block w-[3px] h-[0.8em] ml-1 align-middle animate-pulse"
                                    style={{ backgroundColor: '#5B1B3A', verticalAlign: 'middle' }}
                                />
                            )}{' '}
                            <span style={{ fontStyle: 'italic', color: '#7A2B50' }}>
                                {eventText}
                                {musedDone && eventText.length < 5 && (
                                    <span
                                        className="inline-block w-[3px] h-[0.8em] ml-1 align-middle animate-pulse"
                                        style={{ backgroundColor: '#7A2B50', verticalAlign: 'middle' }}
                                    />
                                )}
                            </span>
                        </h1>

                        {/* Tagline: Abril Display italic, burgundy */}
                        <p
                            className="font-abril max-w-2xl mx-auto"
                            style={{
                                color: '#6B0202',
                                fontSize: '36px',
                                lineHeight: 1.3,
                                fontStyle: 'italic',
                            }}
                        >
                            Be Mused and meet your muse.
                        </p>
                        {/* Body: Baskerville */}
                        <p
                            className="font-sans text-lg mt-3 max-w-xl mx-auto"
                            style={{ color: 'rgba(91,27,58,0.75)' }}
                        >
                            Mused is more than sharing style, it's sharing an experience.
                        </p>
                    </div>

                    {/* Wear Something Borrowed Section */}
                    <div
                        className="rounded-2xl shadow-lg overflow-hidden mb-16 border"
                        style={{ backgroundColor: '#FFF0C8', borderColor: 'rgba(91,27,58,0.1)' }}
                    >
                        <div className="md:flex">
                            {/* Text side */}
                            <div className="md:w-1/2 p-8 flex flex-col justify-between">
                                {/* Section label: Abril Display, uppercase, tracking 200, 15px */}
                                <div className="inline-block mb-4">
                                    <span
                                        className="font-abril text-[15px] uppercase border rounded-full px-3 py-1"
                                        style={{
                                            color: '#5B1B3A',
                                            letterSpacing: '0.2em',
                                            borderColor: 'rgba(91,27,58,0.2)',
                                            backgroundColor: '#fff9e6',
                                        }}
                                    >
                                        Next Event
                                    </span>
                                </div>

                                {/* Title: Kaldera, one word italic */}
                                <h2
                                    className="font-kaldera mb-4"
                                    style={{ fontSize: '36px', color: '#5B1B3A', lineHeight: 1.15 }}
                                >
                                    Wear Something{' '}
                                    <span style={{ fontStyle: 'italic' }}>Borrowed</span>{' '}
                                    Dinner
                                </h2>

                                {/* Body: Baskerville */}
                                <p
                                    className="font-sans text-lg leading-relaxed mb-6"
                                    style={{ color: 'rgba(91,27,58,0.8)' }}
                                >
                                    Come to dinner wearing a borrowed piece from the collection. This is where muses
                                    can meet the mused. Get to know who you are lending to and borrowing from. Share your
                                    style, share a moment.
                                </p>

                                <div className="flex justify-between items-center">
                                    {/* Price */}
                                    <span
                                        className="font-kaldera"
                                        style={{ fontSize: '32px', color: '#5B1B3A' }}
                                    >
                                        $46
                                    </span>

                                    {/* CTA: Abril Display, uppercase, tracking 200, 15px */}
                                    <Link
                                        to="/collections-ny"
                                        className="rounded-full transition-all duration-300"
                                        style={{
                                            backgroundColor: '#5B1B3A',
                                            color: '#FFF0C8',
                                            padding: '12px 28px',
                                            fontFamily: 'inherit',
                                        }}
                                    >
                                        <span
                                            className="font-abril uppercase"
                                            style={{ fontSize: '15px', letterSpacing: '0.2em' }}
                                        >
                                            Pick Your Outfit
                                        </span>
                                    </Link>
                                </div>
                            </div>

                            {/* Event details side */}
                            <div
                                className="md:w-1/2 p-8 flex items-center justify-center"
                                style={{ backgroundColor: '#3D1028' }}
                            >
                                <div className="text-center">
                                    {/* Label */}
                                    <span
                                        className="font-abril text-[15px] uppercase block mb-6"
                                        style={{ color: 'rgba(255,240,200,0.6)', letterSpacing: '0.2em' }}
                                    >
                                        Wear Something Borrowed
                                    </span>

                                    {/* Date: Kaldera */}
                                    <p
                                        className="font-kaldera mb-2"
                                        style={{ fontSize: '48px', color: '#FFF0C8', lineHeight: 1 }}
                                    >
                                        April 30
                                    </p>
                                    <p
                                        className="font-kaldera mb-6"
                                        style={{ fontSize: '28px', color: 'rgba(255,240,200,0.7)', lineHeight: 1 }}
                                    >
                                        2026
                                    </p>

                                    {/* Divider */}
                                    <div
                                        className="w-12 mx-auto mb-6"
                                        style={{ height: '1px', backgroundColor: 'rgba(255,240,200,0.3)' }}
                                    />

                                    {/* Location: Abril Display, uppercase, tracking 270 (location style) */}
                                    <p
                                        className="font-abril uppercase text-[13px]"
                                        style={{ color: 'rgba(255,240,200,0.75)', letterSpacing: '0.27em', lineHeight: 1.8 }}
                                    >
                                        8:00 PM<br />
                                        Quick Eternity<br />
                                        22 Peck Slip<br />
                                        New York City
                                    </p>

                                    {/* Hand note: Abril Display italic, cream */}
                                    <p
                                        className="font-abril mt-6"
                                        style={{
                                            color: 'rgba(255,240,200,0.5)',
                                            fontSize: '22px',
                                            fontStyle: 'italic',
                                            lineHeight: 1.3,
                                        }}
                                    >
                                        Let yourself be Mused...
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    )
}