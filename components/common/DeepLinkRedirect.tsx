'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function DeepLinkRedirect() {
    const pathname = usePathname();

    useEffect(() => {
        // const isAndroid = /android/i.test(navigator.userAgent);
        // const isAppPath =
        //     pathname.startsWith('/products/') ||
        //     pathname.startsWith('/product/') ||
        //     pathname.startsWith('/shops/') ||
        //     pathname.startsWith('/shop/');

        // if (isAndroid && isAppPath) {
        //     // Redirect to Play Store as requested
        //     window.location.replace("https://play.google.com/store/apps/details?id=com.kash.marketplace");
        // }
    }, [pathname]);

    return null;
}

