'use client';

import React, { useState } from 'react';
import {
  FileText,
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Building2,
  Tag,
  Paperclip,
} from 'lucide-react';
import { CLINIC_CONFIG } from '@/config/clinic.config';

interface UploadDocumentModalProps {
  patient: any;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  patient,
  onClose,
  onUploadSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Lab Report');
  const [uploadedBy, setUploadedBy] = useState(CLINIC_CONFIG.doctorName);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState('1.5 MB PDF');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'Lab Report',
    'X-Ray / Scan',
    'Pathology Test',
    'Discharge Summary',
    'Prescription Scan',
    'Blood Sugar Chart',
    'ECG / Cardiology Report',
  ];

  const quickReportPresets = [
    { title: 'Complete Blood Count (CBC) Report', cat: 'Lab Report' },
    { title: 'HbA1c & Fasting Glucose Profile', cat: 'Pathology Test' },
    { title: 'Chest X-Ray (PA View)', cat: 'X-Ray / Scan' },
    { title: 'Kidney Function Test (KFT / RFT)', cat: 'Lab Report' },
    { title: 'Liver Function Test (LFT)', cat: 'Lab Report' },
    { title: 'USG Abdomen & Pelvis Scan', cat: 'X-Ray / Scan' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB PDF`);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !patient?.id) {
      setError('Please provide document title and select patient.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          title: title.trim(),
          category,
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileSize,
          uploadedBy,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to upload document');
      }

      onUploadSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden my-auto p-6 space-y-5 text-xs text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Upload Lab Report & Diagnostic Scan</h3>
              <p className="text-[11px] text-slate-400">
                Patient: <strong>{patient?.name}</strong> ({patient?.uhid})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-rose-800 font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Quick Report Templates:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {quickReportPresets.map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setTitle(preset.title);
                  setCategory(preset.cat);
                }}
                className="rounded-lg bg-slate-100 hover:bg-purple-100 hover:text-purple-900 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition"
              >
                + {preset.title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Document Title */}
          <div>
            <label className="font-bold text-slate-700">Document / Report Title *</label>
            <input
              type="text"
              placeholder="e.g. Complete Blood Count (CBC) or USG Abdomen"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-semibold focus:border-purple-500 focus:outline-hidden"
              required
            />
          </div>

          {/* Category & Uploaded By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700">Category / Test Type</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800 focus:border-purple-500 focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700">Authorized Uploader</label>
              <input
                type="text"
                value={uploadedBy}
                onChange={(e) => setUploadedBy(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-semibold focus:border-purple-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Drag & Drop / File Input Box */}
          <div>
            <label className="font-bold text-slate-700">Attach Report File (PDF / JPG / DICOM)</label>
            <label className="mt-1 flex flex-col items-center justify-center p-5 border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/40 rounded-2xl cursor-pointer transition">
              <UploadCloud className="h-8 w-8 text-purple-600 mb-1" />
              <span className="font-bold text-purple-900">
                {fileName ? fileName : 'Click to select or drag PDF report'}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                {fileName ? `File size: ${fileSize}` : 'Supported: PDF, JPEG, PNG up to 25MB'}
              </span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-purple-600/30 hover:bg-purple-700 transition"
            >
              {isSubmitting ? (
                <span>Uploading to Locker...</span>
              ) : (
                <>
                  <FileCheck className="h-4 w-4" />
                  <span>Save to Patient Locker</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
