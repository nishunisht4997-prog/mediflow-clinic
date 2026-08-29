'use client';

import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  User,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  Phone,
  MessageCircle,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface AppointmentsQueueViewProps {
  appointments: any[];
  onOpenNewBooking: () => void;
  onUpdateStatus: (appointmentId: string, newStatus: string) => Promise<void>;
  onStartConsultation: (appointment: any) => void;
  onSendWhatsAppReminder: (appointment: any) => void;
}

export const AppointmentsQueueView: React.FC<AppointmentsQueueViewProps> = ({
  appointments,
  onOpenNewBooking,
  onUpdateStatus,
  onStartConsultation,
  onSendWhatsAppReminder,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = appointments.filter((a) => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  const waitingList = appointments.filter((a) => a.status === 'WAITING' || a.status === 'IN_CONSULTATION');
  const completedList = appointments.filter((a) => a.status === 'COMPLETED');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <CalendarDays className="h-5 w-5" />
            </span>
            <h1 className="text-lg font-bold text-slate-900">OPD Appointments & Live Token Queue</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time OPD Token Queue Management &bull; Multi-Doctor Scheduling &bull; WhatsApp Notifications
          </p>
        </div>

        <button
          onClick={onOpenNewBooking}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Book Appointment / Walk-In</span>
        </button>
      </div>

      {/* Live Queue Token Counter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Waiting Room */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold">
            <span>WAITING IN LOBBY</span>
            <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs">{waitingList.length}</span>
          </div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {waitingList.map((w) => (
              <span
                key={w.id}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold font-mono shadow-xs ${
                  w.status === 'IN_CONSULTATION'
                    ? 'bg-sky-600 text-white animate-pulse'
                    : 'bg-white border border-amber-300 text-amber-900'
                }`}
              >
                #{w.tokenNumber} {w.patient.name.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>

        {/* Current In Consultation */}
        <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 shadow-xs">
          <div className="flex items-center justify-between text-sky-800 text-xs font-bold">
            <span>CURRENTLY WITH DOCTOR</span>
            <span className="h-2 w-2 rounded-full bg-sky-600 animate-ping" />
          </div>
          {appointments.find((a) => a.status === 'IN_CONSULTATION') ? (
            <div className="mt-2 text-sm font-bold text-slate-800">
              Token #{appointments.find((a) => a.status === 'IN_CONSULTATION')?.tokenNumber} &bull;{' '}
              {appointments.find((a) => a.status === 'IN_CONSULTATION')?.patient?.name}
            </div>
          ) : (
            <div className="mt-2 text-xs text-slate-400">No patient in consultation cabin right now.</div>
          )}
        </div>

        {/* Completed Count */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold">
            <span>COMPLETED TODAY</span>
            <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-xs">{completedList.length}</span>
          </div>
          <div className="mt-2 text-xs text-emerald-900 font-medium">
            Avg consultation duration: <strong>14.5 mins</strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        {['ALL', 'WAITING', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`rounded-lg px-3 py-1.5 transition ${
              filterStatus === st
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Appointment Table List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.map((item) => {
            const isWaiting = item.status === 'WAITING';
            const isInCons = item.status === 'IN_CONSULTATION';
            const isDone = item.status === 'COMPLETED';

            return (
              <div
                key={item.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                  isInCons ? 'bg-sky-50/60' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Token number */}
                  <div
                    className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl font-bold ${
                      isInCons
                        ? 'bg-sky-600 text-white shadow-md'
                        : isWaiting
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-[9px] uppercase">Token</span>
                    <span className="text-lg leading-none font-black">#{item.tokenNumber}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{item.patient.name}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600">
                        {item.patient.age}y / {item.patient.gender}
                      </span>
                      <span className="text-xs font-mono text-sky-700 font-semibold">{item.patient.uhid}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {item.timeSlot}
                      </span>
                      <span>&bull;</span>
                      <span className="font-medium">{item.type}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 font-mono text-slate-600">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {item.patient.phone}
                      </span>
                    </div>

                    {item.chiefComplaint && (
                      <p className="text-xs text-slate-600 mt-1 italic">"{item.chiefComplaint}"</p>
                    )}
                  </div>
                </div>

                {/* Status and Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {/* WhatsApp Reminder Button */}
                  <button
                    onClick={() => onSendWhatsAppReminder(item)}
                    title="Send WhatsApp appointment reminder"
                    className="p-2 rounded-xl border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>

                  {/* Status controls */}
                  {isWaiting && (
                    <button
                      onClick={() => onUpdateStatus(item.id, 'IN_CONSULTATION')}
                      className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-sky-700 transition"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Call to Cabin</span>
                    </button>
                  )}

                  {isInCons && (
                    <button
                      onClick={() => onStartConsultation(item)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Prescribe & Complete</span>
                    </button>
                  )}

                  {isDone && (
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                      Consultation Finished
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
