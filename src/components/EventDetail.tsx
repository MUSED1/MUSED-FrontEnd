// components/EventDetail.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2, MapPin, Calendar, ArrowUpRight, Instagram, Link2, X } from 'lucide-react'
import { Footer } from './Footer'

const EVENT = {
    tag: 'Dinner',
    title: 'Wear Something Borrowed',
    dateLabel: 'June 18th, 2026',
    timeLabel: '8:00 PM',
    venue: 'Ping Pong',
    address: '129 Second Street L/G Nam Cheong House, Sai Ying Pun, Hong Kong',
    price: 'HK$ 290',
    image: 'https://res.cloudinary.com/dapfjngt2/image/upload/v1778993726/quick_Eternity_2__page-0001_kgg4kr.jpg',
    description:
        "Come wearing a borrowed piece from the collection. This is where muses can meet the mused. Get to know who you are lending to and borrowing from. Share your style, share a moment.",
    mapQuery: '129 Second Street, Sai Ying Pun, Hong Kong',
}

export function EventDetail() {
    const navigate = useNavigate()
    const [shareOpen, setShareOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
    const shareText = `${EVENT.title} — MUSED`

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // clipboard unavailable — silently ignore
        }
    }

    return (
        <div className="font-inter">
            <main className="min-h-screen bg-white">
                {/* Hero */}
                <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
                    <img src={EVENT.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />

                    <div className="absolute inset-x-4 top-4 flex items-center justify-between sm:top-6">
                        <button
                            onClick={() => navigate('/events')}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-plum-dark backdrop-blur-sm transition-colors hover:bg-white"
                            aria-label="Back to Events"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShareOpen((v) => !v)}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-plum-dark backdrop-blur-sm transition-colors hover:bg-white"
                                aria-label="Share"
                            >
                                {shareOpen ? <X size={16} /> : <Share2 size={16} />}
                            </button>

                            {shareOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShareOpen(false)}
                                    />
                                    <div className="absolute right-0 top-12 z-20 w-52 overflow-hidden rounded-2xl bg-white py-2 shadow-xl">
                                        <a
                                            href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-plum-dark transition-colors hover:bg-plum-dark/5"
                                        >
                                            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-current">
                                                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38c1.45.79 3.08 1.21 4.76 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.76 14.02c-.24.68-1.19 1.24-1.94 1.4-.52.11-1.2.2-3.48-.75-2.92-1.21-4.8-4.16-4.94-4.35-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.78-.36h.56c.18 0 .42-.07.65.5.24.58.82 2.01.89 2.15.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.18-.27.36-.22.6-.13.24.09 1.53.72 1.79.85.26.13.44.19.5.3.06.11.06.63-.18 1.31z" />
                                            </svg>
                                            WhatsApp
                                        </a>
                                        <a
                                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-plum-dark transition-colors hover:bg-plum-dark/5"
                                        >
                                            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-current">
                                                <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
                                            </svg>
                                            Facebook
                                        </a>
                                        <button
                                            onClick={() => { copyLink(); }}
                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-plum-dark transition-colors hover:bg-plum-dark/5"
                                        >
                                            <Instagram size={16} className="shrink-0" />
                                            <span>{copied ? 'Link copied!' : 'Instagram (copy link)'}</span>
                                        </button>
                                        <button
                                            onClick={() => { copyLink(); }}
                                            className="flex w-full items-center gap-3 border-t border-cream px-4 py-2.5 text-left text-sm text-plum/60 transition-colors hover:bg-plum-dark/5"
                                        >
                                            <Link2 size={16} className="shrink-0" />
                                            <span>{copied ? 'Copied!' : 'Copy link'}</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info card */}
                <div className="relative z-10 mx-auto -mt-8 max-w-2xl rounded-t-[2rem] bg-white px-6 pb-32 pt-6 shadow-[0_-8px_24px_rgba(61,16,40,0.08)] sm:px-8">
                    <span className="inline-block rounded-full bg-plum-dark/6 px-3 py-1 text-xs text-plum-dark">
                        {EVENT.tag}
                    </span>

                    <h1 className="mt-4 font-kaldera text-3xl text-plum-dark sm:text-4xl">
                        {EVENT.title}
                    </h1>

                    <div className="mt-4 space-y-2 text-sm text-plum/60">
                        <div className="flex items-center gap-2">
                            <MapPin size={15} className="text-plum/40" />
                            {EVENT.venue} — {EVENT.address}
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={15} className="text-plum/40" />
                            {EVENT.dateLabel} · {EVENT.timeLabel}
                        </div>
                    </div>

                    <div className="my-6 h-px w-9 bg-[#C9A96E]" />

                    <div>
                        <h2 className="font-kaldera text-lg text-plum-dark">About this dinner</h2>
                        <p className="mt-2 leading-relaxed text-plum/70">{EVENT.description}</p>
                    </div>

                    <div className="mt-8 flex items-center gap-3 border-t border-cream pt-6">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-plum-dark font-kaldera text-sm text-cream">
                            M
                        </div>
                        <div>
                            <p className="text-sm font-medium text-plum-dark">Hosted by MUSED</p>
                            <p className="text-xs text-plum/50">852 — Hong Kong</p>
                        </div>
                    </div>

                    <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(EVENT.mapQuery)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 flex items-center justify-between border-t border-cream py-4 text-sm text-plum-dark"
                    >
                        View on map
                        <ArrowUpRight size={15} className="text-plum/40" />
                    </a>
                </div>

                {/* Sticky book bar */}
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-plum-dark/10 bg-white/95 px-6 py-4 backdrop-blur-xl sm:px-8">
                    <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-plum/50">Per person</p>
                            <p className="font-kaldera text-2xl text-plum-dark">{EVENT.price}</p>
                        </div>
                        <div className="rounded-full shadow-[0_8px_16px_rgba(61,16,40,0.18)]">
                            <button
                                onClick={() => navigate('/collections-hk')}
                                className="rounded-full border border-white/15 bg-gradient-to-b from-plum-dark to-plum px-8 py-3.5 text-sm font-normal text-cream transition-all hover:brightness-110"
                            >
                                Pick Your Outfit
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
