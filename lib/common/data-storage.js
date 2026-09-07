const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class DataStorage {
  static getDataDir(subdir = '') {
    const baseDir = path.join(__dirname, '../../data', subdir);
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    return baseDir;
  }

  static getFilePath(subdir, filename) {
    return path.join(this.getDataDir(subdir), filename);
  }

  static saveData(subdir, filename, data) {
    try {
      const filePath = this.getFilePath(subdir, filename);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      logger.info('Data saved to ' + filePath);
      return true;
    } catch (error) {
      logger.error('Error saving data', error);
      return false;
    }
  }

  static loadData(subdir, filename) {
    try {
      const filePath = this.getFilePath(subdir, filename);
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      logger.error('Error loading data', error);
      return null;
    }
  }

  static async getPreviousDayData() {
    return this.loadData('monitoring', 'previous_day.json');
  }

  static async savePreviousDayData(data) {
    return this.saveData('monitoring', 'previous_day.json', data);
  }

  static async getPortfolio() {
    return this.loadData('', 'portfolio_current.json');
  }

  static async savePortfolio(portfolio) {
    return this.saveData('', 'portfolio_current.json', portfolio);
  }

  static async getMonitoringData() {
    return this.loadData('monitoring', 'current.json');
  }

  static async saveMonitoringData(data) {
    return this.saveData('monitoring', 'current.json', data);
  }

  static async getRecentAnalyses() {
    return this.loadData('analysis', 'recent.json');
  }

  static async saveRecentAnalyses(analyses) {
    return this.saveData('analysis', 'recent.json', analyses);
  }

  static async getRecentDecisions() {
    return this.loadData('analysis/decide', 'recent.json');
  }

  static async saveRecentDecisions(decisions) {
    return this.saveData('analysis/decide', 'recent.json', decisions);
  }

  static async getWeeklyData() {
    return this.loadData('', 'weekly.json');
  }

  static async getMonthlyData() {
    return this.loadData('', 'monthly.json');
  }
}

module.exports = DataStorage;