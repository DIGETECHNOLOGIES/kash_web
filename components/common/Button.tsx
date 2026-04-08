'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'error' | 'surface' | 'white';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    disabled,
    ...props
}: ButtonProps) {
    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-dark shadow-md active:scale-95',
        secondary: 'bg-secondary text-white hover:opacity-90 active:scale-95',
        outline: 'border border-border bg-transparent hover:bg-background text-text active:scale-95',
        ghost: 'bg-transparent hover:bg-background text-text',
        error: 'bg-error text-white hover:opacity-90 active:scale-95',
        surface: 'bg-surface dark:bg-surface-dark text-text dark:text-text-dark hover:opacity-90 active:scale-95 shadow-sm',
        white: 'bg-white text-primary hover:bg-gray-50 active:scale-95 shadow-md',
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-11 px-6 text-sm font-medium',
        lg: 'h-14 px-10 text-base font-semibold',
        icon: 'h-10 w-10 p-0',
    };

    return (
        <button
            className={cn(
                'relative inline-flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 overflow-hidden',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && (
                <Loader2 className="absolute mr-2 h-4 w-4 animate-spin" />
            )}
            <span className={cn('transition-opacity duration-200', isLoading ? 'opacity-0' : 'opacity-100')}>
                {children}
            </span>
        </button>
    );
}
