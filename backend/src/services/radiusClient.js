const radius = require('node-radius-client');
const logger = require('../utils/logger');

class RadiusClient {
  constructor() {
    this.config = {
      host: process.env.RADIUS_SERVER_HOST || 'localhost',
      port: parseInt(process.env.RADIUS_SERVER_PORT) || 1812,
      accountingPort: parseInt(process.env.RADIUS_ACCOUNTING_PORT) || 1813,
      secret: process.env.RADIUS_SECRET || 'testing123',
      timeout: 5000,
      retries: 3
    };
    
    this.client = new radius.RadiusClient(this.config);
    logger.radius('RADIUS client initialized', this.config);
  }

  /**
   * Authenticate user credentials
   * @param {string} username 
   * @param {string} password 
   * @param {string} nasIpAddress 
   * @returns {Promise<Object>}
   */
  async authenticate(username, password, nasIpAddress = '127.0.0.1') {
    try {
      logger.radius(`Authenticating user: ${username}`);
      
      const packet = {
        code: 'Access-Request',
        secret: this.config.secret,
        attributes: [
          ['User-Name', username],
          ['User-Password', password],
          ['NAS-IP-Address', nasIpAddress],
          ['Service-Type', 'Framed-User'],
          ['Framed-Protocol', 'PPP']
        ]
      };

      const response = await this.client.accessRequest(packet);
      
      if (response.code === 'Access-Accept') {
        logger.radius(`Authentication successful for user: ${username}`);
        return {
          success: true,
          code: response.code,
          attributes: this.parseAttributes(response.attributes)
        };
      } else {
        logger.radius(`Authentication failed for user: ${username}, code: ${response.code}`);
        return {
          success: false,
          code: response.code,
          message: 'Authentication failed'
        };
      }
    } catch (error) {
      logger.error('RADIUS authentication error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send accounting start packet
   * @param {Object} sessionData 
   * @returns {Promise<Object>}
   */
  async accountingStart(sessionData) {
    try {
      const { username, sessionId, nasIpAddress, framedIpAddress } = sessionData;
      
      logger.radius(`Sending accounting start for session: ${sessionId}`);
      
      const packet = {
        code: 'Accounting-Request',
        secret: this.config.secret,
        attributes: [
          ['User-Name', username],
          ['Acct-Status-Type', 'Start'],
          ['Acct-Session-Id', sessionId],
          ['NAS-IP-Address', nasIpAddress || '127.0.0.1'],
          ['Service-Type', 'Framed-User'],
          ['Framed-Protocol', 'PPP']
        ]
      };

      if (framedIpAddress) {
        packet.attributes.push(['Framed-IP-Address', framedIpAddress]);
      }

      const response = await this.client.accountingRequest(packet);
      
      return {
        success: response.code === 'Accounting-Response',
        code: response.code
      };
    } catch (error) {
      logger.error('RADIUS accounting start error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send accounting stop packet
   * @param {Object} sessionData 
   * @returns {Promise<Object>}
   */
  async accountingStop(sessionData) {
    try {
      const { 
        username, 
        sessionId, 
        nasIpAddress, 
        framedIpAddress,
        sessionTime,
        inputOctets,
        outputOctets,
        terminateCause
      } = sessionData;
      
      logger.radius(`Sending accounting stop for session: ${sessionId}`);
      
      const packet = {
        code: 'Accounting-Request',
        secret: this.config.secret,
        attributes: [
          ['User-Name', username],
          ['Acct-Status-Type', 'Stop'],
          ['Acct-Session-Id', sessionId],
          ['NAS-IP-Address', nasIpAddress || '127.0.0.1'],
          ['Service-Type', 'Framed-User'],
          ['Framed-Protocol', 'PPP'],
          ['Acct-Session-Time', sessionTime || 0],
          ['Acct-Input-Octets', inputOctets || 0],
          ['Acct-Output-Octets', outputOctets || 0],
          ['Acct-Terminate-Cause', terminateCause || 'User-Request']
        ]
      };

      if (framedIpAddress) {
        packet.attributes.push(['Framed-IP-Address', framedIpAddress]);
      }

      const response = await this.client.accountingRequest(packet);
      
      return {
        success: response.code === 'Accounting-Response',
        code: response.code
      };
    } catch (error) {
      logger.error('RADIUS accounting stop error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send accounting update packet
   * @param {Object} sessionData 
   * @returns {Promise<Object>}
   */
  async accountingUpdate(sessionData) {
    try {
      const { 
        username, 
        sessionId, 
        nasIpAddress, 
        framedIpAddress,
        sessionTime,
        inputOctets,
        outputOctets
      } = sessionData;
      
      logger.radius(`Sending accounting update for session: ${sessionId}`);
      
      const packet = {
        code: 'Accounting-Request',
        secret: this.config.secret,
        attributes: [
          ['User-Name', username],
          ['Acct-Status-Type', 'Interim-Update'],
          ['Acct-Session-Id', sessionId],
          ['NAS-IP-Address', nasIpAddress || '127.0.0.1'],
          ['Service-Type', 'Framed-User'],
          ['Framed-Protocol', 'PPP'],
          ['Acct-Session-Time', sessionTime || 0],
          ['Acct-Input-Octets', inputOctets || 0],
          ['Acct-Output-Octets', outputOctets || 0]
        ]
      };

      if (framedIpAddress) {
        packet.attributes.push(['Framed-IP-Address', framedIpAddress]);
      }

      const response = await this.client.accountingRequest(packet);
      
      return {
        success: response.code === 'Accounting-Response',
        code: response.code
      };
    } catch (error) {
      logger.error('RADIUS accounting update error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Parse RADIUS attributes into key-value pairs
   * @param {Array} attributes 
   * @returns {Object}
   */
  parseAttributes(attributes) {
    const parsed = {};
    if (attributes) {
      attributes.forEach(attr => {
        if (Array.isArray(attr) && attr.length >= 2) {
          parsed[attr[0]] = attr[1];
        }
      });
    }
    return parsed;
  }

  /**
   * Test RADIUS server connectivity
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      // Send a test authentication request
      const result = await this.authenticate('test-user', 'test-password');
      return true; // If we get any response, connection is working
    } catch (error) {
      logger.error('RADIUS connection test failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const radiusClient = new RadiusClient();

module.exports = radiusClient;