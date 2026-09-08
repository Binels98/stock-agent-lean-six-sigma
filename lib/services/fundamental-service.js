const FMPService = require('./fmp-service');
const logger = require('../utils/logger');

class FundamentalService {
  constructor() {
    this.fmpService = FMPService;
  }

  async getFundamentalData(ticker) {
    try {
      const metrics = await this.fmpService.getKeyMetrics(ticker, 1);
      const profile = await this.fmpService.getCompanyProfile(ticker);
      
      if (!metrics || metrics.length === 0) {
        logger.warn('No fundamental data for ticker: ' + ticker);
        return null;
      }

      const metric = metrics[0];
      
      return {
        ticker: ticker,
        name: profile?.name || ticker,
        sector: profile?.sector || 'Unknown',
        industry: profile?.industry || 'Unknown',
        market_cap: parseFloat(metric.marketCap) || 0,
        pe_ratio: parseFloat(metric.per) || 0,
        pb_ratio: parseFloat(metric.pbRatio) || 0,
        ps_ratio: parseFloat(metric.psRatio) || 0,
        peg_ratio: parseFloat(metric.pegRatio) || 0,
        eps: parseFloat(metric.eps) || 0,
        eps_ttm: parseFloat(metric.epsTtm) || 0,
        revenue: parseFloat(metric.revenue) || 0,
        revenue_per_share: parseFloat(metric.revenuePerShare) || 0,
        gross_margin: parseFloat(metric.grossMargin) || 0,
        operating_margin: parseFloat(metric.operatingMargin) || 0,
        net_margin: parseFloat(metric.netMargin) || 0,
        roe: parseFloat(metric.roe) || 0,
        roa: parseFloat(metric.roa) || 0,
        roi: parseFloat(metric.roi) || 0,
        debt_equity: parseFloat(metric.debtEquity) || 0,
        current_ratio: parseFloat(metric.currentRatio) || 0,
        quick_ratio: parseFloat(metric.quickRatio) || 0,
        cash_per_share: parseFloat(metric.cashPerShare) || 0,
        free_cash_flow_per_share: parseFloat(metric.freeCashFlowPerShare) || 0,
        book_value_per_share: parseFloat(metric.bookValuePerShare) || 0,
        dividend_yield: parseFloat(metric.dividendYield) || 0,
        payout_ratio: parseFloat(metric.payoutRatio) || 0,
        beta: parseFloat(metric.beta) || 0,
        last_updated: new Date().toISOString(),
        data_source: 'FMP_API'
      };
    } catch (error) {
      logger.error('Error fetching fundamental data for ' + ticker + ': ' + error.message);
      return null;
    }
  }

  async getIncomeStatement(ticker, limit = 1) {
    try {
      const data = await this.fmpService.getFundamentalData(ticker, 'income', limit);
      return data || [];
    } catch (error) {
      logger.error('Error fetching income statement for ' + ticker + ': ' + error.message);
      return [];
    }
  }

  async getBalanceSheet(ticker, limit = 1) {
    try {
      const data = await this.fmpService.getFundamentalData(ticker, 'balance', limit);
      return data || [];
    } catch (error) {
      logger.error('Error fetching balance sheet for ' + ticker + ': ' + error.message);
      return [];
    }
  }

  async getCashFlowStatement(ticker, limit = 1) {
    try {
      const data = await this.fmpService.getFundamentalData(ticker, 'cashflow', limit);
      return data || [];
    } catch (error) {
      logger.error('Error fetching cash flow for ' + ticker + ': ' + error.message);
      return [];
    }
  }

  calculateHealthScore(fundamentalData) {
    if (!fundamentalData) return 50;

    let score = 0;
    const f = fundamentalData;

    if (f.roe && f.roe > 15) score += 15;
    else if (f.roe && f.roe > 10) score += 10;
    else if (f.roe && f.roe > 5) score += 5;

    if (f.net_margin && f.net_margin > 10) score += 10;
    else if (f.net_margin && f.net_margin > 5) score += 5;

    if (f.operating_margin && f.operating_margin > 15) score += 10;
    else if (f.operating_margin && f.operating_margin > 10) score += 5;

    if (f.debt_equity && f.debt_equity < 0.5) score += 15;
    else if (f.debt_equity && f.debt_equity < 1) score += 10;
    else if (f.debt_equity && f.debt_equity < 1.5) score += 5;

    if (f.current_ratio && f.current_ratio > 2) score += 10;
    else if (f.current_ratio && f.current_ratio > 1.5) score += 5;

    if (f.quick_ratio && f.quick_ratio > 1) score += 5;

    if (f.roa && f.roa > 10) score += 10;
    else if (f.roa && f.roa > 5) score += 5;

    if (f.roi && f.roi > 15) score += 10;
    else if (f.roi && f.roi > 10) score += 5;

    if (f.gross_margin && f.gross_margin > 40) score += 10;
    else if (f.gross_margin && f.gross_margin > 30) score += 5;

    return Math.min(100, Math.max(0, score));
  }
}

module.exports = new FundamentalService();