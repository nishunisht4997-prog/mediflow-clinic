'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { DigitalPrescriptionMaker } from '@/components/prescription/DigitalPrescriptionMaker';
import { PrescriptionPdfPreview } from '@/components/prescription/PrescriptionPdfPreview';

export default function PrescriptionsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [viewPdfRx, setViewPdfRx] = useState<any | null>(null);

  const loadData = async () => {
    try {
      const [patientsRes, tplRes] = await Promise.all([
        fetch('/api/patients').then((r) => r.json()),
        fetch('/api/templates').then((r) => r.json()),
      ]);
      if (Array.isArray(patientsRes)) setPatients(patientsRes);
      if (Array.isArray(tplRes)) setTemplates(tplRes);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePrescription = async (prescriptionData: any) => {
    const res = await fetch('/api/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prescriptionData),
    });
    const created = await res.json();
    return created;
  };

  const handleSaveCustomTemplate = async (templateData: any) => {
    await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateData),
    });
    await loadData();
    alert(`Clinical Protocol "${templateData.title}" saved to library!`);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar
        activeTab="prescriptions"
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
          <DigitalPrescriptionMaker
            patients={patients}
            templates={templates}
            onSavePrescription={handleSavePrescription}
            onViewPdf={(rx) => setViewPdfRx(rx)}
            onSaveCustomTemplate={handleSaveCustomTemplate}
          />
        </main>
      </div>

      <MobileBottomNav />

      {viewPdfRx && (
        <PrescriptionPdfPreview
          prescription={viewPdfRx}
          onClose={() => setViewPdfRx(null)}
        />
      )}
    </div>
  );
}
