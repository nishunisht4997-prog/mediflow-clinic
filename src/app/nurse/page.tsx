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
  Check,
  Ruler,
  Scale,
  Sparkles,
  Flame,
  Wind,
  ShieldAlert,
} from 'lucide-react';
import { VitalsTrendChart } from '@/components/portal/VitalsTrendChart';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ClinicBroadcast } from '@/lib/broadcast';

export default function NurseStationPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  // Vitals State
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [pulse, setPulse] = useState('76');
  const [spo2, setSpo2] = useState('98');
  const [temperature, setTemperature] = useState('98.4');
  const [bloodSugar, setBloodSugar] = useState('110');
  const [heightCm, setHeightCm] = useState('170');
  const [weightKg, setWeightKg] = useState('68');
  const [isSaved, setIsSaved] = useState(false);

  // Persistent Procedure Sheet State
  const [procedures, setProcedures] = useState<any[]>([]);
  const [newProcName, setNewProcName] = useState('');
  const [isLoggingProc, setIsLoggingProc] = useState(false);

  // Real-time Abnormal Vital Checks
  const sysNum = parseInt(systolic, 10) || 0;
  const diaNum = parseInt(diastolic, 10) || 0;
  const spo2Num = parseInt(spo2, 10) || 0;
  const tempNum = parseFloat(temperature) || 0;
  const pulseNum = parseInt(pulse, 10) || 0;

  // Threshold Rules
  const isHypertension = sysNum >= 140 || diaNum >= 90;
  const isHypotension = sysNum > 0 && sysNum < 90;
  const isLowOxygen = spo2Num > 0 && spo2Num < 95;
  const isFever = tempNum >= 99.5;
  const isHighPulse = pulseNum > 100;
  const isLowPulse = pulseNum > 0 && pulseNum < 60;

  const hasAnyCriticalVital = isHypertension || isLowOxygen || isFever || isHypotension;

  // Real-time BMI Auto-Calculation Helper
  const getBmiDetails = (wStr: string, hStr: string) => {
    const w = parseFloat(wStr);
    const h = parseFloat(hStr);
    if (!w || !h || w <= 0 || h <= 0) return null;

    const hM = h / 100;
    const bmi = parseFloat((w / (hM * hM)).toFixed(1));

    let category = 'Normal Weight';
    let badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    let statusText = 'Normal Weight & Healthy Metabolic Profile';
    let riskLevel = 'Low Risk';

    if (bmi < 18.5) {
      category = 'Underweight';
      badgeClass = 'bg-sky-100 text-sky-800 border-sky-300';
      statusText = 'Underweight (< 18.5 kg/m²)';
      riskLevel = 'Nutritional Deficiency Risk';
    } else if (bmi >= 18.5 && bmi < 23.0) {
      category = 'Normal';
      badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      statusText = 'Healthy / Normal (18.5 - 22.9 kg/m²)';
      riskLevel = 'Optimal Health';
    } else if (bmi >= 23.0 && bmi < 27.5) {
      category = 'Overweight';
      badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
      statusText = 'Overweight (23.0 - 27.4 kg/m²)';
      riskLevel = 'Moderate Cardiovascular / T2DM Risk';
    } else {
      category = 'Obese';
      badgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
      statusText = 'Obese (≥ 27.5 kg/m²)';
      riskLevel = 'High Metabolic / Hypertension Risk';
    }

    return {
      bmi,
      category,
      badgeClass,
      statusText,
      riskLevel,
    };
  };

  const bmiInfo = getBmiDetails(weightKg, heightCm);

  const loadData = async () => {
    try {
      const [patientsRes, tasksRes] = await Promise.all([
        fetch('/api/patients').then((r) => r.json()),
        fetch('/api/tasks').then((r) => r.json()),
      ]);

      if (Array.isArray(patientsRes)) {
        setPatients(patientsRes);
        if (patientsRes.length > 0 && !selectedPatientId) {
          setSelectedPatientId(patientsRes[0].id);
        }
      }

      if (Array.isArray(tasksRes)) {
        const procTasks = tasksRes.filter(
          (t: any) => t.title?.startsWith('[Procedure]') || t.priority === 'HIGH'
        );
        if (procTasks.length > 0) {
          setProcedures(
            procTasks.map((t: any) => ({
              id: t.id,
              procedure: t.title.replace('[Procedure] ', ''),
              patient: t.patient?.name || 'General OPD Patient',
              time: t.dueDate || new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: t.status === 'COMPLETED' ? 'Given / Completed' : 'In-Progress',
            }))
          );
        } else {
          setProcedures([
            { id: 'p-1', patient: 'Rahul Das', procedure: 'Inj. Pantoprazole IV Stat', time: '09:45 AM', status: 'Given / Completed' },
            { id: 'p-2', patient: 'Priya Sharma', procedure: 'Dressing & Antiseptic Cleaning', time: '10:15 AM', status: 'Given / Completed' },
          ]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Auto-sync vitals when patient selected
  useEffect(() => {
    if (selectedPatient?.vitals && selectedPatient.vitals[0]) {
      const v = selectedPatient.vitals[0];
      if (v.bpSystolic) setSystolic(String(v.bpSystolic));
      if (v.bpDiastolic) setDiastolic(String(v.bpDiastolic));
      if (v.pulse) setPulse(String(v.pulse));
      if (v.spo2) setSpo2(String(v.spo2));
      if (v.temperature) setTemperature(String(v.temperature));
      if (v.height) setHeightCm(String(v.height));
      if (v.weight) setWeightKg(String(v.weight));
    }
  }, [selectedPatientId]);

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
          height: heightCm,
          weight: weightKg,
          bmi: bmiInfo?.bmi,
          recordedBy: 'Nurse Snigdha Ray',
        }),
      });

      // Compile clinical alert notes for doctor
      const alerts: string[] = [];
      if (isHypertension) alerts.push(`High BP ${systolic}/${diastolic}`);
      if (isLowOxygen) alerts.push(`Low SpO2 ${spo2}%`);
      if (isFever) alerts.push(`Fever ${temperature}°F`);

      // 🚀 REAL-TIME BROADCAST: Notify Doctor screen with vitals & BMI
      ClinicBroadcast.publish({
        type: 'VITALS_RECORDED',
        title: `${hasAnyCriticalVital ? '⚠️ High-Risk Vitals' : 'Vitals Recorded'}: ${selectedPatient?.name || 'Patient'}`,
        message: `BP: ${systolic}/${diastolic} mmHg, Pulse: ${pulse} bpm, SpO2: ${spo2}%, Temp: ${temperature}°F${alerts.length > 0 ? ` [${alerts.join(', ')}]` : ''}, BMI: ${bmiInfo ? `${bmiInfo.bmi} (${bmiInfo.category})` : 'N/A'}. Transmitted to Doctor Screen.`,
        sourceRole: 'NURSE',
        targetRoles: ['DOCTOR', 'RECEPTIONIST'],
        data: {
          patientId: selectedPatientId,
          patientName: selectedPatient?.name,
          vitalsSummary: `BP ${systolic}/${diastolic}, SpO2 ${spo2}%, Temp ${temperature}°F, BMI ${bmiInfo?.bmi || 'N/A'}`,
          isCritical: hasAnyCriticalVital,
        },
      });

      setIsSaved(true);
      await loadData();
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error('Error saving vitals:', err);
    }
  };

  // Real DB persistence for procedures
  const handleAddProcedure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProcName.trim()) return;

    setIsLoggingProc(true);
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `[Procedure] ${newProcName.trim()}`,
          description: `Clinical procedure administered by Nurse Snigdha Ray for patient ${selectedPatient?.name || 'OPD Patient'}`,
          patientId: selectedPatient?.id || null,
          status: 'COMPLETED',
          priority: 'HIGH',
          dueDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }),
      });

      setNewProcName('');
      await loadData();
    } catch (err) {
      console.error('Error logging procedure:', err);
    } finally {
      setIsLoggingProc(false);
    }
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
                Spot visual color indicators for abnormal vitals (BP &gt; 140/90 🔴, SpO2 &lt; 95% 🟠, Temp &gt; 99.5°F 🟡) and auto-calculated BMI.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md">
              <span className="text-xs font-bold text-pink-200">Patient:</span>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-hidden cursor-pointer"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id} className="text-slate-900">
                    {p.name} ({p.uhid})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 5 cols: Spot Vitals Recording Form */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Spot Vitals Entry Form</h2>
                    <p className="text-[11px] text-slate-400">
                      Recording for: <strong>{selectedPatient?.name}</strong> ({selectedPatient?.age}y / {selectedPatient?.gender})
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${
                    hasAnyCriticalVital ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' : 'bg-pink-100 text-pink-800 border-pink-200'
                  }`}>
                    {hasAnyCriticalVital ? '🔴 High Risk Triage' : 'Normal Triage'}
                  </span>
                </div>

                {/* Patient Allergen Warning Flag */}
                {selectedPatient?.allergies && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 font-semibold">
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>Patient Allergy: {selectedPatient.allergies}</span>
                  </div>
                )}

                {/* 🚨 Critical Vitals High-Risk Pulsing Banner */}
                {hasAnyCriticalVital && (
                  <div className="rounded-2xl border-2 border-rose-400 bg-rose-50/90 p-3.5 text-xs text-rose-950 space-y-1.5 animate-pulse shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-rose-700">
                      <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                      <span>CLINICAL TRIAGE WARNING: Abnormal Vitals Detected</span>
                    </div>
                    <div className="text-[11px] pl-6 space-y-0.5 font-medium">
                      {isHypertension && (
                        <div className="text-rose-700 font-bold">
                          • Blood Pressure is High ({systolic}/{diastolic} mmHg &gt; 140/90) &bull; Stage Hypertension
                        </div>
                      )}
                      {isHypotension && (
                        <div className="text-rose-700 font-bold">
                          • Blood Pressure is Low ({systolic}/{diastolic} mmHg &lt; 90/60) &bull; Hypotension
                        </div>
                      )}
                      {isLowOxygen && (
                        <div className="text-amber-800 font-bold">
                          • Oxygen Saturation is Low ({spo2}% &lt; 95%) &bull; Hypoxia Warning
                        </div>
                      )}
                      {isFever && (
                        <div className="text-yellow-800 font-bold">
                          • High Body Temperature ({temperature}°F ≥ 99.5°F) &bull; Febrile Condition
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSaveVitals} className="space-y-4 text-xs">
                  {/* 1. Blood Pressure with 🔴 Red Alert */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700">Blood Pressure (BP in mmHg)</label>
                      {isHypertension ? (
                        <span className="rounded-full bg-rose-100 border border-rose-300 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 flex items-center gap-1 animate-pulse">
                          🔴 BP &gt; 140/90 (Hypertension)
                        </span>
                      ) : isHypotension ? (
                        <span className="rounded-full bg-sky-100 border border-sky-300 px-2 py-0.5 text-[10px] font-bold text-sky-700">
                          Low BP (&lt;90)
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-700">✓ Normal BP</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="number"
                          value={systolic}
                          onChange={(e) => setSystolic(e.target.value)}
                          className={`w-full rounded-xl border p-2.5 font-bold transition focus:outline-hidden ${
                            isHypertension
                              ? 'border-rose-500 bg-rose-50/70 text-rose-950 ring-2 ring-rose-300'
                              : 'border-slate-200 bg-slate-50/50 focus:border-pink-500 focus:bg-white text-slate-800'
                          }`}
                          placeholder="Systolic (120)"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">Systolic (Upper)</span>
                      </div>

                      <div>
                        <input
                          type="number"
                          value={diastolic}
                          onChange={(e) => setDiastolic(e.target.value)}
                          className={`w-full rounded-xl border p-2.5 font-bold transition focus:outline-hidden ${
                            isHypertension
                              ? 'border-rose-500 bg-rose-50/70 text-rose-950 ring-2 ring-rose-300'
                              : 'border-slate-200 bg-slate-50/50 focus:border-pink-500 focus:bg-white text-slate-800'
                          }`}
                          placeholder="Diastolic (80)"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">Diastolic (Lower)</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Pulse & 🟠 SpO2 with Orange Alert */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-slate-700 flex items-center gap-1">
                          <Activity className="h-3 w-3 text-pink-600" />
                          <span>Pulse (bpm)</span>
                        </label>
                        {isHighPulse ? (
                          <span className="text-[10px] font-bold text-purple-700">High</span>
                        ) : isLowPulse ? (
                          <span className="text-[10px] font-bold text-sky-700">Low</span>
                        ) : null}
                      </div>
                      <input
                        type="number"
                        value={pulse}
                        onChange={(e) => setPulse(e.target.value)}
                        className={`w-full rounded-xl border p-2.5 font-bold transition focus:outline-hidden ${
                          isHighPulse || isLowPulse
                            ? 'border-purple-400 bg-purple-50/60 text-purple-950 ring-2 ring-purple-200'
                            : 'border-slate-200 bg-slate-50/50 focus:border-pink-500 focus:bg-white text-slate-800'
                        }`}
                        placeholder="76"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-slate-700 flex items-center gap-1">
                          <Wind className="h-3 w-3 text-sky-600" />
                          <span>SpO2 Oxygen (%)</span>
                        </label>
                        {isLowOxygen ? (
                          <span className="rounded-full bg-amber-100 border border-amber-300 px-1.5 py-0.2 text-[9px] font-extrabold text-amber-800 animate-pulse">
                            🟠 &lt; 95%
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-700">✓ Normal</span>
                        )}
                      </div>
                      <input
                        type="number"
                        value={spo2}
                        onChange={(e) => setSpo2(e.target.value)}
                        className={`w-full rounded-xl border p-2.5 font-bold transition focus:outline-hidden ${
                          isLowOxygen
                            ? 'border-amber-500 bg-amber-50/80 text-amber-950 ring-2 ring-amber-300'
                            : 'border-slate-200 bg-slate-50/50 focus:border-pink-500 focus:bg-white text-slate-800'
                        }`}
                        placeholder="98"
                      />
                    </div>
                  </div>

                  {/* 3. 🟡 Temperature (Fever Alert) & Sugar */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-slate-700 flex items-center gap-1">
                          <Thermometer className="h-3 w-3 text-rose-500" />
                          <span>Temp (°F)</span>
                        </label>
                        {isFever ? (
                          <span className="rounded-full bg-yellow-100 border border-yellow-400 px-1.5 py-0.2 text-[9px] font-extrabold text-yellow-900 animate-pulse flex items-center gap-0.5">
                            <Flame className="h-2.5 w-2.5 text-yellow-600" />
                            🟡 Fever (≥99.5°)
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-700">✓ Afebrile</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        className={`w-full rounded-xl border p-2.5 font-bold transition focus:outline-hidden ${
                          isFever
                            ? 'border-yellow-500 bg-yellow-50/90 text-yellow-950 ring-2 ring-yellow-300'
                            : 'border-slate-200 bg-slate-50/50 focus:border-pink-500 focus:bg-white text-slate-800'
                        }`}
                        placeholder="98.4"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-slate-700">Blood Sugar (mg/dL)</label>
                        <span className="text-[10px] text-slate-400">RBS</span>
                      </div>
                      <input
                        type="number"
                        value={bloodSugar}
                        onChange={(e) => setBloodSugar(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-bold focus:border-pink-500 focus:bg-white focus:outline-hidden text-slate-800"
                        placeholder="110"
                      />
                    </div>
                  </div>

                  {/* 4. Height & Weight Inputs with Real-Time BMI Auto-Calculation */}
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                    <div>
                      <label className="font-semibold text-slate-700 flex items-center gap-1">
                        <Ruler className="h-3.5 w-3.5 text-pink-600" />
                        <span>Height (cm)</span>
                      </label>
                      <input
                        type="number"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-bold focus:border-pink-500 focus:bg-white focus:outline-hidden"
                        placeholder="170"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 flex items-center gap-1">
                        <Scale className="h-3.5 w-3.5 text-pink-600" />
                        <span>Weight (kg)</span>
                      </label>
                      <input
                        type="number"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-bold focus:border-pink-500 focus:bg-white focus:outline-hidden"
                        placeholder="68"
                      />
                    </div>
                  </div>

                  {/* Real-Time Auto-Calculated BMI Card */}
                  {bmiInfo && (
                    <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-pink-50/40 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <Sparkles className="h-4 w-4 text-pink-600" />
                          <span>Auto-Calculated BMI</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${bmiInfo.badgeClass}`}>
                          {bmiInfo.category}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <div>
                          <div className="text-xl font-black text-slate-900 tracking-tight">
                            {bmiInfo.bmi} <span className="text-xs text-slate-500 font-semibold">kg/m²</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {bmiInfo.statusText}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 block">Metabolic Profile:</span>
                          <span className="text-xs font-bold text-slate-700">{bmiInfo.riskLevel}</span>
                        </div>
                      </div>

                      {/* Visual BMI Scale Bar */}
                      <div className="pt-1">
                        <div className="h-1.5 w-full rounded-full bg-slate-200 flex overflow-hidden">
                          <div className="w-1/4 bg-sky-400" title="Underweight (<18.5)" />
                          <div className="w-1/4 bg-emerald-500" title="Normal (18.5-22.9)" />
                          <div className="w-1/4 bg-amber-400" title="Overweight (23-27.4)" />
                          <div className="w-1/4 bg-rose-500" title="Obese (≥27.5)" />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400 mt-0.5 font-semibold">
                          <span>&lt;18.5</span>
                          <span>18.5 - 22.9</span>
                          <span>23.0 - 27.4</span>
                          <span>&ge;27.5</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {isSaved && (
                    <div className="rounded-xl bg-emerald-100 p-2 text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>Vitals & BMI saved to database and transmitted to Doctor Screen!</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-pink-600 py-3 font-bold text-white shadow-md shadow-pink-600/30 hover:bg-pink-700 transition cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Vitals & Transmit to Doctor</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right 7 cols: Historical Graph & Persistent Procedure Sheet */}
            <div className="lg:col-span-7 space-y-6">
              {/* Historical Vitals Trend Graph */}
              <VitalsTrendChart vitals={selectedPatient?.vitals} />

              {/* In-Clinic Procedures & Injection Sheet */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Syringe className="h-4 w-4 text-purple-600" />
                    <h3 className="text-sm font-bold text-slate-900">In-Clinic Procedures & Medication Log</h3>
                  </div>
                  <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-bold">
                    {procedures.length} Recorded in DB
                  </span>
                </div>

                <form onSubmit={handleAddProcedure} className="flex gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Log procedure (e.g. Nebulization with Duolin, IV Drip, Tetanus Toxoid...)"
                    value={newProcName}
                    onChange={(e) => setNewProcName(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-purple-500 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={isLoggingProc}
                    className="rounded-xl bg-purple-600 px-4 py-2 font-bold text-white hover:bg-purple-700 shadow-2xs transition shrink-0 cursor-pointer"
                  >
                    {isLoggingProc ? 'Saving...' : '+ Log Procedure'}
                  </button>
                </form>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {procedures.map((proc, i) => (
                    <div key={proc.id || i} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{proc.procedure}</div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          Patient: <strong>{proc.patient}</strong> &bull; Time: {proc.time}
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
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
