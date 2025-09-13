const axios = require('axios');
const logger = require('../utils/logger');

class KcbBuniService {
  constructor() {
    this.config = {
      clientId: process.env.KCB_BUNI_CLIENT_ID,
      clientSecret: process.env.KCB_BUNI_CLIENT_SECRET,
      subscriptionKey: process.env.KCB_BUNI_SUBSCRIPTION_KEY,
      callbackUrl: process.env.KCB_BUNI_CALLBACK_URL,
      environment: process.env.KCB_BUNI_ENVIRONMENT || 'sandbox',
      baseURL: process.env.KCB_BUNI_ENVIRONMENT === 'production'
        ? 'https://api.buni.kcbgroup.com'
        : 'https://api-buni.sandbox.co.ke'
    };
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Generate OAuth token using client credentials
   */
  async generateAccessToken() {
    try {
      const tokenUrl = `${this.config.baseURL}/token/v1/oauth2/token`;
      const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');

      const response = await axios({
        method: 'POST',
        url: tokenUrl,
        headers: {
          'Authorization': `Basic ${auth}`,
          'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: 'grant_type=client_credentials'
      });

      if (response.data && response.data.access_token) {
        this.accessToken = response.data.access_token;
        // Default expiry ~1 hour; refresh ~5 minutes early
        const expiresIn = Math.max((response.data.expires_in || 3600) - 300, 60);
        this.tokenExpiry = Date.now() + expiresIn * 1000;
        logger.payment('KCB Buni access token generated');
        return this.accessToken;
      }
      throw new Error('Failed to generate KCB Buni token');
    } catch (error) {
      logger.error('KCB Buni token error:', error);
      throw error;
    }
  }

  tokenValid() {
    return this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry;
  }

  async getToken() {
    if (this.tokenValid()) return this.accessToken;
    return this.generateAccessToken();
  }

  /**
   * Initiate mobile payment (simulated STK-like push depending on product)
   */
  async initiatePayment({ phoneNumber, amount, reference, narration }) {
    try {
      const token = await this.getToken();

      const payload = {
        amount: Math.round(amount),
        msisdn: phoneNumber,
        reference: reference || 'WiFi Access',
        narration: narration || 'WiFi Internet Access Payment',
        callbackUrl: this.config.callbackUrl
      };

      logger.payment('KCB Buni payment initiate', payload);

      const response = await axios({
        method: 'POST',
        url: `${this.config.baseURL}/payment/v1/requestPayment`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
          'Content-Type': 'application/json'
        },
        data: payload
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logger.error('KCB Buni initiate payment error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * Query transaction status
   */
  async queryStatus({ transactionId }) {
    try {
      const token = await this.getToken();
      const response = await axios({
        method: 'GET',
        url: `${this.config.baseURL}/payment/v1/transactions/${transactionId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Ocp-Apim-Subscription-Key': this.config.subscriptionKey
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      logger.error('KCB Buni status query error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * Process callback payload
   */
  processCallback(callbackData) {
    try {
      logger.payment('KCB Buni callback received', callbackData);
      // Normalize to a generic structure
      return {
        success: callbackData?.status === 'SUCCESS',
        reference: callbackData?.reference,
        transactionId: callbackData?.transactionId,
        amount: callbackData?.amount,
        msisdn: callbackData?.msisdn,
        raw: callbackData
      };
    } catch (error) {
      logger.error('KCB Buni callback processing error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new KcbBuniService();
