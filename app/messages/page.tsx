'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { messagingApi } from '@/services/api/messagingApi';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/authStore';
import { Search, Send, Image as ImageIcon, MessageSquare, ChevronLeft, MoreVertical, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function MessagesPage() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [selectedId, setSelectedId] = useState<number | string | null>(null);
    const [inputText, setInputText] = useState('');

    const { data: conversationsData, isLoading: isLoadingList } = useQuery({
        queryKey: ['conversations'],
        queryFn: () => messagingApi.listConversations(),
    });

    const { data: activeConversation, isLoading: isLoadingChat } = useQuery({
        queryKey: ['conversation', selectedId],
        queryFn: () => messagingApi.getConversationById(selectedId!),
        enabled: !!selectedId,
    });

    const sendMutation = useMutation({
        mutationFn: (content: string) => messagingApi.sendMessage(selectedId!, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversation', selectedId] });
            setInputText('');
        },
    });

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        sendMutation.mutate(inputText);
    };

    const conversations = conversationsData?.results || [];

    return (
        <MainLayout>
            <div className="h-[calc(100vh-10rem)] flex overflow-hidden rounded-[2.5rem] border border-border bg-surface shadow-2xl relative">

                {/* Conversations Sidebar */}
                <div className={cn(
                    "w-full lg:w-96 border-r border-border flex flex-col transition-all duration-300",
                    selectedId ? "hidden lg:flex" : "flex"
                )}>
                    <div className="p-6 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10">
                        <h1 className="text-xl font-black italic italic uppercase tracking-tighter mb-4">Messages</h1>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                            <input
                                type="text"
                                placeholder="Search chats..."
                                className="w-full h-10 rounded-xl bg-background border border-border pl-10 pr-4 text-sm focus:border-primary focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {isLoadingList ? (
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-background/50" />
                            ))
                        ) : conversations.length === 0 ? (
                            <div className="p-12 text-center text-text-secondary text-xs font-bold uppercase tracking-widest">
                                No conversations yet
                            </div>
                        ) : (
                            conversations.map((conv: any) => {
                                const isActive = selectedId === conv.id;
                                const other = conv.other_participant;
                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => setSelectedId(conv.id)}
                                        className={cn(
                                            "w-full flex items-center gap-4 p-4 rounded-3xl transition-all duration-200 group text-left",
                                            isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-primary/5"
                                        )}
                                    >
                                        <div className="h-12 w-12 rounded-2xl bg-background flex items-center justify-center text-primary shrink-0 relative">
                                            <MessageSquare size={20} className={isActive ? "text-white" : ""} />
                                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <h3 className="font-bold text-sm truncate uppercase tracking-tight">{other?.name || other?.username || 'Unknown'}</h3>
                                                <span className={cn("text-[10px] uppercase font-bold", isActive ? "text-white/70" : "text-text-secondary")}>
                                                    {format(new Date(conv.created_at), 'HH:mm')}
                                                </span>
                                            </div>
                                            <p className={cn("text-xs truncate", isActive ? "text-white/80" : "text-text-secondary")}>
                                                {conv.last_message?.content || 'No messages yet'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={cn(
                    "flex-1 flex flex-col bg-background/30 backdrop-blur-sm",
                    !selectedId ? "hidden lg:flex" : "flex"
                )}>
                    {selectedId ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 px-6 border-b border-border bg-surface/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="lg:hidden rounded-xl"
                                        onClick={() => setSelectedId(null)}
                                    >
                                        <ChevronLeft size={20} />
                                    </Button>
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {activeConversation?.other_participant?.name?.[0].toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-sm uppercase tracking-tighter">
                                            {activeConversation?.other_participant?.name || 'Loading...'}
                                        </h2>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Online</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="rounded-xl"><Smartphone size={18} /></Button>
                                    <Button variant="ghost" size="icon" className="rounded-xl"><MoreVertical size={18} /></Button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
                                {isLoadingChat ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                                    </div>
                                ) : activeConversation?.messages?.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                                        <MessageSquare size={48} className="mb-4 text-primary" />
                                        <p className="font-black italic uppercase italic tracking-tighter">Say Hello!</p>
                                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Start a new conversation</p>
                                    </div>
                                ) : (
                                    activeConversation?.messages?.map((msg: any, i: number) => {
                                        // Check both ID and username for robustness
                                        const isOwn = (msg.sender === user?.id) || (msg.sender_username === user?.username);
                                        return (
                                            <div
                                                key={msg.id}
                                                className={cn(
                                                    "flex",
                                                    isOwn ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                <div className={cn(
                                                    "max-w-[80%] p-4 rounded-3xl text-sm shadow-sm",
                                                    isOwn
                                                        ? "bg-primary text-white rounded-tr-none"
                                                        : "bg-surface text-text rounded-tl-none border border-border"
                                                )}>
                                                    <p className="leading-relaxed">{msg.content}</p>
                                                    <div className={cn(
                                                        "text-[8px] font-bold uppercase tracking-widest mt-2",
                                                        isOwn ? "text-white/60 text-right" : "text-text-secondary"
                                                    )}>
                                                        {format(new Date(msg.timestamp), 'HH:mm')}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Chat Input */}
                            <div className="p-6 border-t border-border bg-surface/50 backdrop-blur-md">
                                <form onSubmit={handleSend} className="flex items-center gap-4">
                                    <Button type="button" variant="ghost" size="icon" className="rounded-2xl shrink-0"><ImageIcon size={20} /></Button>
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 h-12 rounded-2xl bg-background border border-border px-6 text-sm focus:border-primary focus:outline-none transition-all"
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        className="h-12 w-12 rounded-2xl shrink-0 shadow-lg shadow-primary/20"
                                        disabled={!inputText.trim() || sendMutation.isPending}
                                        isLoading={sendMutation.isPending}
                                    >
                                        <Send size={20} />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                            <div className="relative mb-8">
                                <div className="h-24 w-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary">
                                    <MessageSquare size={48} />
                                </div>
                                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-2xl bg-white shadow-xl flex items-center justify-center text-primary animate-bounce">
                                    <Sparkles size={16} />
                                </div>
                            </div>
                            <h2 className="text-2xl font-black italic italic uppercase tracking-tighter mb-2">Select a Conversation</h2>
                            <p className="text-sm text-text-secondary max-w-xs font-medium">Select a chat from the left to start messaging your customers or sellers.</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

function Sparkles(props: any) {
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
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    );
}
