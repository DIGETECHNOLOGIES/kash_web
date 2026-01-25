'use client';

import React from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import {
    CheckCircle2,
    ShoppingBag,
    ArrowRight,
    ShieldCheck,
    PartyPopper,
    Package,
    Calendar,
    Truck
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CheckoutSuccessPage() {
    return (
        <MainLayout>
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="max-w-2xl w-full text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="mb-8"
                    >
                        <div className="h-32 w-32 rounded-[3.5rem] bg-success/10 border-4 border-success/20 flex items-center justify-center text-success mx-auto relative shadow-2xl">
                            <CheckCircle2 size={80} className="relative z-10" />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-success rounded-[3.5rem] blur-xl"
                            />
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase mb-4"
                    >
                        Order <span className="text-primary underline decoration-primary/30">Confirmed!</span>
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-text-secondary text-lg font-medium mb-12 max-w-lg mx-auto"
                    >
                        Thank you for building your enterprise with KASH. Your order has been placed successfully and is being prepared for delivery.
                    </motion.p>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
                    >
                        <Card className="p-8 rounded-[3rem] border-none shadow-xl bg-surface/50 backdrop-blur-md flex flex-col items-center group hover:bg-white transition-all">
                            <Package size={40} className="text-primary mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-sm font-black uppercase tracking-tight mb-2">Order Tracking</h3>
                            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-6">Track your items in real-time</p>
                            <Link href="/profile/orders" className="w-full">
                                <Button variant="outline" className="w-full rounded-2xl h-12 font-black uppercase italic italic">View Orders</Button>
                            </Link>
                        </Card>

                        <Card className="p-8 rounded-[3rem] border-none shadow-xl bg-surface/50 backdrop-blur-md flex flex-col items-center group hover:bg-white transition-all">
                            <ShoppingBag size={40} className="text-primary mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-sm font-black uppercase tracking-tight mb-2">Continue Shopping</h3>
                            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-6">Discover more elite products</p>
                            <Link href="/products" className="w-full">
                                <Button className="w-full rounded-2xl h-12 font-black uppercase italic shadow-lg shadow-primary/20">Marketplace</Button>
                            </Link>
                        </Card>
                    </motion.div>

                    {/* Logistics Info Card */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card className="p-10 rounded-[3rem] border-none shadow-2xl bg-secondary text-white relative overflow-hidden text-left">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2" />

                            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                <div className="h-20 w-20 rounded-[2rem] bg-white/10 flex items-center justify-center text-primary shadow-2xl">
                                    <Truck size={40} className="animate-pulse" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h4 className="text-xl font-black italic uppercase tracking-tighter mb-1">Logistics Update</h4>
                                    <p className="text-slate-400 text-sm font-medium">Estimated arrival in <strong>24 - 48 hours</strong> to your selected destination in Akwa.</p>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-widest">
                                    <ShieldCheck size={14} className="text-primary" /> KASH Secured
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </MainLayout>
    );
}
