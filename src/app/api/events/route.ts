import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// In-memory high-speed event ring buffer for instant polling across LAN devices
interface CachedEvent {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: number;
  sourceRole: string;
  targetRoles: string[];
  data?: any;
}

const eventRingBuffer: CachedEvent[] = [];

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    if (!payload.type) {
      return NextResponse.json({ error: 'Event type is required' }, { status: 400 });
    }

    const event: CachedEvent = {
      id: payload.id || `evt-${Date.now()}`,
      type: payload.type,
      title: payload.title || 'Clinic Update',
      message: payload.message || '',
      timestamp: payload.timestamp || Date.now(),
      sourceRole: payload.sourceRole || 'SYSTEM',
      targetRoles: payload.targetRoles || ['ALL'],
      data: payload.data || {},
    };

    // Keep ring buffer at max 50 recent events
    eventRingBuffer.unshift(event);
    if (eventRingBuffer.length > 50) {
      eventRingBuffer.pop();
    }

    // Also persist critical events to NotificationLog
    const clinic = await prisma.clinic.findFirst();
    if (clinic && payload.data?.patientName) {
      try {
        await prisma.notificationLog.create({
          data: {
            clinicId: clinic.id,
            recipientName: payload.data.patientName,
            recipientPhone: payload.data.patientPhone || '+91 99999 00000',
            channel: 'WHATSAPP',
            type: payload.type,
            content: `[${payload.sourceRole} -> ${payload.targetRoles?.join(',')}]: ${payload.title} - ${payload.message}`,
            status: 'DELIVERED',
          },
        });
      } catch (e) {}
    }

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const since = parseInt(searchParams.get('since') || '0', 10);
    const role = searchParams.get('role');

    let events = eventRingBuffer;
    if (since > 0) {
      events = events.filter((e) => e.timestamp > since);
    }

    if (role) {
      events = events.filter(
        (e) => e.targetRoles.includes('ALL') || e.targetRoles.includes(role)
      );
    }

    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
