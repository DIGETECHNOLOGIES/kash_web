'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { whatsappAssistantApi } from '@/services/api/whatsappAssistantApi';

export default function WhatsAppSubscriptionCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const transId = searchParams.get('transId') || searchParams.get('transaction_id') || searchParams.get('reference');

    const [verifying, setVerifying] = useState(true);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState('Verifying your payment with Fapshi...');

    useEffect(() => {
        const verify = async () => {
            if (!transId) {
                setVerifying(false);
                setMessage('No transaction reference found in callback.');
                return;
            }

            try {
                const res = await whatsappAssistantApi.verifyPayment(transId);
                if (res.status === 'active') {
                    setSuccess(true);
                    setMessage('Your WhatsApp Assistant subscription is now active! 🎉');
                } else {
                    setMessage(res.message || 'Payment is being processed.');
                }
            } catch (err: any) {
                setMessage(err?.message || 'Unable to confirm payment status at this moment.');
            } finally {
                setVerifying(false);
            }
        };

        verify();
    }, [transId]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-lg">
                {verifying ? (
                    <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verifying Subscription Payment</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{message}</p>
                    </div>
                ) : success ? (
                    <div className="space-y-6">
                        <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center text-3xl">
                            ✓
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Payment Successful!</h2>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{message}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.push('/dashboard/whatsapp-assistant')}
                            className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
                        >
                            Go to WhatsApp Assistant Dashboard
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-full flex items-center justify-center text-3xl">
                            !
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payment Verification Status</h2>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{message}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard/whatsapp-assistant/plans')}
                                className="flex-1 py-2.5 px-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
                            >
                                Back to Plans
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard/whatsapp-assistant')}
                                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
                            >
                                Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
