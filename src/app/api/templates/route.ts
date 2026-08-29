import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    const templates = await prisma.prescriptionTemplate.findMany({
      where: { clinicId: clinic.id },
      orderBy: { title: 'asc' },
    });

    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const clinic = await prisma.clinic.findFirst({ include: { doctors: true } });
    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    const doctor = clinic.doctors[0];

    const template = await prisma.prescriptionTemplate.create({
      data: {
        clinicId: clinic.id,
        doctorId: doctor?.id || null,
        title: body.title,
        specialty: body.specialty || 'General',
        diagnosis: body.diagnosis,
        symptoms: body.symptoms || null,
        medicinesJson: typeof body.medicines === 'string' ? body.medicines : JSON.stringify(body.medicines || []),
        advice: body.advice || null,
        investigationsAdvised: body.investigationsAdvised || null,
        followUpDays: parseInt(body.followUpDays, 10) || 7,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
