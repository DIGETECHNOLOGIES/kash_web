'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { attachForegroundPushListener, enableWebPushNotifications } from '@/lib/webPush';

function isStandaloneDisplayMode(): boolean {
  if (typeof window === 'undefined') return false;
  // iOS Safari
  const nav: any = navigator;
  if (nav.standalone) return true;
  // Standard
  return window.matchMedia?.('(display-mode: standalone)')?.matches ?? false;
}

export function WebPushPrompt() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const canPrompt = useMemo(() => {
    if (typeof window === 'undefined') return false;
    if (process.env.NODE_ENV !== 'production') return false;
    if (!('Notification' in window)) return false;
    if (!('serviceWorker' in navigator)) return false;
    if (!isStandaloneDisplayMode()) return false;

    // Browsers require a user gesture to trigger the permission UI.
    // We only show a prompt when permission is still undecided.
    if (Notification.permission !== 'default') return false;

    const dismissed = window.localStorage.getItem('kash:webpush_prompt:dismissed');
    return dismissed !== '1';
  }, []);

  useEffect(() => {
    void attachForegroundPushListener();
  }, []);

  useEffect(() => {
    if (!canPrompt) return;
    // Show the prompt on first PWA open (user must click to grant).
    setOpen(true);
  }, [canPrompt]);

  const handleDismiss = () => {
    try {
      window.localStorage.setItem('kash:webpush_prompt:dismissed', '1');
    } catch {
      // ignore
    }
    setOpen(false);
  };

  const handleEnable = async () => {
    setBusy(true);
    try {
      const token = await enableWebPushNotifications();
      if (token) {
        try {
          window.localStorage.setItem('kash:webpush_prompt:dismissed', '1');
        } catch {
          // ignore
        }
        setOpen(false);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={handleDismiss}
      title="Enable Notifications"
      className="max-w-lg"
    >
      <div className="p-8 space-y-6">
        <p className="text-sm font-medium text-text-secondary leading-relaxed">
          To receive order updates and new message alerts on your installed app, allow notifications.
        </p>

        <div className="flex gap-3">
          <Button
            className="flex-1 h-12 rounded-2xl font-black uppercase italic"
            onClick={handleEnable}
            isLoading={busy}
          >
            Allow notifications
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-2xl font-black uppercase italic"
            onClick={handleDismiss}
            disabled={busy}
          >
            Not now
          </Button>
        </div>

        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
          You can enable this later in Notifications.
        </p>
      </div>
    </Modal>
  );
}
