'use client';

import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Repeat,
  IndianRupee,
  AlertCircle,
  Users,
  FileText,
  UserPlus,
  Play,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Stethoscope,
  PhoneCall,
  MessageSquare,
  QrCode,
  Volume2,
} from 'lucide-react';
import { UserRole } from '@/types';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import { VoiceTokenCaller } from '@/components/dashboard/VoiceTokenCaller';
import { CLINIC_CONFIG } from '@/config/clinic.config';

interface DoctorDashboardProps {
  data: any;
  currentRole: UserRole;
  selectedBranch?: string;
  onStartConsultation: (appointment: any) => void;
  onOpenPatientProfile: (patientId: string) => void;
  onOpenNewAppointment: () => void;
  onOpenNewPatient: () => void;
  onOpenNewPrescription: () => void;
  onOpenNewBill: () => void;
  onOpenWhatsAppSimulator: (message: any) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  data,
  currentRole,
  selectedBranch = 'Saheed Nagar Main Branch',
  onStartConsultation,
  onOpenPatientProfile,
  onOpenNewAppointment,
  onOpenNewPatient,
  onOpenNewPrescription,
  onOpenNewBill,
  onOpenWhatsAppSimulator,
}) => {
  const kpi = data?.kpi || {
    appointments: 24,
    completed: 16,
    waiting: 4,
    followUps: 7,
    revenue: 28500,
    pending: 6200,
    newPatients: 8,
  };

  const schedule = data?.todaySchedule || [];
  const staffAttendance = data?.staffAttendance || [];
  const tasks = data?.tasks || [];
  const followUpsToday = data?.followUpsToday || [];
  const analytics = data?.analytics;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Hero Greeting Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-300 border border-sky-400/30 backdrop-blur-xs mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>OPD Active &bull; Branch: {selectedBranch}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              GOOD MORNING, {data?.clinic?.doctorName ? data.clinic.doctorName.toUpperCase() : CLINIC_CONFIG.doctorShortName.toUpperCase()}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              You have <span className="font-bold text-sky-400">{kpi.waiting} patients waiting</span> in the lobby.
              16 consultations completed today. Total collection is{' '}
              <span className="font-bold text-emerald-400">₹{kpi.revenue?.toLocaleString('en-IN') || '28,500'}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenNewPatient}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md border border-white/10 hover:bg-white/20 transition"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>+ Patient</span>
            </button>

            <button
              onClick={onOpenNewAppointment}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md border border-white/10 hover:bg-white/20 transition"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>+ Slot</span>
            </button>

            <button
              onClick={onOpenNewPrescription}
              className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400 transition"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Write Prescription</span>
            </button>
          </div>
        </div>

        {/* Subtle Decorative glow */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute left-1/2 -top-10 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      {/* 2. Today's Overview KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Appointments */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Appointments</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{kpi.appointments}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">+12%</span> vs yesterday
          </div>
        </div>

        {/* Completed */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Completed</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{kpi.completed}</div>
          <div className="text-[11px] text-slate-400 mt-1">66% of target</div>
        </div>

        {/* Waiting */}
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium">
            <span>Waiting Room</span>
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 animate-pulse">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-900 mt-2">{kpi.waiting}</div>
          <div className="text-[11px] text-amber-700/80 mt-1 font-medium">Avg wait: 12 min</div>
        </div>

        {/* Follow-ups */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Follow-ups</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Repeat className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{kpi.followUps}</div>
          <div className="text-[11px] text-purple-600 mt-1 font-medium">3 contacted</div>
        </div>

        {/* Revenue */}
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-medium">
            <span>Today's Revenue</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-900 mt-2">
            ₹{kpi.revenue?.toLocaleString('en-IN') || '28,500'}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">UPI: 70% | Cash: 30%</div>
        </div>

        {/* Pending Payments */}
        <div className="rounded-xl border border-rose-200/80 bg-rose-50/40 p-4 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between text-rose-700 text-xs font-medium">
            <span>Pending</span>
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-900 mt-2">
            ₹{kpi.pending?.toLocaleString('en-IN') || '6,200'}
          </div>
          <div className="text-[11px] text-rose-600 mt-1 font-medium">2 pending invoices</div>
        </div>
      </div>

      {/* 3. Analytics & Growth Charts Section */}
      <AnalyticsCharts analyticsData={analytics} />

      {/* 4. Main Grid: Today's Schedule & Live Queue + Staff Attendance & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Schedule & Live Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-sky-600" />
                  <span>Today's Consultation Schedule & Queue</span>
                </h2>
                <p className="text-xs text-slate-400">Tokens sorted in OPD order &bull; Audio caller ready</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {schedule.length} Total Patients
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {schedule.map((item: any) => {
                const isWaiting = item.status === 'WAITING';
                const isInConsultation = item.status === 'IN_CONSULTATION';
                const isCompleted = item.status === 'COMPLETED';

                return (
                  <div
                    key={item.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 transition rounded-xl ${
                      isInConsultation
                        ? 'bg-sky-50/80 border border-sky-200'
                        : isWaiting
                        ? 'hover:bg-amber-50/50'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Token Badge */}
                      <div
                        className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl font-bold ${
                          isInConsultation
                            ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                            : isWaiting
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-wider font-semibold">Token</span>
                        <span className="text-base leading-tight">#{item.tokenNumber}</span>
                      </div>

                      {/* Patient Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenPatientProfile(item.patient.id)}
                            className="font-bold text-sm text-slate-800 hover:text-sky-600 text-left transition"
                          >
                            {item.patient.name}
                          </button>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                            {item.patient.age}y / {item.patient.gender?.[0]}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ({item.patient.uhid})
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {item.timeSlot}
                          </span>
                          <span>&bull;</span>
                          <span className="font-medium text-slate-600">{item.type}</span>
                          {item.chiefComplaint && (
                            <>
                              <span>&bull;</span>
                              <span className="text-slate-500 truncate max-w-[200px]">
                                {item.chiefComplaint}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status, Audio Announcer & Actions */}
                    <div className="flex items-center gap-2 mt-3 sm:mt-0 self-end sm:self-center">
                      {/* Audio Voice Token Caller */}
                      <VoiceTokenCaller
                        tokenNumber={item.tokenNumber}
                        patientName={item.patient.name}
                        compact
                      />

                      {isInConsultation && (
                        <span className="rounded-full bg-sky-100 border border-sky-300 px-2.5 py-1 text-xs font-bold text-sky-800 animate-pulse">
                          In Cabin
                        </span>
                      )}

                      {isWaiting && (
                        <span className="rounded-full bg-amber-100 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800">
                          Waiting
                        </span>
                      )}

                      {isCompleted && (
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Consulted
                        </span>
                      )}

                      {/* Action Button */}
                      {(isWaiting || isInConsultation) && (
                        <button
                          onClick={() => onStartConsultation(item)}
                          className="flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-700 shadow-xs transition"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>{isInConsultation ? 'Write Rx' : 'Consult'}</span>
                        </button>
                      )}

                      {isCompleted && (
                        <button
                          onClick={() => onOpenPatientProfile(item.patient.id)}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <span>View Records</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Staff Attendance Today & Urgent Tasks */}
        <div className="space-y-6">
          {/* Staff Attendance Widget */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-violet-600" />
                <span>STAFF TODAY</span>
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">4 on duty</span>
            </div>

            <div className="space-y-2.5">
              {staffAttendance.map((staff: any) => {
                const isLate = staff.status === 'LATE';
                const isPresent = staff.status === 'PRESENT';
                const isAbsent = staff.status === 'ABSENT';

                return (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <div>
                        <div className="font-semibold text-slate-800">{staff.user?.name}</div>
                        <div className="text-[10px] text-slate-400">{staff.user?.role}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          isLate
                            ? 'bg-amber-100 text-amber-800'
                            : isPresent
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {staff.status}
                      </span>
                      {staff.checkIn && (
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{staff.checkIn}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Tasks Work Board Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-rose-600" />
                <span>TODAY'S CLINIC TASKS</span>
              </h3>
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                {tasks.length} Active
              </span>
            </div>

            <div className="space-y-2.5">
              {tasks.slice(0, 4).map((task: any) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 transition hover:bg-slate-100/70"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-xs text-slate-800 line-clamp-1">{task.title}</div>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.2 text-[9px] font-bold ${
                        task.priority === 'URGENT'
                          ? 'bg-rose-100 text-rose-700'
                          : task.priority === 'HIGH'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                    <span>Assigned: <strong className="text-slate-600">{task.assignee?.name || 'Receptionist'}</strong></span>
                    <span className="font-medium text-sky-600">{task.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
