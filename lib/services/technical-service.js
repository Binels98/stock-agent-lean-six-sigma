const FMPService = require('./fmp-service');
const logger = require('../utils/logger');

class TechnicalService {
  constructor() {
    this.fmpService = FMPService;
  }

  async getTechnicalData(ticker) {
    try {
      const rsiData = await this.fmpService.getTechnicalIndicators(ticker, 'RSI', { period: 14 });
      const rsi = this.extractLatestIndicatorValue(rsiData, 'RSI');

      const macdData = await this.fmpService.getTechnicalIndicators(ticker, 'MACD', { period: 12, signalPeriod: 9 });
      const macd = this.extractLatestIndicatorValue(macdData, 'MACD');

      const bbData = await this.fmpService.getTechnicalIndicators(ticker, 'BB', { period: 20 });
      const bollinger = this.extractBollingerBands(bbData);

      const sma50Data = await this.fmpService.getTechnicalIndicators(ticker, 'SMA', { period: 50 });
      const sma50 = this.extractLatestIndicatorValue(sma50Data, 'SMA');

      const sma200Data = await this.fmpService.getTechnicalIndicators(ticker, 'SMA', { period: 200 });
      const sma200 = this.extractLatestIndicatorValue(sma200Data, 'SMA');

      const historical = await this.fmpService.getHistoricalPrices(ticker, { timeseries: '1day' });
      const atr = this.calculateATR(historical);
      const volatility = this.calculateVolatility(historical);

      return {
        ticker: ticker,
        rsi: parseFloat(rsi) || 50,
        macd: parseFloat(macd) || 0,
        bollinger_upper: parseFloat(bollinger.upper) || 0,
        bollinger_middle: parseFloat(bollinger.middle) || 0,
        bollinger_lower: parseFloat(bollinger.lower) || 0,
        sma_50: parseFloat(sma50) || 0,
        sma_200: parseFloat(sma200) || 0,
        atr: parseFloat(atr) || 0,
        volatility: parseFloat(volatility) || 0,
        last_updated: new Date().toISOString(),
        data_source: 'FMP_API'
      };
    } catch (error) {
      logger.error('Error fetching technical data for ' + ticker + ': ' + error.message);
      return this.getDefaultTechnicalData(ticker);
    }
  }

  extractLatestIndicatorValue(data, indicatorName) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return 0;
    }

    if (data[0] && data[0].technicalIndicators) {
      const indicators = data[0].technicalIndicators;
      if (indicators && indicators[indicatorName] && indicators[indicatorName].length > 0) {
        const values = indicators[indicatorName];
        return parseFloat(values[values.length - 1].value) || 0;
      }
    }

    if (data[0] && typeof data[0] === 'object') {
      const keys = Object.keys(data[0]);
      for (const key of keys) {
        if (key.toLowerCase().includes(indicatorName.toLowerCase())) {
          return parseFloat(data[0][key]) || 0;
        }
      }
    }

    return 0;
  }

  extractBollingerBands(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { upper: 0, middle: 0, lower: 0 };
    }

    if (data[0] && data[0].technicalIndicators) {
      const bb = data[0].technicalIndicators.BB;
      if (bb && bb.length > 0) {
        const latest = bb[bb.length - 1];
        return {
          upper: parseFloat(latest.upperBand) || 0,
          middle: parseFloat(latest.middleBand) || 0,
          lower: parseFloat(latest.lowerBand) || 0
        };
      }
    }

    return { upper: 0, middle: 0, lower: 0 };
  }

  calculateATR(historicalData, period = 14) {
    if (!historicalData || !historicalData.historical || historicalData.historical.length < period) {
      return 0;
    }

    const prices = historicalData.historical;
    let sumTR = 0;
    let previousClose = prices[0].close;

    for (let i = 1; i <= period && i < prices.length; i++) {
      const current = prices[i];
      const high = parseFloat(current.high) || 0;
      const low = parseFloat(current.low) || 0;
      const close = parseFloat(current.close) || 0;

      const tr = Math.max(
        high - low,
        Math.abs(high - previousClose),
        Math.abs(low - previousClose)
      );
      sumTR += tr;
      previousClose = close;
    }

    return sumTR / period;
  }

  calculateVolatility(historicalData, period = 20) {
    if (!historicalData || !historicalData.historical || historicalData.historical.length < period) {
      return 0;
    }

    const prices = historicalData.historical.slice(0, period);
    const closes = prices.map(p => parseFloat(p.close) || 0);

    const returns = [];
    for (let i = 1; i < closes.length; i++) {
      const ret = (closes[i] - closes[i - 1]) / closes[i - 1];
      returns.push(ret);
    }

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    return stdDev * 100;
  }

  getDefaultTechnicalData(ticker) {
    return {
      ticker: ticker,
      rsi: 50,
      macd: 0,
      bollinger_upper: 0,
      bollinger_middle: 0,
      bollinger_lower: 0,
      sma_50: 0,
      sma_200: 0,
      atr: 0,
      volatility: 0,
      last_updated: new Date().toISOString(),
      data_source: 'DEFAULT'
    };
  }

  isTechnicallyStrong(technicalData) {
    if (!technicalData) return false;
    const t = technicalData;
    if (t.rsi < 30 || t.rsi > 70) return false;
    if (t.macd < 0) return false;
    return true;
  }
}

module.exports = new TechnicalService();