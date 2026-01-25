
export const storage = {
    setItem: (key: string, value: any) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
    },
    getItem: (key: string) => {
        if (typeof window !== 'undefined') {
            const value = localStorage.getItem(key);
            try {
                return value ? JSON.parse(value) : null;
            } catch {
                return value;
            }
        }
        return null;
    },
    removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
        }
    },
    clear: () => {
        if (typeof window !== 'undefined') {
            localStorage.clear();
        }
    },
};
