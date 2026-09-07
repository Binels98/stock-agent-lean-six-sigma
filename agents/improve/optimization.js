const logger = require('../../lib/utils/logger');
const configLoader = require('../../lib/common/config-loader');
const dataStorage = require('../../lib/common/data-storage');
const { DateTime } = require('luxon');

class Optimization {
  constructor() {
    this.name = 'Optimization Agent';
    this.description = 'Agente di ottimizzazione portafoglio (Markowitz)';
    this.settings = configLoader.getSettings();
    this.timezone = configLoader.getTimezone();
  }

  async initialize() {
    logger.info(this.name + ': Initializing...');
    logger.info(this.name + ': Initialized successfully');
  }

  async run() {
    logger.info(this.name + ': Running portfolio optimization...');

    const portfolio = configLoader.getPortfolioConfig().portfolio;
    const analysis = await dataStorage.getRecentAnalyses();

    const optimization = await this.optimizePortfolio(portfolio, analysis);
    await this.saveOptimization(optimization);

    logger.info(this.name + ': Portfolio optimization completed');
    return optimization;
  }

  async optimizePortfolio(portfolio, analysis) {
    const now = DateTime.now().setZone(this.timezone);

    const optimizedAllocation = {};
    const targetAllocation = portfolio.target_allocation || {};

    for (const [sector, targetPercent] of Object.entries(targetAllocation)) {
      const sectorStocks = portfolio.stocks?.filter(s => s.sector === sector && s.active) || [];
      const sectorAnalysis = analysis?.filter(a => sectorStocks.some(s => s.ticker === a.ticker)) || [];

      const avgScore = sectorAnalysis.length > 0 ?
        sectorAnalysis.reduce((sum, a) => sum + (a.scores?.overall || 0), 0) / sectorAnalysis.length : 50;

      const adjustedPercent = targetPercent * (avgScore / 50);
      optimizedAllocation[sector] = Math.min(100, Math.max(0, adjustedPercent));
    }

    const total = Object.values(optimizedAllocation).reduce((sum, v) => sum + v, 0);
    const normalizedAllocation = {};
    for (const [sector, percent] of Object.entries(optimizedAllocation)) {
      normalizedAllocation[sector] = (percent / total * 100).toFixed(2);
    }

    return {
      timestamp: now.toISO(),
      date: now.toFormat('yyyy-MM-dd'),
      original_allocation: targetAllocation,
      optimized_allocation: normalizedAllocation,
      optimization_score: this.calculateOptimizationScore(analysis),
      recommendations: this.generateRecommendations(analysis)
    };
  }

  calculateOptimizationScore(analysis) {
    if (analysis.length === 0) return 50;

    const avgScore = analysis.reduce((sum, a) => sum + (a.scores?.overall || 0), 0) / analysis.length;
    return Math.min(100, Math.max(0, avgScore));
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    const buyStocks = analysis.filter(a => a.recommendation === 'BUY' || a.recommendation === 'STRONG_BUY');
    const sellStocks = analysis.filter(a => a.recommendation === 'SELL' || a.recommendation === 'STRONG_SELL');

    if (buyStocks.length > 0) {
      recommendations.push('Consider increasing allocation to: ' + buyStocks.map(s => s.ticker).join(', '));
    }

    if (sellStocks.length > 0) {
      recommendations.push('Consider reducing allocation to: ' + sellStocks.map(s => s.ticker).join(', '));
    }

    return recommendations;
  }

  async saveOptimization(optimization) {
    await dataStorage.saveData('improve', 'optimization_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd_HHmm') + '.json', optimization);
  }
}

if (require.main === module) {
  const optimization = new Optimization();
  optimization.initialize()
    .then(() => optimization.run())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = Optimization;