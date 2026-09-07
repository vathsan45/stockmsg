// ==============================================================================
// PROTECTED MANUAL DEV TEST ENDPOINT
// ==============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { runDailyMarketReportPipeline } from '@/lib/pipeline';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const secret = process.env.CRON_SECRET;

    // Optional dev token protection in production
    if (process.env.NODE_ENV === 'production' && secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized test trigger' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { targetDate, forceRun = true, skipEmail = false } = body;

    console.log(`[TEST-API] Manually triggering daily market report pipeline (Date: ${targetDate || 'Today'})...`);

    const result = await runDailyMarketReportPipeline({
      targetDate,
      forceRun,
      skipEmail,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal test error' }, { status: 500 });
  }
}
