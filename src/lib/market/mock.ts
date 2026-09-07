// ==============================================================================
// MOCK MARKET DATA PROVIDER (FOR DEV TESTING)
// ==============================================================================
import { IMarketDataProvider } from './types';
import { MarketSessionData, StockQuote } from '../types';

export class MockMarketDataProvider implements IMarketDataProvider {
  async getMarketSessionData(dateStr: string): Promise<MarketSessionData> {
    const gainers: StockQuote[] = [
      {
        symbol: 'RELIANCE.NS',
        companyName: 'Reliance Industries Ltd',
        price: 3045.5,
        previousClose: 2910.0,
        change: 135.5,
        percentageChange: 4.66,
        volume: 8450000,
        marketCap: 20600000000000,
        tradingDate: dateStr,
        direction: 'GAINER',
      },
      {
        symbol: 'TATAMOTORS.NS',
        companyName: 'Tata Motors Ltd',
        price: 1085.2,
        previousClose: 1042.0,
        change: 43.2,
        percentageChange: 4.15,
        volume: 12300000,
        tradingDate: dateStr,
        direction: 'GAINER',
      },
      {
        symbol: 'INFY.NS',
        companyName: 'Infosys Ltd',
        price: 1940.8,
        previousClose: 1878.0,
        change: 62.8,
        percentageChange: 3.34,
        volume: 6100000,
        tradingDate: dateStr,
        direction: 'GAINER',
      },
      {
        symbol: 'BHARTIARTL.NS',
        companyName: 'Bharti Airtel Ltd',
        price: 1560.4,
        previousClose: 1518.0,
        change: 42.4,
        percentageChange: 2.79,
        volume: 4800000,
        tradingDate: dateStr,
        direction: 'GAINER',
      },
      {
        symbol: 'LT.NS',
        companyName: 'Larsen & Toubro Ltd',
        price: 3780.0,
        previousClose: 3685.0,
        change: 95.0,
        percentageChange: 2.58,
        volume: 3200000,
        tradingDate: dateStr,
        direction: 'GAINER',
      },
    ];

    const losers: StockQuote[] = [
      {
        symbol: 'HDFCBANK.NS',
        companyName: 'HDFC Bank Ltd',
        price: 1610.0,
        previousClose: 1672.0,
        change: -62.0,
        percentageChange: -3.71,
        volume: 15400000,
        tradingDate: dateStr,
        direction: 'LOSER',
      },
      {
        symbol: 'TCS.NS',
        companyName: 'Tata Consultancy Services Ltd',
        price: 4350.0,
        previousClose: 4490.0,
        change: -140.0,
        percentageChange: -3.12,
        volume: 4100000,
        tradingDate: dateStr,
        direction: 'LOSER',
      },
      {
        symbol: 'ICICIBANK.NS',
        companyName: 'ICICI Bank Ltd',
        price: 1205.5,
        previousClose: 1238.0,
        change: -32.5,
        percentageChange: -2.63,
        volume: 9800000,
        tradingDate: dateStr,
        direction: 'LOSER',
      },
      {
        symbol: 'ITC.NS',
        companyName: 'ITC Ltd',
        price: 495.2,
        previousClose: 508.0,
        change: -12.8,
        percentageChange: -2.52,
        volume: 7200000,
        tradingDate: dateStr,
        direction: 'LOSER',
      },
      {
        symbol: 'SBIN.NS',
        companyName: 'State Bank of India',
        price: 812.0,
        previousClose: 830.0,
        change: -18.0,
        percentageChange: -2.17,
        volume: 11200000,
        tradingDate: dateStr,
        direction: 'LOSER',
      },
    ];

    return {
      tradingDate: dateStr,
      nifty50: {
        symbol: '^NSEI',
        name: 'NIFTY 50',
        price: 24852.15,
        previousClose: 24710.3,
        change: 141.85,
        percentageChange: 0.57,
      },
      sensex: {
        symbol: '^BSESN',
        name: 'SENSEX',
        price: 81320.4,
        previousClose: 80890.1,
        change: 430.3,
        percentageChange: 0.53,
      },
      gainers,
      losers,
      marketBreadth: {
        advances: 1420,
        declines: 1080,
        unchanged: 85,
      },
    };
  }
}
