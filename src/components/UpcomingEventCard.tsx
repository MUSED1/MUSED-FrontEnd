// components/UpcomingEventCard.tsx
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

// General "next gathering" card — shared by the Events page and My Reservations.
export function UpcomingEventCard() {
    return (
        <Link
            to="/events/next"
            className="group relative flex flex-col overflow-hidden rounded-3xl bg-plum-dark sm:flex-row"
        >
            <div className="relative h-56 w-full overflow-hidden sm:h-auto sm:w-2/5">
                <img
                    src="https://res.cloudinary.com/dapfjngt2/image/upload/v1778993726/quick_Eternity_2__page-0001_kgg4kr.jpg"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs text-plum-dark">
                    Coming Soon
                </span>
            </div>

            <div className="flex flex-1 flex-col justify-center p-6 sm:p-8">
                <h3 className="font-kaldera text-2xl text-cream sm:text-3xl">
                    Drinks, Dinners &amp; <span className="italic">Gatherings</span>
                </h3>
                <p className="mt-3 text-sm text-cream/60">
                    The next date drops to the list first. Pre-register to secure your spot.
                </p>

                <div className="mt-5 flex items-center justify-end">
                    <span className="flex items-center gap-1.5 text-sm text-cream/80 transition-colors group-hover:text-gold">
                        Pre-Register
                        <ArrowUpRight size={15} />
                    </span>
                </div>
            </div>
        </Link>
    )
}
