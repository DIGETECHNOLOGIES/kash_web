'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import {
    User,
    Mail,
    Smartphone,
    MapPin,
    ChevronLeft,
    Camera,
    CheckCircle2,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function EditProfilePage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user } = useAuthStore();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        number: user?.number || '',
        location: user?.location || '',
    });

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast.success('Profile updated successfully!');
            router.back();
        }, 1500);
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
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Edit <span className="text-primary underline decoration-primary/30">Profile</span></h1>
                    <p className="text-text-secondary">Update your personal information to maintain your specialist status.</p>
                </header>

                <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Avatar Area */}
                    <div className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
                        <Card className="p-8 rounded-[3rem] border-none shadow-2xl bg-surface/50 backdrop-blur-md flex flex-col items-center">
                            <div className="relative mb-6">
                                <div className="h-32 w-32 rounded-[2.5rem] bg-background border-4 border-white shadow-xl flex items-center justify-center text-4xl font-black italic text-primary overflow-hidden">
                                    {user?.username?.[0].toUpperCase()}
                                </div>
                                <button
                                    type="button"
                                    className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all border-4 border-white"
                                >
                                    <Camera size={18} />
                                </button>
                            </div>
                            <h3 className="font-black italic uppercase italic tracking-tight mb-1 text-lg">{user?.username}</h3>
                            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Global Specialist Member</p>

                            <div className="mt-8 pt-8 border-t border-border/40 w-full space-y-4">
                                <div className="flex items-center gap-3 text-[10px] font-bold text-text-secondary uppercase">
                                    <ShieldCheck className="text-primary" size={14} /> Account Verified
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-text-secondary uppercase">
                                    <AlertCircle className="text-warning" size={14} /> Change Email Restricted
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Form Area */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="p-8 md:p-12 rounded-[3.5rem] border-none shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 h-full w-2 bg-primary/20" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-10 italic">Personal Identification</h3>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Username</label>
                                    <div className="relative group">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                                        <input
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            placeholder="Specialist Identifier"
                                            className="w-full h-16 rounded-[1.5rem] bg-background border-2 border-border/40 pl-14 pr-8 text-sm font-bold focus:border-primary focus:outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 opacity-60">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                                        <input
                                            value={formData.email}
                                            disabled
                                            className="w-full h-16 rounded-[1.5rem] bg-background border-2 border-border/20 pl-14 pr-8 text-sm font-bold cursor-not-allowed italic"
                                        />
                                    </div>
                                    <p className="text-[8px] font-bold text-text-secondary uppercase mt-1 ml-1">Contact support to change your primary email.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Specialist Phone Number</label>
                                    <div className="relative group">
                                        <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                                        <input
                                            value={formData.number}
                                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                            placeholder="677 000 000"
                                            className="w-full h-16 rounded-[1.5rem] bg-background border-2 border-border/40 pl-14 pr-8 text-sm font-bold focus:border-primary focus:outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Primary Location</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                                        <input
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="Example: Douala, Akwa"
                                            className="w-full h-16 rounded-[1.5rem] bg-background border-2 border-border/40 pl-14 pr-8 text-sm font-bold focus:border-primary focus:outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="flex gap-4 pt-4">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 rounded-2xl h-16 font-black uppercase italic border-border/60 hover:bg-surface"
                            >
                                Discard
                            </Button>
                            <Button
                                type="submit"
                                isLoading={loading}
                                className="flex-[2] rounded-2rem h-16 font-black uppercase italic shadow-2xl shadow-primary/20 bg-primary h-16"
                            >
                                Apply Changes <CheckCircle2 size={20} className="ml-2" />
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
