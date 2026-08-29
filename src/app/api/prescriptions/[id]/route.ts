import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const rx = await prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            vitals: { orderBy: { recordedAt: 'desc' }, take: 1 }
          }
        },
        doctor: {
          include: { user: true }
        },
        clinic: true,
        items: true,
      },
    });

    if (!rx) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    return NextResponse.json(rx);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
