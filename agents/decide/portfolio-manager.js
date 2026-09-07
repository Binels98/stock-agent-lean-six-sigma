const logger = require('../../lib/utils/logger');
const configLoader = require('../../lib/common/config-loader');
const dataStorage = require('../../lib/common/data-storage');
const { DateTime } = require('luxon');

class PortfolioManager {
  constructor() {
    this.name = 'Portfolio Manager';
    this.description = 'Gestore portafoglio e sintesi analisi';
    this.settings = configLoader.getSettings();
    this.weights = configLoader.getWeights();
    this.timezone = configLoader.getTimezone();
  }

  async initialize() {
    logger.info(this.name + ': Initializing...');
    logger.info(this.name + ': Initialized successfully');
  }

  async run() {
    logger.info(this.name + ': Running portfolio synthesis...');

    const analysis = await dataStorage.getRecentAnalyses();
    const suggestions = await dataStorage.loadData('improve', 'suggestions_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd') + '.json');

    const synthesis = await this.createSynthesis(analysis, suggestions);
    await this.saveSynthesis(synthesis);

    logger.info(this.name + ': Portfolio synthesis completed');
    return synthesis;
  }

  async createSynthesis(analysis, suggestions) {
    const now = DateTime.now().setZone(this.timezone);

    const decisionTable = this.createDecisionTable(analysis, suggestions);
    const summary = this.createSummary(analysis, suggestions);

    return {
      timestamp: now.toISO(),
      date: now.toFormat('yyyy-MM-dd'),
      decision_table: decisionTable,
      summary: summary,
      recommendations: this.generateRecommendations(analysis, suggestions)
    };
  }

  createDecisionTable(analysis, suggestions) {
    const table = [];

    for (const stockAnalysis of analysis || []) {
      const stockSuggestion = suggestions?.buy_suggestions?.find(s => s.ticker === stockAnalysis.ticker) ||
                           suggestions?.sell_suggestions?.find(s => s.ticker === stockAnalysis.ticker) ||
                           suggestions?.hold_suggestions?.find(s => s.ticker === stockAnalysis.ticker) ||
                           {};

      table.push({
        ticker: stockAnalysis.ticker,
        name: stockAnalysis.name,
        sector: stockAnalysis.sector,
        fundamental_score: stockAnalysis.scores?.fundamental || 0,
        technical_score: stockAnalysis.scores?.technical || 0,
        overall_score: stockAnalysis.scores?.overall || 0,
        recommendation: stockAnalysis.recommendation || 'HOLD',
        suggested_action: stockSuggestion.action || 'HOLD',
        priority: stockSuggestion.priority || 'MEDIUM',
        risk_level: stockSuggestion.risk_level || 'MEDIUM'
      });
    }

    return table.sort((a, b) => b.overall_score - a.overall_score);
  }

  createSummary(analysis, suggestions) {
    const totalStocks = analysis?.length || 0;
    const buyStocks = analysis?.filter(a => a.recommendation === 'BUY' || a.recommendation === 'STRONG_BUY').length || 0;
    const sellStocks = analysis?.filter(a => a.recommendation === 'SELL' || a.recommendation === 'STRONG_SELL').length || 0;
    const holdStocks = totalStocks - buyStocks - sellStocks;

    const avgScore = totalStocks > 0 ?
      analysis.reduce((sum, a) => sum + (a.scores?.overall || 0), 0) / totalStocks : 0;

    return {
      total_stocks: totalStocks,
      buy_recommendations: buyStocks,
      sell_recommendations: sellStocks,
      hold_recommendations: holdStocks,
      average_score: avgScore.toFixed(2),
      overall_sentiment: this.getOverallSentiment(avgScore)
    };
  }

  getOverallSentiment(score) {
    if (score >= 70) return 'BULLISH';
    if (score >= 50) return 'MILDLY_BULLISH';
    if (score >= 30) return 'NEUTRAL';
    if (score >= 10) return 'MILDLY_BEARISH';
    return 'BEARISH';
  }

  generateRecommendations(analysis, suggestions) {
    const recommendations = [];

    const strongBuys = analysis?.filter(a => a.recommendation === 'STRONG_BUY') || [];
    const strongSells = analysis?.filter(a => a.recommendation === 'STRONG_SELL') || [];

    if (strongBuys.length > 0) {
      recommendations.push('Strong buy opportunities: ' + strongBuys.map(s => s.ticker + ' (' + s.scores?.overall + ')').join(', '));
    }

    if (strongSells.length > 0) {
      recommendations.push('Strong sell candidates: ' + strongSells.map(s => s.ticker + ' (' + s.scores?.overall + ')').join(', '));
    }

    return recommendations;
  }

  async saveSynthesis(synthesis) {
    await dataStorage.saveData('decide', 'synthesis_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd_HHmm') + '.json', synthesis);
  }
}

if (require.main === module) {
  const portfolioManager = new PortfolioManager();
  portfolioManager.initialize()
    .then(() => portfolioManager.run())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = PortfolioManager;