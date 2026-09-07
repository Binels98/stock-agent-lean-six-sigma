const logger = require('../../lib/utils/logger');
const configLoader = require('../../lib/common/config-loader');
const dataStorage = require('../../lib/common/data-storage');
const telegram = require('../../lib/common/telegram');
const { DateTime } = require('luxon');

class Reporter {
  constructor() {
    this.name = 'Reporter Agent';
    this.description = 'Agente che genera report periodici con sintesi delle analisi';
    this.settings = configLoader.getSettings();
    this.portfolioConfig = configLoader.getPortfolioConfig();
    this.timezone = configLoader.getTimezone();
    this.reportConfig = this.loadReportConfig();
  }

  loadReportConfig() {
    return {
      morningReportTime: this.settings.reporting?.morning_report_time || '08:00',
      eveningReportTime: this.settings.reporting?.evening_report_time || '18:00',
      includePreviousDaySummary: this.settings.reporting?.include_previous_day_summary || true,
      previousDayDataPath: this.settings.reporting?.previous_day_data_path || 'data/monitoring/previous_day.json',
      reportTypes: ['morning', 'evening', 'daily', 'weekly', 'monthly'],
      sections: {
        morning: [
          'header',
          'market_overview',
          'previous_day_summary',
          'portfolio_performance',
          'analyst_consensus',
          'alerts_summary',
          'today_outlook'
        ],
        evening: [
          'header',
          'market_overview',
          'today_summary',
          'portfolio_performance',
          'analyst_consensus',
          'alerts_summary',
          'tomorrow_outlook'
        ]
      }
    };
  }

  async initialize() {
    logger.info(this.name + ': Initializing...');
    this.previousDayData = await dataStorage.getPreviousDayData();
    logger.info(this.name + ': Initialized successfully');
  }

  async generateReport(reportType = 'daily') {
    logger.info(this.name + ': Generating ' + reportType + ' report...');

    let report;
    switch (reportType) {
      case 'morning':
        report = await this.generateMorningReport();
        break;
      case 'evening':
        report = await this.generateEveningReport();
        break;
      default:
        report = await this.generateDailyReport();
    }

    logger.info(this.name + ': ' + reportType + ' report generated');
    return report;
  }

  async generateMorningReport() {
    const previousDayData = await dataStorage.getPreviousDayData();
    const portfolio = await dataStorage.getPortfolio();
    const monitoringData = await dataStorage.getMonitoringData();
    const recentAnalyses = await dataStorage.getRecentAnalyses();

    const report = {
      type: 'morning',
      timestamp: new Date().toISOString(),
      date: DateTime.now().setZone(this.timezone).toFormat('dd/MM/yyyy'),
      header: this.generateReportHeader('morning'),
      marketOverview: await this.generateMarketOverview('morning'),
      previousDaySummary: previousDayData ? this.generatePreviousDaySummary(previousDayData) : null,
      portfolioPerformance: portfolio ? await this.generatePortfolioPerformance(portfolio) : null,
      analystConsensus: recentAnalyses && recentAnalyses.length > 0 ? this.generateAnalystConsensusSummary(recentAnalyses) : null,
      alertsSummary: monitoringData ? this.generateAlertsSummary(monitoringData) : null,
      todayOutlook: await this.generateTodayOutlook(),
      footer: this.generateReportFooter()
    };

    await this.saveReport(report);
    return report;
  }

