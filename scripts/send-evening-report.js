const Reporter = require('../agents/control/reporter');
const telegram = require('../lib/common/telegram');
const logger = require('../lib/utils/logger');

async function sendEveningReport() {
  try {
    logger.info('Starting evening report generation...');
    
    const reporter = new Reporter();
    await reporter.initialize();
    
    const report = await reporter.generateReport('evening');
    
    const message = formatReportForTelegram(report);
    await telegram.sendMessage(message);
    
    logger.info('Evening report sent successfully');
    return report;
  } catch (error) {
    logger.error('Error sending evening report:', error);
    throw error;
  }
}

function formatReportForTelegram(report) {
  let message = '*Report Serale - Stock Agent Lean Six Sigma*

';
  
  message += '*Data:* ' + report.date + '
';
  message += '*Ora:* ' + new Date().toLocaleTimeString('it-IT') + '

';
  
  if (report.marketOverview) {
    message += '*Panoramica Mercato:*
';
    message += 'Sentiment: ' + report.marketOverview.sentiment + '
';
    message += 'Trend: ' + report.marketOverview.trend + '

';
  }
  
  if (report.todaySummary) {
    message += '*Riassunto Giorno:*
';
    message += 'Data: ' + report.todaySummary.date + '
';
    message += 'Posizioni totali: ' + report.todaySummary.totalPositions + '
';
    message += 'Alert totali: ' + report.todaySummary.totalAlerts + '
';
    message += 'Alert ad alta priorita: ' + report.todaySummary.highPriorityAlerts + '

';
    
    if (report.todaySummary.highlights && report.todaySummary.highlights.length > 0) {
      message += '*Evidenze:*
';
      report.todaySummary.highlights.forEach(function(h) {
        message += '- ' + h + '
';
      });
      message += '
';
    }
  }
  
  if (report.portfolioPerformance) {
    message += '*Performance Portafoglio:*
';
    message += 'Valore totale: $' + (report.portfolioPerformance.totalValue?.toFixed(2) || 'N/A') + '
';
    message += 'Variazione giornaliera: ' + (report.portfolioPerformance.dailyChange?.toFixed(2)) + '%

';
  }
  
  if (report.tomorrowOutlook) {
    message += '*Outlook Domani:*
';
    message += report.tomorrowOutlook.summary + '

';
  }
  
  message += '*Sistema:* Stock Agent Lean Six Sigma v2.0.0';
  
  return message;
}

if (require.main === module) {
  sendEveningReport()
    .then(function() { process.exit(0); })
    .catch(function() { process.exit(1); });
}

module.exports = { sendEveningReport: sendEveningReport, formatReportForTelegram: formatReportForTelegram };