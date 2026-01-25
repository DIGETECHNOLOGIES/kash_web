'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, User, MessageCircle, Menu, Sun, Moon, Search } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';

export function Navbar() {
    const { t } = useTranslation();
    const { mode, toggleTheme } = useThemeStore();
    const { isAuthenticated, user } = useAuthStore();
    const { items } = useCartStore();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-2xl font-bold tracking-tight text-primary">
                        KASH
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
                            {t('home.products')}
                        </Link>
                        <Link href="/shops" className="text-sm font-medium hover:text-primary transition-colors">
                            {t('home.shops')}
                        </Link>
                        <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">
                            {t('home.categories')}
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <form onSubmit={handleSearch} className="relative hidden lg:block">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                        <input
                            type="text"
                            placeholder={t('common.search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 w-64 rounded-full border border-border bg-background pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </form>

                    <button
                        onClick={toggleTheme}
                        className="rounded-full p-2 hover:bg-background transition-colors"
                    >
                        {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <Link href="/messages" className="rounded-full p-2 hover:bg-background transition-colors relative">
                        <MessageCircle size={20} />
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                            0
                        </span>
                    </Link>

                    <Link href="/cart" className="rounded-full p-2 hover:bg-background transition-colors relative">
                        <ShoppingCart size={20} />
                        {cartCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {isAuthenticated ? (
                        <Link href="/profile" className="flex items-center gap-2 rounded-full border border-border p-1 pr-3 hover:bg-background transition-colors">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {user?.username?.[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-medium hidden sm:inline">{user?.username}</span>
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
                        >
                            {t('common.login')}
                        </Link>
                    )}

                    <button
                        className="md:hidden rounded-full p-2 hover:bg-background transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
                    <div className="absolute right-0 top-0 h-full w-64 bg-surface dark:bg-surface-dark border-l border-border p-6 shadow-2xl animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-xl font-bold text-primary">Menu</span>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-background rounded-full">
                                <Menu size={20} />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-6">
                            <Link href="/" className="text-lg font-medium hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                                {t('common.home')}
                            </Link>
                            <Link href="/products" className="text-lg font-medium hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                                {t('home.products')}
                            </Link>
                            <Link href="/shops" className="text-lg font-medium hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                                {t('home.shops')}
                            </Link>
                            <Link href="/categories" className="text-lg font-medium hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                                {t('home.categories')}
                            </Link>

                            <div className="h-px bg-border my-2" />

                            {isAuthenticated ? (
                                <>
                                    <Link href="/profile" className="text-lg font-medium hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                                        {t('common.profile')}
                                    </Link>
                                    <Link href="/orders" className="text-lg font-medium hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                                        {t('common.orders')}
                                    </Link>
                                </>
                            ) : (
                                <Link href="/login" className="text-lg font-medium text-primary hover:text-primary-dark transition-colors" onClick={() => setIsMenuOpen(false)}>
                                    {t('common.login')}
                                </Link>
                            )}
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
}
