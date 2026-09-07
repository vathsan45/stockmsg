import { runDailyMarketReportPipeline } from '@/lib/pipeline';
import { getIndianTradingDateStr } from '@/lib/calendar/nse-holidays';
import DashboardView from './components/DashboardView';

export const revalidate = 60; // Refresh data every 60 seconds

export default async function HomePage() {
  const dateStr = getIndianTradingDateStr();

  // Run or retrieve current market report pipeline
  const pipelineResult = await runDailyMarketReportPipeline({
    targetDate: dateStr,
    forceRun: true, // Generate latest view for dashboard
    skipEmail: true, // Don't trigger auto email on simple web page visit
  });

  return <DashboardView initialData={pipelineResult} dateStr={dateStr} />;
}
