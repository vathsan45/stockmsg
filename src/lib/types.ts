// ==============================================================================
// INDIAN STOCK MARKET DAILY INTELLIGENCE REPORT - TYPES & SCHEMAS
// ==============================================================================

export type StockDirection = 'GAINER' | 'LOSER';

export interface StockQuote {
  symbol: string;
  companyName: string;
  price: number;
  previousClose: number;
  change: number;
  percentageChange: number;
  volume: number;
  marketCap?: number;
  tradingDate: string; // YYYY-MM-DD
  direction: StockDirection;
}

export interface MarketIndexQuote {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  percentageChange: number;
}

export interface MarketSessionData {
  tradingDate: string;
  nifty50: MarketIndexQuote;
  sensex: MarketIndexQuote;
  gainers: StockQuote[];
  losers: StockQuote[];
  marketBreadth?: {
    advances: number;
    declines: number;
    unchanged: number;
  };
  isMarketClosed?: boolean;
  closureReason?: string;
}

export interface NewsArticle {
  symbol: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  description: string;
}

export type EvidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'SPECULATIVE';
export type MarketSpecificity = 'COMPANY_SPECIFIC' | 'SECTOR_WIDE' | 'MARKET_WIDE';

export type PrimaryCatalystCategory =
  | 'Earnings/results'
  | 'Revenue/profit announcement'
  | 'Management commentary'
  | 'M&A'
  | 'New contract/order'
  | 'Product launch'
  | 'Regulatory action'
  | 'Government policy'
  | 'Brokerage upgrade'
  | 'Brokerage downgrade'
  | 'Corporate action'
  | 'Dividend/buyback'
  | 'Sector movement'
  | 'Commodity movement'
  | 'Macroeconomic event'
  | 'Global market movement'
  | 'Rumour/speculation'
  | 'No clear catalyst';

export interface SingleStockAIAnalysis {
  symbol: string;
  direction: StockDirection;
  percentage_change: number;
  primary_catalyst: PrimaryCatalystCategory;
  explanation: string;
  evidence_level: EvidenceLevel;
  market_specificity: MarketSpecificity;
  supporting_articles: Array<{
    title: string;
    source: string;
    url: string;
  }>;
  alternative_explanation?: string;
  confidence: number;
}

export interface MarketOverallAIAnalysis {
  market_mood: 'Bullish' | 'Bearish' | 'Mixed';
  summary_3_to_5_sentences: string;
  key_market_stories: string[];
}

export interface FullDailyMarketReport {
  tradingDate: string;
  marketSession: MarketSessionData;
  stockAnalyses: Record<string, SingleStockAIAnalysis>; // key by symbol
  overallAnalysis: MarketOverallAIAnalysis;
  newsArticlesMap: Record<string, NewsArticle[]>; // key by symbol
  generatedAt: string;
}

export interface DBReportRecord {
  id: string;
  trading_date: string;
  market_summary: any;
  report_html: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'MARKET_CLOSED';
  email_status: 'SENT' | 'FAILED' | 'SKIPPED';
  created_at: string;
  email_sent_at?: string;
}
