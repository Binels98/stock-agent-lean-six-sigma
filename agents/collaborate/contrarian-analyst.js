const BaseAnalyst = require('./base-analyst');
const logger = require('../../lib/utils/logger');

class ContrarianAnalyst extends BaseAnalyst {
  constructor() {
    super('Contrarian Analyst', 'Analista Controcorrente (acquisto quando gli altri vendono)', 'Contrarian');
  }

  async calculateScore(stockData) {
    if (!stockData.fundamental_data || !stockData.technical_data) return 50;

    let score = 0;
    const fundamental = stockData.fundamental_data;
    const technical = stockData.technical_data;

    const pe = parseFloat(fundamental.pe_ratio) || 0;
    const pb = parseFloat(fundamental.pb_ratio) || 0;
    const rsi = parseInt(technical.rsi) || 50;

    if (pe < 10) score += 30;
    else if (pe >= 10 && pe < 15) score += 20;
    else score += 5;

    if (pb < 1) score += 25;
    else if (pb >= 1 && pb < 1.5) score += 15;
    else score += 5;

    if (rsi < 30) score += 25;
    else if (rsi >= 30 && rsi < 40) score += 15;
    else score += 5;

    if (stockData.daily_change_percent && stockData.daily_change_percent < -2) score += 20;

    return Math.min(100, Math.max(0, score));
  }

  getAnalysisDetails(stockData, score) {
    const fundamental = stockData.fundamental_data || {};
    const technical = stockData.technical_data || {};
    return {
      pe_ratio: fundamental.pe_ratio || 'N/A',
      pb_ratio: fundamental.pb_ratio || 'N/A',
      rsi: technical.rsi || 'N/A',
      daily_change: stockData.daily_change_percent || 'N/A',
      philosophy: this.philosophy,
      focus: 'Buy when others sell, look for undervalued opportunities'
    };
  }
}

if (require.main === module) {
  const analyst = new ContrarianAnalyst();
  analyst.initialize()
    .then(() => analyst.run())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = ContrarianAnalyst;