const logger = require('../../lib/utils/logger');
const configLoader = require('../../lib/common/config-loader');
const dataStorage = require('../../lib/common/data-storage');
const { DateTime } = require('luxon');

class Calendar {
  constructor() {
    this.name = 'Calendar Agent';
    this.description = 'Agente di gestione scheduling e trigger';
    this.settings = configLoader.getSettings();
    this.timezone = configLoader.getTimezone();
  }

  async initialize() {
    logger.info(this.name + ': Initializing...');
    logger.info(this.name + ': Initialized successfully');
  }

  async run() {
    logger.info(this.name + ': Running calendar scheduling...');

    const schedule = this.generateSchedule();
    await this.saveSchedule(schedule);

    logger.info(this.name + ': Calendar scheduling completed');
    return schedule;
  }

  generateSchedule() {
    const now = DateTime.now().setZone(this.timezone);
    const schedule = {
      timestamp: now.toISO(),
      date: now.toFormat('yyyy-MM-dd'),
      timezone: this.timezone,
      phases: [
        {
          name: 'DEFINE',
          start_time: '07:00',
          agent: 'definer',
          status: 'scheduled'
        },
        {
          name: 'MEASURE',
          start_time: '07:30',
          agent: 'scanner, data_collector, quality',
          status: 'scheduled'
        },
        {
          name: 'ANALYZE',
          start_time: '08:15',
          agent: 'analyzer, news, risk',
          status: 'scheduled'
        },
        {
          name: 'IMPROVE',
          start_time: '09:00',
          agent: 'improvement, optimization',
          status: 'scheduled'
        },
        {
          name: 'COLLABORATE',
          start_time: '09:30',
          agent: 'blackrock, ark, momentum, contrarian, value, growth',
          status: 'scheduled'
        },
        {
          name: 'DECIDE',
          start_time: '10:00',
          agent: 'portfolio_manager, decision_engine, consensus_builder',
          status: 'scheduled'
        }
      ],
      monitoring: {
        start_time: '09:00',
        end_time: '22:00',
        interval: '5 minutes',
        status: 'scheduled'
      },
      reporting: {
        morning: '08:00',
        evening: '18:00',
        status: 'scheduled'
      }
    };

    return schedule;
  }

  async saveSchedule(schedule) {
    await dataStorage.saveData('monitoring', 'calendar.json', schedule);
  }
}

if (require.main === module) {
  const calendar = new Calendar();
  calendar.initialize()
    .then(() => calendar.run())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = Calendar;