/**
 * Messaging API Service
 * Handles conversations and messaging between users
 * 
 * @docs /api/messaging/
 */

import apiClient from './apiClient';
import { MESSAGING_ENDPOINTS, PAGINATION } from './apiConstants';
import { handleAPIError } from './apiErrorHandler';

interface Participant {
    id: string;
    username: string;
    is_seller: boolean;
}

interface OtherParticipant {
    id: string;
    role: 'BUYER' | 'SHOP';
    username: string;
    name: string;
    image: string | null;
    shop_id?: number;
}

export interface ApiMessage {
    id: number;
    sender_username: string;
    sender_display_name?: string;
    sender_image?: string | null;
    content: string;
    image?: string | null;
    voice_record?: string | null;
    replied_to?: number | null;
    replied_to_data?: {
        id: number;
        sender_username: string;
        content: string;
        image?: string | null;
        voice_record?: string | null;
    } | null;
    is_read: boolean;
    timestamp: string;
    sender?: number | string;
    sender_id?: number | string;
    sent_as_shop?: any;
}

export interface ApiConversation {
    id: number;
    participants: Participant[];
    messages: ApiMessage[];
    last_message?: ApiMessage;
    unread_count: number;
    created_at: string;
    updated_at: string;
    initiator_role: 'BUYER' | 'SHOP';
    recipient_role: 'BUYER' | 'SHOP';
    other_participant: OtherParticipant | null;
    conversation_type: 'user_shop' | 'user_user' | 'shop_shop';
    self_role?: 'BUYER' | 'SHOP';
}

/**
 * Maps backend message to frontend format
 */
const mapMessage = (m: ApiMessage) => ({
    id: String(m.id),
    sender_username: m.sender_username,
    sender_display_name: m.sender_display_name,
    sender_image: m.sender_image,
    content: m.content,
    image: m.image,
    voice_record: m.voice_record,
    replied_to: m.replied_to ? String(m.replied_to) : null,
    replied_to_data: m.replied_to_data ? {
        id: String(m.replied_to_data.id),
        sender_username: m.replied_to_data.sender_username,
        content: m.replied_to_data.content,
        image: m.replied_to_data.image,
        voice_record: m.replied_to_data.voice_record,
    } : null,
    is_read: m.is_read,
    timestamp: m.timestamp,
    sender: m.sender || m.sender_id,
    sent_as_shop: m.sent_as_shop,
});

/**
 * Maps backend conversation to frontend format
 */
const mapConversation = (c: ApiConversation) => ({
    id: String(c.id),
    participants: c.participants,
    messages: c.messages ? c.messages.map(mapMessage) : [],
    lastMessage: c.last_message ? mapMessage(c.last_message) : undefined,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    otherParticipant: c.other_participant,
    type: c.conversation_type,
    unreadCount: c.unread_count,
    selfRole: c.self_role || 'BUYER',
});

interface PaginatedResponse<T> {
    count: number;
    next?: string;
    previous?: string;
    results: T[];
}

