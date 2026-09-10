'use client';

import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  User,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  HeartPulse,
  FileText,
  Calendar,
  Receipt,
  Clock,
  ArrowDown,
  Download,
  Share2,
  Plus,
  CheckCircle2,
  Activity,
  FileSpreadsheet,
  ChevronRight,
  Send,
  UploadCloud,
} from 'lucide-react';
import { UploadDocumentModal } from './UploadDocumentModal';

interface PatientListAndTimelineProps {
  patients: any[];
  selectedPatientId: string | null;
  onSelectPatient: (id: string) => void;
  onOpenNewPatient: () => void;
  onOpenNewPrescriptionForPatient: (patient: any) => void;
  onOpenNewAppointmentForPatient: (patient: any) => void;
  onOpenNewBillForPatient: (patient: any) => void;
  onViewPrescriptionPdf: (rx: any) => void;
}

export const PatientListAndTimeline: React.FC<PatientListAndTimelineProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  onOpenNewPatient,
  onOpenNewPrescriptionForPatient,
  onOpenNewAppointmentForPatient,
  onOpenNewBillForPatient,
  onViewPrescriptionPdf,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'timeline' | 'prescriptions' | 'vitals' | 'documents' | 'billing'>('timeline');
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);

  const filteredPatients = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.uhid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone?.includes(searchQuery)
  );

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-8.5rem)]">
      {/* Left 4 Cols: Patient Directory List (Hidden on mobile when detail is open) */}
      <div
        className={`lg:col-span-4 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden ${
          mobileDetailOpen ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {/* Header with Search */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <User className="h-4 w-4 text-sky-600" />
              <span>Patient Directory ({filteredPatients.length})</span>
            </h2>
            <button
              onClick={onOpenNewPatient}
              className="flex items-center gap-1 rounded-lg bg-sky-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-sky-700 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Register</span>
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, UHID or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Patient Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredPatients.map((patient) => {
            const isSelected = selectedPatient?.id === patient.id;
            return (
              <div
                key={patient.id}
                onClick={() => {
                  onSelectPatient(patient.id);
                  setMobileDetailOpen(true);
                }}
                className={`p-3.5 cursor-pointer transition flex items-center justify-between ${
                  isSelected ? 'bg-sky-50/90 border-l-4 border-sky-600' : 'hover:bg-slate-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{patient.name}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600">
                      {patient.age}y / {patient.gender?.[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span className="text-sky-700 font-semibold">{patient.uhid}</span>
                    <span>&bull;</span>
                    <span>{patient.phone}</span>
                  </div>
                  {patient.medicalHistory && (
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {patient.medicalHistory}
                    </div>
                  )}
                </div>

                <ChevronRight className={`h-4 w-4 ${isSelected ? 'text-sky-600' : 'text-slate-300'}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Right 8 Cols: Full 360° Patient View & Care Timeline */}
      {selectedPatient ? (
        <div
          className={`lg:col-span-8 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden ${
            !mobileDetailOpen ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Mobile Back to List Button */}
          <div className="lg:hidden p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setMobileDetailOpen(false)}
              className="text-xs font-bold text-sky-700 flex items-center gap-1 hover:underline"
            >
              <span>← Back to Patient Directory</span>
            </button>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">{selectedPatient.uhid}</span>
          </div>

          {/* Patient Header Card */}
          <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-sky-50/30 to-white">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-600 text-white font-bold text-xl shadow-md shadow-sky-600/20">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl font-extrabold text-slate-900">{selectedPatient.name}</h1>
                    <span className="rounded-md bg-sky-100 border border-sky-200 px-2 py-0.5 text-xs font-bold text-sky-800 font-mono">
                      UHID: {selectedPatient.uhid}
                    </span>
                    {selectedPatient.bloodGroup && (
                      <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                        Blood: {selectedPatient.bloodGroup}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {selectedPatient.age} Years &bull; {selectedPatient.gender}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {selectedPatient.phone}
                    </span>
                    {selectedPatient.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {selectedPatient.address}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onOpenNewPrescriptionForPatient(selectedPatient)}
                  className="flex items-center gap-1 rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-sky-700 transition"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Write Rx</span>
                </button>

                <button
                  onClick={() => onOpenNewAppointmentForPatient(selectedPatient)}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Book Slot</span>
                </button>

                <button
                  onClick={() => onOpenNewBillForPatient(selectedPatient)}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Receipt className="h-3.5 w-3.5 text-teal-600" />
                  <span>Bill</span>
                </button>
              </div>
            </div>

            {/* Critical Medical Alerts Banner */}
            {selectedPatient.allergies && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 font-medium">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>
                  <strong>ALLERGY ALERT:</strong> {selectedPatient.allergies}
                </span>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-4 px-5 border-b border-slate-200 bg-slate-50/40 text-xs font-semibold">
            {[
              { id: 'timeline', label: 'Chronological Care Timeline' },
              { id: 'prescriptions', label: `Prescriptions (${selectedPatient.prescriptions?.length || 0})` },
              { id: 'vitals', label: 'Vitals & Biomarkers' },
              { id: 'documents', label: `Documents & Scans (${selectedPatient.documents?.length || 0})` },
              { id: 'billing', label: `Invoices (${selectedPatient.invoices?.length || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-sky-600 text-sky-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* 1. CHRONOLOGICAL CARE TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                <div className="text-xs text-slate-500 font-medium">
                  Showing complete end-to-end clinical events in chronological order:
                </div>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedPatient.timeline && selectedPatient.timeline.length > 0 ? (
                    selectedPatient.timeline.map((event: any, idx: number) => {
                      const isRx = event.type === 'PRESCRIPTION';
                      const isAppt = event.type === 'APPOINTMENT';
                      const isDoc = event.type === 'DOCUMENT';
                      const isInv = event.type === 'INVOICE';

                      return (
                        <div key={event.id || idx} className="relative group">
                          {/* Timeline Node Dot */}
                          <div
                            className={`absolute -left-6 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow-xs ${
                              isRx
                                ? 'bg-sky-600 text-white'
                                : isAppt
                                ? 'bg-emerald-500 text-white'
                                : isDoc
                                ? 'bg-purple-500 text-white'
                                : 'bg-amber-500 text-white'
                            }`}
                          >
                            <span className="text-[9px] font-bold">
                              {isRx ? 'Rx' : isAppt ? '📅' : isDoc ? '📄' : '₹'}
                            </span>
                          </div>

                          {/* Event Card */}
                          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-sky-300 transition">
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                              <span className="font-bold text-slate-700">{event.date}</span>
                              <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">
                                {event.type}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                            <p className="text-xs text-slate-600 mt-0.5">{event.subtitle}</p>

                            {/* Additional details for Rx */}
                            {isRx && event.items && (
                              <div className="mt-3 rounded-lg bg-sky-50/60 p-2.5 text-xs">
                                <div className="font-semibold text-sky-900 mb-1">Prescribed Medicines:</div>
                                <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                                  {event.items.map((m: any, mIdx: number) => (
                                    <li key={mIdx}>
                                      <strong>{m.medicineName}</strong> &bull; {m.dosage} ({m.frequency} &bull; {m.timing}) &bull; {m.durationDays} days
                                    </li>
                                  ))}
                                </ul>
                                {event.advice && (
                                  <div className="mt-2 text-slate-600 border-t border-sky-200/50 pt-1.5">
                                    <strong>Doctor Advice:</strong> {event.advice}
                                  </div>
                                )}
                              </div>
                            )}

                            {isDoc && (
                              <div className="mt-2 flex items-center gap-2">
                                <a
                                  href={event.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:underline"
                                >
                                  <Download className="h-3 w-3" />
                                  <span>View Report File</span>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-xs text-slate-400">
                      No clinical events recorded yet for this patient.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. PRESCRIPTIONS TAB */}
            {activeTab === 'prescriptions' && (
              <div className="space-y-4">
                {selectedPatient.prescriptions?.map((rx: any) => (
                  <div key={rx.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-semibold text-slate-400">Date: {rx.createdAt?.split('T')[0]}</span>
                        <h3 className="text-sm font-bold text-slate-900 mt-0.5">Diagnosis: {rx.diagnosis}</h3>
                      </div>
                      <button
                        onClick={() => onViewPrescriptionPdf(rx)}
                        className="flex items-center gap-1.5 rounded-lg bg-sky-50 border border-sky-200 px-3 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100 transition"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Print / View Rx PDF</span>
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {rx.items?.map((item: any) => (
                        <div key={item.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <div className="font-bold text-slate-800">{item.medicineName}</div>
                          <div className="text-slate-500">
                            {item.dosage} &bull; {item.frequency} &bull; {item.timing} &bull; {item.durationDays}d
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. VITALS & BIOMARKERS TAB */}
            {activeTab === 'vitals' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-400 font-medium">Blood Pressure</span>
                    <div className="text-lg font-bold text-slate-900 mt-1">
                      {selectedPatient.vitals?.[0]?.bpSystolic || 120} / {selectedPatient.vitals?.[0]?.bpDiastolic || 80} mmHg
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold">Normal range</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-400 font-medium">Pulse Rate</span>
                    <div className="text-lg font-bold text-slate-900 mt-1">
                      {selectedPatient.vitals?.[0]?.pulse || 76} bpm
                    </div>
                    <span className="text-[10px] text-slate-500">Regular rhythm</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-400 font-medium">Oxygen (SpO2)</span>
                    <div className="text-lg font-bold text-slate-900 mt-1">
                      {selectedPatient.vitals?.[0]?.spo2 || 99}%
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold">Optimal</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-400 font-medium">BMI / Weight</span>
                    <div className="text-lg font-bold text-slate-900 mt-1">
                      {selectedPatient.vitals?.[0]?.weight || 68} kg
                    </div>
                    <span className="text-[10px] text-slate-500">BMI: 23.4 (Normal)</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. DOCUMENTS & LAB SCANS */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="text-xs font-bold text-slate-800">
                    Uploaded Medical Documents & Scans ({selectedPatient.documents?.length || 0})
                  </div>
                  <button
                    onClick={() => setShowUploadDocModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-purple-700 transition"
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>+ Upload Lab Document</span>
                  </button>
                </div>

                {selectedPatient.documents && selectedPatient.documents.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedPatient.documents.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{doc.title}</h4>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              <span className="rounded bg-purple-100/70 text-purple-900 font-semibold px-1.5 py-0.2 mr-1.5 text-[10px]">
                                {doc.category}
                              </span>
                              <span>Uploaded: {doc.uploadedAt?.split('T')[0] || 'Recent'} &bull; {doc.fileSize || '1.2 MB'}</span>
                            </div>
                          </div>
                        </div>

                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-50 transition"
                        >
                          View Report
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center space-y-3 bg-slate-50/50">
                    <div className="h-10 w-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">No Medical Documents Uploaded Yet</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Upload blood tests, pathology reports, X-rays or discharge summaries to this patient's permanent locker.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowUploadDocModal(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-2xs"
                    >
                      <UploadCloud className="h-3.5 w-3.5" />
                      <span>Upload First Document</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 5. INVOICES & BILLS TAB */}
            {activeTab === 'billing' && (
              <div className="space-y-3">
                {selectedPatient.invoices?.map((inv: any) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{inv.invoiceNumber}</span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                            inv.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Total: <strong>₹{inv.totalAmount}</strong> | Paid: <strong>₹{inv.paidAmount}</strong>
                      </div>
                    </div>

                    <span className="text-xs text-slate-400 font-mono">{inv.createdAt?.split('T')[0]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="lg:col-span-8 flex items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 text-sm">
          Select a patient to view full 360° profile and chronological history.
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadDocModal && selectedPatient && (
        <UploadDocumentModal
          patient={selectedPatient}
          onClose={() => setShowUploadDocModal(false)}
          onUploadSuccess={() => onSelectPatient(selectedPatient.id)}
        />
      )}
    </div>
  );
};
