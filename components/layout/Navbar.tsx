'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, User, MessageSquare, Menu, Sun, Moon, Search, Home, LayoutGrid, Package, Wallet, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '@/services/api/notificationApi';
import { messagingApi } from '@/services/api/messagingApi';

import { Sidebar } from '@/components/common/Sidebar';

export function Navbar() {
    const { t } = useTranslation();
    const { mode, toggleTheme } = useThemeStore();
    const { user, isAuthenticated, logout } = useAuthStore();
    const { items } = useCartStore();
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { data: notificationData } = useQuery({
        queryKey: ['unread-notifications'],
        queryFn: () => notificationApi.getUnreadCount(),
        enabled: isAuthenticated,
        refetchInterval: 30000
    });

    const { data: messageUnreadData } = useQuery({
        queryKey: ['unread-messages'],
        queryFn: () => messagingApi.getUnreadSummary(),
        enabled: isAuthenticated,
        refetchInterval: 30000
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <header className="sticky top-0 z-[1000] w-full border-b border-border bg-surface/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
                <div className="flex items-center gap-4">
                    <button
                        className="rounded-xl p-2.5 hover:bg-background transition-all bg-primary/5 text-primary shadow-inner border border-primary/10"
                        onClick={() => setIsMenuOpen(true)}
                    >
                        <Menu size={22} className="stroke-[2.5px]" />
                    </button>

                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="KASH Logo" className="h-9 w-9 object-contain" />
                        <span className="text-2xl font-black italic tracking-tighter text-primary">KASH</span>
                    </Link>

                    <nav className="hidden xl:flex items-center gap-6 ml-4">
                        <Link href="/products" className="text-xs font-black hover:text-primary transition-colors uppercase italic tracking-widest text-text-secondary">
                            {t('home.products')}
                        </Link>
                        <Link href="/shops" className="text-xs font-black hover:text-primary transition-colors uppercase italic tracking-widest text-text-secondary">
                            {t('home.shops')}
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-1 md:gap-3">
                    <form onSubmit={handleSearch} className="relative hidden lg:block">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                        <input
                            type="text"
                            placeholder={t('common.search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-11 w-72 rounded-2xl border border-border bg-background pl-11 pr-4 text-sm font-bold focus:border-primary focus:outline-none transition-all shadow-inner"
                        />
                    </form>

                    <button
                        onClick={toggleTheme}
                        className="rounded-xl h-11 w-11 flex items-center justify-center hover:bg-background transition-all text-text-secondary"
                    >
                        {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <Link href="/profile/notifications" className="rounded-xl h-11 w-11 flex items-center justify-center hover:bg-background transition-all text-text-secondary relative">
                        <Bell size={18} />
                        {notificationData?.count > 0 && (
                            <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-white shadow-lg shadow-primary/30">
                                {notificationData.count}
                            </span>
                        )}
                    </Link>

                    <Link href="/messages" className="rounded-xl h-11 w-11 flex items-center justify-center hover:bg-background transition-all text-text-secondary relative">
                        <MessageSquare size={18} />
                        {(messageUnreadData?.totalUnread || 0) > 0 && (
                            <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-white shadow-lg shadow-primary/30">
                                {messageUnreadData?.totalUnread}
                            </span>
                        )}
                    </Link>

                    <Link href="/cart" className="rounded-xl h-11 w-11 flex items-center justify-center hover:bg-background transition-all text-text-secondary relative">
                        <ShoppingCart size={18} />
                        {cartCount > 0 && (
                            <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-white shadow-lg shadow-primary/30">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {isAuthenticated ? (
                        <Link href="/profile" className="hidden sm:flex items-center gap-2 rounded-2xl border border-border bg-background/50 p-1.5 pr-4 hover:border-primary/50 transition-all shadow-sm">
                            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-white font-black italic shadow-lg shadow-primary/20">
                                {user?.username?.[0].toUpperCase()}
                            </div>
                            <span className="text-[11px] font-black italic uppercase tracking-tighter">{user?.username}</span>
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="hidden sm:block rounded-2xl bg-primary px-8 py-3 text-xs font-black italic uppercase tracking-widest text-white hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
                        >
                            {t('common.login')}
                        </Link>
                    )}
                </div>
            </div>

            <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </header>
    );
}
