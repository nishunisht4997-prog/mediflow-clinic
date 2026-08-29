'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ClinicWorkBoard } from '@/components/tasks/ClinicWorkBoard';

export default function TasksPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [tasksRes, staffRes, patientsRes] = await Promise.all([
        fetch('/api/tasks').then((r) => r.json()),
        fetch('/api/staff').then((r) => r.json()),
        fetch('/api/patients').then((r) => r.json()),
      ]);
      if (Array.isArray(tasksRes)) setTasks(tasksRes);
      if (Array.isArray(staffRes)) setStaffList(staffRes);
      if (Array.isArray(patientsRes)) setPatients(patientsRes);
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
        activeTab="tasks"
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
          <ClinicWorkBoard
            tasks={tasks}
            staffList={staffList}
            patients={patients}
            onCreateTask={async (data) => {
              await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });
              await loadData();
            }}
            onUpdateTaskStatus={async (id, status) => {
              await fetch(`/api/tasks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
              });
              await loadData();
            }}
            onDeleteTask={async (id) => {
              await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
              await loadData();
            }}
          />
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
