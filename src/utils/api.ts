// utils/api.ts

export const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api',
    endpoints: {
        clothing: '/clothing',
        clothingAdmin: '/admin/clothing',  // FIXED: matches backend route
        clothingAdminImages: '/admin/clothing',  // For image updates
        clothingMyItems: '/clothing/my-items',
        clothingImage: '/clothing/image',
        usersPicks: '/users/picks',
        usersReservations: '/users/reservations',
        auth: '/auth',
        createCheckout: '/create-checkout-session',
        adminReservations: '/admin/reservations',
        uploadImage: '/images/upload'  // FIXED: correct path
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

// Helper function for fetching paginated data
export async function fetchPaginated<T>(
    endpoint: string,
    page: number = 1,
    limit: number = 20,
    token?: string
): Promise<{
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    }
}> {
    const url = buildPaginatedUrl(endpoint, page, limit);

    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });

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

// Helper function to get image URL
export function getImageUrl(itemId: string, imageIndex: number = 0): string {
    return `${API_CONFIG.baseURL}${API_CONFIG.endpoints.clothingImage}/${itemId}/${imageIndex}`;
}

// Helper function to compress image
export async function compressImage(base64Image: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = `data:image/jpeg;base64,${base64Image}`;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            resolve(compressedBase64);
        };

        img.onerror = () => {
            reject(new Error('Failed to load image for compression'));
        };
    });
}

// Helper function to format date
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Helper function to get status color classes
export function getStatusColor(status: string): string {
    switch (status) {
        case 'available': return 'bg-green-100 text-green-800';
        case 'reserved': return 'bg-yellow-100 text-yellow-800';
        case 'sold': return 'bg-red-100 text-red-800';
        case 'active': return 'bg-green-100 text-green-800 border-green-200';
        case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800';
    }
}

// Helper function to get status icon
export function getStatusIcon(status: string): { icon: string; color: string } {
    switch (status) {
        case 'available': return { icon: '✓', color: 'green' };
        case 'reserved': return { icon: '⏳', color: 'yellow' };
        case 'sold': return { icon: '✗', color: 'red' };
        case 'active': return { icon: '✓', color: 'green' };
        case 'completed': return { icon: '✓', color: 'blue' };
        case 'cancelled': return { icon: '✗', color: 'red' };
        default: return { icon: '•', color: 'gray' };
    }
}

// Helper function to get pickup method label
export function getPickupMethodLabel(method: string): string {
    return method === 'without' ? 'No need to be present' : 'Must be present';
}