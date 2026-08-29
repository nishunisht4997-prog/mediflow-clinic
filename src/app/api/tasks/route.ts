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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    const task = await prisma.clinicTask.create({
      data: {
        clinicId: clinic.id,
        title: body.title,
        description: body.description || null,
        assignedTo: body.assignedTo || null,
        createdBy: body.createdBy || null,
        patientId: body.patientId || null,
        priority: body.priority || 'MEDIUM',
        dueDate: body.dueDate || 'Today 5:00 PM',
        status: body.status || 'PENDING',
      },
      include: {
        assignee: true,
        patient: true,
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
