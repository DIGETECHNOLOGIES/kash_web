'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import '@/locales/i18n';
import { useThemeStore } from '@/store/themeStore';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            retry: 1,
        },
    },
});

export function RootProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const { mode } = useThemeStore();

    useEffect(() => {
        setMounted(true);
        // Apply theme on mount
        document.documentElement.classList.toggle('dark', mode === 'dark');
    }, [mode]);

    if (!mounted) {
        return <div className="min-h-screen bg-background" />;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <div className={mode === 'dark' ? 'dark' : ''}>
                {children}
            </div>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
