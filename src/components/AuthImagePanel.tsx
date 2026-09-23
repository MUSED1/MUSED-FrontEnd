// components/AuthImagePanel.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface AuthImagePanelProps {
    heading?: React.ReactNode;
    subtext?: string;
}

// Editorial photo panel shared by every auth page (buyer and seller alike) —
// `heading`/`subtext` let a page swap the tagline without duplicating the
// whole panel.
export const AuthImagePanel: React.FC<AuthImagePanelProps> = ({
    heading = (
        <>
            The roommate
            <br />
            you wish you had.
        </>
    ),
    subtext = 'The one with the best finds before everyone else.',
}) => (
    <div className="relative w-full h-64 sm:h-80 overflow-hidden md:h-screen md:w-1/2 md:sticky md:top-0 lg:w-[45%]">
        <img
            src="/main1-hero.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
        />
        <div
            className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
            style={{
                backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
        />
        <div className="absolute inset-x-0 top-0 h-24 sm:h-32 md:h-56 bg-gradient-to-b from-plum-dark/65 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-full sm:h-2/3 bg-gradient-to-t from-plum-dark/90 via-plum-dark/55 sm:via-plum-dark/60 to-transparent" />
        <Link
            to="/"
            className="absolute left-5 top-5 z-20 inline-flex items-center gap-1 font-inter text-sm font-medium text-cream/80 transition-colors hover:text-gold sm:left-8 sm:top-8"
        >
            ← Back to MUSED
        </Link>

        <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-10 lg:p-14">
            {/* Wordmark — Kaldera, matching the homepage hero logo */}
            <span className="mb-3 sm:mb-5 font-kaldera text-lg sm:text-xl tracking-[0.15em] text-cream/85">
                MUSED 852
            </span>
            <div className="mb-3 sm:mb-5 h-px w-9 bg-[#C9A96E]" />
            <h1 className="font-amandine font-normal text-2xl sm:text-4xl leading-[1.1] text-cream lg:text-5xl">
                {heading}
            </h1>
            <p className="mt-4 hidden max-w-xs font-sans italic text-cream/70 text-base sm:block">
                {subtext}
            </p>
        </div>
    </div>
);
