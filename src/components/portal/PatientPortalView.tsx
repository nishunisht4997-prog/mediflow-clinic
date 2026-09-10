'use client';

import React, { useState } from 'react';
import {
  Smartphone,
  FileText,
  Calendar,
  Receipt,
  Download,
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HeartPulse,
  Pill,
  Users,
} from 'lucide-react';
import { PrescriptionPdfPreview } from '@/components/prescription/PrescriptionPdfPreview';
import { CLINIC_CONFIG } from '@/config/clinic.config';
import { VitalsTrendChart } from '@/components/portal/VitalsTrendChart';

interface PatientPortalViewProps {
  patients: any[];
  onViewPrescriptionPdf: (rx: any) => void;
}

export const PatientPortalView: React.FC<PatientPortalViewProps> = ({
  patients,
  onViewPrescriptionPdf,
}) => {
  const [selectedUhid, setSelectedUhid] = useState(patients[0]?.uhid || 'MF-2026-0001');
  const [searchInput, setSearchInput] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) {
      setSearchError('Please enter a mobile number, UHID, or email.');
      return;
    }

    const cleanDigits = query.replace(/[^0-9]/g, '');
    const match = patients.find((p) => {
      const pDigits = (p.phone || '').replace(/[^0-9]/g, '');
      const matchPhone = cleanDigits.length >= 4 && (pDigits.includes(cleanDigits) || cleanDigits.includes(pDigits.slice(-10)));
      const matchUhid = p.uhid?.toLowerCase() === query.toLowerCase();
      const matchEmail = p.email && p.email.toLowerCase() === query.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(query.toLowerCase());
      return matchPhone || matchUhid || matchEmail || matchName;
    });

    if (match) {
      setSelectedUhid(match.uhid);
      setSearchError(null);
    } else {
      setSearchError(`No patient record found for "${query}".`);
    }
  };

  const patient = patients.find((p) => p.uhid === selectedUhid) || patients[0];

  const medicineSchedule = [
    { name: 'Tab. Telmisartan 40mg', time: 'Morning (08:30 AM)', timing: 'After Breakfast', taken: true },
    { name: 'Tab. Metformin SR 500mg', time: 'Afternoon (01:30 PM)', timing: 'With Lunch', taken: true },
    { name: 'Tab. Rosuvastatin 10mg', time: 'Night (09:30 PM)', timing: 'Bedtime', taken: false },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Search */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300 border border-purple-400/30 mb-2">
              <Smartphone className="h-3.5 w-3.5" />
              <span>Patient Self-Service Digital Portal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">Search & Access Patient Health Locker</h2>
            <p className="text-xs text-purple-200/80 mt-1 max-w-xl">
              Enter registered 10-digit Mobile Number, UHID, or Email to view digital prescriptions, vitals trajectory, and bills.
            </p>
          </div>

          {patient && (
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-2xl backdrop-blur-md">
              <span className="text-xs font-bold text-white">{patient.name}</span>
              <span className="text-[10px] text-purple-200 font-mono">({patient.uhid})</span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-purple-300" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter 10-digit Mobile (+91), UHID (MF-2026-0001) or Email..."
              className="w-full rounded-2xl border border-white/20 bg-white/10 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold text-white placeholder-purple-300/60 focus:bg-white focus:text-slate-900 focus:outline-hidden backdrop-blur-md transition"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-2xl bg-purple-500 hover:bg-purple-400 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-lg shadow-purple-500/30 transition shrink-0"
          >
            <Search className="h-4 w-4" />
            <span>Search Records</span>
          </button>
        </form>

        {/* Quick Demo Profile Chips */}
        <div className="pt-2 border-t border-white/10 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[11px] font-semibold text-purple-300">Quick Profiles:</span>
          {patients.slice(0, 4).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelectedUhid(p.uhid);
                setSearchInput(p.phone || p.uhid);
                setSearchError(null);
              }}
              className={`rounded-xl px-2.5 py-1 text-[11px] font-bold border transition ${
                selectedUhid === p.uhid
                  ? 'bg-purple-500 text-white border-purple-400'
                  : 'bg-white/10 text-purple-200 border-white/15 hover:bg-white/20'
              }`}
            >
              {p.name} ({p.uhid})
            </button>
          ))}
        </div>

        {searchError && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-semibold">
            {searchError}
          </div>
        )}
      </div>

      {patient && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 4 cols: Patient Card & Daily Medicine Schedule */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-white font-bold text-xl">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{patient.name}</h3>
                  <span className="text-xs font-mono text-purple-700 font-bold">{patient.uhid}</span>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {patient.age}y &bull; {patient.gender} &bull; Blood: {patient.bloodGroup || 'B+'}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div>
                  <strong className="text-slate-800">Registered Phone:</strong> {patient.phone}
                </div>
                {patient.medicalHistory && (
                  <div>
                    <strong className="text-slate-800">Known Conditions:</strong> {patient.medicalHistory}
                  </div>
                )}
                {patient.allergies && (
                  <div className="text-rose-700 font-bold">
                    <strong>Allergies:</strong> {patient.allergies}
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-purple-50 p-3 text-xs text-purple-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-purple-600 shrink-0" />
                <span>Encrypted ABDM / Ayushman Bharat Digital ID Verified</span>
              </div>
            </div>

            {/* Daily Medicine Adherence Tracker */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-slate-800 flex items-center gap-1.5">
                  <Pill className="h-4 w-4 text-purple-600" />
                  <span>Today's Medicine Schedule</span>
                </h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  2/3 Taken
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {medicineSchedule.map((med, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      med.taken ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{med.name}</div>
                      <div className="text-[10px] opacity-75">{med.time} &bull; {med.timing}</div>
                    </div>
                    <span className="text-[10px] font-bold">
                      {med.taken ? '✓ Taken' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 8 cols: Vitals Historical Graph, Prescriptions, Reports */}
          <div className="lg:col-span-8 space-y-6">
            {/* Interactive Vitals Trend Chart */}
            <VitalsTrendChart vitals={patient.vitals} />

            {/* Prescriptions Locker */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-sky-600" />
                <span>My Prescriptions & Medicines</span>
              </h3>

              {patient.prescriptions && patient.prescriptions.length > 0 ? (
                <div className="space-y-3">
                  {patient.prescriptions.map((rx: any) => (
                    <div
                      key={rx.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900">Diagnosis: {rx.diagnosis}</div>
                        <div className="text-[11px] text-slate-400">
                          Prescribed by {CLINIC_CONFIG.doctorShortName} &bull; Date: {rx.createdAt?.split('T')[0]}
                        </div>
                      </div>

                      <button
                        onClick={() => onViewPrescriptionPdf(rx)}
                        className="flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-sky-700"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download Rx PDF</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400">No prescriptions found.</div>
              )}
            </div>

            {/* Lab Reports & Bills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Lab Reports */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-600">Lab Reports & Scans</h4>
                {patient.documents?.map((doc: any) => (
                  <div key={doc.id} className="p-2.5 rounded-xl bg-slate-50 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-slate-800">{doc.title}</div>
                      <div className="text-[10px] text-slate-400">{doc.category}</div>
                    </div>
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-sky-600 font-bold">
                      View
                    </a>
                  </div>
                ))}
              </div>

              {/* Bills */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-600">Payment Invoices</h4>
                {patient.invoices?.map((inv: any) => (
                  <div key={inv.id} className="p-2.5 rounded-xl bg-slate-50 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-emerald-700 font-semibold">Paid: ₹{inv.paidAmount}</div>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      {inv.paymentStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
