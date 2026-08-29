'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  HeartPulse,
  Activity,
  Thermometer,
  Weight,
  Syringe,
  Bandage,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Plus,
  Save,
} from 'lucide-react';
import { VitalsTrendChart } from '@/components/portal/VitalsTrendChart';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

export default function NurseStationPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  // Vitals State
  const [systolic, setSystolic] = useState('130');
  const [diastolic, setDiastolic] = useState('85');
  const [pulse, setPulse] = useState('76');
  const [spo2, setSpo2] = useState('98');
  const [temperature, setTemperature] = useState('98.6');
  const [bloodSugar, setBloodSugar] = useState('110');
  const [weightKg, setWeightKg] = useState('68');
  const [isSaved, setIsSaved] = useState(false);

  // Procedure Sheet State
  const [procedures, setProcedures] = useState([
    { patient: 'Rahul Das', procedure: 'Inj. Pantoprazole IV Stat', time: '09:45 AM', status: 'Given' },
    { patient: 'Priya Sharma', procedure: 'Dressing & Wound Cleaning', time: '10:15 AM', status: 'Completed' },
  ]);
  const [newProcPatient, setNewProcPatient] = useState('Rahul Das');
  const [newProcName, setNewProcName] = useState('');

  const loadData = async () => {
    try {
      const res = await fetch('/api/patients');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPatients(data);
        if (data.length > 0) setSelectedPatientId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const handleSaveVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    try {
      await fetch(`/api/patients/${selectedPatientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bpSystolic: systolic,
          bpDiastolic: diastolic,
          pulse,
          spo2,
          temperature,
          randomBloodSugar: bloodSugar,
          weight: weightKg,
          recordedBy: 'Nurse Snigdha Ray',
        }),
      });

      setIsSaved(true);
      await loadData();
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error('Error saving vitals:', err);
    }
  };

  const handleAddProcedure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProcName) return;

    setProcedures([
      ...procedures,
      {
        patient: newProcPatient,
        procedure: newProcName,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Given',
      },
    ]);
    setNewProcName('');
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar
          currentRole="NURSE"
          setCurrentRole={() => {}}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6 space-y-6">
          {/* Top Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-pink-900 via-rose-950 to-slate-900 p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-pink-500/20 px-3 py-1 text-xs font-semibold text-pink-300 border border-pink-400/30 mb-2">
                <HeartPulse className="h-3.5 w-3.5" />
                <span>Nurse Station &bull; Triage In-Charge: Snigdha Ray</span>
              </div>
              <h1 className="text-2xl font-black">Pre-OPD Vitals Recording & Triage Station</h1>
              <p className="text-xs text-pink-200/80 mt-1">
                Record vital signs (BP, Pulse, SpO2, Temp, Sugar) and log clinical procedures before doctor consultation.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md">
              <span className="text-xs font-bold text-pink-200">Patient:</span>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-hidden"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.uhid})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main 2-Column Layout: Vitals Entry + Vitals Trend Graph & Procedures */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 5 cols: Spot Vitals Form */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-pink-600" />
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Record Spot Vitals</h2>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {selectedPatient?.name} &bull; {selectedPatient?.uhid}
                      </span>
                    </div>
                  </div>

                  {parseInt(systolic, 10) >= 140 && (
                    <span className="rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-[10px] font-bold animate-pulse">
                      High BP Alert
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveVitals} className="space-y-4 text-xs">
                  {/* BP */}
                  <div className="rounded-xl bg-slate-50 p-3 space-y-2 border border-slate-100">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <HeartPulse className="h-4 w-4 text-rose-600" />
                      <span>Blood Pressure (Systolic / Diastolic mmHg)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Systolic (120)"
                        value={systolic}
                        onChange={(e) => setSystolic(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white p-2 font-black text-slate-900"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Diastolic (80)"
                        value={diastolic}
                        onChange={(e) => setDiastolic(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white p-2 font-black text-slate-900"
                        required
                      />
                    </div>
                  </div>

                  {/* Pulse & SpO2 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700">Pulse (BPM)</label>
                      <input
                        type="number"
                        value={pulse}
                        onChange={(e) => setPulse(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-bold focus:border-pink-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700">SpO2 Oxygen (%)</label>
                      <input
                        type="number"
                        value={spo2}
                        onChange={(e) => setSpo2(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-bold focus:border-pink-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Temperature & Sugar */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700">Temperature (°F)</label>
                      <input
                        type="text"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-bold focus:border-pink-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700">Random Blood Sugar (mg/dL)</label>
                      <input
                        type="number"
                        value={bloodSugar}
                        onChange={(e) => setBloodSugar(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-bold focus:border-pink-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="font-semibold text-slate-700">Body Weight (kg)</label>
                    <input
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-bold focus:border-pink-500 focus:outline-hidden"
                    />
                  </div>

                  {isSaved && (
                    <div className="rounded-xl bg-emerald-100 p-2 text-center text-xs font-bold text-emerald-800">
                      ✓ Vitals saved to patient EHR and transmitted to Doctor Cabin!
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-pink-600 py-3 font-bold text-white shadow-md shadow-pink-600/30 hover:bg-pink-700 transition"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Vitals to Doctor Screen</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right 7 cols: Historical Graph & Procedure Sheet */}
            <div className="lg:col-span-7 space-y-6">
              {/* Historical Vitals Trend Graph */}
              <VitalsTrendChart />

              {/* In-Clinic Procedures & Injection Sheet */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Syringe className="h-4 w-4 text-purple-600" />
                    <h3 className="text-sm font-bold text-slate-900">In-Clinic Procedures & Medication Log</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">{procedures.length} Recorded Today</span>
                </div>

                <form onSubmit={handleAddProcedure} className="flex gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Log procedure (e.g. Nebulization with Duolin, IV Drip...)"
                    value={newProcName}
                    onChange={(e) => setNewProcName(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-purple-500 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-purple-600 px-4 py-2 font-bold text-white hover:bg-purple-700 shadow-2xs"
                  >
                    + Log
                  </button>
                </form>

                <div className="divide-y divide-slate-100">
                  {procedures.map((proc, i) => (
                    <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{proc.procedure}</div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          Patient: {proc.patient} &bull; Time: {proc.time}
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.2 text-[10px] font-bold">
                        {proc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
