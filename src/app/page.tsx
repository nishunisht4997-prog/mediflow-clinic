'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, NavTab } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { DoctorDashboard } from '@/components/dashboard/DoctorDashboard';
import { PatientListAndTimeline } from '@/components/patients/PatientListAndTimeline';
import { PatientRegistrationModal } from '@/components/patients/PatientRegistrationModal';
import { AppointmentsQueueView } from '@/components/appointments/AppointmentsQueueView';
import { AppointmentBookingModal } from '@/components/appointments/AppointmentBookingModal';
import { DigitalPrescriptionMaker } from '@/components/prescription/DigitalPrescriptionMaker';
import { PrescriptionPdfPreview } from '@/components/prescription/PrescriptionPdfPreview';
import { BillingInvoicesView } from '@/components/billing/BillingInvoicesView';
import { BillingModal } from '@/components/billing/BillingModal';
import { ThermalReceiptModal } from '@/components/billing/ThermalReceiptModal';
import { DynamicUpiQrModal } from '@/components/billing/DynamicUpiQrModal';
import { DailyCashDrawerModal } from '@/components/billing/DailyCashDrawerModal';
import { StaffAttendanceManager } from '@/components/staff/StaffAttendanceManager';
import { ClinicWorkBoard } from '@/components/tasks/ClinicWorkBoard';
import { FollowUpCRM } from '@/components/followup/FollowUpCRM';
import { WhatsAppHub } from '@/components/whatsapp/WhatsAppHub';
import { ClinicWebsitePreview } from '@/components/public/ClinicWebsitePreview';
import { PatientPortalView } from '@/components/portal/PatientPortalView';
import { UserRole } from '@/types';
import { CLINIC_CONFIG } from '@/config/clinic.config';
import { ClinicBroadcast } from '@/lib/broadcast';

