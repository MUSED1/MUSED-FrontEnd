import React, { useState } from 'react'

export function Newsletter() {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false)
            setEmail('')
            alert('Thank you for subscribing!')
        }, 1000)
    }

    return (
        <section className="py-16 bg-burgundy w-full transform transition-all duration-500 hover:bg-burgundy/95">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-cream mb-4 transform transition-all duration-700 hover:scale-105 hover:text-gold">
                    Join Our Community
                </h2>
                <p className="text-cream/90 max-w-2xl mx-auto mb-8 transform transition-all duration-500 delay-100 hover:scale-105">
                    Subscribe to our newsletter and be the first to know about new
                    collections, events, and fashion inspiration.
                </p>
                <form
                    onSubmit={handleSubmit}
                    className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 transform transition-all duration-500 delay-200"
                >
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        className="flex-grow px-4 py-3 rounded focus:outline-none transform transition-all duration-300 focus:scale-105 focus:shadow-2xl focus:ring-2 focus:ring-gold"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-cream text-burgundy font-medium px-6 py-3 rounded transform transition-all duration-300 hover:scale-105 hover:bg-gold hover:text-burgundy hover:shadow-2xl disabled:opacity-50 disabled:transform-none"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center">
                                <div className="h-4 w-4 border-2 border-burgundy border-t-transparent rounded-full animate-spin mr-2"></div>
                                Subscribing...
                            </div>
                        ) : (
                            'Subscribe'
                        )}
                    </button>
                </form>

                {/* Success message animation placeholder */}
                <div className="mt-4 h-6">
                    {isSubmitting && (
                        <p className="text-gold animate-pulse">Welcome to the Mused family!</p>
                    )}
                </div>
            </div>
        </section>
    )
}