// ==============================================================================
// MARKET DATA PROVIDER INTERFACE
// ==============================================================================
import { MarketSessionData } from '../types';

export interface IMarketDataProvider {
  getMarketSessionData(dateStr: string): Promise<MarketSessionData>;
}