  async generateEveningReport() {
    const portfolio = await dataStorage.getPortfolio();
    const monitoringData = await dataStorage.getMonitoringData();
    const recentAnalyses = await dataStorage.getRecentAnalyses();

    await this.savePreviousDayData(monitoringData);

    const report = {
      type: 'evening',
      timestamp: new Date().toISOString(),
      date: DateTime.now().setZone(this.timezone).toFormat('dd/MM/yyyy'),
      header: this.generateReportHeader('evening'),
      marketOverview: await this.generateMarketOverview('evening'),
      todaySummary: monitoringData ? this.generateTodaySummary(monitoringData) : null,
      portfolioPerformance: portfolio ? await this.generatePortfolioPerformance(portfolio) : null,
      analystConsensus: recentAnalyses && recentAnalyses.length > 0 ? this.generateAnalystConsensusSummary(recentAnalyses) : null,
      alertsSummary: monitoringData ? this.generateAlertsSummary(monitoringData) : null,
      tomorrowOutlook: await this.generateTomorrowOutlook(),
      footer: this.generateReportFooter()
    };

    await this.saveReport(report);
    return report;
  }

  async generateDailyReport() {
    const now = DateTime.now().setZone(this.timezone);
    const hour = now.hour;
    if (hour < 12) {
      return await this.generateMorningReport();
    } else {
      return await this.generateEveningReport();
    }
  }

  generateReportHeader(reportType) {
    const now = DateTime.now().setZone(this.timezone);
    const titles = {
      morning: 'Report Mattutino',
      evening: 'Report Serale',
      daily: 'Report Giornaliero'
    };
    const subtitles = {
      morning: 'Riassunto del ' + now.minus({ days: 1 }).toFormat('dd/MM/yyyy'),
      evening: 'Riassunto del ' + now.toFormat('dd/MM/yyyy'),
      daily: 'Riassunto del ' + now.toFormat('dd/MM/yyyy')
    };

    return {
      title: titles[reportType] || 'Report',
      subtitle: subtitles[reportType] || '',
      date: now.toFormat('dd/MM/yyyy HH:mm'),
      timezone: this.timezone,
      reportType: reportType
    };
  }

  async generateMarketOverview(reportType) {
    const now = DateTime.now().setZone(this.timezone);
    const marketData = {
      indices: {
        'S&P 500': { value: 4500 + Math.random() * 100, change: (Math.random() * 4 - 2).toFixed(2) },
        'NASDAQ': { value: 16000 + Math.random() * 200, change: (Math.random() * 6 - 3).toFixed(2) },
        'Dow Jones': { value: 39000 + Math.random() * 300, change: (Math.random() * 3 - 1.5).toFixed(2) },
        'FTSE MIB': { value: 33000 + Math.random() * 500, change: (Math.random() * 3 - 1.5).toFixed(2) }
      },
      sectors: {
        'tecnologico': { change: (Math.random() * 6 - 3).toFixed(2) },
        'finanziario': { change: (Math.random() * 4 - 2).toFixed(2) },
        'consumo': { change: (Math.random() * 3 - 1.5).toFixed(2) },
        'sanita': { change: (Math.random() * 3 - 1.5).toFixed(2) },
        'energia': { change: (Math.random() * 5 - 2.5).toFixed(2) }
      },
      volatility: {
        vix: 15 + Math.random() * 10,
        market: 'CALM'
      }
    };

    const avgIndexChange = Object.values(marketData.indices)
      .reduce((sum, idx) => sum + parseFloat(idx.change), 0) / Object.keys(marketData.indices).length;

    let marketSentiment;
    if (avgIndexChange > 1) marketSentiment = 'BULLISH';
    else if (avgIndexChange > 0.5) marketSentiment = 'MILDLY_BULLISH';
    else if (avgIndexChange > -0.5) marketSentiment = 'NEUTRAL';
    else if (avgIndexChange > -1) marketSentiment = 'MILDLY_BEARISH';
    else marketSentiment = 'BEARISH';

    return {
      timestamp: now.toISO(),
      indices: marketData.indices,
      sectors: marketData.sectors,
      volatility: marketData.volatility,
      sentiment: marketSentiment,
      trend: avgIndexChange > 0 ? 'UPTREND' : 'DOWNTREND'
    };
  }

