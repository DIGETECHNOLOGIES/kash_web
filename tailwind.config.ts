import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#059669',
                    dark: '#047857',
                    light: '#34D399',
                },
                secondary: '#1E293B',
                background: {
                    DEFAULT: '#F8FAFC',
                    dark: '#0F172A',
                },
                surface: {
                    DEFAULT: '#FFFFFF',
                    dark: '#1E293B',
                },
                text: {
                    DEFAULT: '#0F172A',
                    secondary: '#64748B',
                },
                border: '#E2E8F0',
                error: '#EF4444',
                success: '#10B981',
                warning: '#F59E0B',
                info: '#3B82F6',
            },
            borderRadius: {
                'sm': '6px',
                'md': '12px',
                'lg': '16px',
                'xl': '24px',
            },
            fontFamily: {
                sans: ["var(--font-outfit)", "ui-sans-serif", "system-ui"],
            },
        },
    },
    plugins: [],
};
export default config;
