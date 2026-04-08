'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi, Review } from '@/services/api/reviewApi';
import { Card } from './Card';
import { Button } from './Button';
import { Star, MessageCircle, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import { formatImageUrl } from '@/utils/formatters';

interface ReviewSectionProps {
    productId?: string | number;
    shopId?: string | number;
}

export function ReviewSection({ productId, shopId }: ReviewSectionProps) {
    const { t } = useTranslation();
    const { isAuthenticated, user } = useAuthStore();
    const queryClient = useQueryClient();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const { data: reviewsData, isLoading } = useQuery({
        queryKey: ['reviews', productId, shopId],
        queryFn: () => reviewApi.listReviews({ product: productId, shop: shopId }),
    });

    const createReviewMutation = useMutation({
        mutationFn: reviewApi.createReview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            queryClient.invalidateQueries({ queryKey: ['product'] });
            queryClient.invalidateQueries({ queryKey: ['shop'] });
            setComment('');
            setRating(5);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;
        createReviewMutation.mutate({
            product: productId,
            shop: shopId,
            rating,
            comment,
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black italic tracking-tighter uppercase">
                    Ratings & <span className="text-primary underline decoration-primary/30">Reviews</span>
                </h2>
                <div className="flex items-center gap-2">
                    <Star size={20} className="text-warning fill-warning" />
                    <span className="text-xl font-black">{reviewsData?.results?.length || 0}</span>
                </div>
            </div>

            {/* Review Form */}
            {isAuthenticated && (
                <Card className="p-8 rounded-[2.5rem] bg-surface border-border/60">
                    <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary mb-6 flex items-center gap-2 italic">
                        <MessageCircle size={16} />
                        Share your experience
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        size={28}
                                        className={star <= rating ? 'text-warning fill-warning' : 'text-border'}
                                    />
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell others what you think..."
                            className="w-full h-32 rounded-2xl border border-border bg-background p-6 text-sm font-bold focus:border-primary focus:outline-none transition-all"
                        />
                        <Button
                            type="submit"
                            disabled={createReviewMutation.isPending || !comment.trim()}
                            className="rounded-xl px-8"
                        >
                            {createReviewMutation.isPending ? 'Posting...' : 'Post Review'}
                        </Button>
                    </form>
                </Card>
            )}

            {/* Review List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="h-32 animate-pulse rounded-3xl bg-surface border border-border" />
                        ))}
                    </div>
                ) : reviewsData?.results?.length === 0 ? (
                    <div className="py-12 text-center opacity-50 italic">
                        No reviews yet. Be the first to share your experience!
                    </div>
                ) : (
                    reviewsData?.results?.map((review: Review) => (
                        <Card key={review.id} className="p-6 rounded-3xl border-border/40 hover:border-primary/20 transition-all shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary overflow-hidden border border-primary/10">
                                    {review.user_image ? (
                                        <img src={formatImageUrl(review.user_image)} alt={review.user_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon size={20} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-bold text-sm">{review.user_name}</h4>
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={12}
                                                    className={i < review.rating ? 'text-warning fill-warning' : 'text-border'}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-text-secondary mb-3">{new Date(review.created_at).toLocaleDateString()}</p>
                                    <p className="text-sm text-text-secondary leading-relaxed font-medium">
                                        {review.comment}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
