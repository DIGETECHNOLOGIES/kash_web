import React from 'react';

interface Props {
    productsCreated: number;
    monthlyProductLimit: number;
    productInfoQueries: number;
    monthlyProductInfoLimit: number;
    billingPeriodEnd: string | null;
}

export const WhatsAppUsageCard: React.FC<Props> = ({
    productsCreated,
    monthlyProductLimit,
    productInfoQueries,
    monthlyProductInfoLimit,
    billingPeriodEnd,
}) => {
    const isProductUnlimited = monthlyProductLimit === -1;
    const isQueryUnlimited = monthlyProductInfoLimit === -1;

    const productPercent = isProductUnlimited
        ? 15
        : Math.min(100, Math.round((productsCreated / monthlyProductLimit) * 100));

    const queryPercent = isQueryUnlimited
        ? 15
        : Math.min(100, Math.round((productInfoQueries / monthlyProductInfoLimit) * 100));

    const resetDate = billingPeriodEnd
        ? new Date(billingPeriodEnd).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
        : 'end of cycle';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Monthly WhatsApp Usage</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">Resets on {resetDate}</span>
            </div>

            <div className="space-y-6">
                {/* Products Created Meter */}
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-slate-700 dark:text-slate-300">Products Added via WhatsApp</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                            {productsCreated} / {isProductUnlimited ? 'Unlimited' : monthlyProductLimit}
                        </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                productPercent >= 90 ? 'bg-rose-500' : productPercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${productPercent}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Products added directly via KASH App or Website do not consume this credit.
                    </p>
                </div>

                {/* Product Information Queries Meter */}
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-slate-700 dark:text-slate-300">Product Info Queries</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                            {productInfoQueries} / {isQueryUnlimited ? 'Unlimited' : monthlyProductInfoLimit}
                        </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                queryPercent >= 90 ? 'bg-rose-500' : queryPercent >= 70 ? 'bg-amber-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${queryPercent}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Includes &quot;Give me details of iPhone 14&quot;, product info, and image inquiries.
                    </p>
                </div>
            </div>
        </div>
    );
};