export default function MediFlowApp() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('DOCTOR');
  const [selectedBranch, setSelectedBranch] = useState('Saheed Nagar Main Branch');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // App Data States
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [billingStats, setBillingStats] = useState<any>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [whatsappLogs, setWhatsappLogs] = useState<any[]>([]);

  // Modals States
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [showNewBillModal, setShowNewBillModal] = useState(false);
  const [selectedThermalInvoice, setSelectedThermalInvoice] = useState<any | null>(null);
  const [selectedPaymentInvoice, setSelectedPaymentInvoice] = useState<any | null>(null);
  const [showCashDrawerModal, setShowCashDrawerModal] = useState(false);
  const [viewPdfRx, setViewPdfRx] = useState<any | null>(null);
  const [activeConsultationAppt, setActiveConsultationAppt] = useState<any | null>(null);

  // Fetch all initial data
  const loadAllData = async () => {
    try {
      const [
        dashRes,
        patientsRes,
        apptsRes,
        tplRes,
        billRes,
        staffRes,
        tasksRes,
        fuRes,
        waRes,
      ] = await Promise.all([
        fetch('/api/dashboard/stats').then((r) => r.json()),
        fetch('/api/patients').then((r) => r.json()),
        fetch('/api/appointments').then((r) => r.json()),
        fetch('/api/templates').then((r) => r.json()),
        fetch('/api/billing').then((r) => r.json()),
        fetch('/api/staff').then((r) => r.json()),
        fetch('/api/tasks').then((r) => r.json()),
        fetch('/api/followups').then((r) => r.json()),
        fetch('/api/whatsapp/send').then((r) => r.json()),
      ]);

      setDashboardData(dashRes);
      if (Array.isArray(patientsRes)) {
        setPatients(patientsRes);
        if (patientsRes.length > 0 && !selectedPatientId) {
          setSelectedPatientId(patientsRes[0].id);
        }
      }
      if (Array.isArray(apptsRes)) setAppointments(apptsRes);
      if (Array.isArray(tplRes)) setTemplates(tplRes);
      if (billRes?.invoices) {
        setInvoices(billRes.invoices);
        setBillingStats(billRes.stats);
      }
      if (Array.isArray(staffRes)) setStaffList(staffRes);
      if (Array.isArray(tasksRes)) setTasks(tasksRes);
      if (Array.isArray(fuRes)) setFollowUps(fuRes);
      if (Array.isArray(waRes)) setWhatsappLogs(waRes);
    } catch (e) {
      console.error('Error loading MediFlow data:', e);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers
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
    await loadAllData();
    setSelectedPatientId(created.id);
    setActiveTab('patients');
  };

  const handleBookAppointment = async (bookingData: any) => {
    await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    await loadAllData();
    setActiveTab('appointments');
  };

  const handleUpdateAppointmentStatus = async (id: string, status: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await loadAllData();
  };

  const handleStartConsultation = (appointment: any) => {
    setActiveConsultationAppt(appointment);
    setSelectedPatientId(appointment.patient.id);
    setActiveTab('prescriptions');
  };

  const handleSavePrescription = async (prescriptionData: any) => {
    const payload = {
      ...prescriptionData,
      appointmentId: activeConsultationAppt?.id || null,
    };

    const res = await fetch('/api/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const created = await res.json();

    // 🚀 REAL-TIME BROADCAST: Notify Accountant & Reception that Rx is ready
    ClinicBroadcast.publish({
      type: 'PRESCRIPTION_GENERATED',
      title: `Rx Generated: ${created.patient?.name || 'Patient'}`,
      message: `Digital Rx for "${created.diagnosis}" saved. Ready for pharmacy & discharge.`,
      sourceRole: 'DOCTOR',
      targetRoles: ['ACCOUNTANT', 'RECEPTIONIST'],
      data: {
        patientId: created.patientId,
        patientName: created.patient?.name,
        diagnosis: created.diagnosis,
      },
    });

    await loadAllData();
    return created;
  };

  const handleSaveCustomTemplate = async (templateData: any) => {
    await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateData),
    });
    await loadAllData();
    alert(`Protocol "${templateData.title}" saved to library!`);
  };

  const handleGenerateInvoice = async (invoiceData: any) => {
    await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData),
    });
    await loadAllData();
    setActiveTab('billing');
  };

  const handleConfirmPayment = async (invoiceId: string, amount: number) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    await fetch('/api/billing/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId,
        amount,
        method: 'UPI',
        recordedBy: 'Rajesh Behera (POS Cashier)',
      }),
    });

    // 🚀 REAL-TIME BROADCAST: Notify Doctor & Reception
    ClinicBroadcast.publish({
      type: 'PAYMENT_COLLECTED',
      title: `Fee Collected: ₹${amount} Paid`,
      message: `${inv?.patient?.name || 'Patient'} paid fee of ₹${amount}. Patient cleared for doctor cabin.`,
      sourceRole: 'ACCOUNTANT',
      targetRoles: ['DOCTOR', 'RECEPTIONIST', 'NURSE'],
      data: {
        patientId: inv?.patientId,
        patientName: inv?.patient?.name,
        amount,
        invoiceId,
      },
    });

    await loadAllData();
    setSelectedPaymentInvoice(null);
  };

  const handleNotificationAction = (type: string, data: any) => {
    if (type === 'COLLECT_FEE') {
      setSelectedPaymentInvoice({
        id: `fee-${Date.now()}`,
        totalAmount: data.amount || CLINIC_CONFIG.consultationFee,
        paidAmount: 0,
        patient: { name: data.patientName || 'Walk-In Patient', uhid: `Token #${data.tokenNumber || 'Queue'}` },
        invoiceNumber: `FEE-${data.tokenNumber || 'OPD'}`,
      });
    } else if (type === 'START_CONSULTATION') {
      if (data.patientId) {
        setSelectedPatientId(data.patientId);
      }
      setActiveTab('prescriptions');
    } else if (type === 'VIEW_VITALS') {
      if (data.patientId) {
        setSelectedPatientId(data.patientId);
      }
      setActiveTab('patients');
    } else if (type === 'VIEW_RX') {
      setActiveTab('billing');
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* 1. Global Responsive Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        badgeCounts={{
          waitingAppointments: appointments.filter((a) => a.status === 'WAITING').length || 4,
          pendingTasks: tasks.filter((t) => t.status === 'PENDING').length || 5,
          dueFollowUps: followUps.length || 7,
        }}
      />

      {/* 2. Main Content View Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewPatient={() => setShowNewPatientModal(true)}
          onOpenNewAppointment={() => setShowNewAppointmentModal(true)}
          onOpenNewPrescription={() => {
            setActiveConsultationAppt(null);
            setActiveTab('prescriptions');
          }}
          onOpenQuickSearch={() => setActiveTab('patients')}
          onNotificationAction={handleNotificationAction}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
          {/* TAB 1: DOCTOR DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DoctorDashboard
              data={dashboardData}
              currentRole={currentRole}
              selectedBranch={selectedBranch}
              onStartConsultation={handleStartConsultation}
              onOpenPatientProfile={(pId) => {
                handleSelectPatient(pId);
                setActiveTab('patients');
              }}
              onOpenNewAppointment={() => setShowNewAppointmentModal(true)}
              onOpenNewPatient={() => setShowNewPatientModal(true)}
              onOpenNewPrescription={() => {
                setActiveConsultationAppt(null);
                setActiveTab('prescriptions');
              }}
              onOpenNewBill={() => setShowNewBillModal(true)}
              onOpenWhatsAppSimulator={(msg) => setActiveTab('whatsapp')}
            />
          )}

          {/* TAB 2: PATIENT 360 CRM & TIMELINE */}
          {activeTab === 'patients' && (
            <PatientListAndTimeline
              patients={patients}
              selectedPatientId={selectedPatientId}
              onSelectPatient={handleSelectPatient}
              onOpenNewPatient={() => setShowNewPatientModal(true)}
              onOpenNewPrescriptionForPatient={(p) => {
                setSelectedPatientId(p.id);
                setActiveTab('prescriptions');
              }}
              onOpenNewAppointmentForPatient={(p) => {
                setSelectedPatientId(p.id);
                setShowNewAppointmentModal(true);
              }}
              onOpenNewBillForPatient={(p) => {
                setSelectedPatientId(p.id);
                setShowNewBillModal(true);
              }}
              onViewPrescriptionPdf={(rx) => setViewPdfRx(rx)}
            />
          )}

          {/* TAB 3: APPOINTMENTS & LIVE QUEUE */}
          {activeTab === 'appointments' && (
            <AppointmentsQueueView
              appointments={appointments}
              onOpenNewBooking={() => setShowNewAppointmentModal(true)}
              onUpdateStatus={handleUpdateAppointmentStatus}
              onStartConsultation={handleStartConsultation}
              onSendWhatsAppReminder={(item) => {}}
            />
          )}

          {/* TAB 4: DIGITAL PRESCRIPTION STUDIO */}
          {activeTab === 'prescriptions' && (
            <DigitalPrescriptionMaker
              patients={patients}
              initialPatientId={selectedPatientId}
              templates={templates}
              onSavePrescription={handleSavePrescription}
              onViewPdf={(rx) => setViewPdfRx(rx)}
              onSaveCustomTemplate={handleSaveCustomTemplate}
            />
          )}

          {/* TAB 5: BILLING & INVOICING */}
          {activeTab === 'billing' && (
            <BillingInvoicesView
              invoices={invoices}
              stats={billingStats}
              onOpenNewBill={() => setShowNewBillModal(true)}
              onRecordPayment={(inv) => setSelectedPaymentInvoice(inv)}
              onPrintInvoice={(inv) => setSelectedThermalInvoice(inv)}
            />
          )}

          {/* TAB 6: STAFF & ATTENDANCE */}
          {activeTab === 'staff' && (
            <StaffAttendanceManager
              staffList={staffList}
              onCheckIn={async (userId, status) => {
                await fetch('/api/staff', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId, status }),
                });
                await loadAllData();
              }}
            />
          )}

          {/* TAB 7: CLINIC WORK BOARD */}
          {activeTab === 'tasks' && (
            <ClinicWorkBoard
              tasks={tasks}
              staffList={staffList}
              patients={patients}
              onCreateTask={async (taskData) => {
                await fetch('/api/tasks', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(taskData),
                });
                await loadAllData();
              }}
              onUpdateTaskStatus={async (id, status) => {
                await fetch(`/api/tasks/${id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status }),
                });
                await loadAllData();
              }}
              onDeleteTask={async (id) => {
                await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
                await loadAllData();
              }}
            />
          )}

          {/* TAB 8: FOLLOW-UP CRM PIPELINE */}
          {activeTab === 'followups' && (
            <FollowUpCRM
              followUps={followUps}
              onUpdateStage={async (id, stage) => {
                await fetch(`/api/followups/${id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ stage, lastContactedAt: true }),
                });
                await loadAllData();
              }}
              onSendWhatsAppFollowUp={async (fu) => {
                await fetch('/api/whatsapp/send', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    recipientName: fu.patient.name,
                    recipientPhone: fu.patient.phone,
                    content: `Hello ${fu.patient.name}, ${CLINIC_CONFIG.doctorShortName} has advised a follow-up review.`,
                    type: 'FOLLOW_UP',
                  }),
                });
              }}
            />
          )}

          {/* TAB 9: WHATSAPP DISPATCHER */}
          {activeTab === 'whatsapp' && (
            <WhatsAppHub
              logs={whatsappLogs}
              onSendCustomMessage={async (name, phone, content, type, customConfig) => {
                const res = await fetch('/api/whatsapp/send', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ recipientName: name, recipientPhone: phone, content, type, customConfig }),
                });
                await loadAllData();
                return await res.json();
              }}
            />
          )}

          {/* TAB 10: CLINIC MINI-WEBSITE PREVIEW */}
          {activeTab === 'website' && (
            <ClinicWebsitePreview
              clinicData={dashboardData?.clinic}
              onBookPublicSlot={handleBookAppointment}
            />
          )}

          {/* TAB 11: PATIENT HEALTH PORTAL */}
          {activeTab === 'portal' && (
            <PatientPortalView
              patients={patients}
              onViewPrescriptionPdf={(rx) => setViewPdfRx(rx)}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* MODALS */}
      {showNewPatientModal && (
        <PatientRegistrationModal
          onClose={() => setShowNewPatientModal(false)}
          onRegister={handleRegisterPatient}
        />
      )}

      {showNewAppointmentModal && (
        <AppointmentBookingModal
          patients={patients}
          initialPatientId={selectedPatientId}
          onClose={() => setShowNewAppointmentModal(false)}
          onBook={handleBookAppointment}
        />
      )}

      {showNewBillModal && (
        <BillingModal
          patients={patients}
          initialPatientId={selectedPatientId}
          onClose={() => setShowNewBillModal(false)}
          onGenerateInvoice={handleGenerateInvoice}
        />
      )}

      {viewPdfRx && (
        <PrescriptionPdfPreview
          prescription={viewPdfRx}
          onClose={() => setViewPdfRx(null)}
        />
      )}

      {/* 80mm POS Thermal Slip Modal */}
      {selectedThermalInvoice && (
        <ThermalReceiptModal
          invoice={selectedThermalInvoice}
          onClose={() => setSelectedThermalInvoice(null)}
        />
      )}

      {/* Dynamic UPI QR Payment Modal */}
      {selectedPaymentInvoice && (
        <DynamicUpiQrModal
          invoice={selectedPaymentInvoice}
          onClose={() => setSelectedPaymentInvoice(null)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      {/* Day-End Cash Drawer Modal */}
      {showCashDrawerModal && (
        <DailyCashDrawerModal
          stats={billingStats}
          invoices={invoices}
          onClose={() => setShowCashDrawerModal(false)}
        />
      )}
    </div>
  );
}
