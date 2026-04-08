import { getToken, onMessage } from 'firebase/messaging';
import { toast } from 'sonner';

import { getFirebaseMessaging } from '@/lib/firebaseClient';
import { usersApi } from '@/services/api/usersApi';

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

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    toast.error('Push notifications permission not granted');
    return null;
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    toast.error('Push notifications are not available (missing Firebase config)');
    return null;
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    toast.error('Missing VAPID key for web push');
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  }).catch(() => null);

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
