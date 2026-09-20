'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { whatsappAssistantApi, WhatsAppAssistantStatus } from '@/services/api/whatsappAssistantApi';
import { WhatsAppConnectionCard } from '@/components/whatsapp-assistant/WhatsAppConnectionCard';
import { WhatsAppUsageCard } from '@/components/whatsapp-assistant/WhatsAppUsageCard';
import { WhatsAppSubscriptionStatus } from '@/components/whatsapp-assistant/WhatsAppSubscriptionStatus';
import { storage } from '@/services/storage';

export default function WhatsAppAssistantDashboardPage() {
    const searchParams = useSearchParams();
    const tokenParam = searchParams.get('token');

    const [statusData, setStatusData] = useState<WhatsAppAssistantStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await whatsappAssistantApi.getStatus();
            setStatusData(data);
            setError(null);
        } catch (err: any) {
            setError(err?.message || 'Failed to load WhatsApp Assistant data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initSession = async () => {
            if (tokenParam) {
                try {
                    const authRes = await whatsappAssistantApi.exchangeWebToken(tokenParam);
                    if (authRes.access) {
                        storage.setItem('token', authRes.access);
                        if (authRes.refresh) storage.setItem('refreshToken', authRes.refresh);
                    }
                } catch (e) {
                    console.error('Token exchange error', e);
                }
            }
            await loadData();
        };

        initSession();
    }, [tokenParam]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🤖</span>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                                WhatsApp AI Store Assistant
                            </h1>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Manage your KASH store inventory, add products, update prices and generate payment links via WhatsApp.
                        </p>
                    </div>

                    <a
                        href="/dashboard/whatsapp-assistant/plans"
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
                    >
                        View Plans & Upgrade
                    </a>
                </div>

                {error && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Loading WhatsApp Assistant status...
                    </div>
                ) : statusData ? (
                    <>
                        {/* Subscription Status Bar */}
                        <WhatsAppSubscriptionStatus
                            status={statusData.subscription?.status || 'ACTIVE'}
                            planName={statusData.usage.plan_name}
                            expiresAt={statusData.usage.billing_period_end}
                        />

                        {/* Two column grid: Connection & Usage */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <WhatsAppConnectionCard
                                isConnected={statusData.is_connected}
                                connectedPhone={statusData.whatsapp_phone}
                                shopName={statusData.shop_name}
                                onStatusChange={loadData}
                            />

                            <WhatsAppUsageCard
                                productsCreated={statusData.usage.products_created}
                                monthlyProductLimit={statusData.usage.monthly_product_limit}
                                productInfoQueries={statusData.usage.product_info_queries}
                                monthlyProductInfoLimit={statusData.usage.monthly_product_info_limit}
                                billingPeriodEnd={statusData.usage.billing_period_end}
                            />
                        </div>

                        {/* Guide / How It Works */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                                Quick WhatsApp Commands Guide
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                    <div className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">Add Products</div>
                                    <p className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                                        &quot;Add Samsung A15 5 pieces 125k&quot;
                                    </p>
                                    <p className="text-slate-400 dark:text-slate-500 mt-1">Or send product image with caption!</p>
                                </div>
                                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                    <div className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">Update Prices</div>
                                    <p className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                                        &quot;Change price of Samsung A15 to 120k&quot;
                                    </p>
                                    <p className="text-slate-400 dark:text-slate-500 mt-1">Requires Basic plan or higher.</p>
                                </div>
                                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                    <div className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">Check Inventory</div>
                                    <p className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                                        &quot;How many Samsung A15 remain?&quot; or &quot;Check stock&quot;
                                    </p>
                                    <p className="text-slate-400 dark:text-slate-500 mt-1">Instant real-time stock lookup.</p>
                                </div>
                                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                    <div className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">Hide / Unhide</div>
                                    <p className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                                        &quot;Comot dat black shoe&quot;
                                    </p>
                                    <p className="text-slate-400 dark:text-slate-500 mt-1">Hides without deleting.</p>
                                </div>
                                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                    <div className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">Payment Links</div>
                                    <p className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                                        &quot;Create payment link for 50k&quot;
                                    </p>
                                    <p className="text-slate-400 dark:text-slate-500 mt-1">MoMo & Orange Money link.</p>
                                </div>
                                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                    <div className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">PDF Catalog</div>
                                    <p className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                                        &quot;Send me my inventory report pdf&quot;
                                    </p>
                                    <p className="text-slate-400 dark:text-slate-500 mt-1">Generates complete PDF in memory.</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}
