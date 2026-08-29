'use client';

import React, { useState } from 'react';
import { BookmarkPlus, X, CheckCircle2, Sparkles } from 'lucide-react';

interface SaveTemplateModalProps {
  currentDiagnosis: string;
  currentSymptoms: string;
  currentMedicines: any[];
  currentAdvice: string;
  currentInvestigations: string;
  onClose: () => void;
  onSaveTemplate: (templateData: any) => Promise<void>;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  currentDiagnosis,
  currentSymptoms,
  currentMedicines,
  currentAdvice,
  currentInvestigations,
  onClose,
  onSaveTemplate,
}) => {
  const [title, setTitle] = useState(currentDiagnosis ? `${currentDiagnosis} Protocol` : '');
  const [specialty, setSpecialty] = useState('General Medicine');
  const [followUpDays, setFollowUpDays] = useState(7);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      await onSaveTemplate({
        title,
        specialty,
        diagnosis: currentDiagnosis,
        symptoms: currentSymptoms,
        medicines: currentMedicines,
        advice: currentAdvice,
        investigationsAdvised: currentInvestigations,
        followUpDays,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden my-auto p-6 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
            <BookmarkPlus className="h-4 w-4 text-sky-600" />
            <span>Save as Custom 1-Click Protocol Template</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="font-semibold text-slate-700">Template Name / Protocol Title *</label>
            <input
              type="text"
              placeholder="e.g. Post-Op Kidney Stone Protocol"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold focus:border-sky-500 focus:outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700">Specialty Department</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium focus:outline-hidden"
              >
                <option value="General Medicine">General Medicine</option>
                <option value="Urology & Kidney">Urology & Kidney</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Diabetology">Diabetology</option>
                <option value="Gastroenterology">Gastroenterology</option>
                <option value="Orthopaedics">Orthopaedics</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700">Default Follow-Up (Days)</label>
              <input
                type="number"
                value={followUpDays}
                onChange={(e) => setFollowUpDays(parseInt(e.target.value, 10) || 7)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-bold"
              />
            </div>
          </div>

          <div className="rounded-xl bg-sky-50 p-3 text-[11px] text-sky-900 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-sky-600" />
              <span>Snapshot of Medicines Saved ({currentMedicines.length} items):</span>
            </div>
            <p className="text-slate-600 line-clamp-2">
              {currentMedicines.map((m) => m.medicineName).filter(Boolean).join(', ') || 'No medicines'}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-sky-600 px-4 py-2 font-bold text-white hover:bg-sky-700 shadow-md shadow-sky-600/20"
            >
              {isSaving ? 'Saving...' : 'Save Template to Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
