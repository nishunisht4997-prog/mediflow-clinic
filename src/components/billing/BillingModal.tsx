'use client';

import React, { useState } from 'react';
import { Receipt, X, Plus, Trash2, IndianRupee, Sparkles, Send } from 'lucide-react';

interface BillingModalProps {
  patients: any[];
  initialPatientId?: string | null;
  onClose: () => void;
  onGenerateInvoice: (invoiceData: any) => Promise<void>;
}

export const BillingModal: React.FC<BillingModalProps> = ({
  patients,
  initialPatientId,
  onClose,
  onGenerateInvoice,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || patients[0]?.id || '');
  const [items, setItems] = useState<any[]>([
    { description: 'Doctor Consultation Fee', unitPrice: 800, quantity: 1 },
    { description: 'Diagnostic 12-Lead ECG', unitPrice: 450, quantity: 1 },
  ]);
  const [discount, setDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(1250);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [transactionRef, setTransactionRef] = useState<string>('UPI/APP_PAY');
  const [sendWhatsApp, setSendWhatsApp] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const presets = [
    { name: '+ Consultation (₹800)', price: 800, desc: 'Doctor Consultation Fee' },
    { name: '+ Ultrasound KUB (₹2,500)', price: 2500, desc: 'Ultrasound KUB (Kidney, Ureter, Bladder)' },
    { name: '+ Diagnostic ECG (₹450)', price: 450, desc: 'Diagnostic 12-Lead ECG' },
    { name: '+ Urine Routine (₹450)', price: 450, desc: 'Urine Routine & Microscopic Test' },
    { name: '+ Minor Dressing (₹350)', price: 350, desc: 'Wound Dressing / Minor Procedure' },
  ];

  const handleAddPreset = (preset: any) => {
    const newItems = [...items, { description: preset.desc, unitPrice: preset.price, quantity: 1 }];
    setItems(newItems);
    const newSubtotal = newItems.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
    setPaidAmount(newSubtotal - discount);
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', unitPrice: 500, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
    const newSubtotal = updated.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
    setPaidAmount(Math.max(0, newSubtotal - discount));
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
    const newSubtotal = updated.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
    setPaidAmount(Math.max(0, newSubtotal - discount));
  };

  const subtotal = items.reduce((acc, i) => acc + (parseFloat(i.unitPrice) || 0) * (parseInt(i.quantity, 10) || 1), 0);
  const totalAmount = Math.max(0, subtotal - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || items.length === 0) return;

    setIsSubmitting(true);
    try {
      await onGenerateInvoice({
        patientId: selectedPatientId,
        items,
        discount,
        tax: 0,
        paidAmount,
        paymentMethod,
        transactionRef,
        sendWhatsApp,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
              <Receipt className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-900">Generate Itemized Clinic Invoice</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700">Patient *</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold focus:border-teal-500 focus:outline-hidden"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.uhid}) - {p.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Service Presets */}
          <div>
            <span className="font-semibold text-slate-500 text-[11px]">Quick Add Services:</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Item Rows */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Bill Items</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[11px] font-bold text-teal-600 hover:underline"
              >
                + Custom Line Item
              </button>
            </div>

            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Service / Procedure Description"
                  value={item.description}
                  onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 p-2 text-xs font-semibold"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={item.unitPrice}
                  onChange={(e) => handleUpdateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className="w-24 rounded-lg border border-slate-200 p-2 text-xs font-mono font-bold text-right"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="text-slate-300 hover:text-rose-600 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Total & Discount */}
          <div className="rounded-xl bg-slate-50 p-3 space-y-2 border border-slate-200 font-semibold">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600 items-center">
              <span>Discount (₹):</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => {
                  const d = parseFloat(e.target.value) || 0;
                  setDiscount(d);
                  setPaidAmount(Math.max(0, subtotal - d));
                }}
                className="w-24 rounded-md border border-slate-200 bg-white p-1 text-right font-mono"
              />
            </div>
            <div className="flex justify-between text-slate-900 font-bold text-sm pt-1 border-t border-slate-200">
              <span>Net Payable:</span>
              <span className="font-mono text-teal-700">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Payment Collection Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700">Amount Paid Now (₹)</label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-mono font-bold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700">Payment Mode</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-bold focus:outline-hidden"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="CASH">Cash Drawer</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="NET_BANKING">Net Banking</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="invWa"
              checked={sendWhatsApp}
              onChange={(e) => setSendWhatsApp(e.target.checked)}
              className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="invWa" className="font-semibold text-slate-700 flex items-center gap-1">
              <Send className="h-3 w-3 text-teal-600" />
              <span>Send Invoice Receipt to Patient's WhatsApp</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-teal-600 px-5 py-2 font-bold text-white hover:bg-teal-700 shadow-md shadow-teal-600/20"
            >
              {isSubmitting ? 'Generating...' : 'Save & Print Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
