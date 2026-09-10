/**
 * 🔔 REAL-TIME CLINIC BROADCAST BUS & AUDIO CHIMES ENGINE
 * -------------------------------------------------------------
 * Provides instantaneous 0-latency multi-tab, multi-window, and
 * cross-role event synchronization across Doctor, Receptionist,
 * Nurse, and Accountant screens, complete with synthesized audio chimes.
 */

export type ClinicEventType =
  | 'OPD_TOKEN_ISSUED'      // Receptionist -> Accountant (Collect ₹800 fee), Doctor, Nurse
  | 'PAYMENT_COLLECTED'     // Accountant -> Doctor (Fee paid, start consultation), Reception
  | 'VITALS_RECORDED'       // Nurse -> Doctor (Pre-OPD vitals recorded)
  | 'PRESCRIPTION_GENERATED'// Doctor -> Accountant (Generate medicine bill), Reception
  | 'CABIN_CALL'            // Reception/Doctor -> Lobby (Patient called to cabin)
  | 'TASK_ASSIGNED';        // Staff task dispatch

export interface ClinicEventPayload {
  id: string;
  type: ClinicEventType;
  title: string;
  message: string;
  timestamp: number;
  sourceRole: 'DOCTOR' | 'RECEPTIONIST' | 'NURSE' | 'ACCOUNTANT' | 'SYSTEM';
  targetRoles: ('DOCTOR' | 'RECEPTIONIST' | 'NURSE' | 'ACCOUNTANT' | 'ALL')[];
  data?: {
    patientId?: string;
    patientName?: string;
    patientPhone?: string;
    tokenNumber?: number;
    amount?: number;
    invoiceId?: string;
    vitalsSummary?: string;
    diagnosis?: string;
    actionUrl?: string;
    isCritical?: boolean;
  };
}

// Synthesize pleasant, crisp medical notifications sounds using Web Audio API
export function playNotificationSound(type: ClinicEventType) {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'OPD_TOKEN_ISSUED') {
      // Pleasant double chime for new arrival / token (C5 -> G5)
      playChimeSequence(ctx, [523.25, 783.99], [0.15, 0.25], 'sine');
    } else if (type === 'PAYMENT_COLLECTED') {
      // Upbeat cash / payment success chime (E5 -> A5 -> B5)
      playChimeSequence(ctx, [659.25, 880.0, 987.77], [0.1, 0.1, 0.3], 'triangle');
    } else if (type === 'VITALS_RECORDED') {
      // Soft gentle medical vital beep (F5 -> C6)
      playChimeSequence(ctx, [698.46, 1046.5], [0.12, 0.2], 'sine');
    } else if (type === 'PRESCRIPTION_GENERATED') {
      // Completed Rx chime (D5 -> F#5 -> A5)
      playChimeSequence(ctx, [587.33, 739.99, 880.0], [0.1, 0.1, 0.25], 'sine');
    } else {
      // Standard notification alert (A5)
      playChimeSequence(ctx, [880.0], [0.2], 'sine');
    }
  } catch (e) {
    // Audio context may be restricted before user gesture
  }
}

function playChimeSequence(ctx: AudioContext, frequencies: number[], durations: number[], type: OscillatorType) {
  let currentTime = ctx.currentTime;
  frequencies.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, currentTime);

    const dur = durations[index] || 0.15;
    gain.gain.setValueAtTime(0.01, currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, currentTime + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(currentTime);
    osc.stop(currentTime + dur);
    currentTime += dur * 0.7;
  });
}

// Multi-Tab / Multi-Window Broadcast Channel
class ClinicBroadcastManager {
  private channel: BroadcastChannel | null = null;
  private listeners: ((event: ClinicEventPayload) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('mediflow_clinic_realtime_bus');
      this.channel.onmessage = (msgEvent) => {
        const payload = msgEvent.data as ClinicEventPayload;
        if (payload && payload.type) {
          this.notifyListeners(payload);
        }
      };
    }
  }

  public publish(event: Omit<ClinicEventPayload, 'id' | 'timestamp'>) {
    const fullEvent: ClinicEventPayload = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };

    // 1. Play sound
    playNotificationSound(fullEvent.type);

    // 2. Broadcast to other tabs / windows
    if (this.channel) {
      this.channel.postMessage(fullEvent);
    }

    // 3. Notify current window listeners
    this.notifyListeners(fullEvent);

    // 4. Also persist event to LocalStorage buffer for resilience
    this.saveToStorageBuffer(fullEvent);

    // 5. Asynchronously persist to backend events API
    if (typeof fetch !== 'undefined') {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullEvent),
      }).catch(() => {});
    }

    return fullEvent;
  }

  public subscribe(listener: (event: ClinicEventPayload) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(payload: ClinicEventPayload) {
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error('Error notifying broadcast listener:', err);
      }
    });
  }

  private saveToStorageBuffer(event: ClinicEventPayload) {
    if (typeof window === 'undefined') return;
    try {
      const existingRaw = localStorage.getItem('mediflow_live_events_cache') || '[]';
      const list = JSON.parse(existingRaw);
      list.unshift(event);
      // Keep latest 30 events
      localStorage.setItem('mediflow_live_events_cache', JSON.stringify(list.slice(0, 30)));
    } catch (e) {}
  }

  public getCachedEvents(): ClinicEventPayload[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('mediflow_live_events_cache');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
}

export const ClinicBroadcast = new ClinicBroadcastManager();
