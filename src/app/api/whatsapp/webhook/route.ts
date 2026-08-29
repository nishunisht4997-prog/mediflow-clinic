import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Meta WhatsApp Cloud API Webhook Verification (GET)
 * Meta calls this when you configure your webhook in Meta Developer Portal
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'mediflow_secure_webhook_2026';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('✅ WhatsApp Webhook verified successfully!');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification token mismatch' }, { status: 403 });
}

/**
 * Meta WhatsApp Cloud API Webhook Events (POST)
 * Receives delivery receipts (delivered, read, failed) & patient incoming messages
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if this is an event from WhatsApp Cloud API
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    // Delivery Status update
    if (value?.statuses?.[0]) {
      const statusObj = value.statuses[0];
      const messageId = statusObj.id;
      const statusStr = statusObj.status?.toUpperCase(); // DELIVERED, READ, FAILED

      console.log(`📩 WhatsApp Message ${messageId} status update: ${statusStr}`);
    }

    // Incoming message from patient
    if (value?.messages?.[0]) {
      const message = value.messages[0];
      const fromPhone = message.from;
      const text = message.text?.body;

      console.log(`💬 Incoming WhatsApp from ${fromPhone}: ${text}`);
    }

    return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
  } catch (error: any) {
    console.error('Error in WhatsApp webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
