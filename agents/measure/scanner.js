const logger = require('../../lib/utils/logger');
const configLoader = require('../../lib/common/config-loader');
const dataStorage = require('../../lib/common/data-storage');
const { DateTime } = require('luxon');

class Scanner {
  constructor() {
    this.name = 'Scanner Agent';
    this.description = 'Agente di scansione mercato';
    this.settings = configLoader.getSettings();
    this.portfolioConfig = configLoader.getPortfolioConfig();
    this.timezone = configLoader.getTimezone();
  }

  async initialize() {
    logger.info(this.name + ': Initializing...');
    logger.info(this.name + ': Initialized successfully');
  }

  async run() {
    logger.info(this.name + ': Running market scan...');

    const scanResults = await this.scanMarket();
    await this.saveScanResults(scanResults);

    logger.info(this.name + ': Market scan completed');
    return scanResults;
  }

  async scanMarket() {
    const now = DateTime.now().setZone(this.timezone);
    const portfolio = this.portfolioConfig.portfolio;
    const watchlist = portfolio.watchlist || [];

    const scanResults = {
      timestamp: now.toISO(),
      date: now.toFormat('yyyy-MM-dd'),
      scanned_stocks: [],
      interesting_stocks: []
    };

    for (const ticker of watchlist) {
      const stockData = await this.scanStock(ticker);
      scanResults.scanned_stocks.push(stockData);

      if (this.isInteresting(stockData)) {
        scanResults.interesting_stocks.push(stockData);
      }
    }

    return scanResults;
  }

  async scanStock(ticker) {
    const priceChange = (Math.random() * 10 - 5).toFixed(2);
    const volume = Math.floor(Math.random() * 10000000) + 1000000;
    const newsSentiment = Math.random() * 2 - 1;

    return {
      ticker: ticker,
      last_price: 100 + Math.random() * 200,
      daily_change_percent: parseFloat(priceChange),
      volume: volume,
      news_sentiment: newsSentiment,
      scanned_at: new Date().toISOString()
    };
  }

  isInteresting(stockData) {
    return Math.abs(stockData.daily_change_percent) > 2 ||
           Math.abs(stockData.news_sentiment) > 0.5 ||
           stockData.volume > 5000000;
  }

  async saveScanResults(results) {
    await dataStorage.saveData('measure', 'scan_results_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd_HHmm') + '.json', results);
  }
}

if (require.main === module) {
  const scanner = new Scanner();
  scanner.initialize()
    .then(() => scanner.run())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = Scanner;