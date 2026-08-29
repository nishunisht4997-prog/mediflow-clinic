import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const clinic = await prisma.clinic.findUnique({
      where: { slug },
      include: {
        branches: true,
        doctors: {
          include: {
            user: true,
          }
        },
      },
    });

    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    return NextResponse.json(clinic);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
