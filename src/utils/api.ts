// utils/api.ts

export const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api',
    endpoints: {
        clothing: '/clothing',
        clothingAdmin: '/clothing/admin/all',
        clothingMyItems: '/clothing/my-items',
        clothingImage: '/clothing/image',
        usersPicks: '/users/picks',
        usersReservations: '/users/reservations',
        auth: '/auth'
    },
    pagination: {
        defaultLimit: 20,
        maxLimit: 50
    }
};

// Helper function for building paginated URLs
export const buildPaginatedUrl = (endpoint: string, page: number, limit: number = 20) => {
    return `${API_CONFIG.baseURL}${endpoint}?page=${page}&limit=${limit}`;
};

// Add the missing fetchPaginated function
export async function fetchPaginated<T>(
    endpoint: string,
    page: number = 1,
    limit: number = 20
): Promise<{
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}> {
    const url = buildPaginatedUrl(endpoint, page, limit);

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.message || 'Failed to fetch data');
    }

    return {
        data: result.data || [],
        pagination: result.pagination || {
            currentPage: page,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: limit,
            hasNextPage: false,
            hasPrevPage: false
        }
    };
}

// Add the missing compressImage function
export async function compressImage(base64Image: string, maxSizeMB: number = 1): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = `data:image/jpeg;base64,${base64Image}`;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions while maintaining aspect ratio
            const maxDimension = 1200; // Max width or height
            if (width > height && width > maxDimension) {
                height = (height / width) * maxDimension;
                width = maxDimension;
            } else if (height > maxDimension) {
                width = (width / height) * maxDimension;
                height = maxDimension;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            // Determine quality based on desired max size
            let quality = 0.9;
            const step = 0.1;
            let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

            // If the compressed image is still too large, reduce quality
            while (compressedDataUrl.length > maxSizeMB * 1024 * 1024 * 1.37 && quality > 0.1) {
                quality -= step;
                compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            }

            // Extract base64 data from data URL
            const base64Data = compressedDataUrl.split(',')[1];
            resolve(base64Data);
        };

        img.onerror = () => {
            reject(new Error('Failed to load image for compression'));
        };
    });
}

// Optional: Add a utility function to validate image file before upload
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Please upload JPEG, PNG, or WEBP images.'
        };
    }

    // Check file size (default max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'File too large. Maximum size is 5MB.'
        };
    }

    return { valid: true };
}