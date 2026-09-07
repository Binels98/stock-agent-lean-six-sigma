const BaseAnalyst = require('./base-analyst');
const logger = require('../../lib/utils/logger');

class MomentumAnalyst extends BaseAnalyst {
  constructor() {
    super('Momentum Analyst', 'Analista Trend Following (andamento prezzo, volume, forza relativa)', 'Trend Following');
  }

  async calculateScore(stockData) {
    if (!stockData.technical_data) return 50;

    let score = 0;
    const technical = stockData.technical_data;

    const rsi = parseInt(technical.rsi) || 50;
    const macd = parseFloat(technical.macd) || 0;

    if (rsi >= 50 && rsi <= 70) score += 30;
    else if (rsi > 70) score += 20;
    else if (rsi >= 30 && rsi < 50) score += 15;
    else score += 5;

    if (macd > 0.005) score += 25;
    else if (macd > 0) score += 15;
    else if (macd < -0.005) score += 10;
    else score += 5;

    if (stockData.daily_change_percent && stockData.daily_change_percent > 2) score += 20;
    else if (stockData.daily_change_percent && stockData.daily_change_percent > 0) score += 10;

    if (stockData.volume_change && stockData.volume_change > 1.5) score += 15;

    return Math.min(100, Math.max(0, score));
  }

  getAnalysisDetails(stockData, score) {
    const technical = stockData.technical_data || {};
    return {
      rsi: technical.rsi || 'N/A',
      macd: technical.macd || 'N/A',
      daily_change: stockData.daily_change_percent || 'N/A',
      volume_change: stockData.volume_change || 'N/A',
      philosophy: this.philosophy,
      focus: 'Price momentum, volume, relative strength'
    };
  }
}

if (require.main === module) {
  const analyst = new MomentumAnalyst();
  analyst.initialize()
    .then(() => analyst.run())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = MomentumAnalyst;