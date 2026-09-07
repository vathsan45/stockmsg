// ==============================================================================
// HTML EMAIL TEMPLATE RENDERER (DESKTOP & MOBILE OPTIMIZED)
// ==============================================================================
import { FullDailyMarketReport } from '../types';

export function renderMarketReportEmailHTML(report: FullDailyMarketReport): string {
  const { tradingDate, marketSession, stockAnalyses, overallAnalysis, newsArticlesMap } = report;

  const niftyChange = marketSession.nifty50.percentageChange;
  const niftyClass = niftyChange >= 0 ? 'text-emerald-500' : 'text-rose-500';
  const niftySign = niftyChange >= 0 ? '+' : '';

  const sensexChange = marketSession.sensex.percentageChange;
  const sensexSign = sensexChange >= 0 ? '+' : '';

  const moodColor =
    overallAnalysis.market_mood === 'Bullish'
      ? '#10b981'
      : overallAnalysis.market_mood === 'Bearish'
      ? '#f43f5e'
      : '#f59e0b';

  const renderStockCard = (symbol: string, direction: 'GAINER' | 'LOSER') => {
    const quote =
      direction === 'GAINER'
        ? marketSession.gainers.find((g) => g.symbol === symbol)
        : marketSession.losers.find((l) => l.symbol === symbol);

    const analysis = stockAnalyses[symbol];
    if (!quote) return '';

    const sign = quote.percentageChange >= 0 ? '+' : '';
    const badgeBg = direction === 'GAINER' ? '#ecfdf5' : '#fef2f2';
    const badgeColor = direction === 'GAINER' ? '#047857' : '#b91c1c';

    return `
      <div style="background-color: #f8fafc; border-left: 4px solid ${badgeColor}; padding: 16px; margin-bottom: 16px; border-radius: 6px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font-weight: 700; font-size: 16px; color: #0f172a;">
              ${quote.companyName} <span style="font-size: 13px; color: #64748b; font-weight: 500;">(${quote.symbol.replace('.NS', '')})</span>
            </td>
            <td align="right" style="font-weight: 700; font-size: 16px; color: ${badgeColor};">
              <span style="background-color: ${badgeBg}; padding: 4px 10px; border-radius: 9999px;">${sign}${quote.percentageChange}%</span>
            </td>
          </tr>
        </table>
        <div style="margin-top: 10px; font-size: 14px; color: #334155;">
          <strong>Catalyst:</strong> <span style="background-color: #e2e8f0; color: #1e293b; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${analysis?.primary_catalyst || 'General Movement'}</span><br/>
          <div style="margin-top: 6px; line-height: 1.5;">${analysis?.explanation || 'Price moved in line with market trends.'}</div>
          ${analysis?.confidence ? `<div style="margin-top: 6px; font-size: 12px; color: #64748b;">Evidence Level: <strong>${analysis.evidence_level || 'MEDIUM'}</strong> | Confidence: <strong>${Math.round(analysis.confidence * 100)}%</strong></div>` : ''}
        </div>
      </div>
    `;
  };

  // Collect top 5 articles with clickable links
  const allArticles = Object.values(newsArticlesMap).flat().slice(0, 8);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Indian Market Daily — ${tradingDate}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #0f172a;">
  <table width="100%" max-width="640px" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width: 640px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
    
    <!-- HEADER -->
    <tr>
      <td style="background-color: #1e293b; padding: 28px 24px; text-align: center; border-bottom: 3px solid #3b82f6;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">INDIAN MARKET DAILY</h1>
        <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 14px;">${tradingDate} • Post-Market Session Intelligence</p>
      </td>
    </tr>

    <!-- MARKET SNAPSHOT -->
    <tr>
      <td style="padding: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; border-radius: 8px; padding: 16px;">
          <tr>
            <td width="33%" align="center" style="border-right: 1px solid #cbd5e1;">
              <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">NIFTY 50</div>
              <div style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 4px;">${marketSession.nifty50.price}</div>
              <div style="font-size: 13px; font-weight: 600; color: ${niftyChange >= 0 ? '#10b981' : '#f43f5e'}; margin-top: 2px;">${niftySign}${niftyChange}%</div>
            </td>
            <td width="33%" align="center" style="border-right: 1px solid #cbd5e1;">
              <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">SENSEX</div>
              <div style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 4px;">${marketSession.sensex.price}</div>
              <div style="font-size: 13px; font-weight: 600; color: ${sensexChange >= 0 ? '#10b981' : '#f43f5e'}; margin-top: 2px;">${sensexSign}${sensexChange}%</div>
            </td>
            <td width="34%" align="center">
              <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Market Mood</div>
              <div style="font-size: 16px; font-weight: 800; color: ${moodColor}; margin-top: 4px;">
                ${overallAnalysis.market_mood.toUpperCase()}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- WHAT MATTERED TODAY -->
    <tr>
      <td style="padding: 0 24px 24px 24px;">
        <h2 style="font-size: 16px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin: 0 0 12px 0;">WHAT MATTERED TODAY</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0; background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6;">
          ${overallAnalysis.summary_3_to_5_sentences}
        </p>
      </td>
    </tr>

    <!-- TOP GAINERS -->
    <tr>
      <td style="padding: 0 24px 24px 24px;">
        <h2 style="font-size: 16px; font-weight: 700; color: #047857; border-bottom: 2px solid #a7f3d0; padding-bottom: 8px; margin: 0 0 16px 0;">🚀 TOP GAINERS</h2>
        ${marketSession.gainers.map((g) => renderStockCard(g.symbol, 'GAINER')).join('')}
      </td>
    </tr>

    <!-- TOP LOSERS -->
    <tr>
      <td style="padding: 0 24px 24px 24px;">
        <h2 style="font-size: 16px; font-weight: 700; color: #b91c1c; border-bottom: 2px solid #fecaca; padding-bottom: 8px; margin: 0 0 16px 0;">📉 TOP LOSERS</h2>
        ${marketSession.losers.map((l) => renderStockCard(l.symbol, 'LOSER')).join('')}
      </td>
    </tr>

    <!-- KEY MARKET STORIES -->
    <tr>
      <td style="padding: 0 24px 24px 24px;">
        <h2 style="font-size: 16px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin: 0 0 12px 0;">KEY MARKET STORIES</h2>
        <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.6;">
          ${overallAnalysis.key_market_stories.map((story) => `<li style="margin-bottom: 8px;">${story}</li>`).join('')}
        </ul>
      </td>
    </tr>

    <!-- IMPORTANT SOURCES -->
    ${
      allArticles.length > 0
        ? `
    <tr>
      <td style="padding: 0 24px 24px 24px;">
        <h2 style="font-size: 16px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin: 0 0 12px 0;">IMPORTANT SOURCES</h2>
        <div style="font-size: 13px; line-height: 1.8;">
          ${allArticles
            .map(
              (art) =>
                `• <a href="${art.url}" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 600;">${art.title}</a> <span style="color: #64748b;">— ${art.source}</span>`
            )
            .join('<br/>')}
        </div>
      </td>
    </tr>
    `
        : ''
    }

    <!-- FOOTER & DISCLAIMER -->
    <tr>
      <td style="background-color: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
        <strong>Disclaimer:</strong> This report is generated automatically by an AI Financial Agent for informational purposes only and does not constitute investment advice. Past market performance is not indicative of future returns.
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
