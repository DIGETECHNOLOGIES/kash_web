'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { authApi } from '@/services/api/authApi';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { motion, AnimatePresence } from 'framer-motion';

const schema = yup.object().shape({
    email: yup.string().email('auth.invalidEmail').required('auth.emailRequired'),
    password: yup.string().min(8, 'auth.atLeast8Chars').required('auth.passwordRequired'),
});

export default function LoginPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';
    const { setAuth } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authApi.login(data.email, data.password);

            if ('access' in response) {
                // First, store the token so subsequent API calls are authenticated
                setAuth(
                    { id: '', email: data.email, username: data.email.split('@')[0], number: '', role: 'buyer', createdAt: '', referralCode: '' },
                    response.access,
                    response.refresh
                );
                // Then fetch the real user profile
                try {
                    const profile = await authApi.getMe();
                    setAuth(
                        {
                            id: profile.id || profile.pk || '',
                            email: profile.email || data.email,
                            username: profile.username || data.email.split('@')[0],
                            number: profile.number || profile.phone || '',
                            role: profile.role || 'buyer',
                            createdAt: profile.date_joined || '',
                            referralCode: profile.referral_code || profile.number || '',
                            image: profile.image || null,
                            has_shop: profile.has_shop || false,
                        } as any,
                        response.access,
                        response.refresh
                    );
                } catch {
                    // If profile fetch fails, we still have the token – proceed
                }
                router.push('/');
            } else {
                // Check if OTP verification needed
                if (response.detail.includes('OTP') || response.next === 'verify') {
                    router.push(`/register/verify?email=${encodeURIComponent(data.email)}`);
                } else {
                    setError(response.detail);
                }
            }
        } catch (err: any) {
            setError(err.message || t('auth.loginFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10"
            >
                <div className="text-center mb-8">
                    <Link href="/" className="text-4xl font-black text-primary italic tracking-tighter mb-2 inline-block">
                        KASH
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">{t('auth.signIn')}</h1>
                    <p className="text-sm text-text-secondary mt-2">{t('auth.noAccount')} <Link href="/register" className="text-primary font-semibold hover:underline">{t('auth.signUp')}</Link></p>
                </div>

                <Card className="p-8 shadow-2xl border-white/20 glass rounded-[2.5rem]">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-error/10 border border-error/20 text-error text-xs p-3 rounded-xl flex items-center gap-2"
                                >
                                    <ShieldCheck size={16} />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-text-secondary ml-1">
                                {t('auth.email')}
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full h-12 rounded-2xl bg-background border border-border pl-12 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                            {errors.email && <p className="text-[10px] text-error font-medium ml-1">{t(errors.email.message as string)}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-widest text-text-secondary ml-1">
                                    {t('auth.password')}
                                </label>
                                <Link href="/forgot-password" title={t('auth.forgotPassword')} className="text-[10px] font-bold text-primary hover:underline">
                                    {t('auth.forgotPassword')}
                                </Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full h-12 rounded-2xl bg-background border border-border pl-12 pr-12 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-[10px] text-error font-medium ml-1">{t(errors.password.message as string)}</p>}
                        </div>

                        <Button
                            type="submit"
                            className="w-full rounded-2xl h-12 text-sm font-bold tracking-wider group"
                            isLoading={isLoading}
                        >
                            {t('auth.signIn')}
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-border">
                        <p className="text-center text-[10px] text-text-secondary leading-relaxed uppercase tracking-tighter">
                            {t('auth.termsAgree').split(' ').slice(0, 4).join(' ')} <br />
                            <Link href="/terms" className="text-primary font-bold hover:underline">{t('terms.title')}</Link> and <Link href="/privacy" className="text-primary font-bold hover:underline">{t('settings.privacy')}</Link>
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
