'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    whatsappAssistantApi,
    WhatsAppPlan,
    WhatsAppAssistantStatus,
} from '@/services/api/whatsappAssistantApi';
import { WhatsAppPlanCard } from '@/components/whatsapp-assistant/WhatsAppPlanCard';
import { WhatsAppFeatureTable } from '@/components/whatsapp-assistant/WhatsAppFeatureTable';
import { storage } from '@/services/storage';

export default function WhatsAppAssistantPlansPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tokenParam = searchParams.get('token');

    const [plans, setPlans] = useState<WhatsAppPlan[]>([]);
    const [statusData, setStatusData] = useState<WhatsAppAssistantStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const [plansData, statusRes] = await Promise.all([
                whatsappAssistantApi.getPlans(),
                whatsappAssistantApi.getStatus().catch(() => null),
            ]);
            setPlans(plansData);
            setStatusData(statusRes);
            setError(null);
        } catch (err: any) {
            setError(err?.message || 'Failed to load subscription plans.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            if (tokenParam) {
                try {
                    const authRes = await whatsappAssistantApi.exchangeWebToken(tokenParam);
                    if (authRes.access) {
                        storage.setItem('token', authRes.access);
                        if (authRes.refresh) storage.setItem('refreshToken', authRes.refresh);
                    }
                } catch (e) {
                    console.error('Failed to exchange web token', e);
                }
            }
            await loadData();
        };

        init();
    }, [tokenParam]);

    const handleSelectPlan = async (slug: string) => {
        setError(null);
        setSubscribing(true);

        try {
            const redirectUrl = `${window.location.origin}/dashboard/whatsapp-assistant/callback`;
            const res = await whatsappAssistantApi.createSubscription(slug, redirectUrl);

            if (res.status === 'active') {
                // Free plan switched directly
                router.push('/dashboard/whatsapp-assistant');
            } else if (res.checkout_url) {
                // Redirect to secure Fapshi payment gateway
                window.location.href = res.checkout_url;
            } else {
                setError(res.message || 'Unable to initiate subscription payment.');
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to initiate subscription payment.');
        } finally {
            setSubscribing(false);
        }
    };

    const currentPlanSlug = statusData?.usage?.plan_slug || 'free';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full mb-3">
                        ⚡ WhatsApp AI Store Automation
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        Choose the Perfect Plan for Your Store
                    </h1>
                    <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
                        Manage your KASH store from WhatsApp with our AI assistant. Add products, update stock and prices, and generate payment links effortlessly.
                    </p>
                </div>

                {/* Important Notice */}
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl flex items-start gap-3">
                    <span className="text-xl">💡</span>
                    <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-200">
                        <strong className="font-bold">Important:</strong> WhatsApp product limits apply strictly to products created through WhatsApp. Managing your products directly inside the KASH mobile app and web dashboard is always <strong>100% free and unlimited</strong>!
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                {/* Plans Grid */}
                {loading ? (
                    <div className="p-16 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Loading plans...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {plans.map((p) => (
                            <WhatsAppPlanCard
                                key={p.id}
                                plan={p}
                                isCurrentPlan={currentPlanSlug === p.slug}
                                onSelectPlan={handleSelectPlan}
                                loading={subscribing}
                            />
                        ))}
                    </div>
                )}

                {/* Feature Comparison Table */}
                <WhatsAppFeatureTable />
            </div>
        </div>
    );
}
