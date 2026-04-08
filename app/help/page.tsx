'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ChevronLeft, LifeBuoy, MessageSquare, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HelpPage() {
    const router = useRouter();

    const faqs = [
        { q: 'How do I place an order?', a: 'Browse products, add to cart, and follow the secure checkout steps.' },
        { q: 'Is my payment secure?', a: 'Yes, we use escrow systems and PCI-DSS compliant processors.' },
        { q: 'How to contact a seller?', a: 'Click the "Message Shop" button on any product page.' },
    ];

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto pb-20">
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors"
                >
                    <ChevronLeft size={20} /> Back
                </button>

                <header className="mb-16">
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-6 leading-none">
                        Help & <span className="text-primary underline decoration-primary/30">Support</span>
                    </h1>
                    <p className="text-xl text-text-secondary max-w-2xl font-medium leading-relaxed italic">
                        Everything you need to know about navigating the KASH ecosystem.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <Card className="p-8 rounded-[3rem] border-none bg-primary text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                        <MessageSquare size={48} className="mb-6 opacity-80" />
                        <h3 className="text-2xl font-black italic uppercase italic tracking-tight mb-4">Live Support</h3>
                        <p className="text-sm text-white/80 leading-relaxed font-bold italic mb-8">Chat directly with our support team for urgent issues.</p>
                        <Button className="w-full bg-white text-primary rounded-2xl h-14 font-black uppercase italic tracking-widest hover:bg-white/90">Start Chat</Button>
                    </Card>

                    <Card className="p-8 rounded-[3rem] border-none bg-surface shadow-xl relative overflow-hidden group">
                        <BookOpen size={48} className="mb-6 text-primary opacity-80" />
                        <h3 className="text-2xl font-black italic uppercase italic tracking-tight mb-4">Guide Book</h3>
                        <p className="text-sm text-text-secondary leading-relaxed font-bold italic mb-8">Read detailed documentation on buying and selling.</p>
                        <Button variant="outline" className="w-full rounded-2xl h-14 font-black uppercase italic tracking-widest">Open Guides</Button>
                    </Card>
                </div>

                <div className="space-y-8">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary italic ml-1 underline decoration-primary/20 underline-offset-8">Frequent Questions</h3>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="p-6 rounded-[2rem] border-border/40 shadow-sm">
                                    <h4 className="font-black italic uppercase italic tracking-tight text-lg mb-2">{faq.q}</h4>
                                    <p className="text-xs text-text-secondary font-medium italic leading-relaxed">{faq.a}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mt-20 pt-12 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-4">
                        <ShieldCheck className="text-primary" size={32} />
                        <div>
                            <p className="text-xs font-black uppercase italic tracking-tight">Enterprise Safety</p>
                            <p className="text-[10px] text-text-secondary uppercase font-bold">Your satisfaction is our contract.</p>
                        </div>
                    </div>
                    <Button variant="ghost" className="gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                        Security Overview <ExternalLink size={14} />
                    </Button>
                </div>
            </div>
        </MainLayout>
    );
}
