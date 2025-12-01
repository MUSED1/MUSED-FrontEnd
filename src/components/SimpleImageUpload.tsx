// components/SimpleImageUpload.tsx
import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadedImage {
    id?: string;
    url: string;
    name: string;
    size: number;
    publicId?: string;
}

export function SimpleImageUpload() {
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedIds, setUploadedIds] = useState<string[]>([]);
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<File[]>([]); // Store File objects

    // API base URL - adjust this based on your environment
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mused-backend.onrender.com';

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
        if (files.length + imageFiles.length > 10) {
            setMessage({
                type: 'error',
                text: 'Maximum 10 images allowed at once'
            });
            return;
        }

        // Store File objects
        setFiles(prev => [...prev, ...imageFiles]);

        // Create preview URLs
        const newImages = imageFiles.map(file => ({
            url: URL.createObjectURL(file),
            name: file.name,
            size: file.size
        }));

        // Add to images state for display
        setImages(prev => [...prev, ...newImages]);

        // Clear any previous error messages
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
        setMessage(null); // Clear any messages
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
        setMessage(null);
        setUploadedIds([]);

        try {
            // ✅ Use the correct API URL
            const API_URL = `${API_BASE_URL}/api/images/upload`;

            console.log('Uploading to:', API_URL);
            console.log('Number of files:', files.length);

            const uploadedImageIds: string[] = [];

            for (let i = 0; i < files.length; i++) {
                // Create FormData for this file
                const formData = new FormData();
                formData.append('image', files[i]);

                // Add tags if needed
                formData.append('tags', 'uploaded,simple-upload,frontend');

                console.log(`Uploading file ${i + 1}/${files.length}: ${files[i].name}`);

                try {
                    // ✅ Use the full API URL
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        body: formData,
                        // ✅ Add credentials for cross-origin requests
                        credentials: 'include',
                        // ✅ Set mode to 'cors' for cross-origin requests
                        mode: 'cors',
                    });

                    console.log(`Response status for ${files[i].name}:`, response.status);

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    const result = await response.json();
                    console.log(`Response for ${files[i].name}:`, result);

                    if (result.success) {
                        uploadedImageIds.push(result.data._id);
                        console.log(`Successfully uploaded: ${files[i].name}`);
                    } else {
                        throw new Error(result.message || `Failed to upload ${files[i].name}`);
                    }
                } catch (fileError) {
                    console.error(`Error uploading ${files[i].name}:`, fileError);
                    throw new Error(`Failed to upload ${files[i].name}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
                }

                // Update progress
                const progress = Math.round(((i + 1) / files.length) * 100);
                setUploadProgress(progress);
            }

            setUploadProgress(100);

            setMessage({
                type: 'success',
                text: `Successfully uploaded ${files.length} image(s) to Cloudinary and MongoDB!`
            });

            // Store uploaded image IDs
            setUploadedIds(uploadedImageIds);

            // Clear images after successful upload (optional)
            setTimeout(() => {
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
            }, 3000);

        } catch (error) {
            console.error('Upload error:', error);
            setMessage({
                type: 'error',
                text: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}. Check console for details.`
            });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
            // Simulate file input change
            const dataTransfer = new DataTransfer();
            droppedFiles.forEach(file => dataTransfer.items.add(file));

            if (fileInputRef.current) {
                fileInputRef.current.files = dataTransfer.files;
                handleFileSelect({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        Cloudinary + MongoDB Image Upload
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Upload images to Cloudinary and store metadata in MongoDB
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        API Endpoint: {API_BASE_URL}/api/images/upload
                    </p>
                </div>

                {/* Upload Area */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    {/* Drop Zone */}
                    <div
                        className={`border-3 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                            isUploading
                                ? 'border-blue-300 bg-blue-50'
                                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
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
                                    <Upload className={`h-12 w-12 ${
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
                                    Maximum 10 images at once
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {isUploading && (
                        <div className="mt-8">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Uploading to Cloudinary...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
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
                                        onClick={() => {
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
                                        }}
                                        className="text-sm text-red-500 hover:text-red-700 px-3 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors"
                                        disabled={isUploading}
                                    >
                                        Clear All
                                    </button>
                                    <button
                                        onClick={uploadToBackend}
                                        disabled={isUploading}
                                        className={`px-4 py-1 rounded text-sm font-medium ${
                                            isUploading
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                    >
                                        {isUploading ? 'Uploading...' : 'Upload Now'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {images.map((image, index) => (
                                    <div
                                        key={index}
                                        className="relative group border rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-shadow"
                                    >
                                        {/* Image */}
                                        <div className="aspect-square bg-gray-200">
                                            <img
                                                src={image.url}
                                                alt={image.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        </div>

                                        {/* Overlay Info */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                            <p className="text-white text-xs font-medium truncate">
                                                {image.name}
                                            </p>
                                            <p className="text-gray-300 text-xs">
                                                {formatFileSize(image.size)}
                                            </p>
                                            <p className="text-gray-300 text-xs mt-1">
                                                {image.publicId ? 'Uploaded' : 'Ready to upload'}
                                            </p>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeImage(index);
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600"
                                            disabled={isUploading}
                                            aria-label={`Remove ${image.name}`}
                                        >
                                            <X size={14} />
                                        </button>

                                        {/* Uploaded Indicator */}
                                        {uploadedIds.length > 0 && uploadedIds[index] && (
                                            <div className="absolute top-2 left-2 p-1.5 bg-green-500 text-white rounded-full animate-pulse">
                                                <CheckCircle size={14} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Total Size Info */}
                            <div className="mt-4 text-sm text-gray-600 text-center">
                                Total size: {formatFileSize(files.reduce((total, file) => total + file.size, 0))}
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

                    {/* Upload Button */}
                    {images.length > 0 && (
                        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={uploadToBackend}
                                disabled={isUploading || images.length === 0}
                                className={`px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                                    isUploading || images.length === 0
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                                }`}
                            >
                                {isUploading ? (
                                    <>
                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Uploading... ({uploadProgress}%)
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} />
                                        Upload {images.length} Image{images.length !== 1 ? 's' : ''}
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        How It Works
                    </h3>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center space-y-3">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                                1
                            </div>
                            <h4 className="font-bold text-gray-800">Select Images</h4>
                            <p className="text-gray-600 text-sm">
                                Choose images from your device. Supports JPG, PNG, GIF, and WebP formats.
                            </p>
                        </div>

                        <div className="text-center space-y-3">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                                2
                            </div>
                            <h4 className="font-bold text-gray-800">Upload to Cloudinary</h4>
                            <p className="text-gray-600 text-sm">
                                Images are uploaded to Cloudinary CDN for fast delivery worldwide.
                            </p>
                        </div>

                        <div className="text-center space-y-3">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                                3
                            </div>
                            <h4 className="font-bold text-gray-800">Store in MongoDB</h4>
                            <p className="text-gray-600 text-sm">
                                Image metadata, URLs, and public IDs are saved to your MongoDB database.
                            </p>
                        </div>
                    </div>

                    {/* Debug Info */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h4 className="font-bold text-gray-800 mb-3 text-center">Debug Information</h4>
                        <div className="bg-gray-50 rounded-lg p-4 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-gray-600">API Base URL:</span>
                                    <code className="ml-2 text-blue-600">{API_BASE_URL}</code>
                                </div>
                                <div>
                                    <span className="text-gray-600">Upload Endpoint:</span>
                                    <code className="ml-2 text-blue-600">/api/images/upload</code>
                                </div>
                                <div>
                                    <span className="text-gray-600">Files Selected:</span>
                                    <span className="ml-2 font-medium">{files.length}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Upload Status:</span>
                                    <span className={`ml-2 font-medium ${isUploading ? 'text-yellow-600' : uploadedIds.length > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                        {isUploading ? 'Uploading...' : uploadedIds.length > 0 ? 'Uploaded' : 'Ready'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Troubleshooting Tips */}
                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Troubleshooting Tips
                    </h4>
                    <ul className="text-yellow-700 text-sm space-y-2">
                        <li>• Make sure your backend server is running on {API_BASE_URL}</li>
                        <li>• Check browser console for detailed error messages</li>
                        <li>• Verify CORS is configured correctly in your backend</li>
                        <li>• Ensure files are under 10MB each</li>
                        <li>• Try uploading one image first to test the connection</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}