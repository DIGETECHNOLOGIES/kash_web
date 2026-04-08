
import { API_CONFIG } from '@/constants/config';

export const formatCurrency = (amount: number): string => {
    return `${amount?.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })} FCFA`;
};

export const formatDate = (date: string): string => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatDateTime = (date: string): string => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

export const formatChatTime = (date: string): string => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

export const isSameDay = (date1: string, date2: string): boolean => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};

export const formatPhoneNumber = (phone: string): string => {
    return phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
};

export const calculateDiscount = (price: number, previousPrice?: number): number => {
    if (!previousPrice || previousPrice <= price) return 0;
    return Math.round(((previousPrice - price) / previousPrice) * 100);
};

export const formatError = (error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.userMessage) return error.userMessage;

    const errorMessage: string = Object.entries(error || {})
        .map(([key, value]) => {
            const msg = Array.isArray(value)
                ? value.join(', ')
                : typeof value === 'string'
                    ? value
                    : String(value);
            return `${key}: ${msg}`;
        })
        .join('\n');

    return errorMessage || 'Unknown error';
}

export const formatImageUrl = (url: any): string => {
    const CONTABO_HOST = 'https://eu2.contabostorage.com';
    const CONTABO_NAMESPACE = '9c9ad2677b6747cdb1d33e49a634f65e:kashdev';
    const CONTABO_PUBLIC_BASE = `${CONTABO_HOST}/${CONTABO_NAMESPACE}`;

    const resolveInput = (value: any): string | undefined => {
        if (!value) return undefined;
        if (typeof value === 'string') return value.trim();
        if (Array.isArray(value)) {
            const firstString = value.find((item) => typeof item === 'string' && item.trim());
            return typeof firstString === 'string' ? firstString.trim() : undefined;
        }
        if (typeof value === 'object') {
            if (typeof value.uri === 'string') return value.uri.trim();
            if (typeof value.url === 'string') return value.url.trim();
        }
        return undefined;
    };

    const rawUrl = resolveInput(url);
    const fallback = 'https://via.placeholder.com/150';
    if (!rawUrl) return fallback;

    if (rawUrl.startsWith('file://') || rawUrl.startsWith('data:')) {
        return rawUrl;
    }

    const normalizeStoragePath = (value: string): string => {
        const pathWithoutQuery = value.split('?')[0].split('#')[0];
        let clean = pathWithoutQuery.replace(/^\/+/, '');

        try {
            clean = decodeURIComponent(clean);
        } catch {
            clean = clean;
        }

        if (clean.startsWith(`${CONTABO_NAMESPACE}/`)) {
            clean = clean.slice(`${CONTABO_NAMESPACE}/`.length);
        } else if (clean.startsWith('kashdev/')) {
            clean = clean.slice('kashdev/'.length);
        }

        if (clean.startsWith('media/')) {
            clean = clean.slice('media/'.length);
        }

        return clean.replace(/^\/+/, '').replace(/\/+/g, '/');
    };

    const isLikelyMediaPath = (path: string): boolean => {
        return /^(messages|profiles|shop_images|verification_documents|products|shops|users|reviews|wallet|uploads|banners)\//.test(path);
    };

    const toPublicContaboUrl = (pathValue: string): string => {
        const normalized = normalizeStoragePath(pathValue);
        return `${CONTABO_PUBLIC_BASE}/${normalized}`;
    };

    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        try {
            const parsed = new URL(rawUrl);
            const host = parsed.hostname.toLowerCase();
            const normalizedPath = normalizeStoragePath(parsed.pathname);
            const isKnownMediaHost =
                host.includes('contabostorage.com') ||
                host.includes('api.digetech.org') ||
                host.includes('localhost') ||
                host === '127.0.0.1';

            if (host.includes('contabostorage.com')) {
                return toPublicContaboUrl(parsed.pathname);
            }

            if (isKnownMediaHost && (parsed.pathname.includes('/media/') || parsed.pathname.includes('/messages/') || isLikelyMediaPath(normalizedPath))) {
                return toPublicContaboUrl(parsed.pathname);
            }

            return rawUrl;
        } catch {
            return rawUrl;
        }
    }

    const normalizedRelative = normalizeStoragePath(rawUrl);
    if (rawUrl.startsWith('/media/') || rawUrl.includes('/messages/') || rawUrl.startsWith('media/') || rawUrl.startsWith('messages/') || isLikelyMediaPath(normalizedRelative)) {
        return toPublicContaboUrl(rawUrl);
    }

    const cleanRelative = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
    return `${API_CONFIG.BASE_URL}${cleanRelative}`;
};
