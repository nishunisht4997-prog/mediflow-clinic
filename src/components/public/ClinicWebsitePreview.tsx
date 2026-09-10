'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  Star,
  Award,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  HelpCircle,
  MessageCircle,
} from 'lucide-react';
import { LiveQueueTicker } from '@/components/public/LiveQueueTicker';
import { CLINIC_CONFIG } from '@/config/clinic.config';

interface ClinicWebsitePreviewProps {
  clinicData?: any;
  onBookPublicSlot: (data: any) => Promise<void>;
}

export const ClinicWebsitePreview: React.FC<ClinicWebsitePreviewProps> = ({
  clinicData,
  onBookPublicSlot,
}) => {
  const [selectedBranch, setSelectedBranch] = useState(CLINIC_CONFIG.branches[0]?.name || 'Saheed Nagar Main Branch');
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');
  const [reason, setReason] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenAssigned, setTokenAssigned] = useState<number | null>(null);

  // Live Queue Stats
  const [liveQueueStats, setLiveQueueStats] = useState({
    currentToken: 1,
    waitingCount: 0,
    estimatedWaitMins: 0,
  });

  const fetchLiveQueue = async () => {
    try {
      const res = await fetch('/api/appointments');
      const appts = await res.json();
      if (Array.isArray(appts)) {
        const inConsultation = appts.find((a: any) => a.status === 'IN_CONSULTATION');
        const waiting = appts.filter((a: any) => a.status === 'WAITING');
        const completed = appts.filter((a: any) => a.status === 'COMPLETED');
        
        let tokenNow = 1;
        if (inConsultation) {
          tokenNow = inConsultation.tokenNumber;
        } else if (waiting.length > 0) {
          tokenNow = waiting[0].tokenNumber;
        } else if (completed.length > 0) {
          tokenNow = completed[0].tokenNumber;
        }

        setLiveQueueStats({
          currentToken: tokenNow,
          waitingCount: waiting.length,
          estimatedWaitMins: waiting.length * 12,
        });
      }
    } catch (e) {
      console.error('Error in ClinicWebsitePreview live queue:', e);
    }
  };

  useEffect(() => {
    fetchLiveQueue();
  }, []);

  const treatments = [
    {
      title: 'Kidney Stone Laser Treatment (RIRS / PCNL)',
      desc: 'Minimally invasive laser fragmentation for renal calculi with quick same-day recovery.',
      price: '₹12,000 onwards',
      duration: '45 mins',
      tag: 'Super-Specialty',
    },
    {
      title: 'Prostate Health & Uroflowmetry Clinic',
      desc: 'Digital uroflow assessment, PSA testing, and advanced management of BPH and prostate disorders.',
      price: '₹1,500 consultation + test',
      duration: '30 mins',
      tag: 'Specialist Care',
    },
    {
      title: 'Comprehensive Diabetic Health Checkup',
      desc: 'HbA1c, Fasting Glucose, Kidney Function Test (KFT), Urine Microalbumin, and customized dietary plan.',
      price: '₹1,200 package',
      duration: '45 mins',
      tag: 'Preventive Care',
    },
    {
      title: 'Essential Hypertension & Cardiac Risk Screening',
      desc: '12-Lead Diagnostic ECG, Lipid Profile, BP holter monitoring, and vascular evaluation.',
      price: '₹950 package',
      duration: '20 mins',
      tag: 'Routine OPD',
    },
  ];

  const testimonials = [
    {
      name: 'Prakash Chandra Mohanty',
      rating: 5,
      date: '18 Aug 2026',
      treatment: 'Kidney Stone Management',
      text: `${CLINIC_CONFIG.doctorName} explained the treatment procedure clearly. Pain was gone within 24 hours. The WhatsApp prescription and digital appointment system is super convenient.`,
    },
    {
      name: 'Snigdha Patnaik',
      rating: 5,
      date: '10 Aug 2026',
      treatment: 'Hypertension Protocol',
      text: 'Very polite doctor. Front desk Priya helped us get our token immediately. Highly recommend ABC Polyclinic Saheed Nagar.',
    },
  ];

  const faqs = [
    {
      q: 'Do I need prior registration before visiting the clinic?',
      a: 'You can book your online token slot directly through this website or walk in at our Saheed Nagar / Cuttack reception desk.',
    },
    {
      q: 'Will I receive my prescription on WhatsApp?',
      a: 'Yes! Immediately after your consultation, a verified digital prescription PDF will be sent to your registered WhatsApp mobile number.',
    },
    {
      q: 'What payment modes are accepted at the clinic counter?',
      a: 'We accept all major UPI apps (GPay, PhonePe, Paytm), Cash, Debit/Credit cards, and Net Banking.',
    },
  ];

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !phone) return;

    await onBookPublicSlot({
      patientName,
      phone,
      date: selectedDate,
      timeSlot: selectedSlot,
      chiefComplaint: `${reason} (${selectedBranch})`,
      type: 'Online Booking',
      source: 'ONLINE_PORTAL',
    });

    setTokenAssigned(Math.floor(Math.random() * 5) + 12);
    setIsSuccess(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-900 to-indigo-900 p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-300 border border-sky-400/30 mb-2">
            <Globe className="h-3.5 w-3.5" />
            <span>Geinca Healthcare Growth Suite &bull; Auto-Generated Mini-Site</span>
          </div>
          <h2 className="text-xl font-black">Public Doctor Profile & Online Booking Portal</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Live URL: <code className="bg-black/30 px-2 py-0.5 rounded text-sky-300 font-mono">drpriyabarta.mediflow.in</code>.
            Patients can check live waiting room queue token, explore treatments, and book verified OPD slots.
          </p>
        </div>

        <a
          href="/clinic/dr-priyabarta-clinic"
          target="_blank"
          className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-md hover:bg-slate-100 transition shrink-0"
        >
          <span>Open Public Link</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Website Frame */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-lg overflow-hidden">
        {/* Mock Browser Header Bar */}
        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-rose-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 max-w-md mx-auto bg-white rounded-lg px-3 py-1 text-xs text-slate-600 font-mono text-center border border-slate-200">
            https://drpriyabarta.mediflow.in
          </div>
        </div>

        {/* Website Content */}
        <div className="p-8 space-y-10">
          {/* Live Queue Status Ticker */}
          <LiveQueueTicker
            currentToken={liveQueueStats.currentToken}
            waitingCount={liveQueueStats.waitingCount}
            estimatedWaitMins={liveQueueStats.estimatedWaitMins}
          />

          {/* Hero Doctor Card */}
          <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-slate-100">
            <div className="relative">
              <div className="h-36 w-36 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                <img
                  src={CLINIC_CONFIG.doctorPhoto}
                  alt={CLINIC_CONFIG.doctorName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 rounded-full bg-emerald-500 p-1.5 text-white border-2 border-white">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-2 text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl font-black text-slate-900">{CLINIC_CONFIG.doctorName}</h1>
                <span className="rounded-md bg-sky-100 text-sky-800 text-xs font-bold px-2 py-0.5">
                  Verified Doctor
                </span>
              </div>

              <p className="text-sm font-bold text-sky-700">
                {CLINIC_CONFIG.qualifications} &bull; {CLINIC_CONFIG.experienceYears}+ Years Exp.
              </p>
              <p className="text-xs text-slate-500 max-w-lg">
                {CLINIC_CONFIG.aboutDoctor}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium text-slate-600 pt-2">
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="h-4 w-4 fill-current" /> {CLINIC_CONFIG.rating} ({CLINIC_CONFIG.totalReviews}+ Reviews)
                </span>
                <span className="flex items-center gap-1 font-mono font-bold text-slate-900">
                  Fee: ₹{CLINIC_CONFIG.consultationFee} (Consultation)
                </span>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <ShieldCheck className="h-4 w-4" /> Reg: {CLINIC_CONFIG.regNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Treatments & Specialty Services Catalog */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Specialty Treatments & Diagnostic Services</h2>
                <p className="text-xs text-slate-500">Transparent pricing & expert clinical care</p>
              </div>
              <span className="text-xs font-semibold text-sky-600">4 Core Specialties</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {treatments.map((t, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-2 hover:border-sky-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-xs text-slate-900">{t.title}</h3>
                    <span className="rounded bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 shrink-0">
                      {t.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{t.desc}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs font-bold">
                    <span className="text-slate-800">{t.price}</span>
                    <span className="text-slate-400 font-normal">Approx {t.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2-Column: Locations + Online Booking Stepper Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
            {/* Clinic Locations */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-sky-600" />
                <span>Clinic Branches & OPD Timings</span>
              </h3>

              <div className="space-y-3">
                <div
                  onClick={() => setSelectedBranch('Saheed Nagar Main Polyclinic')}
                  className={`rounded-2xl border p-4 space-y-2 cursor-pointer transition ${
                    selectedBranch === 'Saheed Nagar Main Polyclinic'
                      ? 'border-sky-500 bg-sky-50/50 shadow-xs'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs text-slate-900">
                    <span>1. Saheed Nagar Main Polyclinic</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] text-emerald-800 font-bold">
                      Main Hub
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Plot 104, Janpath Road, Saheed Nagar, Bhubaneswar</p>
                  <div className="text-xs text-sky-700 font-medium flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Mon – Sat: 09:00 AM – 01:00 PM &bull; 05:00 PM – 08:30 PM</span>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedBranch('CDA Sector 9 Branch (Cuttack)')}
                  className={`rounded-2xl border p-4 space-y-2 cursor-pointer transition ${
                    selectedBranch === 'CDA Sector 9 Branch (Cuttack)'
                      ? 'border-sky-500 bg-sky-50/50 shadow-xs'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs text-slate-900">
                    <span>2. CDA Sector 9 Branch (Cuttack)</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.2 text-[10px] text-slate-600 font-bold">
                      Branch 2
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Plot 24, Near High Court Road, CDA Sector 9, Cuttack</p>
                  <div className="text-xs text-sky-700 font-medium flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Tue, Thu, Sun: 03:00 PM – 05:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instant Online Booking Form */}
            <div className="rounded-3xl border-2 border-sky-500 bg-sky-50/30 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-sky-600" />
                  <h3 className="text-base font-bold text-slate-900">Book Instant Appointment</h3>
                </div>
                <span className="text-xs font-bold text-sky-700">Branch: {selectedBranch.split(' ')[0]}</span>
              </div>

              {isSuccess ? (
                <div className="rounded-2xl bg-emerald-100 p-6 text-center text-emerald-900 space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold">Appointment Confirmed!</h4>
                  <p className="text-xs">
                    Your appointment with {CLINIC_CONFIG.doctorShortName} is booked for <strong>{selectedDate} ({selectedSlot})</strong>.
                  </p>
                  <div className="text-sm font-black text-emerald-800 font-mono">
                    Assigned Token #{tokenAssigned}
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Confirmation & directions sent to WhatsApp {phone}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBook} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700">Your Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Manas Ranjan Sahoo"
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
                      <label className="font-semibold text-slate-700">Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2 font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700">Time Slot</label>
                      <select
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2 font-bold"
                      >
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
                    <label className="font-semibold text-slate-700">Reason for Visit</label>
                    <input
                      type="text"
                      placeholder="e.g. Kidney stone review, Fever"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-sky-600 py-3 text-xs font-bold text-white shadow-md shadow-sky-600/30 hover:bg-sky-700 transition"
                  >
                    Confirm Booking (Token Issued)
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Testimonials */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Verified Patient Reviews</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {testimonials.map((t, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900">{t.name}</div>
                    <div className="flex items-center text-amber-500">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold">{t.treatment} &bull; {t.date}</div>
                  <p className="text-slate-600 italic">"{t.text}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="h-5 w-5 text-sky-600" />
              <span>Frequently Asked Questions</span>
            </h3>
            <div className="space-y-2">
              {faqs.map((f, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 p-3.5 bg-white text-xs space-y-1">
                  <div className="font-bold text-slate-900">{f.q}</div>
                  <p className="text-slate-600 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
