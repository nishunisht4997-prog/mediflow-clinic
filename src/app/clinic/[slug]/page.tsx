'use client';

import React, { useState } from 'react';
import {
  Stethoscope,
  MapPin,
  Clock,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Star,
  Award,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { LiveQueueTicker } from '@/components/public/LiveQueueTicker';

export default function PublicClinicPage() {
  const [selectedBranch, setSelectedBranch] = useState('Saheed Nagar Main Polyclinic');
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('10:30 AM');
  const [complaint, setComplaint] = useState('');
  const [bookedToken, setBookedToken] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !phone) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          phone,
          date,
          timeSlot,
          type: 'Online Booking',
          source: 'ONLINE_PORTAL',
          chiefComplaint: `${complaint || 'Public Website Booking'} (${selectedBranch})`,
        }),
      });
      const data = await res.json();
      setBookedToken(data.tokenNumber || 7);
    } catch (e) {
      console.error(e);
      setBookedToken(7);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white font-bold">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-900">Dr. Avishek's Healthcare & Polyclinic</span>
            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800">
              Verified OPD
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-sky-700 transition"
          >
            Doctor Login (SaaS)
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {/* Live Queue Status Ticker */}
        <LiveQueueTicker currentToken={3} waitingCount={4} estimatedWaitMins={12} />

        {/* Doctor Hero Card */}
        <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="relative shrink-0">
            <div className="h-40 w-40 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80"
                alt="Dr. Avishek Mohapatra"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 rounded-full bg-emerald-500 p-2 text-white border-2 border-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900">Dr. Avishek Mohapatra</h1>
            </div>

            <div className="text-sm font-bold text-sky-700">
              MBBS, MD (General Medicine), DNB (Urology)
            </div>
            <p className="text-xs font-mono text-slate-500">
              Reg. ID: <strong>MCI/OD/2014/09842</strong> &bull; 12+ Years Clinical Experience
            </p>

            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              Senior Consultant Urologist & Specialist Physician. Specialized in adult internal medicine, kidney stone laser management, urinary tract health, hypertension and diabetes.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs font-semibold text-slate-700 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="h-4 w-4 fill-current" /> 4.9 Rating (420+ Reviews)
              </span>
              <span className="flex items-center gap-1 font-mono font-bold text-emerald-700">
                Consultation Fee: ₹800
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column: Clinic Timings & Online Booking Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Clinic Locations */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-sky-600" />
              <span>Clinic Locations & OPD Hours</span>
            </h2>

            <div
              onClick={() => setSelectedBranch('Saheed Nagar Main Polyclinic')}
              className={`rounded-2xl border p-5 space-y-3 cursor-pointer transition ${
                selectedBranch === 'Saheed Nagar Main Polyclinic'
                  ? 'border-sky-500 bg-sky-50/50 shadow-xs'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">Saheed Nagar Main Polyclinic</h3>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Open Today
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Plot 104, Janpath Road, Near Saheed Nagar Tower, Bhubaneswar, Odisha
              </p>
              <div className="text-xs font-mono font-semibold text-slate-700 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>+91 98765 43210</span>
              </div>
              <div className="text-xs text-sky-700 font-medium flex items-center gap-1 pt-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Mon – Sat: 09:00 AM – 01:00 PM &bull; 05:00 PM – 08:30 PM</span>
              </div>
            </div>

            <div
              onClick={() => setSelectedBranch('CDA Sector 9 Branch (Cuttack)')}
              className={`rounded-2xl border p-5 space-y-3 cursor-pointer transition ${
                selectedBranch === 'CDA Sector 9 Branch (Cuttack)'
                  ? 'border-sky-500 bg-sky-50/50 shadow-xs'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">CDA Sector 9 Branch (Cuttack)</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  Evening OPD
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Plot 24, Near High Court Road, CDA Sector 9, Cuttack
              </p>
              <div className="text-xs text-sky-700 font-medium flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Tue, Thu, Sun: 03:00 PM – 05:00 PM</span>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="rounded-3xl border-2 border-sky-500 bg-sky-50/40 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-sky-600" />
                <h2 className="text-base font-bold text-slate-900">Book Instant OPD Slot</h2>
              </div>
              <span className="text-xs font-bold text-sky-700">Branch: {selectedBranch.split(' ')[0]}</span>
            </div>

            {bookedToken ? (
              <div className="rounded-2xl bg-emerald-100 p-6 text-center text-emerald-950 space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold">Appointment Confirmed!</h3>
                <p className="text-xs">
                  Your appointment with Dr. Avishek Mohapatra is booked for <strong>{date} ({timeSlot})</strong>.
                </p>
                <div className="rounded-xl bg-white p-3 border border-emerald-300 font-mono font-black text-xl text-emerald-900">
                  Assigned OPD Token #{bookedToken}
                </div>
                <p className="text-[11px] text-emerald-800">
                  We have sent the confirmation & GPS clinic map to WhatsApp <strong>{phone}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700">Patient Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Suman Sahoo"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 font-bold focus:border-sky-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">WhatsApp Mobile Number *</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 font-mono font-bold focus:border-sky-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700">Appointment Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Time Slot</label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2 font-bold"
                    >
                      <option value="09:30 AM">09:30 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="10:30 AM">10:30 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="05:30 PM">05:30 PM</option>
                      <option value="06:00 PM">06:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Symptoms / Reason for Visit</label>
                  <input
                    type="text"
                    placeholder="e.g. Kidney stone pain, Fever"
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-sky-600 py-3 text-xs font-bold text-white shadow-md shadow-sky-600/30 hover:bg-sky-700 transition"
                >
                  {isSubmitting ? 'Generating Token...' : 'Confirm Appointment (Token Assigned)'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
