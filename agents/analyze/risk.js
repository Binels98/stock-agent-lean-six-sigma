const logger = require('../../lib/utils/logger');
const configLoader = require('../../lib/common/config-loader');
const dataStorage = require('../../lib/common/data-storage');
const { DateTime } = require('luxon');

class RiskAnalyzer {
  constructor() {
    this.name = 'Risk Agent';
    this.description = 'Agente di valutazione rischi';
    this.settings = configLoader.getSettings();
    this.thresholds = configLoader.getThresholds();
    this.timezone = configLoader.getTimezone();
  }

  async initialize() {
    logger.info(this.name + ': Initializing...');
    logger.info(this.name + ': Initialized successfully');
  }

  async run() {
    logger.info(this.name + ': Running risk assessment...');

    const collectedData = await dataStorage.loadData('measure', 'collected_data_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd') + '.json');

    const riskAssessment = await this.assessRisk(collectedData);
    await this.saveRiskAssessment(riskAssessment);

    logger.info(this.name + ': Risk assessment completed');
    return riskAssessment;
  }

  async assessRisk(collectedData) {
    const now = DateTime.now().setZone(this.timezone);
    const riskAssessment = {
      timestamp: now.toISO(),
      date: now.toFormat('yyyy-MM-dd'),
      stocks: []
    };

    if (collectedData && collectedData.stocks) {
      for (const stockData of collectedData.stocks) {
        const stockRisk = await this.assessStockRisk(stockData);
        riskAssessment.stocks.push(stockRisk);
      }
    }

    riskAssessment.overall_risk = this.calculateOverallRisk(riskAssessment.stocks);

    return riskAssessment;
  }

  async assessStockRisk(stockData) {
    const fundamentalRisk = this.assessFundamentalRisk(stockData.fundamental_data);
    const technicalRisk = this.assessTechnicalRisk(stockData.technical_data);
    const overallRisk = Math.max(fundamentalRisk, technicalRisk);

    return {
      ticker: stockData.ticker,
      name: stockData.name,
      fundamental_risk: fundamentalRisk,
      technical_risk: technicalRisk,
      overall_risk: overallRisk,
      risk_level: this.getRiskLevel(overallRisk),
      assessed_at: new Date().toISOString()
    };
  }

  assessFundamentalRisk(fundamentalData) {
    if (!fundamentalData) return 'LOW';

    const pe = parseFloat(fundamentalData.pe_ratio) || 0;
    const pb = parseFloat(fundamentalData.pb_ratio) || 0;
    const debtEquity = parseFloat(fundamentalData.debt_equity) || 0;

    if (pe > 30 || pb > 4 || debtEquity > 2) return 'VERY_HIGH';
    if (pe > 25 || pb > 3 || debtEquity > 1.5) return 'HIGH';
    if (pe > 20 || pb > 2 || debtEquity > 1) return 'MEDIUM';
    return 'LOW';
  }

  assessTechnicalRisk(technicalData) {
    if (!technicalData) return 'LOW';

    const rsi = parseInt(technicalData.rsi) || 50;
    const macd = parseFloat(technicalData.macd) || 0;

    if (rsi > 80 || rsi < 20) return 'VERY_HIGH';
    if (rsi > 70 || rsi < 30) return 'HIGH';
    if (rsi > 60 || rsi < 40) return 'MEDIUM';
    return 'LOW';
  }

  calculateOverallRisk(stockRisks) {
    if (stockRisks.length === 0) return 'LOW';

    const riskLevels = { VERY_HIGH: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    const avgRisk = stockRisks.reduce((sum, s) => sum + riskLevels[s.risk_level], 0) / stockRisks.length;

    if (avgRisk >= 3.5) return 'VERY_HIGH';
    if (avgRisk >= 2.5) return 'HIGH';
    if (avgRisk >= 1.5) return 'MEDIUM';
    return 'LOW';
  }

  getRiskLevel(riskScore) {
    if (riskScore === 'VERY_HIGH') return 'VERY_HIGH';
    if (riskScore === 'HIGH') return 'HIGH';
    if (riskScore === 'MEDIUM') return 'MEDIUM';
    return 'LOW';
  }

  async saveRiskAssessment(assessment) {
    await dataStorage.saveData('analysis', 'risk_assessment_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd_HHmm') + '.json', assessment);
  }
}

if (require.main === module) {
  const riskAnalyzer = new RiskAnalyzer();
  riskAnalyzer.initialize()
    .then(() => riskAnalyzer.run())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = RiskAnalyzer;