'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopApi } from '@/services/api/shopApi';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import {
    ChevronLeft,
    Camera,
    Upload,
    CheckCircle2,
    X,
    Save,
    Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

const shopSchema = yup.object().shape({
    name: yup.string().required('Shop name is required'),
    location: yup.string().required('Location is required'),
    region: yup.string().required('Region is required'),
    ownerPhone: yup.string().required('Phone number is required'),
    whatsappNumber: yup.string().required('WhatsApp number is required'),
    description: yup.string(),
});

export default function ShopSettingsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [files, setFiles] = useState<{
        shop: File | null;
        idFront: File | null;
        idBack: File | null;
        owner: File | null;
    }>({
        shop: null,
        idFront: null,
        idBack: null,
        owner: null,
    });

    const [newImages, setNewImages] = useState<File[]>([]);

    const { data: userShop, isLoading } = useQuery({
        queryKey: ['user-shop'],
        queryFn: () => shopApi.userShop(),
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: yupResolver(shopSchema),
    });

    useEffect(() => {
        if (userShop) {
            reset({
                name: userShop.name,
                location: userShop.location,
                region: userShop.region,
                ownerPhone: userShop.ownerPhone,
                whatsappNumber: userShop.whatsappNumber,
                description: userShop.description,
            });
        }
    }, [userShop, reset]);

    const updateMutation = useMutation({
        mutationFn: (data: any) => shopApi.updateShop(userShop!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-shop'] });
            toast.success('Shop updated successfully');
            router.back();
        },
        onError: () => {
            toast.error('Failed to update shop');
        }
    });

    const deleteImageMutation = useMutation({
        mutationFn: (imageId: number) => shopApi.deleteShopImage(userShop!.id, imageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-shop'] });
            toast.success('Image deleted');
        }
    });

    const handleFileChange = (key: keyof typeof files, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFiles({ ...files, [key]: e.target.files[0] });
        }
    };

    const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewImages([...newImages, ...Array.from(e.target.files)]);
        }
    };

    const removeNewImage = (index: number) => {
        setNewImages(newImages.filter((_, i) => i !== index));
    };

    const handleDeleteExistingImage = (imageId: number) => {
        if (window.confirm('Delete this image?')) {
            deleteImageMutation.mutate(imageId);
        }
    };

    const onSubmit = (data: any) => {
        const payload: any = {
            ...data,
            phone_number: data.ownerPhone,
            address: data.location,
        };

        if (files.shop) payload.shop_images = files.shop;
        if (files.idFront) payload.id_card_front = files.idFront;
        if (files.idBack) payload.id_card_back = files.idBack;
        if (files.owner) payload.owner_image = files.owner;

        if (newImages.length > 0) {
            payload.images = newImages;
        }

        updateMutation.mutate(payload);
    };

    if (isLoading || !userShop) return null;

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto pb-20">
                <button onClick={() => router.back()} className="mb-8 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors">
                    <ChevronLeft size={20} /> {t('common.back')}
                </button>

                <header className="mb-12">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Shop <span className="text-primary underline decoration-primary/30">Settings</span></h1>
                    <p className="text-text-secondary">Update your business profile and documents.</p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Basic Info */}
                    <Card className="p-8 rounded-[2rem] border-none shadow-xl">
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-8 italic">Business Profile</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Shop Name</label>
                                <input {...register('name')} className="w-full h-12 rounded-xl bg-background border border-border px-4 font-bold italic focus:border-primary focus:outline-none" />
                                {errors.name && <p className="text-error text-[10px] font-bold">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Location</label>
                                <input {...register('location')} className="w-full h-12 rounded-xl bg-background border border-border px-4 font-bold italic focus:border-primary focus:outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Region</label>
                                <select {...register('region')} className="w-full h-12 rounded-xl bg-background border border-border px-4 font-bold italic focus:border-primary focus:outline-none">
                                    <option value="LT">Littoral</option>
                                    <option value="CE">Centre</option>
                                    <option value="NW">North-West</option>
                                    <option value="SW">South-West</option>
                                    <option value="W">West</option>
                                    <option value="N">North</option>
                                    <option value="EN">Far-North</option>
                                    <option value="AD">Adamawa</option>
                                    <option value="E">East</option>
                                    <option value="S">South</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">WhatsApp</label>
                                <input {...register('whatsappNumber')} className="w-full h-12 rounded-xl bg-background border border-border px-4 font-bold italic focus:border-primary focus:outline-none" />
                            </div>
                        </div>
                        <div className="mt-6 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Description</label>
                            <textarea {...register('description')} className="w-full h-32 rounded-xl bg-background border border-border p-4 font-bold italic focus:border-primary focus:outline-none resize-none" />
                        </div>
                    </Card>

                    {/* Images Section */}
                    <Card className="p-8 rounded-[2rem] border-none shadow-xl">
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-8 italic">Shop Images</h3>

                        <div className="space-y-6">
                            {/* Main Image */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-4 block italic">Main Shop Image</label>
                                <div className="flex items-center gap-6">
                                    <div className="w-40 h-24 rounded-2xl bg-background border border-border overflow-hidden relative">
                                        <img src={files.shop ? URL.createObjectURL(files.shop) : userShop.image} className="w-full h-full object-cover" alt="Shop" />
                                    </div>
                                    <div className="relative">
                                        <Button type="button" variant="outline" className="rounded-xl h-10 text-[10px] font-black uppercase">
                                            <Camera size={16} className="mr-2" /> Change Main Image
                                        </Button>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange('shop', e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Images */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-4 block italic">Gallery Images</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {/* Existing */}
                                    {userShop.additional_images?.map((img) => (
                                        <div key={img.id} className="aspect-square rounded-xl bg-background border border-border overflow-hidden relative group">
                                            <img src={img.image} className="w-full h-full object-cover" alt="Gallery" />
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteExistingImage(img.id)}
                                                className="absolute top-1 right-1 h-6 w-6 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}

                                    {/* New */}
                                    {newImages.map((file, i) => (
                                        <div key={i} className="aspect-square rounded-xl bg-background border border-border overflow-hidden relative group">
                                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="New Gallery" />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(i)}
                                                className="absolute top-1 right-1 h-6 w-6 bg-error text-white rounded-full flex items-center justify-center"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}

                                    <div className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary/50 cursor-pointer relative transition-colors">
                                        <ImageIcon size={24} className="text-text-secondary" />
                                        <span className="text-[8px] font-black uppercase text-text-secondary">Add Image</span>
                                        <input type="file" multiple accept="image/*" onChange={handleAdditionalImagesChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Button type="submit" className="w-full h-16 rounded-2xl text-md font-black uppercase italic shadow-2xl" isLoading={updateMutation.isPending}>
                        <Save size={20} className="mr-2" /> Save Changes
                    </Button>
                </form>
            </div>
        </MainLayout>
    );
}
