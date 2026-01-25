'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopApi } from '@/services/api/shopApi';
import { useAuthStore } from '@/store/authStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
    Store,
    ChevronLeft,
    ShieldCheck,
    Plus,
    Package,
    BarChart3,
    Settings,
    Camera,
    Upload,
    CheckCircle2,
    Trash2,
    Edit3,
    MapPin,
    MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const shopSchema = yup.object().shape({
    name: yup.string().required('Shop name is required'),
    location: yup.string().required('Location is required'),
    region: yup.string().required('Region is required'),
    ownerPhone: yup.string().required('Phone number is required'),
    whatsappNumber: yup.string().required('WhatsApp number is required'),
    description: yup.string(),
});

export default function ShopManagePage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [isRegistering, setIsRegistering] = useState(true);
    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        idFront: null,
        idBack: null,
        owner: null,
        shop: null,
    });

    React.useEffect(() => {
        if (user) {
            setIsRegistering(!user.has_shop);
        }
    }, [user]);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(shopSchema),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => shopApi.createShop(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['me'] });
            setIsRegistering(false);
        },
    });

    const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFiles({ ...files, [key]: e.target.files[0] });
        }
    };

    const onSubmit = (data: any) => {
        const formData = {
            ...data,
            phone_number: data.ownerPhone,
            description: data.description || data.location, // Fallback like mobile
            id_card_front: files.idFront,
            id_card_back: files.idBack,
            owner_image: files.owner,
            shop_image: files.shop,
            address: data.location,
            email: user?.email || '',
        };
        createMutation.mutate(formData);
    };

    if (isRegistering) {
        return (
            <MainLayout>
                <div className="max-w-4xl mx-auto pb-20">
                    <button onClick={() => router.back()} className="mb-12 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors">
                        <ChevronLeft size={20} /> {t('common.back')}
                    </button>

                    <header className="mb-12 text-center">
                        <div className="h-20 w-20 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                            <Store size={40} />
                        </div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Create <span className="text-primary underline decoration-primary/30">Your Shop</span></h1>
                        <p className="text-text-secondary">Join Camille&apos;s elite sellers and start your professional business today.</p>
                    </header>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <Card className="p-8 md:p-12 rounded-[3rem] border-none shadow-2xl">
                            <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-8 italic">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Shop Name</label>
                                    <input {...register('name')} placeholder="The Elite Store" className="w-full h-14 rounded-2xl bg-background border border-border px-6 text-sm focus:border-primary focus:outline-none transition-all font-bold italic" />
                                    {errors.name && <p className="text-[10px] text-error font-bold mt-1 ml-1">{errors.name.message as string}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Shop Location</label>
                                    <input {...register('location')} placeholder="Example: Akwa, Blvd de la Liberté" className="w-full h-14 rounded-2xl bg-background border border-border px-6 text-sm focus:border-primary focus:outline-none transition-all font-bold italic" />
                                    {errors.location && <p className="text-[10px] text-error font-bold mt-1 ml-1">{errors.location.message as string}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Region</label>
                                    <select {...register('region')} className="w-full h-14 rounded-2xl bg-background border border-border px-6 text-sm focus:border-primary focus:outline-none transition-all font-bold italic">
                                        <option value="">Select Region</option>
                                        <option value="Litoral">Littoral</option>
                                        <option value="Centre">Centre</option>
                                        <option value="West">West</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Business Phone</label>
                                    <input {...register('ownerPhone')} placeholder="677 000 000" className="w-full h-14 rounded-2xl bg-background border border-border px-6 text-sm focus:border-primary focus:outline-none transition-all font-bold italic" />
                                    {errors.ownerPhone && <p className="text-[10px] text-error font-bold mt-1 ml-1">{errors.ownerPhone.message as string}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Business WhatsApp</label>
                                    <input {...register('whatsappNumber')} placeholder="677 000 000" className="w-full h-14 rounded-2xl bg-background border border-border px-6 text-sm focus:border-primary focus:outline-none transition-all font-bold italic" />
                                    {errors.whatsappNumber && <p className="text-[10px] text-error font-bold mt-1 ml-1">{errors.whatsappNumber.message as string}</p>}
                                </div>
                            </div>
                            <div className="mt-8 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Shop Description</label>
                                <textarea {...register('description')} placeholder="Tell us about your shop..." className="w-full h-32 rounded-2xl bg-background border border-border p-6 text-sm focus:border-primary focus:outline-none transition-all font-bold italic resize-none" />
                            </div>
                        </Card>

                        <Card className="p-8 md:p-12 rounded-[3rem] border-none shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 h-full w-2 bg-primary/20" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-8 italic">Verification Documents</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { key: 'idFront', label: 'ID Front', icon: ShieldCheck },
                                    { key: 'idBack', label: 'ID Back', icon: ShieldCheck },
                                    { key: 'owner', label: 'Owner Photo', icon: Camera },
                                    { key: 'shop', label: 'Store Front', icon: Upload }
                                ].map((item) => (
                                    <div key={item.key} className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary block text-center italic">{item.label}</label>
                                        <div className="relative group">
                                            <div className={`aspect-[4/3] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${files[item.key] ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                                {files[item.key] ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <CheckCircle2 size={32} className="text-primary" />
                                                        <span className="text-[10px] font-bold text-primary truncate max-w-[100px]">{files[item.key]!.name}</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <item.icon size={32} className="text-text-secondary group-hover:text-primary transition-colors" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Upload</span>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => handleFileChange(item.key, e)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <div className="flex items-center gap-4 bg-primary/5 p-6 rounded-3xl border border-primary/10">
                            <ShieldCheck className="text-primary shrink-0" size={24} />
                            <p className="text-[10px] font-bold text-text-secondary leading-relaxed uppercase italic">
                                By submitting, you agree to Camille&apos;s Merchant Terms. Your shop will be manually reviewed within 24-48 hours.
                                <br /><strong className="text-primary">KASH Marketplace protects your business with enterprise-grade security.</strong>
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-16 rounded-2xl text-md font-black uppercase italic shadow-2xl shadow-primary/20 group"
                            isLoading={createMutation.isPending}
                        >
                            Launch My Enterprise
                            <CheckCircle2 className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
                        </Button>
                    </form>
                </div>
            </MainLayout>
        );
    }

    // Dashboard View (if user has shop)
    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto pb-20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                    <div className="flex items-center gap-6">
                        <div className="h-20 w-20 rounded-[1.5rem] bg-secondary flex items-center justify-center text-primary shadow-2xl ring-4 ring-background">
                            <Store size={40} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black italic tracking-tighter uppercase italic">Elite Dashboard</h1>
                                <Badge className="bg-success/20 text-success border-none italic font-black uppercase text-[10px]">Verified Store</Badge>
                            </div>
                            <p className="text-text-secondary font-medium uppercase text-[10px] tracking-[0.2em] italic">Manage your marketplace empire</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="rounded-2xl h-12 border-border/60 font-black uppercase italic text-xs">
                            <Settings size={18} className="mr-2" /> Shop Settings
                        </Button>
                        <Button onClick={() => router.push('/profile/shop/add-product')} className="rounded-2xl h-12 font-black uppercase italic text-xs shadow-xl shadow-primary/20">
                            <Plus size={18} className="mr-2" /> Add Product
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Revenue', value: '1,250,000 F', icon: BarChart3, color: 'text-success', bg: 'bg-success/10' },
                        { label: 'Active Orders', value: '24', icon: Package, color: 'text-info', bg: 'bg-info/10' },
                        { label: 'Total Products', value: '48', icon: Store, color: 'text-primary', bg: 'bg-primary/10' },
                        { label: 'Customer Rating', value: '4.9', icon: CheckCircle2, color: 'text-warning', bg: 'bg-warning/10' },
                    ].map((stat, i) => (
                        <Card key={i} className="p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all duration-500 border-none">
                            <div className={`h-16 w-16 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/20 transition-transform group-hover:scale-110`}>
                                <stat.icon size={32} />
                            </div>
                            <span className="text-2xl font-black italic tracking-tighter mb-1">{stat.value}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{stat.label}</span>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Orders */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase">Recent <span className="text-primary underline decoration-primary/30">Orders</span></h2>
                            <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-primary">View All Details</Button>
                        </div>

                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <Card key={i} className="p-6 rounded-[2rem] border-border/40 shadow-sm hover:border-primary/30 transition-all group cursor-pointer hover:shadow-lg">
                                    <div className="flex items-center gap-6">
                                        <div className="h-14 w-14 rounded-2xl bg-background flex items-center justify-center text-text-secondary border border-border/60">
                                            <Package size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="font-bold text-sm uppercase tracking-tight italic">Order #7742{i}</h4>
                                                <Badge variant="info" className="text-[8px] italic font-black">NEW SHIPMENT</Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-text-secondary uppercase">
                                                <span>2 items</span>
                                                <span className="h-1 w-1 rounded-full bg-border" />
                                                <span className="text-primary font-black italic">45,000 FCFA</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="rounded-xl"><MessageSquare size={18} /></Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase italic">Quick <span className="text-primary underline decoration-primary/30">Manage</span></h2>
                        <Card className="p-8 rounded-[2.5rem] bg-secondary text-white relative overflow-hidden shadow-2xl border-none">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[80px] opacity-20" />
                            <div className="space-y-6 relative z-10">
                                <Button className="w-full h-14 rounded-2xl font-black uppercase italic shadow-lg shadow-primary/20 bg-primary">
                                    Inventory Review
                                </Button>
                                <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase italic border-white/20 text-white hover:bg-white/10">
                                    Analytics Hub
                                </Button>
                                <div className="pt-6 border-t border-white/10 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">KASH BUSINESS SUITE 2.0</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
