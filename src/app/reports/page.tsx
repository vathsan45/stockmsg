import Link from 'next/link';
import { supabase } from '@/lib/db/supabase';
import { Calendar, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { getIndianTradingDateStr } from '@/lib/calendar/nse-holidays';

export const revalidate = 60;

export default async function ReportsArchivePage() {
  let reports: any[] = [];

  if (supabase) {
    const { data } = await supabase
      .from('daily_reports')
      .select('id, trading_date, market_summary, status, email_status, created_at')
      .order('trading_date', { ascending: false });
    if (data) reports = data;
  }

  // Fallback demo row if database is empty
  if (reports.length === 0) {
    const today = getIndianTradingDateStr();
    reports = [
      {
        id: 'demo-report-1',
        trading_date: today,
        market_summary: {
          market_mood: 'Bullish',
          summary_3_to_5_sentences: 'Energy and Auto heavyweights pushed benchmark indices higher post-session.',
        },
        status: 'SUCCESS',
        email_status: 'SENT',
        created_at: new Date().toISOString(),
      },
    ];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100">Daily Market Report Archive</h1>
        <p className="text-slate-400 text-sm mt-1">Browse past Indian stock market session intelligence reports.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="divide-y divide-slate-800">
          {reports.map((report) => (
            <div key={report.id || report.trading_date} className="p-5 hover:bg-slate-850/60 transition-colors flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-100 text-base">{report.trading_date}</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      report.market_summary?.market_mood === 'Bullish'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {report.market_summary?.market_mood || 'Session Report'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1 max-w-2xl">{report.market_summary?.summary_3_to_5_sentences}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right text-xs hidden sm:block">
                  <div className="text-slate-300 font-medium">Status: {report.status}</div>
                  <div className="text-slate-500">Email: {report.email_status}</div>
                </div>
                <Link
                  href={`/reports/${report.trading_date}`}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  View Report <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
