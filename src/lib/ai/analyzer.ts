// ==============================================================================
// GROQ LLM MARKET ANALYZER (WITH MULTI-KEY ROTATION & MODEL FALLBACK)
// ==============================================================================
import { MarketSessionData, NewsArticle, SingleStockAIAnalysis, MarketOverallAIAnalysis } from '../types';
import { MockAIAnalyzer } from './mock';
import Groq from 'groq-sdk';

const GROQ_MODEL_FALLBACKS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.6-27b',
  'qwen/qwen3.8-27b',
];

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
      console.log('[AI] No Groq API keys available. Using Mock AI Analyzer.');
      return this.mockAnalyzer.analyzeStockMovements(session, newsMap);
    }

    const primaryModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
    const modelsToTry = [primaryModel, ...GROQ_MODEL_FALLBACKS.filter((m) => m !== primaryModel)];

    console.log(`[AI] Analyzing market session using Groq API (${keyPool.length} keys in pool)...`);

    const prompt = `Given today's Indian Stock Market (NSE/BSE) trading session data:
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
1. For each of the top gainers and top losers, analyze the news articles and determine the most likely catalyst.
2. If no clear news catalyst is found for a stock, state: "No clear news catalyst identified."
3. Use professional analyst tone ("Shares rose following...", "The move appears to have been driven by...").
4. Classify catalyst into: 'Earnings/results', 'Revenue/profit announcement', 'Management commentary', 'M&A', 'New contract/order', 'Product launch', 'Regulatory action', 'Government policy', 'Brokerage upgrade', 'Brokerage downgrade', 'Corporate action', 'Dividend/buyback', 'Sector movement', 'Commodity movement', 'Macroeconomic event', 'Global market movement', 'Rumour/speculation', 'No clear catalyst'.
5. Provide a 3-sentence market summary and 3 bullet key stories.

Return ONLY a valid JSON object matching this schema without codeblocks:
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

    // Try API keys and model fallbacks
    for (let k = 0; k < keyPool.length; k++) {
      const apiKey = keyPool[k];
      const groqClient = new Groq({ apiKey });

      for (let m = 0; m < modelsToTry.length; m++) {
        const model = modelsToTry[m];
        try {
          console.log(`[AI] Attempting Groq analysis with Key #${k + 1} using model ${model}...`);

          const response = await groqClient.chat.completions.create({
            messages: [
              {
                role: 'system',
                content:
                  'You are an expert senior financial analyst specializing in the Indian Stock Market. Respond strictly in valid JSON format.',
              },
              { role: 'user', content: prompt },
            ],
            model,
            temperature: 0.2,
            max_tokens: 900,
            response_format: { type: 'json_object' },
          });

          const content = response.choices[0]?.message?.content;
          if (!content) continue;

          const parsed = JSON.parse(content);
          console.log(`[AI] Successfully generated structured LLM analysis with model ${model}.`);

          return {
            stockAnalyses: parsed.stockAnalyses || {},
            overallAnalysis: parsed.overallAnalysis || {
              market_mood: 'Mixed',
              summary_3_to_5_sentences:
                'Indian benchmark indices traded in a narrow range today amid mixed domestic and global cues.',
              key_market_stories: ['Broad market session concluded with selective stock action.'],
            },
          };
        } catch (err: any) {
          console.warn(`[AI] Groq attempt (Key #${k + 1}, Model ${model}) failed: ${err?.message || err}`);
        }
      }
    }

    console.log('[AI] Groq live request fallback. Using Mock AI Analyzer for current session.');
    return this.mockAnalyzer.analyzeStockMovements(session, newsMap);
  }
}
