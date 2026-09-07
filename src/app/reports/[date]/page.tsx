import { runDailyMarketReportPipeline } from '@/lib/pipeline';
import DashboardView from '../../components/DashboardView';

export default async function SpecificDateReportPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;

  const pipelineResult = await runDailyMarketReportPipeline({
    targetDate: date,
    forceRun: true,
    skipEmail: true,
  });

  return <DashboardView initialData={pipelineResult} dateStr={date} />;
}
