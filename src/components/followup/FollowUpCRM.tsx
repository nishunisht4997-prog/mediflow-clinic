'use client';

import React, { useState } from 'react';
import {
  Repeat,
  PhoneCall,
  MessageCircle,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  ArrowRight,
  Send,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

import { CLINIC_CONFIG } from '@/config/clinic.config';

interface FollowUpCRMProps {
  followUps: any[];
  onUpdateStage: (id: string, newStage: string) => Promise<void>;
  onSendWhatsAppFollowUp: (followUp: any) => void;
}

export const FollowUpCRM: React.FC<FollowUpCRMProps> = ({
  followUps = [],
  onUpdateStage,
  onSendWhatsAppFollowUp,
}) => {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const stages = [
    { id: 'SCHEDULED', label: '1. Follow-up Due', color: 'bg-purple-100 text-purple-800' },
    { id: 'REMINDER_SENT', label: '2. WhatsApp Sent', color: 'bg-sky-100 text-sky-800' },
    { id: 'CALLED', label: '3. Receptionist Called', color: 'bg-amber-100 text-amber-800' },
    { id: 'RE_BOOKED', label: '4. Re-Booked Slot', color: 'bg-emerald-100 text-emerald-800' },
    { id: 'COMPLETED', label: '5. Consulted & Done', color: 'bg-slate-100 text-slate-700' },
  ];

  const handleRealWhatsAppDispatch = async (fu: any) => {
    const pName = fu.patient?.name || fu.patientName || 'Patient';
    const rawPhone = fu.patient?.phone || fu.phone || '';
    const cleanDigits = rawPhone.replace(/[^0-9]/g, '');
    const cleanPhone = cleanDigits.startsWith('91') && cleanDigits.length === 12
      ? cleanDigits
      : cleanDigits.length === 10
      ? `91${cleanDigits}`
      : cleanDigits;

    const messageText = `Dear ${pName}, this is a gentle follow-up reminder from ${CLINIC_CONFIG.clinicName}.\n\nYour advised follow-up review is due on ${fu.dueDate || 'this week'}. ${fu.notes ? `(Note: ${fu.notes})` : ''}\n\nPlease reply to this WhatsApp or call us to confirm your OPD consultation slot.\n\nClinic: ${CLINIC_CONFIG.clinicName} (Ph: ${CLINIC_CONFIG.phone})`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`;

    // Open real WhatsApp Web / Mobile app directly
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank');
    }

    setToastMessage(`WhatsApp chat opened for ${pName}!`);
    setTimeout(() => setToastMessage(null), 3500);

    // Call parent handler to log in backend and advance stage
    onSendWhatsAppFollowUp(fu);
    if (fu.stage === 'SCHEDULED') {
      await onUpdateStage(fu.id, 'REMINDER_SENT');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
              <Repeat className="h-5 w-5" />
            </span>
            <h1 className="text-lg font-bold text-slate-900">Patient Follow-up & Retention CRM</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated follow-up pipeline: Converts discharged patients into returning consultations via 1-click WhatsApp reminders & calling lists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-orange-50 border border-orange-200 px-3 py-1.5 text-xs font-bold text-orange-700">
            {followUps.length} Active Patients in Pipeline
          </span>
        </div>
      </div>

      {/* Real-time Toast Feedback */}
      {toastMessage && (
        <div className="rounded-2xl bg-emerald-500 text-white p-3 text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-[10px] uppercase font-bold opacity-80">WhatsApp Dispatched</span>
        </div>
      )}

      {/* Visual Lifecycle Pipeline Diagram */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px] gap-2 text-xs font-bold">
          <div className="flex-1 text-center p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
            1. NEW PATIENT
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
          <div className="flex-1 text-center p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-800">
            2. CONSULTED
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
          <div className="flex-1 text-center p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-800">
            3. TEST / RX ADVISED
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
          <div className="flex-1 text-center p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
            4. FOLLOW-UP DUE
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
          <div className="flex-1 text-center p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
            5. RE-BOOKED / DONE
          </div>
        </div>
      </div>

      {/* Stage-by-Stage Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stages.map((st) => {
          const items = (followUps || []).filter((f) => f.stage === st.id);

          return (
            <div key={st.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs font-bold text-slate-800">
                <span>{st.label}</span>
                <span className="rounded-full bg-white px-2 py-0.2 text-[10px] shadow-2xs font-mono">
                  {items.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {items.map((fu) => {
                  const pName = fu.patient?.name || fu.patientName || 'Patient';
                  const pPhone = fu.patient?.phone || fu.phone || '';

                  return (
                    <div
                      key={fu.id}
                      className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs space-y-2 text-xs hover:border-orange-300 transition"
                    >
                      <div className="font-bold text-slate-900">{pName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Due: <strong className="text-purple-700">{fu.dueDate}</strong>
                      </div>

                      {fu.notes && <p className="text-[11px] text-slate-600 line-clamp-2 italic">"{fu.notes}"</p>}

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleRealWhatsAppDispatch(fu)}
                          title="Open WhatsApp Chat & Send Reminder"
                          className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>

                        {st.id === 'SCHEDULED' && (
                          <button
                            onClick={() => onUpdateStage(fu.id, 'CALLED')}
                            className="text-[10px] font-bold text-sky-600 hover:underline"
                          >
                            Mark Called →
                          </button>
                        )}

                        {st.id === 'REMINDER_SENT' && (
                          <button
                            onClick={() => onUpdateStage(fu.id, 'CALLED')}
                            className="text-[10px] font-bold text-amber-600 hover:underline"
                          >
                            Call Patient →
                          </button>
                        )}

                        {st.id === 'CALLED' && (
                          <button
                            onClick={() => onUpdateStage(fu.id, 'RE_BOOKED')}
                            className="text-[10px] font-bold text-emerald-600 hover:underline"
                          >
                            Re-Booked →
                          </button>
                        )}

                        {st.id === 'RE_BOOKED' && (
                          <button
                            onClick={() => onUpdateStage(fu.id, 'COMPLETED')}
                            className="text-[10px] font-bold text-slate-600 hover:underline"
                          >
                            Finished ✓
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
