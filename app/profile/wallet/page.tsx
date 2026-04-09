'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { walletApi } from '@/services/api/walletApi';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Wallet, ArrowUpRight, History, DollarSign, ShieldCheck, Info, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const MIN_WITHDRAWAL_AMOUNT = 100;
const WITHDRAW_PROVIDERS = [
    { id: 'MTN', name: 'MTN Mobile Money' },
    { id: 'ORANGE', name: 'Orange Money' },
] as const;

export default function WalletPage() {
    const { user } = useAuthStore();
    const { t } = useTranslation();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [accountNumber, setAccountNumber] = useState(user?.number || '');
    const [accountName, setAccountName] = useState(user?.username || '');
    const [provider, setProvider] = useState<(typeof WITHDRAW_PROVIDERS)[number]['id'] | ''>('');

    const { data: balance, isLoading: isLoadingBalance } = useQuery({
        queryKey: ['wallet-balance'],
        queryFn: () => walletApi.getBalance(),
    });

    const { data: withdrawals, isLoading: isLoadingWithdrawals } = useQuery({
        queryKey: ['wallet-withdrawals'],
        queryFn: () => walletApi.listWithdrawals(1, 10),
    });

    const availableBalance = balance?.availableBalance ?? 0;
    const pendingBalance = balance?.pendingBalance ?? 0;
    const referralEarnings = balance?.referralEarnings ?? 0;
    const totalEarnings = balance?.totalEarnings ?? 0;
    const totalWithdrawals = balance?.totalWithdrawals ?? 0;

    const feeBreakdown = useMemo(() => {
        const amountNum = Number(withdrawAmount);
        if (!Number.isFinite(amountNum) || amountNum <= 0) return null;
        return walletApi.calculateWithdrawalCharges(amountNum);
    }, [withdrawAmount]);

    const withdrawMutation = useMutation({
        mutationFn: ({ amount, accountNumber, accountName }: { amount: string, accountNumber: string, accountName: string }) =>
            walletApi.requestWithdrawal(amount, accountNumber, accountName),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
            queryClient.invalidateQueries({ queryKey: ['wallet-withdrawals'] });
            setIsWithdrawOpen(false);
            setWithdrawAmount('');
            setProvider('');
            toast.success(t('wallet.withdrawRequestSubmitted') || 'Withdrawal request submitted');
        },
        onError: (err: any) => {
            toast.error(err?.message || t('common.error') || 'Error');
        }
    });

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        const amountNum = Number(withdrawAmount);

        if (!Number.isFinite(amountNum) || amountNum <= 0) {
            toast.error(t('wallet.amountPositive') || 'Enter a valid amount');
            return;
        }
        if (!accountNumber || !accountName) {
            toast.error(t('wallet.missingDetails') || 'Please fill all required fields');
            return;
        }
        if (!provider) {
            toast.error(t('auth.providerRequired') || 'Please select a provider');
            return;
        }

        const check = walletApi.canWithdraw(availableBalance, amountNum, MIN_WITHDRAWAL_AMOUNT);
        if (!check.canWithdraw) {
            if (!check.meetsMinimum) {
                toast.error(t('wallet.minWithdrawalMsg', { amount: MIN_WITHDRAWAL_AMOUNT }) || `Minimum withdrawal is ${MIN_WITHDRAWAL_AMOUNT}`);
            } else {
                toast.error(t('wallet.insufficientBalance') || 'Insufficient balance');
            }
            return;
        }

        withdrawMutation.mutate({ amount: String(amountNum), accountNumber, accountName });
    };

    const getStatusColorClass = (status: string) => {
        const s = String(status || '').toUpperCase();
        if (s === 'APPROVED') return 'text-success bg-success/10';
        if (s === 'REJECTED') return 'text-error bg-error/10';
        if (s === 'PENDING') return 'text-warning bg-warning/10';
        return 'text-text-secondary bg-background';
    };

    const formatWithdrawalDate = (w: any) => {
        const raw = w?.requested_at || w?.created_at || w?.updated_at;
        const date = raw ? new Date(raw) : null;
        return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : '';
    };

    return (
        <MainLayout>
            <button
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
                <ChevronLeft size={20} /> {t('common.back')}
            </button>

            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-8 flex items-center gap-4">
                    <Wallet size={40} className="text-primary" />
                    {t('wallet.title').split(' ')[0]} <span className="text-primary underline decoration-primary/30">{t('wallet.title').split(' ')[1]}</span>
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Main Balance Card */}
                    <Card className="p-10 rounded-[3rem] bg-secondary text-white relative overflow-hidden flex flex-col justify-between shadow-2xl border-none">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2" />

                        <div className="relative z-10">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block italic">{t('wallet.availableFunds')}</span>
                            <div className="text-5xl font-black italic tracking-tighter mb-8">
                                {isLoadingBalance ? '---' : availableBalance.toLocaleString()} <small className="text-xl not-italic font-bold opacity-50">FCFA</small>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    onClick={() => setIsWithdrawOpen(true)}
                                    className="rounded-2xl h-14 flex-1 font-black uppercase tracking-tight italic"
                                >
                                    {t('wallet.withdraw')} <ArrowUpRight size={18} className="ml-2" />
                                </Button>
                                <Button variant="outline" className="rounded-2xl h-14 w-14 border-white/20 text-white hover:bg-white/10 p-0">
                                    <Info size={24} />
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        <Card className="p-6 rounded-[2.5rem] bg-surface border-border/40 flex items-center gap-6 shadow-sm">
                            <div className="h-16 w-16 rounded-[1.5rem] bg-warning/10 flex items-center justify-center text-warning">
                                <History size={32} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1 block">{t('wallet.pendingBalance')}</span>
                                <span className="text-xl font-black italic">
                                    {isLoadingBalance ? '---' : pendingBalance.toLocaleString()} <small className="text-xs not-italic opacity-50 font-bold">FCFA</small>
                                </span>
                            </div>
                        </Card>
                        <Card className="p-6 rounded-[2.5rem] bg-surface border-border/40 flex items-center gap-6 shadow-sm">
                            <div className="h-16 w-16 rounded-[1.5rem] bg-success/10 flex items-center justify-center text-success">
                                <DollarSign size={32} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1 block">{t('wallet.referralEarnings')}</span>
                                <span className="text-xl font-black italic">
                                    {isLoadingBalance ? '---' : referralEarnings.toLocaleString()} <small className="text-xs not-italic opacity-50 font-bold">FCFA</small>
                                </span>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Withdrawal History */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase">{t('wallet.withdrawalHistory').split(' ')[0]} <span className="text-primary underline decoration-primary/30">{t('wallet.withdrawalHistory').split(' ')[1]}</span></h2>
                        <Badge variant="outline" className="px-4 py-1.5 rounded-xl uppercase font-black italic">{t('wallet.recentActivity')}</Badge>
                    </div>

                    <div className="space-y-4">
                        {isLoadingWithdrawals ? (
                            [...Array(5)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-[2rem] bg-surface border border-border" />)
                        ) : (withdrawals?.results?.length ?? 0) === 0 ? (
                            <div className="py-20 text-center bg-surface/50 rounded-[3rem] border border-dashed border-border opacity-50">
                                <History className="mx-auto mb-4 text-text-secondary" size={48} />
                                <p className="font-bold uppercase tracking-widest italic">{t('wallet.noWithdrawals')}</p>
                            </div>
                        ) : (
                            withdrawals?.results?.map((w: any) => (
                                <div key={w.id} className="space-y-2">
                                    <Card className="p-6 rounded-[2rem] flex items-center gap-6 border-border/40 hover:border-primary/30 transition-all shadow-sm">
                                        <div className="flex-1">
                                            <h4 className="font-black italic uppercase tracking-tight text-sm mb-1">
                                                {(Number(w.amount) || 0).toLocaleString()} FCFA
                                            </h4>
                                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                                {formatWithdrawalDate(w)}{formatWithdrawalDate(w) ? ' • ' : ''}{w.account_number}
                                            </span>
                                        </div>
                                        <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest italic ${getStatusColorClass(w.status)}`}>
                                            {w.status}
                                        </div>
                                    </Card>
                                    {String(w.status || '').toUpperCase() === 'REJECTED' && w.rejection_reason ? (
                                        <Card className="p-4 rounded-[1.5rem] bg-error/5 border-error/20">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-error mb-1">
                                                {t('wallet.rejectionReason') || 'Rejection reason'}
                                            </p>
                                            <p className="text-xs font-bold text-text-secondary">
                                                {w.rejection_reason}
                                            </p>
                                        </Card>
                                    ) : null}
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Earnings Breakdown (mobile parity) */}
                <section className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase">
                            {t('wallet.earningsBreakdown') || 'Earnings Breakdown'}
                        </h2>
                    </div>
                    <Card className="p-8 rounded-[2.5rem] bg-surface border-border/40 shadow-sm">
                        <div className="flex justify-between mb-4">
                            <span className="text-xs font-black uppercase tracking-widest text-text-secondary">
                                {t('wallet.totalEarnings') || 'Total Earnings'}
                            </span>
                            <span className="text-sm font-black italic">
                                {totalEarnings.toLocaleString()} FCFA
                            </span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="text-xs font-black uppercase tracking-widest text-text-secondary">
                                {t('wallet.referralEarnings')}
                            </span>
                            <span className="text-sm font-black italic text-success">
                                {referralEarnings.toLocaleString()} FCFA
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-text-secondary">
                                {t('wallet.totalWithdrawals') || 'Total Withdrawals'}
                            </span>
                            <span className="text-sm font-black italic text-error">
                                {totalWithdrawals.toLocaleString()} FCFA
                            </span>
                        </div>
                    </Card>
                </section>
            </div>

            {/* Withdrawal Modal */}
            <AnimatePresence>
                {isWithdrawOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsWithdrawOpen(false)}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none p-4"
                        >
                            <Card className="w-full max-w-md p-10 rounded-[3rem] bg-surface shadow-2xl pointer-events-auto border-none glass">
                                <div className="text-center mb-8">
                                    <div className="h-20 w-20 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                                        <ArrowUpRight size={40} />
                                    </div>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">{t('wallet.withdrawFunds')}</h2>
                                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mt-1">{t('wallet.availableBalance')}: {availableBalance.toLocaleString()} F</p>
                                </div>

                                <form onSubmit={handleWithdraw} className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">{t('wallet.withdrawAmount')} (FCFA)</label>
                                            <input
                                                type="number"
                                                value={withdrawAmount}
                                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                                placeholder={`Min. ${MIN_WITHDRAWAL_AMOUNT.toLocaleString()} F`}
                                                className="w-full h-16 rounded-2xl bg-background border border-border px-8 text-2xl font-black italic text-primary focus:border-primary focus:outline-none transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                                                {t('payment.selectProvider') || 'Select Provider'}
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {WITHDRAW_PROVIDERS.map((p) => {
                                                    const active = provider === p.id;
                                                    return (
                                                        <button
                                                            key={p.id}
                                                            type="button"
                                                            onClick={() => setProvider(p.id)}
                                                            className={`h-12 rounded-2xl border-2 px-4 text-xs font-black uppercase italic transition-all ${active ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background text-text-secondary'}`}
                                                        >
                                                            {p.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">{t('wallet.accountNumberMomo')}</label>
                                            <input
                                                type="tel"
                                                value={accountNumber}
                                                onChange={(e) => setAccountNumber(e.target.value)}
                                                placeholder="6xx xxx xxx"
                                                className="w-full h-14 rounded-2xl bg-background border border-border px-6 text-sm font-bold italic focus:border-primary focus:outline-none transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">{t('wallet.accountName')}</label>
                                            <input
                                                type="text"
                                                value={accountName}
                                                onChange={(e) => setAccountName(e.target.value)}
                                                placeholder="Full Name on Account"
                                                className="w-full h-14 rounded-2xl bg-background border border-border px-6 text-sm font-bold italic focus:border-primary focus:outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {feeBreakdown && Number(withdrawAmount) >= MIN_WITHDRAWAL_AMOUNT ? (
                                        <div className="bg-primary/5 rounded-2xl p-4 space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold text-text-secondary">
                                                <span>{t('wallet.requested') || 'Requested'}</span>
                                                <span>{feeBreakdown.amount.toLocaleString()} F</span>
                                            </div>
                                            <div className="flex justify-between text-[10px] font-bold text-text-secondary">
                                                <span>{t('wallet.platformFee') || 'Platform fee (3%)'}</span>
                                                <span className="text-error">- {feeBreakdown.platformFee.toLocaleString()} F</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-black text-primary italic border-t border-primary/10 pt-2">
                                                <span>{t('wallet.youWillReceive') || 'You will receive'}</span>
                                                <span>{feeBreakdown.receiveAmount.toLocaleString()} F</span>
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="flex gap-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsWithdrawOpen(false)}
                                            className="flex-1 rounded-2xl h-14 font-black uppercase tracking-tight italic"
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                        <Button
                                            type="submit"
                                            isLoading={withdrawMutation.isPending}
                                            className="flex-1 rounded-2xl h-14 font-black uppercase tracking-tight italic shadow-lg shadow-primary/20"
                                        >
                                            {t('common.confirm')}
                                        </Button>
                                    </div>

                                    <p className="text-[10px] text-center text-text-secondary font-bold uppercase flex items-center justify-center gap-2">
                                        <ShieldCheck size={14} className="text-primary" />
                                        {t('wallet.secureEscrow')}
                                    </p>
                                </form>
                            </Card>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </MainLayout>
    );
}
