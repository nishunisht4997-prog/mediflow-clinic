'use client';

import React, { useState } from 'react';
import {
  Bell,
  Search,
  User,
  Stethoscope,
  Building2,
  Calendar,
  UserPlus,
  FileText,
  ChevronDown,
  Shield,
  Clock,
  Sparkles,
  MapPin,
  Menu,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { UserRole } from '@/types';
import { RoleAuthModal } from '@/components/auth/RoleAuthModal';
import { CLINIC_CONFIG } from '@/config/clinic.config';
import { LiveNotificationCenter } from '@/components/notifications/LiveNotificationCenter';

interface NavbarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  onOpenMobileMenu?: () => void;
  onOpenNewPatient?: () => void;
  onOpenNewAppointment?: () => void;
  onOpenNewPrescription?: () => void;
  onOpenQuickSearch?: () => void;
  onNotificationAction?: (type: string, data: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  setCurrentRole,
  onOpenMobileMenu,
  onOpenNewPatient,
  onOpenNewAppointment,
  onOpenNewPrescription,
  onOpenQuickSearch,
  onNotificationAction,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(CLINIC_CONFIG.branches[0]?.name || 'Saheed Nagar Main Branch');
  const [authTargetProfile, setAuthTargetProfile] = useState<any | null>(null);

  const roleProfiles: {
    role: UserRole;
    name: string;
    designation: string;
    badgeColor: string;
    route: string;
  }[] = [
    {
      role: 'DOCTOR',
      name: CLINIC_CONFIG.doctorName,
      designation: CLINIC_CONFIG.specialization,
      badgeColor: 'bg-sky-500',
      route: '/',
    },
    {
      role: 'RECEPTIONIST',
      name: 'Priya Sharma',
      designation: 'Front Desk & Patient Coordinator',
      badgeColor: 'bg-amber-500',
      route: '/reception',
    },
    {
      role: 'NURSE',
      name: 'Snigdha Ray',
      designation: 'Staff Nurse & Triage In-Charge',
      badgeColor: 'bg-pink-500',
      route: '/nurse',
    },
    {
      role: 'ACCOUNTANT',
      name: 'Rajesh Behera',
      designation: 'Accounts & Billing Manager',
      badgeColor: 'bg-emerald-500',
      route: '/accounts',
    },
  ];

  const currentProfile =
    roleProfiles.find((p) => p.role === currentRole) || roleProfiles[0];

  const handleSwitchRole = (profile: (typeof roleProfiles)[0]) => {
    setShowRoleDropdown(false);
    if (profile.role === currentRole) {
      router.push(profile.route);
      return;
    }
    // Open staff PIN/password auth modal
    setAuthTargetProfile(profile);
  };

  const handleAuthSuccess = (profile: (typeof roleProfiles)[0]) => {
    setCurrentRole(profile.role);
    setAuthTargetProfile(null);
    router.push(profile.route);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Hamburger + Clinic Switcher */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/20 shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-900 leading-none">
              <span className="truncate max-w-[140px] sm:max-w-none">{CLINIC_CONFIG.shortName}</span>
              <span className="hidden sm:inline-block rounded-full bg-sky-100 px-2 py-0.2 text-[10px] font-bold text-sky-800">
                PRO
              </span>
            </div>

            {/* Branch Switcher */}
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500 mt-1">
              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent font-medium text-slate-600 focus:outline-hidden cursor-pointer truncate max-w-[120px] sm:max-w-none"
              >
                {CLINIC_CONFIG.branches.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name.replace(' Branch', '')} ({b.city})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Global Omni-Search Bar (Hidden on Mobile) */}
      <div className="hidden lg:flex items-center w-72 xl:w-80">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient by Name, UHID..."
            onClick={onOpenQuickSearch}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-hidden transition"
          />
        </div>
      </div>

      {/* Right: Quick Action Buttons & Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action Buttons on Desktop */}
        <div className="hidden xl:flex items-center gap-2">
          {onOpenNewPatient && (
            <button
              onClick={onOpenNewPatient}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <UserPlus className="h-3.5 w-3.5 text-sky-600" />
              <span>+ Patient</span>
            </button>
          )}

          {onOpenNewAppointment && (
            <button
              onClick={onOpenNewAppointment}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <Calendar className="h-3.5 w-3.5 text-emerald-600" />
              <span>+ Slot</span>
            </button>
          )}

          {onOpenNewPrescription && (
            <button
              onClick={onOpenNewPrescription}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:from-sky-500 hover:to-indigo-500 transition"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Write Rx</span>
            </button>
          )}
        </div>

        {/* Real-time Notification Bell & Live Toast Center */}
        <LiveNotificationCenter
          currentRole={currentRole}
          onActionClick={onNotificationAction}
        />

        {/* Dynamic Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-1.5 sm:pr-3 hover:bg-slate-100 transition"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700 font-bold text-xs">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-bold text-xs text-slate-900 leading-tight">
                {currentProfile.name.split(' ')[0]}
              </div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                {currentProfile.role}
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {/* Role Dropdown Menu */}
          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-64 sm:w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  SWITCH ROLE & WORKSPACE
                </div>
              </div>

              <div className="space-y-1 mt-1">
                {roleProfiles.map((p) => {
                  const isActive = p.role === currentRole;
                  return (
                    <button
                      key={p.role}
                      onClick={() => handleSwitchRole(p)}
                      className={`w-full flex items-center gap-2.5 rounded-xl p-2 text-left transition ${
                        isActive
                          ? 'bg-sky-50 text-sky-900 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-bold text-white text-xs ${p.badgeColor}`}
                      >
                        {p.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-900">{p.name}</div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {p.role} &bull; {p.route}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Staff Security & Role Verification Modal */}
      {authTargetProfile && (
        <RoleAuthModal
          targetProfile={authTargetProfile}
          onClose={() => setAuthTargetProfile(null)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </header>
  );
};
