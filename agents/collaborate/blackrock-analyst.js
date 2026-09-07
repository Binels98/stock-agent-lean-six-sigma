const BaseAnalyst = require('./base-analyst');
const logger = require('../../lib/utils/logger');

class BlackRockAnalyst extends BaseAnalyst {
  constructor() {
    super('BlackRock Analyst', 'Analista Value Investing (fondamentali solidi, stabilita, dividendi)', 'Value Investing');
  }

  async calculateScore(stockData) {
    if (!stockData.fundamental_data) return 50;

    let score = 0;
    const fundamental = stockData.fundamental_data;

    const pe = parseFloat(fundamental.pe_ratio) || 0;
    const pb = parseFloat(fundamental.pb_ratio) || 0;
    const eps = parseFloat(fundamental.eps) || 0;
    const debtEquity = parseFloat(fundamental.debt_equity) || 0;
    const revenue = fundamental.revenue || 0;

    if (pe > 0 && pe < 15) score += 35;
    else if (pe >= 15 && pe < 20) score += 25;
    else if (pe >= 20 && pe < 25) score += 15;
    else score += 5;

    if (pb > 0 && pb < 2) score += 25;
    else if (pb >= 2 && pb < 3) score += 15;
    else score += 5;

    if (eps > 0) score += 20;
    else score += 5;

    if (debtEquity < 0.5) score += 20;
    else if (debtEquity >= 0.5 && debtEquity < 1) score += 15;
    else if (debtEquity >= 1 && debtEquity < 1.5) score += 10;
    else score += 5;

    if (revenue > 10000000000) score += 15;
    else if (revenue > 1000000000) score += 10;
    else score += 5;

    return Math.min(100, Math.max(0, score));
  }

  getAnalysisDetails(stockData, score) {
    const fundamental = stockData.fundamental_data || {};
    return {
      pe_ratio: fundamental.pe_ratio || 'N/A',
      pb_ratio: fundamental.pb_ratio || 'N/A',
      eps: fundamental.eps || 'N/A',
      debt_equity: fundamental.debt_equity || 'N/A',
      revenue: fundamental.revenue || 'N/A',
      philosophy: this.philosophy,
      focus: 'Solid fundamentals, stability, dividends'
    };
  }
}

if (require.main === module) {
  const analyst = new BlackRockAnalyst();
  analyst.initialize()
    .then(() => analyst.run())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = BlackRockAnalyst;