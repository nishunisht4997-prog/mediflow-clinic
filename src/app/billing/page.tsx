'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { BillingInvoicesView } from '@/components/billing/BillingInvoicesView';
import { BillingModal } from '@/components/billing/BillingModal';

export default function BillingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [showBillingModal, setShowBillingModal] = useState(false);

  const loadData = async () => {
    try {
      const [billRes, patientsRes] = await Promise.all([
        fetch('/api/billing').then((r) => r.json()),
        fetch('/api/patients').then((r) => r.json()),
      ]);
      if (billRes?.invoices) {
        setInvoices(billRes.invoices);
        setStats(billRes.stats);
      }
      if (Array.isArray(patientsRes)) setPatients(patientsRes);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateInvoice = async (invoiceData: any) => {
    await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData),
    });
    await loadData();
    setShowBillingModal(false);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar
        activeTab="billing"
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar
          currentRole="ACCOUNTANT"
          setCurrentRole={() => {}}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewAppointment={() => setShowBillingModal(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
          <BillingInvoicesView
            invoices={invoices}
            stats={stats}
            onOpenNewBill={() => setShowBillingModal(true)}
            onRecordPayment={(inv) => {}}
            onPrintInvoice={(inv) => {}}
          />
        </main>
      </div>

      <MobileBottomNav />

      {showBillingModal && (
        <BillingModal
          patients={patients}
          onClose={() => setShowBillingModal(false)}
          onGenerateInvoice={handleGenerateInvoice}
        />
      )}
    </div>
  );
}
