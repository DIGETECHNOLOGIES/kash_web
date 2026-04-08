'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { productApi } from '@/services/api/productApi';
import { shopApi } from '@/services/api/shopApi';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductCard } from '@/components/common/ProductCard';
import { ShopCard } from '@/components/common/ShopCard';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';

export default function HomePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: homeData, isLoading, refetch } = useQuery({
    queryKey: ['home', 'dashboard'],
    queryFn: async () => {
      const [catsRes, shopsRes, productsRes] = await Promise.all([
        productApi.listCategories(),
        shopApi.listShops(1, 10),
        productApi.listProducts({ page_size: 20 }),
      ]);

      return {
        categories: catsRes.results || [],
        shops: shopsRes.results || [],
        products: productsRes.results || [],
      };
    },
  });

  const categories = homeData?.categories || [];
  const shops = homeData?.shops || [];
  const products = homeData?.products || [];

  const filteredProducts = selectedCategory
    ? products.filter((p: any) => String(p.category_name || p.category) === selectedCategory || String(p.category) === selectedCategory)
    : products;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <MainLayout>
      <div className="max-w-screen-xl mx-auto">
        {/* Hero Section - Matched to Mobile Design */}
        <div className="mb-8 px-2 md:px-0">
          <div className="relative overflow-hidden rounded-3xl bg-primary p-6 md:p-10 text-white shadow-lg min-h-[180px] flex items-center">
            <div className="relative z-10 max-w-lg">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="mb-4 text-3xl font-black md:text-6xl italic uppercase tracking-tighter leading-none">
                  {t('onboarding.slide1Title') || 'Welcome to KASH'}
                </h1>
                <p className="mb-8 text-base opacity-90 md:text-xl font-medium italic max-w-md">
                  {t('onboarding.slide1Description') || 'Discover the best products and shops near you.'}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="surface"
                    size="lg"
                    className="rounded-2xl font-black text-primary px-8 h-14 uppercase italic tracking-widest shadow-xl shadow-black/10"
                    onClick={() => router.push('/products')}
                  >
                    {t('onboarding.getStarted') || 'Start Shopping'}
                  </Button>
                  {!user?.has_shop && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded-2xl border-white/40 text-white hover:bg-white/10 px-8 h-14 uppercase italic tracking-widest"
                      onClick={() => router.push('/shops/create')}
                    >
                      {t('shop.createShop') || 'Start Selling'}
                    </Button>
                  )}
                </div>
              </motion.div>
            </div>
            {/* Decorative Icon like Mobile */}
            <div className="absolute -bottom-10 -right-10 opacity-20 rotate-[-15deg] pointer-events-none hidden md:block">
              <ShoppingBag size={200} />
            </div>
          </div>
        </div>

        {/* Categories - Horizontal Scroll matched to mobile */}
        <section className="mb-10">
          <h2 className="px-4 text-lg font-bold mb-4">{t('home.categories')}</h2>
          <div className="flex overflow-x-auto pb-4 px-4 gap-3 no-scrollbar scroll-smooth">
            {categories.map((category: any) => {
              const isSelected = selectedCategory === category.name;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(isSelected ? null : category.name)}
                  className={`
                    flex-shrink-0 px-8 py-3 rounded-full text-sm font-black transition-all duration-300 border uppercase italic tracking-tighter
                    ${isSelected
                      ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105'
                      : 'bg-surface dark:bg-surface-dark border-border dark:border-border-dark text-text dark:text-text-dark hover:border-primary/50 hover:bg-primary/5'}
                  `}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* Featured Shops */}
        <section className="mb-12 px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Featured <span className="text-primary underline decoration-primary/30">Shops</span></h2>
            <Link href="/shops" className="text-sm font-black text-primary hover:underline uppercase italic">
              {t('home.viewAll')}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-surface dark:bg-surface-dark border border-border dark:border-border-dark" />
              ))
            ) : (
              shops.slice(0, 3).map((shop: any) => (
                <ShopCard key={shop.id} shop={shop} />
              ))
            )}
          </div>
        </section>

        {/* Featured Products */}
        <section className="mb-12 px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Hot <span className="text-primary underline decoration-primary/30">Deals</span></h2>
            <Link href="/products" className="text-sm font-black text-primary hover:underline uppercase italic">
              {t('home.viewAll')}
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {Array(10).fill(0).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-xl bg-surface dark:bg-surface-dark border border-border dark:border-border-dark" />
              ))}
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
            >
              {filteredProducts.map((product: any) => (
                <motion.div key={product.id} variants={item}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </MainLayout>
  );
}
