'use client';

import React, { useState } from 'react';
import {
  Printer,
  Download,
  Share2,
  X,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { WhatsAppService } from '@/services/whatsapp.service';

interface PrescriptionPdfPreviewProps {
  prescription: any;
  onClose: () => void;
  onSendWhatsApp?: () => void;
}

export const PrescriptionPdfPreview: React.FC<PrescriptionPdfPreviewProps> = ({
  prescription,
  onClose,
  onSendWhatsApp,
}) => {
  const [copied, setCopied] = useState(false);
  const [whatsappSentStatus, setWhatsappSentStatus] = useState<string | null>(null);

  if (!prescription) return null;

  const doctor = prescription.doctor || {
    specialization: 'Senior Physician & Consultant Urologist',
    qualifications: 'MBBS, MD (General Medicine), DNB (Urology)',
    regNumber: 'MCI/OD/2014/09842',
    user: { name: 'Dr. Avishek Mohapatra' },
  };

  const patient = prescription.patient || {};
  const clinic = prescription.clinic || {
    name: "Dr. Avishek's Healthcare & Polyclinic",
    address: 'Plot 104, Saheed Nagar, Janpath Road, Bhubaneswar, Odisha',
    phone: '+91 98765 43210',
    email: 'contact@dravishekclinic.in',
  };

  const items = prescription.items || [];
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const rxPublicUrl = `${origin}/rx/${prescription.id}`;

  const handlePrint = () => {
    window.print();
  };

  // 1. Direct Real WhatsApp Sharing
  const handleRealWhatsAppShare = async () => {
    const messageText = `Dear ${patient.name || 'Patient'}, Dr. ${doctor.user?.name || 'Avishek'} has issued your digital prescription for "${prescription.diagnosis || 'Consultation'}".\n\n📄 View & Download official Rx PDF:\n${rxPublicUrl}\n\nClinic: ${clinic.name} (Ph: ${clinic.phone})`;
    const cleanPhone = patient.phone ? WhatsAppService.cleanPhoneNumber(patient.phone) : '';
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`;

    // Open real WhatsApp web / mobile app
    window.open(whatsappUrl, '_blank');
    setWhatsappSentStatus('WhatsApp chat opened with patient!');

    // Also log in backend
    try {
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: patient.name,
          recipientPhone: patient.phone,
          content: messageText,
          type: 'PRESCRIPTION',
        }),
      });
      if (onSendWhatsApp) onSendWhatsApp();
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => setWhatsappSentStatus(null), 3000);
  };

  // 2. Native Web Share / Copy Link
  const handleNativeShareOrCopy = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Prescription for ${patient.name} - ${clinic.name}`,
          text: `Digital Prescription for ${prescription.diagnosis} by Dr. Avishek Mohapatra`,
          url: rxPublicUrl,
        });
        return;
      } catch (err) {
        // user cancelled or fallback
      }
    }

    // Fallback to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(rxPublicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden my-auto max-h-[90vh]">
        {/* Modal Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3.5 border-b border-slate-200 bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">Printable Digital Prescription</span>
            <span className="rounded bg-sky-100 text-sky-800 text-[10px] font-mono px-2 py-0.2 font-bold">
              ID: {prescription.id?.slice(0, 8)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Direct WhatsApp Share Button */}
            <button
              onClick={handleRealWhatsAppShare}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
              title="Open WhatsApp Chat & Send PDF Link"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Share on WhatsApp</span>
            </button>

            {/* Native Share / Copy Link Button */}
            <button
              onClick={handleNativeShareOrCopy}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
              title="Copy Rx Public Link"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-slate-600" />
                  <span>Share / Copy Link</span>
                </>
              )}
            </button>

            {/* Print Letterhead */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-sky-700 transition"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Letterhead</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {whatsappSentStatus && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-xs font-bold text-emerald-800 flex items-center gap-2 no-print">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{whatsappSentStatus}</span>
          </div>
        )}

        {/* Printable Prescription Document Area */}
        <div id="printable-area" className="flex-1 overflow-y-auto p-8 font-sans text-slate-800 bg-white">
          {/* 1. Official Clinic Header */}
          <div className="flex items-start justify-between border-b-2 border-sky-600 pb-4">
            <div>
              <h1 className="text-xl font-extrabold text-sky-900 tracking-tight">
                {doctor.user?.name || 'Dr. Avishek Mohapatra'}
              </h1>
              <p className="text-xs font-bold text-sky-700">{doctor.qualifications}</p>
              <p className="text-xs text-slate-600">{doctor.specialization}</p>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                Reg. No: <strong>{doctor.regNumber}</strong>
              </p>
            </div>

            <div className="text-right space-y-0.5">
              <h2 className="text-sm font-bold text-slate-900">{clinic.name}</h2>
              <p className="text-[11px] text-slate-500 max-w-[240px]">{clinic.address}</p>
              <p className="text-[11px] text-slate-500 font-mono">Ph: {clinic.phone}</p>
            </div>
          </div>

          {/* 2. Patient Demographics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 rounded-xl bg-slate-50 p-3 text-xs border border-slate-200">
            <div>
              <span className="text-slate-400 font-medium">Patient Name:</span>
              <div className="font-bold text-slate-900">{patient.name || 'Rahul Das'}</div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Age / Gender:</span>
              <div className="font-semibold text-slate-900">
                {patient.age || 32} Y / {patient.gender || 'Male'}
              </div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">UHID / Phone:</span>
              <div className="font-mono text-slate-900">
                {patient.uhid || 'MF-2026-0001'} &bull; {patient.phone}
              </div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Date:</span>
              <div className="font-bold text-slate-900">
                {prescription.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]}
              </div>
            </div>
          </div>

          {/* 3. Clinical Diagnosis Banner */}
          <div className="my-4 border-l-4 border-sky-600 bg-sky-50/50 p-3 text-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-sky-800">
              Primary Diagnosis / Clinical Assessment:
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{prescription.diagnosis}</div>
            {prescription.symptoms && (
              <div className="text-slate-600 mt-1">
                <strong>Symptoms:</strong> {prescription.symptoms}
              </div>
            )}
          </div>

          {/* 4. Rx Symbol & Medicines Table */}
          <div className="my-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-black text-sky-900">℞</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Prescribed Medication</span>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="py-2">#</th>
                  <th className="py-2">Medicine Name & Formulation</th>
                  <th className="py-2">Dosage</th>
                  <th className="py-2">Frequency</th>
                  <th className="py-2">Timing</th>
                  <th className="py-2">Duration</th>
                  <th className="py-2">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((med: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 font-bold text-slate-900">
                      {med.medicineName}
                      <span className="ml-1.5 text-[10px] font-normal text-slate-500">({med.form})</span>
                    </td>
                    <td className="py-2.5 font-semibold text-slate-700">{med.dosage}</td>
                    <td className="py-2.5">
                      <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-800">
                        {med.frequency}
                      </span>
                    </td>
                    <td className="py-2.5 font-medium text-slate-700">{med.timing}</td>
                    <td className="py-2.5 font-bold text-slate-900">{med.durationDays} Days</td>
                    <td className="py-2.5 text-slate-500 text-[11px]">{med.instructions || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. Doctor Advice & Investigations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 pt-4 border-t border-slate-200 text-xs">
            {prescription.advice && (
              <div className="space-y-1">
                <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                  Advice & Lifestyle Guidance:
                </span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                  {prescription.advice}
                </p>
              </div>
            )}

            {prescription.investigationsAdvised && (
              <div className="space-y-1">
                <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                  Investigations Advised:
                </span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed font-medium">
                  {prescription.investigationsAdvised}
                </p>
              </div>
            )}
          </div>

          {/* 6. Footer: Next Follow-up & Doctor Digital Signature */}
          <div className="flex items-end justify-between pt-8 border-t-2 border-slate-200 mt-8">
            <div>
              {prescription.nextFollowUpDate && (
                <div className="text-xs">
                  <span className="text-slate-500">Next Follow-Up Date: </span>
                  <strong className="text-purple-700 font-bold underline">
                    {prescription.nextFollowUpDate}
                  </strong>
                </div>
              )}
              <div className="text-[10px] text-slate-400 mt-2">
                Generated via MediFlow OS &bull; Valid digital prescription under IT Act 2000
              </div>
            </div>

            <div className="text-center space-y-1">
              <div className="font-serif italic font-bold text-sky-800 text-sm border-b border-slate-400 pb-1 px-4">
                Dr. Avishek Mohapatra
              </div>
              <div className="text-[10px] font-bold text-slate-600 uppercase">Consultant Signature & Stamp</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
