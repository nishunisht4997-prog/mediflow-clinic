'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileSpreadsheet,
  Sparkles,
  Plus,
  Trash2,
  Printer,
  Calendar,
  Clock,
  User,
  AlertCircle,
  AlertTriangle,
  BookmarkPlus,
  Send,
  Languages,
  Search,
  Check,
  Zap,
} from 'lucide-react';
import { PrescriptionMedicineItem } from '@/types';
import { checkDrugAllergyConflicts, AllergyConflict } from '@/lib/allergy-checker';
import { SaveTemplateModal } from '@/components/prescription/SaveTemplateModal';
import { CLINIC_CONFIG } from '@/config/clinic.config';
import { INDIAN_MEDICINE_CATALOG, IndianMedicine } from '@/data/indianMedicines';

interface DigitalPrescriptionMakerProps {
  patients: any[];
  initialPatientId?: string | null;
  templates: any[];
  onSavePrescription: (prescriptionData: any) => Promise<any>;
  onViewPdf: (rxData: any) => void;
  onSaveCustomTemplate?: (templateData: any) => Promise<void>;
}

// Quick Chip Presets
const FREQUENCY_CHIPS = ['1-0-1', '1-0-0', '0-0-1', '1-1-1', '0-1-0', 'SOS', 'STAT'];
const TIMING_CHIPS = ['Before Food', 'After Food', 'Empty Stomach', 'With Food', 'Bedtime'];
const DURATION_CHIPS = [
  { label: '3 Days', days: 3 },
  { label: '5 Days', days: 5 },
  { label: '7 Days', days: 7 },
  { label: '10 Days', days: 10 },
  { label: '14 Days', days: 14 },
  { label: '1 Month', days: 30 },
];