export const messagingApi = {
    /**
     * List all conversations for authenticated user
     */
    listConversations: async (
        page: number = PAGINATION.DEFAULT_PAGE,
        pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE
    ): Promise<PaginatedResponse<any>> => {
        try {
            const response = await apiClient.get<PaginatedResponse<ApiConversation>>(
                MESSAGING_ENDPOINTS.LIST_CONVERSATIONS,
                {
                    params: { page, page_size: pageSize },
                }
            );
            return {
                ...response.data,
                results: response.data.results.map(mapConversation),
            };
        } catch (error: any) {
            throw handleAPIError(error, 'List Conversations');
        }
    },

    getUnreadSummary: async (): Promise<{ totalUnread: number; conversationsWithUnread: number }> => {
        try {
            const response = await apiClient.get<{ total_unread: number; conversations_with_unread: number }>(
                MESSAGING_ENDPOINTS.UNREAD_SUMMARY
            );
            return {
                totalUnread: Number(response.data.total_unread || 0),
                conversationsWithUnread: Number(response.data.conversations_with_unread || 0),
            };
        } catch (error: any) {
            throw handleAPIError(error, 'Get Unread Summary');
        }
    },

    /**
     * Start a new conversation or retrieve existing one
     */
    startConversation: async (id: string, role: 'BUYER' | 'SHOP' = 'BUYER', isShop = false): Promise<any> => {
        try {
            const payload = isShop
                ? { shop_id: id, role, conversation_type: 'user_shop' }
                : { recipient_id: id, role };
            const response = await apiClient.post<ApiConversation>(
                MESSAGING_ENDPOINTS.START_CONVERSATION,
                payload
            );
            return mapConversation(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Start Conversation');
        }
    },

    /**
     * Get conversation details with all messages
     */
    getConversationById: async (
        conversationId: string | number
    ): Promise<any> => {
        try {
            const response = await apiClient.get<ApiConversation>(
                MESSAGING_ENDPOINTS.GET_CONVERSATION_DETAIL(conversationId)
            );
            return mapConversation(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Get Conversation Details');
        }
    },

    /**
     * Send a message in a conversation
     */
    sendMessage: async (
        conversationId: string | number,
        messageData: { content?: string, image?: any, voice_record?: any, send_as_shop_id?: string | number, replied_to_id?: string | number }
    ): Promise<any> => {
        try {
            const formData = new FormData();
            if (messageData.content) formData.append('content', messageData.content);
            if (messageData.send_as_shop_id) formData.append('send_as_shop_id', String(messageData.send_as_shop_id));
            if (messageData.replied_to_id) formData.append('replied_to_id', String(messageData.replied_to_id));

            if (messageData.image) {
                formData.append('image', messageData.image);
            }

            if (messageData.voice_record) {
                formData.append('voice_record', messageData.voice_record);
            }

            const response = await apiClient.post<ApiMessage>(
                MESSAGING_ENDPOINTS.SEND_MESSAGE(conversationId),
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            return mapMessage(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Send Message');
        }
    },

    updateMessage: async (
        conversationId: string | number,
        messageId: string | number,
        content: string
    ): Promise<any> => {
        try {
            const response = await apiClient.patch<ApiMessage>(
                MESSAGING_ENDPOINTS.EDIT_MESSAGE(conversationId, messageId),
                { content }
            );
            return mapMessage(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Update Message');
        }
    },

    deleteMessage: async (
        conversationId: string | number,
        messageId: string | number
    ): Promise<void> => {
        try {
            await apiClient.delete(MESSAGING_ENDPOINTS.DELETE_MESSAGE(conversationId, messageId));
        } catch (error: any) {
            throw handleAPIError(error, 'Delete Message');
        }
    },

    /**
     * Search conversations by query
     */
    searchConversations: async (
        query: string
    ): Promise<PaginatedResponse<any>> => {
        try {
            const response = await apiClient.get<PaginatedResponse<ApiConversation>>(
                MESSAGING_ENDPOINTS.LIST_CONVERSATIONS,
                {
                    params: { search: query },
                }
            );
            return {
                ...response.data,
                results: response.data.results.map(mapConversation),
            };
        } catch (error: any) {
            throw handleAPIError(error, 'Search Conversations');
        }
    },

    /**
     * Mark all messages in a conversation as read
     */
    markAsRead: async (conversationId: string | number): Promise<void> => {
        try {
            await apiClient.post(MESSAGING_ENDPOINTS.MARK_READ(conversationId));
        } catch (error: any) {
            throw handleAPIError(error, 'Mark Conversation Read');
        }
    },

    startAudioCall: async (conversationId: string | number): Promise<{ status: string; recipients: number }> => {
        try {
            const startCallEndpoint = MESSAGING_ENDPOINTS.START_CALL(conversationId);

            const response = await apiClient.post<{ status: string; recipients: number }>(
                startCallEndpoint,
                { call_type: 'audio' }
            );
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Start Audio Call');
        }
    },

    sendCallSignal: async (
        conversationId: string | number,
        signalType: 'offer' | 'answer' | 'ice' | 'end',
        payload: Record<string, any> = {}
    ): Promise<void> => {
        try {
            await apiClient.post(
                MESSAGING_ENDPOINTS.SEND_CALL_SIGNAL(conversationId),
                {
                    signal_type: signalType,
                    payload,
                }
            );
        } catch (error: any) {
            throw handleAPIError(error, 'Send Call Signal');
        }
    },

    endCall: async (conversationId: string | number): Promise<void> => {
        return messagingApi.sendCallSignal(conversationId, 'end', {});
    },
};
