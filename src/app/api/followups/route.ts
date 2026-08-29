import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    const followUps = await prisma.followUp.findMany({
      where: { clinicId: clinic.id },
      include: {
        patient: true,
        doctor: { include: { user: true } },
        prescription: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json(followUps);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const clinic = await prisma.clinic.findFirst({ include: { doctors: true } });
    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    const followUp = await prisma.followUp.create({
      data: {
        clinicId: clinic.id,
        patientId: body.patientId,
        doctorId: body.doctorId || clinic.doctors[0]?.id,
        dueDate: body.dueDate,
        stage: body.stage || 'SCHEDULED',
        notes: body.notes || null,
      },
      include: {
        patient: true,
        doctor: { include: { user: true } },
      }
    });

    return NextResponse.json(followUp, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
