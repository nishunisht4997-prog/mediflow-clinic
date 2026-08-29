import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: body.status,
        timeSlot: body.timeSlot,
        date: body.date,
        chiefComplaint: body.chiefComplaint,
        notes: body.notes,
      },
      include: {
        patient: true,
        doctor: { include: { user: true } },
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
