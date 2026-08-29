'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { FollowUpCRM } from '@/components/followup/FollowUpCRM';

export default function FollowUpsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [followUps, setFollowUps] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const res = await fetch('/api/followups');
      const data = await res.json();
      if (Array.isArray(data)) setFollowUps(data);
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
        activeTab="followups"
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
          <FollowUpCRM
            followUps={followUps}
            onUpdateStage={async (id, stage) => {
              await fetch(`/api/followups/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stage, lastContactedAt: true }),
              });
              await loadData();
            }}
            onSendWhatsAppFollowUp={async (fu) => {
              await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  recipientName: fu.patient.name,
                  recipientPhone: fu.patient.phone,
                  content: `Hello ${fu.patient.name}, Dr. Avishek has advised a follow-up consultation.`,
                  type: 'FOLLOW_UP',
                }),
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
