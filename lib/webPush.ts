import { getToken, onMessage } from 'firebase/messaging';
import { toast } from 'sonner';

import { getFirebaseMessaging } from '@/lib/firebaseClient';
import { usersApi } from '@/services/api/usersApi';

function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOS13Plus = navigator.platform === 'MacIntel' && (navigator.maxTouchPoints ?? 0) > 1;
  return iOS || iPadOS13Plus;
}

function isStandaloneDisplayMode(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  if (nav.standalone) return true;
  return window.matchMedia?.('(display-mode: standalone)')?.matches ?? false;
}

function hasFirebaseMessagingConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
}

export async function enableWebPushNotifications(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (process.env.NODE_ENV === 'development') {
    toast.error('Push notifications require a production build (service worker disabled in dev)');
    return null;
  }
  if (!('Notification' in window)) {
    toast.error('Push notifications are not supported on this browser');
    return null;
  }
  if (!('serviceWorker' in navigator)) {
    toast.error('Service workers are not supported on this browser');
    return null;
  }

  if (isIOSDevice() && !isStandaloneDisplayMode()) {
    toast.error('Install the app first: Add to Home Screen, then enable notifications');
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    toast.error('Push notifications permission not granted');
    return null;
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    if (!hasFirebaseMessagingConfig()) {
      toast.error('Push notifications are not available (missing Firebase config)');
    } else {
      toast.error('Push notifications are not supported on this browser');
      if (isIOSDevice()) {
        toast.message('iPhone/iPad tip: requires iOS 16.4+ and Add to Home Screen');
      }
    }
    return null;
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    toast.error('Missing VAPID key for web push');
    return null;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    toast.error('Service worker not found');
    return null;
  }

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  }).catch((err) => {
    console.error('Push token error:', err);
    return null;
  });

  if (!token) {
    toast.error('Could not get push token');
    return null;
  }

  await usersApi.updatePushToken(token);
  toast.success('Push notifications enabled');
  return token;
}

let foregroundListenerAttached = false;

export async function attachForegroundPushListener(): Promise<void> {
  if (foregroundListenerAttached) return;
  foregroundListenerAttached = true;

  const messaging = await getFirebaseMessaging();
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    const title = payload.notification?.title || 'KASH';
    const body = payload.notification?.body || payload.data?.message || '';
    toast(title, { description: body });
  });
}
