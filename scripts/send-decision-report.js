const DecisionEngine = require('../agents/decide/decision-engine');
const telegram = require('../lib/common/telegram');
const logger = require('../lib/utils/logger');

async function sendDecisionReport() {
  try {
    logger.info('Starting decision report generation...');
    
    const decisionEngine = new DecisionEngine();
    await decisionEngine.initialize();
    
    const decisions = await decisionEngine.generateDecisions();
    
    const message = formatDecisionsForTelegram(decisions);
    await telegram.sendMessage(message);
    
    logger.info('Decision report sent successfully');
    return decisions;
  } catch (error) {
    logger.error('Error sending decision report:', error);
    throw error;
  }
}

function formatDecisionsForTelegram(decisions) {
  let message = '*Decisioni di Investimento - Stock Agent Lean Six Sigma*

';
  
  message += '*Data:* ' + new Date().toLocaleDateString('it-IT') + '

';
  
  if (decisions && decisions.length > 0) {
    decisions.forEach(function(decision, index) {
      message += '*Decisione #' + (index + 1) + ':*
';
      message += 'Ticker: ' + decision.ticker + '
';
      message += 'Azione: ' + decision.action + '
';
      message += 'Score: ' + decision.score + '
';
      message += 'Rischio: ' + decision.riskLevel + '
';
      message += 'Consenso: ' + decision.consensusScore + '%
';
      message += 'Motivazione: ' + decision.reason + '

';
    });
  } else {
    message += 'Nessuna decisione generata oggi.
';
  }
  
  message += '*Sistema:* Stock Agent Lean Six Sigma v2.0.0';
  
  return message;
}

if (require.main === module) {
  sendDecisionReport()
    .then(function() { process.exit(0); })
    .catch(function() { process.exit(1); });
}

module.exports = { sendDecisionReport: sendDecisionReport, formatDecisionsForTelegram: formatDecisionsForTelegram };