import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.followUp.update({
      where: { id },
      data: {
        stage: body.stage,
        notes: body.notes,
        lastContactedAt: body.lastContactedAt ? new Date() : undefined,
      },
      include: {
        patient: true,
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
