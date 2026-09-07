const logger = require('../../lib/utils/logger');
const configLoader = require('../../lib/common/config-loader');
const dataStorage = require('../../lib/common/data-storage');
const { DateTime } = require('luxon');

class ConsensusBuilder {
  constructor() {
    this.name = 'Consensus Builder';
    this.description = 'Costruttore di consenso tra analisti';
    this.settings = configLoader.getSettings();
    this.weights = configLoader.getWeights();
    this.timezone = configLoader.getTimezone();
  }

  async initialize() {
    logger.info(this.name + ': Initializing...');
    logger.info(this.name + ': Initialized successfully');
  }

  async run() {
    logger.info(this.name + ': Building consensus...');

    const analysis = await dataStorage.getRecentAnalyses();
    const decisions = await dataStorage.loadData('decide', 'decisions_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd') + '.json');

    const consensus = await this.buildConsensus(analysis, decisions);
    await this.saveConsensus(consensus);

    logger.info(this.name + ': Consensus building completed');
    return consensus;
  }

  async buildConsensus(analysis, decisions) {
    const now = DateTime.now().setZone(this.timezone);

    const agreementAreas = [];
    const disagreementAreas = [];

    if (analysis && analysis.length > 0) {
      const sectors = {};
      for (const stock of analysis) {
        if (!sectors[stock.sector]) {
          sectors[stock.sector] = [];
        }
        sectors[stock.sector].push(stock);
      }

      for (const [sector, stocks] of Object.entries(sectors)) {
        const avgScore = stocks.reduce((sum, s) => sum + (s.scores?.overall || 0), 0) / stocks.length;
        const allBuy = stocks.every(s => s.recommendation === 'BUY' || s.recommendation === 'STRONG_BUY');
        const allSell = stocks.every(s => s.recommendation === 'SELL' || s.recommendation === 'STRONG_SELL');

        if (allBuy) {
          agreementAreas.push({
            sector: sector,
            agreement: 'BUY',
            average_score: avgScore.toFixed(2),
            stocks: stocks.length
          });
        } else if (allSell) {
          agreementAreas.push({
            sector: sector,
            agreement: 'SELL',
            average_score: avgScore.toFixed(2),
            stocks: stocks.length
          });
        } else {
          disagreementAreas.push({
            sector: sector,
            disagreement: 'MIXED',
            average_score: avgScore.toFixed(2),
            stocks: stocks.length
          });
        }
      }
    }

    return {
      timestamp: now.toISO(),
      date: now.toFormat('yyyy-MM-dd'),
      agreement_areas: agreementAreas,
      disagreement_areas: disagreementAreas,
      agreement_score: this.calculateAgreementScore(agreementAreas, analysis?.length || 0),
      disagreement_score: this.calculateDisagreementScore(disagreementAreas, analysis?.length || 0)
    };
  }

  calculateAgreementScore(agreementAreas, totalStocks) {
    if (totalStocks === 0) return 0;
    const totalAgreed = agreementAreas.reduce((sum, a) => sum + a.stocks, 0);
    return (totalAgreed / totalStocks * 100).toFixed(2);
  }

  calculateDisagreementScore(disagreementAreas, totalStocks) {
    if (totalStocks === 0) return 0;
    const totalDisagreed = disagreementAreas.reduce((sum, a) => sum + a.stocks, 0);
    return (totalDisagreed / totalStocks * 100).toFixed(2);
  }

  async saveConsensus(consensus) {
    await dataStorage.saveData('decide', 'consensus_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd_HHmm') + '.json', consensus);
  }
}

if (require.main === module) {
  const consensusBuilder = new ConsensusBuilder();
  consensusBuilder.initialize()
    .then(() => consensusBuilder.run())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = ConsensusBuilder;