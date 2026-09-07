const logger = require('../../lib/utils/logger');
const configLoader = require('../../lib/common/config-loader');
const dataStorage = require('../../lib/common/data-storage');
const { DateTime } = require('luxon');

class DecisionEngine {
  constructor() {
    this.name = 'Decision Engine';
    this.description = 'Motore decisionale finale';
    this.settings = configLoader.getSettings();
    this.weights = configLoader.getWeights();
    this.timezone = configLoader.getTimezone();
  }

  async initialize() {
    logger.info(this.name + ': Initializing...');
    logger.info(this.name + ': Initialized successfully');
  }

  async run() {
    logger.info(this.name + ': Running decision engine...');

    const synthesis = await dataStorage.loadData('decide', 'synthesis_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd') + '.json');
    const suggestions = await dataStorage.loadData('improve', 'suggestions_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd') + '.json');

    const decisions = await this.generateDecisions(synthesis, suggestions);
    await this.saveDecisions(decisions);

    logger.info(this.name + ': Decision engine completed');
    return decisions;
  }

  async generateDecisions(synthesis, suggestions) {
    const now = DateTime.now().setZone(this.timezone);
    const decisions = [];

    if (synthesis && synthesis.decision_table) {
      for (const row of synthesis.decision_table) {
        const decision = await this.makeDecision(row, suggestions);
        decisions.push(decision);
      }
    }

    return {
      timestamp: now.toISO(),
      date: now.toFormat('yyyy-MM-dd'),
      decisions: decisions
    };
  }

  async makeDecision(row, suggestions) {
    const score = row.overall_score || 50;
    const risk = row.risk_level || 'MEDIUM';
    const recommendation = row.recommendation || 'HOLD';
    const suggestedAction = row.suggested_action || 'HOLD';

    let finalDecision = suggestedAction;
    let confidence = 0.5;

    if (score >= 80 && risk === 'LOW') {
      finalDecision = 'BUY';
      confidence = 0.9;
    } else if (score >= 60 && risk !== 'VERY_HIGH') {
      finalDecision = 'BUY';
      confidence = 0.7;
    } else if (score <= 20 && risk !== 'LOW') {
      finalDecision = 'SELL';
      confidence = 0.9;
    } else if (score <= 40) {
      finalDecision = 'SELL';
      confidence = 0.7;
    }

    return {
      ticker: row.ticker,
      name: row.name,
      sector: row.sector,
      decision: finalDecision,
      confidence: confidence,
      score: score,
      risk_level: risk,
      recommendation: recommendation,
      reasoning: 'Score: ' + score + ', Risk: ' + risk + ', Recommendation: ' + recommendation,
      decided_at: new Date().toISOString()
    };
  }

  async saveDecisions(decisions) {
    await dataStorage.saveData('decide', 'decisions_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd_HHmm') + '.json', decisions);
    await dataStorage.saveRecentDecisions(decisions.decisions || []);
  }
}

if (require.main === module) {
  const decisionEngine = new DecisionEngine();
  decisionEngine.initialize()
    .then(() => decisionEngine.run())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = DecisionEngine;