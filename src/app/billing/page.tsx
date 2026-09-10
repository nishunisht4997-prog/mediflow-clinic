'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { BillingInvoicesView } from '@/components/billing/BillingInvoicesView';
import { BillingModal } from '@/components/billing/BillingModal';
import { ThermalReceiptModal } from '@/components/billing/ThermalReceiptModal';
import { DynamicUpiQrModal } from '@/components/billing/DynamicUpiQrModal';
import { DailyCashDrawerModal } from '@/components/billing/DailyCashDrawerModal';
import { ClinicBroadcast } from '@/lib/broadcast';
import { CLINIC_CONFIG } from '@/config/clinic.config';

export default function BillingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedThermalInvoice, setSelectedThermalInvoice] = useState<any | null>(null);
  const [selectedPaymentInvoice, setSelectedPaymentInvoice] = useState<any | null>(null);
  const [showCashDrawerModal, setShowCashDrawerModal] = useState(false);

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

  const handleConfirmPayment = async (invoiceId: string, amount: number) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    await fetch('/api/billing/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId,
        amount,
        method: 'UPI',
        recordedBy: 'Rajesh Behera (Billing)',
      }),
    });

    // 🚀 REAL-TIME BROADCAST: Notify Doctor & Reception
    ClinicBroadcast.publish({
      type: 'PAYMENT_COLLECTED',
      title: `Fee Collected: ₹${amount} Paid`,
      message: `${inv?.patient?.name || 'Patient'} paid fee of ₹${amount}. Patient cleared for doctor cabin.`,
      sourceRole: 'ACCOUNTANT',
      targetRoles: ['DOCTOR', 'RECEPTIONIST', 'NURSE'],
      data: {
        patientId: inv?.patientId,
        patientName: inv?.patient?.name,
        amount,
        invoiceId,
      },
    });

    await loadData();
    setSelectedPaymentInvoice(null);
  };

  const handleNotificationAction = (type: string, data: any) => {
    if (type === 'COLLECT_FEE') {
      setSelectedPaymentInvoice({
        id: `fee-${Date.now()}`,
        totalAmount: data.amount || CLINIC_CONFIG.consultationFee,
        paidAmount: 0,
        patient: { name: data.patientName || 'Walk-In Patient', uhid: `Token #${data.tokenNumber || 'Queue'}` },
        invoiceNumber: `FEE-${data.tokenNumber || 'OPD'}`,
      });
    }
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
          onNotificationAction={handleNotificationAction}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
          <BillingInvoicesView
            invoices={invoices}
            stats={stats}
            onOpenNewBill={() => setShowBillingModal(true)}
            onRecordPayment={(inv) => setSelectedPaymentInvoice(inv)}
            onPrintInvoice={(inv) => setSelectedThermalInvoice(inv)}
          />
        </main>
      </div>

      <MobileBottomNav />

      {/* 1. New Bill Modal */}
      {showBillingModal && (
        <BillingModal
          patients={patients}
          onClose={() => setShowBillingModal(false)}
          onGenerateInvoice={handleGenerateInvoice}
        />
      )}

      {/* 2. 80mm Thermal Receipt Slip Modal */}
      {selectedThermalInvoice && (
        <ThermalReceiptModal
          invoice={selectedThermalInvoice}
          onClose={() => setSelectedThermalInvoice(null)}
        />
      )}

      {/* 3. Dynamic UPI QR & Payment Record Modal */}
      {selectedPaymentInvoice && (
        <DynamicUpiQrModal
          invoice={selectedPaymentInvoice}
          onClose={() => setSelectedPaymentInvoice(null)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      {/* 4. Day-End Cash Drawer Closure Modal */}
      {showCashDrawerModal && (
        <DailyCashDrawerModal
          stats={stats}
          invoices={invoices}
          onClose={() => setShowCashDrawerModal(false)}
        />
      )}
    </div>
  );
}
