'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MapPin, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/services/api/authApi';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';

const POPULAR_CITIES = ['Douala', 'Yaoundé', 'Bamenda', 'Bafoussam', 'Buea', 'Limbe', 'Garoua'];

export default function CompleteProfilePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams?.get('redirect') || '/';
    const { user, isAuthenticated, updateUser } = useAuthStore();

    const [number, setNumber] = useState(user?.number || '');
    const [location, setLocation] = useState((user as any)?.location || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=${encodeURIComponent('/complete-profile')}`);
            return;
        }

        // If user already has both, redirect to target
        if (user?.number && (user as any)?.location) {
            router.push(redirectTo);
        }
    }, [isAuthenticated, user, router, redirectTo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const cleanNumber = number.trim();
        const cleanLocation = location.trim();

        if (!cleanNumber) {
            setError('Please enter a valid phone number.');
            return;
        }

        if (cleanNumber.length < 8) {
            setError('Phone number must be at least 8 digits.');
            return;
        }

        if (!cleanLocation) {
            setError('Please provide your city or delivery location.');
            return;
        }

        setIsLoading(true);
        try {
            const updatedProfile = await authApi.updateMe({
                number: cleanNumber,
                location: cleanLocation,
            });

            // Update user in auth store
            if (user) {
                updateUser({
                    ...user,
                    number: updatedProfile.number || cleanNumber,
                    referralCode: updatedProfile.number || cleanNumber,
                    ...(updatedProfile.location ? { location: updatedProfile.location } : { location: cleanLocation }),
                } as any);
            }

            toast.success('Profile completed successfully!');
            router.push(redirectTo);
        } catch (err: any) {
            console.error('Update profile error:', err);
            setError(err.message || 'Failed to update profile. Please check your phone number and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden py-12">
            {/* Background ambient blurs */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg z-10"
            >
                <div className="text-center mb-8">
                    <Link href="/" className="text-4xl font-black text-primary italic tracking-tighter mb-2 inline-block">
                        KASH
                    </Link>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
                        <UserCheck size={14} />
                        One Last Step
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Complete Your Profile</h1>
                    <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
                        Welcome to KASH! Please provide your phone number and city to finish setting up your account.
                    </p>
                </div>

                <Card className="p-8 shadow-2xl border-white/20 glass rounded-[2.5rem]">
                    {/* User identifier card */}
                    <div className="mb-6 p-4 rounded-2xl bg-surface/70 border border-border/60 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-base uppercase">
                            {user?.username?.[0] || user?.email?.[0] || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-text truncate">{user?.username || 'User'}</p>
                            <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-error/10 border border-error/20 text-error text-xs p-3.5 rounded-xl flex items-center gap-2"
                                >
                                    <ShieldCheck size={16} className="shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Phone Number Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-text-secondary ml-1 flex items-center justify-between">
                                <span>Phone Number</span>
                                <span className="text-[11px] font-normal text-text-secondary normal-case">
                                    For orders & payments
                                </span>
                            </label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                                <input
                                    type="tel"
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value)}
                                    placeholder="e.g. 671234567 or +237671234567"
                                    className="w-full h-12 rounded-2xl bg-background border border-border pl-12 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                    required
                                />
                            </div>
                            <p className="text-[11px] text-text-secondary ml-1">
                                Used to receive order status SMS and mobile money notifications.
                            </p>
                        </div>

                        {/* Location Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-text-secondary ml-1 flex items-center justify-between">
                                <span>City / Location</span>
                                <span className="text-[11px] font-normal text-text-secondary normal-case">
                                    For shipping & delivery
                                </span>
                            </label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g. Douala, Akwa or Yaoundé, Bastos"
                                    className="w-full h-12 rounded-2xl bg-background border border-border pl-12 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                    required
                                />
                            </div>

                            {/* Quick Select Cities */}
                            <div className="pt-1">
                                <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider mb-2 ml-1">
                                    Quick Select City:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {POPULAR_CITIES.map((city) => (
                                        <button
                                            type="button"
                                            key={city}
                                            onClick={() => setLocation(city)}
                                            className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer ${
                                                location.toLowerCase().includes(city.toLowerCase())
                                                    ? 'bg-primary text-white border-primary shadow-sm font-semibold'
                                                    : 'bg-background hover:bg-surface border-border text-text-secondary hover:text-text'
                                            }`}
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full rounded-2xl h-12 text-sm font-bold tracking-wider group"
                            isLoading={isLoading}
                        >
                            Save & Continue
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}
