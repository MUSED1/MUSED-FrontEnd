// components/MyReservations.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { UpcomingEventCard } from './UpcomingEventCard';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

interface ClothingItem {
    _id: string;
    images: string[];
    category: string;
    size: string;
    fullName?: string;
}

interface Reservation {
    _id: string;
    clothingId: ClothingItem;
    pickupDay: string;
    pickupTime: string;
    returnDay: string;
    returnTime: string;
    status: 'active' | 'completed' | 'cancelled';
    createdAt: string;
}

export function MyReservations() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchReservations = async () => {
            try {
                const token = localStorage.getItem('token');
                const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

                const response = await axios.get(`${API_URL}/users/reservations`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    setReservations(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching reservations:', error);
                setReservations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="font-inter">
            <Header />
            <main className="min-h-screen bg-cream-clear pt-28 md:pt-32 pb-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm text-plum/50 hover:text-plum-dark transition-colors mb-4">
                        <ArrowLeft size={14} />
                        Profile
                    </Link>

                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-kaldera text-plum-dark">My Reservations</h1>
                        <span className="rounded-full bg-plum-dark/6 px-3 py-1 text-xs text-plum-dark">
                            {reservations.length} confirmed
                        </span>
                    </div>
                    <div className="mb-8 h-px w-9 bg-[#C9A96E]" />

                    <h2 className="mb-4 font-kaldera text-xl text-plum-dark">Upcoming</h2>
                    <div className="mb-12">
                        <UpcomingEventCard />
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-plum-dark/20 border-t-plum-dark rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : reservations.length === 0 ? (
                        <div className="rounded-[1.75rem] border border-plum-dark/8 bg-cream-clear p-12 text-center shadow-[0_8px_24px_rgba(61,16,40,0.06)]">
                            <CheckCircle size={40} className="text-plum/20 mx-auto mb-4" />
                            <p className="text-plum/60 mb-2">No reservations yet</p>
                            <p className="text-sm text-plum/40 mb-6">Your paid and confirmed reservations will appear here</p>
                            <div className="inline-block rounded-full shadow-[0_8px_16px_rgba(61,16,40,0.18)]">
                                <button
                                    onClick={() => navigate('/shop')}
                                    className="rounded-full border border-white/15 bg-gradient-to-b from-plum-dark to-plum px-6 py-3 text-sm font-normal text-cream transition-all hover:brightness-110 active:scale-[0.98]"
                                >
                                    Browse Collection
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-plum-dark/6">
                            {reservations.map((reservation) => (
                                <div key={reservation._id} className="py-8 first:pt-0">
                                    <div className="flex flex-col md:flex-row md:gap-6">
                                        {reservation.clothingId?.images?.length > 0 && (
                                            <div className="md:w-48 h-48 md:h-auto shrink-0 overflow-hidden rounded-2xl mb-4 md:mb-0">
                                                <img
                                                    src={reservation.clothingId.images[0]}
                                                    alt={reservation.clothingId.category}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-kaldera text-plum-dark">
                                                        {reservation.clothingId?.fullName
                                                            ? `${reservation.clothingId.fullName}'s ${reservation.clothingId.category}`
                                                            : 'Reserved Item'}
                                                    </h3>
                                                    <p className="text-plum/60">Size: {reservation.clothingId?.size || 'N/A'}</p>
                                                </div>
                                                <span className="flex items-center gap-1 rounded-full border border-emerald-600/20 bg-emerald-50/60 px-3 py-1 text-xs text-emerald-700">
                                                    <CheckCircle size={12} />
                                                    Paid & confirmed
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                                <div className="rounded-2xl bg-plum-dark/[0.03] p-3">
                                                    <p className="text-xs text-plum/40">Delivery</p>
                                                    <p className="text-sm font-medium text-plum-dark">{reservation.pickupDay || 'Not specified'}</p>
                                                    <p className="text-xs text-plum/60">{reservation.pickupTime || ''}</p>
                                                </div>
                                                <div className="rounded-2xl bg-plum-dark/[0.03] p-3">
                                                    <p className="text-xs text-plum/40">Return/Pickup</p>
                                                    <p className="text-sm font-medium text-plum-dark">{reservation.returnDay || 'Not specified'}</p>
                                                    <p className="text-xs text-plum/60">{reservation.returnTime || ''}</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center text-xs text-plum/40 border-t border-plum-dark/6 pt-3">
                                                <span>Reserved on: {new Date(reservation.createdAt).toLocaleDateString()}</span>
                                                <span className="rounded-full bg-plum-dark/5 px-2.5 py-1 text-plum-dark/70">
                                                    {reservation.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
