'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { PatientListAndTimeline } from '@/components/patients/PatientListAndTimeline';
import { PatientRegistrationModal } from '@/components/patients/PatientRegistrationModal';
import { PrescriptionPdfPreview } from '@/components/prescription/PrescriptionPdfPreview';
import { AppointmentBookingModal } from '@/components/appointments/AppointmentBookingModal';
import { BillingModal } from '@/components/billing/BillingModal';

export default function PatientsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [showRegModal, setShowRegModal] = useState(false);
  const [showApptModal, setShowApptModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [viewPdfRx, setViewPdfRx] = useState<any | null>(null);

  const loadData = async () => {
    try {
      const res = await fetch('/api/patients');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPatients(data);
        if (data.length > 0 && !selectedPatientId) {
          setSelectedPatientId(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectPatient = async (id: string) => {
    setSelectedPatientId(id);
    try {
      const res = await fetch(`/api/patients/${id}`);
      const full = await res.json();
      setPatients((prev) => prev.map((p) => (p.id === id ? full : p)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegisterPatient = async (patientData: any) => {
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData),
    });
    const created = await res.json();
    await loadData();
    setSelectedPatientId(created.id);
    setShowRegModal(false);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar
        activeTab="patients"
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar
          currentRole="DOCTOR"
          setCurrentRole={() => {}}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewPatient={() => setShowRegModal(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
          <PatientListAndTimeline
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={handleSelectPatient}
            onOpenNewPatient={() => setShowRegModal(true)}
            onOpenNewPrescriptionForPatient={(p) => {
              window.location.href = `/prescriptions?patientId=${p.id}`;
            }}
            onOpenNewAppointmentForPatient={(p) => {
              setSelectedPatientId(p.id);
              setShowApptModal(true);
            }}
            onOpenNewBillForPatient={(p) => {
              setSelectedPatientId(p.id);
              setShowBillModal(true);
            }}
            onViewPrescriptionPdf={(rx) => setViewPdfRx(rx)}
          />
        </main>
      </div>

      <MobileBottomNav />

      {showRegModal && (
        <PatientRegistrationModal
          onClose={() => setShowRegModal(false)}
          onRegister={handleRegisterPatient}
        />
      )}

      {showApptModal && (
        <AppointmentBookingModal
          patients={patients}
          initialPatientId={selectedPatientId}
          onClose={() => setShowApptModal(false)}
          onBook={async (data) => {
            await fetch('/api/appointments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            setShowApptModal(false);
          }}
        />
      )}

      {showBillModal && (
        <BillingModal
          patients={patients}
          initialPatientId={selectedPatientId}
          onClose={() => setShowBillModal(false)}
          onGenerateInvoice={async (data) => {
            await fetch('/api/billing', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            setShowBillModal(false);
          }}
        />
      )}

      {viewPdfRx && (
        <PrescriptionPdfPreview
          prescription={viewPdfRx}
          onClose={() => setViewPdfRx(null)}
        />
      )}
    </div>
  );
}
