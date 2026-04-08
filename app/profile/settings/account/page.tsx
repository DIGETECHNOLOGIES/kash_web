'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/api/authApi';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ChevronLeft, User, Camera, Save, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatImageUrl } from '@/utils/formatters';
import { toast } from 'sonner';

export default function AccountSettingsPage() {
    const router = useRouter();
    const { user, updateUser } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        username: user?.username || '',
        email: user?.email || '',
        phone: (user as any)?.number || (user as any)?.phone || '',
        location: (user as any)?.location || '',
        bio: (user as any)?.bio || '',
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('username', form.username);
            if (form.phone) formData.append('number', form.phone);
            if (form.location) formData.append('location', form.location);
            if (form.bio) formData.append('bio', form.bio);
            if (imageFile) formData.append('image', imageFile);

            const updated = await authApi.updateMe(formData);
            updateUser({
                ...(user || {}),
                ...updated,
                number: updated.number || (updated as any).phone || form.phone,
            } as any);
            toast.success('Profile updated successfully!');
            router.back();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const avatarSrc = imagePreview || (user as any)?.image ? formatImageUrl((user as any)?.image) : null;
    const initials = (user?.username || 'U').charAt(0).toUpperCase();

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto pb-20">
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors"
                >
                    <ChevronLeft size={20} /> Back
                </button>

                <header className="mb-10">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">
                        Edit <span className="text-primary underline decoration-primary/30">Profile</span>
                    </h1>
                    <p className="text-text-secondary">Update your personal information and profile picture.</p>
                </header>

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Avatar */}
                    <Card className="p-8 rounded-[2.5rem] flex flex-col items-center gap-6 border-border/40 shadow-sm">
                        <div className="relative">
                            <div className="h-28 w-28 rounded-[2rem] overflow-hidden bg-secondary flex items-center justify-center text-white text-4xl font-black italic ring-4 ring-background shadow-2xl">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : avatarSrc ? (
                                    <img src={avatarSrc} alt={user?.username} className="w-full h-full object-cover" />
                                ) : (
                                    initials
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg border-4 border-background hover:scale-110 transition-transform"
                            >
                                <Camera size={18} />
                            </button>
                        </div>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                            Click camera to change photo
                        </p>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </Card>

                    {/* Form Fields */}
                    <Card className="p-8 rounded-[2.5rem] space-y-6 border-border/40 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-text-secondary italic">Personal Info</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1 flex items-center gap-2">
                                    <User size={12} /> Username
                                </label>
                                <input
                                    type="text"
                                    value={form.username}
                                    onChange={e => setForm({ ...form, username: e.target.value })}
                                    placeholder="Your username"
                                    className="w-full h-14 rounded-2xl bg-background border border-border px-5 text-sm font-bold italic focus:border-primary focus:outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1 flex items-center gap-2">
                                    <Mail size={12} /> Email
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    disabled
                                    className="w-full h-14 rounded-2xl bg-background/50 border border-border/50 px-5 text-sm font-bold italic opacity-50 cursor-not-allowed"
                                />
                                <p className="text-[9px] text-text-secondary ml-1">Email cannot be changed</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1 flex items-center gap-2">
                                    <Phone size={12} /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                    placeholder="677 000 000"
                                    className="w-full h-14 rounded-2xl bg-background border border-border px-5 text-sm font-bold italic focus:border-primary focus:outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1 flex items-center gap-2">
                                    <MapPin size={12} /> Location
                                </label>
                                <input
                                    type="text"
                                    value={form.location}
                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                    placeholder="City, Region"
                                    className="w-full h-14 rounded-2xl bg-background border border-border px-5 text-sm font-bold italic focus:border-primary focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                    </Card>

                    <div className="flex items-center gap-4 bg-primary/5 p-5 rounded-2xl border border-primary/10">
                        <ShieldCheck className="text-primary shrink-0" size={20} />
                        <p className="text-[10px] font-bold text-text-secondary uppercase italic">
                            Your data is protected with <strong className="text-primary">enterprise-grade encryption</strong>
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex-1 rounded-2xl h-14 font-black uppercase italic"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isSaving}
                            className="flex-1 rounded-2xl h-14 font-black uppercase italic shadow-xl shadow-primary/20"
                        >
                            <Save size={18} className="mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
