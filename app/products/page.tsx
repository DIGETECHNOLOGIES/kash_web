"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { productApi } from '@/services/api/productApi';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductCard } from '@/components/common/ProductCard';
import { Button } from '@/components/common/Button';
import { Search, Filter, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ProductsContent() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [page, setPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        searchParams.get('category') ? Number(searchParams.get('category')) : null
    );

    useEffect(() => {
        setSearch(searchParams.get('search') || '');
        setSelectedCategory(searchParams.get('category') ? Number(searchParams.get('category')) : null);
    }, [searchParams]);

    const { data: productsData, isLoading } = useQuery({
        queryKey: ['products', page, search, selectedCategory],
        queryFn: () => productApi.listProducts({
            search: search || undefined,
            category: selectedCategory || undefined
        }, page),
    });

    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => productApi.listCategories(),
    });

    return (
        <MainLayout>
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Desktop Sidebar Filters */}
                <aside className="hidden lg:block w-64 space-y-8">
                    <div className="sticky top-24">
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4 ml-1">
                            {t('home.categories')}
                        </h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all ${!selectedCategory ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-primary/5'}`}
                            >
                                All Categories
                            </button>
                            {categoriesData?.results?.map((cat: any) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-primary/5'}`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase">
                            Explore <span className="text-primary underline decoration-primary/30">Market</span>
                        </h1>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                                <input
                                    type="text"
                                    placeholder={t('common.search')}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full h-12 rounded-2xl border border-border bg-surface pl-12 pr-4 text-sm font-bold focus:border-primary focus:outline-none transition-all"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-2xl lg:hidden"
                                onClick={() => setIsFilterOpen(true)}
                            >
                                <SlidersHorizontal size={20} />
                            </Button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {isLoading ? (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-surface border border-border" />
                                ))}
                            </div>
                        ) : productsData?.results?.length === 0 ? (
                            <div className="text-center py-24 bg-surface rounded-[3rem] border border-dashed border-border opacity-50">
                                <p className="text-text-secondary font-black uppercase italic tracking-tighter text-xl">No products match your criteria</p>
                                <Button variant="ghost" className="mt-4 font-bold" onClick={() => { setSearch(''); setSelectedCategory(null); }}>
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            <motion.div
                                layout
                                className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4"
                            >
                                {productsData?.results?.map((product) => (
                                    <motion.div
                                        layout
                                        key={product.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pagination */}
                    {productsData && productsData.count > 20 && (
                        <div className="mt-12 flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={page === 1}
                                onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
                                className="rounded-xl h-12 w-12"
                            >
                                <ChevronLeft size={20} />
                            </Button>
                            <div className="px-6 h-12 flex items-center justify-center rounded-xl bg-surface border border-border font-black text-sm italic italic shadow-inner">
                                {page} / {Math.ceil(productsData.count / 20)}
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={page * 20 >= productsData.count}
                                onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
                                className="rounded-xl h-12 w-12"
                            >
                                <ChevronRight size={20} />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            <AnimatePresence>
                {isFilterOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFilterOpen(false)}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="fixed right-0 top-0 z-[60] h-full w-4/5 max-w-sm bg-surface p-8 shadow-2xl lg:hidden"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black italic tracking-tighter uppercase">Filters</h2>
                                <button onClick={() => setIsFilterOpen(false)} className="rounded-full bg-background p-2">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4 ml-1 italic">
                                        {t('home.categories')}
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => { setSelectedCategory(null); setIsFilterOpen(false); }}
                                            className={`w-full text-left px-4 py-4 rounded-xl text-sm font-bold transition-all ${!selectedCategory ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-background hover:bg-primary/5'}`}
                                        >
                                            All Categories
                                        </button>
                                        {categoriesData?.results?.map((cat: any) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => { setSelectedCategory(cat.id); setIsFilterOpen(false); }}
                                                className={`w-full text-left px-4 py-4 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-background hover:bg-primary/5'}`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </MainLayout>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<MainLayout><div>Loading Products...</div></MainLayout>}>
            <ProductsContent />
        </Suspense>
    );
}
