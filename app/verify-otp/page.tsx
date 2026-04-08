'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowRight, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { authApi } from '@/services/api/authApi';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { motion } from 'framer-motion';

function VerifyOtpContent() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!email) {
            router.push('/login');
        }
    }, [email, router]);

    const handleCodeChange = (text: string, index: number) => {
        const digitsOnly = text.replace(/\D/g, '');

        if (!digitsOnly) {
            const newCode = [...code];
            newCode[index] = '';
            setCode(newCode);
            return;
        }

        if (digitsOnly.length > 1) {
            // Handle paste
            const newCode = [...code];
            const pasted = digitsOnly.slice(0, 6).split('');
            pasted.forEach((digit, offset) => {
                const targetIndex = index + offset;
                if (targetIndex < 6) {
                    newCode[targetIndex] = digit;
                }
            });
            setCode(newCode);
            const nextIndex = Math.min(index + pasted.length, 5);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        const newCode = [...code];
        newCode[index] = digitsOnly;
        setCode(newCode);

        // Auto-focus next input
        if (digitsOnly && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const verificationCode = code.join('');

        if (verificationCode.length !== 6) {
            setError(t('otp.enter6Digits'));
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await authApi.verifyOtp(email, verificationCode);
            setIsSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || t('otp.invalidVerificationCode'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        setResendLoading(true);
        setError(null);
        try {
            await authApi.resendOtp(email);
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
            // Show a simple success mechanism, normally handled by toast in mobile
            const err = "Code resent to " + email;
            setError(err); // Reusing error div as info temporarily

            setTimeout(() => {
                setError(null);
            }, 3000);
        } catch (err: any) {
            setError(t('otp.failedResend'));
        } finally {
            setResendLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <div className="bg-primary/10 p-6 rounded-full inline-block mb-6">
                        <CheckCircle2 size={64} className="text-primary" />
                    </div>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-4">{t('otp.accountVerified')}</h1>
                    <p className="text-text-secondary max-w-sm mx-auto">
                        {t('otp.loginToContinue')}
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md z-10">
                <div className="text-center mb-8">
                    <div className="bg-primary/10 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">📧</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">{t('otp.enterCode')}</h1>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        {t('otp.sentTo')}<br />
                        <strong className="text-foreground">{email}</strong>
                    </p>
                </div>

                <Card className="p-8 shadow-2xl rounded-[3rem] border-none glass">
                    <form onSubmit={handleVerify} className="space-y-6">
                        {error && (
                            <div className="bg-error/10 border border-error/20 text-error text-[10px] p-3 rounded-xl flex items-center gap-2 font-bold uppercase tracking-widest">
                                <ShieldCheck size={14} />
                                {error}
                            </div>
                        )}

                        <div className="flex justify-between gap-2 mb-8">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleCodeChange(e.target.value, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-background focus:outline-none transition-colors
                                        ${digit ? 'border-primary text-primary' : 'border-border border-dashed text-text'}`}
                                    autoComplete="one-time-code"
                                />
                            ))}
                        </div>

                        <Button
                            type="submit"
                            className="w-full rounded-2xl h-14 text-sm font-black group shadow-lg"
                            isLoading={isLoading}
                        >
                            {t('otp.verifyCode')}
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>

                        <div className="flex items-center justify-center gap-2 mt-6">
                            <span className="text-sm text-text-secondary">{t('otp.noCode')}</span>
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={resendLoading}
                                className="text-sm font-bold text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
                            >
                                {resendLoading ? (
                                    <>
                                        <RefreshCw size={14} className="animate-spin" />
                                        {t('otp.sending')}
                                    </>
                                ) : (
                                    t('otp.resendCode')
                                )}
                            </button>
                        </div>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOtpContent />
        </Suspense>
    );
}
