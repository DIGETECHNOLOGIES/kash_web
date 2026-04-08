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
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-6 right-6 z-[100] md:left-auto md:right-6 md:w-96"
                >
                    <div className="bg-surface border border-primary/20 shadow-2xl rounded-[2rem] p-6 relative overflow-hidden backdrop-blur-xl">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />

                        <button
                            onClick={dismissPrompt}
                            className="absolute top-4 right-4 text-text-secondary hover:text-primary transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-start gap-4 mb-6">
                            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
                                <PlusSquare size={32} />
                            </div>
                            <div>
                                <h3 className="font-black italic uppercase italic tracking-tight text-lg leading-tight">
                                    {platform === 'android' ? 'Get KASH on Android' : 'Install KASH Web'}
                                </h3>
                                <p className="text-xs text-text-secondary mt-1 font-medium">
                                    {platform === 'android'
                                        ? 'Download our native app from Play Store for the best experience.'
                                        : 'Install our app for a faster, premium mobile experience.'}
                                </p>
                            </div>
                        </div>

                        {platform === 'ios' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-background/50 p-3 rounded-xl border border-border/40">
                                    <Share size={14} className="text-primary" />
                                    <span>1. Tap the <span className="text-primary italic">Share</span> button at the bottom</span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-background/50 p-3 rounded-xl border border-border/40">
                                    <PlusSquare size={14} className="text-primary" />
                                    <span>2. Select <span className="text-primary italic">Add to Home Screen</span></span>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 mt-6">
                            {platform === 'android' ? (
                                <Button
                                    className="flex-1 rounded-xl h-14 bg-black hover:bg-zinc-900 text-white font-medium border border-zinc-800 shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
                                    onClick={handlePlayStoreRedirect}
                                >
                                    <svg viewBox="30 336.7 120.9 129.2" className="h-6 w-6">
                                        <path fill="#4DB6AC" d="M30 344.9v112.8c0 4.4 3.6 8 8 8 1.1 0 2.1-.2 3.1-.7l65.1-59.7-76.2-60.4z" />
                                        <path fill="#D32F2F" d="M110.1 405.1l36.3-33.3c3.2-2.9 4.4-7.4 3.1-11.5-1.3-4.1-5.1-7-9.4-7H38c-4.4 0-8 3.6-8 8v.2l80.1 43.6z" />
                                        <path fill="#FBC02D" d="M146.4 430c1.3-4.1.1-8.6-3.1-11.5l-36.3-33.3-3.1 2.8-38.9 35.7v.1c0 4.4 3.6 8 8 8h104c4.3 0 8.1-2.9 9.4-7.1z" />
                                        <path fill="#1976D2" d="M107.1 388l42.4 23.1c1.3.7 2.1 2.1 2.1 3.6 0 1.5-.8 2.9-2.1 3.6l-42.4 23.1-4.8-4.4 3.7-3.4 31.7-29-31.7-29-3.7-3.4 4.8-4.2z" />
                                    </svg>
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-[10px] uppercase font-bold text-zinc-400">Get it on</span>
                                        <span className="text-sm font-black tracking-tight">Google Play</span>
                                    </div>
                                </Button>
                            ) : (
                                <Button
                                    className="flex-1 rounded-[1.25rem] h-12 text-xs font-black uppercase italic shadow-lg shadow-primary/20"
                                    onClick={dismissPrompt}
                                >
                                    Got it!
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

