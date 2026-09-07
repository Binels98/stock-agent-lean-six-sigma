const logger = require('../../lib/utils/logger');
const configLoader = require('../../lib/common/config-loader');
const dataStorage = require('../../lib/common/data-storage');
const { DateTime } = require('luxon');

class Analyzer {
  constructor() {
    this.name = 'Analyzer Agent';
    this.description = 'Agente di analisi completa dati';
    this.settings = configLoader.getSettings();
    this.weights = configLoader.getWeights();
    this.timezone = configLoader.getTimezone();
  }

  async initialize() {
    logger.info(this.name + ': Initializing...');
    logger.info(this.name + ': Initialized successfully');
  }

  async run() {
    logger.info(this.name + ': Running complete analysis...');

    const collectedData = await dataStorage.loadData('measure', 'collected_data_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd') + '.json');
    const scanResults = await dataStorage.loadData('measure', 'scan_results_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd') + '.json');

    const analysis = await this.performAnalysis(collectedData, scanResults);
    await this.saveAnalysis(analysis);

    logger.info(this.name + ': Complete analysis completed');
    return analysis;
  }

  async performAnalysis(collectedData, scanResults) {
    const now = DateTime.now().setZone(this.timezone);
    const analysis = {
      timestamp: now.toISO(),
      date: now.toFormat('yyyy-MM-dd'),
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
    const fundamentalScore = this.calculateFundamentalScore(stockData.fundamental_data);
    const technicalScore = this.calculateTechnicalScore(stockData.technical_data);
    const overallScore = (fundamentalScore * 0.6 + technicalScore * 0.4).toFixed(2);

    return {
      ticker: stockData.ticker,
      name: stockData.name,
      sector: stockData.sector,
      scores: {
        fundamental: fundamentalScore,
        technical: technicalScore,
        overall: parseFloat(overallScore)
      },
      recommendation: this.getRecommendation(parseFloat(overallScore)),
      analyzed_at: new Date().toISOString()
    };
  }

  calculateFundamentalScore(fundamentalData) {
    if (!fundamentalData) return 50;

    let score = 0;
    const pe = parseFloat(fundamentalData.pe_ratio) || 0;
    const pb = parseFloat(fundamentalData.pb_ratio) || 0;
    const eps = parseFloat(fundamentalData.eps) || 0;
    const debtEquity = parseFloat(fundamentalData.debt_equity) || 0;

    if (pe > 0 && pe < 15) score += 30;
    else if (pe >= 15 && pe < 25) score += 20;
    else if (pe >= 25) score += 10;

    if (pb > 0 && pb < 2) score += 20;
    else if (pb >= 2 && pb < 3) score += 15;
    else if (pb >= 3) score += 5;

    if (eps > 0) score += 25;
    else score += 10;

    if (debtEquity < 1) score += 25;
    else if (debtEquity >= 1 && debtEquity < 2) score += 15;
    else score += 5;

    return Math.min(100, Math.max(0, score));
  }

  calculateTechnicalScore(technicalData) {
    if (!technicalData) return 50;

    let score = 0;
    const rsi = parseInt(technicalData.rsi) || 50;
    const macd = parseFloat(technicalData.macd) || 0;

    if (rsi >= 30 && rsi <= 70) score += 40;
    else if (rsi < 30) score += 25;
    else if (rsi > 70) score += 15;

    if (macd > 0) score += 30;
    else if (macd < 0) score += 15;
    else score += 25;

    if (technicalData.bollinger_upper && technicalData.bollinger_lower) {
      score += 30;
    }

    return Math.min(100, Math.max(0, score));
  }

  getRecommendation(score) {
    if (score >= 80) return 'STRONG_BUY';
    if (score >= 60) return 'BUY';
    if (score >= 40) return 'HOLD';
    if (score >= 20) return 'SELL';
    return 'STRONG_SELL';
  }

  async saveAnalysis(analysis) {
    await dataStorage.saveData('analysis', 'analysis_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd_HHmm') + '.json', analysis);
    await dataStorage.saveRecentAnalyses(analysis.stocks);
  }
}

if (require.main === module) {
  const analyzer = new Analyzer();
  analyzer.initialize()
    .then(() => analyzer.run())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = Analyzer;