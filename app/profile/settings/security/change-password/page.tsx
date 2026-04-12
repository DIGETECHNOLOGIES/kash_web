'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ChevronLeft, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usersApi } from '@/services/api/usersApi';
import { toast } from 'sonner';

export default function ChangePasswordPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error(t('auth.passwordsDoNotMatch') || 'Passwords do not match');
            return;
        }

        if (formData.newPassword.length < 8) {
            toast.error(t('auth.passwordTooShort') || 'Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            await usersApi.changePassword({
                current_password: formData.currentPassword,
                new_password: formData.newPassword,
                confirm_password: formData.confirmPassword,
            });
            toast.success(t('auth.passwordChangedSuccess') || 'Password changed successfully');
            router.back();
        } catch (error: any) {
            toast.error(error?.userMessage || t('auth.passwordChangeFailed') || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto pb-20">
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors"
                >
                    <ChevronLeft size={20} /> {t('common.back')}
                </button>

                <header className="mb-10">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">
                        Change <span className="text-primary underline decoration-primary/30">Password</span>
                    </h1>
                    <p className="text-text-secondary">Enter your current password and your new password to update your login credentials.</p>
                </header>

                <Card className="p-8 md:p-12 rounded-[2.5rem] border-border/40 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Current Password</label>
                            <input
                                type="password"
                                required
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                className="w-full h-14 rounded-2xl bg-background border border-border px-6 text-sm focus:border-primary focus:outline-none transition-all font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">New Password</label>
                            <input
                                type="password"
                                required
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                className="w-full h-14 rounded-2xl bg-background border border-border px-6 text-sm focus:border-primary focus:outline-none transition-all font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Confirm New Password</label>
                            <input
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full h-14 rounded-2xl bg-background border border-border px-6 text-sm focus:border-primary focus:outline-none transition-all font-bold"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 rounded-xl font-black uppercase italic tracking-widest mt-4"
                            isLoading={loading}
                        >
                            Update Password
                        </Button>
                    </form>
                </Card>
            </div>
        </MainLayout>
    );
}
