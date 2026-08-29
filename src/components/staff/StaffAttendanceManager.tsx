'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Lock,
  Unlock,
  Check,
  X,
} from 'lucide-react';

interface StaffAttendanceManagerProps {
  staffList: any[];
  onCheckIn: (userId: string, status: string) => Promise<void>;
}

export const StaffAttendanceManager: React.FC<StaffAttendanceManagerProps> = ({
  staffList,
  onCheckIn,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'roles'>('attendance');

  const permissionsMatrix = [
    {
      feature: 'Create & Register Patients',
      doctor: true,
      receptionist: true,
      nurse: true,
      accountant: false,
    },
    {
      feature: 'Book & Reschedule Appointments',
      doctor: true,
      receptionist: true,
      nurse: true,
      accountant: false,
    },
    {
      feature: 'Write & Edit Digital Prescriptions',
      doctor: true,
      receptionist: false,
      nurse: false,
      accountant: false,
    },
    {
      feature: 'View Sensitive Doctor Clinical Notes',
      doctor: true,
      receptionist: false,
      nurse: false,
      accountant: false,
    },
    {
      feature: 'Record Patient Vitals & Upload Scans',
      doctor: true,
      receptionist: true,
      nurse: true,
      accountant: false,
    },
    {
      feature: 'Collect Payments & Generate Invoices',
      doctor: true,
      receptionist: true,
      nurse: false,
      accountant: true,
    },
    {
      feature: 'Delete Patient Records & Audit Logs',
      doctor: false,
      receptionist: false,
      nurse: false,
      accountant: false, // Only Super Admin
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
              <UserCheck className="h-5 w-5" />
            </span>
            <h1 className="text-lg font-bold text-slate-900">Staff Management & Role-Based Access (RBAC)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daily attendance register, check-in logs, and multi-tenant security permission controls.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === 'attendance' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            Today's Attendance
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === 'roles' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            Role Permissions Matrix
          </button>
        </div>
      </div>

      {activeTab === 'attendance' ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Daily Attendance Register &bull; {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              4 Staff on duty
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {staffList.map((staff) => {
              const att = staff.attendance?.[0];
              const isPresent = att?.status === 'PRESENT';
              const isLate = att?.status === 'LATE';

              return (
                <div
                  key={staff.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 font-bold">
                      {staff.name.charAt(0)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{staff.name}</span>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                          {staff.role}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">{staff.email} &bull; {staff.phone || '+91 98765 00000'}</div>
                    </div>
                  </div>

                  {/* Attendance status & Check-in action */}
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      {att ? (
                        <div>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              isLate
                                ? 'bg-amber-100 text-amber-800'
                                : isPresent
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {att.status}
                          </span>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            In: {att.checkIn || '09:00 AM'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Not Marked</span>
                      )}
                    </div>

                    <button
                      onClick={() => onCheckIn(staff.id, 'PRESENT')}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Check-In
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* RBAC Roles & Permissions Matrix */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-900">Fine-Grained Role Permissions Matrix</h2>
          </div>
          <p className="text-xs text-slate-500">
            Strict separation of clinical and administrative boundaries to ensure patient confidentiality and healthcare compliance.
          </p>

          <table className="w-full text-left text-xs border-collapse mt-4">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                <th className="p-3">Feature / Action</th>
                <th className="p-3 text-center">Doctor</th>
                <th className="p-3 text-center">Receptionist</th>
                <th className="p-3 text-center">Nurse</th>
                <th className="p-3 text-center">Accountant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsMatrix.map((perm, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-800">{perm.feature}</td>
                  <td className="p-3 text-center">
                    {perm.doctor ? (
                      <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {perm.receptionist ? (
                      <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-rose-500 mx-auto" />
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {perm.nurse ? (
                      <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {perm.accountant ? (
                      <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
