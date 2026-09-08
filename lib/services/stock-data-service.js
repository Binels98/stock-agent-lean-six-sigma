const FMPService = require('./fmp-service');
const logger = require('../utils/logger');

/**
 * Stock Data Service
 * Provides real-time and historical stock data using FMP API
 */
class StockDataService {
  constructor() {
    this.fmpService = FMPService;
  }

  async getStockData(ticker) {
    try {
      const quote = await this.fmpService.getStockQuote(ticker);
      
      if (!quote) {
        logger.warn('No quote data for ticker: ' + ticker);
        return null;
      }

      return {
        ticker: ticker,
        name: quote.name || ticker,
        last_price: parseFloat(quote.price) || 0,
        daily_change: parseFloat(quote.change) || 0,
        daily_change_percent: parseFloat(quote.changesPercentage) || 0,
        volume: parseInt(quote.volume) || 0,
        previous_close: parseFloat(quote.previousClose) || 0,
        open: parseFloat(quote.open) || 0,
        high: parseFloat(quote.dayHigh) || 0,
        low: parseFloat(quote.dayLow) || 0,
        fifty_two_week_high: parseFloat(quote.yearHigh) || 0,
        fifty_two_week_low: parseFloat(quote.yearLow) || 0,
        market_cap: parseFloat(quote.marketCap) || 0,
        pe_ratio: parseFloat(quote.pe) || 0,
        eps: parseFloat(quote.eps) || 0,
        exchange: quote.exchange || 'Unknown',
        currency: quote.currency || 'USD',
        last_updated: new Date().toISOString(),
        data_source: 'FMP_API'
      };
    } catch (error) {
      logger.error('Error fetching stock data for ' + ticker + ': ' + error.message);
      return null;
    }
  }

  async getMultipleStockData(tickers) {
    const results = [];
    
    for (const ticker of tickers) {
      const stockData = await this.getStockData(ticker);
      if (stockData) {
        results.push(stockData);
      }
    }
    
    return results;
  }

  async getHistoricalData(ticker, options = {}) {
    try {
      const historical = await this.fmpService.getHistoricalPrices(ticker, options);
      
      if (!historical || !historical.historical) {
        return [];
      }

      return historical.historical.map(h => ({
        date: h.date,
        open: parseFloat(h.open) || 0,
        high: parseFloat(h.high) || 0,
        low: parseFloat(h.low) || 0,
        close: parseFloat(h.close) || 0,
        volume: parseInt(h.volume) || 0,
        adjusted_close: parseFloat(h.adjClose) || 0
      }));
    } catch (error) {
      logger.error('Error fetching historical data for ' + ticker + ': ' + error.message);
      return [];
    }
  }

  calculateDailyChange(stockData) {
    if (!stockData || !stockData.last_price || !stockData.previous_close) {
      return 0;
    }
    
    const change = stockData.last_price - stockData.previous_close;
    const percentage = (change / stockData.previous_close) * 100;
    return parseFloat(percentage.toFixed(2));
  }

  isInteresting(stockData) {
    if (!stockData) return false;
    
    const priceChange = Math.abs(stockData.daily_change_percent || 0);
    const volume = stockData.volume || 0;
    
    return priceChange > 2 || volume > 5000000;
  }
}

module.exports = new StockDataService();