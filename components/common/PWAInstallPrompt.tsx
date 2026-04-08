'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { Share, X, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PWAInstallPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [platform, setPlatform] = useState<'ios' | 'android' | null>(null);

    useEffect(() => {
        // Detect platform
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        const isIos = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
        const isAndroid = /android/i.test(userAgent);

        // Detect if it's already in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (isStandalone) return;

        const hasDismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (hasDismissed) return;

        if (isIos) {
            setPlatform('ios');
            setShowPrompt(true);
        } else if (isAndroid) {
            setPlatform('android');
            setShowPrompt(true);
        }
    }, []);

    const dismissPrompt = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-prompt-dismissed', 'true');
    };

    const handlePlayStoreRedirect = () => {
        window.open('https://play.google.com/store/apps/details?id=com.kash.marketplace', '_blank');
        dismissPrompt();
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-background/40 backdrop-blur-md"
                        onClick={dismissPrompt}
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="w-full max-w-sm bg-surface border border-primary/20 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] rounded-[2.5rem] p-8 relative overflow-hidden z-10"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -ml-16 -mb-16" />

                        <button
                            onClick={dismissPrompt}
                            className="absolute top-6 right-6 p-2 rounded-full bg-background/50 text-text-secondary hover:text-primary transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="h-20 w-20 rounded-[2rem] bg-primary flex items-center justify-center text-white mb-6 shadow-2xl shadow-primary/40 rotate-3 animate-pulse">
                                <PlusSquare size={40} />
                            </div>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-text">
                                {platform === 'android' ? 'Get KASH App' : 'Install KASH'}
                            </h3>
                            <p className="text-xs text-text-secondary mt-3 font-bold uppercase tracking-widest leading-relaxed">
                                {platform === 'android'
                                    ? 'Native android experience awaits'
                                    : 'A premium marketplace in your pocket'}
                            </p>
                        </div>

                        {platform === 'ios' && (
                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-4 text-[10px] font-black italic uppercase tracking-widest bg-background/80 p-4 rounded-2xl border border-border/60">
                                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Share size={16} />
                                    </div>
                                    <span>1. Tap the <span className="text-primary underline">Share</span> button below or above</span>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-black italic uppercase tracking-widest bg-background/80 p-4 rounded-2xl border border-border/60">
                                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <PlusSquare size={16} />
                                    </div>
                                    <span>2. Scroll down and select <span className="text-primary underline">Add to Home Screen</span></span>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-4">
                            {platform === 'android' ? (
                                <button
                                    className="w-full rounded-2xl h-16 bg-black hover:bg-zinc-900 text-white font-medium border border-zinc-700 shadow-2xl flex items-center justify-center gap-4 transition-all active:scale-95 group overflow-hidden relative"
                                    onClick={handlePlayStoreRedirect}
                                >
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <img src="/playstore.png" alt="Play Store" className="h-8 w-8" />
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-1">Get it on</span>
                                        <span className="text-xl font-black italic tracking-tighter uppercase italic">Google Play</span>
                                    </div>
                                </button>
                            ) : (
                                <button
                                    className="w-full rounded-2xl h-14 bg-primary hover:bg-primary-dark text-white font-black uppercase italic tracking-widest shadow-xl shadow-primary/30 transition-all active:scale-95"
                                    onClick={dismissPrompt}
                                >
                                    Let&apos;s go!
                                </button>
                            )}
                            <button
                                onClick={dismissPrompt}
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary hover:text-primary transition-colors py-2"
                            >
                                Not now, thanks
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

