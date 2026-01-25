'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { ScrollText, ShieldCheck } from 'lucide-react';

export default function TermsPage() {
    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto py-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-4">
                        <ScrollText size={40} className="text-primary" />
                        Terms & <span className="text-primary underline decoration-primary/30">Conditions</span>
                    </h1>
                    <p className="mt-4 text-text-secondary font-medium">Last updated: January 2024</p>
                </div>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-black italic uppercase mb-4 tracking-tighter">1. Acceptance of Terms</h2>
                        <Card className="p-6 rounded-3xl bg-surface border-border/60">
                            <p className="text-text-secondary leading-relaxed">
                                By accessing and using the KASH platform, you agree to be bound by these Terms and Conditions. KASH is a professional marketplace service operated in Cameroon. If you do not agree with any part of these terms, you must not use our services.
                            </p>
                        </Card>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black italic uppercase mb-4 tracking-tighter">2. Buyer Protection (Escrow)</h2>
                        <Card className="p-6 rounded-3xl bg-primary/5 border-primary/10">
                            <p className="text-text-secondary leading-relaxed">
                                All transactions on KASH are protected by our Escrow system. When you pay for an item, the funds are held securely by KASH until you confirm receipt of the item in the specified condition. Funds are released to the seller only after your confirmation or after 48 hours of delivery if no complaint is filed.
                            </p>
                        </Card>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black italic uppercase mb-4 tracking-tighter">3. Seller Obligations</h2>
                        <Card className="p-6 rounded-3xl bg-surface border-border/60">
                            <ul className="list-disc list-inside space-y-3 text-text-secondary italic font-medium">
                                <li>All sellers must undergo physical and digital ID verification.</li>
                                <li>Products listed must accurately match their descriptions and images.</li>
                                <li>Sellers are responsible for ensuring timely delivery via KASH logistics partners.</li>
                                <li>KASH reserves the right to suspend any seller found listing counterfeit or illegal items.</li>
                            </ul>
                        </Card>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black italic uppercase mb-4 tracking-tighter">4. User Accounts</h2>
                        <Card className="p-6 rounded-3xl bg-surface border-border/60">
                            <p className="text-text-secondary leading-relaxed">
                                Users are responsible for maintaining the confidentiality of their account credentials. Any activity performed via your account is considered your responsibility.
                            </p>
                        </Card>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black italic uppercase mb-4 tracking-tighter">5. Complaints and Disputes</h2>
                        <Card className="p-6 rounded-3xl bg-secondary text-white border-none shadow-xl">
                            <p className="text-slate-300 leading-relaxed">
                                In case of any issue with an order, users must file a complaint via the "Request Refund" or "Report" section within 48 hours of delivery. KASH arbitration will review the evidence provided by both parties to reach a fair resolution.
                            </p>
                        </Card>
                    </section>
                </div>

                <div className="mt-16 p-8 rounded-[2.5rem] bg-primary flex flex-col md:flex-row items-center gap-8 text-white shadow-2xl shadow-primary/20">
                    <div className="h-16 w-16 min-w-[4rem] rounded-2xl bg-white/20 flex items-center justify-center">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black italic uppercase mb-1">Your privacy matters</h3>
                        <p className="text-white/80 text-sm">Read our Privacy Policy to understand how we protect your data and sensitive information.</p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
