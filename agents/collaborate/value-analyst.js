const BaseAnalyst = require('./base-analyst');
const logger = require('../../lib/utils/logger');

class ValueAnalyst extends BaseAnalyst {
  constructor() {
    super('Value Analyst', 'Analista Sottovalutazione (P/E basso, P/B basso, DCF attraente)', 'Value');
  }

  async calculateScore(stockData) {
    if (!stockData.fundamental_data) return 50;

    let score = 0;
    const fundamental = stockData.fundamental_data;

    const pe = parseFloat(fundamental.pe_ratio) || 0;
    const pb = parseFloat(fundamental.pb_ratio) || 0;
    const eps = parseFloat(fundamental.eps) || 0;
    const revenue = fundamental.revenue || 0;

    if (pe > 0 && pe < 10) score += 35;
    else if (pe >= 10 && pe < 15) score += 25;
    else if (pe >= 15 && pe < 20) score += 15;
    else score += 5;

    if (pb > 0 && pb < 1) score += 30;
    else if (pb >= 1 && pb < 1.5) score += 20;
    else if (pb >= 1.5 && pb < 2) score += 10;
    else score += 5;

    if (eps > 0 && (pe / eps) < 15) score += 20;
    else if (eps > 0) score += 10;

    if (revenue > 0) score += 15;

    return Math.min(100, Math.max(0, score));
  }

  getAnalysisDetails(stockData, score) {
    const fundamental = stockData.fundamental_data || {};
    return {
      pe_ratio: fundamental.pe_ratio || 'N/A',
      pb_ratio: fundamental.pb_ratio || 'N/A',
      eps: fundamental.eps || 'N/A',
      revenue: fundamental.revenue || 'N/A',
      philosophy: this.philosophy,
      focus: 'Low P/E, low P/B, attractive DCF'
    };
  }
}

if (require.main === module) {
  const analyst = new ValueAnalyst();
  analyst.initialize()
    .then(() => analyst.run())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = ValueAnalyst;