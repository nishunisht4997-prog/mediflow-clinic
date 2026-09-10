'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  FileText,
  Printer,
  Download,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Building2,
  Clock,
  ArrowLeft,
  Loader2,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { CLINIC_CONFIG } from '@/config/clinic.config';

export default function PublicRxViewPage() {
  const params = useParams();
  const id = params?.id as string;
  const [rx, setRx] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/prescriptions/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Prescription not found or expired');
          return res.json();
        })
        .then((data) => {
          setRx(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  // Direct 1-Click Client-Side PDF File Download
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

      const safePatientName = (rx.patient?.name || 'Patient').replace(/\s+/g, '_');
      pdf.save(`Prescription_${safePatientName}_${rx.id?.slice(0, 6) || 'Rx'}.pdf`);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Prescription for ${rx.patient?.name || 'Patient'}`,
          text: `Verified Digital Prescription from ${CLINIC_CONFIG.clinicName}`,
          url: window.location.href,
        });
        return;
      } catch (err) {}
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-slate-800">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="font-bold text-sm">Loading Verified Digital Prescription...</div>
        </div>
      </div>
    );
  }

  if (error || !rx) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow-lg border border-slate-200 space-y-4">
          <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            ✕
          </div>
          <h2 className="text-base font-bold text-slate-900">Prescription Not Found</h2>
          <p className="text-xs text-slate-500">{error || 'Invalid prescription link.'}</p>
          <Link
            href="/"
            className="inline-block rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white"
          >
            Go to MediFlow
          </Link>
        </div>
      </div>
    );
  }

  const doctor = rx.doctor || {
    qualifications: CLINIC_CONFIG.qualifications,
    specialization: CLINIC_CONFIG.specialization,
    regNumber: CLINIC_CONFIG.regNumber,
    user: { name: CLINIC_CONFIG.doctorName },
  };

  const patient = rx.patient || {};
  const clinic = rx.clinic || {
    name: CLINIC_CONFIG.clinicName,
    address: CLINIC_CONFIG.address,
    phone: CLINIC_CONFIG.phone,
  };

  const items = rx.items || [];

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 p-4 md:p-8">
      {/* Action Header */}
      <div className="max-w-3xl mx-auto mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <Link
          href="/portal"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Patient Health Portal</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {/* Direct 1-Click PDF Download Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
            title="Download Prescription as PDF to your device"
          >
            {isDownloadingPdf ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          {/* Print Letterhead */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-sky-700 transition"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 text-slate-600" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prescription Document Card */}
      <div
        id="printable-area"
        className="max-w-3xl mx-auto rounded-3xl bg-white shadow-xl border border-slate-200 p-8 md:p-10 space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-sky-600 pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-sky-950">
              {doctor.user?.name || CLINIC_CONFIG.doctorName}
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

        {/* Patient Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-2xl bg-slate-50 p-4 text-xs border border-slate-200">
          <div>
            <span className="text-slate-400 font-medium">Patient:</span>
            <div className="font-bold text-slate-900">{patient.name}</div>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Age / Gender:</span>
            <div className="font-semibold text-slate-900">
              {patient.age} Y / {patient.gender}
            </div>
          </div>
          <div>
            <span className="text-slate-400 font-medium">UHID:</span>
            <div className="font-mono text-slate-900 font-bold">{patient.uhid}</div>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Date:</span>
            <div className="font-mono font-semibold text-slate-900">
              {new Date(rx.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
            </div>
          </div>
        </div>

        {/* Symptoms & Diagnosis */}
        <div className="space-y-3">
          {rx.symptoms && (
            <div>
              <span className="text-xs font-bold text-slate-700">Symptoms: </span>
              <span className="text-xs text-slate-600">{rx.symptoms}</span>
            </div>
          )}

          <div>
            <span className="text-xs font-bold text-slate-700">Diagnosis (ICD): </span>
            <span className="text-xs font-black text-sky-900">{rx.diagnosis}</span>
          </div>
        </div>

        {/* Prescription Table */}
        <div className="space-y-2">
          <div className="font-serif italic font-black text-2xl text-sky-800">℞</div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-500 uppercase text-[10px]">
                <th className="py-2">#</th>
                <th className="py-2">Medicine Name</th>
                <th className="py-2">Frequency</th>
                <th className="py-2">Timing</th>
                <th className="py-2">Duration</th>
                <th className="py-2">Instructions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item: any, idx: number) => (
                <tr key={item.id || idx}>
                  <td className="py-2.5 text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-2.5">
                    <div className="font-bold text-slate-900">{item.medicineName}</div>
                    <div className="text-[10px] text-slate-400">{item.form} &bull; {item.dosage}</div>
                  </td>
                  <td className="py-2.5 font-bold font-mono text-sky-800">{item.frequency}</td>
                  <td className="py-2.5 text-slate-600">{item.timing}</td>
                  <td className="py-2.5 font-medium">{item.durationDays} Days</td>
                  <td className="py-2.5 text-slate-500 italic">{item.instructions || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Advice & Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          {rx.investigationsAdvised && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Investigations Advised:</span>
              <p className="text-slate-600">{rx.investigationsAdvised}</p>
            </div>
          )}

          {rx.advice && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Diet & Lifestyle Advice:</span>
              <p className="text-slate-600">{rx.advice}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t-2 border-slate-200 flex items-end justify-between text-xs">
          <div>
            {(rx.followUpDays || rx.nextFollowUpDate) && (
              <div className="inline-block rounded-xl bg-purple-50 border border-purple-200 px-4 py-2 text-purple-950">
                <div className="text-[10px] uppercase text-purple-700 font-extrabold tracking-wider">
                  Next Follow-Up / Review:
                </div>
                <div className="text-xs font-bold text-purple-950 mt-0.5">
                  Next Visit:{' '}
                  <strong className="text-purple-900 underline underline-offset-2">
                    {(() => {
                      if (rx.nextFollowUpDate) {
                        return new Date(rx.nextFollowUpDate).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        });
                      }
                      const d = rx.createdAt ? new Date(rx.createdAt) : new Date();
                      d.setDate(d.getDate() + (rx.followUpDays || 7));
                      return d.toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      });
                    })()}
                  </strong>{' '}
                  <span className="text-purple-600 font-semibold text-[11px]">
                    (After {rx.followUpDays || 7} Days)
                  </span>
                </div>
              </div>
            )}
            <p className="text-[10px] text-slate-400 mt-2">
              Digitally issued & verified prescription via {clinic.name}.
            </p>
          </div>

          <div className="text-center space-y-1">
            <div className="font-serif italic font-bold text-sky-900 text-sm">
              {doctor.user?.name || CLINIC_CONFIG.doctorName}
            </div>
            <div className="w-32 border-t border-slate-400 mx-auto" />
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Authorized Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
}
