import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Heart, Store, Star } from 'lucide-react';
import { Product } from '@/types';
import { Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { useCartStore } from '@/store/cartStore';

interface ProductCardProps {
    product: Product;
    onAddToCart?: (product: Product) => void;
    onPress?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onPress }: ProductCardProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const { addItem } = useCartStore();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onAddToCart) {
            onAddToCart(product);
        } else {
            addItem(product);
        }
    };

    return (
        <Card
            className="group relative overflow-hidden p-0 h-full flex flex-col"
            hoverable
        >
            <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden block">
                <img
                    src={product.images || 'https://via.placeholder.com/400'}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <button
                    className="absolute right-3 top-3 rounded-full bg-white/80 p-2 text-text-secondary backdrop-blur-sm transition-colors hover:text-error dark:bg-black/50"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Handle wishlist
                    }}
                >
                    <Heart size={18} />
                </button>
                {product.discount && (
                    <Badge variant="error" className="absolute left-3 top-3">
                        -{product.discount}%
                    </Badge>
                )}
            </Link>

            <div className="flex flex-col flex-1 p-4">
                <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">{product.category}</span>
                    <Link
                        href={`/shops/${product.shopSlug}`}
                        className="text-[10px] text-text-secondary hover:text-primary flex items-center gap-1 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Store size={10} />
                        {product.shopName}
                    </Link>
                </div>
                <Link href={`/products/${product.slug}`}>
                    <h3 className="mb-0.5 line-clamp-1 text-sm font-semibold group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                </Link>

                <div className="mb-2 flex items-center gap-1">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={10}
                                className={i < Math.round(product.average_rating || 0) ? 'text-warning fill-warning' : 'text-border'}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] font-bold text-text-secondary">({product.review_count || 0})</span>
                </div>

                <div className="mt-auto flex items-end justify-between">
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-primary">{product.price.toLocaleString()} FCFA</span>
                        {product.previousPrice && (
                            <span className="text-xs text-text-secondary line-through">{product.previousPrice.toLocaleString()} FCFA</span>
                        )}
                    </div>
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={handleAddToCart}
                        className="rounded-xl h-9 w-9 p-0"
                    >
                        <ShoppingCart size={16} />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
