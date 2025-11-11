// components/Confirmation.tsx
import { Header } from './Header'
import { Footer } from './Footer'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Mail } from 'lucide-react'

interface ReservationFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    instructions: string;
    pickupDate: string;
    pickupMethod: string;
    deliveryDay?: string;
    deliveryTime?: string;
    deliveryMethod?: string;
    agreeToTerms: boolean;
}

interface Outfit {
    id: string;
    name: string;
    image: string;
    description: string;
    size: string;
    category: string;
    status: string;
}

interface PendingReservation {
    formData: ReservationFormData;
    outfit: Outfit;
    sessionId: string;
    timestamp: string;
}

export function Confirmation() {
    const [reservationError, setReservationError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [recoveryData, setRecoveryData] = useState<PendingReservation | null>(null)
    const [paymentStatus, setPaymentStatus] = useState<'verifying' | 'success' | 'failed' | 'recovery'>('verifying')

    useEffect(() => {
        window.scrollTo(0, 0);
        checkReservationStatus();
    }, [])

    const verifyPaymentStatus = async (sessionId: string): Promise<boolean> => {
        try {
            // Try to verify payment with backend
            const API_BASE_URL = 'https://mused-backend.onrender.com/api';
            const response = await fetch(`${API_BASE_URL}/verify-payment/${sessionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const result = await response.json();
                return result.paid === true;
            }
        } catch (error) {
            console.warn('Payment verification failed, using fallback methods:', error);
        }

        // Fallback: Check URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const paymentSuccess = urlParams.get('payment_success');
        const stripeSession = urlParams.get('session_id');

        if (paymentSuccess === 'true' || stripeSession) {
            return true;
        }

        // Fallback: Check if coming from Stripe
        if (document.referrer.includes('stripe.com')) {
            return true;
        }

        return false;
    }

    const completePendingReservation = async (formData: ReservationFormData, outfit: Outfit) => {
        try {
            // Use deliveryMethod if available, otherwise fallback to pickupMethod
            const pickupMethod = formData.deliveryMethod || formData.pickupMethod;

            const reservationData = {
                fullName: formData.name,
                email: formData.email,
                phoneNumber: formData.phone,
                pickupMethod: pickupMethod,
                pickupTime: formData.deliveryTime || formData.pickupDate,
                pickupDay: formData.deliveryDay || formData.pickupDate,
                pickupInstructions: formData.instructions,
                specialInstructions: formData.instructions
            }

            console.log('Completing pending reservation:', reservationData)

            // Validate that all required fields are present
            if (!reservationData.fullName || !reservationData.email || !reservationData.phoneNumber || !reservationData.pickupMethod) {
                throw new Error('Missing required fields: ' + JSON.stringify({
                    fullName: !!reservationData.fullName,
                    email: !!reservationData.email,
                    phoneNumber: !!reservationData.phoneNumber,
                    pickupMethod: !!reservationData.pickupMethod
                }));
            }

            const API_BASE_URL = 'https://mused-backend.onrender.com/api/clothing'
            const response = await fetch(`${API_BASE_URL}/${outfit.id}/reserve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reservationData),
            })

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { message: `HTTP error: ${response.status}` };
                }
                throw new Error(errorData.message || `Failed to submit reservation: ${response.status}`)
            }

            const result = await response.json()

            if (!result.success) {
                throw new Error(result.message || 'Failed to submit reservation')
            }

            console.log('Pending reservation completed successfully')
            // Clear pending reservation on success
            localStorage.removeItem('pendingReservation')

        } catch (error) {
            console.error('Pending reservation completion error:', error)
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
            setReservationError(`Payment was successful but reservation failed: ${errorMessage}`)
            throw error
        }
    }

    const checkReservationStatus = async () => {
        try {
            setIsLoading(true);
            setPaymentStatus('verifying');

            // Check for any reservation errors
            const error = localStorage.getItem('reservationError');
            const pendingReservation = localStorage.getItem('pendingReservation');

            if (error) {
                console.error('Reservation error detected:', error);
                setReservationError(error);
                setPaymentStatus('failed');
                localStorage.removeItem('reservationError');
                return;
            }

            if (pendingReservation) {
                try {
                    const parsedReservation: PendingReservation = JSON.parse(pendingReservation);
                    setRecoveryData(parsedReservation);

                    // Verify payment status
                    const paymentVerified = await verifyPaymentStatus(parsedReservation.sessionId);

                    if (paymentVerified) {
                        try {
                            await completePendingReservation(parsedReservation.formData, parsedReservation.outfit);
                            setPaymentStatus('success');
                            localStorage.removeItem('pendingReservation');
                        } catch (reservationError) {
                            console.error('Reservation completion failed:', reservationError);
                            setPaymentStatus('recovery');
                            setReservationError('Reservation failed after payment. Please try completing it below.');
                        }
                    } else {
                        setPaymentStatus('recovery');
                        setReservationError('Payment status could not be verified. Please complete your reservation below.');
                    }
                } catch (err) {
                    console.error('Failed to process pending reservation:', err);
                    setReservationError('Failed to complete reservation after payment. Please contact support.');
                    setPaymentStatus('failed');
                }
            } else {
                // No pending reservation found
                const urlParams = new URLSearchParams(window.location.search);
                const paymentSuccess = urlParams.get('payment_success');

                if (paymentSuccess === 'true') {
                    setPaymentStatus('success');
                } else {
                    setReservationError('No reservation data found. Please contact support with your payment details.');
                    setPaymentStatus('failed');
                }
            }

        } catch (error) {
            console.error('Error checking reservation status:', error);
            setReservationError('Unable to verify reservation status. Please contact support.');
            setPaymentStatus('failed');
        } finally {
            setIsLoading(false);
        }
    }

    const handleRetryReservation = async () => {
        if (!recoveryData) return

        setIsLoading(true)
        try {
            await completePendingReservation(recoveryData.formData, recoveryData.outfit)
            setPaymentStatus('success')
            setReservationError(null)
        } catch (error) {
            console.error('Retry failed:', error)
            setReservationError('Failed to complete reservation. Please contact support.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleContactSupport = () => {
        const subject = encodeURIComponent('Reservation Issue - Payment Successful but Reservation Failed')
        const body = encodeURIComponent(
            `Hello Support Team,\n\nI recently made a payment for a reservation but encountered an issue with the reservation completion.\n\nError details: ${reservationError || 'Unknown error'}\n\nPlease assist me in resolving this issue.\n\nThank you.`
        )
        window.location.href = `mailto:support@mused.com?subject=${subject}&body=${body}`
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

                        {/* Recovery State - Payment verified but reservation incomplete */}
                        {paymentStatus === 'recovery' && recoveryData && (
                            <>
                                <div className="w-24 h-24 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
                                    <RefreshCw className="w-12 h-12 text-amber-600" />
                                </div>

                                <h1 className="text-4xl md:text-5xl font-bold text-amber-600 mb-6">
                                    Complete Your Reservation
                                </h1>

                                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
                                        <div className="flex items-center justify-center space-x-3 mb-4">
                                            <AlertCircle className="w-8 h-8 text-amber-600" />
                                            <h2 className="text-2xl font-bold text-amber-600">Reservation Almost Complete</h2>
                                        </div>
                                        <p className="text-amber-700 text-lg mb-4">
                                            Your payment was processed successfully, but we need to complete your reservation.
                                        </p>
                                        <div className="bg-white rounded-lg p-4 border border-amber-300">
                                            <p className="text-amber-800 font-semibold">Reservation Details:</p>
                                            <p className="text-amber-700">Item: {recoveryData.outfit.name}</p>
                                            <p className="text-amber-700">Email: {recoveryData.formData.email}</p>
                                            <p className="text-amber-700">Size: {recoveryData.outfit.size}</p>
                                            <p className="text-amber-700">Delivery Day: {recoveryData.formData.deliveryDay || 'Not specified'}</p>
                                            <p className="text-amber-700">Delivery Time: {recoveryData.formData.deliveryTime || 'Not specified'}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <button
                                            onClick={handleRetryReservation}
                                            disabled={isLoading}
                                            className="bg-amber-600 text-white px-8 py-3 rounded-full hover:bg-amber-700 transition-all duration-300 font-semibold text-center flex items-center justify-center space-x-2 disabled:opacity-50"
                                        >
                                            {isLoading ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <RefreshCw size={20} />
                                            )}
                                            <span>Complete Reservation</span>
                                        </button>
                                        <button
                                            onClick={handleContactSupport}
                                            className="bg-gray-600 text-white px-8 py-3 rounded-full hover:bg-gray-700 transition-all duration-300 font-semibold text-center flex items-center justify-center space-x-2"
                                        >
                                            <Mail size={20} />
                                            <span>Contact Support</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

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
                                        to="/diner"
                                        className="bg-gray-600 text-white px-8 py-3 rounded-full hover:bg-gray-700 transition-all duration-300 font-semibold text-center"
                                    >
                                        Back to Diner
                                    </Link>
                                </div>
                            </>
                        )}

                        {/* Success State */}
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
                                                <span>Nov 18, 2025</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-semibold">Time:</span>
                                                <span>7:00 PM</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-semibold">Location:</span>
                                                <span>Central Hong Kong</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold text-gold mt-4 pt-4 border-t border-amber-200">
                                                <span>Amount Paid:</span>
                                                <span>250 HKD</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                                        <div className="flex items-center space-x-3">
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                            <div>
                                                <p className="text-green-800 font-semibold">Reservation Confirmed!</p>
                                                <p className="text-green-700 text-sm mt-1">
                                                    Your reservation has been successfully processed. A confirmation email has been sent to your email address with all the details.
                                                    Please check your inbox and spam folder.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        to="/diner"
                                        className="bg-plum text-cream px-8 py-3 rounded-full hover:bg-gold transition-all duration-300 font-semibold text-center"
                                    >
                                        Back to Diner
                                    </Link>
                                    <Link
                                        to="/"
                                        className="bg-gold text-plum px-8 py-3 rounded-full hover:bg-plum hover:text-cream transition-all duration-300 font-semibold text-center"
                                    >
                                        Return to Home
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