'use client';

import React, { useState, useEffect } from 'react';
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
  Printer,
  Stethoscope,
  RefreshCw,
  ExternalLink,
  Pill,
} from 'lucide-react';
import Link from 'next/link';
import { PrescriptionPdfPreview } from '@/components/prescription/PrescriptionPdfPreview';
import { VitalsTrendChart } from '@/components/portal/VitalsTrendChart';

export default function PatientPortalPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedUhid, setSelectedUhid] = useState('MF-2026-0001');
  const [activePatientData, setActivePatientData] = useState<any | null>(null);
  const [selectedRx, setSelectedRx] = useState<any | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load 360 Patient Record
  const loadPatient360 = async (patientId: string) => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/patients/${patientId}`);
      if (res.ok) {
        const fullData = await res.json();
        setActivePatientData(fullData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial load
  const loadInitialData = async () => {
    try {
      const res = await fetch('/api/patients');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setPatients(data);
        const match = data.find((p) => p.uhid === selectedUhid) || data[0];
        setSelectedUhid(match.uhid);
        await loadPatient360(match.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSelectPatient = async (uhid: string) => {
    setSelectedUhid(uhid);
    const pat = patients.find((p) => p.uhid === uhid);
    if (pat) {
      await loadPatient360(pat.id);
    }
  };

  const handleRefresh = async () => {
    if (activePatientData?.id) {
      await loadPatient360(activePatientData.id);
    } else {
      await loadInitialData();
    }
  };

  const patient = activePatientData || patients.find((p) => p.uhid === selectedUhid) || patients[0];

  const medicineSchedule = [
    { name: 'Tab. Telmisartan 40mg', time: 'Morning (08:30 AM)', timing: 'After Breakfast', taken: true },
    { name: 'Tab. Metformin SR 500mg', time: 'Afternoon (01:30 PM)', timing: 'With Lunch', taken: true },
    { name: 'Tab. Rosuvastatin 10mg', time: 'Night (09:30 PM)', timing: 'Bedtime', taken: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-purple-500 selection:text-white pb-12">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white font-bold">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-900">MediFlow Patient Health Portal</span>
            <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.2 text-[10px] font-bold text-purple-800">
              ABDM Verified
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-purple-600' : 'text-slate-500'}`} />
            <span>{isRefreshing ? 'Updating...' : 'Refresh Records'}</span>
          </button>

          <Link
            href="/"
            className="rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition shadow-xs"
          >
            Back to Clinic OS
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Patient Switcher Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500">Active Patient Health Record:</div>
            <div className="text-sm font-bold text-slate-800">
              {patient?.name} &bull; <span className="font-mono text-purple-700">{patient?.uhid}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Switch Profile:</span>
            <select
              value={selectedUhid}
              onChange={(e) => handleSelectPatient(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.uhid}>
                  {p.name} ({p.uhid})
                </option>
              ))}
            </select>
          </div>
        </div>

        {patient && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 4 cols: Demographics Card & Medicine Tracker */}
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
                    <strong className="text-slate-800">Registered Mobile:</strong> {patient.phone}
                  </div>
                  {patient.medicalHistory && (
                    <div>
                      <strong className="text-slate-800">Medical Conditions:</strong> {patient.medicalHistory}
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
                  <span>Your medical records are encrypted and protected under healthcare standards.</span>
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
                        med.taken
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{med.name}</div>
                        <div className="text-[10px] opacity-75">
                          {med.time} &bull; {med.timing}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold">
                        {med.taken ? '✓ Taken' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 8 cols: Vitals Trend Graph, Prescriptions, Reports, Invoices */}
            <div className="lg:col-span-8 space-y-6">
              {/* Dynamic Vitals Trend Chart */}
              <VitalsTrendChart vitals={patient.vitals} />

              {/* Prescriptions Locker */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-sky-600" />
                    <span>My Digital Prescriptions ({patient.prescriptions?.length || 0})</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-semibold">Latest On Top</span>
                </div>

                {patient.prescriptions && patient.prescriptions.length > 0 ? (
                  <div className="space-y-3">
                    {patient.prescriptions.map((rx: any) => (
                      <div
                        key={rx.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition gap-3"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-900">Diagnosis: {rx.diagnosis}</div>
                          <div className="text-[11px] text-slate-400">
                            Prescribed by Dr. Avishek &bull; Date: {rx.createdAt?.split('T')[0]} &bull; {rx.items?.length || 0} Medicines
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/rx/${rx.id}`}
                            target="_blank"
                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Public Link</span>
                          </Link>

                          <button
                            onClick={() => setSelectedRx(rx)}
                            className="flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-sky-700 transition"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>View Rx PDF</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 p-4 text-center">No prescriptions on record yet.</div>
                )}
              </div>

              {/* Lab Reports & Bills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Lab Reports */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold uppercase text-slate-600">Lab Reports & Scans</h4>
                  {patient.documents && patient.documents.length > 0 ? (
                    patient.documents.map((doc: any) => (
                      <div key={doc.id} className="p-2.5 rounded-xl bg-slate-50 text-xs flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-slate-800">{doc.title}</div>
                          <div className="text-[10px] text-slate-400">{doc.category}</div>
                        </div>
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-sky-600 font-bold">
                          View
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400">No uploaded lab reports.</div>
                  )}
                </div>

                {/* Bills */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold uppercase text-slate-600">Payment Invoices</h4>
                  {patient.invoices && patient.invoices.length > 0 ? (
                    patient.invoices.map((inv: any) => (
                      <div key={inv.id} className="p-2.5 rounded-xl bg-slate-50 text-xs flex justify-between items-center">
                        <div>
                          <div className="font-bold text-slate-900">{inv.invoiceNumber}</div>
                          <div className="text-[10px] text-emerald-700 font-semibold">Paid: ₹{inv.paidAmount}</div>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                          {inv.paymentStatus}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400">No invoices.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* PDF Modal if active */}
      {selectedRx && (
        <PrescriptionPdfPreview
          prescription={selectedRx}
          onClose={() => setSelectedRx(null)}
        />
      )}
    </div>
  );
}
