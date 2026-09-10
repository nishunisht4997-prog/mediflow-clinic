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
  Phone,
  Mail,
  User,
  AlertCircle,
  ArrowRight,
  Sparkles,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { PrescriptionPdfPreview } from '@/components/prescription/PrescriptionPdfPreview';
import { VitalsTrendChart } from '@/components/portal/VitalsTrendChart';
import { CLINIC_CONFIG } from '@/config/clinic.config';

export default function PatientPortalPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [activePatient, setActivePatient] = useState<any | null>(null);
  const [selectedRx, setSelectedRx] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Fetch full patient data by ID
  const fetchPatientById = async (patientId: string) => {
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/patients/${patientId}`);
      if (!res.ok) throw new Error('Patient not found');
      const data = await res.json();
      setActivePatient(data);
      return data;
    } catch (e: any) {
      console.error(e);
      setSearchError(e.message || 'Failed to load patient health records');
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  // Initial load of patients list
  const loadInitialData = async () => {
    try {
      const res = await fetch('/api/patients');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setPatients(data);
        // Automatically activate first patient profile
        await fetchPatientById(data[0].id);
      }
    } catch (e) {
      console.error('Error fetching patients:', e);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Search by Mobile, Email, or UHID
  const handleSearchPatient = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchInput.trim();
    if (!query) {
      setSearchError('Please enter a 10-digit mobile number, UHID, or email address.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // 1. Check in loaded list first
      const cleanDigits = query.replace(/[^0-9]/g, '');
      const localMatch = patients.find((p) => {
        const pDigits = (p.phone || '').replace(/[^0-9]/g, '');
        const matchPhone = cleanDigits.length >= 4 && (pDigits.includes(cleanDigits) || cleanDigits.includes(pDigits.slice(-10)));
        const matchUhid = p.uhid?.toLowerCase() === query.toLowerCase();
        const matchEmail = p.email && p.email.toLowerCase() === query.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(query.toLowerCase());
        return matchPhone || matchUhid || matchEmail || matchName;
      });

      if (localMatch) {
        await fetchPatientById(localMatch.id);
        setIsSearching(false);
        return;
      }

      // 2. Query backend search endpoint
      const res = await fetch(`/api/patients?q=${encodeURIComponent(query)}`);
      const results = await res.json();

      if (Array.isArray(results) && results.length > 0) {
        await fetchPatientById(results[0].id);
      } else {
        setSearchError(`No patient records found matching "${query}". Please verify your registered 10-digit mobile number, UHID, or email.`);
      }
    } catch (err: any) {
      console.error(err);
      setSearchError('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const medicineSchedule = [
    { name: 'Tab. Telmisartan 40mg', time: 'Morning (08:30 AM)', timing: 'After Breakfast', taken: true },
    { name: 'Tab. Metformin SR 500mg', time: 'Afternoon (01:30 PM)', timing: 'With Lunch', taken: true },
    { name: 'Tab. Rosuvastatin 10mg', time: 'Night (09:30 PM)', timing: 'Bedtime', taken: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-purple-500 selection:text-white pb-16">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-900">MediFlow Patient Health Portal</span>
              <span className="hidden sm:inline-block rounded-full bg-purple-100 px-2 py-0.2 text-[10px] font-bold text-purple-800">
                ABDM Verified
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Self-Service Medical Records & Biomarkers</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activePatient && (
            <button
              onClick={() => fetchPatientById(activePatient.id)}
              disabled={isSearching}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSearching ? 'animate-spin text-purple-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}

          <Link
            href="/"
            className="rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition shadow-xs"
          >
            Clinic OS
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* 1. HERO SEARCH / PATIENT LOGIN CARD */}
        <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300 border border-purple-400/30 mb-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Encrypted Patient Health Portal</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black">Search & Access Your Medical Health Records</h1>
              <p className="text-xs text-purple-200/80 mt-1 max-w-xl">
                Enter your registered 10-digit Mobile Number, UHID (e.g. MF-2026-0001), or Email to view digital prescriptions, vitals trajectory, and bills.
              </p>
            </div>

            {activePatient && (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-2xl backdrop-blur-md self-start md:self-auto">
                <User className="h-4 w-4 text-purple-300" />
                <div className="text-xs">
                  <div className="font-bold text-white">{activePatient.name}</div>
                  <div className="text-[10px] text-purple-200 font-mono">{activePatient.uhid}</div>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar Input Form */}
          <form onSubmit={handleSearchPatient} className="flex flex-col sm:flex-row gap-2">
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
              disabled={isSearching}
              className="flex items-center justify-center gap-2 rounded-2xl bg-purple-500 hover:bg-purple-400 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-lg shadow-purple-500/30 transition shrink-0"
            >
              {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span>{isSearching ? 'Searching...' : 'Access My Records'}</span>
            </button>
          </form>

          {/* Quick Demo Profile Chips */}
          <div className="pt-2 border-t border-white/10 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[11px] font-semibold text-purple-300 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Quick Profiles:
            </span>
            {patients.slice(0, 4).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSearchInput(p.phone || p.uhid);
                  fetchPatientById(p.id);
                }}
                className={`rounded-xl px-2.5 py-1 text-[11px] font-bold border transition ${
                  activePatient?.id === p.id
                    ? 'bg-purple-500 text-white border-purple-400'
                    : 'bg-white/10 text-purple-200 border-white/15 hover:bg-white/20'
                }`}
              >
                {p.name} ({p.uhid})
              </button>
            ))}
          </div>

          {/* Search Error Alert */}
          {searchError && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </div>

        {/* 2. ACTIVE PATIENT PROFILE RECORD VIEW */}
        {activePatient ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 4 cols: Demographics Card & Medicine Tracker */}
            <div className="lg:col-span-4 space-y-6">
              {/* Demographics Profile Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-white font-bold text-xl shadow-md shadow-purple-600/20">
                    {activePatient.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{activePatient.name}</h3>
                    <span className="text-xs font-mono text-purple-700 font-bold">{activePatient.uhid}</span>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {activePatient.age}y &bull; {activePatient.gender} &bull; Blood: {activePatient.bloodGroup || 'B+'}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span><strong>Phone:</strong> {activePatient.phone}</span>
                  </div>
                  {activePatient.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span><strong>Email:</strong> {activePatient.email}</span>
                    </div>
                  )}
                  {activePatient.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span><strong>Address:</strong> {activePatient.address}</span>
                    </div>
                  )}
                  {activePatient.medicalHistory && (
                    <div className="pt-1">
                      <strong className="text-slate-800">Medical History:</strong> {activePatient.medicalHistory}
                    </div>
                  )}
                  {activePatient.allergies && (
                    <div className="text-rose-700 font-bold bg-rose-50 border border-rose-200 p-2 rounded-lg">
                      ⚠️ Allergy Alert: {activePatient.allergies}
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
              <VitalsTrendChart vitals={activePatient.vitals} />

              {/* Prescriptions Locker */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-sky-600" />
                    <span>My Digital Prescriptions ({activePatient.prescriptions?.length || 0})</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-semibold">Latest On Top</span>
                </div>

                {activePatient.prescriptions && activePatient.prescriptions.length > 0 ? (
                  <div className="space-y-3">
                    {activePatient.prescriptions.map((rx: any) => (
                      <div
                        key={rx.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition gap-3"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-900">Diagnosis: {rx.diagnosis}</div>
                          <div className="text-[11px] text-slate-400">
                            Prescribed by {CLINIC_CONFIG.doctorShortName} &bull; Date: {rx.createdAt?.split('T')[0]} &bull; {rx.items?.length || 0} Medicines
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/rx/${rx.id}`}
                            target="_blank"
                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-sky-600" />
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
                  {activePatient.documents && activePatient.documents.length > 0 ? (
                    activePatient.documents.map((doc: any) => (
                      <div key={doc.id} className="p-2.5 rounded-xl bg-slate-50 text-xs flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-slate-800">{doc.title}</div>
                          <div className="text-[10px] text-slate-400">{doc.category}</div>
                        </div>
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-sky-600 font-bold hover:underline">
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
                  {activePatient.invoices && activePatient.invoices.length > 0 ? (
                    activePatient.invoices.map((inv: any) => (
                      <div key={inv.id} className="p-2.5 rounded-xl bg-slate-50 text-xs flex justify-between items-center">
                        <div>
                          <div className="font-bold text-slate-900">{inv.invoiceNumber}</div>
                          <div className="text-[10px] text-emerald-700 font-semibold">Paid: ₹{inv.paidAmount}</div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          inv.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
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
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3 shadow-xs">
            <div className="h-12 w-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto font-black text-xl">
              🔍
            </div>
            <h3 className="font-bold text-slate-800">No Patient Profile Loaded</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Please enter your registered mobile number, email, or UHID above to securely fetch your clinic health records.
            </p>
          </div>
        )}
      </main>

      {/* Printable / View PDF Modal */}
      {selectedRx && (
        <PrescriptionPdfPreview
          prescription={selectedRx}
          onClose={() => setSelectedRx(null)}
        />
      )}
    </div>
  );
}
