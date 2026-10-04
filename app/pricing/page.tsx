'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { WhatsAppPlanCard } from '@/components/whatsapp-assistant/WhatsAppPlanCard';
import { WhatsAppFeatureTable } from '@/components/whatsapp-assistant/WhatsAppFeatureTable';
import { whatsappAssistantApi, WhatsAppPlan } from '@/services/api/whatsappAssistantApi';
import { useAuthStore } from '@/store/authStore';
import {
    CheckCircle2,
    Sparkles,
    ShieldCheck,
    Smartphone,
    Users,
    Zap,
    HelpCircle,
    ChevronDown,
    ArrowRight,
    Store,
    MessageSquare,
    CreditCard,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FALLBACK_PLANS: WhatsAppPlan[] = [
    {
        id: 1,
        name: 'Free',
        slug: 'free',
        price: '0.00',
        currency: 'XAF',
        monthly_product_limit: 10,
        monthly_product_info_limit: 20,
        max_whatsapp_accounts: 1,
        allow_price_update: false,
        allow_stock_update: false,
        allow_availability_update: false,
        allow_pdf_export: false,
        allow_payment_links: false,
        allow_advanced_automation: false,
        is_active: true,
    },
    {
        id: 2,
        name: 'Basic',
        slug: 'basic',
        price: '1000.00',
        currency: 'XAF',
        monthly_product_limit: 50,
        monthly_product_info_limit: 100,
        max_whatsapp_accounts: 1,
        allow_price_update: true,
        allow_stock_update: true,
        allow_availability_update: true,
        allow_pdf_export: true,
        allow_payment_links: true,
        allow_advanced_automation: false,
        is_active: true,
    },
    {
        id: 3,
        name: 'Business',
        slug: 'business',
        price: '2000.00',
        currency: 'XAF',
        monthly_product_limit: 150,
        monthly_product_info_limit: 300,
        max_whatsapp_accounts: 2,
        allow_price_update: true,
        allow_stock_update: true,
        allow_availability_update: true,
        allow_pdf_export: true,
        allow_payment_links: true,
        allow_advanced_automation: true,
        is_active: true,
    },
    {
        id: 4,
        name: 'Enterprise',
        slug: 'enterprise',
        price: '5000.00',
        currency: 'XAF',
        monthly_product_limit: -1,
        monthly_product_info_limit: -1,
        max_whatsapp_accounts: 10,
        allow_price_update: true,
        allow_stock_update: true,
        allow_availability_update: true,
        allow_pdf_export: true,
        allow_payment_links: true,
        allow_advanced_automation: true,
        is_active: true,
    },
];

interface FAQItem {
    question: string;
    answer: string;
}

const FAQS: FAQItem[] = [
    {
        question: 'Can I link multiple WhatsApp numbers to one shop?',
        answer: 'Yes! Multi-number linking is built into KASH based on your plan tier. The Free and Basic plans support 1 linked WhatsApp number. Upgrading to Business (2,000 XAF/mo) allows 2 linked WhatsApp numbers, while Enterprise (5,000 XAF/mo) allows up to 10 linked WhatsApp numbers. This allows multiple sales reps, shop managers, or inventory assistants to manage your store catalog at the same time.'
    },
    {
        question: 'How does the KASH WhatsApp Store Assistant work?',
        answer: 'Once you link your WhatsApp number using a fast 6-digit verification code, our AI assistant connects directly with your KASH store. You can take photos of new items and send them with captions to publish products instantly, check current inventory with natural text or Cameroon Pidgin, export PDF catalogs, and create direct Mobile Money payment links for customers.'
    },
    {
        question: 'Is creating a shop on KASH Marketplace free?',
        answer: 'Yes, 100%! Creating a store on KASH Marketplace, uploading products, and managing sales via the KASH mobile app and web dashboard is free with zero monthly fee. The WhatsApp Assistant is an optional productivity boost for merchants who want to automate operations directly inside WhatsApp.'
    },
    {
        question: 'How do I pay for my WhatsApp Assistant subscription?',
        answer: 'Subscriptions are billed monthly in Central African Francs (XAF) using MTN Mobile Money or Orange Money. Payments are processed securely in seconds via our direct Fapshi integration.'
    },
    {
        question: 'Can I upgrade, downgrade, or cancel anytime?',
        answer: 'Yes, you have complete flexibility. You can switch plans or cancel whenever you choose. If your paid subscription expires, your shop automatically defaults to the Free plan so your store operations are never interrupted.'
    }
];

export default function PricingPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();
    const [plans, setPlans] = useState<WhatsAppPlan[]>(FALLBACK_PLANS);
    const [loading, setLoading] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                const fetched = await whatsappAssistantApi.getPlans();
                if (fetched && fetched.length > 0) {
                    setPlans(fetched);
                }
            } catch (err) {
                console.warn('Could not load live plans, using default plan data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const handleSelectPlan = (slug: string) => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/dashboard/whatsapp-assistant/plans`);
            return;
        }

        if (user?.has_shop) {
            router.push(`/dashboard/whatsapp-assistant/plans`);
        } else {
            router.push(`/profile/shop`);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto py-8 sm:py-12 px-2 sm:px-4">
                {/* Hero Header */}
                <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <Sparkles size={14} className="animate-pulse" />
                        <span>KASH AI WhatsApp Assistant</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black italic tracking-tighter uppercase mb-6 text-slate-900 dark:text-white">
                        Simple, Transparent <span className="text-primary underline decoration-primary/30">Pricing</span>
                    </h1>

                    <p className="text-base sm:text-lg text-text-secondary leading-relaxed font-medium">
                        Sell for free on Cameroon&apos;s leading marketplace. Upgrade your store with our AI-powered WhatsApp Assistant to automate inventory, generate payment links, and empower your team.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 text-xs sm:text-sm font-semibold text-text-secondary">
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            0% Commission on Marketplace
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            Instant MTN &amp; Orange Money
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            Multi-Number Support
                        </span>
                    </div>
                </div>

                {/* Pricing Cards Grid */}
                <div className="mb-20">
                    <div className="flex items-center justify-between mb-8 max-w-xl mx-auto text-center">
                        <div className="w-full bg-surface dark:bg-slate-800/80 p-3 rounded-2xl border border-border flex items-center justify-center gap-3 shadow-sm">
                            <CreditCard size={18} className="text-primary" />
                            <span className="text-xs sm:text-sm font-bold text-text">
                                Billed Monthly in Central African Francs (XAF) • No Contract Required
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                        {plans.map((plan) => (
                            <WhatsAppPlanCard
                                key={plan.slug}
                                plan={plan}
                                isCurrentPlan={false}
                                onSelectPlan={handleSelectPlan}
                                loading={loading}
                            />
                        ))}
                    </div>
                </div>

                {/* Key Benefits Grid */}
                <section className="mb-20">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-3 text-slate-900 dark:text-white">
                            Why Merchants Choose <span className="text-primary">KASH</span>
                        </h2>
                        <p className="text-sm text-text-secondary">
                            Built specifically for Cameroonian retail, social selling, and multi-agent businesses.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <motion.div
                            whileHover={{ y: -4 }}
                            className="p-6 rounded-3xl bg-surface dark:bg-slate-800 border border-border shadow-sm flex flex-col items-start"
                        >
                            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                                <Users size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Multi-Number Linking</h3>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                Link up to 10 WhatsApp accounts to a single store on our Enterprise plan. Multiple staff and partners can add stock simultaneously.
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -4 }}
                            className="p-6 rounded-3xl bg-surface dark:bg-slate-800 border border-border shadow-sm flex flex-col items-start"
                        >
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                                <MessageSquare size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Natural AI Conversations</h3>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                Handles Cameroon Pidgin, French, and English effortlessly. Query stock, hide out-of-stock items, or update prices with simple messages.
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -4 }}
                            className="p-6 rounded-3xl bg-surface dark:bg-slate-800 border border-border shadow-sm flex flex-col items-start"
                        >
                            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Automated Payment Links</h3>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                Send direct MTN MoMo and Orange Money checkout links to buyers right from WhatsApp with real-time payment confirmation.
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -4 }}
                            className="p-6 rounded-3xl bg-surface dark:bg-slate-800 border border-border shadow-sm flex flex-col items-start"
                        >
                            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Escrow Protected</h3>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                Give your buyers maximum trust. Payments are held securely in escrow until order delivery is verified, eliminating fraud.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Detailed Plan Comparison Table */}
                <section className="mb-20">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-3 text-slate-900 dark:text-white">
                            Compare All <span className="text-primary">Features</span>
                        </h2>
                        <p className="text-sm text-text-secondary">
                            A granular breakdown of capabilities across our Free, Basic, Business, and Enterprise tiers.
                        </p>
                    </div>

                    <WhatsAppFeatureTable />
                </section>

                {/* FAQ Accordion */}
                <section className="mb-20 max-w-3xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-3 text-slate-900 dark:text-white">
                            Frequently Asked <span className="text-primary">Questions</span>
                        </h2>
                        <p className="text-sm text-text-secondary">
                            Everything you need to know about plans, multi-number setup, and payments.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {FAQS.map((faq, idx) => {
                            const isOpen = openFaq === idx;
                            return (
                                <div
                                    key={idx}
                                    className="rounded-2xl border border-border bg-surface dark:bg-slate-800 overflow-hidden transition-all shadow-sm"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                                        className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-primary transition-colors"
                                    >
                                        <span className="flex items-center gap-3">
                                            <HelpCircle size={18} className="text-primary shrink-0" />
                                            {faq.question}
                                        </span>
                                        <ChevronDown
                                            size={18}
                                            className={`transform transition-transform duration-200 text-text-secondary ${
                                                isOpen ? 'rotate-180 text-primary' : ''
                                            }`}
                                        />
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border/50">
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Final Call to Action Card */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-primary p-8 sm:p-14 text-white text-center shadow-2xl">
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
                    <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                        <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter uppercase">
                            Ready to Supercharge Your Sales in Cameroon?
                        </h2>
                        <p className="text-sm sm:text-base text-white/90 font-medium leading-relaxed">
                            Join hundreds of verified merchants who save hours every week by automating their catalog and customer payments directly with KASH.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                            <Link
                                href={isAuthenticated ? '/profile/shop' : '/register'}
                                className="px-8 py-3.5 rounded-2xl bg-white text-slate-900 font-black text-sm uppercase tracking-wider hover:bg-slate-100 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                            >
                                <Store size={18} />
                                {isAuthenticated ? 'Open Store Dashboard' : 'Create Free Shop'}
                            </Link>
                            <Link
                                href="/help"
                                className="px-8 py-3.5 rounded-2xl bg-black/30 hover:bg-black/40 text-white font-bold text-sm tracking-wider border border-white/20 transition-all active:scale-95"
                            >
                                Contact Sales &amp; Support
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
