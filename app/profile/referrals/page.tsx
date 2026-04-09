'use client';

import React, { useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
    Users,
    Share2,
    Gift,
    Copy,
    CheckCircle2,
    ChevronLeft,
    Smartphone,
    Trophy,
    History,
    DollarSign,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { referralApi } from '@/services/api/referralApi';

function formatXaf(value: string | number | undefined | null): string {
    const num = typeof value === 'number' ? value : Number(value ?? 0);
    if (!Number.isFinite(num)) return '0 F';
    return `${num.toLocaleString()} F`;
}

function getRankLabel(totalReferrals: number): string {
    if (totalReferrals >= 50) return 'Gold Tier';
    if (totalReferrals >= 10) return 'Silver Tier';
    return 'Bronze Tier';
}

function safeDateLabel(dateValue: string | undefined): string {
    if (!dateValue) return '—';
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleDateString();
}

export default function ReferralsPage() {
    const router = useRouter();

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['referrals', 'stats'],
        queryFn: () => referralApi.getReferralStats(),
    });

    const { data: referrals, isLoading: referralsLoading } = useQuery({
        queryKey: ['referrals', 'list'],
        queryFn: () => referralApi.getReferrals(1, 10),
    });

    const referralCode = stats?.referralCode ?? '';
    const totalReferrals = stats?.totalReferrals ?? 0;
    const totalEarnings = stats?.totalEarnings ?? '0';
    const rankLabel = getRankLabel(totalReferrals);

    const referralLink = useMemo(() => {
        if (typeof window === 'undefined') return '';
        if (!referralCode) return '';
        return `${window.location.origin}/register?ref=${encodeURIComponent(referralCode)}`;
    }, [referralCode]);

    const copyToClipboard = async () => {
        if (!referralLink) return;
        try {
            await navigator.clipboard.writeText(referralLink);
            toast.success('Referral link copied to clipboard!');
        } catch {
            toast.error('Failed to copy referral link');
        }
    };

    const handleShare = async () => {
        if (!referralLink) return;
        const shareText = `🚀 *Join KASH Marketplace*\n\nBuy, sell and resell securely in Cameroon. Use my referral code to get started!\n\n🎁 Code: *${referralCode}*\n👉 Register here: ${referralLink}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join KASH Marketplace',
                    text: shareText,
                    url: referralLink,
                });
            } catch {
                // ignore cancellations
            }
            return;
        }

        try {
            await navigator.clipboard.writeText(shareText);
            toast.success('Invitation details copied!');
        } catch {
            toast.error('Failed to copy invitation details');
        }
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto pb-20">
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors"
                >
                    <ChevronLeft size={20} /> Back
                </button>

                <header className="mb-12">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">
                        Build Your{' '}
                        <span className="text-primary underline decoration-primary/30">Network</span>
                    </h1>
                    <p className="text-text-secondary">
                        Invite friends to KASH and earn commission on every purchase they make.
                    </p>
                </header>

                <section className="mb-12 p-12 rounded-[3rem] bg-secondary text-white relative overflow-hidden flex flex-col items-center text-center shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[150px] opacity-20 translate-x-1/3 -translate-y-1/3" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-info rounded-full blur-[120px] opacity-10 -translate-x-1/3 translate-y-1/3" />

                    <div className="relative z-10 w-full max-w-sm">
                        <div className="h-24 w-24 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-primary mx-auto mb-8 shadow-2xl">
                            <Gift size={48} className="animate-bounce" />
                        </div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">
                            Share & Earn
                        </h2>
                        <p className="text-slate-400 font-medium mb-12">
                            Give your friends access to Elite Marketplace and earn 2% of their transaction fees for life.
                        </p>

                        <div className="space-y-4">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm group transition-all hover:bg-white/10">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block italic">
                                    Your unique code
                                </span>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-3xl font-black tracking-widest italic">
                                        {statsLoading ? '—' : (referralCode || '—')}
                                    </span>
                                    <button
                                        onClick={copyToClipboard}
                                        className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                                        disabled={!referralLink}
                                    >
                                        <Copy size={18} />
                                    </button>
                                </div>
                            </div>
                            <Button
                                onClick={handleShare}
                                size="lg"
                                className="w-full h-14 rounded-2xl font-black uppercase italic shadow-xl shadow-primary/20"
                                disabled={!referralLink}
                            >
                                Invite Specialists <Share2 className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        {
                            label: 'Total Referrals',
                            value: statsLoading ? '—' : String(totalReferrals),
                            icon: Users,
                            color: 'text-primary',
                            bg: 'bg-primary/10',
                        },
                        {
                            label: 'Total Earnings',
                            value: statsLoading ? '—' : formatXaf(totalEarnings),
                            icon: DollarSign,
                            color: 'text-success',
                            bg: 'bg-success/10',
                        },
                        {
                            label: 'Current Rank',
                            value: statsLoading ? '—' : rankLabel,
                            icon: Trophy,
                            color: 'text-warning',
                            bg: 'bg-warning/10',
                        },
                    ].map((stat, i) => (
                        <Card
                            key={i}
                            className="p-8 rounded-[2.5rem] flex flex-col items-center text-center border-none shadow-sm hover:shadow-xl transition-all group"
                        >
                            <div
                                className={`h-16 w-16 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 shadow-inner group-hover:rotate-12 transition-transform`}
                            >
                                <stat.icon size={32} />
                            </div>
                            <span className="text-2xl font-black italic tracking-tighter mb-1">
                                {stat.value}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                                {stat.label}
                            </span>
                        </Card>
                    ))}
                </div>

                <section className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase">
                            Recent{' '}
                            <span className="text-primary underline decoration-primary/30">Activity</span>
                        </h2>
                        <Badge
                            variant="outline"
                            className="px-4 py-1.5 rounded-xl uppercase font-black italic flex items-center gap-2"
                        >
                            <History size={14} /> Tracking Enabled
                        </Badge>
                    </div>

                    <div className="space-y-3">
                        {referralsLoading ? (
                            <Card className="p-6 rounded-[2rem] border-border/30 shadow-sm">
                                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">
                                    Loading activity…
                                </p>
                            </Card>
                        ) : (referrals?.results?.length ? (
                            referrals.results.map((u, i) => (
                                <Card
                                    key={u.id || String(i)}
                                    className="p-6 rounded-[2rem] flex items-center gap-6 border-border/30 hover:border-primary/30 transition-all shadow-sm"
                                >
                                    <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center text-text-secondary">
                                        <Smartphone size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <h4 className="font-bold text-sm uppercase italic">
                                                New referral joined
                                            </h4>
                                            <span className="text-primary font-black italic">+0 F</span>
                                        </div>
                                        <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">
                                            {u.username} • {safeDateLabel(u.joinDate)}
                                        </p>
                                    </div>
                                    <CheckCircle2 size={24} className="text-success opacity-50" />
                                </Card>
                            ))
                        ) : (
                            <Card className="p-6 rounded-[2rem] border-border/30 shadow-sm">
                                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">
                                    No referral activity yet.
                                </p>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
