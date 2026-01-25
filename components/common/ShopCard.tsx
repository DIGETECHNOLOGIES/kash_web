'use client';

import React from 'react';
import Link from 'next/link';
import { Store, MapPin, Star, ShieldCheck } from 'lucide-react';
import { Shop } from '@/types';
import { Card } from './Card';

interface ShopCardProps {
    shop: Shop;
}

export function ShopCard({ shop }: ShopCardProps) {
    return (
        <Link href={`/shops/${shop.slug}`}>
            <Card className="p-0 overflow-hidden h-full flex flex-col group cursor-pointer border-border/60 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5">
                <div className="h-32 bg-secondary relative overflow-hidden">
                    {shop.image ? (
                        <img src={shop.image} alt={shop.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary opacity-50" />
                    )}
                    <div className="absolute bottom-0 left-6 translate-y-1/2">
                        <div className="h-20 w-20 rounded-2xl bg-surface border-4 border-surface shadow-lg overflow-hidden flex items-center justify-center text-primary relative">
                            {shop.image ? (
                                <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
                            ) : (
                                <Store size={32} />
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
                        {shop.location}, {shop.region}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-xs font-black text-text-secondary">
                            <MapPin size={14} className="text-primary" />
                            {shop.location}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-warning">
                            <Star size={14} className="fill-warning" />
                            {shop.average_rating?.toFixed(1) || '0.0'} ({shop.review_count || 0})
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
