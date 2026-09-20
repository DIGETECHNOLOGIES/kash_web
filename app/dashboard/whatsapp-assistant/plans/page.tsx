'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    whatsappAssistantApi,
    WhatsAppPlan,
    WhatsAppAssistantStatus,
} from '@/services/api/whatsappAssistantApi';
import { WhatsAppPlanCard } from '@/components/whatsapp-assistant/WhatsAppPlanCard';
import { WhatsAppFeatureTable } from '@/components/whatsapp-assistant/WhatsAppFeatureTable';
import { storage } from '@/services/storage';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/authStore';
import {
    Smartphone,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ShieldCheck,
    RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function WhatsAppAssistantPlansPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tokenParam = searchParams.get('token');
    const { user } = useAuthStore();

    const [plans, setPlans] = useState<WhatsAppPlan[]>([]);
    const [statusData, setStatusData] = useState<WhatsAppAssistantStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Direct In-Page Payment Modal State
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<WhatsAppPlan | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'MTN' | 'ORANGE'>('MTN');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentStep, setPaymentStep] = useState<'input' | 'initiating' | 'awaiting_confirmation' | 'success' | 'failed'>('input');
    const [paymentMessage, setPaymentMessage] = useState('');
    const [transactionRef, setTransactionRef] = useState('');
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const cleanupPolling = () => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            cleanupPolling();
        };
    }, []);

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

        // If it's the free plan, switch directly without payment
        if (slug === 'free') {
            setSubscribing(true);
            try {
                const res = await whatsappAssistantApi.createSubscription('free');
                if (res.status === 'active') {
                    toast.success('Switched to Free plan successfully.');
                    router.push('/dashboard/whatsapp-assistant');
                } else {
                    setError(res.message || 'Unable to switch plan.');
                }
            } catch (err: any) {
                setError(err?.message || 'Failed to switch plan.');
            } finally {
                setSubscribing(false);
            }
            return;
        }

        // For paid plans, open the in-page payment modal
        const targetPlan = plans.find(p => p.slug === slug);
        if (targetPlan) {
            setSelectedPlan(targetPlan);
            setPhoneNumber(user?.number || '');
            setPaymentStep('input');
            setPaymentMessage('');
            setTransactionRef('');
            setPaymentModalOpen(true);
        }
    };

    const handleConfirmPayment = async () => {
        if (!selectedPlan) return;

        const cleanedPhone = phoneNumber.trim().replace(/\s+/g, '');
        if (!cleanedPhone || cleanedPhone.length < 9) {
            toast.error('Please enter a valid 9-digit mobile money number.');
            return;
        }

        setPaymentStep('initiating');
        setPaymentMessage('Sending payment request to your phone...');
        cleanupPolling();

        try {
            const res = await whatsappAssistantApi.createSubscription(
                selectedPlan.slug,
                undefined,
                cleanedPhone,
                paymentMethod
            );

            if (res.status === 'active') {
                setPaymentStep('success');
                setPaymentMessage('Subscription activated successfully!');
                toast.success('Subscription activated!');
                setTimeout(() => {
                    setPaymentModalOpen(false);
                    router.push('/dashboard/whatsapp-assistant');
                }, 1500);
                return;
            }

            const transRef = res.transaction_reference;
            setTransactionRef(transRef || '');
            setPaymentStep('awaiting_confirmation');
            setPaymentMessage(
                res.message || `Payment request sent to ${cleanedPhone}. Please enter your Mobile Money PIN on your phone.`
            );

            if (transRef) {
                let attempts = 0;
                const maxAttempts = 35; // ~105 seconds of polling

                pollIntervalRef.current = setInterval(async () => {
                    attempts += 1;
                    if (attempts > maxAttempts) {
                        cleanupPolling();
                        setPaymentStep('failed');
                        setPaymentMessage('Payment confirmation timed out. If you confirmed the prompt, your plan will activate shortly.');
                        return;
                    }

                    try {
                        const verifyRes = await whatsappAssistantApi.verifyPayment(transRef);
                        if (verifyRes.status === 'active') {
                            cleanupPolling();
                            setPaymentStep('success');
                            setPaymentMessage('Payment received! Your subscription is now active.');
                            toast.success('Subscription activated successfully!');
                            setTimeout(() => {
                                setPaymentModalOpen(false);
                                router.push('/dashboard/whatsapp-assistant');
                            }, 1500);
                        } else if (verifyRes.status === 'failed') {
                            cleanupPolling();
                            setPaymentStep('failed');
                            setPaymentMessage(verifyRes.message || 'Payment was cancelled or failed.');
                        }
                    } catch (e) {
                        // Keep polling silently
                    }
                }, 3000);
            }
        } catch (err: any) {
            setPaymentStep('failed');
            setPaymentMessage(err?.message || 'Failed to initiate payment. Please try again.');
        }
    };

    const handleCloseModal = () => {
        cleanupPolling();
        setPaymentModalOpen(false);
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

            {/* In-Page Payment Modal (Identical to In-App & Product Checkout) */}
            <Modal
                isOpen={paymentModalOpen}
                onClose={handleCloseModal}
                title={selectedPlan ? `Subscribe: ${selectedPlan.name} Plan` : 'Subscribe'}
                className="max-w-md"
            >
                <div className="p-6 space-y-6">
                    {/* Amount & Plan summary badge */}
                    {selectedPlan && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Plan Selected</p>
                                <h4 className="text-base font-black text-slate-900 dark:text-white">{selectedPlan.name} Plan</h4>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                    {Number(selectedPlan.price).toLocaleString()} XAF
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">per month</p>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Input details */}
                    {(paymentStep === 'input' || paymentStep === 'initiating') && (
                        <div className="space-y-5">
                            {/* Provider selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <CreditCard size={14} className="text-emerald-600" />
                                    Select Payment Method
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        onClick={() => setPaymentMethod('MTN')}
                                        className={cn(
                                            "p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between",
                                            paymentMethod === 'MTN'
                                                ? "border-yellow-400 bg-yellow-400/10 shadow-sm"
                                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-yellow-400 text-slate-950 flex items-center justify-center font-black text-xs">
                                                MTN
                                            </div>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">MoMo</span>
                                        </div>
                                        <div className={cn(
                                            "w-4 h-4 rounded-full border flex items-center justify-center",
                                            paymentMethod === 'MTN' ? "border-yellow-500 bg-yellow-500 text-white" : "border-slate-300"
                                        )}>
                                            {paymentMethod === 'MTN' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setPaymentMethod('ORANGE')}
                                        className={cn(
                                            "p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between",
                                            paymentMethod === 'ORANGE'
                                                ? "border-orange-500 bg-orange-500/10 shadow-sm"
                                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black text-xs">
                                                OM
                                            </div>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">Orange</span>
                                        </div>
                                        <div className={cn(
                                            "w-4 h-4 rounded-full border flex items-center justify-center",
                                            paymentMethod === 'ORANGE' ? "border-orange-500 bg-orange-500 text-white" : "border-slate-300"
                                        )}>
                                            {paymentMethod === 'ORANGE' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Phone number */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <Smartphone size={14} className="text-emerald-600" />
                                    Mobile Money Phone Number
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 select-none">
                                        +237
                                    </span>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="6XXXXXXXX"
                                        disabled={paymentStep === 'initiating'}
                                        className="w-full pl-14 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    A direct USSD prompt will be sent to this number to authorize the payment.
                                </p>
                            </div>

                            <Button
                                className="w-full py-3.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
                                onClick={handleConfirmPayment}
                                disabled={paymentStep === 'initiating'}
                            >
                                {paymentStep === 'initiating' ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Initiating Payment...
                                    </>
                                ) : (
                                    <>
                                        Pay {Number(selectedPlan?.price || 0).toLocaleString()} XAF
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Awaiting Confirmation (USSD Push sent to phone) */}
                    {paymentStep === 'awaiting_confirmation' && (
                        <div className="py-4 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-600 animate-pulse">
                                <Smartphone size={32} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                                    Confirm on Your Phone
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                                    {paymentMessage}
                                </p>
                            </div>
                            <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                <Loader2 size={14} className="animate-spin text-emerald-600" />
                                <span>Waiting for payment authorization...</span>
                            </div>
                            {transactionRef && (
                                <p className="text-[10px] text-slate-400 font-mono tracking-wider">
                                    Ref: {transactionRef}
                                </p>
                            )}
                            <div className="pt-2">
                                <button
                                    onClick={() => setPaymentStep('input')}
                                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                >
                                    Cancel or try different number
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Success */}
                    {paymentStep === 'success' && (
                        <div className="py-6 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                                <CheckCircle2 size={36} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-black text-slate-900 dark:text-white">
                                    Payment Successful!
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                    {paymentMessage}
                                </p>
                            </div>
                            <Button
                                className="w-full py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => {
                                    setPaymentModalOpen(false);
                                    router.push('/dashboard/whatsapp-assistant');
                                }}
                            >
                                Continue to Dashboard
                            </Button>
                        </div>
                    )}

                    {/* Step 4: Failed */}
                    {paymentStep === 'failed' && (
                        <div className="py-4 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
                                <AlertCircle size={36} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                                    Payment Incomplete
                                </h4>
                                <p className="text-xs text-rose-600 dark:text-rose-400 max-w-sm mx-auto">
                                    {paymentMessage}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 py-3 rounded-xl font-bold"
                                    onClick={handleCloseModal}
                                >
                                    Close
                                </Button>
                                <Button
                                    className="flex-1 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5"
                                    onClick={() => setPaymentStep('input')}
                                >
                                    <RotateCcw size={14} />
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>Secured with end-to-end mobile money encryption</span>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
