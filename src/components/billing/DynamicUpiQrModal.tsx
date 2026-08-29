'use client';

import React, { useState } from 'react';
import { QrCode, X, CheckCircle2, Copy, Check, Smartphone, IndianRupee } from 'lucide-react';
import { generateUpiUri, getQrCodeImageUrl } from '@/lib/upi';

interface DynamicUpiQrModalProps {
  invoice: any;
  onClose: () => void;
  onConfirmPayment: (invoiceId: string, amount: number) => Promise<void>;
}

export const DynamicUpiQrModal: React.FC<DynamicUpiQrModalProps> = ({
  invoice,
  onClose,
  onConfirmPayment,
}) => {
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const amountToCollect = invoice?.totalAmount - (invoice?.paidAmount || 0) || 800;
  const vpa = 'dravishekclinic@hdfcbank';
  const clinicName = "Dr. Avishek's Healthcare & Polyclinic";

  const upiUri = generateUpiUri({
    vpa,
    name: clinicName,
    amount: amountToCollect,
    invoiceNumber: invoice?.invoiceNumber || 'INV-2026-0181',
  });

  const qrImageUrl = getQrCodeImageUrl(upiUri, 240);

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(vpa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirmPayment(invoice.id, amountToCollect);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden my-auto p-6 text-center space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800">
            <Smartphone className="h-4 w-4 text-sky-600" />
            <span>Instant Dynamic UPI QR</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <div className="text-xs text-slate-400 font-semibold">{invoice?.invoiceNumber} &bull; {invoice?.patient?.name}</div>
          <div className="text-2xl font-black text-slate-900 mt-1">₹{amountToCollect.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Exact Amount Auto-Filled</div>
        </div>

        {/* QR Code Container */}
        <div className="rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 inline-block shadow-xs">
          <img
            src={qrImageUrl}
            alt="UPI QR Code"
            className="h-56 w-56 mx-auto rounded-xl object-contain bg-white p-2 border border-slate-200"
          />
          <div className="flex items-center justify-center gap-3 mt-3 text-[10px] font-bold text-slate-500">
            <span className="text-sky-600 font-black">GPay</span>
            <span>&bull;</span>
            <span className="text-purple-600 font-black">PhonePe</span>
            <span>&bull;</span>
            <span className="text-blue-500 font-black">Paytm</span>
            <span>&bull;</span>
            <span className="text-emerald-700 font-black">BHIM</span>
          </div>
        </div>

        {/* VPA Copier */}
        <div className="flex items-center justify-between bg-slate-100 p-2 rounded-xl text-xs font-mono text-slate-700">
          <span className="truncate max-w-[200px]">{vpa}</span>
          <button onClick={handleCopyVpa} className="text-sky-600 font-sans font-bold text-[11px] flex items-center gap-1">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? 'Copied' : 'Copy VPA'}</span>
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={handleConfirm}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>{isProcessing ? 'Recording...' : 'Confirm UPI Received (₹' + amountToCollect + ')'}</span>
        </button>
      </div>
    </div>
  );
};
