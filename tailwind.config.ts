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
                secondary: {
                    DEFAULT: '#1E293B',
                    dark: '#334155',
                },
                background: {
                    DEFAULT: '#F8FAFC',
                    dark: '#0F172A',
                },
                surface: {
                    DEFAULT: '#FFFFFF',
                    dark: '#1E293B',
                },
                card: {
                    DEFAULT: '#FFFFFF',
                    dark: '#1E293B',
                },
                text: {
                    DEFAULT: '#0F172A',
                    dark: '#F8FAFC',
                    secondary: {
                        DEFAULT: '#64748B',
                        dark: '#94A3B8',
                    }
                },
                border: {
                    DEFAULT: '#E2E8F0',
                    dark: '#334155',
                },
                error: '#EF4444',
                success: '#10B981',
                warning: '#F59E0B',
                info: '#3B82F6',
                disabled: {
                    DEFAULT: '#CBD5E1',
                    dark: '#475569',
                }
            },
            spacing: {
                'xs': '4px',
                'sm': '8px',
                'md': '16px',
                'lg': '24px',
                'xl': '32px',
                'xxl': '48px',
            },
            borderRadius: {
                'sm': '6px',
                'md': '12px',
                'lg': '16px',
                'xl': '24px',
                'full': '9999px',
            },
            fontSize: {
                'xs': ['12px', '16px'],
                'sm': ['14px', '20px'],
                'md': ['16px', '24px'],
                'lg': ['18px', '28px'],
                'xl': ['20px', '28px'],
                'xxl': ['24px', '32px'],
                'xxxl': ['32px', '40px'],
            },
            fontWeight: {
                regular: '400',
                medium: '500',
                semibold: '600',
                bold: '700',
            },
            boxShadow: {
                'sm': '0 2px 3px rgba(0,0,0,0.05)',
                'md': '0 4px 6px rgba(0,0,0,0.08)',
                'lg': '0 10px 12px rgba(0,0,0,0.1)',
            },
            fontFamily: {
                sans: ["var(--font-outfit)", "ui-sans-serif", "system-ui"],
            },
        },
    },
    plugins: [],
};
export default config;
