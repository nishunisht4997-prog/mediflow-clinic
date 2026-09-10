import { NextResponse } from 'next/server';
import { DashboardService } from '@/services/dashboard.service';

export async function GET() {
  try {
    const data = await DashboardService.getStats('dr-priyabarta-clinic');
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
