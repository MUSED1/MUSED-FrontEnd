// components/SimpleImageUpload.tsx
import { useState, useRef, useEffect } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Calendar, Loader2, Image as ImageIcon, Trash2, UploadCloud } from 'lucide-react';

interface UploadedImage {
    id?: string;
    url: string;
    name: string;
    size: number;
    publicId?: string;
    status?: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
    progress?: number;
}

type DinnerType = 'second' | 'third';

export function SimpleImageUpload() {
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [uploadedIds, setUploadedIds] = useState<string[]>([]);
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    const [selectedDinner, setSelectedDinner] = useState<DinnerType>('third');
    const [batchMode, setBatchMode] = useState<'sequential' | 'parallel'>('sequential');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<File[]>([]);

    // API base URL
    const API_BASE_URL = 'https://mused-backend.onrender.com';

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            images.forEach(image => {
                if (image.url.startsWith('blob:')) {
                    URL.revokeObjectURL(image.url);
                }
            });
        };
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);

        // Filter to only image files
        const imageFiles = selectedFiles.filter(file =>
            file.type.startsWith('image/') &&
            file.size <= 10 * 1024 * 1024 // 10MB limit
        );

        if (imageFiles.length === 0) {
            setMessage({
                type: 'error',
                text: 'Please select valid image files (max 10MB each)'
            });
            return;
        }

        // Check if total files exceed limit
        if (files.length + imageFiles.length > 20) {
            setMessage({
                type: 'error',
                text: 'Maximum 20 images allowed at once'
            });
            return;
        }

        // Store File objects
        setFiles(prev => [...prev, ...imageFiles]);

        // Create preview URLs with status
        const newImages = imageFiles.map(file => ({
            url: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            status: 'pending' as const
        }));

        setImages(prev => [...prev, ...newImages]);

        if (imageFiles.length === selectedFiles.length) {
            setMessage(null);
        } else {
            setMessage({
                type: 'error',
                text: `Some files were skipped (non-image or too large)`
            });
        }

        // Clear file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        // Remove file from files array
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);

        // Remove image from images array
        const newImages = [...images];
        const removed = newImages.splice(index, 1)[0];

        // Revoke object URL to prevent memory leaks
        if (removed.url.startsWith('blob:')) {
            URL.revokeObjectURL(removed.url);
        }

        setImages(newImages);

        // Update uploadedIds if needed
        if (uploadedIds[index]) {
            const newUploadedIds = [...uploadedIds];
            newUploadedIds.splice(index, 1);
            setUploadedIds(newUploadedIds);
        }

        setMessage(null);
    };

    const removeAllImages = () => {
        // Revoke all object URLs
        images.forEach(image => {
            if (image.url.startsWith('blob:')) {
                URL.revokeObjectURL(image.url);
            }
        });
        setImages([]);
        setFiles([]);
        setUploadedIds([]);
        setMessage(null);
        setUploadProgress(0);
        setCurrentFileIndex(0);
    };

    const updateImageStatus = (index: number, status: UploadedImage['status'], error?: string, progress?: number) => {
        setImages(prev => prev.map((img, i) =>
            i === index ? { ...img, status, error, progress } : img
        ));
    };

    // Sequential upload (one by one) - better for memory
    const uploadSequentially = async () => {
        const uploadedImageIds: string[] = [];
        const dinnerTag = selectedDinner === 'third' ? 'third-dinner' : 'second-dinner';

        for (let i = 0; i < files.length; i++) {
            updateImageStatus(i, 'uploading', undefined, 0);
            setCurrentFileIndex(i);

            try {
                const formData = new FormData();
                formData.append('image', files[i]);
                formData.append('tags', `${dinnerTag},uploaded,simple-upload,frontend`);
                formData.append('dinnerType', selectedDinner);

                // Use XMLHttpRequest for progress tracking
                const xhr = new XMLHttpRequest();
                const uploadPromise = new Promise((resolve, reject) => {
                    xhr.upload.addEventListener('progress', (event) => {
                        if (event.lengthComputable) {
                            const percent = Math.round((event.loaded / event.total) * 100);
                            updateImageStatus(i, 'uploading', undefined, percent);
                        }
                    });

                    xhr.addEventListener('load', () => {
                        if (xhr.status === 201) {
                            try {
                                const result = JSON.parse(xhr.responseText);
                                if (result.success) {
                                    resolve(result.data);
                                } else {
                                    reject(new Error(result.message || 'Upload failed'));
                                }
                            } catch (e) {
                                reject(new Error('Invalid response from server'));
                            }
                        } else {
                            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                        }
                    });

                    xhr.addEventListener('error', () => reject(new Error('Network error')));
                    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

                    xhr.open('POST', `${API_BASE_URL}/api/images/upload`);
                    xhr.withCredentials = true;
                    xhr.send(formData);
                });

                const result = await uploadPromise as any;
                uploadedImageIds.push(result._id);
                updateImageStatus(i, 'success');

                // Update overall progress
                const overallProgress = Math.round(((i + 1) / files.length) * 100);
                setUploadProgress(overallProgress);

            } catch (error) {
                console.error(`Error uploading file ${i + 1}:`, error);
                updateImageStatus(i, 'error', error instanceof Error ? error.message : 'Upload failed');
                // Continue with next file even if one fails
            }
        }

        return uploadedImageIds;
    };

    // Parallel upload (multiple at once) - faster but more memory intensive
    const uploadInParallel = async () => {
        const dinnerTag = selectedDinner === 'third' ? 'third-dinner' : 'second-dinner';
        const uploadPromises = files.map(async (file, index) => {
            updateImageStatus(index, 'uploading', undefined, 0);

            try {
                const formData = new FormData();
                formData.append('image', file);
                formData.append('tags', `${dinnerTag},uploaded,simple-upload,frontend`);
                formData.append('dinnerType', selectedDinner);

                // Use fetch with upload progress tracking via XHR
                const xhr = new XMLHttpRequest();
                const uploadPromise = new Promise((resolve, reject) => {
                    xhr.upload.addEventListener('progress', (event) => {
                        if (event.lengthComputable) {
                            const percent = Math.round((event.loaded / event.total) * 100);
                            updateImageStatus(index, 'uploading', undefined, percent);
                        }
                    });

                    xhr.addEventListener('load', () => {
                        if (xhr.status === 201) {
                            try {
                                const result = JSON.parse(xhr.responseText);
                                if (result.success) {
                                    resolve(result.data);
                                } else {
                                    reject(new Error(result.message || 'Upload failed'));
                                }
                            } catch (e) {
                                reject(new Error('Invalid response from server'));
                            }
                        } else {
                            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                        }
                    });

                    xhr.addEventListener('error', () => reject(new Error('Network error')));
                    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

                    xhr.open('POST', `${API_BASE_URL}/api/images/upload`);
                    xhr.withCredentials = true;
                    xhr.send(formData);
                });

                const result = await uploadPromise as any;
                updateImageStatus(index, 'success');
                return result._id;

            } catch (error) {
                console.error(`Error uploading file ${index + 1}:`, error);
                updateImageStatus(index, 'error', error instanceof Error ? error.message : 'Upload failed');
                return null;
            }
        });

        const results = await Promise.all(uploadPromises);
        const uploadedImageIds = results.filter(id => id !== null) as string[];
        setUploadProgress(100);

        return uploadedImageIds;
    };

    const uploadToBackend = async () => {
        if (files.length === 0) {
            setMessage({
                type: 'error',
                text: 'Please select at least one image'
            });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setCurrentFileIndex(0);
        setMessage(null);
        setUploadedIds([]);

        try {
            console.log(`Starting upload of ${files.length} images in ${batchMode} mode`);

            let uploadedImageIds: string[] = [];

            if (batchMode === 'sequential') {
                uploadedImageIds = await uploadSequentially();
            } else {
                uploadedImageIds = await uploadInParallel();
            }

            const successCount = uploadedImageIds.length;
            const failCount = files.length - successCount;

            if (successCount > 0) {
                setMessage({
                    type: 'success',
                    text: `Successfully uploaded ${successCount} image(s) to ${selectedDinner === 'third' ? 'Third Dinner' : 'Second Dinner'} gallery!${failCount > 0 ? ` (${failCount} failed)` : ''}`
                });
            } else if (failCount === files.length) {
                throw new Error('All uploads failed');
            }

            setUploadedIds(uploadedImageIds);

            // Clear successful uploads after 5 seconds, keep failed ones
            setTimeout(() => {
                const failedImages = images.filter(img => img.status === 'error');
                if (failedImages.length === 0) {
                    // All succeeded, clear everything
                    removeAllImages();
                } else {
                    // Only clear successful ones
                    const newImages = images.filter(img => img.status !== 'success');
                    const newFiles = files.filter((_, index) => images[index]?.status !== 'success');
                    setImages(newImages);
                    setFiles(newFiles);
                    setUploadedIds([]);
                    setMessage({
                        type: 'error',
                        text: `${failedImages.length} image(s) failed to upload. Please try again.`
                    });
                }
            }, 5000);

        } catch (error) {
            console.error('Upload error:', error);
            setMessage({
                type: 'error',
                text: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}. Check console for details.`
            });
        } finally {
            setIsUploading(false);
            setCurrentFileIndex(0);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getStatusIcon = (status?: UploadedImage['status']) => {
        switch (status) {
            case 'uploading':
                return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return <ImageIcon className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status?: UploadedImage['status']) => {
        switch (status) {
            case 'uploading':
                return 'border-blue-300 bg-blue-50';
            case 'success':
                return 'border-green-300 bg-green-50';
            case 'error':
                return 'border-red-300 bg-red-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isUploading) return;

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            const dataTransfer = new DataTransfer();
            droppedFiles.forEach(file => dataTransfer.items.add(file));

            if (fileInputRef.current) {
                fileInputRef.current.files = dataTransfer.files;
                handleFileSelect({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
            }
        }
    };

    const successfulUploads = images.filter(img => img.status === 'success').length;
    const failedUploads = images.filter(img => img.status === 'error').length;
    const pendingUploads = images.filter(img => img.status === 'pending').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        Bulk Image Upload for Dinner Galleries
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Upload multiple images at once to Cloudinary and assign them to the appropriate dinner gallery
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        API Endpoint: {API_BASE_URL}/api/images/upload | Max 20 images at once
                    </p>
                </div>

                {/* Upload Area */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    {/* Dinner Selection */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                        <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-600" />
                            Select Dinner Gallery
                        </label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setSelectedDinner('second')}
                                disabled={isUploading}
                                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                                    selectedDinner === 'second'
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Second Dinner (Before March 19, 2026)
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedDinner('third')}
                                disabled={isUploading}
                                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                                    selectedDinner === 'third'
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Third Dinner (After March 19, 2026)
                            </button>
                        </div>

                        {/* Batch Mode Selection */}
                        <div className="mt-4 flex items-center justify-center gap-4">
                            <label className="text-sm text-gray-600">Upload Mode:</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setBatchMode('sequential')}
                                    disabled={isUploading}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                                        batchMode === 'sequential'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Sequential (Slower, Memory Safe)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBatchMode('parallel')}
                                    disabled={isUploading}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                                        batchMode === 'parallel'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Parallel (Faster, More Memory)
                                </button>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 mt-3">
                            {selectedDinner === 'third'
                                ? '📸 Images uploaded now will appear in the Third Dinner gallery (March 19, 2026 and after)'
                                : '📸 Images uploaded now will appear in the Second Dinner gallery (before March 19, 2026)'}
                        </p>
                    </div>

                    {/* Drop Zone */}
                    <div
                        className={`border-3 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                            isUploading
                                ? 'border-blue-300 bg-blue-50'
                                : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50 cursor-pointer'
                        }`}
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        role="button"
                        tabIndex={0}
                        aria-label="Upload images by clicking or dragging and dropping"
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={isUploading}
                        />

                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <div className={`p-4 rounded-full ${
                                    isUploading ? 'bg-blue-100' : 'bg-gray-100'
                                }`}>
                                    <UploadCloud className={`h-12 w-12 ${
                                        isUploading ? 'text-blue-500' : 'text-gray-400'
                                    }`} />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                                    {isUploading ? 'Uploading...' : 'Drag & drop or click to upload'}
                                </h3>
                                <p className="text-gray-500">
                                    Upload JPG, PNG, GIF, WebP. Max 10MB per image.
                                </p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Maximum 20 images at once
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Overall Progress Bar */}
                    {isUploading && files.length > 0 && (
                        <div className="mt-8">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>
                                    Uploading {currentFileIndex + 1} of {files.length} images...
                                    {batchMode === 'parallel' && ' (Parallel Mode)'}
                                </span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <div className="mt-2 text-center text-sm text-gray-500">
                                Successful: {successfulUploads} | Failed: {failedUploads} | Pending: {pendingUploads}
                            </div>
                        </div>
                    )}

                    {/* Selected Images Preview */}
                    {images.length > 0 && (
                        <div className="mt-10">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-800">
                                    Selected Images ({images.length})
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={removeAllImages}
                                        disabled={isUploading}
                                        className="text-sm text-red-500 hover:text-red-700 px-3 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
                                    >
                                        <Trash2 size={14} />
                                        Clear All
                                    </button>
                                    <button
                                        onClick={uploadToBackend}
                                        disabled={isUploading || images.length === 0}
                                        className={`px-4 py-1 rounded text-sm font-medium flex items-center gap-1 ${
                                            isUploading || images.length === 0
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                                        }`}
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 size={14} className="animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={14} />
                                                Upload All ({images.length})
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {images.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`relative group border-2 rounded-lg overflow-hidden transition-all duration-300 ${getStatusColor(image.status)}`}
                                    >
                                        {/* Image */}
                                        <div className="aspect-square bg-gray-200 relative">
                                            <img
                                                src={image.url}
                                                alt={image.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />

                                            {/* Status Overlay */}
                                            {image.status === 'uploading' && (
                                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                                                    <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
                                                    <span className="text-white text-xs font-medium">
                                                        {image.progress || 0}%
                                                    </span>
                                                </div>
                                            )}

                                            {image.status === 'success' && (
                                                <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                                                    <CheckCircle className="h-12 w-12 text-white" />
                                                </div>
                                            )}

                                            {image.status === 'error' && (
                                                <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                                                    <AlertCircle className="h-12 w-12 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                            <p className="text-white text-xs font-medium truncate">
                                                {image.name}
                                            </p>
                                            <p className="text-gray-300 text-xs">
                                                {formatFileSize(image.size)}
                                            </p>
                                            <p className="text-gray-300 text-xs mt-1">
                                                Target: {selectedDinner === 'third' ? 'Third Dinner' : 'Second Dinner'}
                                            </p>
                                            {image.error && (
                                                <p className="text-red-300 text-xs mt-1 truncate">
                                                    Error: {image.error}
                                                </p>
                                            )}
                                        </div>

                                        {/* Status Badge */}
                                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 rounded-full px-2 py-1">
                                            {getStatusIcon(image.status)}
                                            <span className="text-white text-xs capitalize">
                                                {image.status || 'pending'}
                                            </span>
                                        </div>

                                        {/* Remove Button */}
                                        {!isUploading && image.status !== 'uploading' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeImage(index);
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600"
                                                aria-label={`Remove ${image.name}`}
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 text-sm text-gray-600 text-center">
                                Total size: {formatFileSize(files.reduce((total, file) => total + file.size, 0))}
                                {successfulUploads > 0 && (
                                    <span className="ml-2 text-green-600">
                                        | ✅ {successfulUploads} uploaded
                                    </span>
                                )}
                                {failedUploads > 0 && (
                                    <span className="ml-2 text-red-600">
                                        | ❌ {failedUploads} failed
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Message Display */}
                    {message && (
                        <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 animate-in fade-in duration-300 ${
                            message.type === 'success'
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                            {message.type === 'success' ? (
                                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            )}
                            <div>
                                <p className="font-medium">{message.text}</p>
                                {message.type === 'error' && (
                                    <p className="text-sm mt-1 opacity-80">
                                        Check browser console for details
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        Bulk Upload Features
                    </h3>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center space-y-3">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                                1
                            </div>
                            <h4 className="font-bold text-gray-800">Multiple Files</h4>
                            <p className="text-gray-600 text-sm">
                                Select up to 20 images at once for bulk upload. Supported formats: JPG, PNG, GIF, WebP.
                            </p>
                        </div>

                        <div className="text-center space-y-3">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                                2
                            </div>
                            <h4 className="font-bold text-gray-800">Two Upload Modes</h4>
                            <p className="text-gray-600 text-sm">
                                <strong>Sequential:</strong> Upload one by one (memory safe)<br />
                                <strong>Parallel:</strong> Upload multiple at once (faster)
                            </p>
                        </div>

                        <div className="text-center space-y-3">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                                3
                            </div>
                            <h4 className="font-bold text-gray-800">Progress Tracking</h4>
                            <p className="text-gray-600 text-sm">
                                Real-time progress for each image with individual status indicators. Failed uploads can be retried.
                            </p>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                            💡 Pro Tips
                        </h4>
                        <ul className="text-blue-700 text-sm space-y-2">
                            <li>• <strong>Sequential mode</strong> is recommended for slow internet connections or when uploading many large files</li>
                            <li>• <strong>Parallel mode</strong> is faster but uses more browser memory - best for 5-10 images at once</li>
                            <li>• Failed uploads will remain in the list so you can retry them individually</li>
                            <li>• All images are automatically optimized and resized to 1200x1200px max</li>
                            <li>• Images are tagged with dinner type for easy filtering in galleries</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}