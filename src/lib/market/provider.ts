// ==============================================================================
// INDIAN STOCK MARKET DATA PROVIDER (YAHOO FINANCE + MOCK FALLBACK)
// ==============================================================================
import { IMarketDataProvider } from './types';
import { MarketSessionData, StockQuote, MarketIndexQuote } from '../types';
import { MockMarketDataProvider } from './mock';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = typeof (YahooFinance as any) === 'function' ? new (YahooFinance as any)() : YahooFinance;

// Configurable NIFTY 100/500 Mainstream Indian Stock Universe
const NIFTY_UNIVERSE = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services Ltd' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd' },
  { symbol: 'INFY.NS', name: 'Infosys Ltd' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd' },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd' },
  { symbol: 'SBIN.NS', name: 'State Bank of India' },
  { symbol: 'LTIM.NS', name: 'LTIMindtree Ltd' },
  { symbol: 'LTC.NS', name: 'Larsen & Toubro Ltd' },
  { symbol: 'ITC.NS', name: 'ITC Ltd' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Ltd' },
  { symbol: 'AXISBANK.NS', name: 'Axis Bank Ltd' },
  { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank' },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever Ltd' },
  { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance Ltd' },
  { symbol: 'MARUTI.NS', name: 'Maruti Suzuki India Ltd' },
  { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical Industries' },
  { symbol: 'NTPC.NS', name: 'NTPC Ltd' },
  { symbol: 'ONGC.NS', name: 'Oil & Natural Gas Corp Ltd' },
  { symbol: 'POWERGRID.NS', name: 'Power Grid Corp of India' },
  { symbol: 'TITAN.NS', name: 'Titan Company Ltd' },
  { symbol: 'TATASTEEL.NS', name: 'Tata Steel Ltd' },
  { symbol: 'ADANIENT.NS', name: 'Adani Enterprises Ltd' },
  { symbol: 'ADANIPORTS.NS', name: 'Adani Ports & SEZ Ltd' },
  { symbol: 'COALINDIA.NS', name: 'Coal India Ltd' },
  { symbol: 'BAJAJFINSV.NS', name: 'Bajaj Finserv Ltd' },
  { symbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement Ltd' },
  { symbol: 'ASIANPAINT.NS', name: 'Asian Paints Ltd' },
  { symbol: 'M&M.NS', name: 'Mahindra & Mahindra Ltd' },
  { symbol: 'JSWSTEEL.NS', name: 'JSW Steel Ltd' },
];

export class YahooMarketDataProvider implements IMarketDataProvider {
  private mockProvider = new MockMarketDataProvider();

  async getMarketSessionData(dateStr: string): Promise<MarketSessionData> {
    if (process.env.USE_MOCK_DATA === 'true') {
      console.log('[MARKET] USE_MOCK_DATA is enabled. Using Mock Market Data Provider.');
      return this.mockProvider.getMarketSessionData(dateStr);
    }

    try {
      console.log(`[MARKET] Fetching live session market data for date: ${dateStr}...`);

      // 1. Fetch NIFTY 50 and SENSEX quotes
      const [niftyQuote, sensexQuote]: [any, any] = await Promise.all([
        (yahooFinance.quote('^NSEI') as Promise<any>).catch(() => null),
        (yahooFinance.quote('^BSESN') as Promise<any>).catch(() => null),
      ]);

      const nifty50: MarketIndexQuote = {
        symbol: '^NSEI',
        name: 'NIFTY 50',
        price: niftyQuote?.regularMarketPrice || 24800,
        previousClose: niftyQuote?.regularMarketPreviousClose || 24700,
        change: niftyQuote?.regularMarketChange || 100,
        percentageChange: Number(
          (
            (((niftyQuote?.regularMarketPrice || 24800) - (niftyQuote?.regularMarketPreviousClose || 24700)) /
              (niftyQuote?.regularMarketPreviousClose || 24700)) *
            100
          ).toFixed(2)
        ),
      };

      const sensex: MarketIndexQuote = {
        symbol: '^BSESN',
        name: 'SENSEX',
        price: sensexQuote?.regularMarketPrice || 81000,
        previousClose: sensexQuote?.regularMarketPreviousClose || 80600,
        change: sensexQuote?.regularMarketChange || 400,
        percentageChange: Number(
          (
            (((sensexQuote?.regularMarketPrice || 81000) - (sensexQuote?.regularMarketPreviousClose || 80600)) /
              (sensexQuote?.regularMarketPreviousClose || 80600)) *
            100
          ).toFixed(2)
        ),
      };

      // 2. Fetch quotes for NIFTY stock universe in parallel
      const stockSymbols = NIFTY_UNIVERSE.map((s) => s.symbol);
      const quotesRaw: any = await (yahooFinance.quote(stockSymbols) as Promise<any>);
      const quotesArray: any[] = Array.isArray(quotesRaw) ? quotesRaw : [quotesRaw];

      const processedQuotes: StockQuote[] = [];

      for (const q of quotesArray) {
        if (!q || !q.regularMarketPrice || !q.regularMarketPreviousClose) continue;

        const price = q.regularMarketPrice;
        const prevClose = q.regularMarketPreviousClose;
        const change = Number((price - prevClose).toFixed(2));
        // Calculate percentage movement deterministically in code (Requirement #5)
        const pctChange = Number((((price - prevClose) / prevClose) * 100).toFixed(2));

        const matchedMeta = NIFTY_UNIVERSE.find((u) => u.symbol === q.symbol);

        processedQuotes.push({
          symbol: q.symbol,
          companyName: matchedMeta?.name || q.longName || q.shortName || q.symbol,
          price,
          previousClose: prevClose,
          change,
          percentageChange: pctChange,
          volume: q.regularMarketVolume || 0,
          marketCap: q.marketCap,
          tradingDate: dateStr,
          direction: pctChange >= 0 ? 'GAINER' : 'LOSER',
        });
      }

      // Sort gainers descending by percentageChange
      const gainers = processedQuotes
        .filter((q) => q.percentageChange > 0)
        .sort((a, b) => b.percentageChange - a.percentageChange)
        .slice(0, 5);

      // Sort losers ascending by percentageChange (most negative first)
      const losers = processedQuotes
        .filter((q) => q.percentageChange < 0)
        .sort((a, b) => a.percentageChange - b.percentageChange)
        .slice(0, 5);

      console.log(`[MARKET] Found ${gainers.length} gainers and ${losers.length} losers.`);

      return {
        tradingDate: dateStr,
        nifty50,
        sensex,
        gainers,
        losers,
        marketBreadth: {
          advances: processedQuotes.filter((q) => q.percentageChange > 0).length,
          declines: processedQuotes.filter((q) => q.percentageChange < 0).length,
          unchanged: processedQuotes.filter((q) => q.percentageChange === 0).length,
        },
      };
    } catch (err: any) {
      console.error('[MARKET] Error fetching live market data from Yahoo Finance:', err?.message || err);
      console.log('[MARKET] Falling back to Mock Market Data Provider.');
      return this.mockProvider.getMarketSessionData(dateStr);
    }
  }
}
