import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CLINIC_CONFIG } from '@/config/clinic.config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, title, category, fileUrl, fileSize, uploadedBy } = body;

    if (!patientId || !title) {
      return NextResponse.json({ error: 'Patient ID and Document Title are required' }, { status: 400 });
    }

    const document = await prisma.patientDocument.create({
      data: {
        patientId,
        title,
        category: category || 'Lab Report',
        fileUrl: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: fileSize || '1.2 MB PDF',
        uploadedBy: uploadedBy || CLINIC_CONFIG.doctorName,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error: any) {
    console.error('Error creating patient document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
