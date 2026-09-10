'use client';

import React from 'react';
import { Printer, X, Download, Share2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { CLINIC_CONFIG } from '@/config/clinic.config';

interface ThermalReceiptModalProps {
  invoice: any;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  invoice,
  onClose,
}) => {
  if (!invoice) return null;

  const clinic = invoice.clinic || {
    name: CLINIC_CONFIG.clinicName,
    address: CLINIC_CONFIG.address,
    phone: CLINIC_CONFIG.phone,
    gstin: '21ABCDE1234F1Z5',
  };

  const patient = invoice.patient || {};
  const items = invoice.items || [];
  const cgst = (invoice.subtotal * 0.09).toFixed(2);
  const sgst = (invoice.subtotal * 0.09).toFixed(2);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden my-auto max-h-[90vh]">
        {/* Action Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50 no-print">
          <span className="text-xs font-bold text-slate-800">80mm POS Thermal Slip</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700 shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Thermal Slip</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 80mm Thermal Receipt Content */}
        <div id="printable-area" className="p-6 font-mono text-[11px] text-slate-900 bg-white space-y-3 leading-relaxed">
          {/* Header */}
          <div className="text-center space-y-0.5 border-b border-dashed border-slate-400 pb-3">
            <div className="font-bold text-sm uppercase tracking-wider">{clinic.name}</div>
            <div className="text-[10px] text-slate-600">{clinic.address}</div>
            <div className="text-[10px] text-slate-600">Ph: {clinic.phone}</div>
            <div className="text-[9px] text-slate-500 font-bold mt-1">GSTIN: {clinic.gstin || '21AAAAA0000A1Z5'}</div>
          </div>

          {/* Receipt Meta */}
          <div className="space-y-1 border-b border-dashed border-slate-400 pb-2">
            <div className="flex justify-between">
              <span>Receipt #: <strong>{invoice.invoiceNumber}</strong></span>
              <span>{invoice.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]}</span>
            </div>
            <div className="flex justify-between">
              <span>Patient: <strong>{patient.name}</strong></span>
              <span>UHID: {patient.uhid}</span>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-1.5 border-b border-dashed border-slate-400 pb-3">
            <div className="flex justify-between font-bold text-[10px] uppercase border-b border-slate-200 pb-1">
              <span>Item / Service</span>
              <span>Amount</span>
            </div>
            {items.map((it: any, i: number) => (
              <div key={i} className="flex justify-between">
                <span className="truncate max-w-[180px]">{it.description}</span>
                <span className="font-bold">₹{it.total}</span>
              </div>
            ))}
          </div>

          {/* Totals & Tax */}
          <div className="space-y-1 border-b border-dashed border-slate-400 pb-3 text-right">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{invoice.subtotal?.toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount:</span>
                <span>-₹{invoice.discount?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>CGST (9%):</span>
              <span>₹{cgst}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>SGST (9%):</span>
              <span>₹{sgst}</span>
            </div>
            <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-300">
              <span>Net Total:</span>
              <span>₹{invoice.totalAmount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-emerald-800">
              <span>Paid:</span>
              <span>₹{invoice.paidAmount?.toFixed(2)}</span>
            </div>
            {invoice.totalAmount - invoice.paidAmount > 0 && (
              <div className="flex justify-between font-bold text-rose-700">
                <span>Balance Due:</span>
                <span>₹{(invoice.totalAmount - invoice.paidAmount)?.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center space-y-1 pt-2 text-[10px] text-slate-500">
            <div>Mode: <strong>{invoice.payments?.[0]?.method || 'UPI'}</strong></div>
            <div className="font-bold">Thank you for visiting! Get well soon.</div>
            <div className="text-[8px] text-slate-400">Powered by MediFlow Clinic OS</div>
          </div>
        </div>
      </div>
    </div>
  );
};
