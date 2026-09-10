'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { FollowUpCRM } from '@/components/followup/FollowUpCRM';
import { CLINIC_CONFIG } from '@/config/clinic.config';

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
              const pName = fu.patient?.name || fu.patientName || 'Patient';
              const pPhone = fu.patient?.phone || fu.phone || '';
              await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  recipientName: pName,
                  recipientPhone: pPhone,
                  content: `Hello ${pName}, ${CLINIC_CONFIG.shortName} has scheduled your follow-up consultation on ${fu.dueDate || 'this week'}.`,
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
