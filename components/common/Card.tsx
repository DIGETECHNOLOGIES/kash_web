'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
    style?: React.CSSProperties;
}

export function Card({ children, className, onClick, hoverable = false, style }: CardProps) {
    return (
        <div
            onClick={onClick}
            style={style}
            className={cn(
                'rounded-2xl border border-border bg-surface p-4 transition-all duration-300',
                hoverable && 'hover:border-primary/50 hover:shadow-lg cursor-pointer',
                className
            )}
        >
            {children}
        </div>
    );
}
