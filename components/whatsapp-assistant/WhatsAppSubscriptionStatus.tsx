import React from 'react';

interface Props {
    status: string;
    planName: string;
    expiresAt: string | null;
}

export const WhatsAppSubscriptionStatus: React.FC<Props> = ({ status, planName, expiresAt }) => {
    const isActive = status === 'ACTIVE';
    const formattedExpiry = expiresAt
        ? new Date(expiresAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Ongoing (Free Plan)';

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {planName} Plan — <span className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{status}</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isActive ? `Renews / Expiry: ${formattedExpiry}` : 'Your plan is currently not active.'}
                    </p>
                </div>
            </div>
            <a
                href="/dashboard/whatsapp-assistant/plans"
                className="px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded-lg transition-colors"
            >
                Change Plan
            </a>
        </div>
    );
};
