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
} from 'lucide-react';

interface FollowUpCRMProps {
  followUps: any[];
  onUpdateStage: (id: string, newStage: string) => Promise<void>;
  onSendWhatsAppFollowUp: (followUp: any) => void;
}

export const FollowUpCRM: React.FC<FollowUpCRMProps> = ({
  followUps,
  onUpdateStage,
  onSendWhatsAppFollowUp,
}) => {
  const stages = [
    { id: 'SCHEDULED', label: '1. Follow-up Due', color: 'bg-purple-100 text-purple-800' },
    { id: 'REMINDER_SENT', label: '2. WhatsApp Sent', color: 'bg-sky-100 text-sky-800' },
    { id: 'CALLED', label: '3. Receptionist Called', color: 'bg-amber-100 text-amber-800' },
    { id: 'RE_BOOKED', label: '4. Re-Booked Slot', color: 'bg-emerald-100 text-emerald-800' },
    { id: 'COMPLETED', label: '5. Consulted & Done', color: 'bg-slate-100 text-slate-700' },
  ];

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
            Automated follow-up pipeline: Converts discharged patients into returning consultations via WhatsApp reminders & calling lists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-orange-50 border border-orange-200 px-3 py-1.5 text-xs font-bold text-orange-700">
            {followUps.length} Active Patients in Pipeline
          </span>
        </div>
      </div>

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
          const items = followUps.filter((f) => f.stage === st.id);

          return (
            <div key={st.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs font-bold text-slate-800">
                <span>{st.label}</span>
                <span className="rounded-full bg-white px-2 py-0.2 text-[10px] shadow-2xs">
                  {items.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {items.map((fu) => (
                  <div
                    key={fu.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs space-y-2 text-xs"
                  >
                    <div className="font-bold text-slate-900">{fu.patient?.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Due: <strong className="text-purple-700">{fu.dueDate}</strong>
                    </div>

                    {fu.notes && <p className="text-[11px] text-slate-600 line-clamp-2">{fu.notes}</p>}

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        onClick={() => onSendWhatsAppFollowUp(fu)}
                        title="Send WhatsApp Follow-up Reminder"
                        className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-800"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Remind</span>
                      </button>

                      {st.id === 'SCHEDULED' && (
                        <button
                          onClick={() => onUpdateStage(fu.id, 'CALLED')}
                          className="text-[10px] font-bold text-sky-600 hover:underline"
                        >
                          Mark Called →
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
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
