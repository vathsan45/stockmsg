'use client';

import { useState } from 'react';
import { PipelineResult } from '@/lib/pipeline';
import { TrendingUp, TrendingDown, ArrowUpRight, ExternalLink, RefreshCw, Send, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

interface Props {
  initialData: PipelineResult;
  dateStr: string;
}

export default function DashboardView({ initialData, dateStr }: Props) {
  const [data, setData] = useState<PipelineResult>(initialData);
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const report = data.report;
  const session = report?.marketSession;
  const overall = report?.overallAnalysis;

  const handleRunManualPipeline = async (sendEmail: boolean) => {
    setLoading(true);
    setTestStatus('Running market data & AI analysis pipeline...');
    try {
      const res = await fetch('/api/test/daily-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetDate: dateStr, forceRun: true, skipEmail: !sendEmail }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setData(json);
        setTestStatus(sendEmail ? 'Pipeline executed & email dispatched!' : 'Pipeline re-analyzed successfully!');
      } else {
        setTestStatus(`Pipeline execution error: ${json.error || 'Failed'}`);
      }
    } catch (err: any) {
      setTestStatus(`Error: ${err?.message || 'Failed'}`);
    } finally {
      setLoading(false);
    }
  };

  if (data.isMarketClosed) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-xl mx-auto my-12 shadow-2xl">
        <div className="w-14 h-14 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Market Closed Today</h2>
        <p className="text-slate-400 text-sm mb-6">{data.reason || 'The Indian stock market was closed today.'}</p>
        <button
          onClick={() => handleRunManualPipeline(false)}
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20 inline-flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Force Run Test Session
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner / Hero Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Trading Session Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Indian Stock Market Daily Report
          </h1>
          <p className="text-slate-400 text-sm mt-1">Trading Date: {report?.tradingDate || dateStr}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleRunManualPipeline(false)}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-sm rounded-xl transition-all inline-flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
            Re-Run Analysis
          </button>
          <button
            onClick={() => handleRunManualPipeline(true)}
            disabled={loading}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-all inline-flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <Send className="w-4 h-4" />
            Send Email Report
          </button>
        </div>
      </div>

      {testStatus && (
        <div className="bg-blue-950/60 border border-blue-800/80 rounded-xl p-4 text-sm text-blue-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
            <span>{testStatus}</span>
          </div>
          <button onClick={() => setTestStatus(null)} className="text-xs text-blue-400 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Indices Ticker Cards */}
      {session && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">NIFTY 50</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{session.nifty50.price.toLocaleString('en-IN')}</div>
            <div className={`text-sm font-bold mt-1 inline-flex items-center gap-1 ${session.nifty50.percentageChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {session.nifty50.percentageChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {session.nifty50.percentageChange >= 0 ? '+' : ''}
              {session.nifty50.percentageChange}%
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SENSEX</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{session.sensex.price.toLocaleString('en-IN')}</div>
            <div className={`text-sm font-bold mt-1 inline-flex items-center gap-1 ${session.sensex.percentageChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {session.sensex.percentageChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {session.sensex.percentageChange >= 0 ? '+' : ''}
              {session.sensex.percentageChange}%
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Market Sentiment</div>
            <div className="text-2xl font-black tracking-wide mt-1" style={{ color: overall?.market_mood === 'Bullish' ? '#10b981' : overall?.market_mood === 'Bearish' ? '#f43f5e' : '#f59e0b' }}>
              {overall?.market_mood?.toUpperCase() || 'MIXED'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Advances: {session.marketBreadth?.advances || 0} | Declines: {session.marketBreadth?.declines || 0}
            </div>
          </div>
        </div>
      )}

      {/* Executive Summary */}
      {overall && (
        <div className="bg-gradient-to-br from-blue-950/40 via-slate-900 to-indigo-950/30 border border-blue-900/40 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mb-3">
            <Sparkles className="w-4 h-4" />
            <span>Executive Session Summary</span>
          </div>
          <p className="text-slate-200 text-base leading-relaxed">{overall.summary_3_to_5_sentences}</p>

          {overall.key_market_stories && overall.key_market_stories.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Key Session Themes</h4>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {overall.key_market_stories.map((story, i) => (
                  <li key={i} className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></span>
                    <span>{story}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Gainers & Losers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 5 Gainers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
            <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Top 5 Gainers
            </h2>
            <span className="text-xs text-slate-400">NIFTY 500 Universe</span>
          </div>

          {session?.gainers.map((quote) => {
            const analysis = report?.stockAnalyses[quote.symbol];
            const articles = report?.newsArticlesMap[quote.symbol] || [];

            return (
              <div key={quote.symbol} className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">{quote.companyName}</h3>
                    <span className="text-xs text-slate-400">{quote.symbol.replace('.NS', '')} • ₹{quote.price.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-sm rounded-full">
                    +{quote.percentageChange}%
                  </span>
                </div>

                <div className="mt-4 bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                      {analysis?.primary_catalyst || 'General Movement'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Evidence: <strong className="text-slate-300">{analysis?.evidence_level || 'MEDIUM'}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{analysis?.explanation}</p>
                </div>

                {articles.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[280px]">Source: {articles[0].source} — {articles[0].title}</span>
                    <a href={articles[0].url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1 shrink-0">
                      Read <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Top 5 Losers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
            <h2 className="text-lg font-bold text-rose-400 flex items-center gap-2">
              <TrendingDown className="w-5 h-5" /> Top 5 Losers
            </h2>
            <span className="text-xs text-slate-400">NIFTY 500 Universe</span>
          </div>

          {session?.losers.map((quote) => {
            const analysis = report?.stockAnalyses[quote.symbol];
            const articles = report?.newsArticlesMap[quote.symbol] || [];

            return (
              <div key={quote.symbol} className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-5 shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">{quote.companyName}</h3>
                    <span className="text-xs text-slate-400">{quote.symbol.replace('.NS', '')} • ₹{quote.price.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-sm rounded-full">
                    {quote.percentageChange}%
                  </span>
                </div>

                <div className="mt-4 bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">
                      {analysis?.primary_catalyst || 'General Movement'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Evidence: <strong className="text-slate-300">{analysis?.evidence_level || 'MEDIUM'}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{analysis?.explanation}</p>
                </div>

                {articles.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[280px]">Source: {articles[0].source} — {articles[0].title}</span>
                    <a href={articles[0].url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1 shrink-0">
                      Read <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
