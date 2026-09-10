import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CLINIC_CONFIG } from '@/config/clinic.config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    const clinic = await prisma.clinic.findFirst();
    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    const where: any = { clinicId: clinic.id };
    if (patientId) where.patientId = patientId;

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        patient: true,
        doctor: { include: { user: true } },
        items: true,
        appointment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(prescriptions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const clinic = await prisma.clinic.findFirst({
      include: { doctors: { include: { user: true } } }
    });
    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    const doctor = clinic.doctors[0];
    const nextFollowUpDate = body.nextFollowUpDays
      ? new Date(Date.now() + body.nextFollowUpDays * 86400000).toISOString().split('T')[0]
      : body.nextFollowUpDate || null;

    const prescription = await prisma.prescription.create({
      data: {
        clinicId: clinic.id,
        appointmentId: body.appointmentId || null,
        patientId: body.patientId,
        doctorId: doctor.id,
        symptoms: body.symptoms || null,
        diagnosis: body.diagnosis || 'General Clinical Consultation',
        advice: body.advice || null,
        investigationsAdvised: body.investigationsAdvised || null,
        nextFollowUpDate,
        pdfGenerated: true,
        whatsappSent: body.sendWhatsApp || false,
      },
      include: {
        patient: true,
        doctor: { include: { user: true } }
      }
    });

    // Create prescription items (support both body.medicines and body.items)
    const medicineList = (body.medicines && Array.isArray(body.medicines))
      ? body.medicines
      : (body.items && Array.isArray(body.items))
      ? body.items
      : [];

    for (const m of medicineList) {
      if (m.medicineName?.trim()) {
        await prisma.prescriptionItem.create({
          data: {
            prescriptionId: prescription.id,
            medicineName: m.medicineName,
            dosage: m.dosage || '500 mg',
            form: m.form || 'Tablet',
            frequency: m.frequency || '1-0-1',
            timing: m.timing || 'After Food',
            durationDays: parseInt(m.durationDays, 10) || 5,
            instructions: m.instructions || null,
          },
        });
      }
    }

    // Auto-create Follow-Up CRM record if next follow-up date exists
    if (nextFollowUpDate) {
      await prisma.followUp.create({
        data: {
          clinicId: clinic.id,
          patientId: body.patientId,
          doctorId: doctor.id,
          prescriptionId: prescription.id,
          dueDate: nextFollowUpDate,
          stage: 'SCHEDULED',
          notes: `Follow-up for ${body.diagnosis || 'Consultation'}`,
        },
      });
    }

    // If appointment ID was provided, mark appointment as COMPLETED
    if (body.appointmentId) {
      try {
        await prisma.appointment.update({
          where: { id: body.appointmentId },
          data: { status: 'COMPLETED' },
        });
      } catch (e) {
        console.warn('Could not update appointment status:', e);
      }
    }

    // If WhatsApp requested, log the message safely
    if (body.sendWhatsApp && prescription.patient?.phone) {
      const docName = prescription.doctor?.user?.name || CLINIC_CONFIG.doctorName;
      await prisma.notificationLog.create({
        data: {
          clinicId: clinic.id,
          recipientName: prescription.patient.name,
          recipientPhone: prescription.patient.phone,
          channel: 'WHATSAPP',
          type: 'PRESCRIPTION',
          content: `Dear ${prescription.patient.name}, Dr. ${docName} has issued your digital prescription for "${prescription.diagnosis}". Download Rx PDF: https://mediflow.in/rx/${prescription.id}`,
          status: 'DELIVERED',
        },
      });
    }

    const completePrescription = await prisma.prescription.findUnique({
      where: { id: prescription.id },
      include: {
        patient: { include: { vitals: true } },
        doctor: { include: { user: true } },
        items: true,
        clinic: true,
      }
    });

    return NextResponse.json(completePrescription, { status: 201 });
  } catch (error: any) {
    console.error('Error creating prescription in Postgres DB:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
