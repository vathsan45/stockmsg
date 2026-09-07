// ==============================================================================
// MOCK NEWS PROVIDER (FOR DEV TESTING)
// ==============================================================================
import { INewsProvider } from './types';
import { NewsArticle } from '../types';

export class MockNewsProvider implements INewsProvider {
  async getNewsForStock(symbol: string, companyName: string, dateStr: string): Promise<NewsArticle[]> {
    const cleanSymbol = symbol.replace('.NS', '');

    const mockArticlesDatabase: Record<string, NewsArticle[]> = {
      RELIANCE: [
        {
          symbol: 'RELIANCE.NS',
          title: 'Reliance Industries Q3 Net Profit Rises 14% to ₹19,640 Crore; Retail & Telecom Lead Growth',
          source: 'Economic Times',
          url: 'https://economictimes.indiatimes.com/markets/stocks/news/reliance-q3-results',
          publishedAt: `${dateStr}T14:30:00Z`,
          description:
            'Reliance Industries reported strong Q3 earnings driven by double-digit ARPU growth in Jio Infocomm and expanded retail footfall across metro cities.',
        },
        {
          symbol: 'RELIANCE.NS',
          title: 'JPMorgan Upgrades Reliance Industries to Overweight with Target Price of ₹3,400',
          source: 'Mint / Livemint',
          url: 'https://www.livemint.com/market/stock-market-news/jpmorgan-upgrades-reliance-target-price',
          publishedAt: `${dateStr}T11:15:00Z`,
          description:
            'Brokerage firm JPMorgan cited new energy commercialization and robust green hydrogen timelines as major catalysts for earnings re-rating.',
        },
      ],
      TATAMOTORS: [
        {
          symbol: 'TATAMOTORS.NS',
          title: 'Tata Motors Jaguar Land Rover Global Sales Surge 22% in Q3; Free Cash Flow Hits Record High',
          source: 'Business Standard',
          url: 'https://www.business-standard.com/companies/news/tata-motors-jlr-sales-rise',
          publishedAt: `${dateStr}T15:00:00Z`,
          description:
            'JLR reported robust wholesale volume growth led by Defender and Range Rover models across North America and Europe markets.',
        },
      ],
      INFY: [
        {
          symbol: 'INFY.NS',
          title: 'Infosys Secures $1.5 Billion Multi-Year Digital Transformation Deal with European Financial Giant',
          source: 'Reuters India',
          url: 'https://www.reuters.com/business/infosys-deal-announcement',
          publishedAt: `${dateStr}T10:45:00Z`,
          description:
            'Infosys announced a major strategic cloud and AI contract win, boosting investor sentiment across Indian IT sector stocks.',
        },
      ],
      HDFCBANK: [
        {
          symbol: 'HDFCBANK.NS',
          title: 'HDFC Bank Net Interest Margin Narrows Slightly in Q3; Deposit Growth Lags Credit Expansion',
          source: 'Financial Express',
          url: 'https://www.financialexpress.com/market/hdfc-bank-q3-nim-margin-pressure',
          publishedAt: `${dateStr}T13:20:00Z`,
          description:
            'Banking analysts highlighted margin compression due to elevated cost of funds post-merger integration, triggering selling pressure.',
        },
      ],
      TCS: [
        {
          symbol: 'TCS.NS',
          title: 'TCS Reports Modest Revenue Growth Amid Soft BFSI Spending in North America',
          source: 'Moneycontrol',
          url: 'https://www.moneycontrol.com/news/business/earnings/tcs-q3-preview-bfsi-slowdown',
          publishedAt: `${dateStr}T12:00:00Z`,
          description:
            'Tata Consultancy Services cautioned that client discretionary spending remains subdued in banking and financial verticals.',
        },
      ],
    };

    if (mockArticlesDatabase[cleanSymbol]) {
      return mockArticlesDatabase[cleanSymbol];
    }

    // Default mock response for unlisted symbols
    return [
      {
        symbol,
        title: `${companyName} Shares Active in Session Amid Broader Sector Trends`,
        source: 'CNBC-TV18',
        url: `https://www.cnbctv18.com/market/stocks/${cleanSymbol.toLowerCase()}`,
        publishedAt: `${dateStr}T09:30:00Z`,
        description: `Institutional trading activity was observed in ${companyName} following sectoral macroeconomic updates.`,
      },
    ];
  }
}
