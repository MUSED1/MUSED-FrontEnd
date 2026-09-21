// components/ShippingEstimate.tsx
import { useState } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { Truck, ArrowRight } from 'lucide-react'
import { API_CONFIG } from '../utils/api'

interface Rate {
    provider: string;
    service: string;
    amount: number;
    currency: string;
    days: number | null;
    rateObjectId: string;
}

interface EstimateResult {
    shipmentId: string;
    isInternational: boolean;
    rates: Rate[];
}

export function ShippingEstimate() {
    const [fromCountry, setFromCountry] = useState('US')
    const [fromCity, setFromCity] = useState('')
    const [fromZip, setFromZip] = useState('')

    const [toCountry, setToCountry] = useState('')
    const [toCity, setToCity] = useState('')
    const [toZip, setToZip] = useState('')

    const [weight, setWeight] = useState('2') // lb

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [result, setResult] = useState<EstimateResult | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setResult(null)

        if (!fromCountry.trim() || !toCountry.trim()) {
            setError('Please enter both a from and to country (2-letter code, e.g. US, FR, TR).')
            return
        }

        setLoading(true)
        try {
            const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.shippingEstimate}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    addressFrom: {
                        country: fromCountry.trim().toUpperCase(),
                        city: fromCity.trim() || undefined,
                        zip: fromZip.trim() || undefined
                    },
                    addressTo: {
                        country: toCountry.trim().toUpperCase(),
                        city: toCity.trim() || undefined,
                        zip: toZip.trim() || undefined
                    },
                    parcel: {
                        length: '10',
                        width: '8',
                        height: '4',
                        distance_unit: 'in',
                        weight: weight || '2',
                        mass_unit: 'lb'
                    }
                })
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Could not get a shipping estimate')
            }

            setResult(data.data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong getting your estimate')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-8">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-plum mb-4">Shipping Estimate</h1>
                        <p className="text-lg text-plum/80">Get a rough shipping cost between two locations</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* From */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-plum">From</h3>
                                <div>
                                    <label className="text-sm font-semibold text-plum/80">Country code</label>
                                    <input
                                        type="text"
                                        value={fromCountry}
                                        onChange={(e) => setFromCountry(e.target.value)}
                                        placeholder="US, FR, DE..."
                                        maxLength={2}
                                        className="w-full border border-cream rounded px-3 py-2 mt-1 uppercase"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-plum/80">City (optional)</label>
                                    <input
                                        type="text"
                                        value={fromCity}
                                        onChange={(e) => setFromCity(e.target.value)}
                                        className="w-full border border-cream rounded px-3 py-2 mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-plum/80">Zip / postal code (optional)</label>
                                    <input
                                        type="text"
                                        value={fromZip}
                                        onChange={(e) => setFromZip(e.target.value)}
                                        className="w-full border border-cream rounded px-3 py-2 mt-1"
                                    />
                                </div>
                            </div>

                            {/* To */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-plum">To</h3>
                                <div>
                                    <label className="text-sm font-semibold text-plum/80">Country code</label>
                                    <input
                                        type="text"
                                        value={toCountry}
                                        onChange={(e) => setToCountry(e.target.value)}
                                        placeholder="TR, GB, DE..."
                                        maxLength={2}
                                        className="w-full border border-cream rounded px-3 py-2 mt-1 uppercase"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-plum/80">City (optional)</label>
                                    <input
                                        type="text"
                                        value={toCity}
                                        onChange={(e) => setToCity(e.target.value)}
                                        className="w-full border border-cream rounded px-3 py-2 mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-plum/80">Zip / postal code (optional)</label>
                                    <input
                                        type="text"
                                        value={toZip}
                                        onChange={(e) => setToZip(e.target.value)}
                                        className="w-full border border-cream rounded px-3 py-2 mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="max-w-xs">
                            <label className="text-sm font-semibold text-plum/80">Package weight (lb)</label>
                            <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="w-full border border-cream rounded px-3 py-2 mt-1"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center gap-2 bg-plum text-white font-semibold rounded-xl px-6 py-3 hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Getting estimate...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Truck size={18} /> Get estimate <ArrowRight size={18} />
                                </span>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-xl border border-red-300">
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-plum mb-4">
                                {result.rates.length > 0
                                    ? `${result.rates.length} rate${result.rates.length > 1 ? 's' : ''} found`
                                    : 'No rates available for this route yet'}
                            </h3>

                            {result.rates.length === 0 && (
                                <p className="text-plum/70 text-sm">
                                    None of the connected carrier accounts currently support this route.
                                    Try a different destination or check carrier account status in Shippo.
                                </p>
                            )}

                            {result.rates.length > 0 && (
                                <div className="space-y-3">
                                    {result.rates.map((rate) => (
                                        <div
                                            key={rate.rateObjectId}
                                            className="flex justify-between items-center border border-cream rounded-xl px-4 py-3"
                                        >
                                            <div>
                                                <p className="font-semibold text-plum">{rate.provider} — {rate.service}</p>
                                                <p className="text-sm text-plum/60">
                                                    {rate.days ? `${rate.days} day${rate.days > 1 ? 's' : ''} estimated` : 'Delivery time varies'}
                                                </p>
                                            </div>
                                            <p className="text-xl font-bold text-plum">
                                                {rate.amount.toFixed(2)} {rate.currency}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    )
}