export const DigitalPrescriptionMaker: React.FC<DigitalPrescriptionMakerProps> = ({
  patients,
  initialPatientId,
  templates,
  onSavePrescription,
  onViewPdf,
  onSaveCustomTemplate,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId || patients[0]?.id || '');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [investigationsAdvised, setInvestigationsAdvised] = useState('');
  const [nextFollowUpDays, setNextFollowUpDays] = useState<number>(7);
  const [rxLanguage, setRxLanguage] = useState<'EN' | 'HI' | 'OR'>('EN');
  const [sendWhatsApp, setSendWhatsApp] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);

  // Autocomplete state for medicine rows
  const [activeSuggestIdx, setActiveSuggestIdx] = useState<number | null>(null);
  const [medQuery, setMedQuery] = useState<string>('');
  const [medCategoryFilter, setMedCategoryFilter] = useState<string>('ALL');

  const [medicines, setMedicines] = useState<PrescriptionMedicineItem[]>([
    {
      medicineName: 'Tab. Pantoprazole 40mg (Pan 40)',
      dosage: '40 mg',
      form: 'Tablet',
      frequency: '1-0-0',
      timing: 'Before Food',
      durationDays: 10,
      instructions: 'Take 30 mins before breakfast in morning',
    },
    {
      medicineName: 'Tab. Paracetamol 650mg (Dolo 650)',
      dosage: '650 mg',
      form: 'Tablet',
      frequency: '1-0-1',
      timing: 'After Food',
      durationDays: 3,
      instructions: 'SOS for fever > 100°F or body ache',
    },
  ]);

  useEffect(() => {
    if (initialPatientId) {
      setSelectedPatientId(initialPatientId);
    }
  }, [initialPatientId]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Real-time Drug Allergy Conflict Detection
  const allergyConflicts: AllergyConflict[] = checkDrugAllergyConflicts(
    selectedPatient?.allergies,
    medicines
  );

  // Follow-up Date Calculation Helper
  const getFollowUpDateString = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return {
      formattedDate: d.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      shortDate: d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
  };

  const followUpDetails = getFollowUpDateString(nextFollowUpDays);

  // 1-Click Smart Template Loader
  const handleLoadTemplate = (template: any) => {
    setDiagnosis(template.diagnosis || '');
    setSymptoms(template.symptoms || '');
    setAdvice(template.advice || '');
    setInvestigationsAdvised(template.investigationsAdvised || '');
    setNextFollowUpDays(template.followUpDays || 7);

    try {
      const parsedMeds =
        typeof template.medicinesJson === 'string'
          ? JSON.parse(template.medicinesJson)
          : template.medicinesJson;
      if (Array.isArray(parsedMeds) && parsedMeds.length > 0) {
        setMedicines(parsedMeds);
      }
    } catch (e) {
      console.error('Failed to parse template medicines', e);
    }
  };

  const handleAddMedicine = () => {
    const newIdx = medicines.length;
    setMedicines([
      ...medicines,
      {
        medicineName: '',
        dosage: '500 mg',
        form: 'Tablet',
        frequency: '1-0-1',
        timing: 'After Food',
        durationDays: 5,
        instructions: 'Take after meals',
      },
    ]);
    setActiveSuggestIdx(newIdx);
    setMedQuery('');
    setMedCategoryFilter('ALL');
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines(medicines.filter((_, idx) => idx !== index));
    if (activeSuggestIdx === index) setActiveSuggestIdx(null);
  };

  const handleUpdateMedicine = (index: number, field: keyof PrescriptionMedicineItem, value: any) => {
    const updated = [...medicines];
    let extraUpdates: Partial<PrescriptionMedicineItem> = {};

    // Auto-detect form and dosage if doctor types directly
    if (field === 'medicineName' && typeof value === 'string') {
      const valLower = value.toLowerCase().trim();
      if (valLower.startsWith('cap') || valLower.includes('capsule')) {
        extraUpdates.form = 'Capsule';
      } else if (valLower.startsWith('syr') || valLower.includes('syrup')) {
        extraUpdates.form = 'Syrup';
      } else if (valLower.startsWith('inj') || valLower.includes('injection')) {
        extraUpdates.form = 'Injection';
      } else if (valLower.startsWith('oint') || valLower.includes('ointment') || valLower.includes('gel')) {
        extraUpdates.form = 'Ointment';
      } else if (valLower.startsWith('drop') || valLower.includes('drops')) {
        extraUpdates.form = 'Drops';
      } else if (valLower.startsWith('tab') || valLower.includes('tablet')) {
        extraUpdates.form = 'Tablet';
      }

      // Auto-extract dosage (e.g. 40mg, 650mg, 500mg, 625mg, 10ml, 50mcg)
      const dosageMatch = value.match(/(\d+(?:\.\d+)?\s*(?:mg|gm|mcg|ml|iu|k))/i);
      if (dosageMatch && dosageMatch[1]) {
        extraUpdates.dosage = dosageMatch[1].trim();
      }
    }

    updated[index] = { ...updated[index], [field]: value, ...extraUpdates };
    setMedicines(updated);
  };

  // Select medicine from Catalog
  const handleSelectCatalogMedicine = (index: number, item: IndianMedicine) => {
    const updated = [...medicines];
    updated[index] = {
      medicineName: item.name,
      dosage: item.dosage,
      form: item.form,
      frequency: item.defaultFrequency,
      timing: item.defaultTiming,
      durationDays: item.defaultDuration,
      instructions: item.defaultInstructions,
    };
    setMedicines(updated);
    setActiveSuggestIdx(null);
    setMedQuery('');
  };

  // Filter Indian Medicine Catalog based on query and category
  const getFilteredMedicines = (query: string, category: string) => {
    let list = INDIAN_MEDICINE_CATALOG;
    if (category && category !== 'ALL') {
      list = list.filter((m) => m.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (!query || query.trim() === '') {
      return list.slice(0, 10);
    }
    const q = query.toLowerCase();
    return list.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    ).slice(0, 10);
  };

  const handleSaveAndPrint = async () => {
    if (!selectedPatientId || !diagnosis.trim()) {
      alert('Please select a patient and enter a diagnosis.');
      return;
    }

    if (allergyConflicts.length > 0) {
      const proceed = confirm(
        `⚠️ CLINICAL WARNING: You have ${allergyConflicts.length} drug allergy conflict(s). Are you sure you want to proceed?`
      );
      if (!proceed) return;
    }

    setIsSaving(true);
    try {
      const calculatedFollowUpDate = new Date();
      calculatedFollowUpDate.setDate(calculatedFollowUpDate.getDate() + (nextFollowUpDays || 7));

      const rxData = {
        patientId: selectedPatientId,
        symptoms,
        diagnosis,
        advice,
        investigationsAdvised,
        nextFollowUpDays,
        nextFollowUpDate: calculatedFollowUpDate.toISOString(),
        sendWhatsApp,
        rxLanguage,
        medicines: medicines.filter((m) => m.medicineName.trim() !== ''),
      };

      const result = await onSavePrescription(rxData);
      onViewPdf(result || rxData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <h1 className="text-lg font-bold text-slate-900">Digital Prescription Studio</h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              Clinical Safety Guard Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {CLINIC_CONFIG.doctorName} &bull; {CLINIC_CONFIG.qualifications} &bull; Reg: {CLINIC_CONFIG.regNumber}
          </p>
        </div>

        {/* Patient Selection Card */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600">Patient:</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:border-sky-500 focus:outline-hidden"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.uhid}) - {p.age}y/{p.gender?.[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Allergy Bar & Critical Safety Alert Banner */}
      {selectedPatient?.allergies && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs flex items-center justify-between text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>Documented Patient Allergies:</strong> {selectedPatient.allergies}
            </span>
          </div>
          <span className="rounded bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900 uppercase">
            Allergy Registered
          </span>
        </div>
      )}

      {/* Flashing Real-Time Drug Allergy Conflict Banner */}
      {allergyConflicts.length > 0 && (
        <div className="rounded-2xl border-2 border-rose-500 bg-rose-50 p-4 text-xs text-rose-950 space-y-2 animate-pulse shadow-md">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-700">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <span>⚠️ CRITICAL DRUG ALLERGY CONFLICT DETECTED!</span>
          </div>
          <div className="space-y-1 pl-7">
            {allergyConflicts.map((c, i) => (
              <div key={i}>
                Prescribed <strong>"{c.drugName}"</strong> conflicts with documented{' '}
                <strong className="underline text-rose-800">{c.matchedAllergy} Allergy</strong>. {c.reason}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Prescription Templates Picker */}
      <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50/70 to-indigo-50/70 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-900">
            <Sparkles className="h-4 w-4 text-sky-600" />
            <span>1-CLICK PROTOCOL TEMPLATES ({templates.length}):</span>
          </div>

          <button
            type="button"
            onClick={() => setShowSaveTemplateModal(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-900 hover:underline"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            <span>+ Save Current as New Template</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleLoadTemplate(tpl)}
              className="flex items-center gap-1.5 rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-800 shadow-2xs hover:bg-sky-600 hover:text-white hover:border-sky-600 transition"
            >
              <span>{tpl.title}</span>
              <span className="text-[10px] opacity-75">({tpl.specialty})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Rx Form Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 cols: Clinical Findings & Medicines */}
        <div className="lg:col-span-8 space-y-6">
          {/* Clinical Findings: Symptoms & Diagnosis */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-600" />
              <span>1. Clinical Diagnosis & Chief Complaints</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Diagnosis / Clinical Condition *</label>
                <input
                  type="text"
                  placeholder="e.g. Acute Viral Upper Respiratory Infection / T2DM / Hypertension"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 font-semibold focus:border-sky-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Symptoms & Clinical Notes</label>
                <input
                  type="text"
                  placeholder="e.g. High fever (102°F), dry cough, throat irritation for 3 days"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Medicines Builder */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  <span>2. Medicines (Rx Drugs)</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Type to auto-search Indian generics or click 1-touch dosage chips
                </p>
              </div>

              <button
                onClick={handleAddMedicine}
                className="flex items-center gap-1 rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-sky-700 shadow-xs transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Add Medicine</span>
              </button>
            </div>

            {/* Medicine Rows */}
            <div className="space-y-4">
              {medicines.map((med, idx) => (
                <div
                  key={idx}
                  className="relative rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3 transition hover:border-slate-300 hover:shadow-xs"
                >
                  {/* Row Top Bar */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-sky-800 font-mono bg-sky-100/70 px-2 py-1 rounded-md">
                      #{idx + 1}
                    </span>

                    {/* Smart Medicine Autocomplete Input */}
                    <div className="relative flex-1">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search or type medicine name (e.g. Tab. Paracetamol 650mg, Pantocid, Telma)..."
                          value={med.medicineName}
                          autoComplete="off"
                          spellCheck={false}
                          onFocus={() => {
                            setActiveSuggestIdx(idx);
                            setMedQuery(med.medicineName);
                          }}
                          onChange={(e) => {
                            handleUpdateMedicine(idx, 'medicineName', e.target.value);
                            setMedQuery(e.target.value);
                            setActiveSuggestIdx(idx);
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs font-bold text-slate-900 focus:border-sky-500 focus:outline-hidden"
                        />
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      </div>

                      {/* Autocomplete Dropdown */}
                      {activeSuggestIdx === idx && (
                        <>
                          {/* Backdrop to dismiss on click outside */}
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setActiveSuggestIdx(null)}
                          />
                          <div className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl divide-y divide-slate-100 animate-in fade-in-50 zoom-in-98 duration-100">
                            {/* Header with Title & Category Pills */}
                            <div className="sticky top-0 bg-white/95 backdrop-blur-xs p-2.5 border-b border-slate-100 z-10 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                <span className="flex items-center gap-1.5">
                                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[10px]">
                                    ⚡
                                  </span>
                                  <span>INDIAN PHARMA CATALOG ({getFilteredMedicines(medQuery, medCategoryFilter).length} matches)</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setActiveSuggestIdx(null)}
                                  className="text-slate-400 hover:text-slate-700 text-xs px-1"
                                >
                                  ✕
                                </button>
                              </div>

                              {/* Category Quick Filter Chips */}
                              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-[10px]">
                                {[
                                  { id: 'ALL', label: 'All' },
                                  { id: 'Fever / Pain', label: 'Fever/Pain' },
                                  { id: 'Acidity / GERD', label: 'Acidity/GERD' },
                                  { id: 'Antibiotics', label: 'Antibiotics' },
                                  { id: 'Cough / Cold', label: 'Cough/Cold' },
                                  { id: 'BP / Heart', label: 'BP/Heart' },
                                  { id: 'Diabetes', label: 'Diabetes' },
                                  { id: 'Vitamins', label: 'Vitamins' },
                                ].map((cat) => (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setMedCategoryFilter(cat.id)}
                                    className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap transition ${
                                      medCategoryFilter === cat.id
                                        ? 'bg-sky-600 text-white shadow-2xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    {cat.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Suggestions List */}
                            {getFilteredMedicines(medQuery, medCategoryFilter).length > 0 ? (
                              getFilteredMedicines(medQuery, medCategoryFilter).map((item, cIdx) => (
                                <button
                                  key={cIdx}
                                  type="button"
                                  onClick={() => handleSelectCatalogMedicine(idx, item)}
                                  className="w-full text-left p-3 hover:bg-sky-50/80 transition flex items-center justify-between group cursor-pointer"
                                >
                                  <div className="space-y-0.5 pr-2">
                                    <div className="flex items-center gap-2">
                                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 group-hover:bg-sky-200 group-hover:text-sky-900">
                                        {item.form}
                                      </span>
                                      <span className="text-xs font-bold text-slate-900 group-hover:text-sky-700">
                                        {item.name}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                      <span>{item.genericName}</span>
                                      <span>&bull;</span>
                                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded">
                                        {item.category}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-mono font-bold text-sky-800">
                                      {item.defaultFrequency}
                                    </span>
                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                      {item.defaultDuration} Days &bull; {item.defaultTiming}
                                    </div>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="p-4 text-xs text-slate-400 italic text-center space-y-1">
                                <div>No matching standard Indian medicines found.</div>
                                <div className="text-[10px] text-slate-500">
                                  You can continue typing to save custom medicine formulation.
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <select
                      value={med.form}
                      onChange={(e) => handleUpdateMedicine(idx, 'form', e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden"
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Injection">Injection</option>
                      <option value="Ointment">Ointment</option>
                      <option value="Drops">Drops</option>
                    </select>

                    <button
                      onClick={() => handleRemoveMedicine(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                      title="Remove medicine"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* 1-Click Dosage, Frequency, Timing & Duration Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 border-t border-slate-200/60">
                    {/* Dosage Field */}
                    <div className="sm:col-span-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Dosage:</span>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleUpdateMedicine(idx, 'dosage', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 font-semibold"
                        placeholder="e.g. 650 mg"
                      />
                    </div>

                    {/* Frequency 1-Click Chips */}
                    <div className="sm:col-span-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Frequency (1-Click):</span>
                        <span className="text-[10px] font-mono font-bold text-sky-700">{med.frequency}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {FREQUENCY_CHIPS.map((freq) => (
                          <button
                            key={freq}
                            type="button"
                            onClick={() => handleUpdateMedicine(idx, 'frequency', freq)}
                            className={`rounded-md px-1.5 py-0.5 text-[11px] font-mono font-bold transition ${
                              med.frequency === freq
                                ? 'bg-sky-600 text-white shadow-2xs'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                            }`}
                          >
                            {freq}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Timing 1-Click Chips */}
                    <div className="sm:col-span-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Timing:</span>
                        <span className="text-[10px] font-semibold text-purple-700">{med.timing}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {TIMING_CHIPS.map((timing) => (
                          <button
                            key={timing}
                            type="button"
                            onClick={() => handleUpdateMedicine(idx, 'timing', timing)}
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition ${
                              med.timing === timing
                                ? 'bg-purple-600 text-white shadow-2xs'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                            }`}
                          >
                            {timing}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Duration 1-Click Chips */}
                    <div className="sm:col-span-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Duration:</span>
                        <span className="text-[10px] font-bold text-emerald-700">{med.durationDays} Days</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {DURATION_CHIPS.map((dur) => (
                          <button
                            key={dur.days}
                            type="button"
                            onClick={() => handleUpdateMedicine(idx, 'durationDays', dur.days)}
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold transition ${
                              med.durationDays === dur.days
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            {dur.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions Line */}
                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder="Special instructions (e.g. Take with warm water, avoid dairy, after breakfast)..."
                      value={med.instructions || ''}
                      onChange={(e) => handleUpdateMedicine(idx, 'instructions', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-[11px] text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 cols: Advice, Investigations, Language & Action buttons */}
        <div className="lg:col-span-4 space-y-6">
          {/* Advice & Tests */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-600" />
              <span>3. Advice & Investigations</span>
            </h2>

            <div>
              <label className="text-xs font-semibold text-slate-700">Doctor Advice & Dietary Guidance</label>
              <textarea
                rows={3}
                placeholder="e.g. Adequate hydration (3L/day), light bland diet, avoid spicy food..."
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Lab Investigations Advised</label>
              <input
                type="text"
                placeholder="e.g. Complete Blood Count (CBC), Urine Routine, Lipid Profile"
                value={investigationsAdvised}
                onChange={(e) => setInvestigationsAdvised(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Dosage Print Language */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Languages className="h-3.5 w-3.5 text-purple-600" />
                <span>Print Instructions Language</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                {[
                  { id: 'EN', label: 'English' },
                  { id: 'HI', label: 'Hindi (हिंदी)' },
                  { id: 'OR', label: 'Odia (ଓଡ଼ିଆ)' },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setRxLanguage(l.id as any)}
                    className={`rounded-lg py-1.5 text-[11px] font-bold transition ${
                      rxLanguage === l.id
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Follow-up Selector with Exact Real-Date Calculation */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Next Follow-Up Review</span>
                </label>
                <span className="text-xs font-bold text-indigo-700">{nextFollowUpDays} Days</span>
              </div>

              {/* Real Calendar Date Auto-Calculated Banner */}
              <div className="rounded-xl bg-indigo-50/90 border border-indigo-200 p-2.5 text-xs text-indigo-950 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shrink-0 text-[11px]">
                  📅
                </span>
                <div>
                  <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                    Next Follow-Up / Return Visit:
                  </div>
                  <div className="text-xs font-extrabold text-indigo-950">
                    Next Visit:{' '}
                    <span className="text-indigo-900 underline underline-offset-2">
                      {followUpDetails.formattedDate}
                    </span>{' '}
                    <span className="text-indigo-600 font-semibold text-[11px]">
                      (After {nextFollowUpDays} Days)
                    </span>
                  </div>
                </div>
              </div>

              {/* 1-Click Follow-Up Day Chips */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[3, 5, 7, 10, 14, 21, 30, 60].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setNextFollowUpDays(days)}
                    className={`rounded-lg py-1 text-xs font-bold transition ${
                      nextFollowUpDays === days
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {days} {days === 30 ? 'Mo' : days === 60 ? '2Mo' : 'Days'}
                  </button>
                ))}
              </div>
            </div>

            {/* WhatsApp Dispatch toggle */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="checkbox"
                id="sendWa"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="sendWa" className="text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer">
                <Send className="h-3 w-3 text-emerald-600" />
                <span>Auto-Send PDF link to Patient's WhatsApp</span>
              </label>
            </div>
          </div>

          {/* Action Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-xl space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Printer className="h-4 w-4 text-sky-400" />
              <span>Generate & Dispatch</span>
            </h3>
            <p className="text-xs text-slate-400">
              Saves prescription to EHR timeline, generates branded clinic PDF and schedules CRM follow-up alert on {followUpDetails.shortDate}.
            </p>

            <button
              onClick={handleSaveAndPrint}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-teal-400 transition"
            >
              {isSaving ? (
                <span>Generating PDF...</span>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Save & Print Branded Rx PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Save Template Modal */}
      {showSaveTemplateModal && (
        <SaveTemplateModal
          currentDiagnosis={diagnosis}
          currentSymptoms={symptoms}
          currentMedicines={medicines.filter((m) => m.medicineName.trim() !== '')}
          currentAdvice={advice}
          currentInvestigations={investigationsAdvised}
          onClose={() => setShowSaveTemplateModal(false)}
          onSaveTemplate={async (tpl) => {
            if (onSaveCustomTemplate) {
              await onSaveCustomTemplate(tpl);
            }
          }}
        />
      )}
    </div>
  );
};
