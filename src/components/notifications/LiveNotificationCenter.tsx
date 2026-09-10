'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  HeartPulse,
  FileSpreadsheet,
  Volume2,
  X,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Receipt,
  UserCheck,
  Stethoscope,
} from 'lucide-react';
import { ClinicBroadcast, ClinicEventPayload, playNotificationSound } from '@/lib/broadcast';
import { UserRole } from '@/types';
import { CLINIC_CONFIG } from '@/config/clinic.config';

interface LiveNotificationCenterProps {
  currentRole: UserRole;
  onActionClick?: (type: string, data: any) => void;
}

export const LiveNotificationCenter: React.FC<LiveNotificationCenterProps> = ({
  currentRole,
  onActionClick,
}) => {
  const [events, setEvents] = useState<ClinicEventPayload[]>([]);
  const [activeToast, setActiveToast] = useState<ClinicEventPayload | null>(null);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // 1. Load cached events
    const cached = ClinicBroadcast.getCachedEvents();
    if (cached.length > 0) {
      setEvents(cached);
    }

    // 2. Subscribe to Broadcast Channel (Instant 0-latency multi-tab sync)
    const unsubscribe = ClinicBroadcast.subscribe((newEvent) => {
      // Check if event targets current role or ALL
      const isTargeted =
        newEvent.targetRoles.includes('ALL') ||
        newEvent.targetRoles.includes(currentRole as any);

      if (isTargeted && newEvent.sourceRole !== currentRole) {
        // Show Toast popup & increment unread
        setActiveToast(newEvent);
        setUnreadCount((prev) => prev + 1);

        // Auto-dismiss toast after 7 seconds
        setTimeout(() => {
          setActiveToast((current) => (current?.id === newEvent.id ? null : current));
        }, 7000);
      }

      setEvents((prev) => [newEvent, ...prev.slice(0, 29)]);
    });

    // 3. Fallback Periodic Polling for Multi-Device LAN Sync (every 5 seconds)
    const lastTimestamp = Date.now();
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/events?since=${lastTimestamp}&role=${currentRole}`);
        if (res.ok) {
          const freshEvents = await res.json();
          if (Array.isArray(freshEvents) && freshEvents.length > 0) {
            freshEvents.forEach((fe: ClinicEventPayload) => {
              if (fe.sourceRole !== currentRole) {
                setEvents((prev) => {
                  if (!prev.some((e) => e.id === fe.id)) {
                    playNotificationSound(fe.type);
                    setActiveToast(fe);
                    setUnreadCount((c) => c + 1);
                    return [fe, ...prev.slice(0, 29)];
                  }
                  return prev;
                });
              }
            });
          }
        }
      } catch (e) {}
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [currentRole]);

  const handleOpenDrawer = () => {
    setIsOpenDrawer(!isOpenDrawer);
    if (!isOpenDrawer) {
      setUnreadCount(0);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'OPD_TOKEN_ISSUED':
        return <UserCheck className="h-4 w-4 text-amber-500" />;
      case 'PAYMENT_COLLECTED':
        return <CreditCard className="h-4 w-4 text-emerald-500" />;
      case 'VITALS_RECORDED':
        return <HeartPulse className="h-4 w-4 text-pink-500" />;
      case 'PRESCRIPTION_GENERATED':
        return <FileSpreadsheet className="h-4 w-4 text-sky-500" />;
      default:
        return <Bell className="h-4 w-4 text-indigo-500" />;
    }
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'OPD_TOKEN_ISSUED':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'PAYMENT_COLLECTED':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'VITALS_RECORDED':
        return 'bg-pink-100 text-pink-900 border-pink-300';
      case 'PRESCRIPTION_GENERATED':
        return 'bg-sky-100 text-sky-900 border-sky-300';
      default:
        return 'bg-slate-100 text-slate-900 border-slate-300';
    }
  };

  return (
    <>
      {/* 🔔 TOP NAVBAR BELL TRIGGER */}
      <div className="relative">
        <button
          onClick={handleOpenDrawer}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition shadow-2xs"
          aria-label="Clinic Live Notifications"
        >
          <Bell className={`h-4 w-4 ${unreadCount > 0 ? 'text-sky-600 animate-bounce' : 'text-slate-500'}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-xs animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* NOTIFICATIONS DROPDOWN DRAWER */}
        {isOpenDrawer && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Live Clinic Notice Feed
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">
                Role: {currentRole}
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 mt-2">
              {events.length > 0 ? (
                events.map((evt) => (
                  <div key={evt.id} className="p-2.5 hover:bg-slate-50 rounded-xl transition text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        {getEventIcon(evt.type)}
                        <span>{evt.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] pl-5">{evt.message}</p>
                    <div className="pl-5 flex items-center gap-2 pt-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${getEventBadgeColor(evt.type)}`}>
                        From: {evt.sourceRole}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  No notifications yet. New clinic activity will pop up here in real time.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 🚀 FLOATING LIVE POPUP TOAST ALERT */}
      {activeToast && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-full rounded-2xl border-2 border-sky-500/80 bg-slate-900 text-white p-4 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
                {getEventIcon(activeToast.type)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-white">{activeToast.title}</h4>
                  <span className="rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2 py-0.2 text-[9px] font-bold">
                    From {activeToast.sourceRole}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">{activeToast.message}</p>
              </div>
            </div>

            <button
              onClick={() => setActiveToast(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Action Trigger Buttons based on role */}
          {activeToast.data && (
            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(activeToast.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>

              {/* Accountant Action: Collect Fee */}
              {activeToast.type === 'OPD_TOKEN_ISSUED' && currentRole === 'ACCOUNTANT' && (
                <button
                  onClick={() => {
                    if (onActionClick) onActionClick('COLLECT_FEE', activeToast.data);
                    setActiveToast(null);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 font-bold text-white hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Collect ₹{activeToast.data.amount || CLINIC_CONFIG.consultationFee} Fee</span>
                </button>
              )}

              {/* Doctor Action: Start Consultation */}
              {activeToast.type === 'PAYMENT_COLLECTED' && currentRole === 'DOCTOR' && (
                <button
                  onClick={() => {
                    if (onActionClick) onActionClick('START_CONSULTATION', activeToast.data);
                    setActiveToast(null);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-3 py-1.5 font-bold text-white hover:bg-sky-400 shadow-md shadow-sky-500/20 transition"
                >
                  <Stethoscope className="h-3.5 w-3.5" />
                  <span>Call to Cabin</span>
                </button>
              )}

              {/* Doctor Action: View Vitals */}
              {activeToast.type === 'VITALS_RECORDED' && currentRole === 'DOCTOR' && (
                <button
                  onClick={() => {
                    if (onActionClick) onActionClick('VIEW_VITALS', activeToast.data);
                    setActiveToast(null);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-pink-600 px-3 py-1.5 font-bold text-white hover:bg-pink-500 shadow-md shadow-pink-600/20 transition"
                >
                  <HeartPulse className="h-3.5 w-3.5" />
                  <span>Review Vitals</span>
                </button>
              )}

              {/* Reception / Accountant Action: Rx Bill / Letterhead */}
              {activeToast.type === 'PRESCRIPTION_GENERATED' && (currentRole === 'ACCOUNTANT' || currentRole === 'RECEPTIONIST') && (
                <button
                  onClick={() => {
                    if (onActionClick) onActionClick('VIEW_RX', activeToast.data);
                    setActiveToast(null);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-3 py-1.5 font-bold text-white hover:bg-sky-400 shadow-md shadow-sky-500/20 transition"
                >
                  <Receipt className="h-3.5 w-3.5" />
                  <span>View Bill & Print</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
