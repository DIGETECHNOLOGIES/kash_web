import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging';

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;

  const config = getFirebaseConfig();
  if (!config.apiKey || !config.projectId || !config.messagingSenderId || !config.appId) return null;

  const app = getApps().length ? getApps()[0] : initializeApp(config);
  return getMessaging(app);
}
