import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    const users = await prisma.user.findMany({
      where: { clinicId: clinic.id },
      include: {
        attendance: {
          where: { date: todayStr },
          take: 1,
        },
        doctor: true,
      },
      orderBy: { role: 'asc' },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const todayStr = new Date().toISOString().split('T')[0];
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    const existing = await prisma.staffAttendance.findUnique({
      where: {
        clinicId_userId_date: {
          clinicId: clinic.id,
          userId: body.userId,
          date: todayStr,
        },
      },
    });

    if (existing) {
      const updated = await prisma.staffAttendance.update({
        where: { id: existing.id },
        data: {
          checkOut: body.checkOut || existing.checkOut,
          status: body.status || existing.status,
          remarks: body.remarks || existing.remarks,
        },
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.staffAttendance.create({
        data: {
          clinicId: clinic.id,
          userId: body.userId,
          date: todayStr,
          checkIn: body.checkIn || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          status: body.status || 'PRESENT',
          remarks: body.remarks || null,
        },
      });
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
