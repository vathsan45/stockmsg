// ==============================================================================
// VERCEL CRON DAILY REPORT ENDPOINT
// ==============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { runDailyMarketReportPipeline } from '@/lib/pipeline';

export const maxDuration = 60; // Max execution timeout for Vercel functions (seconds)

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    // Verify Vercel Cron secret authorization
    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      console.warn('[SECURITY] Unauthorized cron invocation attempt.');
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    const result = await runDailyMarketReportPipeline();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Cron error' }, { status: 500 });
  }
}
