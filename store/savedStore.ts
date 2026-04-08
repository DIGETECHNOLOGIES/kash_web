import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface SavedState {
    savedProducts: Product[];
    saveProduct: (product: Product) => void;
    removeProduct: (productId: string) => void;
    isSaved: (productId: string) => boolean;
    clearSavedProducts: () => void;
}

export const useSavedStore = create<SavedState>()(
    persist(
        (set, get) => ({
            savedProducts: [],
            saveProduct: (product: Product) => {
                const { savedProducts } = get();
                if (!savedProducts.find((p) => p.id === product.id)) {
                    set({ savedProducts: [...savedProducts, product] });
                }
            },
            removeProduct: (productId: string) => {
                const { savedProducts } = get();
                set({
                    savedProducts: savedProducts.filter((p) => p.id !== productId),
                });
            },
            isSaved: (productId: string) => {
                const { savedProducts } = get();
                return savedProducts.some((p) => p.id === productId);
            },
            clearSavedProducts: () => {
                set({ savedProducts: [] });
            },
        }),
        {
            name: 'saved-products-storage',
        }
    )
);
