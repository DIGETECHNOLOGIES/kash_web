'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useQuery } from '@tanstack/react-query';
import { messagingApi } from '@/services/api/messagingApi';
import {
    Home,
    ShoppingCart,
    Package,
    Wallet,
    MessageSquare,
    Bookmark,
    Store,
    BarChart3,
    PlusCircle,
    User,
    Settings,
    HelpCircle,
    Info,
    LogOut,
    ChevronRight,
    X,
    LayoutGrid,
    Search,
    Bell
} from 'lucide-react';
import { notificationApi } from '@/services/api/notificationApi';
import { cn } from '@/lib/utils';

import { createPortal } from 'react-dom';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const { t } = useTranslation();
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();
    const { items } = useCartStore();
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    const { data: unreadData } = useQuery({
        queryKey: ['unreadCount'],
        queryFn: () => messagingApi.getUnreadSummary(),
        enabled: isAuthenticated,
        refetchInterval: 30000,
    });

    const { data: notificationData } = useQuery({
        queryKey: ['unreadNotificationsCount'],
        queryFn: () => notificationApi.getUnreadCount(),
        enabled: isAuthenticated,
        refetchInterval: 30000,
    });

    const unreadMessages = unreadData?.totalUnread || 0;

    const handleLogout = async () => {
        onClose();
        logout();
        router.push('/');
    };

    const MenuItem = ({
        icon: Icon,
        label,
        href,
        badge,
        variant = 'default'
    }: {
        icon: any,
        label: string,
        href: string,
        badge?: number,
        variant?: 'default' | 'danger'
    }) => {
        const active = pathname === href;
        return (
            <Link
                href={href}
                onClick={onClose}
                className={cn(
                    "flex items-center justify-between p-3.5 px-5 rounded-[1.5rem] transition-all duration-300 group",
                    active
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : variant === 'danger'
                            ? "hover:bg-error/10 text-error"
                            : "hover:bg-primary/5 text-text"
                )}
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "h-10 w-10 rounded-2xl flex items-center justify-center transition-all",
                        active
                            ? "bg-white/20 text-white"
                            : variant === 'danger'
                                ? "bg-error/10 text-error"
                                : "bg-primary/10 text-primary group-hover:scale-110"
                    )}>
                        <Icon size={20} />
                    </div>
                    <span className={cn(
                        "font-black italic uppercase tracking-tighter text-sm",
                        active ? "text-white" : "text-text"
                    )}>
                        {label}
                    </span>
                </div>
                {badge ? (
                    <div className="bg-primary text-white text-[10px] font-black h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                        {badge}
                    </div>
                ) : (
                    <ChevronRight size={16} className={cn("opacity-30", active ? "text-white" : "text-text-secondary")} />
                )}
            </Link>
        );
    };

    const SectionTitle = ({ title }: { title: string }) => (
        <h3 className="px-5 mt-8 mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-50 italic">
            {title}
        </h3>
    );

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999]">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Sidebar Drawer */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute left-0 top-0 h-full w-[340px] max-w-[90vw] bg-surface dark:bg-surface-dark shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Profile Section */}
                        <div
                            className="p-10 pt-12 bg-primary text-white relative overflow-hidden"
                            onClick={() => { router.push('/profile'); onClose(); }}
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 rounded-full -ml-16 -mb-16 blur-2xl" />

                            <div className="flex flex-col gap-6 relative z-10 cursor-pointer">
                                <div className="h-20 w-20 rounded-[2.5rem] bg-white/20 p-1 ring-2 ring-white/30 shadow-2xl relative">
                                    <div className="h-full w-full rounded-[2.3rem] overflow-hidden bg-white flex items-center justify-center text-primary font-black text-3xl italic shadow-inner">
                                        {user?.image ? (
                                            <img src={user.image} alt={user.username} className="h-full w-full object-cover" />
                                        ) : (
                                            user?.username?.[0].toUpperCase() || 'G'
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-success border-4 border-primary rounded-full" />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-2xl font-black italic uppercase tracking-tighter truncate max-w-[180px]">
                                            {user?.username || t('sidebar.guestUser')}
                                        </h4>
                                        <div className="bg-white/20 p-1.5 rounded-xl">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-[0.2em] truncate">
                                        {user?.email || 'guest@kash.pro'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-1">
                            <SectionTitle title={t('sidebar.mainMenu')} />
                            <MenuItem icon={Home} label={t('sidebar.home')} href="/" />
                            <MenuItem icon={ShoppingCart} label={t('sidebar.cart')} href="/cart" badge={totalItems > 0 ? totalItems : undefined} />

                            {isAuthenticated && (
                                <>
                                    <MenuItem
                                        icon={Package}
                                        label={t('sidebar.myOrders')}
                                        href="/profile/orders"
                                    />
                                    <MenuItem icon={Wallet} label={t('sidebar.wallet')} href="/profile/wallet" />
                                    <MenuItem icon={Bell} label={t('notifications.title')} href="/profile/notifications" badge={notificationData?.count > 0 ? notificationData.count : undefined} />
                                    <MenuItem icon={MessageSquare} label={t('sidebar.messages')} href="/messages" badge={unreadMessages > 0 ? unreadMessages : undefined} />
                                    <MenuItem icon={Bookmark} label={t('product.savedProducts')} href="/profile/saved" />
                                </>
                            )}

                            {isAuthenticated && (
                                <>
                                    <SectionTitle title={t('sidebar.shop')} />
                                    {user?.has_shop ? (
                                        <>
                                            <MenuItem icon={Store} label={t('sidebar.myShop')} href="/profile/shop" />
                                            <MenuItem icon={Package} label={t('sidebar.shopOrders')} href="/profile/shop/orders" />
                                            <MenuItem icon={BarChart3} label={t('sidebar.shopAnalytics')} href="/profile/shop/analytics" />
                                            <MenuItem icon={PlusCircle} label="Add Product" href="/profile/shop/add-product" />
                                        </>
                                    ) : (
                                        <MenuItem icon={PlusCircle} label={t('sidebar.startSelling')} href="/profile/shop" />
                                    )}
                                </>
                            )}

                            <SectionTitle title={t('sidebar.account')} />
                            <MenuItem icon={User} label={t('sidebar.myProfile')} href="/profile" />
                            <MenuItem icon={Settings} label={t('sidebar.settings')} href="/profile/settings" />
                            <MenuItem icon={HelpCircle} label={t('sidebar.helpSupport')} href="/support" />
                            <MenuItem icon={Info} label={t('sidebar.about')} href="/about" />

                            <div className="mt-8 pt-4 border-t border-border">
                                {isAuthenticated ? (
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-4 p-4 rounded-[1.5rem] hover:bg-error/10 text-error transition-all group font-black italic uppercase tracking-tighter"
                                    >
                                        <div className="h-10 w-10 rounded-2xl bg-error/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <LogOut size={20} />
                                        </div>
                                        {t('common.logout')}
                                    </button>
                                ) : (
                                    <MenuItem icon={LogOut} label={t('common.login')} href="/login" />
                                )}
                            </div>

                            {/* Version Info */}
                            <div className="py-8 text-center opacity-30 text-[10px] font-black uppercase tracking-[0.3em] font-sans italic">
                                KASH Marketplace Professional v1.2.8
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
