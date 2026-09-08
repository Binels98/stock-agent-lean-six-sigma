const logger = require('../../lib/utils/logger');
const configLoader = require('../../lib/common/config-loader');
const dataStorage = require('../../lib/common/data-storage');
const FundamentalService = require('../../lib/services/fundamental-service');
const TechnicalService = require('../../lib/services/technical-service');
const { DateTime } = require('luxon');

class DataCollector {
  constructor() {
    this.name = 'Data Collector Agent';
    this.description = 'Agente di raccolta dati fondamentali e tecnici';
    this.settings = configLoader.getSettings();
    this.portfolioConfig = configLoader.getPortfolioConfig();
    this.timezone = configLoader.getTimezone();
    this.fundamentalService = FundamentalService;
    this.technicalService = TechnicalService;
  }

  async initialize() {
    logger.info(this.name + ': Initializing...');
    logger.info(this.name + ': Initialized successfully');
  }

  async run() {
    logger.info(this.name + ': Running data collection...');

    const collectedData = await this.collectData();
    await this.saveCollectedData(collectedData);

    logger.info(this.name + ': Data collection completed');
    return collectedData;
  }

  async collectData() {
    const now = DateTime.now().setZone(this.timezone);
    const portfolio = this.portfolioConfig.portfolio;

    const collectedData = {
      timestamp: now.toISO(),
      date: now.toFormat('yyyy-MM-dd'),
      stocks: []
    };

    for (const stock of portfolio.stocks || []) {
      const stockData = await this.collectStockData(stock);
      collectedData.stocks.push(stockData);
    }

    return collectedData;
  }

  async collectStockData(stock) {
    const fundamentalData = await this.fundamentalService.getFundamentalData(stock.ticker);
    const technicalData = await this.technicalService.getTechnicalData(stock.ticker);

    if (!fundamentalData) {
      logger.warn('No fundamental data for ' + stock.ticker + ', using fallback mock data');
    }

    if (!technicalData) {
      logger.warn('No technical data for ' + stock.ticker + ', using fallback mock data');
    }

    return {
      ticker: stock.ticker,
      name: stock.name,
      exchange: stock.exchange,
      sector: stock.sector,
      fundamental_data: fundamentalData || {
        pe_ratio: (Math.random() * 30 + 5).toFixed(2),
        pb_ratio: (Math.random() * 5 + 0.5).toFixed(2),
        eps: (Math.random() * 10).toFixed(2),
        revenue: Math.floor(Math.random() * 100000000000) + 1000000000,
        debt_equity: (Math.random() * 2).toFixed(2)
      },
      technical_data: technicalData || {
        rsi: Math.floor(Math.random() * 100),
        macd: (Math.random() * 2 - 1).toFixed(4),
        bollinger_upper: (Math.random() * 10 + 100).toFixed(2),
        bollinger_lower: (Math.random() * 10 + 80).toFixed(2)
      },
      data_source: (fundamentalData && technicalData) ? 'FMP_API' : 'MOCK',
      collected_at: new Date().toISOString()
    };
  }

  async saveCollectedData(data) {
    await dataStorage.saveData('measure', 'collected_data_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd_HHmm') + '.json', data);
  }
}

if (require.main === module) {
  const collector = new DataCollector();
  collector.initialize()
    .then(() => collector.run())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = DataCollector;