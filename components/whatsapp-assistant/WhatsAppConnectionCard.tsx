import React, { useState } from 'react';
import { whatsappAssistantApi } from '@/services/api/whatsappAssistantApi';

interface Props {
    isConnected: boolean;
    connectedPhone: string | null;
    shopName: string;
    onStatusChange: () => void;
}

export const WhatsAppConnectionCard: React.FC<Props> = ({
    isConnected,
    connectedPhone,
    shopName,
    onStatusChange,
}) => {
    const [step, setStep] = useState<'IDLE' | 'CODE_SENT'>('IDLE');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleInitiate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            const res = await whatsappAssistantApi.initiateLinking(phone);
            setSuccessMessage(res.message);
            setStep('CODE_SENT');
        } catch (err: any) {
            setError(err?.message || 'Failed to send verification code. Check your phone number.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            const res = await whatsappAssistantApi.confirmLinking(code);
            setSuccessMessage(res.message);
            setStep('IDLE');
            setCode('');
            onStatusChange();
        } catch (err: any) {
            setError(err?.message || 'Incorrect or expired verification code.');
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect this WhatsApp number?')) return;
        setLoading(true);
        setError(null);
        try {
            await whatsappAssistantApi.disconnect();
            onStatusChange();
        } catch (err: any) {
            setError(err?.message || 'Failed to disconnect WhatsApp number.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 text-xl font-bold">
                        💬
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">WhatsApp Connection</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Store: {shopName}</p>
                    </div>
                </div>
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isConnected
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                >
                    {isConnected ? 'Connected' : 'Not Connected'}
                </span>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-lg">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-lg">
                    {successMessage}
                </div>
            )}

            {isConnected ? (
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Linked WhatsApp Number:</p>
                        <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">{connectedPhone}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleDisconnect}
                        disabled={loading}
                        className="px-4 py-2 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold rounded-lg transition-colors"
                    >
                        {loading ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                </div>
            ) : (
                <div className="pt-2">
                    {step === 'IDLE' ? (
                        <form onSubmit={handleInitiate} className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+237 6XXXXXXXX"
                                required
                                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <button
                                type="submit"
                                disabled={loading || !phone}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Sending Code...' : 'Connect WhatsApp'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleConfirm} className="space-y-3">
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                Enter the 6-digit verification code sent to your WhatsApp ({phone}):
                            </p>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="6-digit code"
                                    maxLength={6}
                                    required
                                    className="w-48 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm tracking-widest text-center font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || code.length < 6}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Verifying...' : 'Verify & Link'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep('IDLE')}
                                    className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};
