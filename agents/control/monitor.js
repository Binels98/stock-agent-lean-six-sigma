const logger = require('../../lib/utils/logger');
const configLoader = require('../../lib/common/config-loader');
const dataStorage = require('../../lib/common/data-storage');
const telegram = require('../../lib/common/telegram');
const { DateTime } = require('luxon');

class Monitor {
  constructor() {
    this.name = 'Monitor Agent';
    this.description = 'Agente di monitoraggio in tempo reale del mercato';
    this.settings = configLoader.getSettings();
    this.thresholds = configLoader.getThresholds();
    this.timezone = configLoader.getTimezone();
    this.portfolioConfig = configLoader.getPortfolioConfig();
  }

  async initialize() {
    logger.info(this.name + ': Initializing...');
    logger.info(this.name + ': Initialized successfully');
  }

  isMarketOpen() {
    const now = DateTime.now().setZone(this.timezone);
    const hour = now.hour;
    const minute = now.minute;
    
    const startHour = parseInt(this.settings.system?.monitoring?.start_time?.split(':')[0] || 9);
    const endHour = parseInt(this.settings.system?.monitoring?.end_time?.split(':')[0] || 22);
    
    return hour >= startHour && hour < endHour;
  }

  async runMonitoringCycle() {
    if (!this.isMarketOpen()) {
      logger.info(this.name + ': Market is closed. Skipping monitoring.');
      return { status: 'skipped', reason: 'Market closed' };
    }

    logger.info(this.name + ': Starting monitoring cycle...');

    const monitoringData = {
      timestamp: new Date().toISOString(),
      date: DateTime.now().setZone(this.timezone).toFormat('yyyy-MM-dd'),
      time: DateTime.now().setZone(this.timezone).toFormat('HH:mm'),
      positions: []
    };

    // Simulate monitoring for portfolio stocks
    const stocks = this.portfolioConfig.portfolio?.stocks || [];
    
    for (const stock of stocks) {
      const monitoredStock = await this.monitorStock(stock);
      monitoringData.positions.push(monitoredStock);
    }

    // Save monitoring data
    await dataStorage.saveMonitoringData(monitoringData);

    // Check for alerts
    const alerts = this.checkForAlerts(monitoringData);
    
    if (alerts.length > 0) {
      await this.sendAlerts(alerts);
    }

    logger.info(this.name + ': Monitoring cycle completed');
    return monitoringData;
  }

  async monitorStock(stock) {
    // Simulate stock data (in production, this would fetch real data)
    const priceChange = (Math.random() * 10 - 5).toFixed(2); // -5% to +5%
    const volumeChange = (Math.random() * 2).toFixed(2); // 0 to 2x
    const volatility = (Math.random() * 15).toFixed(2); // 0-15%

    return {
      ticker: stock.ticker,
      name: stock.name,
      exchange: stock.exchange,
      sector: stock.sector,
      current_price: stock.purchase_price * (1 + priceChange / 100),
      daily_change_percent: parseFloat(priceChange),
      volume_change: parseFloat(volumeChange),
      volatility: parseFloat(volatility),
      last_updated: new Date().toISOString(),
      alerts: []
    };
  }

  checkForAlerts(monitoringData) {
    const alerts = [];
    const thresholds = this.thresholds;

    for (const position of monitoringData.positions) {
      const stockThresholds = thresholds.technical_thresholds;

      // Check RSI thresholds
      if (position.volatility > stockThresholds.rsi.overbought) {
        alerts.push({
          ticker: position.ticker,
          type: 'OVERBOUGHT',
          severity: 'HIGH',
          message: position.ticker + ' is overbought (volatility: ' + position.volatility + '%)',
          timestamp: new Date().toISOString()
        });
      }

      if (position.volatility < stockThresholds.rsi.oversold) {
        alerts.push({
          ticker: position.ticker,
          type: 'OVERSOLD',
          severity: 'HIGH',
          message: position.ticker + ' is oversold (volatility: ' + position.volatility + '%)',
          timestamp: new Date().toISOString()
        });
      }

      // Check price variation
      if (position.daily_change_percent > stockThresholds.price_variation.daily_positive) {
        alerts.push({
          ticker: position.ticker,
          type: 'PRICE_SPIKE_UP',
          severity: 'MEDIUM',
          message: position.ticker + ' increased by ' + position.daily_change_percent + '%',
          timestamp: new Date().toISOString()
        });
      }

      if (position.daily_change_percent < stockThresholds.price_variation.daily_negative) {
        alerts.push({
          ticker: position.ticker,
          type: 'PRICE_DROP',
          severity: 'HIGH',
          message: position.ticker + ' dropped by ' + Math.abs(position.daily_change_percent) + '%',
          timestamp: new Date().toISOString()
        });
      }

      // Check volume spike
      if (position.volume_change > thresholds.monitoring_thresholds.volume_spike) {
        alerts.push({
          ticker: position.ticker,
          type: 'VOLUME_SPIKE',
          severity: 'MEDIUM',
          message: position.ticker + ' volume increased by ' + position.volume_change + 'x',
          timestamp: new Date().toISOString()
        });
      }
    }

    return alerts;
  }

  async sendAlerts(alerts) {
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
      logger.warn(this.name + ': Telegram not configured. Cannot send alerts.');
      return;
    }

    const highAlerts = alerts.filter(a => a.severity === 'HIGH' || a.severity === 'VERY_HIGH');
    const mediumAlerts = alerts.filter(a => a.severity === 'MEDIUM');

    if (highAlerts.length > 0) {
      let message = '*ALERT CRITICI*

';
      highAlerts.forEach(alert => {
        message += '[' + alert.severity + '] ' + alert.message + '
';
      });
      await telegram.sendMessage(message);
    }

    if (mediumAlerts.length > 0) {
      let message = '*Alert*

';
      mediumAlerts.forEach(alert => {
        message += '[' + alert.severity + '] ' + alert.message + '
';
      });
      await telegram.sendMessage(message);
    }
  }
}

// Run if executed directly
if (require.main === module) {
  const monitor = new Monitor();
  monitor.initialize()
    .then(() => monitor.runMonitoringCycle())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = Monitor;