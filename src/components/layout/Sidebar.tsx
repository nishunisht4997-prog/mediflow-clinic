'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileSpreadsheet,
  Receipt,
  UserCheck,
  CheckSquare,
  Repeat,
  MessageCircle,
  Globe,
  Smartphone,
  ChevronRight,
  Sparkles,
  Stethoscope,
  ConciergeBell,
  HeartPulse,
  Wallet,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavTab =
  | 'dashboard'
  | 'patients'
  | 'appointments'
  | 'prescriptions'
  | 'billing'
  | 'staff'
  | 'tasks'
  | 'followups'
  | 'whatsapp'
  | 'website'
  | 'portal';

interface SidebarProps {
  activeTab?: NavTab;
  setActiveTab?: (tab: NavTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  badgeCounts?: {
    waitingAppointments?: number;
    pendingTasks?: number;
    dueFollowUps?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = 'dashboard',
  setActiveTab,
  isOpenMobile = false,
  onCloseMobile,
  badgeCounts = {
    waitingAppointments: 4,
    pendingTasks: 5,
    dueFollowUps: 7,
  },
}) => {
  const pathname = usePathname();

  const roleWorkspaces = [
    { name: 'Doctor Cabin', href: '/', icon: Stethoscope, color: 'text-sky-600', badge: 'OPD' },
    { name: 'Reception Desk', href: '/reception', icon: ConciergeBell, color: 'text-amber-600', badge: 'Lobby' },
    { name: 'Nurse Station', href: '/nurse', icon: HeartPulse, color: 'text-pink-600', badge: 'Triage' },
    { name: 'Accounts Desk', href: '/accounts', icon: Wallet, color: 'text-emerald-600', badge: 'POS' },
  ];

  const domainNavItems = [
    { id: 'patients' as NavTab, name: 'Patients 360°', href: '/patients', icon: Users },
    {
      id: 'appointments' as NavTab,
      name: 'Appointments & Queue',
      href: '/appointments',
      icon: Calendar,
      badge: badgeCounts.waitingAppointments,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    { id: 'prescriptions' as NavTab, name: 'Prescription Studio', href: '/prescriptions', icon: FileSpreadsheet },
    { id: 'billing' as NavTab, name: 'Billing & Invoices', href: '/billing', icon: Receipt },
    { id: 'staff' as NavTab, name: 'Staff & Attendance', href: '/staff', icon: UserCheck },
    {
      id: 'tasks' as NavTab,
      name: 'Clinic Work Board',
      href: '/tasks',
      icon: CheckSquare,
      badge: badgeCounts.pendingTasks,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'followups' as NavTab,
      name: 'Follow-up Retention',
      href: '/followups',
      icon: Repeat,
      badge: badgeCounts.dueFollowUps,
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    { id: 'whatsapp' as NavTab, name: 'WhatsApp Hub', href: '/whatsapp', icon: MessageCircle },
  ];

  const externalPortals = [
    { name: 'Public Clinic Site', href: '/clinic/dr-priyabarta-clinic', icon: Globe, sub: 'drpriyabarta.mediflow.in' },
    { name: 'Patient Health Portal', href: '/portal', icon: Smartphone, sub: 'Self-Service' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-white select-none">
      {/* Upper Section */}
      <div className="flex flex-col flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {/* Brand Logo & Close button on mobile */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 via-teal-500 to-indigo-600 text-white shadow-md shadow-sky-500/20 font-black text-lg">
              M
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
                <span>MediFlow</span>
                <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                  PRO
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Clinic Operating System
              </span>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* 1. ROLE SPECIFIC WORKSPACES */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            ROLE WORKSPACES
          </div>

          <div className="space-y-0.5 mt-1">
            {roleWorkspaces.map((ws) => {
              const isMatch = pathname === ws.href;
              const Icon = ws.icon;

              return (
                <Link
                  key={ws.href}
                  href={ws.href}
                  onClick={() => onCloseMobile && onCloseMobile()}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                    isMatch
                      ? 'bg-sky-50 text-sky-900 font-black border border-sky-200/60 shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${ws.color}`} />
                    <span>{ws.name}</span>
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                    {ws.badge}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 2. CLINIC DOMAIN MODULES */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            CLINIC MODULES
          </div>

          <nav className="space-y-0.5 mt-1">
            {domainNavItems.map((item) => {
              const isMatch = pathname === item.href || (activeTab === item.id && pathname === '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    if (setActiveTab) setActiveTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    isMatch
                      ? 'bg-slate-900 text-white font-bold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isMatch ? 'text-sky-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && item.badge > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                        isMatch ? 'bg-sky-500 text-white' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 3. PUBLIC & PATIENT PORTALS */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            EXTERNAL PORTALS
          </div>

          <div className="space-y-0.5 mt-1">
            {externalPortals.map((ext) => {
              const Icon = ext.icon;
              return (
                <Link
                  key={ext.href}
                  href={ext.href}
                  target="_blank"
                  onClick={() => onCloseMobile && onCloseMobile()}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-slate-400 group-hover:text-sky-600" />
                    <div>
                      <div className="font-semibold text-slate-800 text-xs">{ext.name}</div>
                      <div className="text-[10px] text-slate-400">{ext.sub}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-600" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Plan Card */}
      <div className="p-3 border-t border-slate-100">
        <div className="rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 p-3 border border-sky-100 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
            <Sparkles className="h-3.5 w-3.5 text-sky-600" />
            <span>Clinic Pro Active</span>
          </div>
          <p className="text-[10px] text-slate-500">Saheed Nagar &bull; Cuttack CDA</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/80 bg-white h-screen justify-between shrink-0 select-none shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Out Drawer with Backdrop */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
