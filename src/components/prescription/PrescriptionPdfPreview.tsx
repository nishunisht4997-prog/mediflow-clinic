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
  Loader2,
} from 'lucide-react';
import { WhatsAppService } from '@/services/whatsapp.service';
import { CLINIC_CONFIG } from '@/config/clinic.config';

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
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (!prescription) return null;

  const doctor = prescription.doctor || {
    specialization: CLINIC_CONFIG.specialization,
    qualifications: CLINIC_CONFIG.qualifications,
    regNumber: CLINIC_CONFIG.regNumber,
    user: { name: CLINIC_CONFIG.doctorName },
  };

  const patient = prescription.patient || {};
  const clinic = prescription.clinic || {
    name: CLINIC_CONFIG.clinicName,
    address: CLINIC_CONFIG.address,
    phone: CLINIC_CONFIG.phone,
    email: CLINIC_CONFIG.email,
  };

  const items = prescription.items || [];
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const rxPublicUrl = `${origin}/rx/${prescription.id}`;

  const handlePrint = () => {
    window.print();
  };

  // 1. Direct 1-Click Client-Side PDF File Download
  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const element = document.getElementById('printable-area');
      if (!element) {
        window.print();
        return;
      }

      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const safePatientName = (patient.name || 'Patient').replace(/\s+/g, '_');
      pdf.save(`Prescription_${safePatientName}_${prescription.id?.slice(0, 6) || 'Rx'}.pdf`);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // 2. Direct Real WhatsApp Sharing
  const handleRealWhatsAppShare = async () => {
    const messageText = `Dear ${patient.name || 'Patient'}, ${doctor.user?.name || CLINIC_CONFIG.doctorName} has issued your digital prescription for "${prescription.diagnosis || 'Consultation'}".\n\n📄 View & Download official Rx PDF:\n${rxPublicUrl}\n\nClinic: ${clinic.name} (Ph: ${clinic.phone})`;
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

  // 3. Native Web Share / Copy Link
  const handleNativeShareOrCopy = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Prescription for ${patient.name} - ${clinic.name}`,
          text: `Digital Prescription for ${prescription.diagnosis} by ${doctor.user?.name || CLINIC_CONFIG.doctorName}`,
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

            {/* Direct 1-Click PDF File Download Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-xs font-bold text-sky-800 hover:bg-sky-100 transition shadow-2xs"
              title="Direct Download PDF to Device"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-600" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PDF</span>
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
                  <span>Share Link</span>
                </>
              )}
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
                {doctor.user?.name || CLINIC_CONFIG.doctorName}
              </h1>
              <p className="text-xs font-bold text-sky-700">{doctor.qualifications}</p>
              <p className="text-xs text-slate-600">{doctor.specialization}</p>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                Reg. No: <strong>{doctor.regNumber}</strong>
              </p>
            </div>

            <div className="text-right space-y-0.5">
              <div className="text-sm font-bold text-slate-900">{clinic.name}</div>
              <p className="text-[11px] text-slate-500 max-w-xs">{clinic.address}</p>
              <p className="text-[11px] font-mono text-slate-600">Ph: {clinic.phone}</p>
            </div>
          </div>

          {/* 2. Patient Demographics & Vitals Row */}
          <div className="my-4 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-700 border border-slate-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Patient Name</span>
                <strong className="text-slate-900">{patient.name || 'Walk-In Patient'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Age / Gender</span>
                <span>
                  {patient.age || '32'}y / {patient.gender || 'Male'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">UHID / Patient ID</span>
                <span className="font-mono text-sky-800 font-bold">{patient.uhid || 'MED-2026-001'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Date & Time</span>
                <span className="font-mono">
                  {prescription.createdAt
                    ? new Date(prescription.createdAt).toLocaleDateString('en-IN', {
                        dateStyle: 'medium',
                      })
                    : new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </span>
              </div>
            </div>

            {/* Vitals Snapshot */}
            {patient.vitals && patient.vitals[0] && (
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-4 text-[11px]">
                <span className="font-bold text-slate-600">Recorded Vitals:</span>
                <span>
                  BP: <strong>{patient.vitals[0].bpSystolic}/{patient.vitals[0].bpDiastolic} mmHg</strong>
                </span>
                <span>Pulse: <strong>{patient.vitals[0].pulse} bpm</strong></span>
                <span>SpO2: <strong>{patient.vitals[0].spo2}%</strong></span>
                <span>Temp: <strong>{patient.vitals[0].temperature}°F</strong></span>
                {patient.vitals[0].height && (
                  <span>Height: <strong>{patient.vitals[0].height} cm</strong></span>
                )}
                <span>Weight: <strong>{patient.vitals[0].weight} kg</strong></span>
                {(patient.vitals[0].bmi || (patient.vitals[0].weight && patient.vitals[0].height)) && (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-800">
                    BMI: <strong>{patient.vitals[0].bmi || (patient.vitals[0].weight / ((patient.vitals[0].height / 100) ** 2)).toFixed(1)} kg/m²</strong>
                  </span>
                )}
              </div>
            )}

            {/* Allergy Flag */}
            {patient.allergies && (
              <div className="mt-2 pt-2 border-t border-rose-200 text-rose-700 font-bold text-[11px] flex items-center gap-1">
                <span>⚠️ KNOWN ALLERGY:</span>
                <span>{patient.allergies}</span>
              </div>
            )}
          </div>

          {/* 3. Clinical Symptoms & Diagnosis */}
          <div className="space-y-2 mb-5">
            {prescription.symptoms && (
              <div className="text-xs">
                <span className="font-bold text-slate-900">Chief Symptoms: </span>
                <span className="text-slate-700">{prescription.symptoms}</span>
              </div>
            )}

            <div className="text-xs">
              <span className="font-bold text-slate-900">Clinical Diagnosis (ICD): </span>
              <strong className="text-sky-900">{prescription.diagnosis || 'General Consultation & Review'}</strong>
            </div>
          </div>

          {/* 4. Rx Symbol & Medications Table */}
          <div className="space-y-2 mb-6">
            <div className="text-xl font-serif font-black text-sky-900">℞</div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 text-[11px] font-bold uppercase text-slate-500">
                  <th className="py-2">#</th>
                  <th className="py-2">Medicine / Generic Formulation</th>
                  <th className="py-2">Dosage & Frequency</th>
                  <th className="py-2">Timing</th>
                  <th className="py-2">Duration</th>
                  <th className="py-2">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item: any, idx: number) => (
                  <tr key={item.id || idx} className="py-2.5">
                    <td className="py-2.5 font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-2.5">
                      <div className="font-bold text-slate-900">{item.medicineName}</div>
                      <div className="text-[10px] text-slate-400">{item.form || 'Tablet'} &bull; {item.dosage || ''}</div>
                    </td>
                    <td className="py-2.5 font-mono font-bold text-sky-800">{item.frequency || '1-0-1'}</td>
                    <td className="py-2.5 text-slate-600">{item.timing || 'After Food'}</td>
                    <td className="py-2.5 font-semibold text-slate-800">{item.durationDays ? `${item.durationDays} Days` : '5 Days'}</td>
                    <td className="py-2.5 text-slate-500 italic">{item.instructions || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. Investigations & Dietary Advice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-6">
            {prescription.investigationsAdvised && (
              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                <span className="font-bold text-slate-900 block mb-1">Investigations & Lab Tests Advised:</span>
                <p className="text-slate-700 leading-relaxed">{prescription.investigationsAdvised}</p>
              </div>
            )}

            {prescription.advice && (
              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                <span className="font-bold text-slate-900 block mb-1">Dietary & General Advice:</span>
                <p className="text-slate-700 leading-relaxed">{prescription.advice}</p>
              </div>
            )}
          </div>

          {/* 6. Follow-Up & Official Doctor Signature Block */}
          <div className="mt-8 pt-4 border-t-2 border-slate-200 flex items-end justify-between text-xs">
            <div>
              {(() => {
                let formattedDate = '';
                let daysCount = prescription.followUpDays || 7;

                if (prescription.nextFollowUpDate) {
                  const target = new Date(prescription.nextFollowUpDate);
                  formattedDate = target.toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  if (prescription.createdAt) {
                    const created = new Date(prescription.createdAt);
                    const diff = Math.max(1, Math.round((target.getTime() - created.getTime()) / 86400000));
                    if (!isNaN(diff)) daysCount = diff;
                  }
                } else if (prescription.followUpDays) {
                  const target = prescription.createdAt ? new Date(prescription.createdAt) : new Date();
                  target.setDate(target.getDate() + prescription.followUpDays);
                  formattedDate = target.toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                }

                if (formattedDate) {
                  return (
                    <div className="inline-block rounded-xl bg-purple-50 border border-purple-200 px-4 py-2.5 text-purple-950">
                      <div className="text-[10px] uppercase text-purple-700 font-extrabold tracking-wider">
                        Next Follow-Up / Review:
                      </div>
                      <div className="text-xs font-bold text-purple-950 mt-0.5">
                        Next Visit:{' '}
                        <strong className="text-purple-900 underline underline-offset-2">
                          {formattedDate}
                        </strong>{' '}
                        <span className="text-purple-600 font-semibold text-[11px]">
                          (After {daysCount} Days)
                        </span>
                      </div>
                    </div>
                  );
                }

                return <div className="text-slate-400">Review as advised or SOS in emergency.</div>;
              })()}
              <div className="text-[10px] text-slate-400 mt-2">
                This is a verified digital prescription generated via {CLINIC_CONFIG.clinicName}.
              </div>
            </div>

            <div className="text-center space-y-1">
              <div className="font-serif italic font-bold text-sky-900 text-sm">
                {doctor.user?.name || CLINIC_CONFIG.doctorName}
              </div>
              <div className="w-36 border-t border-slate-400 mx-auto" />
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Authorized Doctor Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
