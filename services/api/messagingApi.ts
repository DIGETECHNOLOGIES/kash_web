
import apiClient from './apiClient';
import { MESSAGING_ENDPOINTS } from './apiConstants';
import { handleAPIError } from './apiErrorHandler';

export interface Message {
    id: number | string;
    sender_username: string;
    sender_display_name?: string;
    sender_image?: string | null;
    content: string;
    is_read: boolean;
    timestamp: string;
}

export interface Conversation {
    id: number | string;
    created_at: string;
    initiator_role: 'BUYER' | 'SHOP';
    recipient_role: 'BUYER' | 'SHOP';
    other_participant: {
        id: string;
        role: 'BUYER' | 'SHOP';
        username: string;
        name: string;
        image: string | null;
        shop_id?: number;
    } | null;
    messages?: Message[];
}

export const messagingApi = {
    listConversations: async (): Promise<any> => {
        try {
            const response = await apiClient.get<any>(MESSAGING_ENDPOINTS.LIST_CONVERSATIONS);
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'List Conversations');
        }
    },

    startConversation: async (params: { recipient_id?: string | number, shop_id?: string | number, shop_slug?: string, role?: 'BUYER' | 'SHOP' }): Promise<Conversation> => {
        try {
            const response = await apiClient.post<Conversation>(MESSAGING_ENDPOINTS.START_CONVERSATION, params);
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Start Conversation');
        }
    },

    getConversationById: async (conversationId: string | number): Promise<Conversation> => {
        try {
            const response = await apiClient.get<Conversation>(MESSAGING_ENDPOINTS.GET_CONVERSATION_DETAIL(conversationId));
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Get Conversation Details');
        }
    },

    sendMessage: async (conversationId: string | number, content: string): Promise<Message> => {
        try {
            const response = await apiClient.post<Message>(MESSAGING_ENDPOINTS.SEND_MESSAGE(conversationId), { content });
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Send Message');
        }
    },
};
