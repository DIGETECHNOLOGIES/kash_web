import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from '@/types';
import { toast } from 'sonner';

interface CartState {
    items: CartItem[];
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product, quantity = 1) => {
                const items = get().items;
                const existingItem = items.find((item) => item.product.id === product.id);

                if (existingItem) {
                    const newQuantity = existingItem.quantity + quantity;
                    set({
                        items: items.map((item) =>
                            item.product.id === product.id ? { ...item, quantity: newQuantity } : item
                        ),
                    });
                    toast.success(`Updated ${product.name} quantity in cart`);
                } else {
                    set({
                        items: [...items, { id: Math.random().toString(36).substr(2, 9), product, quantity, shopId: product.shopId }],
                    });
                    toast.success(`Added ${product.name} to cart`);
                }
            },
            removeItem: (productId) => {
                const items = get().items;
                const itemToRemove = items.find(i => i.product.id === productId);
                set({
                    items: items.filter((item) => item.product.id !== productId),
                });
                if (itemToRemove) {
                    toast.info(`Removed ${itemToRemove.product.name} from cart`);
                }
            },
            updateQuantity: (productId, quantity) => {
                const items = get().items;
                set({
                    items: items.map((item) =>
                        item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
                    ),
                });
            },
            clearCart: () => set({ items: [] }),
            getTotal: () => {
                return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
            },
        }),
        {
            name: 'cart-storage',
        }
    )
);
