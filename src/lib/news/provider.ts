// ==============================================================================
// NEWS PROVIDER (NEWSAPI + GOOGLE NEWS RSS + MOCK FALLBACK)
// ==============================================================================
import { INewsProvider } from './types';
import { NewsArticle } from '../types';
import { MockNewsProvider } from './mock';

export class NewsProvider implements INewsProvider {
  private mockProvider = new MockNewsProvider();

  async getNewsForStock(symbol: string, companyName: string, dateStr: string): Promise<NewsArticle[]> {
    if (process.env.USE_MOCK_DATA === 'true') {
      console.log(`[NEWS] USE_MOCK_DATA is enabled. Using mock news for ${symbol}.`);
      return this.mockProvider.getNewsForStock(symbol, companyName, dateStr);
    }

    const apiKey = process.env.NEWS_API_KEY;
    const cleanSymbol = symbol.replace('.NS', '').replace('.BO', '');

    // 1. Try NewsAPI if key is available
    if (apiKey) {
      try {
        console.log(`[NEWS] Fetching NewsAPI articles for ${companyName} (${cleanSymbol})...`);
        const query = encodeURIComponent(`"${companyName}" OR "${cleanSymbol}" India stock`);
        const url = `https://newsapi.org/v2/everything?q=${query}&from=${dateStr}&sortBy=relevance&language=en&pageSize=5&apiKey=${apiKey}`;

        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          const data = await res.json();
          if (data.articles && data.articles.length > 0) {
            return data.articles.map((art: any) => ({
              symbol,
              title: art.title || 'Untitled Financial Article',
              source: art.source?.name || 'Financial News',
              url: art.url || '#',
              publishedAt: art.publishedAt || `${dateStr}T12:00:00Z`,
              description: art.description || art.content || 'No detailed preview available.',
            }));
          }
        }
      } catch (err: any) {
        console.warn(`[NEWS] NewsAPI request failed for ${symbol}:`, err?.message || err);
      }
    }

    // 2. Try Google News RSS search (Free, reliable fallback)
    try {
      console.log(`[NEWS] Searching Google News RSS for ${companyName}...`);
      const searchTerms = encodeURIComponent(`${companyName} share price stock India`);
      const rssUrl = `https://news.google.com/rss/search?q=${searchTerms}&hl=en-IN&gl=IN&ceid=IN:en`;

      const res = await fetch(rssUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const xmlText = await res.text();
        const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>[\s\S]*?<source[^>]*>(.*?)<\/source>[\s\S]*?<\/item>/g;

        const articles: NewsArticle[] = [];
        let match;
        let count = 0;

        while ((match = itemRegex.exec(xmlText)) !== null && count < 4) {
          const title = match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
          const link = match[2].trim();
          const pubDate = match[3].trim();
          const source = match[4].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() || 'Google News';

          articles.push({
            symbol,
            title,
            source,
            url: link,
            publishedAt: pubDate,
            description: `Financial news article regarding ${companyName} (${cleanSymbol}) published on ${pubDate}.`,
          });
          count++;
        }

        if (articles.length > 0) {
          return articles;
        }
      }
    } catch (rssErr: any) {
      console.warn(`[NEWS] Google News RSS failed for ${symbol}:`, rssErr?.message || rssErr);
    }

    // 3. Fall back to mock provider if no external news returned
    console.log(`[NEWS] Using mock fallback news for ${symbol}.`);
    return this.mockProvider.getNewsForStock(symbol, companyName, dateStr);
  }
}