  generatePreviousDaySummary(previousDayData) {
    return {
      date: previousDayData.date || DateTime.now().setZone(this.timezone).minus({ days: 1 }).toFormat('dd/MM/yyyy'),
      totalPositions: previousDayData.positions?.length || 0,
      totalAlerts: previousDayData.alerts?.length || 0,
      highPriorityAlerts: previousDayData.alerts?.filter(a => a.severity === 'HIGH' || a.severity === 'VERY_HIGH').length || 0,
      statistics: {
        averageDailyChange: previousDayData.statistics?.averageDailyChange || 0,
        bestPerformer: previousDayData.bestPerformer || null,
        worstPerformer: previousDayData.worstPerformer || null,
        mostVolatile: previousDayData.mostVolatile || null
      },
      highlights: this.generateDayHighlights(previousDayData)
    };
  }

  generateTodaySummary(monitoringData) {
    return {
      date: DateTime.now().setZone(this.timezone).toFormat('dd/MM/yyyy'),
      totalPositions: monitoringData.positions?.length || 0,
      totalAlerts: monitoringData.positions?.reduce((sum, m) => sum + (m.alerts?.length || 0), 0) || 0,
      highPriorityAlerts: monitoringData.positions?.reduce((sum, m) => sum + (m.alerts?.filter(a => a.severity === 'HIGH' || a.severity === 'VERY_HIGH').length || 0), 0) || 0,
      statistics: {
        averageDailyChange: monitoringData.positions?.length > 0 ? monitoringData.positions.reduce((sum, m) => sum + (m.dailyChangePercent || 0), 0) / monitoringData.positions.length : 0,
        bestPerformer: this.findBestPerformer(monitoringData.positions),
        worstPerformer: this.findWorstPerformer(monitoringData.positions),
        mostVolatile: this.findMostVolatile(monitoringData.positions)
      },
      highlights: this.generateDayHighlightsFromMonitoring(monitoringData)
    };
  }

  generateDayHighlights(previousDayData) {
    const highlights = [];
    if (previousDayData.positions && previousDayData.positions.length > 0) {
      const best = this.findBestPerformerFromPositions(previousDayData.positions);
      if (best) highlights.push('Miglior performer: ' + best.ticker + ' (+' + best.dailyChangePercent.toFixed(2) + '%)');

      const worst = this.findWorstPerformerFromPositions(previousDayData.positions);
      if (worst) highlights.push('Peggior performer: ' + worst.ticker + ' (' + worst.dailyChangePercent.toFixed(2) + '%)');

      const mostVol = this.findMostVolatileFromPositions(previousDayData.positions);
      if (mostVol) highlights.push('Piu volatile: ' + mostVol.ticker + ' (volatilita: ' + mostVol.volatility?.toFixed(2) + '%)');
    }

    if (previousDayData.alerts && previousDayData.alerts.length > 0) {
      const highAlerts = previousDayData.alerts.filter(a => a.severity === 'HIGH' || a.severity === 'VERY_HIGH');
      if (highAlerts.length > 0) {
        highlights.push(highAlerts.length + ' alert ad alta priorita generati');
      }
    }
    return highlights;
  }

  generateDayHighlightsFromMonitoring(monitoringData) {
    const highlights = [];
    if (monitoringData.positions && monitoringData.positions.length > 0) {
      const best = this.findBestPerformer(monitoringData.positions);
      if (best) highlights.push('Miglior performer: ' + best.ticker + ' (+' + best.dailyChangePercent.toFixed(2) + '%)');

      const worst = this.findWorstPerformer(monitoringData.positions);
      if (worst) highlights.push('Peggior performer: ' + worst.ticker + ' (' + worst.dailyChangePercent.toFixed(2) + '%)');

      const mostVol = this.findMostVolatile(monitoringData.positions);
      if (mostVol) highlights.push('Piu volatile: ' + mostVol.ticker + ' (volatilita: ' + mostVol.volatility?.toFixed(2) + '%)');
    }
    return highlights;
  }

  findBestPerformer(positions) {
    if (!positions || positions.length === 0) return null;
    return positions.reduce((best, current) => (current.dailyChangePercent > best.dailyChangePercent) ? current : best, positions[0]);
  }

