// components/Confirmation.tsx
import { Header } from './Header'
import { Footer } from './Footer'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'

export function Confirmation() {
    useEffect(() => {
        // Scroll to top on component mount
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50">
                <div className="container mx-auto px-4 py-16">
                    {/* Success Confirmation Section */}
                    <div className="max-w-2xl mx-auto text-center">
                        {/* Success Icon */}
                        <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-12 h-12 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
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
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                <p className="text-plum/80 text-sm">
                                    A confirmation email has been sent to your email address with all the details.
                                    Please check your inbox and spam folder.
                                </p>
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

                        {/* Help Section */}
                        <div className="mt-12 pt-8 border-t border-amber-200">
                            <p className="text-plum/60 mb-4">
                                Need help with your reservation?
                            </p>
                            <a
                                href="mailto:support@mused.com"
                                className="text-gold hover:text-plum transition-colors duration-300 font-semibold"
                            >
                                Contact Support
                            </a>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}