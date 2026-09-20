'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    Store,
    ShieldCheck,
    Lock,
    Package,
    AlertCircle,
    CheckCircle2,
    Copy,
} from 'lucide-react';
import { toast } from 'sonner';

import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { orderApi } from '@/services/api/orderApi';
import { paymentApi } from '@/services/api/paymentApi';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatImageUrl } from '@/utils/formatters';

interface PaymentLinkClientProps {
    code: string;
    initialData: any;
}

export function PaymentLinkClient({ code, initialData }: PaymentLinkClientProps) {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();

    const [linkData] = useState<any>(initialData);
    const [submitting, setSubmitting] = useState(false);

    // Payment Form States
    const [location, setLocation] = useState('');
    const [phone, setPhone] = useState(user?.number || '');
    const [paymentMethod, setPaymentMethod] = useState<'MTN' | 'ORANGE'>('MTN');
    const [paymentPopupOpen, setPaymentPopupOpen] = useState(false);
    const [paymentPopupMessage, setPaymentPopupMessage] = useState('');
    const [transactionId, setTransactionId] = useState('');

    const handleProceedPayment = async () => {
        if (!location.trim()) {
            toast.error('Please enter your delivery address/city.');
            return;
        }
        if (!phone.trim() || phone.trim().length < 9) {
            toast.error('Please enter a valid 9-digit mobile money number.');
            return;
        }

        setSubmitting(true);
        try {
            const created = await orderApi.createOrderFromPaymentLink(code, {
                delivery_location: location.trim(),
            });

            const order = created.order;
            const payableAmount = Number(order.payableTotal ?? (order as any).payable_total ?? order.total ?? linkData.total);

            const res = await paymentApi.initiatePayment({
                amount: String(payableAmount),
                provider: paymentMethod,
                phone_number: phone.trim(),
                order_ids: [Number(order.id)],
            });

            setPaymentPopupMessage(res?.message || 'Payment request sent! Please approve the prompt on your phone.');
            setTransactionId(res?.transaction_id || '');
            setPaymentPopupOpen(true);
        } catch (err: any) {
            toast.error(err?.message || 'Failed to initialize payment.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
    };

    if (!linkData) {
        return (
            <MainLayout>
                <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                        <AlertCircle size={36} className="text-red-500" />
                    </div>
                    <h1 className="text-2xl font-black mb-2">Payment Link Unavailable</h1>
                    <p className="text-text-secondary max-w-md mb-6">This link may have expired or was deactivated by the seller.</p>
                    <Button onClick={() => router.push('/')} className="rounded-xl px-8">
                        Back to Home
                    </Button>
                </div>
            </MainLayout>
        );
    }

    const subtotal = Number(linkData.subtotal || linkData.price * linkData.quantity);
    const processingFee = Number(linkData.processing_fee || subtotal * 0.026);
    const total = Number(linkData.total || subtotal + processingFee);

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto py-10 px-4">
                <Modal
                    isOpen={paymentPopupOpen}
                    onClose={() => {
                        setPaymentPopupOpen(false);
                        router.push('/orders');
                    }}
                    title="Payment Authorization Sent"
                    className="max-w-md"
                >
                    <div className="p-6 text-center space-y-6">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <CheckCircle2 size={36} className="text-primary" />
                        </div>
                        <h3 className="text-lg font-black">{paymentPopupMessage}</h3>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            Please check your mobile phone for the prompt from {paymentMethod} to enter your PIN. Your payment is held safely until you confirm delivery.
                        </p>
                        {transactionId && (
                            <div className="bg-background border border-border rounded-xl p-3 text-xs font-mono break-all text-left">
                                <span className="text-text-secondary block font-sans text-[10px] uppercase tracking-wider mb-1">Ref ID:</span>
                                {transactionId}
                            </div>
                        )}
                        <Button
                            className="w-full h-12 rounded-xl font-bold"
                            onClick={() => {
                                setPaymentPopupOpen(false);
                                router.push('/orders');
                            }}
                        >
                            View in My Orders
                        </Button>
                    </div>
                </Modal>

                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Direct Purchase Offer</h1>
                        <p className="text-text-secondary text-sm">Secure checkout backed by KASH Buyer Escrow Protection</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCopyLink} className="rounded-xl flex items-center gap-2">
                        <Copy size={16} /> Share
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Left Column: Product & Shop Details */}
                    <div className="md:col-span-7 space-y-6">
                        <Card className="p-4 flex items-center justify-between bg-card border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    <Store size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Sold by</p>
                                    <h2 className="text-base font-black">{linkData.shop_name}</h2>
                                </div>
                            </div>
                            <Badge variant="primary" className="text-[11px] font-bold">Verified Shop</Badge>
                        </Card>

                        <Card className="p-6 bg-card border-border">
                            <div className="flex gap-4 sm:gap-6">
                                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                                    {linkData.product_image ? (
                                        <Image
                                            src={formatImageUrl(linkData.product_image)}
                                            alt={linkData.product_name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-text-secondary">
                                            <Package size={32} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-black leading-snug">{linkData.product_name}</h3>
                                        <p className="text-xs text-text-secondary mt-1">Quantity: <span className="font-bold text-foreground">{linkData.quantity}</span></p>
                                    </div>
                                    <div className="mt-3">
                                        <p className="text-xl font-black text-primary">{formatCurrency(linkData.price)} <span className="text-xs font-normal text-text-secondary">/ unit</span></p>
                                    </div>
                                </div>
                            </div>

                            {linkData.note && (
                                <div className="mt-4 p-3 rounded-xl bg-background border border-border text-xs leading-relaxed text-text-secondary">
                                    <span className="font-bold text-foreground">Note from Seller: </span>
                                    {linkData.note}
                                </div>
                            )}
                        </Card>

                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                            <ShieldCheck className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                            <div className="text-xs leading-relaxed">
                                <p className="font-bold text-emerald-500">Escrow Protected Purchase</p>
                                <p className="text-text-secondary">Your money is safely held by KASH until you receive the package and confirm your 6-digit delivery code.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Checkout or Login Action */}
                    <div className="md:col-span-5 space-y-6">
                        <Card className="p-6 bg-card border-border">
                            <h3 className="text-base font-black mb-4">Payment Breakdown</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-text-secondary">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-foreground">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-text-secondary">
                                    <span>Processing Fee (2.6%)</span>
                                    <span className="font-bold text-foreground">{formatCurrency(processingFee)}</span>
                                </div>
                                <div className="h-px bg-border my-2" />
                                <div className="flex justify-between text-base font-black">
                                    <span>Payable Total</span>
                                    <span className="text-primary">{formatCurrency(total)}</span>
                                </div>
                            </div>

                            <div className="mt-8">
                                {isAuthenticated ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-text-secondary block mb-1.5">Delivery City / Address</label>
                                            <input
                                                type="text"
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                                                placeholder="e.g. Douala, Bonapriso"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-text-secondary block mb-1.5">Select Payment Method</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setPaymentMethod('MTN')}
                                                    className={`py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                                                        paymentMethod === 'MTN'
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-border bg-background text-text-secondary'
                                                    }`}
                                                >
                                                    MTN Mobile Money
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPaymentMethod('ORANGE')}
                                                    className={`py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                                                        paymentMethod === 'ORANGE'
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-border bg-background text-text-secondary'
                                                    }`}
                                                >
                                                    Orange Money
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-text-secondary block mb-1.5">Mobile Money Phone Number</label>
                                            <input
                                                type="tel"
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:border-primary"
                                                placeholder="6XXXXXXXX"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </div>

                                        <Button
                                            onClick={handleProceedPayment}
                                            disabled={submitting}
                                            className="w-full h-12 rounded-xl font-bold uppercase tracking-wider text-xs mt-2"
                                        >
                                            {submitting ? 'Processing...' : `Pay ${formatCurrency(total)}`}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 space-y-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                                            <Lock size={22} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black mb-1">Sign In to Continue</h4>
                                            <p className="text-xs text-text-secondary leading-relaxed">
                                                Please log in or create an account to pay. Once logged in, you will be redirected right back to complete your order.
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/pay/${code}`)}`)}
                                            className="w-full h-11 rounded-xl font-bold text-xs"
                                        >
                                            Log In to Pay
                                        </Button>
                                        <p className="text-xs text-text-secondary">
                                            New to KASH?{' '}
                                            <Link
                                                href={`/register?redirect=${encodeURIComponent(`/pay/${code}`)}`}
                                                className="text-primary font-bold hover:underline"
                                            >
                                                Create Account
                                            </Link>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
