'use client';

import React, { useState } from 'react';
import { LinkIcon, Check, Copy, Share2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { orderApi } from '@/services/api/orderApi';
import { formatCurrency } from '@/utils/formatters';

interface CreatePaymentLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: string | number;
        name: string;
        price?: number | string;
    };
}

export const CreatePaymentLinkModal: React.FC<CreatePaymentLinkModalProps> = ({
    isOpen,
    onClose,
    product,
}) => {
    const [price, setPrice] = useState(product.price ? String(product.price) : '');
    const [quantity, setQuantity] = useState('1');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [createdLink, setCreatedLink] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice <= 0) {
            toast.error('Please enter a valid price greater than 0.');
            return;
        }

        const numQty = parseInt(quantity, 10);
        if (isNaN(numQty) || numQty < 1) {
            toast.error('Quantity must be at least 1.');
            return;
        }

        setLoading(true);
        try {
            const res = await orderApi.createPaymentLink({
                product_id: product.id,
                price: numPrice,
                quantity: numQty,
                note: note.trim() || undefined,
            });
            setCreatedLink(res);
            toast.success('Payment link generated!');
        } catch (err: any) {
            toast.error(err?.message || 'Failed to create payment link.');
        } finally {
            setLoading(false);
        }
    };

    const getLinkUrl = () => {
        if (!createdLink) return '';
        if (createdLink.url) return createdLink.url;
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/pay/${createdLink.code}`;
        }
        return `https://kash.cm/pay/${createdLink.code}`;
    };

    const handleCopy = () => {
        const url = getLinkUrl();
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReset = () => {
        setCreatedLink(null);
        setPrice(product.price ? String(product.price) : '');
        setQuantity('1');
        setNote('');
        setCopied(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleReset} title="Generate Payment Link" className="max-w-md">
            <div className="p-6">
                {createdLink ? (
                    <div className="text-center space-y-5">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                            <Sparkles size={28} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black">Link Created Successfully!</h3>
                            <p className="text-xs text-text-secondary mt-1">
                                Share this link with any buyer. They can click it to review details and pay instantly.
                            </p>
                        </div>

                        <div className="p-3 bg-background border border-border rounded-xl flex items-center justify-between gap-2">
                            <span className="text-xs font-mono text-text-secondary truncate flex-1 text-left">
                                {getLinkUrl()}
                            </span>
                            <button
                                onClick={handleCopy}
                                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex-shrink-0"
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-3 text-xs flex justify-between">
                            <span className="text-text-secondary">Total (with 2.6% fee):</span>
                            <span className="font-bold text-primary">{formatCurrency(createdLink.total)}</span>
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={handleCopy} className="flex-1 h-11 text-xs font-bold rounded-xl">
                                {copied ? 'Copied!' : 'Copy Link'}
                            </Button>
                            <Button variant="outline" onClick={handleReset} className="flex-1 h-11 text-xs font-bold rounded-xl">
                                Done
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleCreate} className="space-y-4">
                        <p className="text-xs text-text-secondary">
                            Product: <span className="font-bold text-foreground">{product.name}</span>
                        </p>

                        <div>
                            <label className="text-xs font-bold text-text-secondary block mb-1">Agreed Price (XAF)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                                placeholder="e.g. 5000"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-text-secondary block mb-1">Quantity</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                                placeholder="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-text-secondary block mb-1">Buyer Note (Optional)</label>
                            <input
                                type="text"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                                placeholder="e.g. Special bulk rate offer"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider mt-4"
                        >
                            {loading ? 'Creating...' : 'Create Payment Link'}
                        </Button>
                    </form>
                )}
            </div>
        </Modal>
    );
};
