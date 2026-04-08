'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import {
    Settings,
    User,
    Lock,
    Bell,
    Globe,
    Moon,
    Sun,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Smartphone,
    CreditCard
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function SettingsPage() {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const { user } = useAuthStore();
    const { mode, toggleTheme } = useThemeStore();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    interface MenuItem {
        icon: any;
        label: string;
        sub: string;
        href?: string;
        action?: () => void;
        disabled?: boolean;
    }

    const menuItems: { title: string; items: MenuItem[] }[] = [
        {
            title: t('settings.accountSettings'),
            items: [
                { icon: User, label: t('settings.profileInfo'), sub: t('settings.profileInfoSub'), href: '/profile/settings/account' },
                { icon: Lock, label: t('settings.passwordSecurity'), sub: t('settings.passwordSecuritySub'), href: '/profile/settings/security' },
                { icon: CreditCard, label: t('settings.paymentMethods'), sub: t('settings.paymentMethodsSub'), href: '/profile/settings/payments' },
            ]
        },
        {
            title: t('settings.preferences'),
            items: [
                {
                    icon: Globe,
                    label: t('profile.language'),
                    sub: i18n.language === 'fr' ? t('settings.french') : t('settings.english'),
                    action: () => changeLanguage(i18n.language === 'en' ? 'fr' : 'en')
                },
                {
                    icon: mode === 'dark' ? Moon : Sun,
                    label: t('settings.appearance'),
                    sub: mode === 'dark' ? t('settings.appearanceSubDark') : t('settings.appearanceSubLight'),
                    action: toggleTheme
                },
                { icon: Bell, label: t('notifications.title'), sub: t('settings.notificationsSub'), href: '/profile/notifications' },
            ]
        },
        {
            title: t('settings.supportAbout'),
            items: [
                { icon: ShieldCheck, label: t('settings.privacy'), sub: t('settings.privacyPolicySub'), href: '/privacy' },
                { icon: Smartphone, label: t('settings.appVersion'), sub: 'v1.0.0', disabled: true },
            ]
        }
    ];

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto pb-20">
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors"
                >
                    <ChevronLeft size={20} /> {t('settings.settings')}
                </button>

                <header className="mb-12">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">{t('settings.controlPanel', 'Control Panel')}</h1>
                    <p className="text-text-secondary">{t('settings.settingsHeader')}</p>
                </header>

                <div className="space-y-12">
                    {menuItems.map((section, idx) => (
                        <div key={idx} className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1 italic">{section.title}</h3>
                            <div className="space-y-3">
                                {section.items.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={!item.disabled ? { x: 5 } : {}}
                                        whileTap={!item.disabled ? { scale: 0.99 } : {}}
                                    >
                                        <Card
                                            className={`p-6 rounded-[2rem] flex items-center gap-6 border-border/40 shadow-sm transition-all group ${item.disabled ? 'opacity-50 cursor-default' : 'cursor-pointer hover:border-primary/50'}`}
                                            onClick={() => !item.disabled && (item.action ? item.action() : router.push(item.href!))}
                                        >
                                            <div className={`h-14 w-14 rounded-2xl bg-background flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors ${!item.disabled && 'group-hover:scale-110'}`}>
                                                <item.icon size={28} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black italic uppercase tracking-tight text-lg group-hover:text-primary transition-colors">{item.label}</h4>
                                                <p className="text-xs text-text-secondary font-medium">{item.sub}</p>
                                            </div>
                                            {!item.disabled && <ChevronRight size={20} className="text-text-secondary group-hover:text-primary translate-x-0 group-hover:translate-x-1 transition-all" />}
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 pt-12 border-t border-border/40 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-8 italic">
                        KASH Marketplace &copy; 2024 • {t('settings.enterpriseLayer')}
                    </p>
                    <Button variant="outline" className="rounded-2xl border-error/20 text-error hover:bg-error/5 h-12 px-8 uppercase font-bold italic">
                        {t('settings.deleteAccount')}
                    </Button>
                </div>
            </div>
        </MainLayout>
    );
}
