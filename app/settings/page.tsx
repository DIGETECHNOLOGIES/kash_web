'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Languages, Bell, Shield, Smartphone } from 'lucide-react';
import { Button } from '@/components/common/Button';

export default function SettingsPage() {
    const { mode, toggleTheme } = useThemeStore();
    const { t, i18n } = useTranslation();

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto py-12">
                <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Settings</h1>
                <p className="text-text-secondary mb-12 font-medium">Personalize your KASH experience</p>

                <div className="space-y-6">
                    {/* Appearance */}
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4 ml-1">Appearance</h2>
                        <Card className="p-6 rounded-3xl bg-surface border-border/60">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        {mode === 'light' ? <Sun size={24} /> : <Moon size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Dark Mode</h3>
                                        <p className="text-xs text-text-secondary">Switch between light and dark themes</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={toggleTheme}
                                    variant={mode === 'dark' ? 'primary' : 'outline'}
                                    className="rounded-xl px-6"
                                >
                                    {mode === 'dark' ? 'Enabled' : 'Disabled'}
                                </Button>
                            </div>
                        </Card>
                    </section>

                    {/* Language */}
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4 ml-1">Language</h2>
                        <Card className="p-6 rounded-3xl bg-surface border-border/60">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Languages size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">App Language</h3>
                                        <p className="text-xs text-text-secondary">Choose your preferred language</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => changeLanguage('en')}
                                        variant={i18n.language.startsWith('en') ? 'primary' : 'outline'}
                                        size="sm"
                                        className="rounded-lg"
                                    >
                                        English
                                    </Button>
                                    <Button
                                        onClick={() => changeLanguage('fr')}
                                        variant={i18n.language.startsWith('fr') ? 'primary' : 'outline'}
                                        size="sm"
                                        className="rounded-lg"
                                    >
                                        Français
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </section>

                    {/* Notifications */}
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4 ml-1">Privacy & Security</h2>
                        <Card className="p-6 rounded-3xl bg-surface border-border/60">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Shield size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Account Verification</h3>
                                            <p className="text-xs text-text-secondary">Manage your verified status</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="text-primary font-bold">Details</Button>
                                </div>
                                <div className="pt-6 border-t border-border/50 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Smartphone size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Active Devices</h3>
                                            <p className="text-xs text-text-secondary">Manage your logged in sessions</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="text-primary font-bold">Manage</Button>
                                </div>
                            </div>
                        </Card>
                    </section>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-xs text-text-secondary">KASH v1.0.4. Professional Marketplace</p>
                </div>
            </div>
        </MainLayout>
    );
}
