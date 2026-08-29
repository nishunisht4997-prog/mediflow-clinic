import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || '';

    const clinic = await prisma.clinic.findFirst();
    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    const patients = await prisma.patient.findMany({
      where: {
        clinicId: clinic.id,
        OR: [
          { name: { contains: search } },
          { uhid: { contains: search } },
          { phone: { contains: search } },
        ],
      },
      include: {
        vitals: { orderBy: { recordedAt: 'desc' } },
        appointments: { orderBy: { createdAt: 'desc' } },
        prescriptions: {
          include: { items: true, doctor: { include: { user: true } } },
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          include: { items: true, payments: true },
          orderBy: { createdAt: 'desc' },
        },
        documents: { orderBy: { uploadedAt: 'desc' } },
        followUps: { orderBy: { dueDate: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(patients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    // Generate UHID (e.g. MF-2026-0007)
    const patientCount = await prisma.patient.count({ where: { clinicId: clinic.id } });
    const uhid = `MF-2026-${String(patientCount + 1).padStart(4, '0')}`;

    const newPatient = await prisma.patient.create({
      data: {
        clinicId: clinic.id,
        uhid,
        name: body.name,
        dob: body.dob || null,
        age: parseInt(body.age, 10) || 30,
        gender: body.gender || 'Male',
        phone: body.phone,
        email: body.email || null,
        bloodGroup: body.bloodGroup || null,
        address: body.address || null,
        emergencyContact: body.emergencyContact || null,
        allergies: body.allergies || null,
        medicalHistory: body.medicalHistory || null,
        surgeriesHistory: body.surgeriesHistory || null,
        currentMedications: body.currentMedications || null,
        notes: body.notes || null,
      },
    });

    // If vitals provided in creation
    if (body.bpSystolic || body.pulse || body.temperature) {
      await prisma.patientVital.create({
        data: {
          patientId: newPatient.id,
          bpSystolic: body.bpSystolic ? parseInt(body.bpSystolic, 10) : null,
          bpDiastolic: body.bpDiastolic ? parseInt(body.bpDiastolic, 10) : null,
          pulse: body.pulse ? parseInt(body.pulse, 10) : null,
          temperature: body.temperature ? parseFloat(body.temperature) : null,
          spo2: body.spo2 ? parseInt(body.spo2, 10) : null,
          weight: body.weight ? parseFloat(body.weight) : null,
          height: body.height ? parseFloat(body.height) : null,
          bmi: body.weight && body.height ? parseFloat((body.weight / ((body.height / 100) ** 2)).toFixed(1)) : null,
          recordedBy: body.recordedBy || 'Receptionist Priya',
        },
      });
    }

    const completePatient = await prisma.patient.findUnique({
      where: { id: newPatient.id },
      include: {
        vitals: true,
        prescriptions: { include: { items: true } },
        invoices: true,
        documents: true,
      },
    });

    return NextResponse.json(completePatient, { status: 201 });
  } catch (error: any) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
