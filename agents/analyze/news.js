const logger = require('../../lib/utils/logger');
const configLoader = require('../../lib/common/config-loader');
const dataStorage = require('../../lib/common/data-storage');
const { DateTime } = require('luxon');

class NewsAnalyzer {
  constructor() {
    this.name = 'News Agent';
    this.description = 'Agente di analisi notizie e sentiment';
    this.settings = configLoader.getSettings();
    this.timezone = configLoader.getTimezone();
  }

  async initialize() {
    logger.info(this.name + ': Initializing...');
    logger.info(this.name + ': Initialized successfully');
  }

  async run() {
    logger.info(this.name + ': Running news analysis...');

    const newsData = await this.fetchNews();
    const analysis = await this.analyzeNews(newsData);
    await this.saveNewsAnalysis(analysis);

    logger.info(this.name + ': News analysis completed');
    return analysis;
  }

  async fetchNews() {
    const now = DateTime.now().setZone(this.timezone);
    const portfolio = configLoader.getPortfolioConfig().portfolio;
    const tickers = portfolio.stocks?.map(s => s.ticker) || [];

    const news = [];
    for (const ticker of tickers) {
      const tickerNews = await this.fetchNewsForTicker(ticker);
      news.push(...tickerNews);
    }

    return news;
  }

  async fetchNewsForTicker(ticker) {
    const numNews = Math.floor(Math.random() * 5) + 1;
    const news = [];

    for (let i = 0; i < numNews; i++) {
      news.push({
        ticker: ticker,
        title: 'News about ' + ticker + ' ' + i,
        source: 'Financial News',
        published_at: new Date().toISOString(),
        sentiment: (Math.random() * 2 - 1).toFixed(2),
        relevance: (Math.random()).toFixed(2)
      });
    }

    return news;
  }

  async analyzeNews(newsData) {
    const now = DateTime.now().setZone(this.timezone);

    const positiveNews = newsData.filter(n => n.sentiment > 0.3);
    const negativeNews = newsData.filter(n => n.sentiment < -0.3);
    const neutralNews = newsData.filter(n => Math.abs(n.sentiment) <= 0.3);

    const avgSentiment = newsData.length > 0 ? 
      newsData.reduce((sum, n) => sum + parseFloat(n.sentiment), 0) / newsData.length : 0;

    return {
      timestamp: now.toISO(),
      date: now.toFormat('yyyy-MM-dd'),
      total_news: newsData.length,
      positive_news: positiveNews.length,
      negative_news: negativeNews.length,
      neutral_news: neutralNews.length,
      average_sentiment: avgSentiment.toFixed(2),
      sentiment_trend: avgSentiment > 0 ? 'POSITIVE' : avgSentiment < 0 ? 'NEGATIVE' : 'NEUTRAL',
      news: newsData
    };
  }

  async saveNewsAnalysis(analysis) {
    await dataStorage.saveData('analysis', 'news_analysis_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd_HHmm') + '.json', analysis);
  }
}

if (require.main === module) {
  const newsAnalyzer = new NewsAnalyzer();
  newsAnalyzer.initialize()
    .then(() => newsAnalyzer.run())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = NewsAnalyzer;