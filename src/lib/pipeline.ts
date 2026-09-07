// ==============================================================================
// DAILY MARKET REPORT PIPELINE ORCHESTRATOR
// ==============================================================================
import { checkTradingDayStatus, getIndianTradingDateStr } from './calendar/nse-holidays';
import { YahooMarketDataProvider } from './market/provider';
import { NewsProvider } from './news/provider';
import { AIAnalyzer } from './ai/analyzer';
import { renderMarketReportEmailHTML } from './email/template';
import { sendDailyMarketReport } from './email/resend';
import { saveDailyMarketReport, getExistingReportForDate } from './db/supabase';
import { FullDailyMarketReport, NewsArticle } from './types';

export interface PipelineResult {
  success: boolean;
  tradingDate: string;
  isMarketClosed?: boolean;
  reason?: string;
  report?: FullDailyMarketReport;
  emailSent?: boolean;
  dbSaved?: boolean;
  error?: string;
}

export async function runDailyMarketReportPipeline(options?: {
  targetDate?: string;
  forceRun?: boolean;
  skipEmail?: boolean;
}): Promise<PipelineResult> {
  const tradingDate = options?.targetDate || getIndianTradingDateStr();
  console.log(`[CRON] Started daily report pipeline for trading date: ${tradingDate}`);

  // 1. Trading Day Validation (Requirement #13)
  if (!options?.forceRun) {
    const dayCheck = checkTradingDayStatus(tradingDate);
    if (!dayCheck.isTradingDay) {
      console.log(`[MARKET] Indian stock market was closed on ${tradingDate}: ${dayCheck.reason}`);
      return {
        success: true,
        tradingDate,
        isMarketClosed: true,
        reason: dayCheck.reason,
      };
    }
  }

  // 2. Idempotency Check (Requirement #12)
  if (!options?.forceRun) {
    const existing = await getExistingReportForDate(tradingDate);
    if (existing && existing.status === 'SUCCESS' && existing.email_status === 'SENT') {
      console.log(`[CRON] Report for date ${tradingDate} has already been generated & emailed. Skipping.`);
      return {
        success: true,
        tradingDate,
        reason: 'Report already generated and emailed for today.',
      };
    }
  }

  try {
    // 3. Fetch Market Data
    console.log('[MARKET] Retrieving session data...');
    const marketProvider = new YahooMarketDataProvider();
    const marketSession = await marketProvider.getMarketSessionData(tradingDate);

    console.log(`[MARKET] Identified ${marketSession.gainers.length} gainers / ${marketSession.losers.length} losers.`);

    // 4. Fetch News for Gainers and Losers
    console.log('[NEWS] Retrieving relevant news articles...');
    const newsProvider = new NewsProvider();
    const newsArticlesMap: Record<string, NewsArticle[]> = {};

    const targetStocks = [...marketSession.gainers, ...marketSession.losers];

    await Promise.all(
      targetStocks.map(async (stock) => {
        try {
          const articles = await newsProvider.getNewsForStock(stock.symbol, stock.companyName, tradingDate);
          newsArticlesMap[stock.symbol] = articles;
        } catch (newsErr) {
          console.warn(`[NEWS] Non-fatal error fetching news for ${stock.symbol}:`, newsErr);
          newsArticlesMap[stock.symbol] = [];
        }
      })
    );

    // 5. Run LLM AI Analysis
    console.log('[AI] Running LLM analysis on news catalysts and market trends...');
    const aiAnalyzer = new AIAnalyzer();
    const { stockAnalyses, overallAnalysis } = await aiAnalyzer.analyzeSession(marketSession, newsArticlesMap);

    console.log('[AI] Analysis complete.');

    // 6. Assemble Full Market Report
    const report: FullDailyMarketReport = {
      tradingDate,
      marketSession,
      stockAnalyses,
      overallAnalysis,
      newsArticlesMap,
      generatedAt: new Date().toISOString(),
    };

    const reportHtml = renderMarketReportEmailHTML(report);

    // 7. Send Email Report via Resend
    let emailSent = false;
    let emailStatus: 'SENT' | 'FAILED' | 'SKIPPED' = 'SKIPPED';

    if (!options?.skipEmail) {
      console.log('[EMAIL] Attempting email delivery via Resend...');
      const emailRes = await sendDailyMarketReport(report);
      if (emailRes.success) {
        emailSent = true;
        emailStatus = 'SENT';
        console.log('[EMAIL] Report sent successfully!');
      } else {
        emailStatus = 'FAILED';
        console.error('[EMAIL] Email sending failed:', emailRes.error);
      }
    }

    // 8. Store Report in Supabase Database
    console.log('[DB] Storing report in Supabase database...');
    const dbRes = await saveDailyMarketReport(report, 'SUCCESS', emailStatus, reportHtml);
    const dbSaved = dbRes.success;

    console.log('[CRON] Pipeline execution completed successfully.');

    return {
      success: true,
      tradingDate,
      report,
      emailSent,
      dbSaved,
    };
  } catch (err: any) {
    console.error('[CRON] Pipeline execution failed:', err?.message || err);
    return {
      success: false,
      tradingDate,
      error: err?.message || 'Pipeline failed',
    };
  }
}
