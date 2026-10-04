'use client';

/**
 * CallUI.tsx
 *
 * Three exported components:
 *  - <IncomingCallOverlay />  — full-screen overlay that appears when a call arrives
 *  - <ActiveCallModal />      — floating call window during an active call
 *  - <GlobalCallProvider />   — mounts both; add once in the app root layout
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { callService, CallEvent, CallType, CallState } from '@/services/callService';
import {
  PhoneCall,
  PhoneOff,
  PhoneIncoming,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  X,
} from 'lucide-react';

// ─── Helper ───────────────────────────────────────────────────────────────────

function useCallTimer(running: boolean) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!running) { setSecs(0); return; }
    const id = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

// ─── Incoming Call Overlay ────────────────────────────────────────────────────

interface IncomingCallOverlayProps {
  callerName: string;
  callerId: string;
  conversationId: string;
  callType: CallType;
  onClose: () => void;
}

const IncomingCallOverlay: React.FC<IncomingCallOverlayProps> = ({
  callerName,
  callerId,
  conversationId,
  callType,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger mount animation
    const id = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(id);
  }, []);

  const initial = callerName.charAt(0).toUpperCase();

  const handleAccept = async () => {
    await callService.acceptCall(conversationId, callType);
    onClose();
  };

  const handleReject = async () => {
    await callService.rejectCall();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, #1a1a2e, #16213e, #0f3460)',
          borderRadius: 24,
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          minWidth: 340,
          boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.08)',
          transform: visible ? 'scale(1)' : 'scale(0.9)',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Caller avatar with pulse */}
        <div style={{ position: 'relative' }}>
          {/* Pulse rings */}
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              position: 'absolute',
              inset: -(i * 14),
              borderRadius: '50%',
              border: '2px solid rgba(34,197,94,0.3)',
              animation: `callPulse ${0.9 + i * 0.35}s ease-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }} />
          ))}
          <div style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            fontWeight: 700,
            color: '#fff',
            boxShadow: '0 0 0 4px rgba(34,197,94,0.4)',
            position: 'relative',
            zIndex: 1,
          }}>
            {initial}
          </div>
        </div>

        {/* Labels */}
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <p style={{ color: '#9ca3af', fontSize: 13, margin: 0, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
            {callType === 'video' ? '📹 Incoming Video Call' : '📞 Incoming Audio Call'}
          </p>
          <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 700, margin: 0 }}>{callerName}</h2>
          <p style={{ color: '#9ca3af', fontSize: 14, margin: '6px 0 0' }}>is calling you…</p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 40, marginTop: 12 }}>
          {/* Reject */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handleReject}
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#ef4444',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(239,68,68,0.5)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <PhoneOff size={26} color="#fff" />
            </button>
            <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 500 }}>Decline</span>
          </div>

          {/* Accept */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handleAccept}
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#22c55e',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(34,197,94,0.5)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {callType === 'video' ? <Video size={26} color="#fff" /> : <PhoneCall size={26} color="#fff" />}
            </button>
            <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 500 }}>Accept</span>
          </div>
        </div>
      </div>

      {/* Keyframe style */}
      <style>{`
        @keyframes callPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// ─── Active Call Modal ────────────────────────────────────────────────────────

interface ActiveCallModalProps {
  remoteUserName: string;
  callType: CallType;
  onClose: () => void;
}

