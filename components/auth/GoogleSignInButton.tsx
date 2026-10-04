'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import { authApi, GoogleAuthResponse } from '@/services/api/authApi';
import { useAuthStore } from '@/store/authStore';

interface GoogleSignInButtonProps {
    text?: string;
    referralCode?: string;
    className?: string;
    onSuccess?: (response: GoogleAuthResponse) => void;
}

function GoogleSignInInner({
    text = 'Continue with Google',
    referralCode,
    className = '',
    onSuccess,
}: GoogleSignInButtonProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams?.get('redirect') || '/';
    const { setAuth } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                const response = await authApi.googleAuth({
                    access_token: tokenResponse.access_token,
                    referral_code: referralCode,
                });

                // Store authentication
                setAuth(
                    {
                        id: response.user?.id || '',
                        email: response.user?.email || '',
                        username: response.user?.username || response.user?.email?.split('@')[0] || 'User',
                        number: response.user?.number || '',
                        role: response.user?.role || (response.user?.is_seller ? 'seller' : 'buyer'),
                        createdAt: response.user?.date_joined || new Date().toISOString(),
                        referralCode: response.user?.referral_code || response.user?.number || '',
                        image: response.user?.image || null,
                        has_shop: response.user?.has_shop || false,
                        location: response.user?.location || '',
                    } as any,
                    response.access,
                    response.refresh
                );

                if (onSuccess) {
                    onSuccess(response);
                    return;
                }

                // Check if user needs to complete profile (enter phone number and location)
                const isProfileIncomplete =
                    !response.profile_completed ||
                    !response.user?.number ||
                    !response.user?.location;

                if (isProfileIncomplete) {
                    toast.info('Please enter your phone number and location to continue');
                    router.push(`/complete-profile?redirect=${encodeURIComponent(redirectTo)}`);
                } else {
                    toast.success('Welcome back!');
                    router.push(redirectTo);
                }
            } catch (error: any) {
                console.error('Google authentication error:', error);
                toast.error(error.message || 'Google authentication failed. Please try again.');
            } finally {
                setLoading(false);
            }
        },
        onError: (errorResponse) => {
            console.error('Google Login Error:', errorResponse);
            toast.error('Google Sign-In was cancelled or failed.');
        },
    });

    return (
        <button
            type="button"
            disabled={loading}
            onClick={() => loginWithGoogle()}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3 border border-border/80 bg-background/60 hover:bg-surface/80 text-text font-semibold rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${className}`}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                </svg>
            )}
            <span className="text-sm font-medium">{loading ? 'Connecting...' : text}</span>
        </button>
    );
}

export function GoogleSignInButton(props: GoogleSignInButtonProps) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
        return (
            <button
                type="button"
                onClick={() => {
                    toast.info(
                        'Google Sign-In is ready! Please configure NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment to connect with your Google Cloud project.',
                        { duration: 6000 }
                    );
                }}
                className={`w-full flex items-center justify-center gap-3 px-4 py-3 border border-border/80 bg-background/60 hover:bg-surface/80 text-text font-semibold rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer ${props.className || ''}`}
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                </svg>
                <span className="text-sm font-medium">{props.text || 'Continue with Google'}</span>
            </button>
        );
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <GoogleSignInInner {...props} />
        </GoogleOAuthProvider>
    );
}
