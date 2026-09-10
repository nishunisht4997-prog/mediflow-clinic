import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    const tasks = await prisma.clinicTask.findMany({
      where: { clinicId: clinic.id },
      include: {
        assignee: true,
        creator: true,
        patient: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error('Error fetching clinic tasks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    const validAssignedTo =
      body.assignedTo && typeof body.assignedTo === 'string' && body.assignedTo.trim() !== ''
        ? body.assignedTo.trim()
        : null;

    const validCreatedBy =
      body.createdBy && typeof body.createdBy === 'string' && body.createdBy.trim() !== ''
        ? body.createdBy.trim()
        : null;

    const validPatientId =
      body.patientId && typeof body.patientId === 'string' && body.patientId.trim() !== ''
        ? body.patientId.trim()
        : null;

    const task = await prisma.clinicTask.create({
      data: {
        clinicId: clinic.id,
        title: body.title,
        description: body.description || null,
        assignedTo: validAssignedTo,
        createdBy: validCreatedBy,
        patientId: validPatientId,
        priority: body.priority || 'MEDIUM',
        dueDate: body.dueDate || 'Today 5:00 PM',
        status: body.status || 'PENDING',
      },
      include: {
        assignee: true,
        patient: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error('Error creating clinic task in Neon DB:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
