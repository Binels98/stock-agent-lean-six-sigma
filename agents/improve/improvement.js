const logger = require('../../lib/utils/logger');
const configLoader = require('../../lib/common/config-loader');
const dataStorage = require('../../lib/common/data-storage');
const { DateTime } = require('luxon');

class Improvement {
  constructor() {
    this.name = 'Improvement Agent';
    this.description = 'Agente di generazione suggerimenti';
    this.settings = configLoader.getSettings();
    this.timezone = configLoader.getTimezone();
  }

  async initialize() {
    logger.info(this.name + ': Initializing...');
    logger.info(this.name + ': Initialized successfully');
  }

  async run() {
    logger.info(this.name + ': Running improvement analysis...');

    const analysis = await dataStorage.getRecentAnalyses();
    const riskAssessment = await dataStorage.loadData('analysis', 'risk_assessment_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd') + '.json');

    const suggestions = await this.generateSuggestions(analysis, riskAssessment);
    await this.saveSuggestions(suggestions);

    logger.info(this.name + ': Improvement analysis completed');
    return suggestions;
  }

  async generateSuggestions(analysis, riskAssessment) {
    const now = DateTime.now().setZone(this.timezone);
    const suggestions = {
      timestamp: now.toISO(),
      date: now.toFormat('yyyy-MM-dd'),
      buy_suggestions: [],
      sell_suggestions: [],
      hold_suggestions: []
    };

    if (analysis && analysis.length > 0) {
      for (const stockAnalysis of analysis) {
        const suggestion = this.generateStockSuggestion(stockAnalysis, riskAssessment);
        if (suggestion.action === 'BUY' || suggestion.action === 'STRONG_BUY') {
          suggestions.buy_suggestions.push(suggestion);
        } else if (suggestion.action === 'SELL' || suggestion.action === 'STRONG_SELL') {
          suggestions.sell_suggestions.push(suggestion);
        } else {
          suggestions.hold_suggestions.push(suggestion);
        }
      }
    }

    return suggestions;
  }

  generateStockSuggestion(stockAnalysis, riskAssessment) {
    const stockRisk = riskAssessment?.stocks?.find(s => s.ticker === stockAnalysis.ticker);
    const riskLevel = stockRisk?.risk_level || 'MEDIUM';
    const score = stockAnalysis.scores?.overall || 50;

    let action = stockAnalysis.recommendation || 'HOLD';
    let priority = 'MEDIUM';

    if (score >= 80 && riskLevel === 'LOW') {
      action = 'STRONG_BUY';
      priority = 'HIGH';
    } else if (score >= 60 && riskLevel !== 'VERY_HIGH') {
      action = 'BUY';
      priority = 'MEDIUM';
    } else if (score <= 20 && riskLevel !== 'LOW') {
      action = 'STRONG_SELL';
      priority = 'HIGH';
    } else if (score <= 40) {
      action = 'SELL';
      priority = 'MEDIUM';
    }

    return {
      ticker: stockAnalysis.ticker,
      name: stockAnalysis.name,
      action: action,
      priority: priority,
      score: score,
      risk_level: riskLevel,
      reason: 'Based on analysis score of ' + score + ' and risk level ' + riskLevel,
      suggested_at: new Date().toISOString()
    };
  }

  async saveSuggestions(suggestions) {
    await dataStorage.saveData('improve', 'suggestions_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd_HHmm') + '.json', suggestions);
  }
}

if (require.main === module) {
  const improvement = new Improvement();
  improvement.initialize()
    .then(() => improvement.run())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = Improvement;