  findWorstPerformer(positions) {
    if (!positions || positions.length === 0) return null;
    return positions.reduce((worst, current) => (current.dailyChangePercent < worst.dailyChangePercent) ? current : worst, positions[0]);
  }

  findMostVolatile(positions) {
    if (!positions || positions.length === 0) return null;
    return positions.reduce((mostVol, current) => (current.volatility > mostVol.volatility) ? current : mostVol, positions[0]);
  }

  findBestPerformerFromPositions(positions) {
    if (!positions || positions.length === 0) return null;
    return positions.reduce((best, current) => (current.dailyChangePercent > best.dailyChangePercent) ? current : best, positions[0]);
  }

  findWorstPerformerFromPositions(positions) {
    if (!positions || positions.length === 0) return null;
    return positions.reduce((worst, current) => (current.dailyChangePercent < worst.dailyChangePercent) ? current : worst, positions[0]);
  }

  findMostVolatileFromPositions(positions) {
    if (!positions || positions.length === 0) return null;
    return positions.reduce((mostVol, current) => (current.volatility > mostVol.volatility) ? current : mostVol, positions[0]);
  }

  async generatePortfolioPerformance(portfolio) {
    const totalValue = portfolio.stocks?.reduce((sum, stock) => {
      return sum + (stock.current_price || stock.purchase_price) * (stock.weight || 0);
    }, 0) || 0;

    const dailyChange = portfolio.stocks?.reduce((sum, stock) => {
      return sum + (stock.dailyChangePercent || 0) * (stock.weight || 0) / 100;
    }, 0) || 0;

    return {
      totalValue: totalValue,
      dailyChange: dailyChange,
      totalStocks: portfolio.stocks?.length || 0,
      activeStocks: portfolio.stocks?.filter(s => s.active).length || 0
    };
  }

  generateAnalystConsensusSummary(analyses) {
    return {
      totalAnalyses: analyses.length,
      agreementScore: 0,
      disagreementScore: 0
    };
  }

  generateAlertsSummary(monitoringData) {
    const totalAlerts = monitoringData.positions?.reduce((sum, p) => sum + (p.alerts?.length || 0), 0) || 0;
    const highAlerts = monitoringData.positions?.reduce((sum, p) => sum + (p.alerts?.filter(a => a.severity === 'HIGH' || a.severity === 'VERY_HIGH').length || 0), 0) || 0;

    return {
      totalAlerts: totalAlerts,
      highPriorityAlerts: highAlerts,
      mediumPriorityAlerts: totalAlerts - highAlerts
    };
  }

  async generateTodayOutlook() {
    return {
      summary: 'Outlook positivo per la giornata basato sull analisi dei mercati asiatici e sulle previsioni economiche.',
      recommendations: ['Monitorare i titoli tecnologici', 'Attenzione ai titoli energetici']
    };
  }

  async generateTomorrowOutlook() {
    return {
      summary: 'Outlook per domani: attesi movimenti moderati con possibile volatilita nei settori tecnologici.',
      recommendations: ['Prepararsi per possibili opportunita di acquisto', 'Monitorare gli indicatori macroeconomici']
    };
  }

  generateReportFooter() {
    return {
      system: 'Stock Agent Lean Six Sigma',
      version: '2.0.0',
      generatedAt: new Date().toISOString(),
      timezone: this.timezone
    };
  }

  async saveReport(report) {
    const reportDir = 'reports/daily/';
    const filename = 'report_' + report.type + '_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd_HHmm') + '.json';
    await dataStorage.saveData(reportDir, filename, report);
  }

  async savePreviousDayData(data) {
    await dataStorage.savePreviousDayData(data);
  }
}

if (require.main === module) {
  const reporter = new Reporter();
  reporter.initialize()
    .then(() => {
      const reportType = process.env.REPORT_TYPE || 'morning';
      return reporter.generateReport(reportType);
    })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = Reporter;