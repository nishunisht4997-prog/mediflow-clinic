'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  IndianRupee,
  CreditCard,
  Smartphone,
  Wallet,
  Printer,
  CheckCircle2,
  AlertCircle,
  Share2,
  X,
  QrCode,
  FileSpreadsheet,
} from 'lucide-react';
import { DynamicUpiQrModal } from '@/components/billing/DynamicUpiQrModal';
import { ThermalReceiptModal } from '@/components/billing/ThermalReceiptModal';
import { DailyCashDrawerModal } from '@/components/billing/DailyCashDrawerModal';

interface BillingInvoicesViewProps {
  invoices: any[];
  stats: any;
  onOpenNewBill: () => void;
  onRecordPayment: (invoice: any) => void;
  onPrintInvoice: (invoice: any) => void;
}

export const BillingInvoicesView: React.FC<BillingInvoicesViewProps> = ({
  invoices,
  stats,
  onOpenNewBill,
  onRecordPayment,
  onPrintInvoice,
}) => {
  const [selectedUpiInvoice, setSelectedUpiInvoice] = useState<any | null>(null);
  const [selectedThermalInvoice, setSelectedThermalInvoice] = useState<any | null>(null);
  const [showCashDrawerModal, setShowCashDrawerModal] = useState(false);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
              <Receipt className="h-5 w-5" />
            </span>
            <h1 className="text-lg font-bold text-slate-900">Billing, Invoices & Collections</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate itemized clinic invoices, record split payments (UPI/Cash/Card) & reconcile daily collections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCashDrawerModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
          >
            <Wallet className="h-4 w-4 text-emerald-600" />
            <span>Day-End Cash Reconciliation</span>
          </button>

          <button
            onClick={onOpenNewBill}
            className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-600/20 hover:bg-teal-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Generate New Invoice</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Billed</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            ₹{stats?.totalBilled?.toLocaleString('en-IN') || '33,250'}
          </div>
          <span className="text-[11px] text-slate-400">All OPD Services & Diagnostic Procedures</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <span className="text-xs font-semibold text-emerald-800">Total Collected</span>
          <div className="text-2xl font-bold text-emerald-950 mt-1">
            ₹{stats?.totalCollected?.toLocaleString('en-IN') || '28,500'}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">85.7% Collection Rate</span>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs">
          <span className="text-xs font-semibold text-rose-800">Outstanding Dues</span>
          <div className="text-2xl font-bold text-rose-950 mt-1">
            ₹{stats?.totalPending?.toLocaleString('en-IN') || '4,750'}
          </div>
          <span className="text-[11px] text-rose-700 font-medium">Follow-up balance due</span>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4 shadow-xs">
          <span className="text-xs font-semibold text-sky-800">Payment Modes Split</span>
          <div className="text-xs text-slate-700 font-semibold mt-2 space-y-1">
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <Smartphone className="h-3 w-3 text-sky-600" /> UPI:
              </span>
              <strong>₹{stats?.upiCollected?.toLocaleString('en-IN') || '19,950'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <Wallet className="h-3 w-3 text-emerald-600" /> Cash:
              </span>
              <strong>₹{stats?.cashCollected?.toLocaleString('en-IN') || '8,550'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">Recent Invoices & Receipts</h2>
          <span className="text-xs font-semibold text-slate-500">{invoices.length} Total Bills</span>
        </div>

        <div className="divide-y divide-slate-100">
          {invoices.map((inv) => {
            const isPaid = inv.paymentStatus === 'PAID';
            const isPartial = inv.paymentStatus === 'PARTIAL';

            return (
              <div
                key={inv.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">{inv.invoiceNumber}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : isPartial
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {inv.paymentStatus}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {inv.createdAt?.split('T')[0]}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-800">
                    Patient: {inv.patient?.name}{' '}
                    <span className="font-normal text-slate-500 font-mono">({inv.patient?.uhid})</span>
                  </div>

                  {inv.items && inv.items.length > 0 && (
                    <div className="text-xs text-slate-500">
                      {inv.items.map((i: any) => `${i.description} (₹${i.total})`).join(', ')}
                    </div>
                  )}
                </div>

                {/* Amount and Print / Collect Actions */}
                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-base font-black text-slate-900">₹{inv.totalAmount?.toLocaleString('en-IN')}</div>
                    <div className="text-[11px] text-slate-500">
                      Paid: <strong className="text-emerald-700">₹{inv.paidAmount?.toLocaleString('en-IN')}</strong>
                      {inv.totalAmount - inv.paidAmount > 0 && (
                        <span className="text-rose-600 font-semibold ml-1">
                          (Due: ₹{inv.totalAmount - inv.paidAmount})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Instant UPI QR Code Button */}
                    <button
                      onClick={() => setSelectedUpiInvoice(inv)}
                      className="flex items-center gap-1 rounded-lg bg-sky-50 border border-sky-200 px-3 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100 transition shadow-2xs"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>UPI QR</span>
                    </button>

                    {/* Thermal 80mm Slip Button */}
                    <button
                      onClick={() => setSelectedThermalInvoice(inv)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                      title="Print 80mm Thermal Receipt"
                    >
                      <Receipt className="h-3.5 w-3.5 text-teal-600" />
                      <span>80mm Slip</span>
                    </button>

                    {isPartial && (
                      <button
                        onClick={() => onRecordPayment(inv)}
                        className="rounded-lg bg-teal-50 border border-teal-200 px-3 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-100 transition"
                      >
                        Collect Due
                      </button>
                    )}

                    <button
                      onClick={() => onPrintInvoice(inv)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>A4 Bill</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic UPI QR Modal */}
      {selectedUpiInvoice && (
        <DynamicUpiQrModal
          invoice={selectedUpiInvoice}
          onClose={() => setSelectedUpiInvoice(null)}
          onConfirmPayment={async (invId, amt) => {
            await fetch('/api/billing/payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                invoiceId: invId,
                amount: amt,
                method: 'UPI',
                transactionRef: `UPI/DYNAMIC_QR/${Date.now()}`,
              }),
            });
            window.location.reload();
          }}
        />
      )}

      {/* Thermal 80mm POS Receipt Slip Modal */}
      {selectedThermalInvoice && (
        <ThermalReceiptModal
          invoice={selectedThermalInvoice}
          onClose={() => setSelectedThermalInvoice(null)}
        />
      )}

      {/* Daily Cash Drawer Closing Modal */}
      {showCashDrawerModal && (
        <DailyCashDrawerModal
          stats={stats}
          invoices={invoices}
          onClose={() => setShowCashDrawerModal(false)}
        />
      )}
    </div>
  );
};
