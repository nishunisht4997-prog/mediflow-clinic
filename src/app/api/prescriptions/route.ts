import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        diagnosis: body.diagnosis,
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

    // Create prescription items
    if (body.medicines && Array.isArray(body.medicines)) {
      for (const m of body.medicines) {
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
          notes: `Follow-up for ${body.diagnosis}`,
        },
      });
    }

    // If appointment ID was provided, mark appointment as COMPLETED
    if (body.appointmentId) {
      await prisma.appointment.update({
        where: { id: body.appointmentId },
        data: { status: 'COMPLETED' },
      });
    }

    // If WhatsApp requested, log the message
    if (body.sendWhatsApp && prescription.patient.phone) {
      await prisma.notificationLog.create({
        data: {
          clinicId: clinic.id,
          recipientName: prescription.patient.name,
          recipientPhone: prescription.patient.phone,
          channel: 'WHATSAPP',
          type: 'PRESCRIPTION',
          content: `Dear ${prescription.patient.name}, Dr. ${prescription.doctor.user.name} has issued your digital prescription for "${body.diagnosis}". Download Rx PDF: https://mediflow.in/rx/${prescription.id}`,
          status: 'DELIVERED',
        },
      });
    }

    const completeRx = await prisma.prescription.findUnique({
      where: { id: prescription.id },
      include: {
        patient: true,
        doctor: { include: { user: true } },
        items: true,
      },
    });

    return NextResponse.json(completeRx, { status: 201 });
  } catch (error: any) {
    console.error('Error saving prescription:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
