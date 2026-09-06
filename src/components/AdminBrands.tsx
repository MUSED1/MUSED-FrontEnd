// components/AdminBrands.tsx
import { useState, useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { Check, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { API_CONFIG, fetchPaginated } from '../utils/api'

interface BrandListItem {
    _id: string;
    brandName: string;
    founderStory: string;
    specialNote: string;
    logoUrl: string;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    rejectionReason: string | null;
    createdAt: string;
    userId: { _id: string; name: string; email: string } | string;
}

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

const STATUS_TABS = ['pending', 'approved', 'rejected', 'all'] as const;
type StatusTab = typeof STATUS_TABS[number];

export function AdminBrands() {
    const [brands, setBrands] = useState<BrandListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusTab, setStatusTab] = useState<StatusTab>('pending');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationInfo>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 20,
        hasNextPage: false,
        hasPrevPage: false
    });
    const [processingId, setProcessingId] = useState<string | null>(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
    };

    const fetchBrands = async (page: number, status: StatusTab) => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token') || undefined;
            const endpoint = status === 'all'
                ? API_CONFIG.endpoints.brandAdminAll
                : `${API_CONFIG.endpoints.brandAdminAll}?status=${status}`;

            const result = await fetchPaginated<BrandListItem>(endpoint, page, 20, token);
            setBrands(result.data);
            setPagination(result.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching brand profiles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands(currentPage, statusTab);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, statusTab]);

    const handleTabChange = (tab: StatusTab) => {
        setStatusTab(tab);
        setCurrentPage(1);
    };

    const handleApprove = async (id: string) => {
        try {
            setProcessingId(id);
            const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.brand}/admin/${id}/approve`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setBrands(prev => prev.filter(b => b._id !== id));
            } else {
                throw new Error(result.message || 'Failed to approve brand');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error approving brand');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        const reason = window.prompt('Reason for rejection (shown to the seller):');
        if (reason === null) return;

        try {
            setProcessingId(id);
            const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.brand}/admin/${id}/reject`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ reason })
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setBrands(prev => prev.filter(b => b._id !== id));
            } else {
                throw new Error(result.message || 'Failed to reject brand');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error rejecting brand');
        } finally {
            setProcessingId(null);
        }
    };

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, pagination.totalPages)));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const ownerLabel = (userId: BrandListItem['userId']) =>
        typeof userId === 'string' ? userId : `${userId.name} (${userId.email})`;

    return (
        <div className="font-sans">
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-cream to-amber-50 py-8">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-plum mb-4">Brand Profiles</h1>
                        <p className="text-lg text-plum/80">
                            Review seller brand stories before they go live on storefronts.
                        </p>
                    </div>

                    {/* Status tabs */}
                    <div className="flex justify-center gap-2 mb-6">
                        {STATUS_TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                                    statusTab === tab
                                        ? 'bg-plum text-white'
                                        : 'bg-white text-plum hover:bg-cream'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-xl border border-red-300 flex justify-between items-center">
                            <span>{error}</span>
                            <button onClick={() => setError('')} className="ml-4 underline hover:no-underline">
                                Dismiss
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-2 border-plum border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-plum mt-4">Loading brand profiles...</p>
                        </div>
                    ) : brands.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-plum text-lg">No {statusTab !== 'all' ? statusTab : ''} brand profiles found.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {brands.map(brand => (
                                <div key={brand._id} className="bg-white rounded-2xl shadow-lg p-6">
                                    <div className="grid md:grid-cols-4 gap-6">
                                        <div className="flex md:flex-col items-center md:items-start gap-4">
                                            <div className="w-20 h-20 rounded-xl bg-cream flex items-center justify-center overflow-hidden shrink-0">
                                                <img src={brand.logoUrl} alt={`${brand.brandName} logo`} className="w-full h-full object-contain" />
                                            </div>
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                                    brand.approvalStatus === 'approved'
                                                        ? 'bg-green-100 text-green-800'
                                                        : brand.approvalStatus === 'rejected'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                {brand.approvalStatus}
                                            </span>
                                        </div>

                                        <div className="md:col-span-2 space-y-2">
                                            <h2 className="text-xl font-bold text-plum">{brand.brandName}</h2>
                                            <p className="text-sm text-plum/60">{ownerLabel(brand.userId)}</p>
                                            <p className="text-sm text-plum/80 line-clamp-4">{brand.founderStory}</p>
                                            <p className="text-sm italic text-plum/70">"{brand.specialNote}"</p>
                                            {brand.rejectionReason && (
                                                <p className="text-sm text-red-600">Last rejection reason: {brand.rejectionReason}</p>
                                            )}
                                        </div>

                                        <div className="flex md:flex-col justify-end md:justify-start gap-3">
                                            <button
                                                onClick={() => handleApprove(brand._id)}
                                                disabled={processingId === brand._id || brand.approvalStatus === 'approved'}
                                                className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <Check size={16} />
                                                <span>Approve</span>
                                            </button>
                                            <button
                                                onClick={() => handleReject(brand._id)}
                                                disabled={processingId === brand._id || brand.approvalStatus === 'rejected'}
                                                className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <X size={16} />
                                                <span>Reject</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={!pagination.hasPrevPage}
                                className={`p-2 rounded-lg transition-colors ${
                                    !pagination.hasPrevPage ? 'text-plum/20 cursor-not-allowed' : 'text-plum hover:bg-cream'
                                }`}
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <span className="text-plum">
                                Page {currentPage} of {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={!pagination.hasNextPage}
                                className={`p-2 rounded-lg transition-colors ${
                                    !pagination.hasNextPage ? 'text-plum/20 cursor-not-allowed' : 'text-plum hover:bg-cream'
                                }`}
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}