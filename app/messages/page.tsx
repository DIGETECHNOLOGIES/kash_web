'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { messagingApi } from '@/services/api/messagingApi';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import {
    Search,
    Send,
    Image as ImageIcon,
    MessageSquare,
    ChevronLeft,
    MoreVertical,
    Phone,
    Smile,
    Paperclip,
    Mic,
    CheckCheck,
    Check,
    X,
    FilePlus,
    ShoppingCart,
    Bell,
    Video,
    Plus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatImageUrl, formatCurrency } from '@/utils/formatters';
import { Modal } from '@/components/common/Modal';
import { shopApi } from '@/services/api/shopApi';
import { productApi } from '@/services/api/productApi';
import { orderApi } from '@/services/api/orderApi';
import { Button } from '@/components/common/Button';
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import { toast } from 'sonner';
import { useQueryClient as useReactQueryClient } from '@tanstack/react-query';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Conversation {
    id: string;
    otherParticipant?: {
        id?: string;
        name?: string;
        username?: string;
        image?: string | null;
    };
    lastMessage?: { content?: string; timestamp?: string };
    updatedAt?: string;
    createdAt?: string;
    unreadCount?: number;
    messages?: Message[];
    selfRole?: 'BUYER' | 'SHOP';
}

interface Message {
    id: string;
    content?: string;
    image?: string | null;
    sender?: string | number;
    sender_username?: string;
    sender_display_name?: string;
    sender_image?: string | null;
    sent_as_shop?: any;
    timestamp?: string;
    is_read?: boolean;
    replied_to_data?: {
        id: string;
        sender_username?: string;
        content?: string;
        image?: string | null;
    } | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatTime(ts?: string) {
    if (!ts) return '';
    return format(new Date(ts), 'HH:mm');
}

function formatDate(ts: string, t: any) {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return t('messages.today');
    if (diffDays === 1) return t('messages.yesterday');
    if (diffDays < 7) return format(d, 'EEEE');
    return format(d, 'dd MMM yyyy');
}

function ConversationAvatar({ participant, size = 48 }: { participant?: Conversation['otherParticipant'], size?: number }) {
    const name = participant?.name || participant?.username || '?';
    const initial = name.charAt(0).toUpperCase();
    const colors = ['#25D366', '#128C7E', '#34B7F1', '#075E54', '#53bdeb'];
    const colorIdx = name.charCodeAt(0) % colors.length;

    if (participant?.image) {
        return (
            <img
                src={formatImageUrl(participant.image)}
                alt={name}
                style={{ width: size, height: size }}
                className="rounded-full object-cover flex-shrink-0"
            />
        );
    }

    return (
        <div
            style={{ width: size, height: size, background: colors[colorIdx] }}
            className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-base"
        >
            {initial}
        </div>
    );
}

function buildOrderTag(order: any): string {
    const code = String(order?.orderCode || order?.order_code || order?.code || order?.id || '---');
    const id = String(order?.id || '');
    return `[Order #${code} (${id})] `;
}

function buildProductTag(product: any): string {
    const name = String(product?.name || 'Product');
    const id = String(product?.id || '');
    return `[Product #${name} (${id})] `;
}

function extractTagSummary(tag: string): { kind: 'order' | 'product' | 'other'; label: string } {
    const trimmed = String(tag || '').trim();
    if (trimmed.startsWith('[Order #')) {
        const code = trimmed.match(/\[Order\s+#([^\(\]]+)/i)?.[1]?.trim();
        return { kind: 'order', label: code ? `Order #${code}` : 'Order' };
    }
    if (trimmed.startsWith('[Product #')) {
        const name = trimmed.match(/\[Product\s+#([^\(\]]+)/i)?.[1]?.trim();
        return { kind: 'product', label: name ? `Product: ${name}` : 'Product' };
    }
    return { kind: 'other', label: 'Attachment' };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MessagesPage() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');
    const [search, setSearch] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeRoleTab, setActiveRoleTab] = useState<'all' | 'BUYER' | 'SHOP'>('all');
    const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [pendingTag, setPendingTag] = useState<string | null>(null);
    const [sendAsShopIdOverride, setSendAsShopIdOverride] = useState<string | null>(null);
    const [myShopId, setMyShopId] = useState<string | null>(null);

    const didInitFromParamsRef = useRef(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    // Invoice States
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [shopProducts, setShopProducts] = useState<any[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [quantity, setQuantity] = useState(1);
    const [invoiceTotal, setInvoiceTotal] = useState(0);
    const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // ── Data fetching ─────────────────────────────────────────────────────────
    const { data: conversationsData, isLoading: isLoadingList } = useQuery({
        queryKey: ['conversations'],
        queryFn: () => messagingApi.listConversations(),
        refetchInterval: 10000,
    });

    const { data: activeConversation, isLoading: isLoadingChat } = useQuery({
        queryKey: ['conversation', selectedId],
        queryFn: () => messagingApi.getConversationById(selectedId!),
        enabled: !!selectedId,
        refetchInterval: 5000,
    });

    const sendMutation = useMutation({
        mutationFn: (data: { content?: string; image?: File; send_as_shop_id?: string | number }) =>
            messagingApi.sendMessage(selectedId!, { content: data.content, image: data.image, send_as_shop_id: data.send_as_shop_id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversation', selectedId] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            setInputText('');
            setImageFile(null);
            setImagePreview(null);
        },
    });

    useEffect(() => {
        if (!user?.has_shop) return;
        let cancelled = false;
        shopApi.userShop()
            .then((shop) => {
                if (cancelled) return;
                if (shop?.id) setMyShopId(String(shop.id));
            })
            .catch(() => { });
        return () => {
            cancelled = true;
        };
    }, [user?.has_shop]);

    // ── Auto-scroll ───────────────────────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversation?.messages]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleSelectConversation = useCallback((id: string) => {
        setSelectedId(id);
        setMobileView('chat');
        // Mark as read
        messagingApi.markAsRead(id).catch(() => { });
    }, []);

    // ── Init from URL params (match mobile behavior) ───────────────────────
    useEffect(() => {
        if (didInitFromParamsRef.current) return;
        didInitFromParamsRef.current = true;

        const convoId = searchParams.get('convo');
        const shopId = searchParams.get('shop') || searchParams.get('shopId');
        const recipientId = searchParams.get('recipientId');
        const roleParam = (searchParams.get('role') || searchParams.get('as'))?.toUpperCase();
        const sendAsShopId = searchParams.get('sendAsShopId') || searchParams.get('send_as_shop_id');
        const orderId = searchParams.get('orderId');
        const productId = searchParams.get('productId');
        const initialMessage = searchParams.get('initialMessage');

        if (sendAsShopId) setSendAsShopIdOverride(String(sendAsShopId));

        const resolveInitialTag = async (): Promise<string | null> => {
            if (initialMessage) return String(initialMessage);
            if (orderId) {
                try {
                    const order = await orderApi.getOrderById(orderId);
                    return buildOrderTag(order);
                } catch {
                    return `[Order #--- (${orderId})] `;
                }
            }
            if (productId) {
                try {
                    const product = await productApi.getProductById(productId);
                    return buildProductTag(product);
                } catch {
                    return `[Product #Product (${productId})] `;
                }
            }
            return null;
        };

        (async () => {
            const tag = await resolveInitialTag();
            if (tag) setPendingTag(tag);

            if (convoId) {
                handleSelectConversation(String(convoId));
                return;
            }

            const isShopConversation = !!shopId;
            const targetId = String(shopId || recipientId || '').trim();
            if (!targetId || targetId === 'undefined' || targetId === 'null') return;

            const inferredRole: 'BUYER' | 'SHOP' =
                roleParam === 'SHOP' || roleParam === 'SELLER'
                    ? 'SHOP'
                    : sendAsShopId
                        ? 'SHOP'
                        : 'BUYER';

            try {
                const convo = await messagingApi.startConversation(targetId, inferredRole, isShopConversation);
                handleSelectConversation(String(convo.id));
                router.replace(`/messages?convo=${convo.id}`);
            } catch (error) {
                console.error('Failed to start conversation from params', error);
                toast.error('Could not open chat');
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, handleSelectConversation, router]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!selectedId) return;

        const shouldAttachTag = !!pendingTag && !imageFile;
        const baseText = inputText.trim();
        const fullText = shouldAttachTag ? `${pendingTag}\n${baseText}`.trim() : baseText;

        if (!fullText && !imageFile && !pendingTag) return;

        const sendAsShopId =
            sendAsShopIdOverride || (activeConversation?.selfRole === 'SHOP' ? myShopId : null);

        sendMutation.mutate({
            content: fullText || (shouldAttachTag ? String(pendingTag).trim() : undefined),
            image: imageFile || undefined,
            send_as_shop_id: sendAsShopId || undefined,
        });

        if (shouldAttachTag) setPendingTag(null);
    };

    const renderTaggedMessageContent = (content: string, isOwn: boolean) => {
        const parts = String(content).split(/(\[(?:Order|Product) #[^\]]+\])/g);
        return parts.map((part, index) => {
            const orderMatch = part?.match?.(/\[Order #([A-Z0-9-]+)(?:\s+\(([^)]+)\))?\]/i);
            if (orderMatch) {
                const code = orderMatch[1];
                const id = orderMatch[2] || code;
                return (
                    <button
                        key={`order-${index}`}
                        type="button"
                        onClick={() => router.push(`/profile/orders/${id}`)}
                        className={cn(
                            'mt-1 mb-2 w-full text-left rounded-2xl border px-4 py-3 transition-colors',
                            isOwn ? 'border-white/25 bg-white/15 hover:bg-white/20' : 'border-primary/15 bg-primary/5 hover:bg-primary/10'
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <ShoppingCart size={18} className={cn(isOwn ? 'text-white' : 'text-primary')} />
                            <span className={cn('text-sm font-black italic', isOwn ? 'text-white' : 'text-primary')}>
                                {t('order.orderNumber') || 'Order'} #{code}
                            </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                            <span className={cn('text-xs font-bold uppercase tracking-widest', isOwn ? 'text-white/80' : 'text-primary')}>
                                {t('order.viewFullDetails') || 'View details'}
                            </span>
                            <ChevronLeft size={16} className={cn('rotate-180', isOwn ? 'text-white/80' : 'text-primary')} />
                        </div>
                    </button>
                );
            }

            const productMatch = part?.match?.(/\[Product #(.+?)(?:\s+\(([^)]+)\))?\]/i);
            if (productMatch) {
                const productName = productMatch[1];
                const productId = productMatch[2];
                return (
                    <button
                        key={`product-${index}`}
                        type="button"
                        onClick={() => (productId ? router.push(`/products/${productId}`) : undefined)}
                        className={cn(
                            'mt-1 mb-2 w-full text-left rounded-2xl border px-4 py-3 transition-colors',
                            isOwn ? 'border-white/25 bg-white/15 hover:bg-white/20' : 'border-primary/15 bg-primary/5 hover:bg-primary/10'
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <ShoppingCart size={18} className={cn(isOwn ? 'text-white' : 'text-primary')} />
                            <span className={cn('text-sm font-black italic', isOwn ? 'text-white' : 'text-primary')}>
                                Product: {productName}
                            </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                            <span className={cn('text-xs font-bold uppercase tracking-widest', isOwn ? 'text-white/80' : 'text-primary')}>
                                View product details
                            </span>
                            <ChevronLeft size={16} className={cn('rotate-180', isOwn ? 'text-white/80' : 'text-primary')} />
                        </div>
                    </button>
                );
            }

            return part ? (
                <span key={`text-${index}`}>{part}</span>
            ) : null;
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const fetchShopProducts = async () => {
        if (!user?.has_shop) return;
        try {
            setIsLoadingProducts(true);
            const shop = await shopApi.userShop();
            if (shop?.id) {
                const res = await productApi.listProducts({ shop: Number(shop.id) });
                setShopProducts(res.results || []);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error(t('order.loadFailed'));
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const handleCreateInvoice = async () => {
        if (!selectedProduct || !selectedId || !otherParticipant) return;
        try {
            setIsSubmittingInvoice(true);
            await orderApi.createInvoice({
                product_id: selectedProduct.id,
                buyer_identifier: otherParticipant.id || otherParticipant.username || '',
                quantity: quantity,
                total: invoiceTotal,
            });
            toast.success(t('order.invoiceCreated'));
            setShowInvoiceModal(false);
            // Optionally send a message about the invoice
            sendMutation.mutate({ content: `[Invoice Shared: ${selectedProduct.name} - ${formatCurrency(invoiceTotal)}]` });
        } catch (error: any) {
            toast.error(error.message || t('common.error'));
        } finally {
            setIsSubmittingInvoice(false);
        }
    };

    const handleEmojiClick = (emojiData: any) => {
        setInputText(prev => prev + emojiData.emoji);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Data processing ───────────────────────────────────────────────────────
    const conversations: Conversation[] = conversationsData?.results || [];
    const filteredByRole = conversations.filter(c => {
        if (activeRoleTab === 'all') return true;
        return c.selfRole === activeRoleTab;
    });

    const filteredConversations = search
        ? filteredByRole.filter(c => {
            const name = c.otherParticipant?.name || c.otherParticipant?.username || '';
            return name.toLowerCase().includes(search.toLowerCase());
        })
        : filteredByRole;

    const messages: Message[] = activeConversation?.messages
        ? [...activeConversation.messages].reverse()
        : [];

    const activeConv = conversations.find(c => c.id === selectedId);
    const otherParticipant = activeConversation?.otherParticipant || activeConv?.otherParticipant;
    const tagSummary = pendingTag ? extractTagSummary(pendingTag) : null;

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <MainLayout>
            <div className="wa-root">
                {/* ── SIDEBAR ── */}
                <aside className={cn('wa-sidebar', mobileView === 'chat' && 'wa-sidebar--mobile-hidden')}>
                    {/* Header */}
                    <div className="wa-sidebar-header">
                        <div className="flex items-center gap-4 w-full">
                            <h1 className="text-xl font-black italic tracking-tighter uppercase flex-1 text-white">Messages</h1>
                            {/* <div className="flex items-center gap-4">
                                <Search size={22} className="text-white cursor-pointer" />
                                <ShoppingCart size={22} className="text-white cursor-pointer" />
                                <div className="relative">
                                    <Bell size={22} className="text-white cursor-pointer" />
                                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white border-2 border-primary font-bold">3</span>
                                </div>
                                <MoreVertical size={22} className="text-white cursor-pointer" />
                            </div> */}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="px-4 py-2 bg-surface">
                        <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-xl">
                            <Search size={16} className="text-text-secondary" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder={t('messages.searchConversations')}
                                className="bg-transparent border-none focus:ring-0 text-sm w-full"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-border bg-surface pt-2">
                        {[
                            { id: 'all', label: t('common.all') },
                            { id: 'BUYER', label: t('messages.asUser') },
                            { id: 'SHOP', label: t('messages.asShop') }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveRoleTab(tab.id as any)}
                                className={cn(
                                    "flex-1 py-4 text-sm font-black uppercase italic tracking-tight transition-all relative",
                                    activeRoleTab === tab.id ? "text-primary" : "text-text-secondary"
                                )}
                            >
                                {tab.label}
                                {activeRoleTab === tab.id && (
                                    <motion.div
                                        layoutId="activeRoleTab"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* List */}
                    <div className="wa-conv-list bg-background">
                        {isLoadingList ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="wa-conv-skeleton" />
                            ))
                        ) : filteredConversations.length === 0 ? (
                            <div className="wa-conv-empty">
                                <MessageSquare size={40} />
                                <span>{t('messages.noConversations')}</span>
                            </div>
                        ) : (
                            filteredConversations.map(conv => {
                                const isActive = selectedId === conv.id;
                                const ts = conv.lastMessage?.timestamp || conv.updatedAt;
                                return (
                                    <button
                                        key={conv.id}
                                        className={cn('wa-conv-item', isActive && 'wa-conv-item--active')}
                                        onClick={() => handleSelectConversation(conv.id)}
                                    >
                                        <div className="wa-conv-avatar">
                                            <ConversationAvatar participant={conv.otherParticipant} size={56} />
                                            {(conv.unreadCount ?? 0) > 0 && (
                                                <span className="wa-conv-unread-dot" />
                                            )}
                                        </div>
                                        <div className="wa-conv-info flex-1">
                                            <div className="wa-conv-top">
                                                <span className="wa-conv-name">
                                                    {conv.otherParticipant?.name || conv.otherParticipant?.username || 'Unknown'}
                                                </span>
                                                <span className="wa-conv-time">
                                                    {ts ? format(new Date(ts), 'MMM dd, yyyy, h:mm a') : ''}
                                                </span>
                                            </div>
                                            <div className="wa-conv-bottom mt-1">
                                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                    {conv.unreadCount === 0 && <CheckCheck size={14} className="text-[#34b7f1]" />}
                                                    <span className="wa-conv-preview">
                                                        {conv.lastMessage?.content || t('messages.media')}
                                                    </span>
                                                </div>
                                                {(conv.unreadCount ?? 0) > 0 && (
                                                    <span className="wa-unread-badge">{conv.unreadCount}</span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </aside>

                {/* ── CHAT PANEL ── */}
                <main className={cn('wa-chat', !selectedId ? 'wa-chat--empty-state' : '', mobileView === 'list' && 'wa-chat--mobile-hidden')}>
                    {!selectedId ? (
                        <div className="wa-welcome">
                            <div className="wa-welcome-icon">
                                <MessageSquare size={72} />
                            </div>
                            <h2 className="wa-welcome-title">KASH Messenger</h2>
                            <p className="wa-welcome-sub">{t('messages.selectToStart')}</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="wa-chat-header shadow-sm">
                                <div className="wa-chat-header-left">
                                    <button className="wa-back-btn text-white" onClick={() => setMobileView('list')}>
                                        <ChevronLeft size={22} />
                                    </button>
                                    <ConversationAvatar participant={otherParticipant} size={48} />
                                    <div className="wa-chat-info">
                                        <div className="flex items-center gap-2">
                                            <span className="wa-chat-name text-white">
                                                {otherParticipant?.name || otherParticipant?.username || t('common.loading')}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold text-white uppercase italic">Buyer</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className="h-1.5 w-1.5 rounded-full bg-[#ffa000] animate-pulse" />
                                            <span className="wa-chat-sub text-white/80 font-bold uppercase italic text-[10px]">Connecting...</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="wa-chat-header-actions relative">
                                    <button className="wa-hdr-btn text-white w-10 h-10 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors">
                                        <Phone size={20} />
                                    </button>
                                    <button className="wa-hdr-btn text-white w-10 h-10 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors hidden md:flex">
                                        <Video size={20} />
                                    </button>
                                    <button
                                        className="wa-hdr-btn text-white w-10 h-10 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors"
                                        onClick={() => setShowMenu(!showMenu)}
                                    >
                                        <MoreVertical size={20} />
                                    </button>

                                    {showMenu && (
                                                <div className="absolute top-12 right-0 bg-surface shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-1.5 w-64 z-[100] border border-border/40 animate-in fade-in zoom-in duration-200">
                                            {user?.has_shop && (
                                                <button
                                                    onClick={() => {
                                                        setShowMenu(false);
                                                        setShowInvoiceModal(true);
                                                        fetchShopProducts();
                                                    }}
                                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 text-text transition-all text-left"
                                                >
                                                    <FilePlus size={20} className="text-text-secondary" />
                                                    <span className="text-sm font-medium">Create an Invoice</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setShowMenu(false)}
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 text-red-500 transition-all text-left"
                                            >
                                                <X size={20} />
                                                <span className="text-sm font-medium">{t('common.close') || 'Close Menu'}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Messages Area */}
                                    <div className="wa-messages bg-background">
                                <div className="wa-messages-bg" />

                                {isLoadingChat ? (
                                    <div className="wa-loading-msgs">
                                        {Array(4).fill(0).map((_, i) => (
                                            <div key={i} className={cn('wa-msg-skeleton', i % 2 === 0 ? 'wa-msg-skeleton--in' : 'wa-msg-skeleton--out')} />
                                        ))}
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="wa-no-msgs">
                                        <div className="wa-no-msgs-icon"><Smile size={32} /></div>
                                        <p>{t('messages.saySomething')}</p>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((msg, idx) => {
                                            const isOwn =
                                                String(msg.sender) === String(user?.id) ||
                                                msg.sender_username === user?.username;

                                            const prevMsg = messages[idx - 1];
                                            const showDateSep = idx > 0 && prevMsg?.timestamp && msg.timestamp &&
                                                new Date(prevMsg.timestamp).toDateString() !== new Date(msg.timestamp).toDateString();

                                            return (
                                                <React.Fragment key={msg.id}>
                                                    {showDateSep && msg.timestamp && (
                                                        <div className="wa-date-sep">
                                                            <span>{formatDate(msg.timestamp, t)}</span>
                                                        </div>
                                                    )}
                                                    <div className={cn('wa-msg-row', isOwn ? 'wa-msg-row--out' : 'wa-msg-row--in')}>
                                                        {!isOwn && (
                                                            <ConversationAvatar participant={otherParticipant} size={28} />
                                                        )}

                                                        <div className={cn('wa-bubble', isOwn ? 'wa-bubble--out' : 'wa-bubble--in', msg.image && 'p-1')}>
                                                            {!isOwn && (
                                                                <div className="text-[10px] font-black text-primary uppercase italic mb-1 px-1">
                                                                    {msg.sender_display_name || otherParticipant?.name || 'User'}
                                                                </div>
                                                            )}
                                                            <div className={cn('wa-bubble-tail', isOwn ? 'wa-bubble-tail--out' : 'wa-bubble-tail--in')} />

                                                            {msg.replied_to_data && (
                                                                <div className={cn('wa-reply-preview', isOwn ? 'wa-reply-preview--out' : 'wa-reply-preview--in')}>
                                                                    <span className="wa-reply-name">{msg.replied_to_data.sender_username}</span>
                                                                    <span className="wa-reply-text">{msg.replied_to_data.content}</span>
                                                                </div>
                                                            )}

                                                            {msg.image && (
                                                                <a href={formatImageUrl(msg.image)} target="_blank" rel="noreferrer" className="block relative bg-primary/10 rounded-xl overflow-hidden">
                                                                    <img
                                                                        src={formatImageUrl(msg.image)}
                                                                        alt="attachment"
                                                                        className="wa-bubble-img mb-0 border-none"
                                                                    />
                                                                    <div className="absolute bottom-1 right-2 flex items-center gap-1 bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-full">
                                                                        <span className="text-[9px] text-white font-bold">{formatTime(msg.timestamp)}</span>
                                                                        {isOwn && <CheckCheck size={12} className="text-white" />}
                                                                    </div>
                                                                </a>
                                                            )}

                                                            {msg.content && (
                                                                <div className={cn('wa-bubble-text', isOwn ? 'text-white' : 'text-text')}>
                                                                    {renderTaggedMessageContent(msg.content, isOwn)}
                                                                </div>
                                                            )}

                                                            {!msg.image && (
                                                                <div className="wa-bubble-footer">
                                                                    <span className={cn("wa-bubble-time", isOwn ? "text-white/70" : "text-text-secondary")}>{formatTime(msg.timestamp)}</span>
                                                                    {isOwn && (
                                                                        <CheckCheck size={14} className={cn('wa-ticks', msg.is_read ? 'text-[#34b7f1]' : 'text-white/70')} />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="wa-input-area relative">
                                {pendingTag && (
                                    <div className="px-4 pt-3">
                                        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                    <ShoppingCart size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                                                        {tagSummary?.kind === 'order'
                                                            ? (t('order.referencingOrder') || 'Referencing order')
                                                            : tagSummary?.kind === 'product'
                                                                ? 'Referencing product'
                                                                : 'Referencing'}
                                                    </p>
                                                    <p className="text-sm font-bold truncate">{tagSummary?.label || ''}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setPendingTag(null)}
                                                className="h-9 w-9 rounded-full bg-background flex items-center justify-center text-text-secondary hover:text-error hover:bg-error/10 transition-colors"
                                                aria-label="Remove tag"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {showEmojiPicker && (
                                    <div ref={emojiPickerRef} className="absolute bottom-20 left-4 z-[100] shadow-2xl border border-border rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                                        <EmojiPicker
                                            onEmojiClick={handleEmojiClick}
                                            autoFocusSearch={false}
                                            width={320}
                                            height={400}
                                        />
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                                <form className="flex items-center gap-2 px-2 py-2" onSubmit={handleSend}>
                                    <div className="relative shrink-0">
                                        <button
                                            type="button"
                                            className="h-11 w-11 rounded-full bg-background flex items-center justify-center text-primary group hover:bg-primary hover:text-white transition-all shadow-sm"
                                            onClick={() => setShowMenu(!showMenu)}
                                        >
                                            <Plus size={24} className={cn("transition-transform duration-300", showMenu && "rotate-45")} />
                                        </button>
                                        {showMenu && (
                                            <div className="absolute bottom-14 left-0 bg-surface shadow-2xl rounded-3xl p-3 w-64 z-[110] border border-border animate-in slide-in-from-bottom-2 duration-300">
                                                <button
                                                    onClick={() => {
                                                        setShowMenu(false);
                                                        fileInputRef.current?.click();
                                                    }}
                                                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-primary/5 text-primary-dark transition-all text-left group"
                                                >
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                                        <ImageIcon size={20} />
                                                    </div>
                                                    <span className="text-sm font-black uppercase italic tracking-tight">{t('messages.sendImage') || 'Photo & Video'}</span>
                                                </button>

                                                {user?.has_shop && (
                                                    <button
                                                        onClick={() => {
                                                            setShowMenu(false);
                                                            setShowInvoiceModal(true);
                                                            fetchShopProducts();
                                                        }}
                                                        className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-success/5 text-success-dark transition-all text-left group border-t border-border/40 mt-1"
                                                    >
                                                        <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center group-hover:bg-success group-hover:text-white transition-all">
                                                            <FilePlus size={20} />
                                                        </div>
                                                        <span className="text-sm font-black uppercase italic tracking-tight">Create an Invoice</span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 flex items-center bg-surface rounded-full px-4 h-11 border border-border/40">
                                        <input
                                            value={inputText}
                                            onChange={e => setInputText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleSend();
                                                }
                                            }}
                                            placeholder="Type a message..."
                                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium px-0 py-2 placeholder:text-text-secondary"
                                        />
                                    </div>

                                    {(inputText.trim() || imageFile || pendingTag) ? (
                                        <button
                                            type="submit"
                                            disabled={sendMutation.isPending}
                                            className="wa-send-btn shrink-0 h-11 w-11"
                                        >
                                            {sendMutation.isPending ? (
                                                <div className="wa-spinner border-white/40 border-t-white" />
                                            ) : (
                                                <Send size={20} />
                                            )}
                                        </button>
                                    ) : (
                                        <button type="button" className="shrink-0 h-11 w-11 rounded-full bg-background flex items-center justify-center text-primary group hover:bg-primary/10 transition-colors">
                                            <Mic size={22} />
                                        </button>
                                    )}
                                </form>
                            </div>
                        </>
                    )}
                </main>
            </div>

            <Modal
                isOpen={showInvoiceModal}
                onClose={() => setShowInvoiceModal(false)}
                title={t('order.createInvoice') || 'Create Invoice'}
                className="max-w-2xl"
            >
                <div className="p-8 space-y-8">
                    <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">Recipient Buyer</h4>
                        <div className="flex items-center gap-3">
                            <ConversationAvatar participant={otherParticipant} size={32} />
                            <span className="text-lg font-black italic uppercase tracking-tighter truncate">{otherParticipant?.name || otherParticipant?.username}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Select Product</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {isLoadingProducts ? (
                                Array(3).fill(0).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-surface animate-pulse" />)
                            ) : shopProducts.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => {
                                        setSelectedProduct(product);
                                        setInvoiceTotal(product.price * quantity);
                                    }}
                                    className={cn(
                                        "p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2",
                                        selectedProduct?.id === product.id ? "border-primary bg-primary/5 shadow-lg" : "border-border/40 hover:border-primary/20"
                                    )}
                                >
                                    <img src={formatImageUrl(product.images)} className="h-12 w-12 rounded-lg object-cover" alt={product.name} />
                                    <span className="text-[10px] font-bold uppercase truncate w-full">{product.name}</span>
                                    <span className="text-[10px] font-black text-primary">{formatCurrency(product.price)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedProduct && (
                        <div className="grid grid-cols-2 gap-6 p-6 bg-surface rounded-3xl border border-border shadow-inner">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 1;
                                        setQuantity(val);
                                        setInvoiceTotal(selectedProduct.price * val);
                                    }}
                                    className="w-full h-12 rounded-xl bg-background border border-border px-4 text-sm font-bold focus:border-primary focus:outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Total Price (XAF)</label>
                                <input
                                    type="number"
                                    value={invoiceTotal}
                                    onChange={(e) => setInvoiceTotal(parseInt(e.target.value) || 0)}
                                    className="w-full h-12 rounded-xl bg-background border border-border px-4 text-sm font-bold focus:border-primary focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-4">
                        <Button
                            onClick={handleCreateInvoice}
                            disabled={!selectedProduct || isSubmittingInvoice}
                            isLoading={isSubmittingInvoice}
                            className="w-full h-16 rounded-2xl font-black uppercase italic shadow-xl shadow-primary/20"
                        >
                            <ShoppingCart size={20} className="mr-2" /> Send Invoice
                        </Button>
                    </div>
                </div>
            </Modal>

            <style jsx global>{`
        .wa-root {
                    --wa-bg: var(--color-background);
                    --wa-surface: var(--color-surface);
                    --wa-border: var(--color-border);
                    --wa-text: var(--color-text);
                    --wa-muted: var(--color-text-secondary);
                    --wa-primary: var(--color-primary);
                    --wa-primary-dark: var(--color-primary-dark);
                    --wa-hover: rgba(16,185,129,0.06);
                    --wa-active: rgba(16,185,129,0.10);

          display: flex;
          height: calc(100vh - 4rem);
          overflow: hidden;
                    background: var(--wa-bg);
          border-radius: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding-bottom: env(safe-area-inset-bottom);
        }

        .wa-sidebar {
          width: 360px;
          min-width: 280px;
          display: flex;
          flex-direction: column;
                    background: var(--wa-surface);
                    border-right: 1px solid var(--wa-border);
          overflow: hidden;
        }

        .wa-sidebar-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1rem;
                    background: var(--wa-primary);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .wa-conv-list { flex: 1; overflow-y: auto; }

        .wa-conv-skeleton {
          height: 72px;
                    background: linear-gradient(90deg, var(--wa-bg) 25%, var(--wa-surface) 50%, var(--wa-bg) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite;
          margin: 0;
        }

        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        .wa-conv-empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 0.75rem; padding: 4rem 2rem;
                    color: var(--wa-muted); font-size: 0.875rem;
        }

        .wa-conv-item {
          width: 100%; display: flex; align-items: center;
          gap: 0.75rem; padding: 0.75rem 1rem;
          background: none; border: none;
                    border-bottom: 1px solid var(--wa-border);
          cursor: pointer; transition: background 0.1s; text-align: left;
        }
                .wa-conv-item:hover { background: var(--wa-hover); }
                .wa-conv-item--active { background: var(--wa-active); }

        .wa-conv-avatar { position: relative; flex-shrink: 0; }
        .wa-conv-unread-dot {
          position: absolute; top: 0; right: 0;
          width: 10px; height: 10px;
          background: #25D366; border-radius: 50%;
                    border: 2px solid var(--wa-surface);
        }

        .wa-conv-info { flex: 1; min-width: 0; }

        .wa-conv-top {
          display: flex; justify-content: space-between;
          align-items: baseline; gap: 0.5rem; margin-bottom: 0.2rem;
        }

        .wa-conv-name {
          font-weight: 600; font-size: 0.9375rem;
                    color: var(--wa-text); overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
        }

                .wa-conv-time { font-size: 0.72rem; color: var(--wa-muted); flex-shrink: 0; }

        .wa-conv-bottom {
          display: flex; justify-content: space-between;
          align-items: center; gap: 0.5rem;
        }

        .wa-conv-preview {
                    font-size: 0.825rem; color: var(--wa-muted);
          white-space: nowrap; overflow: hidden;
          text-overflow: ellipsis; flex: 1;
        }

        .wa-unread-badge {
          background: #25D366; color: white;
          border-radius: 999px; min-width: 20px; height: 20px;
          display: inline-flex; align-items: center;
          justify-content: center; font-size: 0.7rem;
          font-weight: 700; padding: 0 4px; flex-shrink: 0;
        }

        .wa-chat {
          flex: 1; display: flex; flex-direction: column;
                    background: var(--wa-bg); overflow: hidden; position: relative;
        }

                .wa-chat--empty-state { background: var(--wa-bg); }

        .wa-welcome {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
                    gap: 1rem; color: var(--wa-muted);
        }

        .wa-welcome-icon {
          width: 88px; height: 88px; border-radius: 50%;
                    background: rgba(16,185,129,0.12);
          display: flex; align-items: center; justify-content: center;
                    color: var(--wa-primary);
        }

        .wa-welcome-title {
          font-size: 1.375rem; font-weight: 700;
                    color: var(--wa-text); margin: 0;
        }

        .wa-welcome-sub {
                    font-size: 0.875rem; color: var(--wa-muted);
          margin: 0; max-width: 280px; text-align: center;
        }

        .wa-chat-header {
          display: flex; align-items: center;
          justify-content: space-between;
                    background: var(--wa-primary); padding: 0.5rem 1rem;
          border-bottom: 1px solid rgba(0,0,0,0.05); gap: 0.75rem; z-index: 10;
        }

        .wa-chat-header-left {
          display: flex; align-items: center;
          gap: 0.75rem; flex: 1; min-width: 0;
        }

        .wa-back-btn {
          display: none; background: none; border: none;
          color: #fff; cursor: pointer; padding: 0.25rem; border-radius: 50%;
        }

        .wa-chat-info { display: flex; flex-direction: column; min-width: 0; }
        .wa-chat-name { font-weight: 600; font-size: 0.9375rem; color: #fff; }
        .wa-chat-sub { font-size: 0.72rem; color: #fff; }

        .wa-chat-header-actions { display: flex; gap: 0.25rem; flex-shrink: 0; }
        .wa-hdr-btn {
          background: none; border: none; color: #fff;
          cursor: pointer; width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
        }

        .wa-messages {
          flex: 1; overflow-y: auto; position: relative;
          padding: 0.5rem 6%; display: flex; flex-direction: column; gap: 0.15rem;
        }

        .wa-messages-bg {
          position: fixed; inset: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d9d9d9' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                    z-index: 0; opacity: 0.12;
        }

                .dark .wa-messages-bg { opacity: 0.05; }

        .wa-loading-msgs, .wa-no-msgs { position: relative; z-index: 1; padding: 1rem 0; }
        .wa-no-msgs { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 4rem; color: var(--wa-muted); font-size: 0.875rem; }
        .wa-no-msgs-icon { width: 64px; height: 64px; border-radius: 50%; background: rgba(16,185,129,0.12); display: flex; align-items: center; justify-content: center; color: var(--wa-primary); }

        .wa-msg-skeleton {
          height: 48px; border-radius: 18px;
                    background: linear-gradient(90deg, var(--wa-bg) 25%, var(--wa-surface) 50%, var(--wa-bg) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite;
          margin-bottom: 0.5rem;
        }
        .wa-msg-skeleton--in { width: 55%; align-self: flex-start; }
        .wa-msg-skeleton--out { width: 55%; align-self: flex-end; }

        .wa-date-sep {
          display: flex; justify-content: center;
          margin: 0.75rem 0; position: relative; z-index: 1;
        }
        .wa-date-sep span {
                    background: rgba(16,185,129,0.10); color: var(--wa-text);
          font-size: 0.7rem; font-weight: 600;
          padding: 0.25rem 0.85rem; border-radius: 999px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          backdrop-filter: blur(4px);
        }

        .wa-msg-row {
          display: flex; align-items: flex-end;
          gap: 0.4rem; position: relative; z-index: 1; margin-bottom: 0.15rem;
        }
        .wa-msg-row--in { justify-content: flex-start; }
        .wa-msg-row--out { justify-content: flex-end; }

        .wa-bubble {
          max-width: 65%; border-radius: 8px; padding: 0.5rem 0.75rem;
          position: relative; box-shadow: 0 1px 0.5px rgba(11,20,26,0.13);
          word-break: break-word;
        }
        .wa-bubble--in { background: var(--wa-surface); border-top-left-radius: 2px; }
        .wa-bubble--out { background: var(--wa-primary); border-top-right-radius: 2px; box-shadow: 0 4px 15px rgba(16,185,129,0.25); }

        .wa-bubble-tail {
          position: absolute; top: 0; width: 0; height: 0;
        }
        .wa-bubble-tail--in { left: -8px; border-right: 8px solid var(--wa-surface); border-top: 8px solid transparent; }
        .wa-bubble-tail--out { right: -8px; border-left: 8px solid var(--wa-primary); border-top: 8px solid transparent; }

        .wa-bubble-img {
          max-width: 260px; width: 100%; border-radius: 8px;
          object-fit: cover; display: block; margin-bottom: 0.25rem;
        }

        .wa-bubble-text {
          margin: 0 0 0.2rem; font-size: 0.875rem;
                    color: var(--wa-text); line-height: 1.5; white-space: pre-wrap;
        }

        .wa-reply-preview {
          border-radius: 6px; padding: 0.3rem 0.5rem;
          margin-bottom: 0.35rem; display: flex;
          flex-direction: column; gap: 0.1rem;
          border-left: 4px solid; overflow: hidden;
        }
        .wa-reply-preview--in { background: rgba(0,0,0,0.05); border-color: var(--wa-primary); }
        .wa-reply-preview--out { background: rgba(0,0,0,0.05); border-color: var(--wa-primary-dark); }
        .dark .wa-reply-preview--in, .dark .wa-reply-preview--out { background: rgba(255,255,255,0.06); }
        .wa-reply-name { font-size: 0.72rem; font-weight: 700; color: var(--wa-primary); }
        .wa-reply-text { font-size: 0.78rem; color: var(--wa-muted); }

        .wa-bubble-footer {
          display: flex; align-items: center; justify-content: flex-end;
          gap: 0.2rem; margin-top: 0.15rem;
        }
        .wa-bubble-time { font-size: 0.67rem; color: var(--wa-muted); }
        .wa-ticks { flex-shrink: 0; }
        .wa-ticks--sent { color: #8696a0; }
        .wa-ticks--read { color: #53bdeb; }

        /* ─── Image Preview Bar ─── */
        .wa-img-preview {
                    background: var(--wa-bg); padding: 0.5rem 1rem;
                    border-top: 1px solid var(--wa-border);
          display: flex; align-items: center; gap: 0.75rem;
          position: relative; z-index: 10;
        }
        .wa-img-preview-thumb { width: 56px; height: 56px; border-radius: 8px; object-fit: cover; }
        .wa-img-preview-remove {
          background: rgba(0,0,0,0.5); color: white;
          border: none; cursor: pointer; border-radius: 50%;
          width: 24px; height: 24px; display: flex;
          align-items: center; justify-content: center;
          position: absolute; top: 4px; left: 52px;
        }

        /* ─── Input ─── */
        .wa-input-area {
                    background: var(--wa-bg); padding: 0.6rem 1rem;
                    border-top: 1px solid var(--wa-border); z-index: 10;
        }

        .wa-input-row {
          display: flex; align-items: flex-end; gap: 0.5rem;
        }

        .wa-tool-btn {
                    background: none; border: none; color: var(--wa-muted);
          cursor: pointer; width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; flex-shrink: 0; margin-bottom: 2px;
        }
                .wa-tool-btn:hover { background: var(--wa-hover); }

        .wa-input-wrap { flex: 1; }
        .wa-textarea {
                    width: 100%; border: none; background: var(--wa-surface);
          border-radius: 20px; padding: 0.6rem 1rem;
          font-size: 0.9375rem; line-height: 1.5; outline: none;
          resize: none; max-height: 180px; overflow-y: auto;
                    font-family: inherit; color: var(--wa-text);
          scrollbar-width: none;
        }
                .wa-textarea::placeholder { color: var(--wa-muted); }
        .wa-textarea::-webkit-scrollbar { display: none; }

        .wa-send-btn {
                    background: var(--wa-primary); border: none; cursor: pointer; color: white;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; width: 44px; height: 44px;
          transition: background 0.15s, transform 0.1s;
                    box-shadow: 0 2px 6px rgba(16,185,129,0.25); flex-shrink: 0;
        }
                .wa-send-btn:hover { background: var(--wa-primary-dark); transform: scale(1.05); }
        .wa-send-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .wa-spinner {
          width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ─── Mobile Responsive ─── */
        @media (max-width: 768px) {
          .wa-root { height: calc(100vh - 3.5rem); }
          .wa-sidebar { width: 100%; min-width: 100%; border-right: none; }
          .wa-sidebar--mobile-hidden { display: none; }
          .wa-chat--mobile-hidden { display: none; }
          .wa-back-btn { display: flex; }
        }
        @media (min-width: 769px) {
          .wa-sidebar { width: 360px; min-width: 280px; }
          .wa-chat { display: flex !important; }
          .wa-sidebar { display: flex !important; }
        }
      `}</style>
        </MainLayout>
    );
}
