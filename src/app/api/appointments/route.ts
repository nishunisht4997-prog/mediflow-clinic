import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const status = searchParams.get('status');

    const clinic = await prisma.clinic.findFirst();
    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    const where: any = {
      clinicId: clinic.id,
      date,
    };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        doctor: { include: { user: true } },
        prescription: true,
        invoices: true,
      },
      orderBy: { tokenNumber: 'asc' },
    });

    return NextResponse.json(appointments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const clinic = await prisma.clinic.findFirst({
      include: { doctors: true, branches: true }
    });
    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    const doctor = clinic.doctors[0];
    const branch = clinic.branches[0];
    const targetDate = body.date || new Date().toISOString().split('T')[0];

    // Compute Next Token number for that date
    const countToday = await prisma.appointment.count({
      where: { clinicId: clinic.id, date: targetDate },
    });
    const tokenNumber = countToday + 1;

    let patientId = body.patientId;

    // If walk-in patient registration is included inline
    if (!patientId && body.patientName) {
      const patientCount = await prisma.patient.count({ where: { clinicId: clinic.id } });
      const uhid = `MF-2026-${String(patientCount + 1).padStart(4, '0')}`;
      const newPatient = await prisma.patient.create({
        data: {
          clinicId: clinic.id,
          uhid,
          name: body.patientName,
          age: parseInt(body.age, 10) || 30,
          gender: body.gender || 'Male',
          phone: body.phone || '+91 99999 00000',
        }
      });
      patientId = newPatient.id;
    }

    const appointment = await prisma.appointment.create({
      data: {
        clinicId: clinic.id,
        branchId: branch?.id || null,
        doctorId: body.doctorId || doctor.id,
        patientId,
        tokenNumber,
        date: targetDate,
        timeSlot: body.timeSlot || '10:00 AM',
        type: body.type || 'Consultation',
        status: body.status || 'WAITING',
        source: body.source || 'RECEPTION',
        chiefComplaint: body.chiefComplaint || null,
      },
      include: {
        patient: true,
        doctor: { include: { user: true } },
      }
    });

    // Create automated notification log
    if (appointment.patient.phone) {
      await prisma.notificationLog.create({
        data: {
          clinicId: clinic.id,
          recipientName: appointment.patient.name,
          recipientPhone: appointment.patient.phone,
          channel: 'WHATSAPP',
          type: 'APPOINTMENT_CONFIRMED',
          content: `Hello ${appointment.patient.name}, your appointment with ${appointment.doctor.user.name} is confirmed for ${appointment.timeSlot} on ${appointment.date}. Token #${appointment.tokenNumber}. Please arrive 10 mins early.`,
          status: 'DELIVERED',
        }
      });
    }

    return NextResponse.json(appointment, { status: 201 });
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
