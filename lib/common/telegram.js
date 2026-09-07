const axios = require('axios');
const logger = require('../utils/logger');

class Telegram {
  static async sendMessage(message, parseMode = 'Markdown') {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      logger.warn('Telegram credentials not configured. Skipping notification.');
      return false;
    }

    const url = 'https://api.telegram.org/bot' + botToken + '/sendMessage';

    try {
      const response = await axios.post(url, {
        chat_id: chatId,
        text: message,
        parse_mode: parseMode,
        disable_web_page_preview: true
      });

      if (response.data && response.data.ok) {
        logger.info('Telegram message sent successfully');
        return true;
      }
      
      logger.error('Failed to send Telegram message', response.data);
      return false;
    } catch (error) {
      logger.error('Error sending Telegram message', error);
      return false;
    }
  }

  static async sendDocument(document, caption = '') {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      logger.warn('Telegram credentials not configured. Skipping document upload.');
      return false;
    }

    const url = 'https://api.telegram.org/bot' + botToken + '/sendDocument';

    try {
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('document', document);
      if (caption) {
        formData.append('caption', caption);
      }

      const response = await axios.post(url, formData, {
        headers: formData.getHeaders()
      });

      if (response.data && response.data.ok) {
        logger.info('Telegram document sent successfully');
        return true;
      }
      
      logger.error('Failed to send Telegram document', response.data);
      return false;
    } catch (error) {
      logger.error('Error sending Telegram document', error);
      return false;
    }
  }
}

module.exports = Telegram;