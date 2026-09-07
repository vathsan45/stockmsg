// ==============================================================================
// GROQ LLM MARKET ANALYZER (WITH MULTI-KEY ROTATION & FALLBACK)
// ==============================================================================
import { MarketSessionData, NewsArticle, SingleStockAIAnalysis, MarketOverallAIAnalysis } from '../types';
import { MockAIAnalyzer } from './mock';
import Groq from 'groq-sdk';

export class AIAnalyzer {
  private mockAnalyzer = new MockAIAnalyzer();

  async analyzeSession(
    session: MarketSessionData,
    newsMap: Record<string, NewsArticle[]>
  ): Promise<{ stockAnalyses: Record<string, SingleStockAIAnalysis>; overallAnalysis: MarketOverallAIAnalysis }> {
    if (process.env.USE_MOCK_DATA === 'true') {
      console.log('[AI] USE_MOCK_DATA is true. Using Mock AI Analyzer.');
      return this.mockAnalyzer.analyzeStockMovements(session, newsMap);
    }

    const rawKeys = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || '';
    const keyPool = rawKeys.split(',').map((k) => k.trim()).filter(Boolean);

    if (keyPool.length === 0) {
      console.warn('[AI] No Groq API keys available. Using Mock AI Analyzer.');
      return this.mockAnalyzer.analyzeStockMovements(session, newsMap);
    }

    const modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    console.log(`[AI] Analyzing market session using Groq API (${keyPool.length} keys in pool)...`);

    const prompt = `You are an expert senior financial analyst specializing in the Indian Stock Market (NSE/BSE).

Given today's trading session data:
- Date: ${session.tradingDate}
- NIFTY 50: ${session.nifty50.price} (${session.nifty50.percentageChange > 0 ? '+' : ''}${session.nifty50.percentageChange}%)
- SENSEX: ${session.sensex.price} (${session.sensex.percentageChange > 0 ? '+' : ''}${session.sensex.percentageChange}%)

Top Gainers:
${session.gainers.map((g) => `- ${g.companyName} (${g.symbol}): +${g.percentageChange}% (Close: ₹${g.price})`).join('\n')}

Top Losers:
${session.losers.map((l) => `- ${l.companyName} (${l.symbol}): ${l.percentageChange}% (Close: ₹${l.price})`).join('\n')}

News Articles Collected Per Stock:
${JSON.stringify(newsMap, null, 2)}

INSTRUCTIONS:
1. For each of the top gainers and top losers, analyze the collected news articles and determine the most likely catalyst for the stock price movement.
2. If no clear, credible news catalyst is found for a stock, explicitly state: "No clear news catalyst identified."
3. Distinguish facts from inference. Use professional analyst tone ("Shares rose following...", "The move appears to have been driven by...", "The most likely catalyst was...").
4. Classify each stock's primary catalyst strictly into one of:
   'Earnings/results', 'Revenue/profit announcement', 'Management commentary', 'M&A', 'New contract/order', 'Product launch', 'Regulatory action', 'Government policy', 'Brokerage upgrade', 'Brokerage downgrade', 'Corporate action', 'Dividend/buyback', 'Sector movement', 'Commodity movement', 'Macroeconomic event', 'Global market movement', 'Rumour/speculation', 'No clear catalyst'
5. Generate a concise overall market summary (3-5 sentences) and 3 bullet key market stories explaining what happened in the Indian market today and why.

Return ONLY a valid JSON object matching this schema without markdown codeblocks or extra text:
{
  "stockAnalyses": {
    "SYMBOL_HERE": {
      "symbol": "SYMBOL_HERE",
      "direction": "GAINER" | "LOSER",
      "percentage_change": 4.8,
      "primary_catalyst": "Earnings/results",
      "explanation": "...",
      "evidence_level": "HIGH" | "MEDIUM" | "LOW" | "SPECULATIVE",
      "market_specificity": "COMPANY_SPECIFIC" | "SECTOR_WIDE" | "MARKET_WIDE",
      "supporting_articles": [ { "title": "...", "source": "...", "url": "..." } ],
      "alternative_explanation": "...",
      "confidence": 0.85
    }
  },
  "overallAnalysis": {
    "market_mood": "Bullish" | "Bearish" | "Mixed",
    "summary_3_to_5_sentences": "...",
    "key_market_stories": [ "...", "...", "..." ]
  }
}`;

    // Rotate through Groq API key pool if rate limits occur
    for (let i = 0; i < keyPool.length; i++) {
      const apiKey = keyPool[i];
      try {
        console.log(`[AI] Attempting Groq analysis with key #${i + 1}...`);
        const groqClient = new Groq({ apiKey });

        const response = await groqClient.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: modelName,
          temperature: 0.2,
          response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('Empty LLM response');

        const parsed = JSON.parse(content);
        console.log(`[AI] Successfully generated structured LLM analysis with key #${i + 1}.`);

        return {
          stockAnalyses: parsed.stockAnalyses || {},
          overallAnalysis: parsed.overallAnalysis || {
            market_mood: 'Mixed',
            summary_3_to_5_sentences: 'Indian benchmark indices traded in a narrow range today amid mixed domestic and global cues.',
            key_market_stories: ['Broad market session concluded with selective stock action.'],
          },
        };
      } catch (err: any) {
        console.warn(`[AI] Key #${i + 1} failed (${err?.message || err}). Trying next key...`);
      }
    }

    console.error('[AI] All Groq API keys in pool failed. Falling back to Mock AI Analyzer.');
    return this.mockAnalyzer.analyzeStockMovements(session, newsMap);
  }
}
