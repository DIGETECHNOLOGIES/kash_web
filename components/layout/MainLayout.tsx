'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';

export function MainLayout({ children }: { children: React.ReactNode }) {
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
                            <h3 className="font-bold uppercase tracking-widest text-xs">Marketplace</h3>
                            <ul className="space-y-2 text-sm text-text-secondary">
                                <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                                <li><Link href="/products" className="hover:text-primary transition-colors">Products</Link></li>
                                <li><Link href="/shops" className="hover:text-primary transition-colors">Shops</Link></li>
                                <li><Link href="/categories" className="hover:text-primary transition-colors">Categories</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-bold uppercase tracking-widest text-xs">Information</h3>
                            <ul className="space-y-2 text-sm text-text-secondary">
                                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
                                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-bold uppercase tracking-widest text-xs">Account</h3>
                            <ul className="space-y-2 text-sm text-text-secondary">
                                <li><Link href="/profile" className="hover:text-primary transition-colors">My Profile</Link></li>
                                <li><Link href="/orders" className="hover:text-primary transition-colors">My Orders</Link></li>
                                <li><Link href="/wallet" className="hover:text-primary transition-colors">Wallet</Link></li>
                                <li><Link href="/settings" className="hover:text-primary transition-colors">Settings</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-secondary font-medium">
                        <p>© {new Date().getFullYear()} KASH Professional Marketplace. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
                            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                            <Link href="/about" className="hover:text-primary transition-colors">Contact</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
