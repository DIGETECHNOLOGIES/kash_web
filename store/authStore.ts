import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { storage } from '@/services/storage';
import { useCartStore } from './cartStore';
import { useSavedStore } from './savedStore';
import { useNotificationStore } from './notificationStore';

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    setUser: (user: User) => void;
    setToken: (token: string) => void;
    setAuth: (user: User, token: string, refreshToken: string) => void;
    updateUser: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,

            setUser: (user) => {
                // Map user data consistent with mobile app
                const mappedUser = {
                    ...user,
                    referralCode: (user as any).number,
                    has_shop: (user as any).has_shop,
                };
                set({
                    user: mappedUser,
                    isAuthenticated: !!mappedUser && !!get().token,
                });
                storage.setItem('user', mappedUser);
            },

            setToken: (token) => {
                set({
                    token,
                    isAuthenticated: !!token && !!get().user,
                });
                storage.setItem('token', token);
            },

            setAuth: (user, token, refreshToken) => {
                const mappedUser = {
                    ...user,
                    referralCode: (user as any).number,
                    has_shop: (user as any).has_shop,
                };
                set({
                    user: mappedUser,
                    token,
                    refreshToken,
                    isAuthenticated: true
                });
                storage.setItem('user', mappedUser);
                storage.setItem('token', token);
                storage.setItem('refreshToken', refreshToken);
            },

            updateUser: (user) => {
                const mappedUser = {
                    ...user,
                    referralCode: (user as any).number,
                    has_shop: (user as any).has_shop,
                };
                set({ user: mappedUser });
                storage.setItem('user', mappedUser);
            },

            logout: () => {
                // Clear storage
                storage.clear();

                // Reset state
                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    isAuthenticated: false
                });

                // Clear other stores
                useCartStore.getState().clearCart();
                useSavedStore.getState().clearSavedProducts();
                useNotificationStore.getState().clearNotifications();
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
