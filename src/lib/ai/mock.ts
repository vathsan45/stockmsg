// ==============================================================================
// MOCK AI ANALYZER (FOR DEV TESTING)
// ==============================================================================
import { MarketSessionData, NewsArticle, SingleStockAIAnalysis, MarketOverallAIAnalysis } from '../types';

export class MockAIAnalyzer {
  async analyzeStockMovements(
    session: MarketSessionData,
    newsMap: Record<string, NewsArticle[]>
  ): Promise<{ stockAnalyses: Record<string, SingleStockAIAnalysis>; overallAnalysis: MarketOverallAIAnalysis }> {
    const stockAnalyses: Record<string, SingleStockAIAnalysis> = {};

    const allStocks = [...session.gainers, ...session.losers];

    for (const stock of allStocks) {
      const articles = newsMap[stock.symbol] || [];
      const hasArticles = articles.length > 0;

      if (stock.symbol.includes('RELIANCE')) {
        stockAnalyses[stock.symbol] = {
          symbol: stock.symbol,
          direction: stock.direction,
          percentage_change: stock.percentageChange,
          primary_catalyst: 'Earnings/results',
          explanation:
            'Shares rose sharply following stronger-than-expected Q3 net profit growth of 14% year-on-year, driven by margin expansion in retail operations and ARPU gains in telecom.',
          evidence_level: 'HIGH',
          market_specificity: 'COMPANY_SPECIFIC',
          supporting_articles: articles.map((a) => ({ title: a.title, source: a.source, url: a.url })),
          confidence: 0.92,
        };
      } else if (stock.symbol.includes('TATAMOTORS')) {
        stockAnalyses[stock.symbol] = {
          symbol: stock.symbol,
          direction: stock.direction,
          percentage_change: stock.percentageChange,
          primary_catalyst: 'Revenue/profit announcement',
          explanation:
            'The stock gained momentum after Jaguar Land Rover reported a 22% surge in Q3 global wholesale volumes, bolstering free cash flow expectations.',
          evidence_level: 'HIGH',
          market_specificity: 'COMPANY_SPECIFIC',
          supporting_articles: articles.map((a) => ({ title: a.title, source: a.source, url: a.url })),
          confidence: 0.88,
        };
      } else if (stock.symbol.includes('INFY')) {
        stockAnalyses[stock.symbol] = {
          symbol: stock.symbol,
          direction: stock.direction,
          percentage_change: stock.percentageChange,
          primary_catalyst: 'New contract/order',
          explanation:
            'The move appears to have been supported by the announcement of a $1.5 billion multi-year digital transformation agreement with a European financial institution.',
          evidence_level: 'HIGH',
          market_specificity: 'COMPANY_SPECIFIC',
          supporting_articles: articles.map((a) => ({ title: a.title, source: a.source, url: a.url })),
          confidence: 0.85,
        };
      } else if (stock.symbol.includes('HDFCBANK')) {
        stockAnalyses[stock.symbol] = {
          symbol: stock.symbol,
          direction: stock.direction,
          percentage_change: stock.percentageChange,
          primary_catalyst: 'Earnings/results',
          explanation:
            'Shares came under pressure as quarterly net interest margins narrowed slightly, leading analysts to flag temporary deposit cost headwinds.',
          evidence_level: 'HIGH',
          market_specificity: 'COMPANY_SPECIFIC',
          supporting_articles: articles.map((a) => ({ title: a.title, source: a.source, url: a.url })),
          alternative_explanation: 'Broader profit-taking in heavy-weight private banking stocks.',
          confidence: 0.82,
        };
      } else if (stock.symbol.includes('TCS')) {
        stockAnalyses[stock.symbol] = {
          symbol: stock.symbol,
          direction: stock.direction,
          percentage_change: stock.percentageChange,
          primary_catalyst: 'Sector movement',
          explanation:
            'The stock fell in tandem with broader IT sector cautiousness regarding North American BFSI discretionary tech spending.',
          evidence_level: 'MEDIUM',
          market_specificity: 'SECTOR_WIDE',
          supporting_articles: articles.map((a) => ({ title: a.title, source: a.source, url: a.url })),
          confidence: 0.75,
        };
      } else {
        stockAnalyses[stock.symbol] = {
          symbol: stock.symbol,
          direction: stock.direction,
          percentage_change: stock.percentageChange,
          primary_catalyst: hasArticles ? 'Sector movement' : 'No clear catalyst',
          explanation: hasArticles
            ? `The stock moved ${stock.percentageChange}% alongside overall market and sector movements.`
            : 'No clear news catalyst was identified for today’s price movement.',
          evidence_level: hasArticles ? 'MEDIUM' : 'LOW',
          market_specificity: 'SECTOR_WIDE',
          supporting_articles: articles.map((a) => ({ title: a.title, source: a.source, url: a.url })),
          confidence: 0.65,
        };
      }
    }

    const overallAnalysis: MarketOverallAIAnalysis = {
      market_mood: 'Bullish',
      summary_3_to_5_sentences:
        'Indian benchmark indices closed higher today led by strong gains in energy, auto, and select IT blue-chips. NIFTY 50 expanded by +0.57% while SENSEX added 430 points. Positive corporate earnings releases from large-cap heavyweights boosted investor sentiment despite margin pressures in major private sector banks.',
      key_market_stories: [
        'Energy and Auto stocks rallied following robust Q3 volume updates.',
        'Banking heavyweights saw profit-taking amid net interest margin updates.',
        'Market breadth remained positive with 1,420 advances versus 1,080 declines.',
      ],
    };

    return { stockAnalyses, overallAnalysis };
  }
}
