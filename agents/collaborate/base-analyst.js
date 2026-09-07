const logger = require('../../lib/utils/logger');
const configLoader = require('../../lib/common/config-loader');
const dataStorage = require('../../lib/common/data-storage');
const { DateTime } = require('luxon');

class BaseAnalyst {
  constructor(name, description, philosophy) {
    this.name = name || 'Base Analyst';
    this.description = description || 'Analista base';
    this.philosophy = philosophy || 'Generic';
    this.settings = configLoader.getSettings();
    this.weights = configLoader.getWeights();
    this.timezone = configLoader.getTimezone();
    this.portfolioConfig = configLoader.getPortfolioConfig();
  }

  async initialize() {
    logger.info(this.name + ': Initializing...');
    logger.info(this.name + ': Initialized successfully');
  }

  async run() {
    logger.info(this.name + ': Running ' + this.philosophy + ' analysis...');

    const collectedData = await dataStorage.loadData('measure', 'collected_data_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd') + '.json');

    const analysis = await this.performAnalysis(collectedData);
    await this.saveAnalysis(analysis);

    logger.info(this.name + ': ' + this.philosophy + ' analysis completed');
    return analysis;
  }

  async performAnalysis(collectedData) {
    const now = DateTime.now().setZone(this.timezone);
    const analysis = {
      timestamp: now.toISO(),
      date: now.toFormat('yyyy-MM-dd'),
      analyst: this.name,
      philosophy: this.philosophy,
      stocks: []
    };

    if (collectedData && collectedData.stocks) {
      for (const stockData of collectedData.stocks) {
        const stockAnalysis = await this.analyzeStock(stockData);
        analysis.stocks.push(stockAnalysis);
      }
    }

    return analysis;
  }

  async analyzeStock(stockData) {
    const score = await this.calculateScore(stockData);
    const recommendation = this.getRecommendation(score);

    return {
      ticker: stockData.ticker,
      name: stockData.name,
      sector: stockData.sector,
      score: score,
      recommendation: recommendation,
      analysis: this.getAnalysisDetails(stockData, score),
      analyzed_at: new Date().toISOString()
    };
  }

  async calculateScore(stockData) {
    return 50;
  }

  getRecommendation(score) {
    if (score >= 80) return 'STRONG_BUY';
    if (score >= 60) return 'BUY';
    if (score >= 40) return 'HOLD';
    if (score >= 20) return 'SELL';
    return 'STRONG_SELL';
  }

  getAnalysisDetails(stockData, score) {
    return { details: 'Analysis details for ' + stockData.ticker };
  }

  async saveAnalysis(analysis) {
    const filename = this.name.toLowerCase().replace(/s+/g, '_') + '_analysis_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd_HHmm') + '.json';
    await dataStorage.saveData('analysis/collaborate', filename, analysis);
  }
}

module.exports = BaseAnalyst;