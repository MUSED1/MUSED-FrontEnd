// components/Confirmation.tsx
import { Header } from './Header'
import { Footer } from './Footer'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'

interface ReservationFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    instructions: string;
    pickupDate: string;
    pickupMethod: string;
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

    useEffect(() => {
        // Scroll to top on component mount
        window.scrollTo(0, 0);

        // Check for reservation completion status
        checkReservationStatus();
    }, []);

    const checkReservationStatus = async () => {
        try {
            setIsLoading(true);

            // Check for any reservation errors from the payment flow
            const error = localStorage.getItem('reservationError');
            const pendingReservation = localStorage.getItem('pendingReservation');

            if (error) {
                console.error('Reservation error detected:', error);
                setReservationError(error);

                // Clear the error from storage
                localStorage.removeItem('reservationError');
            } else if (pendingReservation) {
                // If there's still a pending reservation, try to complete it
                try {
                    const parsedReservation: PendingReservation = JSON.parse(pendingReservation);
                    await completePendingReservation(parsedReservation.formData, parsedReservation.outfit);
                } catch (err) {
                    console.error('Failed to complete pending reservation:', err);
                    setReservationError('Failed to complete reservation after payment. Please contact support.');
                }
            }

            // Clean up any pending reservation data
            localStorage.removeItem('pendingReservation');

        } catch (error) {
            console.error('Error checking reservation status:', error);
            setReservationError('Unable to verify reservation status. Please contact support.');
        } finally {
            setIsLoading(false);
        }
    };

    const completePendingReservation = async (formData: ReservationFormData, outfit: Outfit) => {
        try {
            const reservationData = {
                fullName: formData.name,
                email: formData.email,
                phoneNumber: formData.phone,
                pickupMethod: formData.pickupMethod,
                pickupTime: formData.pickupDate,
                pickupDay: '',
                pickupInstructions: formData.instructions,
                specialInstructions: formData.instructions
            };

            console.log('Completing pending reservation:', reservationData);

            const API_BASE_URL = 'https://mused-backend.onrender.com/api/clothing';
            const response = await fetch(`${API_BASE_URL}/${outfit.id}/reserve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reservationData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to submit reservation: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to submit reservation');
            }

            console.log('Pending reservation completed successfully');

        } catch (error) {
            console.error('Pending reservation completion error:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            setReservationError(`Payment was successful but reservation failed: ${errorMessage}`);
            throw error;
        }
    };

    const handleContactSupport = () => {
        const subject = encodeURIComponent('Reservation Issue - Payment Successful but Reservation Failed');
        const body = encodeURIComponent(
            `Hello Support Team,\n\nI recently made a payment for a reservation but encountered an issue with the reservation completion.\n\nError details: ${reservationError || 'Unknown error'}\n\nPlease assist me in resolving this issue.\n\nThank you.`
        );
        window.location.href = `mailto:support@mused.com?subject=${subject}&body=${body}`;
    };

    if (isLoading) {
        return (
            <div className="font-sans">
                <Header />
                <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 border-4 border-plum border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-plum text-lg">Verifying your reservation...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50">
                <div className="container mx-auto px-4 py-16">
                    {/* Success Confirmation Section */}
                    <div className="max-w-2xl mx-auto text-center">

                        {reservationError ? (
                            // Error State
                            <>
                                {/* Error Icon */}
                                <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                                    <XCircle className="w-12 h-12 text-red-600" />
                                </div>

                                {/* Error Message */}
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

                                {/* Action Buttons for Error State */}
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
                        ) : (
                            // Success State
                            <>
                                {/* Success Icon */}
                                <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-12 h-12 text-green-600" />
                                </div>

                                {/* Success Message */}
                                <h1 className="text-4xl md:text-5xl font-bold text-plum mb-6">
                                    Payment Successful!
                                </h1>

                                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                                    <p className="text-xl text-plum/80 mb-6 font-amandine">
                                        Thank you for your reservation! Your payment has been processed successfully.
                                    </p>

                                    {/* Order Details */}
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

                                    {/* Confirmation Message */}
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

                                {/* Action Buttons */}
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
                                className="text-gold hover:text-plum transition-colors duration-300 font-semibold underline"
                            >
                                Contact Support
                            </button>
                        </div>

                        {/* Debug Info (remove in production) */}

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}