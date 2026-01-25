'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User, Phone, MapPin, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/services/api/authApi';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { motion, AnimatePresence } from 'framer-motion';

const schema = yup.object().shape({
    username: yup.string().min(3, 'Username too short').required('Username is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(8, 'Password too short').required('Password is required'),
    number: yup.string().length(9, 'Phone number must be 9 digits').matches(/^[0-9]+$/, 'Must be only digits').required('Phone is required'),
    location: yup.string().required('Location is required'),
});

export default function RegisterPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setError(null);
        try {
            await authApi.register(data);
            setIsSuccess(true);
            setTimeout(() => {
                router.push(`/login?email=${encodeURIComponent(data.email)}`);
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
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
                    <h1 className="text-3xl font-black mb-4">Registration Successful!</h1>
                    <p className="text-text-secondary max-w-sm mx-auto">
                        Please check your email for the verification code. Redirecting you to login...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden py-12">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg z-10"
            >
                <div className="text-center mb-8">
                    <Link href="/" className="text-4xl font-black text-primary italic tracking-tighter mb-2 inline-block">
                        KASH
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">{t('auth.signUp')}</h1>
                    <p className="text-sm text-text-secondary mt-2">{t('auth.haveAccount')} <Link href="/login" className="text-primary font-semibold hover:underline">{t('auth.signIn')}</Link></p>
                </div>

                <Card className="p-8 shadow-2xl border-white/20 glass rounded-[2.5rem]">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-error/10 border border-error/20 text-error text-[10px] p-3 rounded-xl flex items-center gap-2"
                                >
                                    <ShieldCheck size={14} />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                                    {t('auth.username')}
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                                    <input {...register('username')} placeholder="johndoe" className="w-full h-11 rounded-xl bg-background border border-border pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all" />
                                </div>
                                {errors.username && <p className="text-[10px] text-error font-medium ml-1">{errors.username.message as string}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                                    {t('auth.email')}
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                                    <input {...register('email')} type="email" placeholder="john@example.com" className="w-full h-11 rounded-xl bg-background border border-border pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                                </div>
                                {errors.email && <p className="text-[10px] text-error font-medium ml-1">{errors.email.message as string}</p>}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                                {t('auth.password')}
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                                <input {...register('password')} type="password" placeholder="••••••••" className="w-full h-11 rounded-xl bg-background border border-border pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                            </div>
                            {errors.password && <p className="text-[10px] text-error font-medium ml-1">{errors.password.message as string}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                                    {t('auth.phoneNumber')}
                                </label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                                    <input {...register('number')} placeholder="670000000" className="w-full h-11 rounded-xl bg-background border border-border pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                                </div>
                                {errors.number && <p className="text-[10px] text-error font-medium ml-1">{errors.number.message as string}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                                    Location
                                </label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                                    <input {...register('location')} placeholder="Douala" className="w-full h-11 rounded-xl bg-background border border-border pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                                </div>
                                {errors.location && <p className="text-[10px] text-error font-medium ml-1">{errors.location.message as string}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 py-2">
                            <input type="checkbox" id="terms" required className="accent-primary h-4 w-4 rounded border-border" />
                            <label htmlFor="terms" className="text-[10px] text-text-secondary">
                                {t('auth.termsAgree')}
                            </label>
                        </div>

                        <Button type="submit" className="w-full rounded-2xl h-12 text-sm font-bold group" isLoading={isLoading}>
                            {t('auth.createAccount')}
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}
