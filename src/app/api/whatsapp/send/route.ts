import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WhatsAppService } from '@/services/whatsapp.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      recipientName,
      recipientPhone,
      type = 'CUSTOM_MESSAGE',
      content,
      channel = 'WHATSAPP',
      customConfig,
    } = body;

    const clinic = await prisma.clinic.findFirst();
    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    // Call Real WhatsApp Service
    const dispatchResult = await WhatsAppService.sendMessage(
      {
        recipientName: recipientName || 'Patient',
        recipientPhone: recipientPhone || '+91 99999 99999',
        content,
        type,
      },
      customConfig
    );

    // Save message log to database
    const log = await prisma.notificationLog.create({
      data: {
        clinicId: clinic.id,
        recipientName: recipientName || 'Patient',
        recipientPhone: recipientPhone || '+91 99999 99999',
        channel,
        type,
        content,
        status: dispatchResult.delivered ? 'DELIVERED' : 'SENT',
        sentAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      dispatchResult,
      log,
      directUrl: dispatchResult.directUrl,
    });
  } catch (error: any) {
    console.error('WhatsApp API dispatch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    const logs = await prisma.notificationLog.findMany({
      where: { clinicId: clinic.id },
      orderBy: { sentAt: 'desc' },
      take: 25,
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
