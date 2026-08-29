'use client';

import React, { useState } from 'react';
import { Calendar, X, Clock, User, Phone, Sparkles } from 'lucide-react';

interface AppointmentBookingModalProps {
  patients: any[];
  initialPatientId?: string | null;
  onClose: () => void;
  onBook: (bookingData: any) => Promise<void>;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  patients,
  initialPatientId,
  onClose,
  onBook,
}) => {
  const [patientMode, setPatientMode] = useState<'existing' | 'walkin'>('existing');
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || patients[0]?.id || '');
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('+91 ');
  const [walkinAge, setWalkinAge] = useState('35');
  const [walkinGender, setWalkinGender] = useState('Male');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('11:00 AM');
  const [type, setType] = useState('Consultation');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (patientMode === 'existing') {
        await onBook({
          patientId: selectedPatientId,
          date,
          timeSlot,
          type,
          chiefComplaint,
          status: 'WAITING',
          source: 'RECEPTION',
        });
      } else {
        await onBook({
          patientName: walkinName,
          phone: walkinPhone,
          age: walkinAge,
          gender: walkinGender,
          date,
          timeSlot,
          type: 'Walk-in',
          chiefComplaint,
          status: 'WAITING',
          source: 'WALKIN',
        });
      }
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Calendar className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-900">Book OPD Appointment / Walk-In</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl font-bold">
            <button
              type="button"
              onClick={() => setPatientMode('existing')}
              className={`py-1.5 rounded-lg transition ${
                patientMode === 'existing' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Existing Patient
            </button>
            <button
              type="button"
              onClick={() => setPatientMode('walkin')}
              className={`py-1.5 rounded-lg transition ${
                patientMode === 'walkin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Quick Walk-In Patient
            </button>
          </div>

          {patientMode === 'existing' ? (
            <div>
              <label className="font-semibold text-slate-700">Select Patient *</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold focus:border-emerald-500 focus:outline-hidden"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.uhid}) - {p.phone}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Walk-In Patient Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Chandra"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700">Mobile</label>
                  <input
                    type="text"
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Age</label>
                  <input
                    type="number"
                    value={walkinAge}
                    onChange={(e) => setWalkinAge(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700">Time Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-bold"
              >
                <option value="09:30 AM">09:30 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="10:30 AM">10:30 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="05:00 PM">05:00 PM</option>
                <option value="05:30 PM">05:30 PM</option>
                <option value="06:00 PM">06:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700">Consultation Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium"
            >
              <option value="Consultation">General Consultation</option>
              <option value="Follow-up">Follow-up Review</option>
              <option value="New Patient">New Patient First Visit</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700">Chief Complaint / Reason</label>
            <input
              type="text"
              placeholder="e.g. Abdominal pain, Routine checkup"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 p-2"
            />
          </div>

          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
            <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Automatic Token number and WhatsApp confirmation will be generated.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
            >
              {isSubmitting ? 'Booking...' : 'Book & Assign Token'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
