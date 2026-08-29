'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { StaffAttendanceManager } from '@/components/staff/StaffAttendanceManager';

export default function StaffPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (Array.isArray(data)) setStaffList(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar
        activeTab="staff"
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar
          currentRole="DOCTOR"
          setCurrentRole={() => {}}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
          <StaffAttendanceManager
            staffList={staffList}
            onCheckIn={async (userId, status) => {
              await fetch('/api/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, status }),
              });
              await loadData();
            }}
          />
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
