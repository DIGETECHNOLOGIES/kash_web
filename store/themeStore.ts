import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
    mode: ThemeMode;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            mode: 'light',
            toggleTheme: () => {
                const newMode = get().mode === 'light' ? 'dark' : 'light';
                set({ mode: newMode });
                if (typeof document !== 'undefined') {
                    document.documentElement.classList.toggle('dark', newMode === 'dark');
                }
            },
            setTheme: (mode) => {
                set({ mode });
                if (typeof document !== 'undefined') {
                    document.documentElement.classList.toggle('dark', mode === 'dark');
                }
            },
        }),
        {
            name: 'theme-storage',
        }
    )
);