const ActiveCallModal: React.FC<ActiveCallModalProps> = ({ remoteUserName, callType, onClose }) => {
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [connected, setConnected] = useState(callService.state === 'connected');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const duration = useCallTimer(connected);

  // Attach local stream to video element
  useEffect(() => {
    const stream = callService.localStream;
    if (stream && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  }, []);

  // Listen for call events
  useEffect(() => {
    const unsub = callService.on((event: CallEvent) => {
      switch (event.type) {
        case 'remote_stream':
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.stream;
          }
          setConnected(true);
          break;
        case 'call_accepted':
          setConnected(true);
          break;
        case 'call_ended':
        case 'call_rejected':
        case 'state_changed':
          if ((event as any).state === 'idle' || event.type === 'call_ended' || event.type === 'call_rejected') {
            onClose();
          }
          break;
      }
    });
    return unsub;
  }, [onClose]);

  const handleEnd = async () => {
    await callService.endCall();
    onClose();
  };

  const handleMute = () => { setMuted(callService.toggleMute()); };
  const handleVideo = () => { setVideoOff(callService.toggleVideo()); };

  const initial = remoteUserName.charAt(0).toUpperCase();
  const isVideo = callType === 'video';

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 9998,
      width: isVideo ? 420 : 320,
      background: 'linear-gradient(145deg, #0f172a, #1e293b)',
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      {/* Remote video / audio avatar */}
      <div style={{ position: 'relative', background: '#0f172a', minHeight: isVideo ? 220 : 130 }}>
        {isVideo ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            height: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#fff'
            }}>{initial}</div>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>{remoteUserName}</span>
            <span style={{ color: '#9ca3af', fontSize: 13 }}>{connected ? duration : 'Calling…'}</span>
          </div>
        )}

        {/* Local PIP for video */}
        {isVideo && (
          <div style={{
            position: 'absolute', top: 10, right: 10, width: 90, height: 120,
            borderRadius: 10, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', zIndex: 10,
          }}>
            <video ref={localVideoRef} autoPlay playsInline muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
          </div>
        )}

        {/* Duration overlay (video) */}
        {isVideo && connected && (
          <span style={{
            position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.5)',
            color: '#fff', fontSize: 12, padding: '3px 10px', borderRadius: 12, fontWeight: 600,
          }}>{duration}</span>
        )}
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex', justifyContent: 'space-evenly', alignItems: 'center',
        padding: '14px 20px', background: 'rgba(0,0,0,0.4)',
      }}>
        <CtrlBtn icon={muted ? <MicOff size={18} /> : <Mic size={18} />} label={muted ? 'Unmute' : 'Mute'} active={muted} onClick={handleMute} />
        {isVideo && (
          <CtrlBtn icon={videoOff ? <VideoOff size={18} /> : <Video size={18} />} label={videoOff ? 'Cam on' : 'Cam off'} active={videoOff} onClick={handleVideo} />
        )}
        {/* End call */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <button
            onClick={handleEnd}
            style={{
              width: 50, height: 50, borderRadius: '50%', background: '#ef4444',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(239,68,68,0.5)',
            }}>
            <PhoneOff size={22} color="#fff" />
          </button>
          <span style={{ color: '#9ca3af', fontSize: 11 }}>End</span>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-component ────────────────────────────────────────────────────────────

const CtrlBtn: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
    <button
      onClick={onClick}
      style={{
        width: 42, height: 42, borderRadius: '50%',
        background: active ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.12)',
        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
        transition: 'background 0.2s',
      }}
    >{icon}</button>
    <span style={{ color: '#9ca3af', fontSize: 11 }}>{label}</span>
  </div>
);

// ─── Global Call Provider ─────────────────────────────────────────────────────

interface IncomingState {
  callerName: string;
  callerId: string;
  conversationId: string;
  callType: CallType;
}

interface ActiveState {
  remoteUserName: string;
  callType: CallType;
}

export const GlobalCallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incoming, setIncoming] = useState<IncomingState | null>(null);
  const [active, setActive] = useState<ActiveState | null>(null);

  useEffect(() => {
    const unsub = callService.on((event: CallEvent) => {
      switch (event.type) {
        case 'incoming_call':
          setIncoming({
            callerName: event.callerName,
            callerId: event.callerId,
            conversationId: event.conversationId,
            callType: event.callType,
          });
          break;
        case 'call_accepted':
          setActive(prev => prev ? prev : { remoteUserName: incoming?.callerName ?? 'User', callType: callService.callType });
          setIncoming(null);
          break;
        case 'state_changed':
          if (event.state === 'outgoing') {
            // Caller — show active modal immediately
          }
          if (event.state === 'idle') {
            setActive(null);
            setIncoming(null);
          }
          break;
        case 'call_ended':
        case 'call_rejected':
          setActive(null);
          setIncoming(null);
          break;
      }
    });
    return unsub;
  }, [incoming]);

  return (
    <>
      {children}
      {incoming && (
        <IncomingCallOverlay
          {...incoming}
          onClose={() => setIncoming(null)}
        />
      )}
      {active && !incoming && (
        <ActiveCallModal
          remoteUserName={active.remoteUserName}
          callType={active.callType}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
};

// Named exports for direct use in the messages page
export { IncomingCallOverlay, ActiveCallModal };
export default GlobalCallProvider;
