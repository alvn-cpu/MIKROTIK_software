const { RouterOSAPI } = require('node-routeros');
const logger = require('../utils/logger');

class MikrotikService {
  constructor() {}

  async connect({ host, username, password, port = 8728 }) {
    const api = new RouterOSAPI({
      host: host,
      user: username,
      password: password,
      port: port
    });
    await api.connect();
    return api;
  }

  async listHotspotActive({ host, username, password, port }) {
    const api = await this.connect({ host, username, password, port });
    try {
      const res = await api.write('/ip/hotspot/active/print');
      return res;
    } finally { await api.close(); }
  }

  async disconnectHotspotUser({ host, username, password, port, user }) {
    const api = await this.connect({ host, username, password, port });
    try {
      const actives = await api.write('/ip/hotspot/active/print');
      const entry = actives.find((a) => a.user === user || a['user'] === user);
      if (entry && entry['.id']) {
        await api.write('/ip/hotspot/active/remove', { ".id": entry['.id'] });
        return { success: true };
      }
      return { success: false, error: 'user not found active' };
    } finally { await api.close(); }
  }

  async listQueues({ host, username, password, port }) {
    const api = await this.connect({ host, username, password, port });
    try {
      return await api.write('/queue/simple/print');
    } finally { await api.close(); }
  }

  /**
   * Send popup notification to a specific user
   * @param {Object} config - Router connection config
   * @param {string} username - Target username
   * @param {string} message - Message to display
   * @returns {Promise<Object>}
   */
  async sendUserNotification({ host, username, password, port, user, message }) {
    const api = await this.connect({ host, username, password, port });
    try {
      // Send popup message via hotspot
      const result = await api.write('/tool/user-manager/user/send-message', {
        'user': user,
        'message': message
      });
      
      logger.info(`Notification sent to user ${user}: ${message}`);
      return { success: true, result };
    } catch (error) {
      logger.error('Failed to send user notification:', error);
      return { success: false, error: error.message };
    } finally { 
      await api.close(); 
    }
  }

  /**
   * Send popup notification to active hotspot user
   * @param {Object} config - Router connection config
   * @param {string} user - Target username
   * @param {string} message - Message to display
   * @returns {Promise<Object>}
   */
  async sendHotspotNotification({ host, username, password, port, user, message }) {
    const api = await this.connect({ host, username, password, port });
    try {
      // Find active session for user
      const actives = await api.write('/ip/hotspot/active/print');
      const session = actives.find(s => s.user === user);
      
      if (!session) {
        return { success: false, error: 'User not currently active' };
      }

      // Send message to active session
      await api.write('/ip/hotspot/active/send-message', {
        'numbers': session['.id'],
        'message': message
      });
      
      logger.info(`Hotspot notification sent to ${user}: ${message}`);
      return { success: true };
    } catch (error) {
      logger.error('Failed to send hotspot notification:', error);
      return { success: false, error: error.message };
    } finally { 
      await api.close(); 
    }
  }

  /**
   * Get user's current session information including remaining time
   * @param {Object} config - Router connection config
   * @param {string} user - Username to check
   * @returns {Promise<Object>}
   */
  async getUserSessionInfo({ host, username, password, port, user }) {
    const api = await this.connect({ host, username, password, port });
    try {
      // Get active hotspot sessions
      const actives = await api.write('/ip/hotspot/active/print');
      const session = actives.find(s => s.user === user);
      
      if (!session) {
        return { success: false, error: 'User not currently active' };
      }

      // Get user profile information for time limits
      const users = await api.write('/ip/hotspot/user/print', {
        '?name': user
      });
      const userProfile = users[0];

      return {
        success: true,
        session: {
          id: session['.id'],
          user: session.user,
          address: session.address,
          uptime: session.uptime,
          bytesIn: session['bytes-in'],
          bytesOut: session['bytes-out'],
          sessionTimeLeft: session['session-time-left'],
          profile: userProfile?.profile
        }
      };
    } catch (error) {
      logger.error('Failed to get user session info:', error);
      return { success: false, error: error.message };
    } finally { 
      await api.close(); 
    }
  }

  /**
   * Broadcast message to all active hotspot users
   * @param {Object} config - Router connection config
   * @param {string} message - Message to broadcast
   * @returns {Promise<Object>}
   */
  async broadcastNotification({ host, username, password, port, message }) {
    const api = await this.connect({ host, username, password, port });
    try {
      const actives = await api.write('/ip/hotspot/active/print');
      
      if (actives.length === 0) {
        return { success: true, message: 'No active users to notify' };
      }

      // Send to all active sessions
      for (const session of actives) {
        try {
          await api.write('/ip/hotspot/active/send-message', {
            'numbers': session['.id'],
            'message': message
          });
        } catch (error) {
          logger.error(`Failed to send message to session ${session['.id']}:`, error);
        }
      }
      
      logger.info(`Broadcast notification sent to ${actives.length} active users`);
      return { success: true, notifiedUsers: actives.length };
    } catch (error) {
      logger.error('Failed to broadcast notification:', error);
      return { success: false, error: error.message };
    } finally { 
      await api.close(); 
    }
  }
}

module.exports = new MikrotikService();
