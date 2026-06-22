// components/SimpleImageUpload.tsx
import { useState, useRef, useEffect } from 'react';
import {
    Upload, X, CheckCircle, AlertCircle, Calendar, Loader2,
    Image as ImageIcon, Trash2, UploadCloud, Plus, Pencil,
    ChevronDown, ChevronUp, Save, Settings
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadedImage {
    id?: string;
    url: string;
    name: string;
    size: number;
    status?: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
    progress?: number;
}

interface DinnerConfig {
    id: string;
    label: string;
    dateRange: string;
    tag: string;
    gradient: string;
    startDate: string;
    endDate: string;
    path: string;
}

// ─── Gradient options ─────────────────────────────────────────────────────────

const GRADIENT_OPTIONS = [
    { label: 'Amber', value: 'from-amber-500 to-orange-500' },
    { label: 'Purple', value: 'from-purple-600 to-pink-600' },
    { label: 'Emerald', value: 'from-emerald-600 to-teal-600' },
    { label: 'Rose',   value: 'from-rose-500 to-pink-700' },
    { label: 'Sky',    value: 'from-sky-500 to-indigo-600' },
    { label: 'Lime',   value: 'from-lime-500 to-green-600' },
    { label: 'Fuchsia',value: 'from-fuchsia-500 to-purple-700' },
    { label: 'Cyan',   value: 'from-cyan-500 to-blue-600' },
];

// ─── Default built-in dinners ─────────────────────────────────────────────────

const DEFAULT_DINNERS: DinnerConfig[] = [
    {
        id: 'second',
        label: 'Second Dinner',
        dateRange: 'Before March 19, 2026',
        tag: 'second-dinner',
        gradient: 'from-amber-500 to-orange-500',
        startDate: '2025-01-01',
        endDate: '2026-03-19',
        path: '/second-dinner',
    },
    {
        id: 'third',
        label: 'Third Dinner',
        dateRange: 'March 20 – April 1, 2026',
        tag: 'third-dinner',
        gradient: 'from-purple-600 to-pink-600',
        startDate: '2026-03-20',
        endDate: '2026-04-01',
        path: '/third-dinner',
    },
    {
        id: 'fourth',
        label: 'Fourth Dinner',
        dateRange: 'April 2 – May 31, 2026',
        tag: 'fourth-dinner',
        gradient: 'from-emerald-600 to-teal-600',
        startDate: '2026-04-02',
        endDate: '2026-05-31',
        path: '/fourth-dinner',
    },
    {
        id: 'fifth',
        label: 'Fifth Dinner',
        dateRange: 'June 19 – June 25, 2026',
        tag: 'fifth-dinner',
        gradient: 'from-rose-500 to-pink-700',
        startDate: '2026-06-19',
        endDate: '2026-06-25',
        path: '/fifth-dinner',
    },
];

const STORAGE_KEY = 'mused_dinner_configs';

const API_BASE_URL = 'https://mused-backend.onrender.com';

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildDateRange(start: string, end: string): string {
    if (!start || !end) return '';
    const fmt = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    return `${fmt(start)} – ${fmt(end)}`;
}

// ─── New Dinner Form ──────────────────────────────────────────────────────────

function DinnerForm({
                        initial,
                        onSave,
                        onCancel,
                    }: {
    initial?: Partial<DinnerConfig>;
    onSave: (d: DinnerConfig) => void;
    onCancel: () => void;
}) {
    const [label, setLabel]       = useState(initial?.label ?? '');
    const [startDate, setStart]   = useState(initial?.startDate ?? '');
    const [endDate, setEnd]       = useState(initial?.endDate ?? '');
    const [gradient, setGradient] = useState(initial?.gradient ?? GRADIENT_OPTIONS[4].value);
    const [error, setError]       = useState('');

    const handleSave = () => {
        if (!label.trim())       { setError('Give this dinner a name.');              return; }
        if (!startDate)          { setError('Pick a start date.');                    return; }
        if (!endDate)            { setError('Pick an end date.');                     return; }
        if (endDate < startDate) { setError('End date must be after start date.');   return; }

        const slug = label.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const id   = initial?.id ?? slug + '-' + Date.now();
        onSave({
            id,
            label: label.trim(),
            dateRange: buildDateRange(startDate, endDate),
            tag: slug,
            gradient,
            startDate,
            endDate,
            path: `/${slug}`,
        });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">
                {initial?.id ? 'Edit Collection' : 'New Dinner Collection'}
            </h3>

            {/* Name */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Collection Name</label>
                <input
                    type="text"
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    placeholder="e.g. Sixth Dinner"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => setStart(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => setEnd(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                </div>
            </div>

            {/* Color */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Accent Color</label>
                <div className="flex flex-wrap gap-2">
                    {GRADIENT_OPTIONS.map(g => (
                        <button
                            key={g.value}
                            type="button"
                            onClick={() => setGradient(g.value)}
                            className={`w-9 h-9 rounded-full bg-gradient-to-br ${g.value} transition-all duration-200
                                ${gradient === g.value ? 'ring-2 ring-offset-2 ring-gray-600 scale-110' : 'opacity-70 hover:opacity-100'}`}
                            title={g.label}
                        />
                    ))}
                </div>
            </div>

            {/* Preview */}
            {label && startDate && endDate && (
                <div className={`rounded-xl p-3 bg-gradient-to-r ${gradient} text-white text-sm font-semibold flex justify-between items-center`}>
                    <span>{label}</span>
                    <span className="opacity-80 text-xs">{buildDateRange(startDate, endDate)}</span>
                </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-3 pt-1">
                <button
                    type="button"
                    onClick={handleSave}
                    className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                    <Save size={14} /> Save Collection
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SimpleImageUpload() {
    const [dinners, setDinners]               = useState<DinnerConfig[]>(DEFAULT_DINNERS);
    const [selectedDinnerId, setSelected]     = useState<string>('fifth');
    const [images, setImages]                 = useState<UploadedImage[]>([]);
    const [files, setFiles]                   = useState<File[]>([]);
    const [isUploading, setIsUploading]       = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentFileIndex, setCurrentFile]  = useState(0);
    const [uploadedIds, setUploadedIds]       = useState<string[]>([]);
    const [message, setMessage]               = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [batchMode, setBatchMode]           = useState<'sequential' | 'parallel'>('sequential');
    const [managerOpen, setManagerOpen]       = useState(false);
    const [showForm, setShowForm]             = useState(false);
    const [editingDinner, setEditingDinner]   = useState<DinnerConfig | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Persist custom dinners
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as DinnerConfig[];
                // Merge: keep defaults, append any extras not in defaults
                const defaultIds = new Set(DEFAULT_DINNERS.map(d => d.id));
                const extras = parsed.filter(d => !defaultIds.has(d.id));
                setDinners([...DEFAULT_DINNERS, ...extras]);
            } catch (e) {
                console.warn('Failed to parse stored dinner configs', e);
            }
        }
    }, []);

    const persistDinners = (list: DinnerConfig[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        setDinners(list);
    };

    const handleSaveDinner = (dinner: DinnerConfig) => {
        const exists = dinners.find(d => d.id === dinner.id);
        const next = exists
            ? dinners.map(d => d.id === dinner.id ? dinner : d)
            : [...dinners, dinner];
        persistDinners(next);
        setShowForm(false);
        setEditingDinner(null);
        setSelected(dinner.id);
    };

    const handleDeleteDinner = (id: string) => {
        const isDefault = DEFAULT_DINNERS.some(d => d.id === id);
        if (isDefault) return; // protect built-ins
        const next = dinners.filter(d => d.id !== id);
        persistDinners(next);
        if (selectedDinnerId === id) setSelected('fifth');
    };

    const selectedDinner = dinners.find(d => d.id === selectedDinnerId) ?? dinners[dinners.length - 1];

    // ── File handling ──────────────────────────────────────────────────

    useEffect(() => {
        const currentImages = images;
        return () => {
            currentImages.forEach(img => {
                if (img.url.startsWith('blob:')) URL.revokeObjectURL(img.url);
            });
        };
    }, [images]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        const valid    = selected.filter(f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024);
        if (valid.length === 0) { setMessage({ type: 'error', text: 'Please select valid image files (max 10MB each)' }); return; }
        if (files.length + valid.length > 20) { setMessage({ type: 'error', text: 'Maximum 20 images allowed at once' }); return; }

        setFiles(prev => [...prev, ...valid]);
        setImages(prev => [...prev, ...valid.map(f => ({ url: URL.createObjectURL(f), name: f.name, size: f.size, status: 'pending' as const }))]);
        setMessage(valid.length < selected.length ? { type: 'error', text: 'Some files were skipped (non-image or too large)' } : null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = (i: number) => {
        const nf = [...files]; nf.splice(i, 1); setFiles(nf);
        const ni = [...images]; const rm = ni.splice(i, 1)[0];
        if (rm.url.startsWith('blob:')) URL.revokeObjectURL(rm.url);
        setImages(ni);
        const ni2 = [...uploadedIds]; ni2.splice(i, 1); setUploadedIds(ni2);
        setMessage(null);
    };

    const removeAllImages = () => {
        images.forEach(img => { if (img.url.startsWith('blob:')) URL.revokeObjectURL(img.url); });
        setImages([]); setFiles([]); setUploadedIds([]); setMessage(null);
        setUploadProgress(0); setCurrentFile(0);
    };

    const updateStatus = (i: number, status: UploadedImage['status'], error?: string, progress?: number) => {
        setImages(prev => prev.map((img, idx) => idx === i ? { ...img, status, error, progress } : img));
    };

    // ── Upload logic ───────────────────────────────────────────────────

    interface UploadResult {
        _id: string;
        [key: string]: unknown;
    }

    const uploadFile = (file: File, onProgress?: (p: number) => void): Promise<UploadResult> => new Promise((resolve, reject) => {
        const fd = new FormData();
        fd.append('image', file);
        fd.append('tags', `${selectedDinner.tag},uploaded,simple-upload,frontend`);
        fd.append('dinnerType', selectedDinner.id);
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', e => { if (e.lengthComputable && onProgress) onProgress(Math.round(e.loaded / e.total * 100)); });
        xhr.addEventListener('load', () => {
            if (xhr.status === 201) {
                try {
                    const r = JSON.parse(xhr.responseText) as { success: boolean; data: UploadResult; message?: string };
                    if (r.success) {
                        resolve(r.data);
                    } else {
                        reject(new Error(r.message ?? 'Upload failed'));
                    }
                } catch (parseErr) {
                    reject(new Error(`Invalid response: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`));
                }
            } else { reject(new Error(`HTTP ${xhr.status}`)); }
        });
        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.open('POST', `${API_BASE_URL}/api/images/upload`);
        xhr.withCredentials = true;
        xhr.send(fd);
    });

    const uploadSequentially = async () => {
        const ids: string[] = [];
        for (let i = 0; i < files.length; i++) {
            updateStatus(i, 'uploading', undefined, 0);
            setCurrentFile(i);
            try {
                const res = await uploadFile(files[i], p => updateStatus(i, 'uploading', undefined, p));
                ids.push(res._id);
                updateStatus(i, 'success');
                setUploadProgress(Math.round((i + 1) / files.length * 100));
            } catch (err) { updateStatus(i, 'error', err instanceof Error ? err.message : 'Failed'); }
        }
        return ids;
    };

    const uploadInParallel = async () => {
        const results = await Promise.all(files.map(async (f, i) => {
            updateStatus(i, 'uploading', undefined, 0);
            try {
                const res = await uploadFile(f, p => updateStatus(i, 'uploading', undefined, p));
                updateStatus(i, 'success'); return res._id as string;
            } catch (err) { updateStatus(i, 'error', err instanceof Error ? err.message : 'Failed'); return null; }
        }));
        setUploadProgress(100);
        return results.filter(Boolean) as string[];
    };

    const uploadToBackend = async () => {
        if (files.length === 0) { setMessage({ type: 'error', text: 'Please select at least one image' }); return; }
        setIsUploading(true); setUploadProgress(0); setCurrentFile(0); setMessage(null); setUploadedIds([]);
        try {
            const ids  = batchMode === 'sequential' ? await uploadSequentially() : await uploadInParallel();
            const okCount   = ids.length;
            const failCount = files.length - okCount;
            if (okCount === 0) {
                setMessage({ type: 'error', text: 'All uploads failed. Please try again.' });
            } else {
                setMessage({ type: 'success', text: `Uploaded ${okCount} image(s) to ${selectedDinner.label}!${failCount > 0 ? ` (${failCount} failed)` : ''}` });
                setUploadedIds(ids);
                setTimeout(() => {
                    setImages(prev => {
                        const failedImages = prev.filter(img => img.status === 'error');
                        if (failedImages.length === 0) {
                            removeAllImages();
                            return [];
                        }
                        setFiles(f => f.filter((_, i) => prev[i]?.status !== 'success'));
                        setUploadedIds([]);
                        setMessage({ type: 'error', text: `${failedImages.length} image(s) failed. Please try again.` });
                        return failedImages;
                    });
                }, 5000);
            }
        } catch (err) {
            setMessage({ type: 'error', text: `Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}` });
        } finally { setIsUploading(false); setCurrentFile(0); }
    };

    // ── Misc ───────────────────────────────────────────────────────────

    const fmt = (bytes: number) => bytes < 1024 ? bytes + ' B' : bytes < 1048576 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / 1048576).toFixed(1) + ' MB';

    const statusIcon = (s?: UploadedImage['status']) => {
        if (s === 'uploading') return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
        if (s === 'success')   return <CheckCircle className="h-4 w-4 text-green-500" />;
        if (s === 'error')     return <AlertCircle className="h-4 w-4 text-red-500" />;
        return <ImageIcon className="h-4 w-4 text-gray-400" />;
    };

    const statusColor = (s?: UploadedImage['status']): string => {
        if (s === 'uploading') return 'border-blue-300 bg-blue-50';
        if (s === 'success')   return 'border-green-300 bg-green-50';
        if (s === 'error')     return 'border-red-300 bg-red-50';
        return 'border-gray-200 bg-gray-50';
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (isUploading) return;
        const dt = new DataTransfer();
        Array.from(e.dataTransfer.files).forEach(f => dt.items.add(f));
        if (fileInputRef.current) {
            fileInputRef.current.files = dt.files;
            handleFileSelect({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
        }
    };

    const ok      = images.filter(i => i.status === 'success').length;
    const failed  = images.filter(i => i.status === 'error').length;
    const pending = images.filter(i => i.status === 'pending').length;

    // ── Render ─────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">Dinner Gallery Upload</h1>
                    <p className="text-gray-500 text-sm">Assign photos to a dinner collection and upload to Cloudinary</p>
                </div>

                {/* ── Collection Manager ── */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setManagerOpen(v => !v)}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-2 font-semibold text-gray-700">
                            <Settings size={18} />
                            Manage Collections
                            <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 font-normal">
                                {dinners.length} dinners
                            </span>
                        </div>
                        {managerOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                    </button>

                    {managerOpen && (
                        <div className="px-6 pb-6 space-y-4 border-t border-gray-100">
                            {/* Dinner list */}
                            <div className="grid sm:grid-cols-2 gap-3 mt-4">
                                {dinners.map(d => {
                                    const isDefault = DEFAULT_DINNERS.some(def => def.id === d.id);
                                    return (
                                        <div key={d.id} className={`flex items-center gap-3 rounded-xl p-3 border transition-all
                                            ${selectedDinnerId === d.id ? 'border-gray-400 bg-gray-50' : 'border-gray-200'}`}>
                                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${d.gradient} flex-shrink-0`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{d.label}</p>
                                                <p className="text-xs text-gray-400 truncate">{d.dateRange}</p>
                                            </div>
                                            <div className="flex gap-1 flex-shrink-0">
                                                {!isDefault && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => { setEditingDinner(d); setShowForm(true); }}
                                                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Pencil size={13} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteDinner(d.id)}
                                                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </>
                                                )}
                                                {isDefault && (
                                                    <span className="text-xs text-gray-300 px-2 py-1">built-in</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Form or add button */}
                            {showForm ? (
                                <DinnerForm
                                    initial={editingDinner ?? undefined}
                                    onSave={handleSaveDinner}
                                    onCancel={() => { setShowForm(false); setEditingDinner(null); }}
                                />
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => { setEditingDinner(null); setShowForm(true); }}
                                    className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} /> Add New Dinner Collection
                                </button>
                            )}

                            <p className="text-xs text-gray-400 text-center">
                                Custom collections are saved in your browser. Built-in dinners can't be deleted.
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Upload Card ── */}
                <div className="bg-white rounded-2xl shadow-xl p-8">

                    {/* Dinner selector tabs */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                        <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                            <Calendar className="w-5 h-5 text-purple-600" />
                            Upload to Collection
                        </label>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                            {dinners.map(d => (
                                <button
                                    key={d.id}
                                    type="button"
                                    onClick={() => setSelected(d.id)}
                                    disabled={isUploading}
                                    className={`py-2.5 px-3 rounded-xl font-semibold text-xs transition-all duration-200 text-center leading-tight
                                        ${selectedDinnerId === d.id
                                        ? `bg-gradient-to-r ${d.gradient} text-white shadow-md scale-105`
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                                        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className="block font-bold">{d.label}</span>
                                    <span className="block opacity-80 mt-0.5" style={{ fontSize: '10px' }}>{d.dateRange}</span>
                                </button>
                            ))}

                            {/* Quick-add shortcut */}
                            <button
                                type="button"
                                onClick={() => { setManagerOpen(true); setShowForm(true); setEditingDinner(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                disabled={isUploading}
                                className="py-2.5 px-3 rounded-xl text-xs text-gray-400 border-2 border-dashed border-gray-300 hover:border-purple-400 hover:text-purple-500 hover:bg-purple-50 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
                            >
                                <Plus size={16} />
                                <span>New</span>
                            </button>
                        </div>

                        {/* Batch mode */}
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                            <span className="text-sm text-gray-500">Upload mode:</span>
                            {(['sequential', 'parallel'] as const).map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setBatchMode(m)}
                                    disabled={isUploading}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all
                                        ${batchMode === m ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}
                                        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {m === 'sequential' ? 'Sequential — memory safe' : 'Parallel — faster'}
                                </button>
                            ))}
                        </div>

                        <p className="text-xs text-gray-400 mt-3 text-center">
                            📸 Photos will appear in <strong>{selectedDinner?.label}</strong> ({selectedDinner?.dateRange})
                        </p>
                    </div>

                    {/* Drop Zone */}
                    <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                            isUploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50 cursor-pointer'
                        }`}
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        role="button" tabIndex={0}
                    >
                        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" disabled={isUploading} />
                        <div className="space-y-3">
                            <div className={`mx-auto w-fit p-4 rounded-full ${isUploading ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                <UploadCloud className={`h-10 w-10 ${isUploading ? 'text-blue-500' : 'text-gray-400'}`} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700">
                                {isUploading ? 'Uploading…' : 'Drag & drop or click to upload'}
                            </h3>
                            <p className="text-sm text-gray-400">JPG, PNG, GIF, WebP · max 10 MB each · up to 20 at once</p>
                        </div>
                    </div>

                    {/* Progress */}
                    {isUploading && (
                        <div className="mt-6">
                            <div className="flex justify-between text-sm text-gray-500 mb-1">
                                <span>Uploading {currentFileIndex + 1} of {files.length}…</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${selectedDinner?.gradient} transition-all duration-300`}
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 text-center mt-1">
                                ✅ {ok} · ❌ {failed} · ⏳ {pending}
                            </p>
                        </div>
                    )}

                    {/* Image grid */}
                    {images.length > 0 && (
                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-700">Selected ({images.length})</h3>
                                <div className="flex gap-2">
                                    <button onClick={removeAllImages} disabled={isUploading}
                                            className="text-xs text-red-500 border border-red-200 rounded px-3 py-1 hover:bg-red-50 flex items-center gap-1 disabled:opacity-50">
                                        <Trash2 size={12} /> Clear all
                                    </button>
                                    <button onClick={uploadToBackend} disabled={isUploading || images.length === 0}
                                            className={`text-xs rounded px-3 py-1 font-semibold flex items-center gap-1
                                            ${isUploading || images.length === 0
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : `bg-gradient-to-r ${selectedDinner?.gradient} text-white hover:shadow`}`}>
                                        {isUploading ? <><Loader2 size={12} className="animate-spin" /> Uploading…</> : <><Upload size={12} /> Upload ({images.length})</>}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                {images.map((img, i) => (
                                    <div key={i} className={`relative group border-2 rounded-lg overflow-hidden ${statusColor(img.status)}`}>
                                        <div className="aspect-square bg-gray-100 relative">
                                            <img src={img.url} alt={img.name} className="w-full h-full object-cover" loading="lazy" />
                                            {img.status === 'uploading' && (
                                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                                                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                                                    <span className="text-white text-xs mt-1">{img.progress ?? 0}%</span>
                                                </div>
                                            )}
                                            {img.status === 'success' && <div className="absolute inset-0 bg-green-500/70 flex items-center justify-center"><CheckCircle className="h-8 w-8 text-white" /></div>}
                                            {img.status === 'error'   && <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center"><AlertCircle className="h-8 w-8 text-white" /></div>}
                                        </div>
                                        <div className="absolute top-1 left-1 flex items-center gap-1 bg-black/40 rounded-full px-1.5 py-0.5">
                                            {statusIcon(img.status)}
                                            <span className="text-white text-[10px] capitalize">{img.status ?? 'pending'}</span>
                                        </div>
                                        {!isUploading && img.status !== 'uploading' && (
                                            <button onClick={e => { e.stopPropagation(); removeImage(i); }}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                                                <X size={10} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 text-center mt-3">
                                Total: {fmt(files.reduce((t, f) => t + f.size, 0))}
                                {ok > 0 && <span className="ml-2 text-green-600">✅ {ok} uploaded</span>}
                                {failed > 0 && <span className="ml-2 text-red-500">❌ {failed} failed</span>}
                            </p>
                        </div>
                    )}

                    {/* Message */}
                    {message && (
                        <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 border ${
                            message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                            {message.type === 'success' ? <CheckCircle className="h-5 w-5 mt-0.5" /> : <AlertCircle className="h-5 w-5 mt-0.5" />}
                            <p className="text-sm font-medium">{message.text}</p>
                        </div>
                    )}
                </div>

                {/* Footer note */}
                <p className="text-center text-xs text-gray-400 pb-4">
                    Custom collections are stored in your browser. To make them permanent, copy the config to <code>DINNER_CONFIGS</code> in the source file.
                </p>
            </div>
        </div>
    );
}