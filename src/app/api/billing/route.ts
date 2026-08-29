import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    const invoices = await prisma.invoice.findMany({
      where: { clinicId: clinic.id },
      include: {
        patient: true,
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalBilled = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
    const totalCollected = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
    const totalPending = totalBilled - totalCollected;

    // Payment breakdown
    const allPayments = await prisma.payment.findMany({
      where: { invoice: { clinicId: clinic.id } },
    });

    const cashCollected = allPayments.filter(p => p.method === 'CASH').reduce((acc, p) => acc + p.amount, 0);
    const upiCollected = allPayments.filter(p => p.method === 'UPI').reduce((acc, p) => acc + p.amount, 0);
    const cardCollected = allPayments.filter(p => p.method === 'CARD').reduce((acc, p) => acc + p.amount, 0);

    return NextResponse.json({
      invoices,
      stats: {
        totalBilled,
        totalCollected,
        totalPending,
        cashCollected,
        upiCollected,
        cardCollected,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const clinic = await prisma.clinic.findFirst({ include: { branches: true } });
    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    const invoiceCount = await prisma.invoice.count({ where: { clinicId: clinic.id } });
    const invoiceNumber = `INV-2026-${String(invoiceCount + 1).padStart(4, '0')}`;

    const items = body.items || [];
    const subtotal = items.reduce((acc: number, item: any) => acc + (parseFloat(item.unitPrice) * (parseInt(item.quantity, 10) || 1)), 0);
    const discount = parseFloat(body.discount) || 0;
    const tax = parseFloat(body.tax) || 0;
    const totalAmount = Math.max(0, subtotal - discount + tax);
    const initialPaid = parseFloat(body.paidAmount) || 0;

    let paymentStatus = 'UNPAID';
    if (initialPaid >= totalAmount && totalAmount > 0) {
      paymentStatus = 'PAID';
    } else if (initialPaid > 0) {
      paymentStatus = 'PARTIAL';
    }

    const invoice = await prisma.invoice.create({
      data: {
        clinicId: clinic.id,
        branchId: clinic.branches[0]?.id || null,
        patientId: body.patientId,
        appointmentId: body.appointmentId || null,
        invoiceNumber,
        subtotal,
        discount,
        tax,
        totalAmount,
        paidAmount: Math.min(initialPaid, totalAmount),
        paymentStatus,
        notes: body.notes || null,
      },
      include: {
        patient: true,
      }
    });

    // Create item rows
    for (const item of items) {
      if (item.description?.trim()) {
        const up = parseFloat(item.unitPrice) || 0;
        const qty = parseInt(item.quantity, 10) || 1;
        await prisma.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            description: item.description,
            unitPrice: up,
            quantity: qty,
            total: up * qty,
          },
        });
      }
    }

    // Record initial payment transaction if paid > 0
    if (initialPaid > 0) {
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: Math.min(initialPaid, totalAmount),
          method: body.paymentMethod || 'UPI',
          transactionRef: body.transactionRef || 'FRONT_DESK_ENTRY',
          recordedBy: body.recordedBy || 'Priya Sharma (Reception)',
        },
      });
    }

    // WhatsApp invoice receipt trigger
    if (body.sendWhatsApp && invoice.patient.phone) {
      await prisma.notificationLog.create({
        data: {
          clinicId: clinic.id,
          recipientName: invoice.patient.name,
          recipientPhone: invoice.patient.phone,
          channel: 'WHATSAPP',
          type: 'INVOICE',
          content: `Dear ${invoice.patient.name}, invoice ${invoice.invoiceNumber} for ₹${invoice.totalAmount} has been generated (Paid: ₹${invoice.paidAmount}). View bill: https://mediflow.in/bill/${invoice.id}`,
          status: 'DELIVERED',
        },
      });
    }

    const fullInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: { patient: true, items: true, payments: true },
    });

    return NextResponse.json(fullInvoice, { status: 201 });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
