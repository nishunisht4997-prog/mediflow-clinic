'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Sparkles,
  Plus,
  Trash2,
  Share2,
  Printer,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  AlertCircle,
  AlertTriangle,
  BookmarkPlus,
  Send,
  Download,
  Languages,
} from 'lucide-react';
import { PrescriptionMedicineItem } from '@/types';
import { checkDrugAllergyConflicts, AllergyConflict } from '@/lib/allergy-checker';
import { SaveTemplateModal } from '@/components/prescription/SaveTemplateModal';

interface DigitalPrescriptionMakerProps {
  patients: any[];
  initialPatientId?: string | null;
  templates: any[];
  onSavePrescription: (prescriptionData: any) => Promise<any>;
  onViewPdf: (rxData: any) => void;
  onSaveCustomTemplate?: (templateData: any) => Promise<void>;
}

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

  const [medicines, setMedicines] = useState<PrescriptionMedicineItem[]>([
    {
      medicineName: 'Tab. Pantoprazole',
      dosage: '40 mg',
      form: 'Tablet',
      frequency: '1-0-0',
      timing: 'Before Food',
      durationDays: 10,
      instructions: 'Take 30 mins before breakfast',
    },
    {
      medicineName: 'Tab. Paracetamol',
      dosage: '650 mg',
      form: 'Tablet',
      frequency: '1-0-1',
      timing: 'After Food',
      durationDays: 3,
      instructions: 'SOS for fever > 100°F',
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
    setMedicines([
      ...medicines,
      {
        medicineName: '',
        dosage: '500 mg',
        form: 'Tablet',
        frequency: '1-0-1',
        timing: 'After Food',
        durationDays: 5,
        instructions: '',
      },
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines(medicines.filter((_, idx) => idx !== index));
  };

  const handleUpdateMedicine = (index: number, field: keyof PrescriptionMedicineItem, value: any) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
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
      const rxData = {
        patientId: selectedPatientId,
        symptoms,
        diagnosis,
        advice,
        investigationsAdvised,
        nextFollowUpDays,
        sendWhatsApp,
        rxLanguage,
        medicines: medicines.filter((m) => m.medicineName.trim() !== ''),
      };

      const result = await onSavePrescription(rxData);
      onViewPdf(result);
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
            Dr. Avishek Mohapatra &bull; MBBS, MD (General Medicine), DNB (Urology) &bull; Reg: MCI-98421
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
                  placeholder="e.g. Acute Viral Upper Respiratory Infection"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 font-semibold focus:border-sky-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Symptoms & Clinical Notes</label>
                <input
                  type="text"
                  placeholder="e.g. High fever (102°F), sore throat for 3 days"
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
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <span>2. Medicines (Rx Drugs)</span>
              </h2>
              <button
                onClick={handleAddMedicine}
                className="flex items-center gap-1 rounded-lg bg-sky-50 border border-sky-200 px-3 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Medicine</span>
              </button>
            </div>

            {/* Medicine Rows */}
            <div className="space-y-3">
              {medicines.map((med, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2.5 transition hover:border-slate-300"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-sky-800 font-mono">#{idx + 1}</span>

                    <input
                      type="text"
                      placeholder="Medicine Name (e.g. Tab. Pantoprazole 40mg)"
                      value={med.medicineName}
                      onChange={(e) => handleUpdateMedicine(idx, 'medicineName', e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:border-sky-500 focus:outline-hidden"
                    />

                    <select
                      value={med.form}
                      onChange={(e) => handleUpdateMedicine(idx, 'form', e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
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
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Dosage & Timing Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400">Dosage:</span>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleUpdateMedicine(idx, 'dosage', e.target.value)}
                        className="mt-0.5 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 font-semibold"
                        placeholder="e.g. 40 mg"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-slate-400">Frequency:</span>
                      <select
                        value={med.frequency}
                        onChange={(e) => handleUpdateMedicine(idx, 'frequency', e.target.value)}
                        className="mt-0.5 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 font-semibold"
                      >
                        <option value="1-0-0">1-0-0 (Morning)</option>
                        <option value="1-0-1">1-0-1 (Morning & Night)</option>
                        <option value="1-1-1">1-1-1 (Thrice Daily)</option>
                        <option value="0-0-1">0-0-1 (Night / Bedtime)</option>
                        <option value="0-1-0">0-1-0 (Afternoon)</option>
                        <option value="SOS">SOS (As needed)</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-slate-400">Timing:</span>
                      <select
                        value={med.timing}
                        onChange={(e) => handleUpdateMedicine(idx, 'timing', e.target.value)}
                        className="mt-0.5 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800"
                      >
                        <option value="Before Food">Before Food</option>
                        <option value="After Food">After Food</option>
                        <option value="With Food">With Food</option>
                        <option value="Bedtime">Bedtime</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-slate-400">Duration (Days):</span>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={med.durationDays}
                        onChange={(e) =>
                          handleUpdateMedicine(idx, 'durationDays', parseInt(e.target.value, 10))
                        }
                        className="mt-0.5 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800"
                      />
                    </div>
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
                placeholder="e.g. Adequate hydration (3L/day), low salt diet..."
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Lab Investigations Advised</label>
              <input
                type="text"
                placeholder="e.g. CBC, Urine Routine, Lipid Profile"
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

            {/* Follow-up Selector */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700">Next Follow-Up</label>
              <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                {[4, 7, 15, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setNextFollowUpDays(days)}
                    className={`rounded-lg py-1.5 text-xs font-bold transition ${
                      nextFollowUpDays === days
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>

            {/* WhatsApp Dispatch toggle */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="sendWa"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="sendWa" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Send className="h-3 w-3 text-emerald-600" />
                <span>Auto-Send PDF to Patient's WhatsApp</span>
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
              Saves prescription to permanent record, generates branded clinic PDF and creates CRM follow-up schedule.
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
