'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ChevronLeft, AlertTriangle, Send, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ReportPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'General';
    const id = searchParams.get('id') || '';

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason) {
            toast.error('Please provide a reason for the report');
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            toast.success('Report submitted successfully! Our team will investigate.');
            router.back();
        }, 1500);
    };

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
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-error/10 flex items-center justify-center text-error border border-error/20">
                            <AlertTriangle size={24} />
                        </div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                            Submit <span className="text-error underline decoration-error/30">Report</span>
                        </h1>
                    </div>
                    <p className="text-text-secondary">Reporting {type} ID: {id}. Help us keep KASH safe.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <Card className="p-8 rounded-[2.5rem] border-border/40 shadow-sm space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Reason for report</label>
                            <select
                                className="w-full h-14 rounded-2xl bg-background border border-border px-5 text-sm font-bold italic focus:border-error focus:outline-none transition-all outline-none"
                                defaultValue=""
                            >
                                <option value="" disabled>Select a category</option>
                                <option value="scam">Fraud/Scam Attempt</option>
                                <option value="illegal">Illegal Product</option>
                                <option value="inaccurate">Inaccurate Description</option>
                                <option value="offensive">Offensive Content</option>
                                <option value="other">Other Issue</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Detailed Explanation</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Please provide evidence or context..."
                                className="w-full min-h-[160px] p-6 rounded-3xl bg-background border border-border text-sm font-medium italic focus:border-error focus:outline-none transition-all resize-none outline-none"
                            />
                        </div>
                    </Card>

                    <div className="flex items-center gap-4 bg-error/5 p-6 rounded-[2.5rem] border border-error/10">
                        <ShieldCheck className="text-error shrink-0" size={24} />
                        <p className="text-[10px] font-bold text-text-secondary uppercase italic leading-relaxed">
                            False reporting is a violation of our <strong className="text-error">Terms of Service</strong>. Please ensure your claims are accurate.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex-1 rounded-2xl h-16 font-black uppercase italic"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            className="flex-1 rounded-2xl h-16 font-black uppercase italic shadow-2xl shadow-error/20 bg-error hover:bg-error/90"
                        >
                            <Send size={18} className="mr-2" />
                            Submit Report
                        </Button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
