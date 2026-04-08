'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ChevronLeft, ShieldCheck, Lock, Eye, FileText, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
    const router = useRouter();

    const sections = [
        {
            icon: Eye,
            title: 'Data Collection',
            content: 'We collect minimal personal data including your name, email, and phone number to provide marketplace services. Location data is used only for logistics calculations.'
        },
        {
            icon: Lock,
            title: 'Encryption',
            content: 'All sensitive data is encrypted using military-grade AES-256 protocols. Your payment credentials never hit our servers directly.'
        },
        {
            icon: Globe,
            title: 'Third-Party Sharing',
            content: 'We do not sell your data. Information is shared only with logistics partners and payment processors necessary to fulfill your orders.'
        }
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
                    <div className="flex items-center gap-4 mb-4">
                        <Badge variant="primary" className="px-4 py-1.5 rounded-xl uppercase font-black italic">Trust Center</Badge>
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary italic">Last Updated: April 2024</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase mb-6 leading-none">
                        Privacy <span className="text-primary underline decoration-primary/30">Protocol</span>
                    </h1>
                    <p className="text-xl text-text-secondary max-w-2xl font-medium leading-relaxed italic">
                        At KASH, your data privacy is our absolute priority. Learn how we protect your information in the digital marketplace.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {sections.map((section, idx) => (
                        <Card key={idx} className="p-8 rounded-[3rem] border-none bg-surface/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all group">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:bg-primary transition-all duration-500 group-hover:text-white">
                                <section.icon size={32} />
                            </div>
                            <h3 className="text-xl font-black italic uppercase italic tracking-tight mb-4">{section.title}</h3>
                            <p className="text-xs text-text-secondary leading-relaxed font-medium italic">{section.content}</p>
                        </Card>
                    ))}
                </div>

                <div className="space-y-12 mb-20">
                    <div className="flex items-start gap-8">
                        <div className="h-20 w-1 flex-shrink-0 bg-primary rounded-full mt-2" />
                        <div>
                            <h2 className="text-3xl font-black italic uppercase italic tracking-tight mb-6">Transparency Report</h2>
                            <div className="prose prose-sm font-medium text-text-secondary italic max-w-none space-y-6">
                                <p>We believe in radical transparency. Every piece of code that handles your user data is audited twice yearly by external security firms. Our infrastructure is built on private clusters to ensure zero data leakage.</p>
                                <p>By using the KASH platform, you agree to our standard data processing terms. You have the right at any time to request a full export of your data or a complete account deletion including all transaction logs using the settings panel.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Card className="p-12 rounded-[4rem] border-none bg-secondary text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4 leading-tight">Need a custom <span className="text-primary italic">GDPR</span> data request?</h3>
                            <p className="text-slate-400 font-medium italic mb-8">Contact our legal compliance team for any specific privacy concerns or enterprise-level data agreements.</p>
                            <Button className="rounded-2xl h-14 px-12 font-black uppercase italic tracking-widest shadow-2xl shadow-primary/20">Contact Legal</Button>
                        </div>
                        <div className="h-48 w-48 rounded-[3rem] bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                            <ShieldCheck size={80} className="text-primary" />
                        </div>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}

function Badge({ children, className, variant }: any) {
    const variants: any = {
        primary: 'bg-primary/10 text-primary border-primary/20',
        outline: 'border-border text-text-secondary',
        error: 'bg-error/10 text-error border-error/20',
        success: 'bg-success/10 text-success border-success/20',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${variants[variant || 'outline']} ${className}`}>
            {children}
        </span>
    );
}
