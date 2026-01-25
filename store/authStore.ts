import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { storage } from '@/services/storage';

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string, refreshToken: string) => void;
    updateUser: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            setAuth: (user, token, refreshToken) => {
                storage.setItem('token', token);
                storage.setItem('refreshToken', refreshToken);
                set({ user, token, refreshToken, isAuthenticated: true });
            },
            updateUser: (user) => set({ user }),
            logout: () => {
                storage.clear();
                set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
