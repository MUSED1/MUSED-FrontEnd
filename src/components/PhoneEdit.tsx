// components/PhoneEdit.tsx
import { useState, useEffect, useRef } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

interface PhoneEditProps {
    phone: string;
    onUpdate?: (newPhone: string) => void;
    className?: string;
}

export function PhoneEdit({ phone, onUpdate, className = '' }: PhoneEditProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState(phone || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const { loginWithToken } = useAuth(); // Removed unused 'user'

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = async () => {
        // Basic validation
        if (!phoneNumber.trim()) {
            setError('Phone number is required');
            return;
        }

        // Phone number validation (simple)
        const phoneRegex = /^[0-9+\-\s()]{10,}$/;
        if (!phoneRegex.test(phoneNumber)) {
            setError('Please enter a valid phone number');
            return;
        }

        setIsUpdating(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'https://mused-backend.onrender.com/api';

            const response = await axios.put(
                `${API_URL}/auth/update-profile`,
                { phone: phoneNumber },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                // Update the token to refresh user data
                if (token) {
                    await loginWithToken(token);
                }

                setIsEditing(false);
                if (onUpdate) {
                    onUpdate(phoneNumber);
                }
            }
        } catch (error) {
            console.error('Error updating phone:', error);
            setError('Failed to update phone number');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancel = () => {
        setPhoneNumber(phone || '');
        setIsEditing(false);
        setError('');
    };

    if (isEditing) {
        return (
            <div className={`flex flex-col gap-2 ${className}`}>
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 px-3 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 text-plum"
                        placeholder="+1 (555) 123-4567"
                        disabled={isUpdating}
                    />
                    <button
                        onClick={handleSave}
                        disabled={isUpdating}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                        title="Save"
                    >
                        <Check size={18} />
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={isUpdating}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                        title="Cancel"
                    >
                        <X size={18} />
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 group ${className}`}>
            <span className={phone ? 'text-plum' : 'text-plum/40 italic'}>
                {phone || 'Not provided'}
            </span>
            <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-plum/40 hover:text-gold transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Edit phone number"
            >
                <Pencil size={16} />
            </button>
        </div>
    );
}