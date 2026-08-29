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
} from 'lucide-react';
import Link from 'next/link';

export default function PublicRxViewPage() {
  const params = useParams();
  const id = params?.id as string;
  const [rx, setRx] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    qualifications: 'MBBS, MD (General Medicine), DNB (Urology)',
    specialization: 'Senior Physician & Consultant Urologist',
    regNumber: 'MCI/OD/2014/09842',
    user: { name: 'Dr. Avishek Mohapatra' },
  };

  const patient = rx.patient || {};
  const clinic = rx.clinic || {
    name: "Dr. Avishek's Healthcare & Polyclinic",
    address: 'Plot 104, Saheed Nagar, Janpath Road, Bhubaneswar, Odisha',
    phone: '+91 98765 43210',
  };

  const items = rx.items || [];

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 p-4 md:p-8">
      {/* Action Header */}
      <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between no-print">
        <Link
          href="/portal"
          className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Patient Health Portal</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-sky-700 transition"
          >
            <Printer className="h-4 w-4" />
            <span>Download / Print Official PDF</span>
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
            <div className="font-bold text-slate-900">{rx.createdAt?.split('T')[0]}</div>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="border-l-4 border-sky-600 bg-sky-50/50 p-3.5 text-xs rounded-r-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
            Primary Diagnosis:
          </div>
          <div className="text-base font-bold text-slate-900 mt-0.5">{rx.diagnosis}</div>
          {rx.symptoms && (
            <div className="text-slate-600 mt-1">
              <strong>Symptoms:</strong> {rx.symptoms}
            </div>
          )}
        </div>

        {/* Medicines */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-black text-sky-900">℞</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Prescribed Medicines ({items.length})
            </span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-slate-500 uppercase text-[10px] font-bold">
                <th className="py-2">#</th>
                <th className="py-2">Medicine Name</th>
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
                    <span className="ml-1 text-[10px] font-normal text-slate-500">
                      ({med.form})
                    </span>
                  </td>
                  <td className="py-2.5 font-semibold text-slate-700">{med.dosage}</td>
                  <td className="py-2.5">
                    <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-800">
                      {med.frequency}
                    </span>
                  </td>
                  <td className="py-2.5 font-medium text-slate-700">{med.timing}</td>
                  <td className="py-2.5 font-bold text-slate-900">{med.durationDays} Days</td>
                  <td className="py-2.5 text-slate-500 text-[11px]">
                    {med.instructions || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Advice & Tests */}
        {(rx.advice || rx.investigationsAdvised) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-xs">
            {rx.advice && (
              <div className="space-y-1">
                <span className="font-bold text-slate-800 uppercase text-[10px]">
                  Doctor Advice:
                </span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {rx.advice}
                </p>
              </div>
            )}

            {rx.investigationsAdvised && (
              <div className="space-y-1">
                <span className="font-bold text-slate-800 uppercase text-[10px]">
                  Lab Tests Advised:
                </span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-medium">
                  {rx.investigationsAdvised}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Doctor Signature */}
        <div className="flex items-end justify-between pt-8 border-t-2 border-slate-200 mt-6">
          <div>
            {rx.nextFollowUpDate && (
              <div className="text-xs">
                <span className="text-slate-500">Next Follow-Up Date: </span>
                <strong className="text-purple-700 font-bold underline">
                  {rx.nextFollowUpDate}
                </strong>
              </div>
            )}
            <div className="text-[10px] text-emerald-700 font-bold mt-2 flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Digitally Verified &bull; Valid Under Information Technology Act 2000</span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className="font-serif italic font-bold text-sky-800 text-sm border-b border-slate-400 pb-1 px-4">
              Dr. Avishek Mohapatra
            </div>
            <div className="text-[10px] font-bold text-slate-600 uppercase">
              Consultant Signature & Stamp
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
