import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoiceId, amount, method, transactionRef, recordedBy } = body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { patient: true }
    });

    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

    const payAmount = parseFloat(amount);
    const newPaidAmount = invoice.paidAmount + payAmount;
    const paymentStatus = newPaidAmount >= invoice.totalAmount ? 'PAID' : 'PARTIAL';

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount: payAmount,
        method: method || 'UPI',
        transactionRef: transactionRef || null,
        recordedBy: recordedBy || 'Receptionist Priya',
      },
    });

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: Math.min(newPaidAmount, invoice.totalAmount),
        paymentStatus,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
