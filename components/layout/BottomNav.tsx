'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, User, Package, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export function BottomNav() {
    const pathname = usePathname();
    const { t } = useTranslation();

    const tabs = [
        { name: t('sidebar.home'), icon: Home, href: '/' },
        { name: t('sidebar.messages'), icon: MessageSquare, href: '/messages' },
        { name: t('sidebar.myOrders'), icon: Package, href: '/profile/orders' },
        { name: t('sidebar.wallet'), icon: Wallet, href: '/profile/wallet' },
        { name: t('sidebar.account'), icon: User, href: '/profile' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-border bg-surface/80 backdrop-blur-xl md:hidden pb-[env(safe-area-inset-bottom)]">
            <div className="flex h-16 items-center justify-around px-2">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-colors",
                                isActive ? "text-primary" : "text-text-secondary hover:text-primary"
                            )}
                        >
                            <Icon size={20} className={isActive ? "fill-primary/20" : ""} />
                            <span className="text-[10px] font-medium leading-none">{tab.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
