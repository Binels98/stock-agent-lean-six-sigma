const FMPService = require('./fmp-service');
const logger = require('../utils/logger');

class NewsService {
  constructor() {
    this.fmpService = FMPService;
  }

  async getStockNews(ticker, options = {}) {
    try {
      const news = await this.fmpService.getCompanyNews(ticker, options);
      
      if (!news || !Array.isArray(news)) {
        return [];
      }

      return news.map(n => this.transformNewsItem(n, ticker));
    } catch (error) {
      logger.error('Error fetching news for ' + ticker + ': ' + error.message);
      return [];
    }
  }

  async getNewsForTickers(tickers) {
    const allNews = [];
    
    for (const ticker of tickers) {
      const news = await this.getStockNews(ticker, { size: 5 });
      allNews.push(...news);
    }
    
    return allNews.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  }

  async getMarketNews(options = {}) {
    try {
      const news = await this.fmpService.getMarketNews(options);
      
      if (!news || !Array.isArray(news)) {
        return [];
      }

      return news.map(n => this.transformNewsItem(n, 'MARKET'));
    } catch (error) {
      logger.error('Error fetching market news: ' + error.message);
      return [];
    }
  }

  transformNewsItem(item, ticker) {
    let title = item.title || item.headline || 'No title';
    let text = item.text || item.summary || '';
    let source = item.source || item.site || 'Unknown';
    let publishedAt = item.publishedAt || item.date || item.time || new Date().toISOString();
    let url = item.url || item.link || '';
    
    const sentiment = this.analyzeSentiment(title + ' ' + text);
    const relevance = this.calculateRelevance(title, text, ticker);

    return {
      ticker: ticker,
      title: title,
      text: text,
      source: source,
      published_at: publishedAt,
      url: url,
      sentiment: parseFloat(sentiment.toFixed(2)),
      relevance: parseFloat(relevance.toFixed(2)),
      sentiment_label: this.getSentimentLabel(sentiment),
      relevance_label: this.getRelevanceLabel(relevance),
      processed_at: new Date().toISOString(),
      data_source: 'FMP_API'
    };
  }

  analyzeSentiment(text) {
    if (!text || text.length === 0) return 0;

    const lowerText = text.toLowerCase();
    
    const positiveWords = [
      'buy', 'bullish', 'positive', 'growth', 'rise', 'rising', 'up', 'upgrade',
      'strong', 'beat', 'better', 'improve', 'optimistic', 'outperform',
      'acquisition', 'merger', 'partnership', 'expansion', 'profit', 'earnings',
      'revenue', 'increase', 'surge', 'jump', 'rally', 'boom'
    ];
    
    const negativeWords = [
      'sell', 'bearish', 'negative', 'fall', 'falling', 'down', 'downgrade',
      'weak', 'miss', 'worse', 'decline', 'pessimistic', 'underperform',
      'loss', 'debt', 'bankrupt', 'collapse', 'crash', 'drop', 'plunge'
    ];

    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of positiveWords) {
      if (lowerText.includes(word)) {
        positiveCount += lowerText.split(word).length - 1;
      }
    }

    for (const word of negativeWords) {
      if (lowerText.includes(word)) {
        negativeCount += lowerText.split(word).length - 1;
      }
    }

    const total = positiveCount + negativeCount;
    if (total === 0) return 0;
    
    return (positiveCount - negativeCount) / total;
  }

  calculateRelevance(title, text, ticker) {
    const fullText = (title + ' ' + text).toLowerCase();
    const tickerLower = ticker.toLowerCase().replace('.', '');
    
    let relevance = 0;
    
    if (fullText.includes(tickerLower)) {
      relevance += 0.5;
    }
    
    const companyNames = {
      'AAPL': 'apple',
      'MSFT': 'microsoft',
      'GOOGL': 'google alphabet',
      'AMZN': 'amazon',
      'TSLA': 'tesla',
      'NVDA': 'nvidia',
      'META': 'meta facebook',
      'INTC': 'intel',
      'ENEL.MI': 'enel',
      'UCG.MI': 'unicredit'
    };
    
    const name = companyNames[ticker];
    if (name && fullText.includes(name)) {
      relevance += 0.3;
    }
    
    const financialTerms = ['stock', 'share', 'price', 'market', 'company', 'earnings', 'revenue'];
    let termCount = 0;
    for (const term of financialTerms) {
      if (fullText.includes(term)) {
        termCount++;
      }
    }
    
    relevance += (termCount / financialTerms.length) * 0.2;
    
    return Math.min(1, relevance);
  }

  getSentimentLabel(sentiment) {
    if (sentiment > 0.3) return 'POSITIVE';
    if (sentiment > 0.1) return 'SLIGHTLY_POSITIVE';
    if (sentiment < -0.3) return 'NEGATIVE';
    if (sentiment < -0.1) return 'SLIGHTLY_NEGATIVE';
    return 'NEUTRAL';
  }

  getRelevanceLabel(relevance) {
    if (relevance > 0.8) return 'HIGH';
    if (relevance > 0.5) return 'MEDIUM';
    if (relevance > 0.3) return 'LOW';
    return 'VERY_LOW';
  }

  async getNewsSummary(ticker) {
    const news = await this.getStockNews(ticker, { size: 10 });
    
    if (news.length === 0) {
      return {
        ticker: ticker,
        total_news: 0,
        positive_news: 0,
        negative_news: 0,
        neutral_news: 0,
        average_sentiment: 0,
        sentiment_trend: 'NEUTRAL'
      };
    }

    const positiveNews = news.filter(n => n.sentiment > 0.3);
    const negativeNews = news.filter(n => n.sentiment < -0.3);
    const neutralNews = news.filter(n => Math.abs(n.sentiment) <= 0.3);

    const avgSentiment = news.reduce((sum, n) => sum + n.sentiment, 0) / news.length;

    return {
      ticker: ticker,
      total_news: news.length,
      positive_news: positiveNews.length,
      negative_news: negativeNews.length,
      neutral_news: neutralNews.length,
      average_sentiment: parseFloat(avgSentiment.toFixed(2)),
      sentiment_trend: avgSentiment > 0 ? 'POSITIVE' : avgSentiment < 0 ? 'NEGATIVE' : 'NEUTRAL',
      news: news,
      last_updated: new Date().toISOString()
    };
  }
}

module.exports = new NewsService();