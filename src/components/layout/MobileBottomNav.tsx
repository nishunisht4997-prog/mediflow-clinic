'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Receipt,
  ConciergeBell,
} from 'lucide-react';
import { RoleAuthModal } from '@/components/auth/RoleAuthModal';
import { CLINIC_CONFIG } from '@/config/clinic.config';
import { UserRole } from '@/types';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [authTargetProfile, setAuthTargetProfile] = useState<any | null>(null);

  const roleProfilesMap: Record<
    string,
    {
      role: UserRole;
      name: string;
      designation: string;
      badgeColor: string;
      route: string;
    }
  > = {
    '/': {
      role: 'DOCTOR',
      name: CLINIC_CONFIG.doctorName,
      designation: CLINIC_CONFIG.specialization,
      badgeColor: 'bg-sky-500',
      route: '/',
    },
    '/reception': {
      role: 'RECEPTIONIST',
      name: 'Priya Sharma',
      designation: 'Front Desk & Patient Coordinator',
      badgeColor: 'bg-amber-500',
      route: '/reception',
    },
  };

  const navItems = [
    { name: 'Doctor', href: '/', icon: LayoutDashboard, isRole: true },
    { name: 'Patients', href: '/patients', icon: Users, isRole: false },
    { name: 'Rx Maker', href: '/prescriptions', icon: FileSpreadsheet, isRole: false },
    { name: 'Reception', href: '/reception', icon: ConciergeBell, isRole: true },
    { name: 'Billing', href: '/billing', icon: Receipt, isRole: false },
  ];

  const handleNavClick = (item: (typeof navItems)[0]) => {
    if (pathname === item.href) return;

    if (item.isRole && roleProfilesMap[item.href]) {
      setAuthTargetProfile(roleProfilesMap[item.href]);
    } else {
      router.push(item.href);
    }
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200 backdrop-blur-md px-2 py-1.5 flex items-center justify-around shadow-lg safe-bottom">
        {navItems.map((item) => {
          const isMatch = pathname === item.href;
          const Icon = item.icon;

          return (
            <button
              type="button"
              key={item.href}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
                isMatch
                  ? 'text-sky-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${isMatch ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Staff Security & Role Verification Modal */}
      {authTargetProfile && (
        <RoleAuthModal
          targetProfile={authTargetProfile}
          onClose={() => setAuthTargetProfile(null)}
          onSuccess={(target) => {
            setAuthTargetProfile(null);
            router.push(target.route);
          }}
        />
      )}
    </>
  );
};
