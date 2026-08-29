'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { AppointmentsQueueView } from '@/components/appointments/AppointmentsQueueView';
import { AppointmentBookingModal } from '@/components/appointments/AppointmentBookingModal';

export default function AppointmentsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const loadData = async () => {
    try {
      const [apptsRes, patientsRes] = await Promise.all([
        fetch('/api/appointments').then((r) => r.json()),
        fetch('/api/patients').then((r) => r.json()),
      ]);
      if (Array.isArray(apptsRes)) setAppointments(apptsRes);
      if (Array.isArray(patientsRes)) setPatients(patientsRes);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await loadData();
  };

  const handleBookSlot = async (data: any) => {
    await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await loadData();
    setShowBookingModal(false);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar
        activeTab="appointments"
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar
          currentRole="DOCTOR"
          setCurrentRole={() => {}}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewAppointment={() => setShowBookingModal(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
          <AppointmentsQueueView
            appointments={appointments}
            onOpenNewBooking={() => setShowBookingModal(true)}
            onUpdateStatus={handleUpdateStatus}
            onStartConsultation={(appt) => {
              window.location.href = `/prescriptions?patientId=${appt.patient.id}&appointmentId=${appt.id}`;
            }}
            onSendWhatsAppReminder={async (appt) => {
              await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  recipientName: appt.patient.name,
                  recipientPhone: appt.patient.phone,
                  content: `Dear ${appt.patient.name}, your OPD token #${appt.tokenNumber} is confirmed for ${appt.timeSlot} today.`,
                  type: 'REMINDER',
                }),
              });
            }}
          />
        </main>
      </div>

      <MobileBottomNav />

      {showBookingModal && (
        <AppointmentBookingModal
          patients={patients}
          onClose={() => setShowBookingModal(false)}
          onBook={handleBookSlot}
        />
      )}
    </div>
  );
}
