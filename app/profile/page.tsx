'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import {
    User,
    Settings,
    LogOut,
    ShoppingBag,
    Wallet,
    Store,
    ChevronRight,
    Bell,
    History,
    ShieldCheck,
    CreditCard,
    Share2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { walletApi } from '@/services/api/walletApi';
import { orderApi } from '@/services/api/orderApi';
import { formatCurrency } from '@/utils/formatters';

export default function ProfilePage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuthStore();

    const { data: wallet } = useQuery({
        queryKey: ['wallet-me'],
        queryFn: () => walletApi.getBalance(),
        enabled: isAuthenticated
    });

    const { data: orders } = useQuery({
        queryKey: ['orders-me'],
        queryFn: () => orderApi.listOrders(1, 1),
        enabled: isAuthenticated
    });

    if (!isAuthenticated) {
        if (typeof window !== 'undefined') {
            router.push('/login');
        }
        return null;
    }

    const menuItems = [
        { icon: ShoppingBag, label: t('sidebar.myOrders'), href: '/profile/orders', color: 'text-primary', bg: 'bg-primary/10' },
        { icon: Wallet, label: t('sidebar.wallet'), href: '/profile/wallet', color: 'text-info', bg: 'bg-info/10' },
        { icon: Store, label: t('sidebar.myShop'), href: '/profile/shop', color: 'text-warning', bg: 'bg-warning/10' },
        { icon: Bell, label: t('notifications.title'), href: '/profile/notifications', color: 'text-error', bg: 'bg-error/10' },
        { icon: Share2, label: t('settings.referrals'), href: '/profile/referrals', color: 'text-success', bg: 'bg-success/10' },
        { icon: Settings, label: t('sidebar.settings'), href: '/profile/settings', color: 'text-text-secondary', bg: 'bg-background' },
    ];

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto py-8">
                {/* Profile Header */}
                <section className="mb-12 flex flex-col md:flex-row items-center gap-8 p-10 rounded-[3rem] bg-secondary text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2" />

                    <div className="relative">
                        <div className="h-32 w-32 rounded-[2.5rem] bg-white/10 backdrop-blur-md border-4 border-white/20 flex items-center justify-center text-4xl font-black italic overflow-hidden">
                            {user?.image ? (
                                <img src={user.image} alt={user.username} className="h-full w-full object-cover" />
                            ) : (
                                user?.username?.[0].toUpperCase()
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-primary flex items-center justify-center border-4 border-secondary shadow-lg">
                            <ShieldCheck size={20} />
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-black tracking-tight mb-2 uppercase italic">
                            {user?.username}
                        </h1>
                        <p className="text-slate-400 font-medium mb-4">{user?.email}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <Badge variant="primary" className="bg-primary/20 text-primary-light border-none px-4 py-1.5 uppercase italic">
                                {user?.role === 'seller' ? t('common.verifiedSeller') : t('common.verifiedBuyer')}
                            </Badge>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white/5 px-4 py-1.5 rounded-full backdrop-blur-sm">
                                <History size={14} /> {t('settings.joinedOn', { date: user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Jan 2024' })}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <Button variant="outline" className="rounded-2xl border-white/20 text-white hover:bg-white/10 h-12 px-8" onClick={() => router.push('/profile/edit')}>
                            {t('settings.editProfile')}
                        </Button>
                        <Button onClick={logout} variant="error" className="rounded-2xl h-12 px-8 bg-error/20 border border-error/30 text-error hover:bg-error/30">
                            <LogOut size={18} className="mr-2" /> {t('common.logout')}
                        </Button>
                    </div>
                </section>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {[
                        { label: t('settings.totalOrdersLabel'), value: orders?.count || '0', icon: ShoppingBag, color: 'text-primary' },
                        { label: t('settings.walletBalanceLabel'), value: formatCurrency(wallet?.availableBalance || 0), icon: CreditCard, color: 'text-info' },
                        { label: t('settings.referrals'), value: wallet?.totalReferrals || '0', icon: Share2, color: 'text-success' },
                        { label: t('settings.unreadLabel'), value: '0', icon: Bell, color: 'text-error' },
                    ].map((stat, i) => (
                        <Card key={i} className="flex flex-col items-center justify-center p-6 rounded-[2rem] border-border/40 bg-surface shadow-sm">
                            <stat.icon className={`${stat.color} mb-3`} size={24} />
                            <span className="text-2xl font-black italic tracking-tighter">{stat.value}</span>
                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">{stat.label}</span>
                        </Card>
                    ))}
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {menuItems.map((item, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Card
                                onClick={() => router.push(item.href)}
                                className="flex items-center gap-6 p-6 rounded-[2rem] cursor-pointer group hover:border-primary/50 transition-all duration-300"
                            >
                                <div className={`h-14 w-14 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                                    <item.icon size={28} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-lg uppercase tracking-tight italic group-hover:text-primary transition-colors">
                                        {item.label}
                                    </h3>
                                    <p className="text-xs text-text-secondary font-medium">{t('settings.manageItem', { item: item.label.toLowerCase() })}</p>
                                </div>
                                <ChevronRight size={20} className="text-text-secondary group-hover:text-primary translate-x-0 group-hover:translate-x-1 transition-all" />
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}
