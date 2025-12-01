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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);

        // Store File objects
        setFiles(prev => [...prev, ...selectedFiles]);

        // Create preview URLs
        const newImages = selectedFiles.map(file => ({
            url: URL.createObjectURL(file),
            name: file.name,
            size: file.size
        }));

        // Add to images state for display
        setImages(prev => [...prev, ...newImages]);

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

        try {
            // Upload files one by one to track progress
            const uploadedImageIds: string[] = [];

            for (let i = 0; i < files.length; i++) {
                // Create FormData for this file
                const formData = new FormData();
                formData.append('image', files[i]); // Single image for single upload endpoint

                // Add tags if needed
                if (files[i].name) {
                    formData.append('tags', 'uploaded,simple-upload');
                }

                // Make API call for each file
                const response = await fetch('/api/images/upload', {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    uploadedImageIds.push(result.data._id);
                } else {
                    throw new Error(result.message || `Failed to upload ${files[i].name}`);
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
                setImages([]);
                setFiles([]);
                setUploadedIds([]);
            }, 3000);

        } catch (error) {
            console.error('Upload error:', error);
            setMessage({
                type: 'error',
                text: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
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
                </div>

                {/* Upload Area */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    {/* Drop Zone */}
                    <div
                        className={`border-3 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                            isUploading
                                ? 'border-blue-300 bg-blue-50'
                                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                        }`}
                        onClick={() => !isUploading && fileInputRef.current?.click()}
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
                                <button
                                    onClick={() => {
                                        setImages([]);
                                        setFiles([]);
                                    }}
                                    className="text-sm text-red-500 hover:text-red-700"
                                    disabled={isUploading}
                                >
                                    Clear All
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {images.map((image, index) => (
                                    <div
                                        key={index}
                                        className="relative group border rounded-lg overflow-hidden bg-gray-50"
                                    >
                                        {/* Image */}
                                        <div className="aspect-square bg-gray-200">
                                            <img
                                                src={image.url}
                                                alt={image.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Overlay Info */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
                                            <p className="text-white text-xs truncate">
                                                {image.name}
                                            </p>
                                            <p className="text-gray-300 text-xs">
                                                {formatFileSize(image.size)}
                                            </p>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            disabled={isUploading}
                                        >
                                            <X size={14} />
                                        </button>

                                        {/* Uploaded Indicator */}
                                        {uploadedIds.length > 0 && index < uploadedIds.length && (
                                            <div className="absolute top-2 left-2 p-1 bg-green-500 text-white rounded-full">
                                                <CheckCircle size={14} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Message Display */}
                    {message && (
                        <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
                            message.type === 'success'
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                            {message.type === 'success' ? (
                                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            )}
                            <p className="font-medium">{message.text}</p>
                        </div>
                    )}

                    {/* Upload Button */}
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={uploadToBackend}
                            disabled={isUploading || images.length === 0}
                            className={`px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 flex items-center gap-3 ${
                                isUploading || images.length === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                            }`}
                        >
                            {isUploading ? (
                                <>
                                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload size={20} />
                                    Upload {images.length} Image{images.length !== 1 ? 's' : ''}
                                </>
                            )}
                        </button>
                    </div>
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
                </div>
            </div>
        </div>
    );
}