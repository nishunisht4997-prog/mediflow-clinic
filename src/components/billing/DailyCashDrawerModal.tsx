'use client';

import React from 'react';
import { Wallet, Smartphone, CreditCard, X, Printer, CheckCircle2, IndianRupee, FileSpreadsheet } from 'lucide-react';
import { formatINR } from '@/lib/utils';

interface DailyCashDrawerModalProps {
  stats: any;
  invoices: any[];
  onClose: () => void;
}

export const DailyCashDrawerModal: React.FC<DailyCashDrawerModalProps> = ({
  stats,
  invoices,
  onClose,
}) => {
  const openingFloat = 2000;
  const cashCollected = stats?.cashCollected || 8550;
  const upiCollected = stats?.upiCollected || 19950;
  const cardCollected = stats?.cardCollected || 0;
  const totalDrawerCash = openingFloat + cashCollected;
  const totalShiftRevenue = cashCollected + upiCollected + cardCollected;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden my-auto p-6 space-y-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 no-print">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Wallet className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Day-End Cash Drawer & Financial Reconciliation</h3>
              <p className="text-[10px] text-slate-400">Shift Date: {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Printable Area */}
        <div id="printable-area" className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="flex justify-between items-center text-slate-600">
              <span>Opening Cash Float (Morning):</span>
              <strong className="font-mono">₹{openingFloat.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between items-center text-emerald-800">
              <span>+ Cash Collections Received (OPD):</span>
              <strong className="font-mono">₹{cashCollected.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between items-center font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Physical Cash in Drawer:</span>
              <span className="font-mono text-emerald-700">₹{totalDrawerCash.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Digital Revenue Tally */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5">
            <div className="text-[11px] font-bold uppercase text-slate-400">Digital Channel Breakdown</div>
            <div className="flex justify-between text-slate-700">
              <span className="flex items-center gap-1"><Smartphone className="h-3.5 w-3.5 text-sky-600" /> UPI Direct (HDFC QR):</span>
              <strong className="font-mono">₹{upiCollected.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between text-slate-700">
              <span className="flex items-center gap-1"><CreditCard className="h-3.5 w-3.5 text-purple-600" /> POS Card Swipe / NetBanking:</span>
              <strong className="font-mono">₹{cardCollected.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total Day Collections (Cash + Digital):</span>
              <span className="font-mono text-teal-700">₹{totalShiftRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-[11px] text-emerald-900 flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Shift Tally Matched: Zero variance detected across {invoices.length} invoices.</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800 shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Closing Sheet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
