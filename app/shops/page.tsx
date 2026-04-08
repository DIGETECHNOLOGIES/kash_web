'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { shopApi } from '@/services/api/shopApi';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Search, Store, MapPin, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatImageUrl } from '@/utils/formatters';

export default function ShopsPage() {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');

    const { data: shopsData, isLoading } = useQuery({
        queryKey: ['shops', search],
        queryFn: () => shopApi.searchShops(search),
    });

    return (
        <MainLayout>
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-black italic tracking-tighter mb-4 uppercase">
                    {t('settings.verifiedMerchants')}
                </h1>
                <p className="text-text-secondary max-w-xl mx-auto mb-8">
                    {t('settings.verifiedMerchantsDesc')}
                </p>

                <div className="relative max-w-xl mx-auto">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                    <input
                        type="text"
                        placeholder={t('settings.searchShopPlaceholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-16 rounded-[2rem] border border-border bg-surface pl-14 pr-6 text-md font-medium shadow-lg shadow-black/5 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-64 animate-pulse rounded-3xl bg-surface border border-border" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shopsData?.results?.map((shop) => (
                        <motion.div
                            key={shop.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -5 }}
                        >
                            <Link href={`/shops/${shop.id}`}>
                                <Card className="p-0 overflow-hidden h-full flex flex-col group cursor-pointer border-border/60 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5">
                                    <div className="h-32 bg-secondary relative overflow-hidden">
                                        {/* Placeholder for banner */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary opacity-50" />
                                        <div className="absolute bottom-0 left-6 translate-y-1/2">
                                            <div className="h-20 w-20 rounded-2xl bg-surface border-4 border-surface shadow-2xl overflow-hidden flex items-center justify-center relative">
                                                {shop.image ? (
                                                    <img src={formatImageUrl(shop.image)} alt={shop.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                                        <span className="text-4xl font-black italic uppercase text-primary leading-none">
                                                            {shop.name?.charAt(0) || 'K'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-12 p-6 flex flex-col flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{shop.name}</h3>
                                            {shop.verified && (
                                                <ShieldCheck size={18} className="text-primary" />
                                            )}
                                        </div>

                                        <p className="text-sm text-text-secondary line-clamp-2 mb-6 flex-1 italic">
                                            {shop.description || t('settings.defaultShopDesc')}
                                        </p>

                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                                            <div className="flex items-center gap-1.5 text-xs font-black text-text-secondary">
                                                <MapPin size={14} className="text-primary" />
                                                {shop.location}, {shop.region}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs font-bold text-warning">
                                                <Star size={14} className="fill-warning" />
                                                {shop.rating || '4.5'}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </MainLayout>
    );
}
