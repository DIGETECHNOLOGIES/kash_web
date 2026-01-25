'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ArrowRight, RefreshCcw } from 'lucide-react';
import { authApi } from '@/services/api/authApi';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { motion } from 'framer-motion';

function OTPContent() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timer, setTimer] = useState(60);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(timer - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const onSubmit = async () => {
        const otp = code.join('');
        if (otp.length < 6) return;

        setIsLoading(true);
        setError(null);
        try {
            await authApi.verifyOtp(email, otp);
            router.push(`/login?email=${encodeURIComponent(email)}&verified=true`);
        } catch (err: any) {
            setError(err.message || 'Verification failed. Invalid code.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        try {
            await authApi.resendOtp(email);
            setTimer(60);
            setCode(['', '', '', '', '', '']);
        } catch (err: any) {
            setError(err.message || 'Failed to resend code.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Verify <span className="text-primary underline decoration-primary/30">Email</span></h1>
                    <p className="text-sm text-text-secondary">We sent a 6-digit code to <strong>{email}</strong></p>
                </div>

                <Card className="p-10 shadow-2xl rounded-[3rem] border-none glass">
                    <div className="flex justify-between gap-2 mb-8">
                        {code.map((digit, i) => (
                            <input
                                key={i}
                                id={`otp-${i}`}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                className="w-12 h-16 rounded-2xl bg-background border border-border text-center text-2xl font-black italic focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="mb-6 bg-error/10 border border-error/20 text-error text-[10px] p-3 rounded-xl flex items-center gap-2 font-bold uppercase tracking-widest">
                            <ShieldCheck size={14} />
                            {error}
                        </div>
                    )}

                    <Button
                        onClick={onSubmit}
                        className="w-full rounded-2xl h-14 text-sm font-black group shadow-lg"
                        isLoading={isLoading}
                        disabled={code.some(d => !d)}
                    >
                        Verify Account
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>

                    <div className="mt-8 text-center">
                        <button
                            onClick={handleResend}
                            disabled={timer > 0}
                            className={`flex items-center justify-center gap-2 mx-auto text-xs font-black uppercase tracking-widest transition-colors ${timer > 0 ? 'text-text-secondary opacity-50' : 'text-primary hover:text-primary-dark'}`}
                        >
                            <RefreshCcw size={16} className={timer > 0 ? '' : 'animate-spin-slow'} />
                            {timer > 0 ? `Resend Code in ${timer}s` : 'Resend Code Now'}
                        </button>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OTPContent />
        </Suspense>
    );
}
