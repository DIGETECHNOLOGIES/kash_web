'use client';

import React from 'react';
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
import { Card } from '@/components/common/Card';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Zap, Store } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { t } = useTranslation();
  const router = useRouter();

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productApi.listProducts({ page_size: 8 }),
  });

  const { data: shopsData, isLoading: isLoadingShops } = useQuery({
    queryKey: ['shops', 'featured'],
    queryFn: () => shopApi.listShops(1, 3),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productApi.listCategories(),
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2rem] bg-secondary px-6 py-16 text-white lg:px-12 lg:py-24 mb-12">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#059669" d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,76.4,-44.7C83.5,-31.3,86.7,-15.7,85.4,-0.8C84,14.1,78.1,28.2,69.2,40.1C60.3,51.9,48.4,61.5,35.3,68.7C22.1,75.9,7.7,80.7,-6.8,79.5C-21.3,78.3,-35.8,71.1,-48.4,61.5C-60.9,51.9,-71.4,40.1,-77.4,26.4C-83.3,12.7,-84.6,-2.8,-80.7,-17.1C-76.8,-31.3,-67.7,-44.2,-55.8,-53.4C-43.8,-62.6,-29,-68,-14.5,-73.8C0,-79.6,14.5,-68.6,44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="primary" className="mb-4 bg-primary/20 text-primary-light border-none">
              <Sparkles className="mr-1 h-3 w-3" /> {t('home.title')}
            </Badge>
            <h1 className="mb-6 text-4xl font-extrabold leading-tight lg:text-7xl">
              Welcome to the <span className="text-primary italic">Professional</span> Marketplace.
            </h1>
            <p className="mb-8 text-lg text-slate-300 lg:text-xl">
              Discover unique products from thousands of verified sellers. Secure payments, fast delivery, and premium support.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="rounded-2xl group" onClick={() => router.push('/products')}>
                {t('onboarding.getStarted')}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" className="rounded-2xl border-slate-700 text-white hover:bg-slate-800" onClick={() => router.push('/shops/create')}>
                {t('shop.createShop')}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mb-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: ShieldCheck, title: 'Verified Shops', desc: 'Every seller is manually verified' },
          { icon: Zap, title: 'Fast Delivery', desc: 'Get your orders in record time' },
          { icon: TrendingUp, title: 'Resell & Earn', desc: 'Start your business without stock' },
          { icon: ShieldCheck, title: 'Secure Payment', desc: 'Protected by KASH Escrow' },
        ].map((feature, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className="flex flex-col items-center rounded-3xl bg-surface p-8 text-center shadow-sm border border-border"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <feature.icon size={28} />
            </div>
            <h3 className="mb-2 font-bold">{feature.title}</h3>
            <p className="text-xs text-text-secondary">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Categories */}
      <section className="mb-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">{t('home.categories')}</h2>
          <Link href="/products">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
              {t('home.viewAll')} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categoriesData?.results?.slice(0, 6).map((category: any) => (
            <Link key={category.id} href={`/products?category=${category.id}`}>
              <Card hoverable className="flex flex-col items-center gap-3 p-6 group">
                <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <LayoutGrid className="text-text-secondary group-hover:text-primary transition-colors" size={24} />
                </div>
                <span className="text-sm font-semibold">{category.name}</span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Shops */}
      <section className="mb-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('home.shops')}</h2>
            <p className="text-sm text-text-secondary mt-1">Buy directly from top-rated verified merchants</p>
          </div>
          <Link href="/shops">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
              {t('home.viewAll')} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoadingShops ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl bg-surface border border-border" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shopsData?.results?.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="mb-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('home.products')}</h2>
            <p className="text-sm text-text-secondary mt-1">Check out our latest arrivals and selected products</p>
          </div>
          <Link href="/products">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
              {t('home.viewAll')} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoadingProducts ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-surface border border-border" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >
            {productsData?.results?.map((product) => (
              <motion.div key={product.id} variants={item}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </MainLayout>
  );
}

function LayoutGrid(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}
