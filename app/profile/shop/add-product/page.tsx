'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { productApi } from '@/services/api/productApi';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import {
    ChevronLeft,
    Upload,
    Plus,
    Image as ImageIcon,
    Trash2,
    CheckCircle2,
    Info,
    DollarSign,
    Package,
    Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const productSchema = yup.object().shape({
    name: yup.string().required('Product name is required'),
    description: yup.string().required('Description is required'),
    current_price: yup.string().required('Price is required'),
    category: yup.string().required('Category is required'),
    quantity: yup.number().min(1, 'Quantity must be at least 1').required(),
    min_quantity: yup.number().min(1, 'Min quantity must be at least 1').required(),
});

export default function AddProductPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [images, setImages] = useState<{ file: File; preview: string }[]>([]);

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => productApi.listCategories(),
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(productSchema),
        defaultValues: {
            quantity: 1,
            min_quantity: 1,
        }
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => productApi.createProduct({
            ...data,
            images: images[0].file, // Backend might expect one or multiple
        } as any),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            router.push('/profile/shop');
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const newImages = newFiles.map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            setImages([...images, ...newImages].slice(0, 5)); // Limit to 5
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const onSubmit = (data: any) => {
        if (images.length === 0) {
            alert('Please add at least one product image.');
            return;
        }
        createMutation.mutate(data);
    };

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto pb-20">
                <button onClick={() => router.back()} className="mb-12 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors">
                    <ChevronLeft size={20} /> {t('common.back')}
                </button>

                <header className="mb-12">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Publish <span className="text-primary underline decoration-primary/30">New Product</span></h1>
                    <p className="text-text-secondary">Fill in the details to list your professional items on the KASH network.</p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Form Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="p-8 md:p-10 rounded-[3rem] border-none shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 h-full w-2 bg-primary/20" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-8 italic flex items-center gap-2">
                                <Info size={16} className="text-primary" /> General Specification
                            </h3>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Product Title</label>
                                    <input
                                        {...register('name')}
                                        placeholder="Example: Designer Leather Jacket v2"
                                        className="w-full h-16 rounded-[1.5rem] bg-background border-2 border-border/40 px-8 text-lg font-black italic focus:border-primary focus:outline-none transition-all shadow-inner"
                                    />
                                    {errors.name && <p className="text-xs text-error font-bold mt-1 ml-1">{errors.name.message as string}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Category</label>
                                        <div className="relative">
                                            <Layers className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                                            <select
                                                {...register('category')}
                                                className="w-full h-16 rounded-[1.5rem] bg-background border-2 border-border/40 pl-14 pr-8 text-sm font-bold appearance-none focus:border-primary focus:outline-none transition-all shadow-inner uppercase tracking-wider"
                                            >
                                                <option value="">Select Category</option>
                                                {categories?.results?.map((cat: any) => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Unit Price (FCFA)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-success font-black" />
                                            <input
                                                {...register('current_price')}
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full h-16 rounded-[1.5rem] bg-background border-2 border-border/40 pl-14 pr-8 text-xl font-black italic text-primary focus:border-primary focus:outline-none transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Full Description</label>
                                    <textarea
                                        {...register('description')}
                                        rows={6}
                                        placeholder="Describe the technical details and quality of the item..."
                                        className="w-full rounded-[1.5rem] bg-background border-2 border-border/40 p-8 text-sm font-bold focus:border-primary focus:outline-none transition-all shadow-inner min-h-[200px]"
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-8 md:p-10 rounded-[3rem] border-none shadow-2xl overflow-hidden">
                            <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-8 italic flex items-center gap-2">
                                <Package size={16} className="text-primary" /> Inventory Management
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Stock Quantity</label>
                                    <input
                                        {...register('quantity')}
                                        type="number"
                                        className="w-full h-16 rounded-[1.5rem] bg-background border-2 border-border/40 px-8 text-xl font-black italic focus:border-primary focus:outline-none transition-all shadow-inner"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Min. Order Limit</label>
                                    <input
                                        {...register('min_quantity')}
                                        type="number"
                                        className="w-full h-16 rounded-[1.5rem] bg-background border-2 border-border/40 px-8 text-xl font-black italic focus:border-primary focus:outline-none transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar: Media & Actions */}
                    <div className="space-y-8">
                        <Card className="p-8 rounded-[3rem] border-none shadow-2xl bg-secondary text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[80px] opacity-20" />

                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 italic relative z-10">Product Media</h3>

                            <div className="space-y-6 relative z-10">
                                <div className="grid grid-cols-2 gap-4">
                                    {images.map((img, i) => (
                                        <motion.div
                                            key={i}
                                            className="relative aspect-square rounded-2xl bg-white/10 border border-white/20 overflow-hidden group"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                        >
                                            <img src={img.preview} alt="preview" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="absolute top-2 right-2 h-8 w-8 rounded-xl bg-error/80 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-error shadow-xl"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </motion.div>
                                    ))}

                                    {images.length < 5 && (
                                        <div className="relative aspect-square rounded-2xl border-2 border-dashed border-white/30 hover:border-primary transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer bg-white/5">
                                            <Plus size={32} className="text-slate-400 group-hover:text-primary transition-colors" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Add Image</span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={handleImageChange}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <ImageIcon size={20} className="text-primary shrink-0" />
                                    <p className="text-[10px] font-bold text-slate-400 leading-tight uppercase italic">
                                        Premium products usually have 3+ HD images. Min size 800x800px.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <div className="space-y-4">
                            <Button
                                type="submit"
                                className="w-full h-20 rounded-[2rem] text-lg font-black uppercase italic shadow-2xl shadow-primary/30 group bg-primary"
                                isLoading={createMutation.isPending}
                            >
                                Publish Listing
                                <CheckCircle2 className="ml-2 h-6 w-6 transition-transform group-hover:scale-110" />
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="w-full h-14 rounded-[1.5rem] font-black uppercase italic border-border/60 hover:bg-surface"
                            >
                                Discard Draft
                            </Button>
                        </div>

                        <div className="pt-8 border-t border-border/40">
                            <div className="flex items-center justify-center gap-3 py-4 text-[10px] font-black uppercase tracking-widest text-text-secondary italic">
                                <CheckCircle2 size={16} className="text-primary" />
                                Enterprise Protection Enabled
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
