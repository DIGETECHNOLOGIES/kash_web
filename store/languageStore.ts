import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'fr';

interface LanguageState {
    language: Language | null;
    setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: 'en', // Default to English on web
            setLanguage: (language) => {
                set({ language });
                // Handle i18n change if implemented
            },
        }),
        {
            name: 'language-storage',
        }
    )
);
