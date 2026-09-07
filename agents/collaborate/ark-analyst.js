const BaseAnalyst = require('./base-analyst');
const logger = require('../../lib/utils/logger');

class ARKAnalyst extends BaseAnalyst {
  constructor() {
    super('ARK Analyst', 'Analista Growth/Innovation (tecnologia disruptiva, megatrend futuri)', 'Growth/Innovation');
  }

  async calculateScore(stockData) {
    if (!stockData.fundamental_data) return 50;

    let score = 0;
    const fundamental = stockData.fundamental_data;

    const eps = parseFloat(fundamental.eps) || 0;
    const revenue = fundamental.revenue || 0;
    const pe = parseFloat(fundamental.pe_ratio) || 0;

    if (eps > 5) score += 30;
    else if (eps > 2) score += 20;
    else if (eps > 0) score += 10;
    else score += 5;

    if (revenue > 50000000000) score += 25;
    else if (revenue > 10000000000) score += 20;
    else if (revenue > 1000000000) score += 10;
    else score += 5;

    if (pe > 30) score += 25;
    else if (pe > 20) score += 15;
    else score += 5;

    if (stockData.sector === 'tecnologico') score += 20;

    return Math.min(100, Math.max(0, score));
  }

  getAnalysisDetails(stockData, score) {
    const fundamental = stockData.fundamental_data || {};
    return {
      eps: fundamental.eps || 'N/A',
      revenue: fundamental.revenue || 'N/A',
      pe_ratio: fundamental.pe_ratio || 'N/A',
      sector: stockData.sector || 'N/A',
      philosophy: this.philosophy,
      focus: 'Disruptive technology, future megatrends, high growth'
    };
  }
}

if (require.main === module) {
  const analyst = new ARKAnalyst();
  analyst.initialize()
    .then(() => analyst.run())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = ARKAnalyst;