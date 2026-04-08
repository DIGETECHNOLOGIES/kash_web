'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ChevronLeft, CreditCard, Plus, Smartphone, ShieldCheck, History } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentsSettingsPage() {
    const router = useRouter();

    const paymentMethods = [
        { id: 1, type: 'MTN', label: 'MTN Mobile Money', sub: '677 *** 000', active: true },
        { id: 2, type: 'ORANGE', label: 'Orange Money', sub: '655 *** 111', active: false },
    ];

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto pb-20">
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors"
                >
                    <ChevronLeft size={20} /> Back
                </button>

                <header className="mb-10">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">
                        Payment <span className="text-primary underline decoration-primary/30">Methods</span>
                    </h1>
                    <p className="text-text-secondary">Manage your wallets and cards for secure checkout.</p>
                </header>

                <div className="space-y-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-text-secondary italic">Saved Wallets</h3>
                        <Button variant="outline" size="sm" className="rounded-xl h-10 gap-2 font-black uppercase italic text-[10px]">
                            <Plus size={14} /> Add New
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {paymentMethods.map((pm) => (
                            <Card key={pm.id} className="p-6 rounded-[2.5rem] border-border/40 shadow-sm flex items-center justify-between group hover:border-primary/50 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className={`h-14 w-14 rounded-2xl bg-background flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors`}>
                                        <Smartphone size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-black italic uppercase tracking-tight text-lg leading-tight">{pm.label}</h4>
                                        <p className="text-[10px] font-bold text-text-secondary uppercase">{pm.sub}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {pm.active && (
                                        <div className="bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-primary/20">
                                            Default
                                        </div>
                                    )}
                                    <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl text-xs font-black uppercase italic">Edit</Button>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <Card className="p-8 rounded-[3.1rem] border-dashed border-2 border-border/60 bg-transparent flex flex-col items-center justify-center py-12 text-center group cursor-pointer hover:border-primary/40 transition-all">
                        <div className="h-16 w-16 rounded-full bg-border/20 flex items-center justify-center text-text-secondary group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 mb-6">
                            <CreditCard size={32} />
                        </div>
                        <h4 className="font-black italic uppercase italic tracking-tight text-lg mb-2">Connect Bank Card</h4>
                        <p className="text-xs text-text-secondary max-w-[240px] font-medium leading-relaxed">Securely link your VISA or Mastercard for international settlements.</p>
                    </Card>

                    <div className="flex items-center gap-4 bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10">
                        <ShieldCheck className="text-primary shrink-0" size={24} />
                        <p className="text-[10px] font-bold text-text-secondary uppercase italic leading-loose">
                            All your financial data is <strong className="text-primary">PCI-DSS compliant</strong> and never stored directly on our servers.
                        </p>
                    </div>

                    <Button variant="ghost" className="w-full h-14 rounded-2xl border border-border/40 font-black uppercase italic gap-3 text-text-secondary hover:text-primary">
                        <History size={18} />
                        View Transaction History
                    </Button>
                </div>
            </div>
        </MainLayout>
    );
}
