const logger = require('../../lib/utils/logger');
const configLoader = require('../../lib/common/config-loader');
const dataStorage = require('../../lib/common/data-storage');
const { DateTime } = require('luxon');

class Definer {
  constructor() {
    this.name = 'Definer Agent';
    this.description = 'Agente di definizione portafoglio e obiettivi giornata';
    this.settings = configLoader.getSettings();
    this.portfolioConfig = configLoader.getPortfolioConfig();
    this.timezone = configLoader.getTimezone();
  }

  async initialize() {
    logger.info(this.name + ': Initializing...');
    logger.info(this.name + ': Initialized successfully');
  }

  async run() {
    logger.info(this.name + ': Running portfolio definition...');

    const dailyObjectives = this.generateDailyObjectives();
    await this.saveDailyObjectives(dailyObjectives);

    logger.info(this.name + ': Portfolio definition completed');
    return dailyObjectives;
  }

  generateDailyObjectives() {
    const now = DateTime.now().setZone(this.timezone);
    const portfolio = this.portfolioConfig.portfolio;

    const objectives = {
      timestamp: now.toISO(),
      date: now.toFormat('yyyy-MM-dd'),
      portfolio: {
        name: portfolio.name,
        base_currency: portfolio.base_currency,
        target_allocation: portfolio.target_allocation,
        stocks: portfolio.stocks?.filter(s => s.active) || []
      },
      objectives: [
        'Analizzare performance portafoglio',
        'Identificare opportunita di acquisto',
        'Valutare rischi e allarmi',
        'Generare report mattutino alle 08:00',
        'Monitorare mercati in tempo reale'
      ],
      market_focus: [
        'Mercato europeo (09:00-17:30)',
        'Mercato americano (15:30-22:00)'
      ]
    };

    return objectives;
  }

  async saveDailyObjectives(objectives) {
    await dataStorage.saveData('define', 'daily_objectives_' + DateTime.now().setZone(this.timezone).toFormat('yyyyMMdd') + '.json', objectives);
  }
}

if (require.main === module) {
  const definer = new Definer();
  definer.initialize()
    .then(() => definer.run())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = Definer;