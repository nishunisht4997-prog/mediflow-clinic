'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  Wallet,
  Receipt,
  Plus,
  IndianRupee,
  CreditCard,
  Smartphone,
  Printer,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  QrCode,
} from 'lucide-react';
import { BillingInvoicesView } from '@/components/billing/BillingInvoicesView';
import { BillingModal } from '@/components/billing/BillingModal';
import { ThermalReceiptModal } from '@/components/billing/ThermalReceiptModal';
import { DynamicUpiQrModal } from '@/components/billing/DynamicUpiQrModal';
import { DailyCashDrawerModal } from '@/components/billing/DailyCashDrawerModal';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ClinicBroadcast } from '@/lib/broadcast';
import { CLINIC_CONFIG } from '@/config/clinic.config';

export default function AccountsDeskPage() {
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
        recordedBy: 'Rajesh Behera (Cashier)',
      }),
    });

    // 🚀 REAL-TIME BROADCAST: Notify Doctor & Reception that payment is collected
    ClinicBroadcast.publish({
      type: 'PAYMENT_COLLECTED',
      title: `Fee Collected: ₹${amount} Paid`,
      message: `${inv?.patient?.name || 'Patient'} has paid consultation fee of ₹${amount}. Patient cleared for doctor consultation.`,
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
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar
          currentRole="ACCOUNTANT"
          setCurrentRole={() => {}}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onNotificationAction={handleNotificationAction}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6 space-y-6">
          {/* Top Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-400/30 mb-2">
                <Wallet className="h-3.5 w-3.5" />
                <span>Accounts & Cashier Desk &bull; In-Charge: Rajesh Behera</span>
              </div>
              <h1 className="text-2xl font-black">POS Billing Counter & Day-End Cashier Reconciliation</h1>
              <p className="text-xs text-emerald-200/80 mt-1">
                Itemized invoice generation, UPI/Cash split collection, 80mm thermal roll receipts, and cash drawer closing tally.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setShowCashDrawerModal(true)}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-white/10 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-emerald-200 hover:bg-white/20 transition shrink-0"
              >
                <Wallet className="h-4 w-4" />
                <span>Day-End Cash Drawer</span>
              </button>

              <button
                onClick={() => setShowBillingModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>+ New Bill (POS)</span>
              </button>
            </div>
          </div>

          {/* Master Billing View Component */}
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

      {/* 1. New Bill Creation Modal */}
      {showBillingModal && (
        <BillingModal
          patients={patients}
          onClose={() => setShowBillingModal(false)}
          onGenerateInvoice={handleGenerateInvoice}
        />
      )}

      {/* 2. 80mm POS Thermal Receipt Slip Modal */}
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

      {/* 4. Day-End Cash Drawer Closure & Tally Modal */}
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
