const Reporter = require('../agents/control/reporter');
const telegram = require('../lib/common/telegram');
const logger = require('../lib/utils/logger');

async function sendMorningReport() {
  try {
    logger.info('Starting morning report generation...');
    
    const reporter = new Reporter();
    await reporter.initialize();
    
    const report = await reporter.generateReport('morning');
    
    const message = formatReportForTelegram(report);
    await telegram.sendMessage(message);
    
    logger.info('Morning report sent successfully');
    return report;
  } catch (error) {
    logger.error('Error sending morning report:', error);
    throw error;
  }
}

function formatReportForTelegram(report) {
  let message = '*Report Mattutino - Stock Agent Lean Six Sigma*

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
  
  if (report.previousDaySummary) {
    message += '*Riassunto Giorno Precedente:*
';
    message += 'Data: ' + report.previousDaySummary.date + '
';
    message += 'Posizioni totali: ' + report.previousDaySummary.totalPositions + '
';
    message += 'Alert totali: ' + report.previousDaySummary.totalAlerts + '
';
    message += 'Alert ad alta priorita: ' + report.previousDaySummary.highPriorityAlerts + '

';
    
    if (report.previousDaySummary.highlights && report.previousDaySummary.highlights.length > 0) {
      message += '*Evidenze:*
';
      report.previousDaySummary.highlights.forEach(function(h) {
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
  
  if (report.analystConsensus) {
    message += '*Consenso Analisti:*
';
    message += 'Analisi totali: ' + (report.analystConsensus.totalAnalyses || 0) + '
';
    message += 'Accordo: ' + (report.analystConsensus.agreementScore?.toFixed(2) || 0) + '%
';
    message += 'Disaccordo: ' + (report.analystConsensus.disagreementScore?.toFixed(2) || 0) + '%

';
  }
  
  if (report.todayOutlook) {
    message += '*Outlook Oggi:*
';
    message += report.todayOutlook.summary + '

';
  }
  
  message += '*Sistema:* Stock Agent Lean Six Sigma v2.0.0';
  
  return message;
}

if (require.main === module) {
  sendMorningReport()
    .then(function() { process.exit(0); })
    .catch(function() { process.exit(1); });
}

module.exports = { sendMorningReport: sendMorningReport, formatReportForTelegram: formatReportForTelegram };