const logger = require('../../lib/utils/logger');
const configLoader = require('../../lib/common/config-loader');
const dataStorage = require('../../lib/common/data-storage');
const { DateTime } = require('luxon');

class Quality {
  constructor() {
    this.name = 'Quality Agent';
    this.description = 'Agente di validazione qualita dati';
    this.settings = configLoader.getSettings();
    this.timezone = configLoader.getTimezone();
  }

  async initialize() {
    logger.info(this.name + ': Initializing...');
    logger.info(this.name + ': Initialized successfully');
  }

  async run() {
    logger.info(this.name + ': Running data quality validation...');

    const scanResults = await dataStorage.loadData('measure', 'scan_results_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd') + '.json');
    const collectedData = await dataStorage.loadData('measure', 'collected_data_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd') + '.json');

    const qualityReport = await this.validateData(scanResults, collectedData);
    await this.saveQualityReport(qualityReport);

    logger.info(this.name + ': Data quality validation completed');
    return qualityReport;
  }

  async validateData(scanResults, collectedData) {
    const now = DateTime.now().setZone(this.timezone);

    const validatedStocks = [];
    let totalValid = 0;
    let totalInvalid = 0;

    if (collectedData && collectedData.stocks) {
      for (const stockData of collectedData.stocks) {
        const validation = this.validateStockData(stockData);
        validatedStocks.push(validation);
        if (validation.valid) totalValid++;
        else totalInvalid++;
      }
    }

    return {
      timestamp: now.toISO(),
      date: now.toFormat('yyyy-MM-dd'),
      total_stocks: totalValid + totalInvalid,
      valid_stocks: totalValid,
      invalid_stocks: totalInvalid,
      quality_score: totalValid + totalInvalid > 0 ? (totalValid / (totalValid + totalInvalid) * 100).toFixed(2) : 0,
      validated_data: validatedStocks
    };
  }

  validateStockData(stockData) {
    const errors = [];

    if (!stockData.ticker || stockData.ticker.length < 1) {
      errors.push('Missing or invalid ticker');
    }

    if (isNaN(stockData.fundamental_data?.pe_ratio) || stockData.fundamental_data.pe_ratio <= 0) {
      errors.push('Invalid PE ratio');
    }

    if (isNaN(stockData.technical_data?.rsi) || stockData.technical_data.rsi < 0 || stockData.technical_data.rsi > 100) {
      errors.push('Invalid RSI value');
    }

    return {
      ticker: stockData.ticker,
      valid: errors.length === 0,
      errors: errors,
      validated_at: new Date().toISOString()
    };
  }

  async saveQualityReport(report) {
    await dataStorage.saveData('measure', 'quality_report_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd_HHmm') + '.json', report);
  }
}

if (require.main === module) {
  const quality = new Quality();
  quality.initialize()
    .then(() => quality.run())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = Quality;