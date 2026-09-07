const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class ConfigLoader {
  static getConfigFilePath(filename) {
    return path.join(__dirname, '../../config', filename);
  }

  static getSettings() {
    try {
      const settingsPath = this.getConfigFilePath('settings.json');
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      return settings;
    } catch (error) {
      logger.error('Error loading settings', error);
      return {};
    }
  }

  static getPortfolioConfig() {
    try {
      const portfolioPath = this.getConfigFilePath('portfolio.json');
      const portfolio = JSON.parse(fs.readFileSync(portfolioPath, 'utf8'));
      return portfolio;
    } catch (error) {
      logger.error('Error loading portfolio', error);
      return {};
    }
  }

  static getThresholds() {
    try {
      const thresholdsPath = this.getConfigFilePath('thresholds.json');
      const thresholds = JSON.parse(fs.readFileSync(thresholdsPath, 'utf8'));
      return thresholds;
    } catch (error) {
      logger.error('Error loading thresholds', error);
      return {};
    }
  }

  static getWeights() {
    try {
      const weightsPath = this.getConfigFilePath('weights.json');
      const weights = JSON.parse(fs.readFileSync(weightsPath, 'utf8'));
      return weights;
    } catch (error) {
      logger.error('Error loading weights', error);
      return {};
    }
  }

  static getTimezone() {
    const settings = this.getSettings();
    return settings.system?.timezone || 'Europe/Rome';
  }
}

module.exports = ConfigLoader;