'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { useTranslation } from 'react-i18next';

export function MainLayout({ children }: { children: React.ReactNode }) {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen flex flex-col pb-16 md:pb-0">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 lg:px-8 py-6">
                {children}
            </main>
            <BottomNav />

            <footer className="hidden md:block border-t border-border mt-12 py-12 bg-surface">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="space-y-4">
                            <h3 className="font-bold uppercase tracking-widest text-xs">{t('common.marketplace')}</h3>
                            <ul className="space-y-2 text-sm text-text-secondary">
                                <li><Link href="/" className="hover:text-primary transition-colors">{t('sidebar.home')}</Link></li>
                                <li><Link href="/products" className="hover:text-primary transition-colors">{t('home.products')}</Link></li>
                                <li><Link href="/shops" className="hover:text-primary transition-colors">{t('home.shops')}</Link></li>
                                <li><Link href="/categories" className="hover:text-primary transition-colors">{t('home.categories')}</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-bold uppercase tracking-widest text-xs">{t('common.information')}</h3>
                            <ul className="space-y-2 text-sm text-text-secondary">
                                <li><Link href="/about" className="hover:text-primary transition-colors">{t('sidebar.about')}</Link></li>
                                <li><Link href="/terms" className="hover:text-primary transition-colors">{t('profile.terms')}</Link></li>
                                <li><Link href="/privacy" className="hover:text-primary transition-colors">{t('profile.privacy') || 'Privacy Policy'}</Link></li>
                                <li><Link href="/help" className="hover:text-primary transition-colors">{t('sidebar.helpSupport')}</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-bold uppercase tracking-widest text-xs">{t('common.account')}</h3>
                            <ul className="space-y-2 text-sm text-text-secondary">
                                <li><Link href="/profile" className="hover:text-primary transition-colors">{t('sidebar.myProfile')}</Link></li>
                                <li><Link href="/orders" className="hover:text-primary transition-colors">{t('sidebar.myOrders')}</Link></li>
                                <li><Link href="/wallet" className="hover:text-primary transition-colors">{t('sidebar.wallet')}</Link></li>
                                <li><Link href="/settings" className="hover:text-primary transition-colors">{t('sidebar.settings')}</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h3 className="font-bold uppercase tracking-widest text-xs">{t('common.download')}</h3>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
                                        const isAndroid = /android/i.test(userAgent);
                                        if (isAndroid) {
                                            window.open('https://play.google.com/store/apps/details?id=com.kash.marketplace', '_blank');
                                        } else {
                                            // For iOS or others, maybe show a hint or redirect to info page
                                            // PWA prompt will handle iOS specific logic normally
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }
                                    }}
                                    className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-2xl hover:bg-zinc-900 transition-all border border-zinc-800 shadow-xl group active:scale-95 text-left"
                                >
                                    <svg viewBox="30 336.7 120.9 129.2" className="h-6 w-6 shrink-0">
                                        <path fill="#4DB6AC" d="M30 344.9v112.8c0 4.4 3.6 8 8 8 1.1 0 2.1-.2 3.1-.7l65.1-59.7-76.2-60.4z" />
                                        <path fill="#D32F2F" d="M110.1 405.1l36.3-33.3c3.2-2.9 4.4-7.4 3.1-11.5-1.3-4.1-5.1-7-9.4-7H38c-4.4 0-8 3.6-8 8v.2l80.1 43.6z" />
                                        <path fill="#FBC02D" d="M146.4 430c1.3-4.1.1-8.6-3.1-11.5l-36.3-33.3-3.1 2.8-38.9 35.7v.1c0 4.4 3.6 8 8 8h104c4.3 0 8.1-2.9 9.4-7.1z" />
                                        <path fill="#1976D2" d="M107.1 388l42.4 23.1c1.3.7 2.1 2.1 2.1 3.6 0 1.5-.8 2.9-2.1 3.6l-42.4 23.1-4.8-4.4 3.7-3.4 31.7-29-31.7-29-3.7-3.4 4.8-4.2z" />
                                    </svg>
                                    <div>
                                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-tighter leading-none mb-0.5">Get it on</p>
                                        <p className="text-sm font-black tracking-tight leading-none uppercase italic">Google Play</p>
                                    </div>
                                </button>
                                <p className="text-[9px] text-text-secondary font-medium italic opacity-70">
                                    * Native mobile app coming soon for iOS. Use PWA (Add to Home Screen) for the best experience.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-secondary font-medium">
                        <p>© {new Date().getFullYear()} {t('common.footerProfessional')}. {t('common.footerAllRights')}</p>
                        <div className="flex gap-6">
                            <Link href="/terms" className="hover:text-primary transition-colors">{t('profile.terms')}</Link>
                            <Link href="/privacy" className="hover:text-primary transition-colors">{t('profile.privacy') || 'Privacy'}</Link>
                            <Link href="/about" className="hover:text-primary transition-colors">{t('common.contact')}</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
