// components/Confirmation.tsx
import { Header } from './Header'
import { Footer } from './Footer'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, XCircle, Mail, Heart } from 'lucide-react'

interface PaymentDetails {
    amount: number;
    originalAmount: number;
    discountApplied: boolean;
    promoCode?: string;
}

export function Confirmation() {
    const navigate = useNavigate();
    const [reservationError, setReservationError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [paymentStatus, setPaymentStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)

    useEffect(() => {
        window.scrollTo(0, 0);
        checkReservationStatus();
    }, [])

    const checkReservationStatus = async () => {
        try {
            setIsLoading(true);
            setPaymentStatus('verifying');

            // Check for any reservation errors set before redirect
            const error = localStorage.getItem('reservationError');
            if (error) {
                console.error('Reservation error detected:', error);
                setReservationError(error);
                setPaymentStatus('failed');
                localStorage.removeItem('reservationError');
                return;
            }

            // ✅ FIX: The webhook is now the single source of truth for reservation creation.
            // completePendingReservation (POST to /clothing/:id/reserve) has been removed
            // to eliminate the risk of creating a duplicate reservation if both the webhook
            // and this page fired at the same time. We now only check whether the webhook
            // already created the reservation via verify-payment's reservationCreated flag.
            const urlParams = new URLSearchParams(window.location.search);
            const paymentSuccess = urlParams.get('payment_success');
            const sessionId = urlParams.get('session_id');

            if (!paymentSuccess && !sessionId) {
                setReservationError('No reservation data found. Please contact support with your payment details.');
                setPaymentStatus('failed');
                return;
            }

            if (sessionId) {
                try {
                    const API_BASE_URL = 'https://mused-backend.onrender.com/api';
                    const verifyResponse = await fetch(`${API_BASE_URL}/verify-payment/${sessionId}`);

                    if (verifyResponse.ok) {
                        const verifyResult = await verifyResponse.json();

                        // Store payment details from verification response
                        if (verifyResult.amountTotal) {
                            const amountInHKD = verifyResult.amountTotal / 100;
                            setPaymentDetails({
                                amount: amountInHKD,
                                originalAmount: 290,
                                discountApplied: amountInHKD < 290,
                                promoCode: verifyResult.promoCode
                            });
                        } else {
                            const hasDiscount = sessionStorage.getItem('promoCodeApplied') === 'true';
                            setPaymentDetails({
                                amount: hasDiscount ? 250 : 290,
                                originalAmount: 290,
                                discountApplied: hasDiscount
                            });
                        }

                        if (!verifyResult.paid) {
                            setReservationError('Payment could not be verified. Please contact support with session ID: ' + sessionId);
                            setPaymentStatus('failed');
                            return;
                        }

                        if (verifyResult.reservationCreated) {
                            // Webhook already handled everything — show success
                            setPaymentStatus('success');
                        } else {
                            // Paid but webhook hasn't fired yet — poll up to ~10s before giving up
                            const API_BASE_URL_POLL = 'https://mused-backend.onrender.com/api';
                            let attempts = 0;
                            const poll = setInterval(async () => {
                                attempts++;
                                try {
                                    const r = await fetch(`${API_BASE_URL_POLL}/verify-payment/${sessionId}`);
                                    const result = await r.json();
                                    if (result.reservationCreated) {
                                        clearInterval(poll);
                                        setPaymentStatus('success');
                                        setIsLoading(false);
                                    } else if (attempts >= 5) {
                                        clearInterval(poll);
                                        setReservationError(
                                            'Your payment was received but your reservation is still being processed. ' +
                                            'Please contact support with session ID: ' + sessionId
                                        );
                                        setPaymentStatus('failed');
                                        setIsLoading(false);
                                    }
                                } catch {
                                    if (attempts >= 5) {
                                        clearInterval(poll);
                                        setReservationError(
                                            'Your payment was received but we could not confirm your reservation. ' +
                                            'Please contact support with session ID: ' + sessionId
                                        );
                                        setPaymentStatus('failed');
                                        setIsLoading(false);
                                    }
                                }
                            }, 2000);
                            return; // keep isLoading true while polling
                        }
                    } else {
                        throw new Error('Verification endpoint returned an error');
                    }
                } catch {
                    setReservationError(
                        'Your payment was received but we could not confirm your reservation. ' +
                        'Please contact support with your session ID: ' + (sessionId ?? 'unknown')
                    );
                    setPaymentStatus('failed');
                }
            } else {
                // payment_success=true but no session_id — cannot verify; direct to support
                setReservationError(
                    'Your payment may have been processed, but reservation data is missing. ' +
                    'Please contact support so we can complete your reservation manually.'
                );
                setPaymentStatus('failed');
            }

        } catch (error) {
            console.error('Error checking reservation status:', error);
            setReservationError('Unable to verify reservation status. Please contact support.');
            setPaymentStatus('failed');
        } finally {
            setIsLoading(false);
        }
    }

    const handleContactSupport = () => {
        const subject = encodeURIComponent('Reservation Issue - Payment Successful but Reservation Failed')
        const body = encodeURIComponent(
            `Hello Support Team,\n\nI recently made a payment for a reservation but encountered an issue with the reservation completion.\n\nError details: ${reservationError || 'Unknown error'}\n\nPlease assist me in resolving this issue.\n\nThank you.`
        )
        window.location.href = `mailto:support@mused.com?subject=${subject}&body=${body}`
    }

    const handleViewReservations = () => {
        navigate('/profile?tab=reservations');
    }

    const handleViewPicks = () => {
        navigate('/profile?tab=picks');
    }

    if (isLoading) {
        return (
            <div className="font-sans">
                <Header />
                <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 border-4 border-plum border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-plum text-lg">Verifying your reservation...</p>
                        <p className="text-plum/60 text-sm mt-2">Checking payment status and completing reservation</p>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-2xl mx-auto text-center">

                        {/* Error State */}
                        {reservationError && paymentStatus === 'failed' && (
                            <>
                                <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                                    <XCircle className="w-12 h-12 text-red-600" />
                                </div>

                                <h1 className="text-4xl md:text-5xl font-bold text-red-600 mb-6">
                                    Payment Successful, Reservation Issue
                                </h1>

                                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                                        <div className="flex items-center justify-center space-x-3 mb-4">
                                            <AlertCircle className="w-8 h-8 text-red-600" />
                                            <h2 className="text-2xl font-bold text-red-600">Reservation Not Completed</h2>
                                        </div>
                                        <p className="text-red-700 text-lg mb-4">
                                            Your payment was processed successfully, but we encountered an issue completing your reservation.
                                        </p>
                                        <p className="text-red-600">
                                            {reservationError}
                                        </p>
                                    </div>

                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                        <p className="text-plum/80 text-sm">
                                            Don't worry! Our support team will help you resolve this issue. Please contact us with the details below.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={handleContactSupport}
                                        className="bg-red-600 text-white px-8 py-3 rounded-full hover:bg-red-700 transition-all duration-300 font-semibold text-center flex items-center justify-center space-x-2"
                                    >
                                        <AlertCircle size={20} />
                                        <span>Contact Support Urgently</span>
                                    </button>
                                    <Link
                                        to="/collections-m"
                                        className="bg-gray-600 text-white px-8 py-3 rounded-full hover:bg-gray-700 transition-all duration-300 font-semibold text-center"
                                    >
                                        Back to Collection
                                    </Link>
                                </div>
                            </>
                        )}

                        {/* Success State - UPDATED WITH PROFILE REDIRECTS */}
                        {!reservationError && paymentStatus === 'success' && (
                            <>
                                <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-12 h-12 text-green-600" />
                                </div>

                                <h1 className="text-4xl md:text-5xl font-bold text-plum mb-6">
                                    Payment Successful!
                                </h1>

                                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                                    <p className="text-xl text-plum/80 mb-6 font-amandine">
                                        Thank you for your reservation! Your payment has been processed successfully.
                                    </p>

                                    <div className="bg-cream rounded-xl p-6 mb-6 text-left">
                                        <h2 className="text-2xl font-bold text-plum mb-4">Reservation Details</h2>
                                        <div className="space-y-3 text-plum/80">
                                            <div className="flex justify-between">
                                                <span className="font-semibold">Event:</span>
                                                <span>Wear Something Borrowed Dinner</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-semibold">Date:</span>
                                                <span>March 19, 2025</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-semibold">Time:</span>
                                                <span>8:00 PM</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-semibold">Location:</span>
                                                <span>Pazta 10 Hollywood road, central Hong Kong</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold text-gold mt-4 pt-4 border-t border-amber-200">
                                                <span>Amount Paid:</span>
                                                <span>{paymentDetails?.amount || 290} HKD</span>
                                            </div>
                                            {paymentDetails?.discountApplied && (
                                                <div className="flex justify-between text-sm text-green-600">
                                                    <span>Original Price:</span>
                                                    <span className="line-through text-gray-400">{paymentDetails.originalAmount} HKD</span>
                                                </div>
                                            )}
                                            {paymentDetails?.promoCode && (
                                                <div className="flex justify-between text-sm text-green-600">
                                                    <span>Promo Code Applied:</span>
                                                    <span className="font-mono">{paymentDetails.promoCode}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                                        <div className="flex items-center space-x-3">
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                            <div>
                                                <p className="text-green-800 font-semibold">Reservation Confirmed!</p>
                                                <p className="text-green-700 text-sm mt-1">
                                                    Your reservation has been successfully processed. A confirmation email has been sent to your email address with all the details.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={handleViewReservations}
                                        className="bg-gradient-to-r from-plum to-rose text-cream px-8 py-3 rounded-full hover:shadow-xl transition-all duration-300 font-semibold text-center flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={20} />
                                        View My Reservations
                                    </button>
                                    <button
                                        onClick={handleViewPicks}
                                        className="bg-cream text-plum px-8 py-3 rounded-full hover:bg-amber-100 transition-all duration-300 font-semibold text-center flex items-center justify-center gap-2 border-2 border-plum/20"
                                    >
                                        <Heart size={20} />
                                        Go to My Picks
                                    </button>
                                </div>

                                <div className="mt-4">
                                    <Link
                                        to="/collections-m"
                                        className="text-plum/60 hover:text-plum transition-colors duration-300 text-sm underline"
                                    >
                                        Continue browsing collection
                                    </Link>
                                </div>
                            </>
                        )}

                        {/* Help Section */}
                        <div className="mt-12 pt-8 border-t border-amber-200">
                            <p className="text-plum/60 mb-4">
                                Need help with your reservation?
                            </p>
                            <button
                                onClick={handleContactSupport}
                                className="text-gold hover:text-plum transition-colors duration-300 font-semibold underline flex items-center justify-center space-x-2 mx-auto"
                            >
                                <Mail size={16} />
                                <span>Contact Support</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}