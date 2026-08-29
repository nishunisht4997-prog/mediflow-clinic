'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Receipt,
  ConciergeBell,
  HeartPulse,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Doctor', href: '/', icon: LayoutDashboard },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Rx Maker', href: '/prescriptions', icon: FileSpreadsheet },
    { name: 'Reception', href: '/reception', icon: ConciergeBell },
    { name: 'Billing', href: '/billing', icon: Receipt },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200 backdrop-blur-md px-2 py-1.5 flex items-center justify-around shadow-lg safe-bottom">
      {navItems.map((item) => {
        const isMatch = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
              isMatch
                ? 'text-sky-600 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className={`h-5 w-5 ${isMatch ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-0.5">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};
