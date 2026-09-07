// ==============================================================================
// SUPABASE DATABASE SERVICE
// ==============================================================================
import { createClient } from '@supabase/supabase-js';
import { FullDailyMarketReport, DBReportRecord } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Saves a full generated daily report and related stock movements, news, and AI analysis.
 */
export async function saveDailyMarketReport(
  report: FullDailyMarketReport,
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'MARKET_CLOSED' = 'SUCCESS',
  emailStatus: 'SENT' | 'FAILED' | 'SKIPPED' = 'SKIPPED',
  reportHtml: string = ''
): Promise<{ success: boolean; reportId?: string; error?: string }> {
  if (!supabase) {
    console.log('[DB] Supabase client not configured (Missing URL/Keys). Skipping database save.');
    return { success: true, reportId: `mock-db-id-${Date.now()}` };
  }

  try {
    console.log(`[DB] Saving daily report for trading date ${report.tradingDate}...`);

    // 1. Insert or Upsert into daily_reports table
    const { data: reportRow, error: reportErr } = await supabase
      .from('daily_reports')
      .upsert(
        {
          trading_date: report.tradingDate,
          market_summary: report.overallAnalysis,
          report_html: reportHtml,
          status,
          email_status: emailStatus,
          email_sent_at: emailStatus === 'SENT' ? new Date().toISOString() : null,
        },
        { onConflict: 'trading_date' }
      )
      .select()
      .single();

    if (reportErr || !reportRow) {
      throw new Error(`Failed inserting daily_report: ${reportErr?.message}`);
    }

    const reportId = reportRow.id;

    // 2. Insert Stock Movements
    const allQuotes = [...report.marketSession.gainers, ...report.marketSession.losers];

    for (const quote of allQuotes) {
      const { data: moveRow, error: moveErr } = await supabase
        .from('stock_movements')
        .insert({
          report_id: reportId,
          symbol: quote.symbol,
          company_name: quote.companyName,
          price: quote.price,
          previous_close: quote.previousClose,
          percentage_change: quote.percentageChange,
          volume: quote.volume,
          direction: quote.direction,
        })
        .select()
        .single();

      if (moveErr || !moveRow) continue;

      const stockMovementId = moveRow.id;

      // 3. Insert News Articles for this stock
      const articles = report.newsArticlesMap[quote.symbol] || [];
      if (articles.length > 0) {
        await supabase.from('news_articles').insert(
          articles.map((art) => ({
            stock_movement_id: stockMovementId,
            title: art.title,
            source: art.source,
            url: art.url,
            published_at: art.publishedAt,
            description: art.description,
          }))
        );
      }

      // 4. Insert AI Analysis for this stock
      const aiAnalysis = report.stockAnalyses[quote.symbol];
      if (aiAnalysis) {
        await supabase.from('stock_analysis').insert({
          stock_movement_id: stockMovementId,
          primary_catalyst: aiAnalysis.primary_catalyst,
          explanation: aiAnalysis.explanation,
          confidence: aiAnalysis.confidence,
          evidence_level: aiAnalysis.evidence_level,
          market_specificity: aiAnalysis.market_specificity,
          alternative_explanation: aiAnalysis.alternative_explanation,
          raw_json: aiAnalysis,
        });
      }
    }

    console.log(`[DB] Successfully saved report ${reportId} to Supabase.`);
    return { success: true, reportId };
  } catch (err: any) {
    console.error('[DB] Error saving to Supabase:', err?.message || err);
    return { success: false, error: err?.message || 'Database insert failed' };
  }
}

/**
 * Checks if a report for the given trading date already exists.
 */
export async function getExistingReportForDate(dateStr: string): Promise<DBReportRecord | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('trading_date', dateStr)
      .maybeSingle();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}
