/**
 * callService.ts  (Web / Next.js)
 *
 * Browser WebRTC signaling service that connects to the Django-Channels
 * endpoint:  wss://<host>/ws/call/<conversation_id>/
 *
 * Usage:
 *   import { callService } from '@/services/callService';
 *   callService.on(event => ...)
 *   await callService.startCall(conversationId, 'audio')
 */

import { storage } from './storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CallType = 'audio' | 'video';

export type CallState =
  | 'idle'
  | 'outgoing'
  | 'incoming'
  | 'connected'
  | 'ended';

export type CallEvent =
  | { type: 'incoming_call'; callType: CallType; callerName: string; callerId: string; conversationId: string }
  | { type: 'call_accepted' }
  | { type: 'call_rejected' }
  | { type: 'call_ended' }
  | { type: 'call_busy' }
  | { type: 'remote_stream'; stream: MediaStream }
  | { type: 'state_changed'; state: CallState };

type EventListener = (event: CallEvent) => void;

// ─── ICE Servers ──────────────────────────────────────────────────────────────

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

// ─── Ringtone ─────────────────────────────────────────────────────────────────

class RingtonePlayer {
  private audio: HTMLAudioElement | null = null;

  async play(incoming = false) {
    try {
      this.stop();
      this.audio = new Audio('/sounds/ringtone.mp3');
      this.audio.loop = true;
      this.audio.volume = 0.8;
      // Use the default system-like ringtone bundled in /public/sounds/
      await this.audio.play();
    } catch { /* Autoplay blocked — silently skip */ }
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
  }
}

// ─── Call Service ─────────────────────────────────────────────────────────────

class WebCallService {
  private socket: WebSocket | null = null;
  private pc: RTCPeerConnection | null = null;
  private conversationId: string | null = null;
  private listeners: EventListener[] = [];
  private ringtone = new RingtonePlayer();

  private _state: CallState = 'idle';
  private _localStream: MediaStream | null = null;
  private _callType: CallType = 'audio';

  // ── State accessors ────────────────────────────────────────────────────────

  get state() { return this._state; }
  get localStream() { return this._localStream; }
  get callType() { return this._callType; }

  // ── Event bus ──────────────────────────────────────────────────────────────

  on(listener: EventListener): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  private emit(event: CallEvent) {
    this.listeners.forEach(l => { try { l(event); } catch { /* ignore */ } });
  }

  private setState(state: CallState) {
    this._state = state;
    this.emit({ type: 'state_changed', state });
  }

  // ── Token helper ───────────────────────────────────────────────────────────

  private getToken(): string | null {
    // Try localStorage via our storage helper
    const raw = storage.getItem('token')
      ?? storage.getItem('auth-storage')?.state?.token;
    if (!raw) return null;
    const t = String(raw).trim();
    return t.startsWith('Bearer ') ? t.replace(/^Bearer\s+/i, '') : t;
  }

  // ── Signaling WebSocket ────────────────────────────────────────────────────

  private async openSignaling(conversationId: string): Promise<void> {
    this.closeSignaling();
    this.conversationId = conversationId;

    const token = this.getToken();
    if (!token) throw new Error('[WebCallService] Missing auth token');

    const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'https://api.digetech.org')
      .replace(/^http/, 'ws');
    const url = `${baseUrl}/ws/call/${conversationId}/?token=${encodeURIComponent(token)}`;

    this.socket = new WebSocket(url);

    this.socket.onmessage = (e) => {
      try { this.handleSignal(JSON.parse(e.data)); } catch { /* ignore */ }
    };

