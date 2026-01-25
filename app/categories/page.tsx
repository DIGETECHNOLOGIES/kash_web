'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { productApi } from '@/services/api/productApi';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { LayoutGrid, ShoppingBag, Laptop, Shirt, Footprints, Watch, Utensils, Home, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CategoriesPage() {
    const { t } = useTranslation();

    const { data: categoriesData, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => productApi.listCategories(),
    });

    // Simple icon mapping based on common category names
    const getIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('electro')) return Laptop;
        if (n.includes('cloth') || n.includes('fashion')) return Shirt;
        if (n.includes('shoe') || n.includes('foot')) return Footprints;
        if (n.includes('watch') || n.includes('jewel')) return Watch;
        if (n.includes('food') || n.includes('drink')) return Utensils;
        if (n.includes('home') || n.includes('furnit')) return Home;
        if (n.includes('beauty') || n.includes('care')) return Sparkles;
        return ShoppingBag;
    };

    return (
        <MainLayout>
            <div className="mb-12">
                <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">
                    Browse <span className="text-primary underline decoration-primary/30">Categories</span>
                </h1>
                <p className="text-text-secondary">Find exactly what you&apos;re looking for by browsing our curated collections.</p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="aspect-square animate-pulse rounded-[2.5rem] bg-surface border border-border" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categoriesData?.results?.map((category: any) => {
                        const Icon = getIcon(category.name);
                        return (
                            <motion.div
                                key={category.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link href={`/products?category=${category.id}`}>
                                    <Card className="aspect-square flex flex-col items-center justify-center gap-6 rounded-[2.5rem] border-2 border-border/50 hover:border-primary/50 group transition-all duration-300">
                                        <div className="h-20 w-20 rounded-[1.5rem] bg-background flex items-center justify-center text-text-secondary group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 shadow-inner">
                                            <Icon size={40} />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-lg font-black italic uppercase tracking-tighter group-hover:text-primary transition-colors">
                                                {category.name}
                                            </h3>
                                            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">
                                                Explore Collection
                                            </p>
                                        </div>
                                    </Card>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </MainLayout>
    );
}
