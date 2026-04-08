'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Lock, ArrowRight, ShieldCheck, CheckCircle2, Key } from 'lucide-react';
import { authApi } from '@/services/api/authApi';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { motion } from 'framer-motion';

function ResetPasswordContent() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError(t('auth.passwordsDoNotMatch'));
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await authApi.resetPassword(newPassword, confirmPassword);
            setIsSuccess(true);
            setTimeout(() => router.push('/login'), 3000);
        } catch (err: any) {
            setError(err.message || t('auth.failedResetPassword'));
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <div className="bg-primary/10 p-6 rounded-full inline-block mb-6">
                        <CheckCircle2 size={64} className="text-primary" />
                    </div>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-4">{t('auth.passwordResetDone')}</h1>
                    <p className="text-text-secondary max-w-sm mx-auto">
                        {t('auth.passwordResetRedirect')}
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">{t('auth.resetPassword').split(' ')[0]} <span className="text-primary underline decoration-primary/30">{t('auth.resetPassword').split(' ')[1]}</span></h1>
                    <p className="text-sm text-text-secondary">{t('auth.enterNewPasswordMsg')}</p>
                </div>

                <Card className="p-10 shadow-2xl rounded-[3rem] border-none glass">
                    <form onSubmit={onSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-error/10 border border-error/20 text-error text-[10px] p-3 rounded-xl flex items-center gap-2 font-bold uppercase tracking-widest">
                                <ShieldCheck size={14} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                                {t('auth.newPassword')}
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full h-14 rounded-2xl bg-background border border-border pl-12 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                                {t('auth.confirmNewPassword')}
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full h-14 rounded-2xl bg-background border border-border pl-12 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full rounded-2xl h-14 text-sm font-black group shadow-lg"
                            isLoading={isLoading}
                        >
                            {t('auth.resetPassword')}
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}

export default function ResetPasswordPage() {
    const { t } = useTranslation();
    return (
        <Suspense fallback={<div>{t('common.loading')}</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
