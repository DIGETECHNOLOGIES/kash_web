'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ChevronLeft, Lock, ShieldCheck, Mail, Smartphone, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SecuritySettingsPage() {
    const router = useRouter();

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
                        Security <span className="text-primary underline decoration-primary/30">Center</span>
                    </h1>
                    <p className="text-text-secondary">Manage your password, 2FA and account security levels.</p>
                </header>

                <div className="space-y-6">
                    <Card className="p-8 rounded-[2.5rem] border-border/40 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary italic">Password Strategy</h3>
                            <Button variant="outline" size="sm" className="rounded-xl h-10 px-6">Change</Button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-5 rounded-2xl bg-background border border-border flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Lock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-tight">Login Password</p>
                                        <p className="text-[10px] text-text-secondary">Last updated 3 months ago</p>
                                    </div>
                                </div>
                                <Eye size={18} className="text-text-secondary" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 rounded-[2.5rem] border-border/40 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary mb-8 italic">Verification Layers</h3>

                        <div className="space-y-4">
                            <div className="p-5 rounded-2xl bg-background border border-border flex items-center justify-between opacity-60">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center text-info">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-tight">Email Verification</p>
                                        <p className="text-[10px] text-text-secondary">Mandatory active layer</p>
                                    </div>
                                </div>
                                <ShieldCheck size={20} className="text-success" />
                            </div>

                            <div className="p-5 rounded-2xl bg-background border border-border flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
                                        <Smartphone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-tight">Two-Factor (2FA)</p>
                                        <p className="text-[10px] text-text-secondary">Enhance account protection</p>
                                    </div>
                                </div>
                                <Button size="sm" className="h-8 px-4 rounded-lg text-[10px] font-black uppercase italic">Enable</Button>
                            </div>
                        </div>
                    </Card>

                    <div className="bg-error/5 p-6 rounded-[2.5rem] border border-error/10">
                        <div className="flex items-center gap-4 mb-2">
                            <ShieldCheck className="text-error" size={20} />
                            <h4 className="font-black italic uppercase italic tracking-tight text-error leading-tight">Advanced Protection</h4>
                        </div>
                        <p className="text-[10px] font-bold text-text-secondary uppercase italic">
                            Your session is currently encrypted with <strong className="text-error">AES-256 GCM</strong>. We monitor suspicious activity 24/7.
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
