// ==============================================================================
// NEWS PROVIDER INTERFACE
// ==============================================================================
import { NewsArticle } from '../types';

export interface INewsProvider {
  getNewsForStock(symbol: string, companyName: string, dateStr: string): Promise<NewsArticle[]>;
}
