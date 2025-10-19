import React from 'react'
interface ButtonProps {
    children: React.ReactNode
    variant?: 'primary' | 'secondary' | 'outline'
    size?: 'small' | 'medium' | 'large'
    onClick?: () => void
    className?: string
}
export function Button({
                           children,
                           variant = 'primary',
                           size = 'medium',
                           onClick,
                           className = '',
                       }: ButtonProps) {
    const baseStyles =
        'font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
    const variantStyles = {
        primary:
            'bg-burgundy hover:bg-burgundy-dark text-cream focus:ring-burgundy',
        secondary:
            'bg-cream hover:bg-rose/30 text-burgundy border border-burgundy focus:ring-burgundy',
        outline:
            'bg-transparent hover:bg-rose/20 text-plum border border-plum/30 focus:ring-plum',
    }
    const sizeStyles = {
        small: 'text-sm px-3 py-1',
        medium: 'px-5 py-2',
        large: 'text-lg px-8 py-3',
    }
    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
    )
}
