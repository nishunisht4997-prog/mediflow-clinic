'use client';

import React, { useState } from 'react';
import { UserPlus, X, HeartPulse, AlertTriangle, User, CheckCircle2, Phone, Check } from 'lucide-react';

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
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [address, setAddress] = useState('Bhubaneswar, Odisha');
  const [allergies, setAllergies] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [bpSystolic, setBpSystolic] = useState('120');
  const [bpDiastolic, setBpDiastolic] = useState('80');
  const [pulse, setPulse] = useState('76');
  const [temperature, setTemperature] = useState('98.4');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract pure 10 digits
  const rawDigits = phone.replace(/[^0-9]/g, '');
  const digits10 = rawDigits.startsWith('91') && rawDigits.length > 10 ? rawDigits.slice(2) : rawDigits;
  const isPhoneValid = digits10.length === 10 && /^[6-9]\d{9}$/.test(digits10);

  const handlePhoneChange = (val: string) => {
    // Keep only numbers
    const clean = val.replace(/[^0-9]/g, '');
    const max10 = clean.startsWith('91') && clean.length > 10 ? clean.slice(2, 12) : clean.slice(0, 10);

    if (max10.length > 5) {
      setPhone(`+91 ${max10.slice(0, 5)} ${max10.slice(5)}`);
    } else if (max10.length > 0) {
      setPhone(`+91 ${max10}`);
    } else {
      setPhone('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please provide the patient full name.');
      return;
    }

    if (!isPhoneValid) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onRegister({
        name: name.trim(),
        age: parseInt(age, 10) || 30,
        gender,
        phone: phone.trim() || `+91 ${digits10}`,
        email: email.trim(),
        bloodGroup,
        address: address.trim(),
        allergies: allergies.trim(),
        medicalHistory: medicalHistory.trim(),
        bpSystolic,
        bpDiastolic,
        pulse,
        temperature,
      });
      onClose();
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Failed to register patient. Please check input.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden my-auto border border-slate-100 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-700 font-bold">
              <UserPlus className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">New Patient Registration</h2>
              <p className="text-[10px] text-slate-400">Auto-assigns unique UHID & creates clinical timeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700">Patient Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Suman Mohapatra"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-900 focus:border-sky-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">WhatsApp Mobile *</label>
                {digits10.length > 0 && (
                  <span
                    className={`text-[10px] font-bold flex items-center gap-0.5 ${
                      isPhoneValid ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {isPhoneValid ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span>Valid 10-Digit</span>
                      </>
                    ) : (
                      <span>{digits10.length}/10 digits</span>
                    )}
                  </span>
                )}
              </div>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`mt-1 w-full rounded-xl border p-2.5 font-mono font-bold text-slate-900 focus:outline-hidden transition ${
                  isPhoneValid
                    ? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-500'
                    : digits10.length > 0
                    ? 'border-amber-400 bg-amber-50/20 focus:border-amber-500'
                    : 'border-slate-200 focus:border-sky-500'
                }`}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold focus:border-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold focus:border-sky-500 focus:outline-hidden"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold focus:border-sky-500 focus:outline-hidden"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700">Known Drug Allergies (Critical)</label>
              <input
                type="text"
                placeholder="e.g. Penicillin, Sulfa drugs"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="mt-1 w-full rounded-xl border border-rose-200 bg-rose-50/40 p-2.5 font-bold text-rose-900 focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700">Medical History / Comorbidities</label>
              <input
                type="text"
                placeholder="e.g. Type 2 Diabetes, Hypertension"
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 focus:border-sky-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700">Residential City / Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 focus:border-sky-500 focus:outline-hidden"
            />
          </div>

          {/* Optional Baseline Spot Vitals */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <HeartPulse className="h-4 w-4 text-pink-600" />
              <span>Initial Spot Vitals (Optional)</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <span className="text-[10px] text-slate-500 font-bold">BP Systolic</span>
                <input
                  type="number"
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-1.5 text-center font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold">BP Diastolic</span>
                <input
                  type="number"
                  value={bpDiastolic}
                  onChange={(e) => setBpDiastolic(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-1.5 text-center font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold">Pulse (bpm)</span>
                <input
                  type="number"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-1.5 text-center font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold">Temp (°F)</span>
                <input
                  type="text"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-1.5 text-center font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isPhoneValid}
              className={`rounded-xl px-5 py-2 font-bold text-white shadow-md transition ${
                isPhoneValid
                  ? 'bg-sky-600 shadow-sky-600/30 hover:bg-sky-700 cursor-pointer'
                  : 'bg-slate-400 cursor-not-allowed opacity-70'
              }`}
            >
              {isSubmitting ? 'Registering UHID...' : 'Register Patient & Assign UHID'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
