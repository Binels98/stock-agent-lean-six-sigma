const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Financial Modeling Prep API Service
 * Main service for interacting with FMP API
 * API Documentation: https://financialmodelingprep.com/developer/docs
 */
class FMPService {
  constructor() {
    this.baseUrl = 'https://financialmodelingprep.com/api/v3';
    this.apiKey = process.env.FMP_API_KEY;
    this.requestTimeout = 30000;
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  async makeRequest(endpoint, params = {}) {
    if (!this.apiKey) {
      logger.error('FMP_API_KEY is not configured');
      throw new Error('FMP_API_KEY is not configured in environment variables');
    }

    const url = this.baseUrl + endpoint;
    
    try {
      const response = await axios.get(url, {
        params: {
          apikey: this.apiKey,
          ...params
        },
        timeout: this.requestTimeout
      });

      if (response.data && response.data.length > 0) {
        return response.data;
      }
      
      logger.warn('Empty response from FMP API: ' + endpoint);
      return null;
    } catch (error) {
      logger.error('FMP API request failed: ' + error.message);
      
      if (error.code === 'ECONNABORTED' || error.response?.status === 429) {
        for (let i = 0; i < this.maxRetries; i++) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
          try {
            const retryResponse = await axios.get(url, {
              params: {
                apikey: this.apiKey,
                ...params
              },
              timeout: this.requestTimeout
            });
            return retryResponse.data;
          } catch (retryError) {
            if (i === this.maxRetries - 1) {
              throw retryError;
            }
          }
        }
      }
      
      throw error;
    }
  }

  async getStockQuote(ticker) {
    const endpoint = '/quote/' + encodeURIComponent(ticker);
    const data = await this.makeRequest(endpoint);
    return data && data[0] ? data[0] : null;
  }

  async getMultipleStockQuotes(tickers) {
    const endpoint = '/quote/' + tickers.map(t => encodeURIComponent(t)).join(',');
    const data = await this.makeRequest(endpoint);
    return data || [];
  }

  async getHistoricalPrices(ticker, options = {}) {
    const endpoint = '/historical-price-full/' + encodeURIComponent(ticker);
    const data = await this.makeRequest(endpoint, options);
    return data || [];
  }

  async getCompanyProfile(ticker) {
    const endpoint = '/profile/' + encodeURIComponent(ticker);
    const data = await this.makeRequest(endpoint);
    return data && data[0] ? data[0] : null;
  }

  async getFundamentalData(ticker, statement = 'income', limit = 1) {
    const endpoint = '/financials/' + statement + '-statement/' + encodeURIComponent(ticker);
    const data = await this.makeRequest(endpoint, { limit });
    return data || [];
  }

  async getKeyMetrics(ticker, limit = 1) {
    const endpoint = '/key-metrics/' + encodeURIComponent(ticker);
    const data = await this.makeRequest(endpoint, { limit });
    return data || [];
  }

  async getTechnicalIndicators(ticker, indicator, options = {}) {
    const endpoint = '/technical_indicator/' + indicator + '/' + encodeURIComponent(ticker);
    const data = await this.makeRequest(endpoint, options);
    return data || [];
  }

  async getCompanyNews(ticker, options = {}) {
    const endpoint = '/stock_news';
    const data = await this.makeRequest(endpoint, { ticker: ticker, ...options });
    return data || [];
  }

  async getMarketNews(options = {}) {
    const endpoint = '/news';
    const data = await this.makeRequest(endpoint, options);
    return data || [];
  }

  async isApiKeyValid() {
    try {
      const data = await this.getStockQuote('AAPL');
      return data !== null && data !== undefined;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new FMPService();