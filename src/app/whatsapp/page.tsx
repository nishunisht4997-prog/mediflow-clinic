'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { WhatsAppHub } from '@/components/whatsapp/WhatsAppHub';

export default function WhatsAppPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const res = await fetch('/api/whatsapp/send');
      const data = await res.json();
      if (Array.isArray(data)) setLogs(data);
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
        activeTab="whatsapp"
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
          <WhatsAppHub
            logs={logs}
            onSendCustomMessage={async (name, phone, content, type, customConfig) => {
              const res = await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientName: name, recipientPhone: phone, content, type, customConfig }),
              });
              await loadData();
              return await res.json();
            }}
          />
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
