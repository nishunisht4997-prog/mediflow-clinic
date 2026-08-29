'use client';

import React, { useState } from 'react';
import { UserPlus, X, HeartPulse, AlertTriangle, User } from 'lucide-react';

interface PatientRegistrationModalProps {
  onClose: () => void;
  onRegister: (patientData: any) => Promise<void>;
}

export const PatientRegistrationModal: React.FC<PatientRegistrationModalProps> = ({
  onClose,
  onRegister,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('32');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [address, setAddress] = useState('Bhubaneswar, Odisha');
  const [allergies, setAllergies] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [bpSystolic, setBpSystolic] = useState('120');
  const [bpDiastolic, setBpDiastolic] = useState('80');
  const [pulse, setPulse] = useState('76');
  const [temperature, setTemperature] = useState('98.4');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please provide patient name and phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onRegister({
        name,
        age: parseInt(age, 10) || 30,
        gender,
        phone,
        email,
        bloodGroup,
        address,
        allergies,
        medicalHistory,
        bpSystolic,
        bpDiastolic,
        pulse,
        temperature,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
              <UserPlus className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-900">New Patient Registration (UHID Assigned)</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700">Patient Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Suman Mohapatra"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold focus:border-sky-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700">Mobile Phone *</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-mono font-bold focus:border-sky-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 focus:outline-hidden"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-bold focus:outline-hidden"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          {/* Allergies & Medical History */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="font-semibold text-rose-700 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Known Drug Allergies</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Penicillin, Sulfa"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="mt-1 w-full rounded-xl border border-rose-200 bg-rose-50/40 p-2 text-rose-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700">Medical History</label>
              <input
                type="text"
                placeholder="e.g. Hypertension (2022)"
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Initial Vitals Check */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <HeartPulse className="h-3.5 w-3.5 text-sky-600" />
              <span>Initial OPD Vitals</span>
            </span>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <span className="text-[10px] text-slate-400">BP Sys (mmHg)</span>
                <input
                  type="number"
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-1.5"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">BP Dia (mmHg)</span>
                <input
                  type="number"
                  value={bpDiastolic}
                  onChange={(e) => setBpDiastolic(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-1.5"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Pulse (bpm)</span>
                <input
                  type="number"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-1.5"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Temp (°F)</span>
                <input
                  type="text"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-1.5"
                />
              </div>
            </div>
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
              className="rounded-xl bg-sky-600 px-5 py-2 font-bold text-white hover:bg-sky-700 shadow-md shadow-sky-600/20"
            >
              {isSubmitting ? 'Registering...' : 'Register Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
