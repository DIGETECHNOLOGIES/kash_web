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
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatImageUrl } from '@/utils/formatters';

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

function formatDate(ts?: string) {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MessagesPage() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');
    const [search, setSearch] = useState('');
    const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        mutationFn: (data: { content?: string; image?: File }) =>
            messagingApi.sendMessage(selectedId!, { content: data.content, image: data.image }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversation', selectedId] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            setInputText('');
            setImageFile(null);
            setImagePreview(null);
        },
    });

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

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!selectedId) return;
        if (!inputText.trim() && !imageFile) return;
        sendMutation.mutate({ content: inputText.trim() || undefined, image: imageFile || undefined });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    // ── Data processing ───────────────────────────────────────────────────────
    const conversations: Conversation[] = conversationsData?.results || [];

    const filteredConversations = search
        ? conversations.filter(c => {
            const name = c.otherParticipant?.name || c.otherParticipant?.username || '';
            return name.toLowerCase().includes(search.toLowerCase());
        })
        : conversations;

    const messages: Message[] = activeConversation?.messages
        ? [...activeConversation.messages].reverse()
        : [];

    const activeConv = conversations.find(c => c.id === selectedId);
    const otherParticipant = activeConversation?.otherParticipant || activeConv?.otherParticipant;

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <MainLayout>
            <div className="wa-root">
                {/* ── SIDEBAR ── */}
                <aside className={cn('wa-sidebar', mobileView === 'chat' && 'wa-sidebar--mobile-hidden')}>
                    {/* Header */}
                    <div className="wa-sidebar-header">
                        <ConversationAvatar participant={{ name: user?.username }} size={40} />
                        <h1 className="wa-sidebar-title">Messages</h1>
                    </div>

                    {/* Search */}
                    <div className="wa-search-wrap">
                        <Search className="wa-search-icon" size={15} />
                        <input
                            className="wa-search-input"
                            placeholder="Search conversations"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* List */}
                    <div className="wa-conv-list">
                        {isLoadingList ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="wa-conv-skeleton" />
                            ))
                        ) : filteredConversations.length === 0 ? (
                            <div className="wa-conv-empty">
                                <MessageSquare size={40} />
                                <span>No conversations yet</span>
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
                                            <ConversationAvatar participant={conv.otherParticipant} size={48} />
                                            {(conv.unreadCount ?? 0) > 0 && (
                                                <span className="wa-conv-unread-dot" />
                                            )}
                                        </div>
                                        <div className="wa-conv-info">
                                            <div className="wa-conv-top">
                                                <span className="wa-conv-name">
                                                    {conv.otherParticipant?.name || conv.otherParticipant?.username || 'Unknown'}
                                                </span>
                                                <span className="wa-conv-time">
                                                    {ts ? format(new Date(ts), 'HH:mm') : ''}
                                                </span>
                                            </div>
                                            <div className="wa-conv-bottom">
                                                <span className="wa-conv-preview">
                                                    {conv.lastMessage?.content || '📎 Media'}
                                                </span>
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
                            <p className="wa-welcome-sub">Select a conversation to start chatting with buyers or sellers</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="wa-chat-header">
                                <div className="wa-chat-header-left">
                                    <button className="wa-back-btn" onClick={() => setMobileView('list')}>
                                        <ChevronLeft size={22} />
                                    </button>
                                    <ConversationAvatar participant={otherParticipant} size={40} />
                                    <div className="wa-chat-info">
                                        <span className="wa-chat-name">
                                            {otherParticipant?.name || otherParticipant?.username || 'Loading...'}
                                        </span>
                                        <span className="wa-chat-sub">tap here for more info</span>
                                    </div>
                                </div>
                                <div className="wa-chat-header-actions">
                                    <button className="wa-hdr-btn"><Phone size={20} /></button>
                                    <button className="wa-hdr-btn"><MoreVertical size={20} /></button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="wa-messages">
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
                                        <p>Say something! 👋</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Date label for first visible message group */}
                                        {messages[0]?.timestamp && (
                                            <div className="wa-date-sep">
                                                <span>{formatDate(messages[0].timestamp)}</span>
                                            </div>
                                        )}

                                        {messages.map((msg, idx) => {
                                            const isOwn =
                                                String(msg.sender) === String(user?.id) ||
                                                msg.sender_username === user?.username;

                                            const prevMsg = messages[idx - 1];
                                            const showDateSep = idx > 0 && prevMsg?.timestamp && msg.timestamp &&
                                                new Date(prevMsg.timestamp).toDateString() !== new Date(msg.timestamp).toDateString();

                                            return (
                                                <React.Fragment key={msg.id}>
                                                    {showDateSep && (
                                                        <div className="wa-date-sep">
                                                            <span>{formatDate(msg.timestamp)}</span>
                                                        </div>
                                                    )}
                                                    <div className={cn('wa-msg-row', isOwn ? 'wa-msg-row--out' : 'wa-msg-row--in')}>
                                                        {/* Incoming avatar */}
                                                        {!isOwn && (
                                                            <ConversationAvatar participant={otherParticipant} size={28} />
                                                        )}

                                                        <div className={cn('wa-bubble', isOwn ? 'wa-bubble--out' : 'wa-bubble--in')}>
                                                            {/* Tail */}
                                                            <div className={cn('wa-bubble-tail', isOwn ? 'wa-bubble-tail--out' : 'wa-bubble-tail--in')} />

                                                            {/* Reply preview */}
                                                            {msg.replied_to_data && (
                                                                <div className={cn('wa-reply-preview', isOwn ? 'wa-reply-preview--out' : 'wa-reply-preview--in')}>
                                                                    <span className="wa-reply-name">{msg.replied_to_data.sender_username}</span>
                                                                    <span className="wa-reply-text">{msg.replied_to_data.content}</span>
                                                                </div>
                                                            )}

                                                            {/* Image */}
                                                            {msg.image && (
                                                                <a href={formatImageUrl(msg.image)} target="_blank" rel="noreferrer">
                                                                    <img
                                                                        src={formatImageUrl(msg.image)}
                                                                        alt="attachment"
                                                                        className="wa-bubble-img"
                                                                    />
                                                                </a>
                                                            )}

                                                            {/* Text */}
                                                            {msg.content && (
                                                                <p className="wa-bubble-text">{msg.content}</p>
                                                            )}

                                                            {/* Footer */}
                                                            <div className="wa-bubble-footer">
                                                                <span className="wa-bubble-time">{formatTime(msg.timestamp)}</span>
                                                                {isOwn && (
                                                                    <CheckCheck size={14} className={cn('wa-ticks', msg.is_read ? 'wa-ticks--read' : 'wa-ticks--sent')} />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            {/* Image preview */}
                            {imagePreview && (
                                <div className="wa-img-preview">
                                    <img src={imagePreview} alt="preview" className="wa-img-preview-thumb" />
                                    <button className="wa-img-preview-remove" onClick={() => { setImageFile(null); setImagePreview(null); }}>
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            {/* Input Area */}
                            <div className="wa-input-area">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                                <form className="wa-input-row" onSubmit={handleSend}>
                                    <button type="button" className="wa-tool-btn"><Smile size={22} /></button>
                                    <button
                                        type="button"
                                        className="wa-tool-btn"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Paperclip size={22} />
                                    </button>
                                    <div className="wa-input-wrap">
                                        <textarea
                                            ref={textareaRef}
                                            className="wa-textarea"
                                            value={inputText}
                                            onChange={e => setInputText(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Type a message"
                                            rows={1}
                                        />
                                    </div>
                                    {(inputText.trim() || imageFile) ? (
                                        <button
                                            type="submit"
                                            disabled={sendMutation.isPending}
                                            className="wa-send-btn"
                                        >
                                            {sendMutation.isPending ? (
                                                <div className="wa-spinner" />
                                            ) : (
                                                <Send size={20} />
                                            )}
                                        </button>
                                    ) : (
                                        <button type="button" className="wa-send-btn">
                                            <Mic size={20} />
                                        </button>
                                    )}
                                </form>
                            </div>
                        </>
                    )}
                </main>
            </div>

            <style jsx global>{`
        /* ── Scoped WhatsApp-style UI ── */
        .wa-root {
          display: flex;
          height: calc(100vh - 4rem);
          overflow: hidden;
          background: #f0f2f5;
          border-radius: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* ─── Sidebar ─── */
        .wa-sidebar {
          width: 360px;
          min-width: 280px;
          display: flex;
          flex-direction: column;
          background: #fff;
          border-right: 1px solid #e9edef;
          overflow: hidden;
        }

        .wa-sidebar-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1rem;
          background: #f0f2f5;
          border-bottom: 1px solid #e9edef;
        }

        .wa-sidebar-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #111b21;
          margin: 0;
        }

        .wa-search-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: #f0f2f5;
          border-bottom: 1px solid #e9edef;
        }

        .wa-search-icon { color: #54656f; flex-shrink: 0; }

        .wa-search-input {
          flex: 1;
          border: none;
          background: #fff;
          border-radius: 999px;
          padding: 0.45rem 1rem;
          font-size: 0.85rem;
          outline: none;
          color: #111b21;
        }

        .wa-conv-list { flex: 1; overflow-y: auto; }

        .wa-conv-skeleton {
          height: 72px;
          background: linear-gradient(90deg, #f0f2f5 25%, #e5e8eb 50%, #f0f2f5 75%);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite;
          margin: 0;
        }

        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        .wa-conv-empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 0.75rem; padding: 4rem 2rem;
          color: #8696a0; font-size: 0.875rem;
        }

        .wa-conv-item {
          width: 100%; display: flex; align-items: center;
          gap: 0.75rem; padding: 0.75rem 1rem;
          background: none; border: none;
          border-bottom: 1px solid #f0f2f5;
          cursor: pointer; transition: background 0.1s; text-align: left;
        }
        .wa-conv-item:hover { background: #f5f6f6; }
        .wa-conv-item--active { background: #f0f2f5; }

        .wa-conv-avatar { position: relative; flex-shrink: 0; }
        .wa-conv-unread-dot {
          position: absolute; top: 0; right: 0;
          width: 10px; height: 10px;
          background: #25D366; border-radius: 50%;
          border: 2px solid white;
        }

        .wa-conv-info { flex: 1; min-width: 0; }

        .wa-conv-top {
          display: flex; justify-content: space-between;
          align-items: baseline; gap: 0.5rem; margin-bottom: 0.2rem;
        }

        .wa-conv-name {
          font-weight: 600; font-size: 0.9375rem;
          color: #111b21; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
        }

        .wa-conv-time { font-size: 0.72rem; color: #8696a0; flex-shrink: 0; }

        .wa-conv-bottom {
          display: flex; justify-content: space-between;
          align-items: center; gap: 0.5rem;
        }

        .wa-conv-preview {
          font-size: 0.825rem; color: #667781;
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

        /* ─── Chat Panel ─── */
        .wa-chat {
          flex: 1; display: flex; flex-direction: column;
          background: #efeae2; overflow: hidden; position: relative;
        }

        .wa-chat--empty-state { background: #f0f2f5; }

        .wa-welcome {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 1rem; color: #667781;
        }

        .wa-welcome-icon {
          width: 88px; height: 88px; border-radius: 50%;
          background: #d9fdd3;
          display: flex; align-items: center; justify-content: center;
          color: #25D366;
        }

        .wa-welcome-title {
          font-size: 1.375rem; font-weight: 700;
          color: #111b21; margin: 0;
        }

        .wa-welcome-sub {
          font-size: 0.875rem; color: #667781;
          margin: 0; max-width: 280px; text-align: center;
        }

        /* ─── Chat Header ─── */
        .wa-chat-header {
          display: flex; align-items: center;
          justify-content: space-between;
          background: #f0f2f5; padding: 0.5rem 1rem;
          border-bottom: 1px solid #e9edef; gap: 0.75rem; z-index: 10;
        }

        .wa-chat-header-left {
          display: flex; align-items: center;
          gap: 0.75rem; flex: 1; min-width: 0;
        }

        .wa-back-btn {
          display: none; background: none; border: none;
          color: #54656f; cursor: pointer; padding: 0.25rem; border-radius: 50%;
        }

        .wa-chat-info { display: flex; flex-direction: column; min-width: 0; }
        .wa-chat-name { font-weight: 600; font-size: 0.9375rem; color: #111b21; truncate; }
        .wa-chat-sub { font-size: 0.72rem; color: #667781; }

        .wa-chat-header-actions { display: flex; gap: 0.25rem; flex-shrink: 0; }
        .wa-hdr-btn {
          background: none; border: none; color: #54656f;
          cursor: pointer; width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
        }
        .wa-hdr-btn:hover { background: rgba(0,0,0,0.07); }

        /* ─── Messages ─── */
        .wa-messages {
          flex: 1; overflow-y: auto; position: relative;
          padding: 0.5rem 6%; display: flex; flex-direction: column; gap: 0.15rem;
        }

        .wa-messages-bg {
          position: fixed; inset: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d9d9d9' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          z-index: 0; opacity: 0.5;
        }

        .wa-loading-msgs, .wa-no-msgs { position: relative; z-index: 1; padding: 1rem 0; }
        .wa-no-msgs { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 4rem; color: #667781; font-size: 0.875rem; }
        .wa-no-msgs-icon { width: 64px; height: 64px; border-radius: 50%; background: #d9fdd3; display: flex; align-items: center; justify-content: center; color: #25D366; }

        .wa-msg-skeleton {
          height: 48px; border-radius: 18px;
          background: linear-gradient(90deg, #f0f2f5 25%, #e5e8eb 50%, #f0f2f5 75%);
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
          background: rgba(225,245,254,0.92); color: #54656f;
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
        .wa-bubble--in { background: #fff; border-top-left-radius: 2px; }
        .wa-bubble--out { background: #d9fdd3; border-top-right-radius: 2px; }

        .wa-bubble-tail {
          position: absolute; top: 0; width: 0; height: 0;
        }
        .wa-bubble-tail--in { left: -8px; border-right: 8px solid #fff; border-top: 8px solid transparent; }
        .wa-bubble-tail--out { right: -8px; border-left: 8px solid #d9fdd3; border-top: 8px solid transparent; }

        .wa-bubble-img {
          max-width: 260px; width: 100%; border-radius: 8px;
          object-fit: cover; display: block; margin-bottom: 0.25rem;
        }

        .wa-bubble-text {
          margin: 0 0 0.2rem; font-size: 0.875rem;
          color: #111b21; line-height: 1.5; white-space: pre-wrap;
        }

        .wa-reply-preview {
          border-radius: 6px; padding: 0.3rem 0.5rem;
          margin-bottom: 0.35rem; display: flex;
          flex-direction: column; gap: 0.1rem;
          border-left: 4px solid; overflow: hidden;
        }
        .wa-reply-preview--in { background: rgba(0,0,0,0.05); border-color: #25D366; }
        .wa-reply-preview--out { background: rgba(0,0,0,0.05); border-color: #128C7E; }
        .wa-reply-name { font-size: 0.72rem; font-weight: 700; color: #25D366; }
        .wa-reply-text { font-size: 0.78rem; color: #667781; }

        .wa-bubble-footer {
          display: flex; align-items: center; justify-content: flex-end;
          gap: 0.2rem; margin-top: 0.15rem;
        }
        .wa-bubble-time { font-size: 0.67rem; color: #667781; }
        .wa-ticks { flex-shrink: 0; }
        .wa-ticks--sent { color: #8696a0; }
        .wa-ticks--read { color: #53bdeb; }

        /* ─── Image Preview Bar ─── */
        .wa-img-preview {
          background: #f0f2f5; padding: 0.5rem 1rem;
          border-top: 1px solid #e9edef;
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
          background: #f0f2f5; padding: 0.6rem 1rem;
          border-top: 1px solid #e9edef; z-index: 10;
        }

        .wa-input-row {
          display: flex; align-items: flex-end; gap: 0.5rem;
        }

        .wa-tool-btn {
          background: none; border: none; color: #54656f;
          cursor: pointer; width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; flex-shrink: 0; margin-bottom: 2px;
        }
        .wa-tool-btn:hover { background: rgba(0,0,0,0.07); }

        .wa-input-wrap { flex: 1; }
        .wa-textarea {
          width: 100%; border: none; background: #fff;
          border-radius: 20px; padding: 0.6rem 1rem;
          font-size: 0.9375rem; line-height: 1.5; outline: none;
          resize: none; max-height: 180px; overflow-y: auto;
          font-family: inherit; color: #111b21;
          scrollbar-width: none;
        }
        .wa-textarea::placeholder { color: #8696a0; }
        .wa-textarea::-webkit-scrollbar { display: none; }

        .wa-send-btn {
          background: #25D366; border: none; cursor: pointer; color: white;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; width: 44px; height: 44px;
          transition: background 0.15s, transform 0.1s;
          box-shadow: 0 2px 6px rgba(37,211,102,0.3); flex-shrink: 0;
        }
        .wa-send-btn:hover { background: #128C7E; transform: scale(1.05); }
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
