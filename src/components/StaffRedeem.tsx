// components/StaffRedeem.tsx
import { useEffect, useRef, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'https://mused-backend.onrender.com/api';
const SCANNER_ELEMENT_ID = 'staff-qr-reader';

interface RedeemResult {
    success: boolean;
    message: string;
}

interface HistoryItem {
    redemptionCode: string;
    claimedAt: string;
    customer: { name: string; email: string } | null;
}

export function StaffRedeem() {
    const { user, isAuthenticated, isStaff, loading } = useAuth();

    const [scanning, setScanning] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [result, setResult] = useState<RedeemResult | null>(null);
    const [redeeming, setRedeeming] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const lastScannedRef = useRef<string | null>(null);

    const loadHistory = async () => {
        setHistoryLoading(true);
        try {
            const res = await axios.get<{ success: boolean; data: HistoryItem[] }>(
                `${API_URL}/welcome-pack/history?limit=10`
            );
            if (res.data.success) setHistory(res.data.data);
        } catch (err) {
            console.error('Failed to load redemption history:', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && isStaff) loadHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, isStaff]);

    const redeemCode = async (rawCode: string) => {
        const code = rawCode.trim().toUpperCase();
        if (!code || redeeming) return;

        setRedeeming(true);
        setResult(null);
        try {
            const res = await axios.post<{ success: boolean; message: string }>(
                `${API_URL}/welcome-pack/redeem-code`,
                { code }
            );
            setResult({ success: res.data.success, message: res.data.message });
            if (res.data.success) loadHistory();
        } catch (err) {
            const axiosErr = err as AxiosError<{ message?: string }>;
            setResult({
                success: false,
                message: axiosErr.response?.data?.message || 'Network error — try again.',
            });
        } finally {
            setRedeeming(false);
            setManualCode('');
            setTimeout(() => { lastScannedRef.current = null; }, 3000);
        }
    };

    const startScanner = async () => {
        setResult(null);
        const qr = new Html5Qrcode(SCANNER_ELEMENT_ID);
        scannerRef.current = qr;
        try {
            await qr.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 240, height: 240 } },
                (decodedText) => {
                    if (decodedText === lastScannedRef.current) return;
                    lastScannedRef.current = decodedText;
                    redeemCode(decodedText);
                },
                () => { /* ignore per-frame "no QR found" noise */ }
            );
            setScanning(true);
        } catch (err) {
            console.error('Camera start failed:', err);
            setResult({ success: false, message: 'Could not access camera. Check permissions or use manual entry.' });
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                await scannerRef.current.clear();
            } catch { /* already stopped */ }
        }
        setScanning(false);
    };

    useEffect(() => {
        return () => { stopScanner(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) return <div className="p-6 text-center">Loading…</div>;

    if (!isAuthenticated || !isStaff) {
        return (
            <div className="p-6 text-center text-red-700">
                This page is for staff accounts only.
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-xl font-semibold mb-1">Redeem Free Coffee</h1>
            <p className="text-sm text-gray-500 mb-6">Logged in as {user?.name}</p>

            {!scanning ? (
                <button
                    onClick={startScanner}
                    className="w-full py-3 rounded-lg bg-[#3D1028] text-[#FFF0C8] font-semibold mb-6"
                >
                    Start Camera Scan
                </button>
            ) : (
                <button
                    onClick={stopScanner}
                    className="w-full py-3 rounded-lg border border-gray-400 mb-6"
                >
                    Stop Camera
                </button>
            )}

            <div id={SCANNER_ELEMENT_ID} className="mb-6 rounded-lg overflow-hidden" />

            <div className="border-t pt-6">
                <p className="text-sm text-gray-500 mb-2">Or type the code manually</p>
                <div className="flex gap-2">
                    <input
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="e.g. COFFEE-4Q8K2"
                        className="flex-1 border rounded-lg px-3 py-2"
                        autoCapitalize="characters"
                        onKeyDown={(e) => { if (e.key === 'Enter') redeemCode(manualCode); }}
                    />
                    <button
                        onClick={() => redeemCode(manualCode)}
                        disabled={redeeming || !manualCode.trim()}
                        className="px-4 py-2 rounded-lg bg-[#3D1028] text-[#FFF0C8] font-semibold disabled:opacity-50"
                    >
                        {redeeming ? '...' : 'Redeem'}
                    </button>
                </div>
            </div>

            {result && (
                <div
                    className={`mt-6 p-4 rounded-lg text-center font-medium ${
                        result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                >
                    {result.message}
                </div>
            )}

            <div className="mt-10 border-t pt-6">
                <h2 className="text-sm font-semibold text-gray-600 mb-3">Recent Redemptions</h2>
                {historyLoading ? (
                    <p className="text-sm text-gray-400">Loading…</p>
                ) : history.length === 0 ? (
                    <p className="text-sm text-gray-400">No redemptions yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {history.map((h) => (
                            <li key={h.redemptionCode} className="text-sm flex justify-between border-b pb-2">
                                <span>{h.customer?.name || 'Unknown'} — {h.redemptionCode}</span>
                                <span className="text-gray-400">{new Date(h.claimedAt).toLocaleTimeString()}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}