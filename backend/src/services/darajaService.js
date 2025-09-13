const axios = require('axios');
const moment = require('moment');
const logger = require('../utils/logger');

class DarajaService {
  constructor() {
    this.config = {
      consumerKey: process.env.DARAJA_CONSUMER_KEY,
      consumerSecret: process.env.DARAJA_CONSUMER_SECRET,
      businessShortCode: process.env.DARAJA_BUSINESS_SHORTCODE || '174379',
      passKey: process.env.DARAJA_PASSKEY,
      environment: process.env.DARAJA_ENVIRONMENT || 'sandbox',
      callbackUrl: process.env.DARAJA_CALLBACK_URL,
      baseURL: process.env.DARAJA_ENVIRONMENT === 'production' 
        ? 'https://api.safaricom.co.ke' 
        : 'https://sandbox.safaricom.co.ke'
    };
    
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Generate OAuth access token
   * @returns {Promise<string>}
   */
  async generateAccessToken() {
    try {
      // Check if current token is still valid
      if (this.accessToken && this.tokenExpiry && moment().isBefore(this.tokenExpiry)) {
        return this.accessToken;
      }

      const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');
      
      const response = await axios({
        method: 'GET',
        url: `${this.config.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.access_token) {
        this.accessToken = response.data.access_token;
        // Token expires in 1 hour, refresh 5 minutes early
        this.tokenExpiry = moment().add(55, 'minutes');
        
        logger.payment('Daraja access token generated successfully');
        return this.accessToken;
      } else {
        throw new Error('Failed to generate access token');
      }
    } catch (error) {
      logger.error('Daraja access token generation failed:', error);
      throw new Error(`Token generation failed: ${error.message}`);
    }
  }

  /**
   * Generate password for STK Push
   * @returns {string}
   */
  generatePassword() {
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(`${this.config.businessShortCode}${this.config.passKey}${timestamp}`).toString('base64');
    return { password, timestamp };
  }

  /**
   * Initiate STK Push payment
   * @param {Object} paymentData 
   * @returns {Promise<Object>}
   */
  async initiateSTKPush(paymentData) {
    try {
      const { phoneNumber, amount, accountReference, transactionDesc } = paymentData;
      
      // Validate phone number format
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        throw new Error('Invalid phone number format');
      }

      const accessToken = await this.generateAccessToken();
      const { password, timestamp } = this.generatePassword();

      const requestPayload = {
        BusinessShortCode: this.config.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount), // Ensure amount is integer
        PartyA: formattedPhone,
        PartyB: this.config.businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.config.callbackUrl,
        AccountReference: accountReference || 'WiFi Access',
        TransactionDesc: transactionDesc || 'WiFi Internet Access Payment'
      };

      logger.payment('Initiating STK Push:', { 
        phone: formattedPhone, 
        amount, 
        reference: accountReference 
      });

      const response = await axios({
        method: 'POST',
        url: `${this.config.baseURL}/mpesa/stkpush/v1/processrequest`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: requestPayload
      });

      if (response.data && response.data.ResponseCode === '0') {
        logger.payment('STK Push initiated successfully:', response.data);
        return {
          success: true,
          checkoutRequestID: response.data.CheckoutRequestID,
          merchantRequestID: response.data.MerchantRequestID,
          responseCode: response.data.ResponseCode,
          responseDescription: response.data.ResponseDescription,
          customerMessage: response.data.CustomerMessage
        };
      } else {
        logger.error('STK Push failed:', response.data);
        return {
          success: false,
          error: response.data.ResponseDescription || 'STK Push failed'
        };
      }
    } catch (error) {
      logger.error('STK Push error:', error);
      return {
        success: false,
        error: error.response?.data?.errorMessage || error.message
      };
    }
  }

  /**
   * Query STK Push transaction status
   * @param {string} checkoutRequestID 
   * @returns {Promise<Object>}
   */
  async querySTKPushStatus(checkoutRequestID) {
    try {
      const accessToken = await this.generateAccessToken();
      const { password, timestamp } = this.generatePassword();

      const requestPayload = {
        BusinessShortCode: this.config.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID
      };

      const response = await axios({
        method: 'POST',
        url: `${this.config.baseURL}/mpesa/stkpushquery/v1/query`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: requestPayload
      });

      logger.payment('STK Push status query:', response.data);
      
      return {
        success: true,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription,
        merchantRequestID: response.data.MerchantRequestID,
        checkoutRequestID: response.data.CheckoutRequestID,
        resultCode: response.data.ResultCode,
        resultDesc: response.data.ResultDesc
      };
    } catch (error) {
      logger.error('STK Push status query error:', error);
      return {
        success: false,
        error: error.response?.data?.errorMessage || error.message
      };
    }
  }

  /**
   * Process STK Push callback
   * @param {Object} callbackData 
   * @returns {Object}
   */
  processSTKCallback(callbackData) {
    try {
      const { Body } = callbackData;
      const { stkCallback } = Body;

      if (!stkCallback) {
        throw new Error('Invalid callback data structure');
      }

      const result = {
        merchantRequestID: stkCallback.MerchantRequestID,
        checkoutRequestID: stkCallback.CheckoutRequestID,
        resultCode: stkCallback.ResultCode,
        resultDesc: stkCallback.ResultDesc
      };

      // If payment was successful (ResultCode = 0)
      if (stkCallback.ResultCode === 0) {
        const callbackMetadata = stkCallback.CallbackMetadata;
        if (callbackMetadata && callbackMetadata.Item) {
          const metadata = {};
          callbackMetadata.Item.forEach(item => {
            switch (item.Name) {
              case 'Amount':
                metadata.amount = item.Value;
                break;
              case 'MpesaReceiptNumber':
                metadata.mpesaReceiptNumber = item.Value;
                break;
              case 'TransactionDate':
                metadata.transactionDate = item.Value;
                break;
              case 'PhoneNumber':
                metadata.phoneNumber = item.Value;
                break;
            }
          });
          result.metadata = metadata;
        }
        
        logger.payment('STK Push payment successful:', result);
        result.success = true;
      } else {
        logger.payment('STK Push payment failed:', result);
        result.success = false;
      }

      return result;
    } catch (error) {
      logger.error('STK callback processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Format phone number to required format (254XXXXXXXXX)
   * @param {string} phoneNumber 
   * @returns {string|null}
   */
  formatPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('254') && cleaned.length === 12) {
      return cleaned; // Already in correct format
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
      return '254' + cleaned.substring(1); // Remove 0 and add 254
    } else if (cleaned.startsWith('7') && cleaned.length === 9) {
      return '254' + cleaned; // Add 254 prefix
    } else if (cleaned.length === 9 && cleaned.match(/^[7-9]/)) {
      return '254' + cleaned; // Add 254 prefix
    }
    
    return null; // Invalid format
  }

  /**
   * Validate transaction amount
   * @param {number} amount 
   * @returns {boolean}
   */
  validateAmount(amount) {
    return amount >= 1 && amount <= 70000; // M-Pesa limits
  }

  /**
   * Register callback URLs (for production setup)
   * @returns {Promise<Object>}
   */
  async registerCallbackURLs() {
    try {
      const accessToken = await this.generateAccessToken();

      const requestPayload = {
        ShortCode: this.config.businessShortCode,
        ResponseType: 'Completed',
        ConfirmationURL: `${this.config.callbackUrl}/confirmation`,
        ValidationURL: `${this.config.callbackUrl}/validation`
      };

      const response = await axios({
        method: 'POST',
        url: `${this.config.baseURL}/mpesa/c2b/v1/registerurl`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: requestPayload
      });

      logger.payment('Callback URLs registered:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Callback URL registration error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const darajaService = new DarajaService();

module.exports = darajaService;