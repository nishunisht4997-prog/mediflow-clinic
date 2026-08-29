import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        vitals: { orderBy: { recordedAt: 'desc' } },
        documents: { orderBy: { uploadedAt: 'desc' } },
        appointments: {
          include: { doctor: { include: { user: true } } },
          orderBy: { date: 'desc' },
        },
        prescriptions: {
          include: {
            items: true,
            doctor: { include: { user: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          include: { items: true, payments: true },
          orderBy: { createdAt: 'desc' },
        },
        followUps: {
          orderBy: { dueDate: 'desc' },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Generate Chronological Timeline events
    const timeline: any[] = [];

    patient.appointments.forEach((appt) => {
      timeline.push({
        id: `appt-${appt.id}`,
        type: 'APPOINTMENT',
        title: `Appointment: ${appt.type}`,
        subtitle: `With ${appt.doctor.user.name} (${appt.timeSlot})`,
        date: appt.date,
        status: appt.status,
        details: appt.chiefComplaint || 'Routine consultation',
        timestamp: new Date(appt.date).getTime(),
      });
    });

    patient.prescriptions.forEach((rx) => {
      timeline.push({
        id: `rx-${rx.id}`,
        type: 'PRESCRIPTION',
        title: `Diagnosis: ${rx.diagnosis}`,
        subtitle: `${rx.items.length} Medicines Prescribed`,
        date: rx.createdAt.toISOString().split('T')[0],
        status: rx.whatsappSent ? 'Sent to WhatsApp' : 'Generated',
        items: rx.items,
        advice: rx.advice,
        investigationsAdvised: rx.investigationsAdvised,
        timestamp: new Date(rx.createdAt).getTime(),
      });
    });

    patient.documents.forEach((doc) => {
      timeline.push({
        id: `doc-${doc.id}`,
        type: 'DOCUMENT',
        title: doc.title,
        subtitle: `${doc.category} (${doc.fileSize || 'PDF'})`,
        date: doc.uploadedAt.toISOString().split('T')[0],
        status: 'Uploaded',
        fileUrl: doc.fileUrl,
        timestamp: new Date(doc.uploadedAt).getTime(),
      });
    });

    patient.invoices.forEach((inv) => {
      timeline.push({
        id: `inv-${inv.id}`,
        type: 'INVOICE',
        title: `Invoice ${inv.invoiceNumber}`,
        subtitle: `Total: ₹${inv.totalAmount} | Paid: ₹${inv.paidAmount}`,
        date: inv.createdAt.toISOString().split('T')[0],
        status: inv.paymentStatus,
        items: inv.items,
        timestamp: new Date(inv.createdAt).getTime(),
      });
    });

    patient.followUps.forEach((fu) => {
      timeline.push({
        id: `fu-${fu.id}`,
        type: 'FOLLOW_UP',
        title: `Follow-up (${fu.stage})`,
        subtitle: fu.notes || 'Scheduled Follow-up check',
        date: fu.dueDate,
        status: fu.stage,
        timestamp: new Date(fu.dueDate).getTime(),
      });
    });

    // Sort timeline chronologically descending
    timeline.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      ...patient,
      timeline,
    });
  } catch (error: any) {
    console.error('Error fetching patient 360:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.patient.update({
      where: { id },
      data: {
        name: body.name,
        age: body.age ? parseInt(body.age, 10) : undefined,
        gender: body.gender,
        phone: body.phone,
        email: body.email,
        bloodGroup: body.bloodGroup,
        allergies: body.allergies,
        medicalHistory: body.medicalHistory,
        surgeriesHistory: body.surgeriesHistory,
        currentMedications: body.currentMedications,
        address: body.address,
        emergencyContact: body.emergencyContact,
        notes: body.notes,
      },
    });

    // If vitals are passed in PATCH, record a new PatientVital entry
    if (body.bpSystolic || body.pulse || body.temperature || body.spo2 || body.weight) {
      await prisma.patientVital.create({
        data: {
          patientId: id,
          bpSystolic: body.bpSystolic ? parseInt(body.bpSystolic, 10) : null,
          bpDiastolic: body.bpDiastolic ? parseInt(body.bpDiastolic, 10) : null,
          pulse: body.pulse ? parseInt(body.pulse, 10) : null,
          temperature: body.temperature ? parseFloat(body.temperature) : null,
          spo2: body.spo2 ? parseInt(body.spo2, 10) : null,
          weight: body.weight ? parseFloat(body.weight) : null,
          height: body.height ? parseFloat(body.height) : null,
          bmi: body.weight && body.height ? parseFloat((body.weight / ((body.height / 100) ** 2)).toFixed(1)) : null,
          recordedBy: body.recordedBy || 'Nurse Snigdha',
        },
      });
    }

    const patientWithUpdatedVitals = await prisma.patient.findUnique({
      where: { id },
      include: {
        vitals: { orderBy: { recordedAt: 'desc' } },
        documents: true,
        prescriptions: { include: { items: true } },
        invoices: true,
      },
    });

    return NextResponse.json(patientWithUpdatedVitals || updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
