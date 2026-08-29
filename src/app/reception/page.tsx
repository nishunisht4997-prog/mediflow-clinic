'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  ConciergeBell,
  UserPlus,
  Calendar,
  Clock,
  CheckCircle2,
  Phone,
  Send,
  Volume2,
  Sparkles,
  Search,
  Users,
  CreditCard,
  QrCode,
} from 'lucide-react';
import { VoiceTokenCaller } from '@/components/dashboard/VoiceTokenCaller';
import { DynamicUpiQrModal } from '@/components/billing/DynamicUpiQrModal';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

export default function ReceptionDeskPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fast Walk-In Form State
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInAge, setWalkInAge] = useState('');
  const [walkInGender, setWalkInGender] = useState('Male');
  const [walkInComplaint, setWalkInComplaint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUpiModal, setSelectedUpiModal] = useState<any | null>(null);

  const loadData = async () => {
    try {
      const [apptsRes, patientsRes] = await Promise.all([
        fetch('/api/appointments').then((r) => r.json()),
        fetch('/api/patients').then((r) => r.json()),
      ]);
      if (Array.isArray(apptsRes)) setAppointments(apptsRes);
      if (Array.isArray(patientsRes)) setPatients(patientsRes);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFastWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName || !walkInPhone) return;

    setIsSubmitting(true);
    try {
      // 1. Create Patient
      const patientRes = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: walkInName,
          phone: walkInPhone,
          age: parseInt(walkInAge, 10) || 30,
          gender: walkInGender,
          bloodGroup: 'B+',
        }),
      });
      const newPatient = await patientRes.json();

      // 2. Assign Immediate Walk-In OPD Token
      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: newPatient.id,
          type: 'Walk-In OPD',
          source: 'RECEPTION_DESK',
          chiefComplaint: walkInComplaint || 'General OPD Consultation',
          timeSlot: 'Now (Queue)',
        }),
      });

      // Clear Form & Reload
      setWalkInName('');
      setWalkInPhone('');
      setWalkInAge('');
      setWalkInComplaint('');
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await loadData();
  };

  const waitingPatients = appointments.filter((a) => a.status === 'WAITING');
  const inConsultation = appointments.find((a) => a.status === 'IN_CONSULTATION');

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar
          currentRole="RECEPTIONIST"
          setCurrentRole={() => {}}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6 space-y-6">
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-amber-900 via-amber-950 to-slate-900 p-6 text-white shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-400/30 mb-2">
                <ConciergeBell className="h-3.5 w-3.5" />
                <span>Front Desk Command &bull; Receptionist: Priya Sharma</span>
              </div>
              <h1 className="text-2xl font-black">Lobby Token Queue & Walk-In Registration</h1>
              <p className="text-xs text-amber-200/80 mt-1">
                Fast walk-in token issuance, lobby status management, and audio speaker token announcements.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md text-center border border-white/10">
                <div className="text-2xl font-black text-amber-400 font-mono">#{inConsultation?.tokenNumber || 3}</div>
                <div className="text-[10px] text-slate-300 font-bold uppercase">Now In Cabin</div>
              </div>

              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md text-center border border-white/10">
                <div className="text-2xl font-black text-white font-mono">{waitingPatients.length}</div>
                <div className="text-[10px] text-slate-300 font-bold uppercase">Waiting in Lobby</div>
              </div>
            </div>
          </div>

          {/* Main 2-Column Grid: Fast Walk-In Form + Live Token Board */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 4 cols: 10-Second Fast Walk-In Generator */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl border-2 border-amber-500/60 bg-amber-50/40 p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-amber-600" />
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">10-Second Fast Walk-In Token</h2>
                    <p className="text-[10px] text-slate-500">Register arriving patient & issue OPD token immediately</p>
                  </div>
                </div>

                <form onSubmit={handleFastWalkIn} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700">Patient Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Suman Jena"
                      value={walkInName}
                      onChange={(e) => setWalkInName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 font-bold focus:border-amber-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Mobile Number (WhatsApp) *</label>
                    <input
                      type="text"
                      placeholder="+91 98610 99887"
                      value={walkInPhone}
                      onChange={(e) => setWalkInPhone(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 font-mono font-bold focus:border-amber-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700">Age</label>
                      <input
                        type="number"
                        placeholder="35"
                        value={walkInAge}
                        onChange={(e) => setWalkInAge(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2 font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700">Gender</label>
                      <select
                        value={walkInGender}
                        onChange={(e) => setWalkInGender(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2 font-bold"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Chief Complaint / Symptoms</label>
                    <input
                      type="text"
                      placeholder="e.g. High fever, Back pain"
                      value={walkInComplaint}
                      onChange={(e) => setWalkInComplaint(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-amber-600 py-3 text-xs font-bold text-white shadow-md shadow-amber-600/30 hover:bg-amber-700 transition"
                  >
                    {isSubmitting ? 'Issuing Token...' : 'Issue OPD Token (Next In Queue)'}
                  </button>
                </form>
              </div>

              {/* Consultation Fee Collection Quick Trigger */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    <span>Quick Counter OPD Fee (₹800)</span>
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.2 rounded-full font-bold">
                    UPI / Cash
                  </span>
                </div>
                <button
                  onClick={() =>
                    setSelectedUpiModal({
                      invoiceNumber: `FEE-${Date.now().toString().slice(-4)}`,
                      totalAmount: 800,
                      patient: { name: 'Walk-In Patient', uhid: 'MF-2026-TEMP' },
                    })
                  }
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 font-bold text-white hover:bg-slate-800"
                >
                  <QrCode className="h-4 w-4 text-sky-400" />
                  <span>Show Dynamic UPI QR on Screen</span>
                </button>
              </div>
            </div>

            {/* Right 8 cols: Live Lobby Queue & Action Board */}
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Live Lobby Queue Management ({appointments.length} Total Today)
                  </h2>
                  <span className="text-xs font-semibold text-slate-400">Tokens arranged by arrival</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {appointments.map((item) => {
                    const isWaiting = item.status === 'WAITING';
                    const isInConsultation = item.status === 'IN_CONSULTATION';
                    const isCompleted = item.status === 'COMPLETED';

                    return (
                      <div
                        key={item.id}
                        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                          isInConsultation
                            ? 'bg-sky-50/80 border-l-4 border-sky-600'
                            : isWaiting
                            ? 'hover:bg-amber-50/40'
                            : 'hover:bg-slate-50 opacity-80'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl font-black ${
                              isInConsultation
                                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                                : isWaiting
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <span className="text-[9px] uppercase tracking-wider">Token</span>
                            <span className="text-lg leading-tight">#{item.tokenNumber}</span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">{item.patient?.name}</span>
                              <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600">
                                {item.patient?.age}y/{item.patient?.gender?.[0]}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">({item.patient?.uhid})</span>
                            </div>

                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1 font-semibold text-slate-700">
                                <Clock className="h-3 w-3 text-slate-400" />
                                {item.timeSlot}
                              </span>
                              <span>&bull;</span>
                              <span className="font-medium text-slate-600">{item.type}</span>
                              {item.chiefComplaint && (
                                <>
                                  <span>&bull;</span>
                                  <span className="text-slate-500 truncate max-w-[200px]">
                                    {item.chiefComplaint}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status, Audio Token Announcer & Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {/* Audio Voice Announcer */}
                          <VoiceTokenCaller
                            tokenNumber={item.tokenNumber}
                            patientName={item.patient?.name}
                            compact
                          />

                          {isWaiting && (
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'IN_CONSULTATION')}
                              className="rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-700 transition shadow-2xs"
                            >
                              Call to Cabin
                            </button>
                          )}

                          {isInConsultation && (
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'COMPLETED')}
                              className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-2xs"
                            >
                              Mark Finished
                            </button>
                          )}

                          <a
                            href={`https://api.whatsapp.com/send?phone=91${item.patient?.phone?.replace(
                              /\D/g,
                              ''
                            )}&text=${encodeURIComponent(
                              `Hello ${item.patient?.name}, your OPD token #${item.tokenNumber} is ready at Dr. Avishek's Clinic. Please wait in the lobby.`
                            )}`}
                            target="_blank"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-emerald-700 hover:bg-emerald-50"
                            title="Send WhatsApp Reminder"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav />

      {selectedUpiModal && (
        <DynamicUpiQrModal
          invoice={selectedUpiModal}
          onClose={() => setSelectedUpiModal(null)}
          onConfirmPayment={async () => {
            setSelectedUpiModal(null);
          }}
        />
      )}
    </div>
  );
}
