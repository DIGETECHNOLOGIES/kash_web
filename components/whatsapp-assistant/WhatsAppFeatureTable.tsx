import React from 'react';

export const WhatsAppFeatureTable: React.FC = () => {
    const rows = [
        { feature: 'Monthly WhatsApp Product Additions', free: '10', basic: '50', business: '150', enterprise: 'Unlimited*' },
        { feature: 'Monthly Product Information Queries', free: '20', basic: '100', business: '300', enterprise: 'Unlimited*' },
        { feature: 'Forwarded Images & Photo Captions', free: '✓', basic: '✓', business: '✓', enterprise: '✓' },
        { feature: 'Cameroon Pidgin & Local Language AI', free: '✓', basic: '✓', business: '✓', enterprise: '✓' },
        { feature: 'Update Product Prices via WhatsApp', free: '✕', basic: '✓', business: '✓', enterprise: '✓' },
        { feature: 'Update Stock Levels via WhatsApp', free: '✕', basic: '✓', business: '✓', enterprise: '✓' },
        { feature: 'Hide / Unhide Products via WhatsApp', free: '✕', basic: '✓', business: '✓', enterprise: '✓' },
        { feature: 'In-Memory PDF Inventory Catalog', free: '✕', basic: '✓', business: '✓', enterprise: '✓' },
        { feature: 'Generate Fapshi Customer Payment Links', free: '✕', basic: '✓', business: '✓', enterprise: '✓' },
        { feature: 'Advanced Automation Workflows', free: '✕', basic: '✕', business: '✓', enterprise: '✓' },
        { feature: 'Standard KASH App & Web Store Management', free: 'Free & Unlimited', basic: 'Free & Unlimited', business: 'Free & Unlimited', enterprise: 'Free & Unlimited' },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Detailed Plan Comparison</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    *Subject to fair use and anti-abuse protection. Product addition limits apply strictly to items created through WhatsApp. Normal store management in the KASH mobile app and web dashboard remains free and unlimited.
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <th className="p-4">Capability</th>
                            <th className="p-4 text-center">Free (0 XAF)</th>
                            <th className="p-4 text-center text-emerald-600 dark:text-emerald-400">Basic (1,000 XAF)</th>
                            <th className="p-4 text-center">Business (2,000 XAF)</th>
                            <th className="p-4 text-center">Enterprise (5,000 XAF)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-xs text-slate-600 dark:text-slate-300">
                        {rows.map((r, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                                <td className="p-4 font-medium text-slate-900 dark:text-white">{r.feature}</td>
                                <td className="p-4 text-center">{r.free}</td>
                                <td className="p-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">{r.basic}</td>
                                <td className="p-4 text-center">{r.business}</td>
                                <td className="p-4 text-center">{r.enterprise}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