    await new Promise<void>((resolve, reject) => {
      this.socket!.onopen = () => resolve();
      this.socket!.onerror = () => reject(new Error('WebSocket connection failed'));
    });
  }

  private closeSignaling() {
    if (this.socket) {
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;
      try { this.socket.close(); } catch { /* ignore */ }
      this.socket = null;
    }
  }

  private send(data: object) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  // ── Signaling handler ──────────────────────────────────────────────────────

  private async handleSignal(data: any) {
    const myToken = this.getToken();
    // Ignore own echoes (identified by sender_id from token payload)
    switch (data.type) {
      case 'call.initiate': {
        this._callType = data.call_type ?? 'audio';
        this.setState('incoming');
        await this.ringtone.play(true);
        this.emit({
          type: 'incoming_call',
          callType: this._callType,
          callerName: data.caller_name ?? 'Unknown',
          callerId: data.sender_id,
          conversationId: this.conversationId ?? '',
        });
        break;
      }
      case 'call.accept': {
        this.ringtone.stop();
        this.setState('connected');
        // Caller creates + sends offer
        if (this.pc) {
          const offer = await this.pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: this._callType === 'video' });
          await this.pc.setLocalDescription(offer);
          this.send({ type: 'webrtc.offer', sdp: offer });
        }
        this.emit({ type: 'call_accepted' });
        break;
      }
      case 'call.reject':
        this.ringtone.stop();
        this.emit({ type: 'call_rejected' });
        await this.cleanup();
        break;

      case 'call.end':
        this.ringtone.stop();
        this.emit({ type: 'call_ended' });
        await this.cleanup();
        break;

      case 'call.busy':
        this.ringtone.stop();
        this.emit({ type: 'call_busy' });
        await this.cleanup();
        break;

      case 'webrtc.offer':
        if (this.pc && data.sdp) {
          await this.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          const answer = await this.pc.createAnswer();
          await this.pc.setLocalDescription(answer);
          this.send({ type: 'webrtc.answer', sdp: answer });
          this.setState('connected');
        }
        break;

      case 'webrtc.answer':
        if (this.pc && data.sdp) {
          await this.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        }
        break;

      case 'webrtc.ice':
        if (this.pc && data.candidate) {
          await this.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
        break;
    }
  }

  // ── Peer connection ────────────────────────────────────────────────────────

  private async createPeerConnection(callType: CallType): Promise<void> {
    this.destroyPC();

    this.pc = new RTCPeerConnection(ICE_SERVERS);

    // Get local media
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === 'video',
    });
    this._localStream = stream;
    stream.getTracks().forEach(t => this.pc!.addTrack(t, stream));

    // ICE candidates
    this.pc.onicecandidate = (e) => {
      if (e.candidate) this.send({ type: 'webrtc.ice', candidate: e.candidate });
    };

    // Remote stream
    this.pc.ontrack = (e) => {
      const remoteStream = e.streams[0];
      if (remoteStream) this.emit({ type: 'remote_stream', stream: remoteStream });
    };
  }

  private destroyPC() {
    this._localStream?.getTracks().forEach(t => t.stop());
    this._localStream = null;
    if (this.pc) { try { this.pc.close(); } catch { /* ignore */ } this.pc = null; }
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  async startCall(conversationId: string, callType: CallType = 'audio') {
    if (this._state !== 'idle') return;
    this._callType = callType;
    await this.openSignaling(conversationId);
    await this.createPeerConnection(callType);
    this.setState('outgoing');
    await this.ringtone.play(false);
    this.send({ type: 'call.initiate', call_type: callType });
  }

  async acceptCall(conversationId: string, callType: CallType) {
    this._callType = callType;
    this.ringtone.stop();
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      await this.openSignaling(conversationId);
    }
    await this.createPeerConnection(callType);
    this.setState('connected');
    this.send({ type: 'call.accept' });
  }

  async rejectCall() {
    this.ringtone.stop();
    this.send({ type: 'call.reject' });
    await this.cleanup();
  }

  async endCall() {
    this.ringtone.stop();
    this.send({ type: 'call.end' });
    await this.cleanup();
  }

  toggleMute(): boolean {
    const track = this._localStream?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; return !track.enabled; }
    return false;
  }

  toggleVideo(): boolean {
    const track = this._localStream?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; return !track.enabled; }
    return false;
  }

  private async cleanup() {
    this.closeSignaling();
    this.destroyPC();
    this.conversationId = null;
    this.setState('idle');
  }
}

// Export singleton
export const callService = new WebCallService();
