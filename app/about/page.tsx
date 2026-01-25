'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { ShieldCheck, Truck, Users, Store, Award, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto py-12">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-6">
                        About <span className="text-primary underline decoration-primary/30">KASH</span>
                    </h1>
                    <p className="text-xl text-text-secondary leading-relaxed font-medium">
                        Empowering the next generation of commerce in Cameroon through professional services, secure technology, and verified trust.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    <Card className="p-8 rounded-[2.5rem] bg-primary/5 border-primary/10">
                        <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white mb-6">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-2xl font-black italic uppercase mb-4 tracking-tighter">Our Mission</h3>
                        <p className="text-text-secondary leading-relaxed">
                            To provide a secure, efficient, and professional marketplace where quality products meet verified buyers. We aim to revolutionize how trust is built in the Cameroonian digital economy.
                        </p>
                    </Card>

                    <Card className="p-8 rounded-[2.5rem] bg-secondary text-white border-none shadow-2xl">
                        <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/20">
                            <Globe size={32} />
                        </div>
                        <h3 className="text-2xl font-black italic uppercase mb-4 tracking-tighter">Our Vision</h3>
                        <p className="text-slate-300 leading-relaxed">
                            Becoming the #1 trusted destination for professional commerce in Central Africa, enabling thousands of small businesses to scale through our innovative escrow and logistics network.
                        </p>
                    </Card>
                </div>

                <section className="space-y-12 mb-20">
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase text-center">Why we are <span className="text-primary">Different</span></h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Users, title: 'Verified Only', desc: 'Every merchant undergoes strict ID and physical location verification.' },
                            { icon: Store, title: 'Escrow System', desc: 'Secure payments where funds are only released after you confirm delivery.' },
                            { icon: Truck, title: 'KASH Express', desc: 'Our dedicated logistics network ensures next-day delivery in major cities.' },
                            { icon: Award, title: 'Quality First', desc: 'We pre-screen product categories to ensure only premium goods are listed.' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="flex flex-col items-center text-center p-6 bg-surface rounded-3xl border border-border"
                            >
                                <div className="mb-4 text-primary">
                                    <item.icon size={32} />
                                </div>
                                <h4 className="font-bold mb-2 uppercase tracking-tighter italic">{item.title}</h4>
                                <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <Card className="p-12 rounded-[3rem] bg-surface border-border/60 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-primary/5">
                        <Store size={120} />
                    </div>
                    <h2 className="text-3xl font-black italic uppercase mb-6 tracking-tighter">Ready to <span className="text-primary">Join us?</span></h2>
                    <p className="text-text-secondary mb-8 max-w-xl mx-auto">
                        Whether you are a buyer looking for quality or a merchant ready to scale your professional brand, KASH is built for you.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="h-14 px-8 rounded-2xl bg-primary text-white font-black italic uppercase shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                            Start Shopping
                        </button>
                        <button className="h-14 px-8 rounded-2xl border-2 border-border font-black italic uppercase hover:bg-surface transition-colors">
                            Become a Seller
                        </button>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
