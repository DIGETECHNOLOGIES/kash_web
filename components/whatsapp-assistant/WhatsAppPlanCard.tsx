import React from 'react';
import { WhatsAppPlan } from '@/services/api/whatsappAssistantApi';

interface Props {
    plan: WhatsAppPlan;
    isCurrentPlan: boolean;
    onSelectPlan: (slug: string) => void;
    loading?: boolean;
}

export const WhatsAppPlanCard: React.FC<Props> = ({
    plan,
    isCurrentPlan,
    onSelectPlan,
    loading = false,
}) => {
    const isPopular = plan.slug === 'basic';
    const isEnterprise = plan.slug === 'enterprise';

    const features = [
        {
            name: `${plan.monthly_product_limit === -1 ? 'Unlimited' : plan.monthly_product_limit} products added via WhatsApp/mo`,
            included: true,
        },
        {
            name: `${plan.monthly_product_info_limit === -1 ? 'Unlimited' : plan.monthly_product_info_limit} product info queries/mo`,
            included: true,
        },
        {
            name: 'Image + Caption & Forwarded Photos',
            included: true,
        },
        {
            name: 'Cameroon Pidgin & Price Normalization',
            included: true,
        },
        {
            name: 'Update product prices via WhatsApp',
            included: plan.allow_price_update,
        },
        {
            name: 'Update stock levels via WhatsApp',
            included: plan.allow_stock_update,
        },
        {
            name: 'Hide/Unhide products via WhatsApp',
            included: plan.allow_availability_update,
        },
        {
            name: 'In-Memory PDF Inventory Catalog',
            included: plan.allow_pdf_export,
        },
        {
            name: 'Generate Fapshi Customer Payment Links',
            included: plan.allow_payment_links,
        },
        {
            name: 'Advanced Business Automation',
            included: plan.allow_advanced_automation,
        },
    ];

    return (
        <div
            className={`relative rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between ${
                isPopular
                    ? 'border-2 border-emerald-500 dark:border-emerald-400 bg-white dark:bg-slate-800 shadow-lg shadow-emerald-500/10'
                    : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm'
            }`}
        >
            {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                    Most Popular
                </div>
            )}

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                    {isCurrentPlan && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                            Current Plan
                        </span>
                    )}
                </div>

                <div className="mb-6">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                        {Number(plan.price).toLocaleString()}
                    </span>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1">
                        {plan.currency} / month
                    </span>
                </div>

                <ul className="space-y-3 mb-8">
                    {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs">
                            <span className={f.included ? 'text-emerald-500 font-bold' : 'text-slate-300 dark:text-slate-600'}>
                                {f.included ? '✓' : '✕'}
                            </span>
                            <span
                                className={
                                    f.included
                                        ? 'text-slate-700 dark:text-slate-300 font-medium'
                                        : 'text-slate-400 dark:text-slate-500 line-through'
                                }
                            >
                                {f.name}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <button
                type="button"
                onClick={() => onSelectPlan(plan.slug)}
                disabled={isCurrentPlan || loading}
                className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-colors ${
                    isCurrentPlan
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-default'
                        : isPopular
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900'
                }`}
            >
                {isCurrentPlan ? 'Active Plan' : plan.slug === 'free' ? 'Switch to Free' : `Subscribe (${Number(plan.price).toLocaleString()} XAF)`}
            </button>
        </div>
    );
};
